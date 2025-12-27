import { z } from 'zod';

export const CheckInSchema = z.object({
  guestId: z.string().min(1, 'Guest is required'),
  roomId: z.string().min(1, 'Room is required'),
  checkInDate: z.string().min(1, 'Check-in date is required'),
  checkOutDate: z.string().min(1, 'Check-out date is required'),
  notes: z.string().optional(),
});

export const CheckOutSchema = z.object({
  bookingId: z.string().min(1, 'Booking is required'),
  finalAmount: z.number().min(0, 'Final amount must be positive'),
  paymentMethod: z.enum(['cash', 'card', 'bank_transfer', 'moloni']),
  paymentStatus: z.enum(['pending', 'partial', 'paid', 'overdue']),
  notes: z.string().optional(),
});

export type CheckInFormValues = z.infer<typeof CheckInSchema>;
export type CheckOutFormValues = z.infer<typeof CheckOutSchema>;
