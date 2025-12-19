import { getBookings, cancelBooking } from "@/app/actions/bookings";
import Link from "next/link";
import { CancelBookingButton } from "./cancel-booking-button";

export async function BookingList({ propertyId }: { propertyId: string }) {
  const bookings = await getBookings(propertyId);

  if (!bookings.length) {
    return (
      <div className="text-center py-10 bg-base-200 rounded-lg">
        <h3 className="font-bold text-lg">No Bookings Yet</h3>
        <Link
          href={`/properties/${propertyId}/bookings/new`}
          className="btn btn-primary mt-4"
        >
          Create First Booking
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Guest</th>
            <th>Room</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Status</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => {
            const guestName = booking.guest
              ? `${booking.guest.firstName} ${booking.guest.lastName}`
              : "Unknown Guest";
            const roomName = booking.beds[0]?.room.name || "Unassigned";

            return (
              <tr key={booking.id}>
                <td className="font-bold">{guestName}</td>
                <td>{roomName}</td>
                <td>{booking.checkIn.toLocaleDateString()}</td>
                <td>{booking.checkOut.toLocaleDateString()}</td>
                <td>
                  <span
                    className={`badge ${
                      booking.status === "confirmed"
                        ? "badge-success"
                        : booking.status === "cancelled"
                        ? "badge-ghost"
                        : "badge-warning"
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td>
                  {new Intl.NumberFormat("en-IE", {
                    style: "currency",
                    currency: "EUR",
                  }).format(booking.totalAmount / 100)}
                </td>
                <td>
                  {booking.status !== "cancelled" && (
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
  );
}
