"use server";

import { auth } from "@/auth";
import prisma from "@/lib/db";
import { RoomSchema } from "@/lib/schemas/room";
import { GuestSchema } from "@/lib/schemas/guest"; // Assuming GuestSchema from Feature 003
import { revalidatePath } from "next/cache";
import { z } from "zod";
import Papa from "papaparse";
import { checkAvailability } from "./bookings"; // Reusing availability logic

export type ImportActionState = {
  message?: string | null;
  errors?: string[];
  results?: {
    successCount: number;
    failCount: number;
    failedRows: { row: number; reason: string }[];
  };
};

// --- Schemas for Import Validation ---

const RoomImportSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["dormitory", "private", "suite"]),
  beds: z.coerce.number().int().min(1, "Min 1 bed"),
  pricePerNight: z.coerce.number().int().min(0, "Min 0 price"),
  maxOccupancy: z.coerce.number().int().min(1, "Min 1 occupancy"),
  description: z.string().optional(),
});

const BookingImportSchema = z.object({
  guestFirstName: z.string().min(1, "Guest first name required"),
  guestLastName: z.string().min(1, "Guest last name required"),
  roomName: z.string().min(1, "Room name required"),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").transform((str) => new Date(str)),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").transform((str) => new Date(str)),
  status: z.enum(["pending", "confirmed", "checked_in", "checked_out", "cancelled", "no_show"]).default("confirmed"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
});

// --- Helper for CSV Parsing ---

async function parseCsv(file: File): Promise<{ data: Record<string, string>[]; errors: Papa.ParseError[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        resolve({ data: results.data, errors: results.errors });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

// --- Import Actions ---

export async function importGuests(
  propertyId: string,
  prevState: ImportActionState,
  formData: FormData
): Promise<ImportActionState> {
  const session = await auth();
  if (!session?.user?.email) {
    return { message: "Unauthorized", errors: ["Authentication required."] };
  }

  const file = formData.get("file") as File;
  if (!file || file.size === 0) {
    return { message: "No file selected.", errors: ["Please upload a CSV file."] };
  }

  const { data, errors: parseErrors } = await parseCsv(file);
  if (parseErrors.length > 0) {
    return { message: "CSV Parse Error", errors: parseErrors.map((e) => e.message) };
  }

  let successCount = 0;
  let failCount = 0;
  const failedRows: { row: number; reason: string }[] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNumber = i + 2;

    const validated = GuestSchema.safeParse(row);

    if (!validated.success) {
      failCount++;
      failedRows.push({
        row: rowNumber,
        reason: JSON.stringify(validated.error.flatten().fieldErrors),
      });
      continue;
    }

    try {
      await prisma.guest.create({
        data: {
          propertyId,
          ...validated.data,
        },
      });
      successCount++;
    } catch (error: unknown) {
      failCount++;
      failedRows.push({ row: rowNumber, reason: error instanceof Error ? error.message : "Database error." });
    }
  }

  revalidatePath(`/properties/${propertyId}/guests`);
  return {
    message: "Import complete.",
    results: { successCount, failCount, failedRows },
  };
}

export async function importRooms(
  propertyId: string,
  prevState: ImportActionState,
  formData: FormData
): Promise<ImportActionState> {
  const session = await auth();
  if (!session?.user?.email) {
    return { message: "Unauthorized", errors: ["Authentication required."] };
  }

  const file = formData.get("file") as File;
  if (!file || file.size === 0) {
    return { message: "No file selected.", errors: ["Please upload a CSV file."] };
  }

  const { data, errors: parseErrors } = await parseCsv(file);
  if (parseErrors.length > 0) {
    return { message: "CSV Parse Error", errors: parseErrors.map((e) => e.message) };
  }

  let successCount = 0;
  let failCount = 0;
  const failedRows: { row: number; reason: string }[] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNumber = i + 2; // +1 for header, +1 for 0-indexing

    const validated = RoomImportSchema.safeParse(row);

    if (!validated.success) {
      failCount++;
      failedRows.push({
        row: rowNumber,
        reason: JSON.stringify(validated.error.flatten().fieldErrors),
      });
      continue;
    }

    try {
      // Check for existing room name to prevent duplicates
      const existingRoom = await prisma.room.findFirst({
        where: { propertyId, name: validated.data.name },
      });
      if (existingRoom) {
        failCount++;
        failedRows.push({ row: rowNumber, reason: "Room with this name already exists." });
        continue;
      }

      await prisma.room.create({
        data: {
          propertyId,
          ...validated.data,
          status: "available", // Default status
        },
      });
      successCount++;
    } catch (error: unknown) {
      failCount++;
      failedRows.push({ row: rowNumber, reason: error instanceof Error ? error.message : "Database error." });
    }
  }

  revalidatePath(`/properties/${propertyId}/rooms`);
  return {
    message: "Import complete.",
    results: { successCount, failCount, failedRows },
  };
}

export async function importBookings(
  propertyId: string,
  prevState: ImportActionState,
  formData: FormData
): Promise<ImportActionState> {
  const session = await auth();
  if (!session?.user?.email) {
    return { message: "Unauthorized", errors: ["Authentication required."] };
  }

  const file = formData.get("file") as File;
  if (!file || file.size === 0) {
    return { message: "No file selected.", errors: ["Please upload a CSV file."] };
  }

  const { data, errors: parseErrors } = await parseCsv(file);
  if (parseErrors.length > 0) {
    return { message: "CSV Parse Error", errors: parseErrors.map((e) => e.message) };
  }

  let successCount = 0;
  let failCount = 0;
  const failedRows: { row: number; reason: string }[] = [];

  // Pre-fetch rooms and guests for efficiency
  const [rooms, guests] = await Promise.all([
    prisma.room.findMany({ where: { propertyId } }),
    prisma.guest.findMany({ where: { propertyId } }),
  ]);
  const roomMap = new Map(rooms.map((r) => [r.name.toLowerCase(), r]));
  const guestMap = new Map(
    guests.map((g) => [`${g.firstName?.toLowerCase()} ${g.lastName?.toLowerCase()}`, g])
  );
  const guestEmailMap = new Map(
    guests.filter(g => g.email).map((g) => [g.email!.toLowerCase(), g])
  );

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNumber = i + 2;

    const validated = BookingImportSchema.safeParse(row);

    if (!validated.success) {
      failCount++;
      failedRows.push({
        row: rowNumber,
        reason: JSON.stringify(validated.error.flatten().fieldErrors),
      });
      continue;
    }

    try {
      const { guestFirstName, guestLastName, roomName, checkIn, checkOut, status, email, phone } = validated.data;

      // Find or Create Guest
      let guest = guestEmailMap.get(email?.toLowerCase() || '') || guestMap.get(`${guestFirstName.toLowerCase()} ${guestLastName.toLowerCase()}`);
      if (!guest) {
        guest = await prisma.guest.create({
          data: {
            propertyId,
            firstName: guestFirstName,
            lastName: guestLastName,
            email: email || null,
            phone: phone || null,
          },
        });
      }

      // Find Room
      const room = roomMap.get(roomName.toLowerCase());
      if (!room) {
        failCount++;
        failedRows.push({ row: rowNumber, reason: `Room '${roomName}' not found.` });
        continue;
      }

      // Check Availability using our service
      const { isAvailable } = await checkAvailability(room.id, checkIn, checkOut);
      if (!isAvailable) {
        failCount++;
        failedRows.push({ row: rowNumber, reason: "Room fully booked for these dates." });
        continue;
      }

      // Create Booking in a transaction
      await prisma.$transaction(async (tx) => {
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        const totalAmount = room.pricePerNight * nights;

        const booking = await tx.booking.create({
          data: {
            propertyId,
            guestId: guest.id,
            checkIn,
            checkOut,
            status,
            totalAmount,
            amountPaid: 0,
            paymentStatus: "pending",
          },
        });

        await tx.bookingBed.create({
          data: {
            bookingId: booking.id,
            roomId: room.id,
            bedLabel: "Auto-Assigned",
            pricePerNight: room.pricePerNight,
          },
        });
      });
      successCount++;
    } catch (error: unknown) {
      failCount++;
      console.error('Error processing booking row:', row, error); // Log original row for debugging
      failedRows.push({ row: rowNumber, reason: error instanceof Error ? error.message : "Unknown error processing row." });
    }
  }

  revalidatePath(`/properties/${propertyId}/bookings`);
  revalidatePath(`/properties/${propertyId}/rooms`); // Rooms might be affected by imports.
  return {
    message: "Import complete.",
    results: { successCount, failCount, failedRows },
  };
}