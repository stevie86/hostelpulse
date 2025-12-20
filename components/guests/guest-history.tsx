import { format } from 'date-fns';

type BookingWithRoom = {
  id: string;
  checkIn: Date;
  checkOut: Date;
  status: string;
  totalAmount: number;
  beds: { room: { name: string } }[];
};

export function GuestHistory({ bookings }: { bookings: BookingWithRoom[] }) {
  if (!bookings.length) {
    return (
      <div className="p-10 text-center bg-base-200 rounded-lg">
        No previous bookings found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>Dates</th>
            <th>Room</th>
            <th>Status</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>
                {format(booking.checkIn, 'MMM d, yyyy')} -{' '}
                {format(booking.checkOut, 'MMM d, yyyy')}
              </td>
              <td>{booking.beds[0]?.room.name || 'N/A'}</td>
              <td>
                <span
                  className={`badge badge-sm ${booking.status === 'confirmed' ? 'badge-success' : 'badge-ghost'}`}
                >
                  {booking.status}
                </span>
              </td>
              <td className="font-mono">
                €{(booking.totalAmount / 100).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
