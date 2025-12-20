import { BookingList } from '@/components/bookings/booking-list';
import Link from 'next/link';
import { Suspense } from 'react';

export default async function BookingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: propertyId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <Link
          href={`/properties/${propertyId}/bookings/new`}
          className="btn btn-primary"
        >
          New Booking
        </Link>
      </div>

      <div className="bg-base-100 rounded-box shadow">
        <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
          <BookingList propertyId={propertyId} />
        </Suspense>
      </div>
    </div>
  );
}
