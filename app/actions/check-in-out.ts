'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { CheckInSchema, CheckOutSchema } from '@/lib/schemas/check-in-out';

export async function checkInGuest(formData: FormData) {
  const validatedFields = CheckInSchema.safeParse({
    guestId: formData.get('guestId'),
    roomId: formData.get('roomId'),
    checkInDate: formData.get('checkInDate'),
    checkOutDate: formData.get('checkOutDate'),
    notes: formData.get('notes'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Invalid form data',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { guestId, roomId, checkInDate, checkOutDate, notes } =
    validatedFields.data;

  try {
    // Get room details to get propertyId
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return { error: 'Room not found' };
    }

    // Check if room is available for the selected dates
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        beds: {
          some: {
            roomId,
          },
        },
        status: { in: ['confirmed', 'checked_in'] },
        OR: [
          {
            AND: [
              { checkIn: { lte: new Date(checkInDate) } },
              { checkOut: { gt: new Date(checkInDate) } },
            ],
          },
          {
            AND: [
              { checkIn: { lt: new Date(checkOutDate) } },
              { checkOut: { gte: new Date(checkOutDate) } },
            ],
          },
        ],
      },
    });

    if (conflictingBooking) {
      return {
        error: 'Room is not available for the selected dates',
      };
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        guestId,
        propertyId: room.propertyId,
        checkIn: new Date(checkInDate),
        checkOut: new Date(checkOutDate),
        status: 'confirmed',
        totalAmount: 0,
        actualCheckIn: new Date(),
        notes: notes || '',
        beds: {
          create: {
            roomId,
            bedLabel: `${room.type} - Bed 1`,
            pricePerNight: room.pricePerNight,
          },
        },
      },
      include: {
        guest: true,
        beds: {
          include: {
            room: true,
          },
        },
      },
    });

    revalidatePath(`/properties/${booking.propertyId}/check-in-out`);
    return { success: true, booking };
  } catch (error) {
    console.error('Check-in error:', error);
    return { error: 'Failed to check in guest' };
  }
}

export async function checkOutGuest(formData: FormData) {
  const validatedFields = CheckOutSchema.safeParse({
    bookingId: formData.get('bookingId'),
    finalAmount: Number(formData.get('finalAmount')),
    paymentMethod: formData.get('paymentMethod'),
    paymentStatus: formData.get('paymentStatus'),
    notes: formData.get('notes'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Invalid form data',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { bookingId, finalAmount, paymentMethod, paymentStatus, notes } =
    validatedFields.data;

  try {
    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        property: true,
      },
    });

    if (!booking) {
      return { error: 'Booking not found' };
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'checked_out',
        actualCheckOut: new Date(),
        totalAmount: finalAmount * 100, // Convert to cents
        paymentStatus: paymentStatus,
        notes: notes || '',
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        bookingId,
        amount: finalAmount * 100,
        method: paymentMethod,
        status: 'completed',
        processedBy: 'system', // Will be updated to actual user
      },
    });

    revalidatePath(`/properties/${booking.propertyId}/check-in-out`);
    return { success: true, booking: updatedBooking };
  } catch (error) {
    console.error('Check-out error:', error);
    return { error: 'Failed to check out guest' };
  }
}

export async function getAvailableRooms(
  propertyId: string,
  checkIn: string,
  checkOut: string
) {
  try {
    // Get all rooms for the property
    const allRooms = await prisma.room.findMany({
      where: {
        propertyId,
      },
    });

    // Get rooms that have conflicting bookings
    const conflictingBookingBeds = await prisma.bookingBed.findMany({
      where: {
        booking: {
          status: { in: ['confirmed', 'checked_in'] },
          OR: [
            {
              AND: [
                { checkIn: { lte: new Date(checkIn) } },
                { checkOut: { gt: new Date(checkIn) } },
              ],
            },
            {
              AND: [
                { checkIn: { lt: new Date(checkOut) } },
                { checkOut: { gte: new Date(checkOut) } },
              ],
            },
          ],
        },
      },
      select: {
        roomId: true,
      },
    });

    const conflictingIds = new Set(
      conflictingBookingBeds.map((bed) => bed.roomId)
    );

    // Return rooms that are not in the conflicting list
    const availableRooms = allRooms.filter(
      (room) => !conflictingIds.has(room.id)
    );

    return availableRooms;
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    return [];
  }
}

export async function getCheckedInGuests(propertyId: string) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        propertyId,
        status: 'checked_in',
      },
      include: {
        guest: true,
        beds: {
          include: {
            room: true,
          },
        },
      },
      orderBy: {
        checkIn: 'desc',
      },
    });

    return bookings;
  } catch (error) {
    console.error('Error fetching checked-in guests:', error);
    return [];
  }
}
