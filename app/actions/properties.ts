'use server';

import { auth } from '@/auth';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { verifyPropertyAccess } from '@/lib/auth-utils';

export type PropertyActionState = {
  errors?: {
    name?: string[];
    city?: string[];
    country?: string[];
    address?: string[];
    checkInTime?: string[];
    checkOutTime?: string[];
    _form?: string[];
  };
  message?: string | null;
  success?: boolean;
  propertyId?: string;
};

export async function createProperty(
  prevState: PropertyActionState,
  formData: FormData
): Promise<PropertyActionState> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { message: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const city = formData.get('city') as string;
    const country = formData.get('country') as string;
    const address = formData.get('address') as string;
    const currency = (formData.get('currency') as string) || 'EUR';
    const timezone = (formData.get('timezone') as string) || 'Europe/Lisbon';
    const checkInTime = (formData.get('checkInTime') as string) || '15:00';
    const checkOutTime = (formData.get('checkOutTime') as string) || '11:00';

    // Basic validation
    const errors: PropertyActionState['errors'] = {};

    if (!name || name.trim().length === 0) {
      errors.name = ['Property name is required'];
    }

    if (!city || city.trim().length === 0) {
      errors.city = ['City is required'];
    }

    if (!country || country.trim().length === 0) {
      errors.country = ['Country is required'];
    }

    if (!address || address.trim().length === 0) {
      errors.address = ['Address is required'];
    }

    if (Object.keys(errors).length > 0) {
      return { errors, message: 'Please fix the errors below.' };
    }

    // Get or create team for user
    let team = await prisma.team.findFirst({
      where: {
        members: {
          some: { userId: session.user.id },
        },
      },
    });

    if (!team) {
      team = await prisma.team.create({
        data: {
          name: `${session.user.name || 'User'}'s Team`,
          slug: `team-${session.user.id}`,
          defaultRole: 'OWNER',
        },
      });

      // Create team member relationship
      await prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: session.user.id,
          role: 'OWNER',
        },
      });
    }

    // Create property
    const property = await prisma.property.create({
      data: {
        teamId: team.id,
        name: name.trim(),
        city: city.trim(),
        country: country.trim(),
        address: address.trim(),
        currency,
        timezone,
        checkInTime,
        checkOutTime,
      },
    });

    revalidatePath('/');

    return {
      success: true,
      propertyId: property.id,
      message: 'Property created successfully!',
    };
  } catch (error) {
    console.error('Property creation error:', error);
    return {
      message:
        error instanceof Error ? error.message : 'Failed to create property.',
    };
  }
}

export type InvoicingActionState = {
  errors?: {
    invoicingProvider?: string[];
    externalInvoiceUrl?: string[];
    _form?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function updateInvoicingPreferences(
  prevState: InvoicingActionState,
  formData: FormData
): Promise<InvoicingActionState> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { message: 'Unauthorized' };
    }

    const propertyId = formData.get('propertyId') as string;
    const invoicingProvider = formData.get('invoicingProvider') as string;
    const externalInvoiceUrl = formData.get('externalInvoiceUrl') as string;

    // Verify user has access to this property
    await verifyPropertyAccess(propertyId);

    // Validate input
    const errors: InvoicingActionState['errors'] = {};

    if (
      invoicingProvider === 'external' &&
      externalInvoiceUrl &&
      !externalInvoiceUrl.startsWith('http')
    ) {
      errors.externalInvoiceUrl = [
        'Must be a valid URL starting with http:// or https://',
      ];
    }

    if (Object.keys(errors).length > 0) {
      return { errors, message: 'Please fix the errors below.' };
    }

    // Update property with invoicing preferences
    await prisma.property.update({
      where: { id: propertyId },
      data: {
        invoicingProvider: invoicingProvider || null,
        externalInvoiceUrl: externalInvoiceUrl || null,
      },
    });

    // Revalidate the settings page to show updated preferences
    revalidatePath(`/properties/${propertyId}/settings`);

    return {
      success: true,
      message: 'Invoicing preferences updated successfully!',
    };
  } catch (error) {
    console.error('Invoicing preferences update error:', error);
    return {
      message:
        error instanceof Error
          ? error.message
          : 'Failed to update invoicing preferences.',
    };
  }
}
