import { getGuests } from '@/app/actions/guests';
import { getBookings } from '@/app/actions/bookings';
import Link from 'next/link';
import { GuestActions } from '@/components/guests/guest-actions';

export default async function GuestsPage({
  propertyId,
  query,
}: {
  propertyId: string;
  query?: string;
}) {
  const guests = await getGuests(propertyId, query);
  const bookings = await getBookings(propertyId, 'checked_in');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Guests</h1>
        <Link
          href={`/properties/${propertyId}/guests/new`}
          className="btn btn-primary"
        >
          Add Guest
        </Link>
      </div>

      {/* Search */}
      <div className="form-control w-full max-w-xs">
        <form>
          <input
            name="q"
            type="text"
            placeholder="Search guests..."
            className="input input-bordered w-full"
            defaultValue={query}
          />
        </form>
      </div>

      {/* Guest Management Actions */}
      <div className="bg-white rounded-xl p-6 shadow-lg border">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card text-center">
            <h3 className="text-2xl font-bold text-blue-600">
              {bookings.filter((b) => b.status === 'checked_in').length}
            </h3>
            <p className="text-sm text-base-content/70">Currently Checked In</p>
          </div>

          <div className="stat-card text-center">
            <h3 className="text-2xl font-bold text-green-600">
              {bookings.filter((b) => b.status === 'confirmed').length}
            </h3>
            <p className="text-sm text-base-content/70">Expected Arrivals</p>
          </div>

          <div className="stat-card text-center">
            <h3 className="text-2xl font-bold text-orange-600">
              {bookings.filter((b) => b.status === 'completed').length}
            </h3>
            <p className="text-sm text-base-content/70">Departed Today</p>
          </div>

          <div className="stat-card text-center">
            <h3 className="text-2xl font-bold text-purple-600">
              {guests.length}
            </h3>
            <p className="text-sm text-base-content/70">Total Guests</p>
          </div>
        </div>
      </div>

      {/* Guests Table */}
      <div className="bg-base-100 rounded-xl shadow-lg border overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Check-in</th>
              <th>Booking Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {guests.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  No guests found
                </td>
              </tr>
            ) : (
              guests.map((guest) => {
                const currentBooking = bookings.find(
                  (b) => b.guestId === guest.id
                );

                return (
                  <tr key={guest.id}>
                    <td className="font-bold">
                      {guest.firstName} {guest.lastName}
                    </td>
                    <td>{guest.email || '-'}</td>
                    <td>{guest.phone || '-'}</td>
                    <td>
                      {currentBooking?.checkIn
                        ? new Date(currentBooking.checkIn).toLocaleDateString()
                        : '-'}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          currentBooking?.status === 'checked_in'
                            ? 'badge-success'
                            : currentBooking?.status === 'completed'
                              ? 'badge-gray'
                              : 'badge-warning'
                        }`}
                      >
                        {currentBooking?.status || 'No Booking'}
                      </span>
                    </td>
                    <td>
                      <GuestActions
                        guestId={guest.id}
                        propertyId={propertyId}
                        bookingId={currentBooking?.id}
                        bookingStatus={currentBooking?.status}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
