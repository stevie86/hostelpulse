import { getBookings } from '@/app/actions/bookings';
import Link from 'next/link';
import { CancelBookingButton } from './cancel-booking-button';

export async function BookingList({ propertyId }: { propertyId: string }) {
  const bookings = await getBookings(propertyId);

  if (!bookings.length) {
    return (
      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="card-body items-center text-center py-16">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 text-primary"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>
          <h2 className="card-title text-2xl mb-2">No Bookings Yet</h2>
          <p className="text-base-content/70 max-w-md mb-6">
            Get started by creating your first booking manually or waiting for
            online reservations to come in.
          </p>
          <Link
            href={`/properties/${propertyId}/bookings/new`}
            className="btn btn-primary btn-wide"
          >
            Create First Booking
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="md:hidden space-y-4">
        {bookings.map((booking) => {
          const guestName = booking.guest
            ? `${booking.guest.firstName} ${booking.guest.lastName}`
            : 'Unknown Guest';
          const roomName = booking.beds[0]?.room.name || 'Unassigned';

          let badgeClass = 'badge-ghost';
          if (booking.status === 'confirmed')
            badgeClass = 'badge-success text-success-content';
          else if (booking.status === 'cancelled')
            badgeClass = 'badge-error badge-outline';
          else if (booking.status === 'pending')
            badgeClass = 'badge-warning text-warning-content';

          return (
            <div
              key={booking.id}
              className="card bg-base-100 shadow-sm border border-base-200"
            >
              <div className="card-body p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{guestName}</h3>
                    {booking.guest?.email && (
                      <p className="text-sm text-base-content/70">
                        {booking.guest.email}
                      </p>
                    )}
                    <p className="text-sm mt-1">{roomName}</p>
                  </div>
                  <span className={`badge ${badgeClass} capitalize`}>
                    {booking.status}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm mt-3 pt-3 border-t border-base-200">
                  <div className="flex flex-col">
                    <span className="text-xs text-base-content/70">
                      Check-in
                    </span>
                    <span className="font-medium">
                      {booking.checkIn.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs text-base-content/70">
                      Check-out
                    </span>
                    <span className="font-medium">
                      {booking.checkOut.toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-lg">
                    {new Intl.NumberFormat('en-IE', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(booking.totalAmount / 100)}
                  </span>
                </div>

                {booking.status !== 'cancelled' && (
                  <div className="card-actions mt-3">
                    <div className="w-full">
                      <CancelBookingButton
                        bookingId={booking.id}
                        propertyId={propertyId}
                        className="btn btn-outline btn-error btn-sm w-full min-h-[44px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block card bg-base-100 shadow-xl border border-base-200">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-base-200/50">
                <tr>
                  <th className="py-4 pl-6">Guest</th>
                  <th className="py-4">Room</th>
                  <th className="py-4">Check-In</th>
                  <th className="py-4">Check-Out</th>
                  <th className="py-4">Status</th>
                  <th className="py-4">Total</th>
                  <th className="py-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const guestName = booking.guest
                    ? `${booking.guest.firstName} ${booking.guest.lastName}`
                    : 'Unknown Guest';
                  const roomName = booking.beds[0]?.room.name || 'Unassigned';

                  let badgeClass = 'badge-ghost';
                  if (booking.status === 'confirmed')
                    badgeClass = 'badge-success text-success-content';
                  else if (booking.status === 'cancelled')
                    badgeClass = 'badge-error badge-outline';
                  else if (booking.status === 'pending')
                    badgeClass = 'badge-warning text-warning-content';

                  return (
                    <tr
                      key={booking.id}
                      className="hover:bg-base-200/50 transition-colors"
                    >
                      <td className="pl-6">
                        <div className="font-bold">{guestName}</div>
                        {booking.guest?.email && (
                          <div className="text-xs opacity-50">
                            {booking.guest.email}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="font-medium">{roomName}</span>
                      </td>
                      <td>{booking.checkIn.toLocaleDateString()}</td>
                      <td>{booking.checkOut.toLocaleDateString()}</td>
                      <td>
                        <span
                          className={`badge ${badgeClass} gap-1 font-medium capitalize`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="font-mono font-bold">
                        {new Intl.NumberFormat('en-IE', {
                          style: 'currency',
                          currency: 'EUR',
                        }).format(booking.totalAmount / 100)}
                      </td>
                      <td className="text-right pr-6">
                        {booking.status !== 'cancelled' && (
                          <CancelBookingButton
                            bookingId={booking.id}
                            propertyId={propertyId}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
