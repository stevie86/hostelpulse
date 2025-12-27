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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-base-content/70 mt-1">
            Manage your reservations and guest stays.
          </p>
        </div>
        <Link
          href={`/properties/${propertyId}/bookings/new`}
          className="btn btn-primary shadow-lg shadow-primary/20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Booking
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body items-center justify-center py-20">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="mt-4 text-base-content/50">Loading bookings...</p>
            </div>
          </div>
        }
      >
        <BookingList propertyId={propertyId} />
      </Suspense>
    </div>
  );
}
