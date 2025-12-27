'use server';

import prisma from '@/lib/db';
import { BookingSchema, BookingValues } from '@/lib/schemas/booking';
import { AvailabilityService } from '@/lib/availability';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { verifyPropertyAccess } from '@/lib/auth-utils';
import { emailService } from '@/lib/email-service';
import { bookingConfirmationTemplate } from '@/lib/email-templates';
import { createMoloniClient } from '@/lib/moloni-integration';

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
    // await verifyPropertyAccess(propertyId);
  } catch (error) {
    return { message: error instanceof Error ? error.message : 'Unauthorized' };
  }

  const rawData = {
    guestId: formData.get('guestId'),
    roomId: formData.get('roomId'),
    checkIn: formData.get('checkIn'),
    checkOut: formData.get('checkOut'),
    notes: formData.get('notes'),
    bedLabel: formData.get('bedLabel'),
  };

  const validatedFields = BookingSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Booking.',
    };
  }

  const { guestId, roomId, checkIn, checkOut, notes, bedLabel } =
    validatedFields.data;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Re-check availability within the transaction
      const isAvailable = await AvailabilityService.isBedAvailable(
        roomId,
        bedLabel,
        {
          checkIn,
          checkOut,
        }
      );

      if (!isAvailable) {
        throw new Error('The selected bed is no longer available.');
      }

      // 2. Get room details for pricing
      const room = await tx.room.findUnique({
        where: { id: roomId },
      });

      if (!room) throw new Error('Room not found.');

      // Calculate number of nights
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalAmount = room.pricePerNight * nights;

      // 3. Create the booking
      await tx.booking.create({
        data: {
          propertyId,
          guestId,
          checkIn,
          checkOut,
          status: 'confirmed',
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
    });

    revalidatePath(`/properties/${propertyId}/bookings`);
    revalidatePath(`/properties/${propertyId}/dashboard`);
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')
    ) {
      throw error;
    }
    console.error('Booking Creation Error:', error);
    return {
      message:
        error instanceof Error
          ? error.message
          : 'Database Error: Failed to Create Booking.',
    };
  }

  redirect(`/properties/${propertyId}/bookings`);
}

/**
 * Creates a booking with invoice generation and tax calculation
 * MVP version with basic Moloni integration
 */
export async function createBookingWithInvoice(
  propertyId: string,
  municipality: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // await verifyPropertyAccess(propertyId);
  } catch (error) {
    return { message: error instanceof Error ? error.message : 'Unauthorized' };
  }

  const rawData = {
    guestId: formData.get('guestId'),
    roomId: formData.get('roomId'),
    municipality: municipality, // Municipality passed as function parameter
    guestCount: parseInt(formData.get('guestCount') as string) || 1,
    checkIn: formData.get('checkIn'),
    checkOut: formData.get('checkOut'),
    notes: formData.get('notes'),
    bedLabel: formData.get('bedLabel'),
  };

  const validatedFields = BookingSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Booking.',
    };
  }

  const {
    guestId,
    roomId,
    guestCount,
    checkIn: checkInStr,
    checkOut: checkOutStr,
    notes,
    bedLabel,
  } = validatedFields.data;

  const checkIn = new Date(checkInStr);
  const checkOut = new Date(checkOutStr);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check availability
      const isAvailable = await AvailabilityService.isBedAvailable(
        roomId,
        bedLabel,
        {
          checkIn,
          checkOut,
        }
      );

      if (!isAvailable) {
        throw new Error('Room/bed not available for selected dates');
      }

      // 2. Get room and guest details
      const room = await tx.room.findUnique({
        where: { id: roomId },
      });

      if (!room) {
        throw new Error('Room not found');
      }

      const guest = await tx.guest.findUnique({
        where: { id: guestId },
      });

      if (!guest) {
        throw new Error('Guest not found');
      }

      // 3. Calculate nights and amounts
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );
      const accommodationAmount = room.pricePerNight * nights;

      // 4. Calculate tourist tax using comprehensive calculator
      const { portugueseTaxCalculator } =
        await import('@/lib/tourist-tax-calculator');
      const taxCalculation = portugueseTaxCalculator.calculateTax({
        municipality,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestCount: 1, // MVP: assume 1 guest per booking
      });

      const totalAmount = accommodationAmount + taxCalculation.totalTax / 100; // Convert from cents to euros

      // 5. Create the booking
      const booking = await tx.booking.create({
        data: {
          propertyId,
          guestId,
          checkIn,
          checkOut,
          status: 'confirmed',
          notes,
          totalAmount: Math.round(totalAmount * 100), // Store in cents
          accommodationAmount: Math.round(accommodationAmount * 100), // Store in cents
          touristTaxAmount: taxCalculation.totalTax, // Already in cents
          guestCount,
          municipality,
          taxBreakdown: JSON.parse(JSON.stringify(taxCalculation)), // Store full calculation for audit/compliance
          beds: {
            create: {
              roomId,
              bedLabel,
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

      return { booking, taxCalculation, accommodationAmount };
    });

    // 6. Generate invoice via Moloni (certified Portuguese invoicing)
    try {
      // Configure Moloni client (in production, use environment variables)
      const moloniConfig = {
        apiKey: process.env.MOLONI_API_KEY || '',
        secret: process.env.MOLONI_SECRET || '',
        companyId: process.env.MOLONI_COMPANY_ID || '',
        sandbox: process.env.NODE_ENV !== 'production',
      };

      // Only attempt invoice creation if credentials are configured
      if (
        moloniConfig.apiKey &&
        moloniConfig.secret &&
        moloniConfig.companyId
      ) {
        const moloni = createMoloniClient(moloniConfig);

        // Prepare invoice data
        const invoiceData = {
          customer: {
            name: `${result.booking.guest?.firstName} ${result.booking.guest?.lastName}`,
            nif: '', // TODO: Add NIF field to guest model
            email: result.booking.guest?.email || '',
            address: '', // TODO: Add address to guest model
          },
          items: [
            {
              name: `Accommodation - ${result.booking.beds[0]?.room?.name || 'Room'}`,
              qty: Math.ceil(
                (result.booking.checkOut.getTime() -
                  result.booking.checkIn.getTime()) /
                  (1000 * 60 * 60 * 24)
              ),
              price: result.accommodationAmount / 100, // Convert from cents
              taxes: [{ tax_id: 1, value: 6.0 }], // 6% Portuguese VAT for accommodation
            },
          ],
          serie: 'FR', // Invoice series
          notes: `Tourist tax: €${(result.taxCalculation.totalTax / 100).toFixed(2)} (${municipality}) - Decree-Law 28/2023`,
          touristTax: result.taxCalculation.totalTax / 100,
        };

        const invoiceResult = await moloni.createInvoice(invoiceData);

        if (invoiceResult.success) {
          console.log(
            '✅ Invoice created successfully:',
            invoiceResult.invoiceNumber
          );

          // Send invoice via email if we have a PDF URL
          if (invoiceResult.pdfUrl && result.booking.guest?.email) {
            try {
              await emailService.sendInvoice(
                invoiceResult.invoiceNumber || result.booking.id,
                result.booking.guest.email,
                `${result.booking.guest.firstName} ${result.booking.guest.lastName}`,
                (result.booking.totalAmount / 100).toFixed(2),
                invoiceResult.pdfUrl // Pass PDF URL as content
              );
              console.log('📧 Invoice email sent successfully');
            } catch (emailError) {
              console.warn('Invoice email failed (non-critical):', emailError);
            }
          }
        } else {
          console.warn('⚠️ Invoice creation failed:', invoiceResult.error);
          // Could implement retry logic or queue for later processing
        }
      } else {
        console.log(
          'ℹ️ Moloni credentials not configured - skipping invoice generation'
        );
      }
    } catch (invoiceError) {
      console.warn(
        'Invoice generation failed (non-critical for MVP):',
        invoiceError
      );
      // Don't fail the booking if invoice generation fails
    }

    revalidatePath(`/properties/${propertyId}/bookings`);
    revalidatePath(`/properties/${propertyId}/dashboard`);

    // Send booking confirmation email with tax details
    try {
      if (result.booking.guest?.email) {
        const emailHtml = bookingConfirmationTemplate({
          guestName:
            result.booking.guest.firstName +
            ' ' +
            result.booking.guest.lastName,
          bookingId: result.booking.id,
          checkInDate: result.booking.checkIn.toLocaleDateString('en-GB'),
          checkOutDate: result.booking.checkOut.toLocaleDateString('en-GB'),
          totalAmount: (result.booking.totalAmount / 100).toFixed(2),
          hostelName: 'HostelPulse', // TODO: Get from property
          touristTax: (result.taxCalculation.totalTax / 100).toFixed(2),
          roomType: result.booking.beds[0]?.room?.name || 'Standard Room',
        });

        await emailService.sendBookingConfirmation(
          result.booking.id,
          result.booking.guest.email,
          result.booking.guest.firstName + ' ' + result.booking.guest.lastName,
          result.booking.checkIn.toLocaleDateString('en-GB'),
          result.booking.checkOut.toLocaleDateString('en-GB'),
          (result.booking.totalAmount / 100).toFixed(2)
        );

        console.log('✅ Booking confirmation email sent successfully');
      }
    } catch (emailError) {
      console.warn(
        '⚠️ Booking confirmation email failed (non-critical):',
        emailError
      );
      // Don't fail the booking if email fails
    }

    return {
      message: `Booking created successfully! Total: €${(result.booking.totalAmount / 100).toFixed(2)} (including €${(result.taxCalculation.totalTax / 100).toFixed(2)} tourist tax)`,
    };
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')
    ) {
      throw error;
    }
    console.error('Booking Creation Error:', error);
    return {
      message:
        error instanceof Error
          ? error.message
          : 'Database Error: Failed to Create Booking.',
    };
  }
}

export async function getBookings(propertyId: string, query?: string) {
  try {
    // await verifyPropertyAccess(propertyId);
  } catch (error) {
    return [];
  }

  return prisma.booking.findMany({
    where: {
      propertyId,
      OR: query
        ? [
            { guest: { firstName: { contains: query } } },
            { guest: { lastName: { contains: query } } },
            { confirmationCode: { contains: query } },
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
    orderBy: { checkIn: 'desc' },
  });
}

export async function cancelBooking(propertyId: string, bookingId: string) {
  try {
    // await verifyPropertyAccess(propertyId);
  } catch (error) {
    throw new Error('Unauthorized');
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'cancelled' },
  });

  revalidatePath(`/properties/${propertyId}/bookings`);
}
