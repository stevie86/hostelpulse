import { createBooking } from '@/app/actions/bookings';
import { getGuests } from '@/app/actions/guests';
import { getRooms } from '@/app/actions/rooms';
import { BookingForm } from '@/components/bookings/booking-form';
import Link from 'next/link';

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
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="space-y-4">
        <div className="text-sm breadcrumbs text-base-content/70">
          <ul>
            <li>
              <Link href={`/properties/${propertyId}/bookings`}>Bookings</Link>
            </li>
            <li>New Booking</li>
          </ul>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href={`/properties/${propertyId}/bookings`}
            className="btn btn-circle btn-ghost btn-sm"
            aria-label="Back to bookings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create Booking
            </h1>
            <p className="text-base-content/70">
              Enter reservation details manually.
            </p>
          </div>
        </div>
      </div>

      <BookingForm
        propertyId={propertyId}
        action={createBookingWithId}
        rooms={rooms}
        guests={guests}
      />
    </div>
  );
}
