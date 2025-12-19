import prisma from "@/lib/db";
import { Booking, BookingBed, Room } from "@prisma/client";

export interface DateRange {
  checkIn: Date;
  checkOut: Date;
}

/**
 * Service to handle room and bed availability logic.
 */
export class AvailabilityService {
  /**
   * Checks if a specific room has enough beds available for the given dates.
   * For private rooms, it checks if the room itself is booked.
   * For dormitories, it checks if there's at least one free bed.
   */
  static async getAvailableBeds(
    roomId: string,
    range: DateRange
  ): Promise<string[]> {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room || room.status !== "available") {
      return [];
    }

    // Find all bookings that overlap with the requested range for this room
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        status: { in: ["confirmed", "checked_in"] },
        checkIn: { lt: range.checkOut },
        checkOut: { gt: range.checkIn },
        beds: {
          some: {
            roomId: roomId,
          },
        },
      },
      include: {
        beds: {
          where: {
            roomId: roomId,
          },
        },
      },
    });

    const bookedBedLabels = new Set<string>();
    overlappingBookings.forEach((booking) => {
      booking.beds.forEach((bed) => {
        bookedBedLabels.add(bed.bedLabel);
      });
    });

    // Generate all possible bed labels for this room
    const allBedLabels = Array.from({ length: room.beds }, (_, i) =>
      (i + 1).toString()
    );

    // Filter out labels that are already booked
    const availableLabels = allBedLabels.filter(
      (label) => !bookedBedLabels.has(label)
    );

    return availableLabels;
  }

  /**
   * Helper to find the first available bed label in a room for a date range.
   */
  static async findFirstAvailableBed(
    roomId: string,
    range: DateRange
  ): Promise<string | null> {
    const available = await this.getAvailableBeds(roomId, range);
    return available.length > 0 ? available[0] : null;
  }

  /**
   * Checks if a specific bed label is available.
   */
  static async isBedAvailable(
    roomId: string,
    bedLabel: string,
    range: DateRange
  ): Promise<boolean> {
    const overlapping = await prisma.bookingBed.findFirst({
      where: {
        roomId: roomId,
        bedLabel: bedLabel,
        booking: {
          status: { in: ["confirmed", "checked_in"] },
          checkIn: { lt: range.checkOut },
          checkOut: { gt: range.checkIn },
        },
      },
    });

    return !overlapping;
  }
}
