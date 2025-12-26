'use server';

import { auth } from '@/auth';
import prisma from '@/lib/db'; // Corrected: default import
import { startOfDay, endOfDay } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { revalidatePath } from 'next/cache';
import { verifyPropertyAccess } from '@/lib/auth-utils';

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
      include: {
        guest: true,
        property: true,
      },
    });

    if (!booking) throw new Error('Booking not found');
    await verifyPropertyAccess(booking.propertyId);

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'checked_in', actualCheckIn: new Date() },
    });

    // TODO: SEF reporting integration - PRIORITY 2 compliance
    // SEF integration temporarily disabled for build stability
    console.log('SEF reporting: Check-in recorded (integration pending)');

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
      include: {
        guest: true,
        property: true,
      },
    });

    if (!booking) throw new Error('Booking not found');
    await verifyPropertyAccess(booking.propertyId);

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'completed', actualCheckOut: new Date() },
    });

    // SEF reporting integration - PRIORITY 2 compliance
    if (booking.guest) {
      try {
        const { sefService } = await import('@/lib/sef-service');

        const sefResult = await sefService.submitCheckOutReport(
          bookingId,
          booking.propertyId,
          new Date() // actual check-out time
        );

        if (sefResult.success) {
          console.log(
            `✅ SEF check-out report submitted: ${sefResult.referenceId}`
          );
        } else {
          console.warn(`⚠️ SEF check-out report failed: ${sefResult.error}`);
          // TODO: Send email notification to property owner
        }
      } catch (sefError) {
        console.warn(
          'SEF check-out integration error (non-blocking):',
          sefError
        );
        // Never fail check-out due to SEF issues
      }
    }

    // Billing integration - generate invoice based on property preferences
    try {
      const { billingService } = await import('@/lib/billing-service');

      const billingResult = await billingService.generateInvoice(
        bookingId,
        booking.propertyId
      );

      if (billingResult.success) {
        console.log(`💰 Invoice generated: ${billingResult.message}`);
        if (billingResult.invoiceId) {
          console.log(`📄 Invoice ID: ${billingResult.invoiceId}`);
        }
      } else {
        console.warn(`⚠️ Invoice generation failed: ${billingResult.error}`);
        // TODO: Send email notification to property owner
      }
    } catch (billingError) {
      console.warn('Billing integration error (non-blocking):', billingError);
      // Never fail check-out due to billing issues
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
