import { z } from "zod";

export const RoomTypeSchema = z.enum(["dormitory", "private", "suite"]);

export const RoomSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: RoomTypeSchema,
  beds: z.coerce.number().int().min(1, "Must have at least 1 bed"),
  pricePerNight: z.coerce.number().int().min(0, "Price cannot be negative"), // In cents
  description: z.string().optional(),
  maxOccupancy: z.coerce.number().int().min(1, "Max occupancy must be at least 1"),
});

export type RoomFormValues = z.infer<typeof RoomSchema>;
