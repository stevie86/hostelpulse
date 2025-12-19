import { z } from "zod";

export const BookingSchema = z.object({
  guestId: z.string().min(1, "Guest is required"),
  roomId: z.string().min(1, "Room is required"),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  status: z.enum(["pending", "confirmed", "checked_in", "checked_out", "cancelled", "no_show"]).default("confirmed"),
  notes: z.string().optional(),
}).refine((data) => data.checkOut > data.checkIn, {
  message: "Check-out must be after check-in",
  path: ["checkOut"],
});

export type BookingValues = z.infer<typeof BookingSchema>;
