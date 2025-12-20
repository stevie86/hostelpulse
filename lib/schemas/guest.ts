import { z } from 'zod';

export const GuestSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  documentType: z.enum(['passport', 'id_card', 'driving_license']).optional(),
  documentId: z.string().optional(),
  notes: z.string().optional(),
});

export type GuestFormValues = z.infer<typeof GuestSchema>;
