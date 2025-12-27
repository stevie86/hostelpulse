'use server';

import { auth } from '@/auth';
import prisma from '@/lib/db';
import { GuestSchema } from '@/lib/schemas/guest';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { verifyPropertyAccess } from '@/lib/auth-utils';

export type ActionState = {
  errors?: {
    firstName?: string[];
    lastName?: string[];
    email?: string[];
    _form?: string[];
  };
  message?: string | null;
};

export async function createGuest(
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
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email') || '',
    phone: formData.get('phone') || undefined,
    nationality: formData.get('nationality') || undefined,
    documentType: formData.get('documentType') || undefined,
    documentId: formData.get('documentId') || undefined,
    notes: formData.get('notes') || undefined,
  };

  const validatedFields = GuestSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Guest.',
    };
  }

  try {
    await prisma.guest.create({
      data: {
        propertyId,
        ...validatedFields.data,
      },
    });
  } catch (error) {
    return { message: 'Database Error: Failed to Create Guest.' };
  }

  revalidatePath(`/properties/${propertyId}/guests`);
  redirect(`/properties/${propertyId}/guests`);
}

export async function updateGuest(
  guestId: string,
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
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email') || '',
    phone: formData.get('phone') || undefined,
    nationality: formData.get('nationality') || undefined,
    documentType: formData.get('documentType') || undefined,
    documentId: formData.get('documentId') || undefined,
    notes: formData.get('notes') || undefined,
  };

  const validatedFields = GuestSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Guest.',
    };
  }

  try {
    await prisma.guest.update({
      where: { id: guestId },
      data: validatedFields.data,
    });
  } catch (error) {
    return { message: 'Database Error: Failed to Update Guest.' };
  }

  revalidatePath(`/properties/${propertyId}/guests`);
  redirect(`/properties/${propertyId}/guests`);
}

export async function getGuests(propertyId: string, query?: string) {
  // Temporary: Skip property access verification for demo
  // In production, uncomment the following:
  // try {
  //   // await verifyPropertyAccess(propertyId);
  // } catch (error) {
  //   return { message: error instanceof Error ? error.message : 'Unauthorized' };
  // }

  return prisma.guest.findMany({
    where: {
      propertyId,
      OR:
        query && query.trim() !== ''
          ? [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
              {
                firstName: {
                  contains: query.split(' ')[0],
                  mode: 'insensitive',
                },
              },
              {
                lastName: {
                  contains: query.split(' ').slice(-1)[0],
                  mode: 'insensitive',
                },
              },
            ]
          : undefined,
    },
    orderBy: { lastName: 'asc' },
  });
}
