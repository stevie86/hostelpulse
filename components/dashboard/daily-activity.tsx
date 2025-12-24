import { getDailyActivity } from '@/app/actions/dashboard';
import Link from 'next/link';
import { CheckInButton, CheckOutButton } from './activity-buttons';

export async function DailyActivity({ propertyId }: { propertyId: string }) {
  const { arrivals, departures } = await getDailyActivity(propertyId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Arrivals Today</h2>
          {arrivals.length === 0 ? (
            <p>No arrivals today.</p>
          ) : (
            <ul className="menu bg-base-200 w-full rounded-box">
              {arrivals.map((booking) => (
                <li key={booking.id}>
                  <div className="flex justify-between items-center">
                    <span>
                      Guest: {booking.guest?.firstName}{' '}
                      {booking.guest?.lastName} <br />
                      Room: {booking.beds[0]?.room.name || 'N/A'}
                    </span>
                    <CheckInButton bookingId={booking.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Departures Today</h2>
          {departures.length === 0 ? (
            <p>No departures today.</p>
          ) : (
            <ul className="menu bg-base-200 w-full rounded-box">
              {departures.map((booking) => (
                <li key={booking.id}>
                  <div className="flex justify-between items-center">
                    <span>
                      Guest: {booking.guest?.firstName}{' '}
                      {booking.guest?.lastName} <br />
                      Room: {booking.beds[0]?.room.name || 'N/A'}
                    </span>
                    <CheckOutButton bookingId={booking.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
