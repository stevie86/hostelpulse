'use client';

import { useTransition } from 'react';
import { checkIn, checkOut } from '@/app/actions/dashboard';

interface GuestDetails {
  firstName: string;
  lastName: string;
}

interface RoomDetails {
  name: string; // Room name
}

interface BookingBedDetails {
  room: RoomDetails;
}

interface BookingDetails {
  id: string;
  checkIn: Date;
  checkOut: Date;
  status: string;
  guest: GuestDetails | null;
  beds: BookingBedDetails[];
}

interface ActivityListProps {
  arrivals: BookingDetails[];
  departures: BookingDetails[];
}

export function ActivityList({ arrivals, departures }: ActivityListProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Arrivals Today ({arrivals.length})</h2>
        {arrivals.length === 0 ? (
          <p>No arrivals scheduled for today.</p>
        ) : (
          <ul className="space-y-4">
            {arrivals.map((booking) => (
              <li key={booking.id} className="card bg-base-100 shadow-md p-4">
                <p className="font-bold">
                  {booking.guest ? `${booking.guest.firstName} ${booking.guest.lastName}` : 'N/A'}
                </p>
                <p>
                  Room:{' '}
                  {booking.beds.map((bed) => bed.room.name).join(', ')}
                </p>
                <p>Status: {booking.status}</p>
                {booking.status !== 'checked_in' && (
                  <button
                    className="btn btn-primary btn-sm mt-2"
                    onClick={() => startTransition(() => checkIn(booking.id))}
                    disabled={isPending}
                  >
                    {isPending ? 'Checking In...' : 'Check In'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Departures Today ({departures.length})</h2>
        {departures.length === 0 ? (
          <p>No departures scheduled for today.</p>
        ) : (
          <ul className="space-y-4">
            {departures.map((booking) => (
              <li key={booking.id} className="card bg-base-100 shadow-md p-4">
                <p className="font-bold">
                  {booking.guest ? `${booking.guest.firstName} ${booking.guest.lastName}` : 'N/A'}
                </p>
                <p>
                  Room:{' '}
                  {booking.beds.map((bed) => bed.room.name).join(', ')}
                </p>
                <p>Status: {booking.status}</p>
                {booking.status !== 'checked_out' && (
                  <button
                    className="btn btn-secondary btn-sm mt-2"
                    onClick={() => startTransition(() => checkOut(booking.id))}
                    disabled={isPending}
                  >
                    {isPending ? 'Checking Out...' : 'Check Out'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}