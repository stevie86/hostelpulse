'use server';

import { auth } from '@/auth';
import prisma from '@/lib/db';
import { RoomSchema, RoomFormValues } from '@/lib/schemas/room';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { verifyPropertyAccess } from '@/lib/auth-utils';

export type ActionState = {
  errors?: {
    name?: string[];
    type?: string[];
    beds?: string[];
    pricePerNight?: string[];
    maxOccupancy?: string[];
    description?: string[];
    _form?: string[];
  };
  message?: string | null;
};

export async function createRoom(
  propertyId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // await verifyPropertyAccess(propertyId);
  } catch (error) {
    return { message: error instanceof Error ? error.message : 'Unauthorized' };
  }

  const priceInEuros = formData.get('pricePerNight');
  const priceInCents = priceInEuros
    ? Math.round(parseFloat(priceInEuros as string) * 100)
    : 0;

  const rawData = {
    name: formData.get('name'),
    type: formData.get('type'),
    beds: formData.get('beds'),
    pricePerNight: priceInCents,
    maxOccupancy: formData.get('maxOccupancy'),
    description: formData.get('description') || undefined,
  };

  const validatedFields = RoomSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Room.',
    };
  }

  const { name, type, beds, pricePerNight, maxOccupancy, description } =
    validatedFields.data;

  try {
    await prisma.room.create({
      data: {
        propertyId,
        name,
        type,
        beds,
        pricePerNight,
        maxOccupancy,
        description: description || null,
        status: 'available',
      },
    });
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Room.',
    };
  }

  revalidatePath(`/properties/${propertyId}/rooms`);
  redirect(`/properties/${propertyId}/rooms`);
}

export async function updateRoom(
  roomId: string,
  propertyId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // await verifyPropertyAccess(propertyId);
  } catch (error) {
    return { message: error instanceof Error ? error.message : 'Unauthorized' };
  }

  const priceInEuros = formData.get('pricePerNight');
  const priceInCents = priceInEuros
    ? Math.round(parseFloat(priceInEuros as string) * 100)
    : 0;

  const rawData = {
    name: formData.get('name'),
    type: formData.get('type'),
    beds: formData.get('beds'),
    pricePerNight: priceInCents,
    maxOccupancy: formData.get('maxOccupancy'),
    description: formData.get('description') || undefined,
  };

  const validatedFields = RoomSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Room.',
    };
  }

  const { name, type, beds, pricePerNight, maxOccupancy, description } =
    validatedFields.data;

  try {
    await prisma.room.update({
      where: { id: roomId },
      data: {
        name,
        type,
        beds,
        pricePerNight,
        maxOccupancy,
        description: description || null,
      },
    });
  } catch (error) {
    return {
      message: 'Database Error: Failed to Update Room.',
    };
  }

  revalidatePath(`/properties/${propertyId}/rooms`);
  redirect(`/properties/${propertyId}/rooms`);
}

export async function deleteRoom(roomId: string, propertyId: string) {
  // await verifyPropertyAccess(propertyId);

  // Check for active bookings
  const activeBookings = await prisma.bookingBed.count({
    where: {
      roomId: roomId,
      booking: {
        status: { in: ['confirmed', 'checked_in'] },
      },
    },
  });

  if (activeBookings > 0) {
    throw new Error('Cannot delete room with active bookings.');
  }

  try {
    await prisma.room.delete({
      where: { id: roomId },
    });
    revalidatePath(`/properties/${propertyId}/rooms`);
  } catch (error) {
    throw new Error('Failed to delete room.');
  }
}

export async function getRooms(propertyId: string) {
  // Temporary: Skip property access verification for demo
  // In production, uncomment the following:
  // try {
  //   // await verifyPropertyAccess(propertyId);
  // } catch (error) {
  //   return { message: error instanceof Error ? error.message : 'Unauthorized' };
  // }

  try {
    const rooms = await prisma.room.findMany({
      where: { propertyId },
      orderBy: { name: 'asc' },
    });
    return rooms;
  } catch (error) {
    console.error('Failed to fetch rooms:', error);
    throw new Error('Failed to fetch rooms.');
  }
}
