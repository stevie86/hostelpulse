"use server";

import { AvailabilityService } from "@/lib/availability";
import { verifyPropertyAccess } from "@/lib/auth-utils";

export async function getAvailableBedsAction(
  propertyId: string,
  roomId: string,
  checkIn: string,
  checkOut: string
) {
  try {
    // await verifyPropertyAccess(propertyId);
    if (!roomId || !checkIn || !checkOut) return [];

    const beds = await AvailabilityService.getAvailableBeds(roomId, {
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
    });

    return beds;
  } catch (error) {
    console.error("Failed to fetch available beds:", error);
    return [];
  }
}
