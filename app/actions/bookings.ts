"use server";

import prisma from "@/lib/db";
import { BookingSchema, BookingValues } from "@/lib/schemas/booking";
import { AvailabilityService } from "@/lib/availability";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifyPropertyAccess } from "@/lib/auth-utils";

export type ActionState = {
  errors?: {
    guestId?: string[];
    roomId?: string[];
    checkIn?: string[];
    checkOut?: string[];
    _form?: string[];
  };
  message?: string | null;
};

/**
 * Creates a new booking.
 * Uses a transaction to ensure availability check and creation are atomic.
 */
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

  const rawData = {
    guestId: formData.get("guestId"),
    roomId: formData.get("roomId"),
    checkIn: formData.get("checkIn"),
    checkOut: formData.get("checkOut"),
    notes: formData.get("notes"),
  };

  const validatedFields = BookingSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Booking.",
    };
  }

  const { guestId, roomId, checkIn, checkOut, notes } = validatedFields.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Re-check availability within the transaction
      const availableBeds = await AvailabilityService.getAvailableBeds(roomId, {
        checkIn,
        checkOut,
      });

      if (availableBeds.length === 0) {
        throw new Error("No beds available for the selected dates.");
      }

      const bedLabel = availableBeds[0];

      // 2. Get room details for pricing
      const room = await tx.room.findUnique({
        where: { id: roomId },
      });

      if (!room) throw new Error("Room not found.");

      // Calculate number of nights
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalAmount = room.pricePerNight * nights;

      // 3. Create the booking
      const booking = await tx.booking.create({
        data: {
          propertyId,
          guestId,
          checkIn,
          checkOut,
          status: "confirmed",
          notes,
          totalAmount,
          beds: {
            create: {
              roomId,
              bedLabel,
              pricePerNight: room.pricePerNight,
            },
          },
        },
      });

      return booking;
    });

    revalidatePath(`/properties/${propertyId}/bookings`);
    revalidatePath(`/properties/${propertyId}/dashboard`);
  } catch (error) {
    console.error("Booking Creation Error:", error);
    return {
      message: error instanceof Error ? error.message : "Database Error: Failed to Create Booking.",
    };
  }

  redirect(`/properties/${propertyId}/bookings`);
}

export async function getBookings(propertyId: string, query?: string) {
  try {
    await verifyPropertyAccess(propertyId);
  } catch (error) {
    return [];
  }

  return prisma.booking.findMany({
    where: {
      propertyId,
      OR: query
        ? [
            { guest: { firstName: { contains: query, mode: "insensitive" } } },
            { guest: { lastName: { contains: query, mode: "insensitive" } } },
            { confirmationCode: { contains: query, mode: "insensitive" } },
          ]
        : undefined,
    },
    include: {
      guest: true,
      beds: {
        include: {
          room: true,
        },
      },
    },
    orderBy: { checkIn: "desc" },
  });
}

export async function cancelBooking(propertyId: string, bookingId: string) {
  try {
    await verifyPropertyAccess(propertyId);
  } catch (error) {
    throw new Error("Unauthorized");
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "cancelled" },
  });

  revalidatePath(`/properties/${propertyId}/bookings`);
}
