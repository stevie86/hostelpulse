"use server";

import { auth } from "@/auth";
import prisma from "@/lib/db";
import { endOfDay, startOfDay } from "date-fns";

export async function getDashboardStats(propertyId: string) {
  const session = await auth();
  if (!session?.user?.email) return null;

  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);

  // Total Rooms
  const totalRooms = await prisma.room.count({
    where: { propertyId },
  });

  // Total Beds (sum of beds in all rooms)
  const totalBedsResult = await prisma.room.aggregate({
    _sum: {
      beds: true,
    },
    where: { propertyId },
  });
  const totalBeds = totalBedsResult._sum.beds || 0;

  // Occupied Beds Today (based on active bookings today)
  const occupiedBedsResult = await prisma.bookingBed.count({
    where: {
      room: { propertyId },
      booking: {
        status: { in: ["confirmed", "checked_in"] },
        checkIn: { lte: endOfToday }, // Check-in is today or before
        checkOut: { gte: startOfToday }, // Check-out is today or after
      },
    },
  });
  const occupiedBeds = occupiedBedsResult || 0;

  // Arrivals Today
  const arrivalsToday = await prisma.booking.count({
    where: {
      propertyId,
      checkIn: {
        gte: startOfToday,
        lte: endOfToday,
      },
      status: { notIn: ["cancelled", "checked_out", "no_show"] },
    },
  });

  // Departures Today
  const departuresToday = await prisma.booking.count({
    where: {
      propertyId,
      checkOut: {
        gte: startOfToday,
        lte: endOfToday,
      },
      status: { in: ["confirmed", "checked_in"] },
    },
  });

  // Current Occupancy %
  const currentOccupancyPercentage =
    totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;

  return {
    totalRooms,
    totalBeds,
    occupiedBeds,
    availableBeds: totalBeds - occupiedBeds,
    arrivalsToday,
    departuresToday,
    currentOccupancyPercentage,
  };
}

export async function getDailyActivity(propertyId: string) {
  const session = await auth();
  if (!session?.user?.email) return { arrivals: [], departures: [] };

  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);

  const arrivals = await prisma.booking.findMany({
    where: {
      propertyId,
      checkIn: {
        gte: startOfToday,
        lte: endOfToday,
      },
      status: { notIn: ["cancelled", "checked_out", "no_show"] },
    },
    include: {
      guest: true,
      beds: { include: { room: true } },
    },
    orderBy: { checkIn: "asc" },
  });

  const departures = await prisma.booking.findMany({
    where: {
      propertyId,
      checkOut: {
        gte: startOfToday,
        lte: endOfToday,
      },
      status: { in: ["confirmed", "checked_in"] },
    },
    include: {
      guest: true,
      beds: { include: { room: true } },
    },
    orderBy: { checkOut: "asc" },
  });

  return {
    arrivals,
    departures,
  };
}
