import { getDailyActivity } from '@/app/actions/dashboard';
import { CheckInButton, CheckOutButton } from './activity-buttons';
import prisma from '@/lib/db';

export async function DailyActivity({ propertyId }: { propertyId: string }) {
  const { arrivals, departures } = await getDailyActivity(propertyId);

  // Get currently checked-in guests
  const checkedInGuests = await prisma.booking.findMany({
    where: {
      propertyId,
      status: 'checked_in',
    },
    include: {
      guest: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      beds: {
        select: {
          bedLabel: true,
          room: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      checkIn: 'desc',
    },
  });

  return (
    <div className="space-y-6">
      {/* Currently Checked-in Guests */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h2 className="card-title">
              Currently Checked-in Guests ({checkedInGuests.length})
            </h2>
          </div>
          {checkedInGuests.length === 0 ? (
            <p className="text-base-content/70">
              No guests currently checked in.
            </p>
          ) : (
            <div className="space-y-3">
              {checkedInGuests.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                >
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {booking.guest?.firstName} {booking.guest?.lastName}
                    </div>
                    <div className="text-sm text-base-content/70">
                      Room: {booking.beds[0]?.room.name || 'N/A'} • Bed:{' '}
                      {booking.beds[0]?.bedLabel || 'N/A'}
                    </div>
                    <div className="text-xs text-base-content/60">
                      Checked in: {booking.checkIn.toLocaleDateString()}
                    </div>
                  </div>
                  <CheckOutButton bookingId={booking.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Daily Activity */}
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
                    <div className="flex justify-between items-start">
                      <span className="flex-1">
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
                    <div className="flex justify-between items-start">
                      <span className="flex-1">
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
    </div>
  );
}
