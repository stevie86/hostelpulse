"use server";

import { auth } from "@/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { verifyPropertyAccess } from "@/lib/auth-utils";

// --- Types & Schemas ---

export type ActionState = {
  errors?: {
    roomId?: string[];
    guestId?: string[];
    checkIn?: string[];
    checkOut?: string[];
    _form?: string[];
  };
  message?: string | null;
};

// --- Helpers ---

/**
 * Checks if a room has available beds for the given date range.
 * Returns true if available, false otherwise.
 * Also returns the count of available beds.
 */
export async function checkAvailability(
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  excludeBookingId?: string
) {
  // 1. Get Room Capacity
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { beds: true },
  });

  if (!room) throw new Error("Room not found");

  // 2. Count overlapping BookingBeds
  // We need to count how many distinct beds are occupied in this room during the window.
  // Since we don't have explicit "Bed" models, we count BookingBed records.
  const occupiedCount = await prisma.bookingBed.count({
    where: {
      roomId: roomId,
      booking: {
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        status: { in: ["confirmed", "checked_in"] }, // Only count active bookings
        // Overlap Logic: (StartA < EndB) and (EndA > StartB)
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
    },
  });

  const availableBeds = room.beds - occupiedCount;
  return {
    isAvailable: availableBeds > 0,
    availableBeds,
    totalBeds: room.beds,
  };
}

// --- Actions ---

export async function createBooking(
  propertyId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await verifyPropertyAccess(propertyId);
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Unauthorized" };
  }

  // Parse Inputs
  const rawData = {
    roomId: formData.get("roomId"),
    guestId: formData.get("guestId"),
    checkIn: formData.get("checkIn"),
    checkOut: formData.get("checkOut"),
  };

  const schema = z.object({
    roomId: z.string().min(1, "Room is required"),
    guestId: z.string().min(1, "Guest is required"),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
  });

  const validated = schema.safeParse(rawData);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "Validation Failed",
    };
  }

  const { roomId, guestId, checkIn, checkOut } = validated.data;

  if (checkOut <= checkIn) {
    return {
      errors: { checkOut: ["Check-out must be after check-in"] },
      message: "Invalid dates",
    };
  }

  try {
    // TRANSACTION: Check Availability -> Create Booking -> Create BookingBed
    await prisma.$transaction(async (tx) => {
      // 1. Lock Room (Optional, but good for high concurrency. Prisma doesn't strictly lock SELECTs easily without raw SQL, 
      // but wrapping in transaction ensures atomicity if isolation level is Serializable. 
      // For MVP, we rely on the check occurring inside the tx).

      // Re-implement availability check inside TX to ensure consistency
      const room = await tx.room.findUnique({ where: { id: roomId } });
      if (!room) throw new Error("Room not found");

      const occupiedCount = await tx.bookingBed.count({
        where: {
          roomId: roomId,
          booking: {
            status: { in: ["confirmed", "checked_in"] },
            checkIn: { lt: checkOut },
            checkOut: { gt: checkIn },
          },
        },
      });

      if (occupiedCount >= room.beds) {
        throw new Error("Room is fully booked for these dates.");
      }

      // 2. Calculate Price
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalAmount = room.pricePerNight * nights;

      // 3. Create Booking
      const booking = await tx.booking.create({
        data: {
          propertyId,
          guestId,
          // roomId removed as it's not in Booking model
          checkIn,
          checkOut,
          status: "confirmed",
          totalAmount,
          amountPaid: 0,
          paymentStatus: "pending",
        },
      });

      // 4. Create BookingBed
      await tx.bookingBed.create({
        data: {
          bookingId: booking.id,
          roomId: roomId,
          bedLabel: "Auto-Assigned", // Future: Logic to pick specific bed 1, 2, 3
          pricePerNight: room.pricePerNight,
        },
      });
    });
  } catch (error: unknown) { // Use 'unknown' instead of 'any'
    if (error instanceof Error) {
      return {
        message: error.message,
      };
    }
    return {
      message: "An unknown error occurred.",
    };
  }

  revalidatePath(`/properties/${propertyId}/bookings`);
  redirect(`/properties/${propertyId}/bookings`);
}

export async function cancelBooking(bookingId: string, propertyId: string) {
  await verifyPropertyAccess(propertyId);

  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "cancelled" },
    });
    revalidatePath(`/properties/${propertyId}/bookings`);
  } catch (error) {
    throw new Error("Failed to cancel booking");
  }
}

export async function getBookings(propertyId: string) {
  try {
    await verifyPropertyAccess(propertyId);
  } catch (error) {
    return [];
  }

  return prisma.booking.findMany({
    where: { propertyId },
    include: {
      guest: true,
      beds: {
        include: { room: true },
      },
    },
    orderBy: { checkIn: "desc" },
  });
}

export async function checkInBooking(propertyId: string, bookingId: string) {
  await verifyPropertyAccess(propertyId);

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "checked_in" },
  });

  revalidatePath(`/properties/${propertyId}/dashboard`);
}

export async function checkOutBooking(propertyId: string, bookingId: string) {
  await verifyPropertyAccess(propertyId);

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "checked_out" },
  });

  revalidatePath(`/properties/${propertyId}/dashboard`);
}