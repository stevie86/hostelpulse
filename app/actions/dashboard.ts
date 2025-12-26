'use server';

import { auth } from '@/auth';
import prisma from '@/lib/db'; // Corrected: default import
import { startOfDay, endOfDay } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { revalidatePath } from 'next/cache';
import { verifyPropertyAccess } from '@/lib/auth-utils';
import { AvailabilityService } from '@/lib/availability';

import { DashboardStats } from '@/types/dashboard';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function getDashboardStats(
  propertyId: string
): Promise<DashboardStats | null> {
  try {
    await verifyPropertyAccess(propertyId);
  } catch (error) {
    return null;
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { timezone: true },
  });

  if (!property) {
    throw new Error('Property not found');
  }

  const zonedNow = toZonedTime(new Date(), property.timezone); // Corrected: function name

  const startOfToday = fromZonedTime(startOfDay(zonedNow), property.timezone); // Corrected: function name
  const endOfToday = fromZonedTime(endOfDay(zonedNow), property.timezone); // Corrected: function name

  // Occupancy: Count of bookings with status 'checked_in'
  // Note: Ideally we count occupied *beds*, but for now assume 1 booking = 1 bed usage unless we join.
  // Better: Count beds in checked_in bookings.
  const occupiedBeds = await prisma.bookingBed.count({
    where: {
      booking: {
        propertyId,
        status: 'checked_in',
      },
    },
  });

  const totalBeds = await prisma.room.aggregate({
    where: { propertyId },
    _sum: { beds: true },
  });
  const totalBedCount = totalBeds._sum.beds || 0;

  const totalRooms = await prisma.room.count({
    where: { propertyId },
  });

  const occupancyPercentage =
    totalBedCount > 0 ? Math.round((occupiedBeds / totalBedCount) * 100) : 0;

  // Arrivals: Count of bookings checking in today in the property's timezone
  const arrivalsCount = await prisma.booking.count({
    where: {
      propertyId,
      checkIn: {
        gte: startOfToday,
        lte: endOfToday,
      },
      status: {
        in: ['pending', 'confirmed'], // Only count pending or confirmed arrivals
      },
    },
  });

  // Departures: Count of bookings checking out today in the property's timezone
  const departuresCount = await prisma.booking.count({
    where: {
      propertyId,
      checkOut: {
        gte: startOfToday,
        lte: endOfToday,
      },
      status: {
        in: ['checked_in'], // Only count currently checked-in guests scheduled to depart
      },
    },
  });

  return {
    occupancy: occupancyPercentage, // Renamed to match logic, but UI expects 'currentOccupancyPercentage'
    currentOccupancyPercentage: occupancyPercentage, // Adding explicit field
    totalRooms,
    totalBeds: totalBedCount,
    occupiedBeds,
    availableBeds: totalBedCount - occupiedBeds,
    arrivals: arrivalsCount,
    arrivalsToday: arrivalsCount,
    departures: departuresCount,
    departuresToday: departuresCount,
  };
}

export async function getDailyActivity(propertyId: string) {
  try {
    await verifyPropertyAccess(propertyId);
  } catch (error) {
    return { arrivals: [], departures: [] };
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { timezone: true },
  });

  if (!property) {
    throw new Error('Property not found');
  }

  const zonedNow = toZonedTime(new Date(), property.timezone); // Corrected: function name

  const startOfToday = fromZonedTime(startOfDay(zonedNow), property.timezone); // Corrected: function name
  const endOfToday = fromZonedTime(endOfDay(zonedNow), property.timezone); // Corrected: function name

  // Fetch bookings for arrivals today
  const arrivals = await prisma.booking.findMany({
    where: {
      propertyId,
      checkIn: {
        gte: startOfToday,
        lte: endOfToday,
      },
      status: {
        in: ['pending', 'confirmed'],
      },
    },
    include: {
      guest: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      beds: {
        select: {
          bedLabel: true,
          pricePerNight: true,
          room: {
            select: {
              name: true, // Room name
            },
          },
        },
      },
    },
  });

  // Fetch bookings for departures today
  const departures = await prisma.booking.findMany({
    where: {
      propertyId,
      checkOut: {
        gte: startOfToday,
        lte: endOfToday,
      },
      status: {
        in: ['checked_in'],
      },
    },
    include: {
      guest: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      beds: {
        select: {
          bedLabel: true,
          pricePerNight: true,
          room: {
            select: {
              name: true, // Room name
            },
          },
        },
      },
    },
  });

  return { arrivals, departures };
}

export async function getBookingsForMonth(
  propertyId: string,
  month: number,
  year: number
) {
  try {
    await verifyPropertyAccess(propertyId);
  } catch (error) {
    return [];
  }

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  const bookings = await prisma.booking.findMany({
    where: {
      propertyId,
      checkIn: {
        lte: endDate,
      },
      checkOut: {
        gte: startDate,
      },
    },
    select: {
      id: true,
      checkIn: true,
      checkOut: true,
      status: true,
      guest: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return bookings;
}

export async function checkIn(bookingId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  try {
    // Verify booking belongs to a property the user has access to
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { propertyId: true },
    });

    if (!booking) throw new Error('Booking not found');
    await verifyPropertyAccess(booking.propertyId);

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'checked_in', actualCheckIn: new Date() },
    });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error checking in booking:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to check in booking.'
    );
  }
}

export async function checkOut(bookingId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  try {
    // Verify booking belongs to a property the user has access to
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { propertyId: true },
    });

    if (!booking) throw new Error('Booking not found');
    await verifyPropertyAccess(booking.propertyId);

    // Get booking details for SEF reporting
    const bookingDetails = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        property: true,
      },
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'completed', actualCheckOut: new Date() },
    });

    // Generate SEF report if guest is foreign
    if (
      bookingDetails?.guest &&
      bookingDetails.property &&
      bookingDetails.guest.documentId
    ) {
      try {
        const { SEFReportingService } = await import('@/lib/sef-reporting');
        const sefReport = SEFReportingService.generateGuestReport(
          bookingDetails.guest as any,
          bookingDetails,
          `${bookingDetails.property.address || ''}, ${bookingDetails.property.city}, ${bookingDetails.property.country}`
        );

        // In production, this would be sent to SEF API or stored for later submission
        console.log(
          'SEF Report Generated:',
          JSON.stringify(sefReport, null, 2)
        );
      } catch (error) {
        // SEF reporting failed - log but don't fail the check-out
        console.error('SEF reporting failed:', error);
      }
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error checking out booking:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to check out booking.'
    );
  }
}

export async function createWalkInBooking(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  try {
    const propertyId = formData.get('propertyId') as string;
    await verifyPropertyAccess(propertyId);

    // Extract guest data
    const guestData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: (formData.get('email') as string) || null,
      phone: (formData.get('phone') as string) || null,
      nationality: (formData.get('nationality') as string) || null,
      documentType: (formData.get('documentType') as string) || null,
      documentId: formData.get('documentId') as string,
    };

    // Extract booking data
    const checkIn = new Date(formData.get('checkIn') as string);
    const checkOut = new Date(formData.get('checkOut') as string);
    const guestCount = parseInt(formData.get('guestCount') as string);
    const selectedRoomId = formData.get('selectedRoomId') as string;
    const notes = (formData.get('notes') as string) || null;

    // Basic validation
    const errors: Record<string, string[]> = {};

    if (!guestData.firstName) errors.firstName = ['First name is required'];
    if (!guestData.lastName) errors.lastName = ['Last name is required'];
    if (!guestData.documentId) errors.documentId = ['Document ID is required'];

    if (!selectedRoomId) errors.room = ['Room selection is required'];

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: 'Missing required information',
        errors,
      };
    }

    if (!selectedRoomId) {
      return {
        success: false,
        message: 'Please select a room',
        errors: { room: ['Room selection is required'] },
      };
    }

    // Get room details
    const room = await prisma.room.findUnique({
      where: { id: selectedRoomId },
    });

    if (!room) {
      return {
        success: false,
        message: 'Selected room not found',
        errors: { room: ['Room not found'] },
      };
    }

    // Check bed availability
    const { AvailabilityService } = await import('@/lib/availability');
    const availableBeds = await AvailabilityService.getAvailableBeds(
      selectedRoomId,
      { checkIn, checkOut }
    );

    if (availableBeds.length === 0) {
      return {
        success: false,
        message: 'Room is not available',
        errors: {
          room: ['No beds available in this room for the selected dates'],
        },
      };
    }

    // Calculate costs
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    const accommodationCost = room.pricePerNight * nights;

    // Calculate tourist tax
    const { portugueseTaxCalculator } =
      await import('@/lib/portuguese-tourist-tax');
    const taxCalculation = portugueseTaxCalculator.calculateTax(
      checkIn,
      checkOut,
      guestCount,
      'lisbon' // Assuming Lisbon
    );

    const totalAmount = accommodationCost + taxCalculation.amount;

    // Create guest and booking in transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create guest
      const guest = await tx.guest.create({
        data: {
          ...guestData,
          propertyId,
        },
      });

      // Create booking
      const booking = await tx.booking.create({
        data: {
          propertyId,
          guestId: guest.id,
          checkIn,
          checkOut,
          status: 'checked_in',
          actualCheckIn: new Date(),
          totalAmount,
          amountPaid: 0, // Assuming payment at check-out
          notes,
          beds: {
            create: {
              roomId: selectedRoomId,
              bedLabel: availableBeds[0], // Use first available bed
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

      return booking;
    });

    revalidatePath('/check-in-out');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error creating walk-in booking:', error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to create booking',
      errors: {},
    };
  }
}
