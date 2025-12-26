import { z } from 'zod';

export const BookingSchema = z
  .object({
    guestId: z.string().min(1, 'Guest is required'),
    roomId: z.string().min(1, 'Room is required'),
    bedLabel: z.string().min(1, 'Bed selection is required'),
    guestCount: z.coerce.number().int().min(1, 'At least 1 guest is required'),
    municipality: z
      .string()
      .min(1, 'Municipality is required for tax calculation'),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
    status: z
      .enum([
        'pending',
        'confirmed',
        'checked_in',
        'checked_out',
        'cancelled',
        'no_show',
      ])
      .default('confirmed'),
    notes: z.string().optional().nullable(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: 'Check-out must be after check-in',
    path: ['checkOut'],
  });

export type BookingValues = z.infer<typeof BookingSchema>;
