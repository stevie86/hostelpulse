'use server';

import { z } from 'zod';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Guest } from '@prisma/client'; // Import Guest type from Prisma
import { normalizeCurrencyCode, DEFAULT_CURRENCY } from '@/lib/currency';

const GuestSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  documentId: z.string().optional(),
  currency: z.string().length(3, 'Currency must be a 3-letter code').optional().or(z.literal('')),
});

type GuestForExport = Pick<Guest, 'firstName' | 'lastName' | 'email' | 'phone' | 'nationality' | 'documentId' | 'currency'> & {
  [key: string]: string | boolean | Date | null | undefined; // Add index signature
};

export async function createGuest(propertyId: string, prevState: any, formData: FormData) {
  const validatedFields = GuestSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    nationality: formData.get('nationality'),
    documentId: formData.get('documentId'),
    currency: formData.get('currency'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation Error',
    };
  }

  const { firstName, lastName, email, phone, nationality, documentId, currency } = validatedFields.data;

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { currency: true },
  });

  if (!property) {
    return { message: 'Property not found.' };
  }

  const normalizedCurrency = normalizeCurrencyCode(currency, normalizeCurrencyCode(property.currency, DEFAULT_CURRENCY));

  try {
    await prisma.guest.create({
      data: {
        propertyId,
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        nationality: nationality || null,
        documentId: documentId || null,
        currency: normalizedCurrency,
      },
    });

    revalidatePath(`/properties/${propertyId}/guests`);
  } catch (error) {
    console.error('Create Guest Error:', error);
    return { message: 'Database Error: Failed to create guest.' };
  }

  redirect(`/properties/${propertyId}/guests`);
}


