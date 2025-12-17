import { createBooking } from "@/app/actions/bookings";
import { getGuests } from "@/app/actions/guests";
import { getRooms } from "@/app/actions/rooms";
import { BookingForm } from "@/components/bookings/booking-form";
import Link from "next/link";

export default async function NewBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: propertyId } = await params;

  const [rooms, guests] = await Promise.all([
    getRooms(propertyId),
    getGuests(propertyId),
  ]);

  const createBookingWithId = createBooking.bind(null, propertyId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/properties/${propertyId}/bookings`}
          className="btn btn-ghost btn-sm"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-bold">New Booking</h1>
      </div>

      <div className="bg-base-100 p-6 rounded-box shadow max-w-2xl">
        <BookingForm
          propertyId={propertyId}
          action={createBookingWithId}
          rooms={rooms}
          guests={guests}
        />
      </div>
    </div>
  );
}
