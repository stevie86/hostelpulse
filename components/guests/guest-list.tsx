import { getGuests } from '@/app/actions/guests';
import { getBookings } from '@/app/actions/bookings';
import Link from 'next/link';

// Define interfaces for type safety
interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  currency: string;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  documentType: string | null;
}

interface Booking {
  id: string;
  propertyId: string;
  guestId: string;
  status: string;
  checkIn?: Date;
  checkOut?: Date;
  totalAmount: number;
  accommodationAmount: number;
  createdAt: Date;
  updatedAt: Date;
  currency: string;
}

interface GuestListProps {
  propertyId: string;
  query?: string;
}

export default function GuestList({ propertyId, query }: GuestListProps) {
  const [guests, setGuests] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [guestsData, bookingsData] = await Promise.all([
          getGuests(propertyId, query),
          getBookings(propertyId, 'checked_in'),
        ]);
        setGuests(guestsData);
        setBookings(bookingsData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [propertyId, query]);

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

      {/* Guest Table */}
      <div className="bg-base-100 rounded-xl shadow-lg border overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
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
                const status = currentBooking?.status || 'no_booking';
                const statusColor =
                  status === 'checked_in'
                    ? 'badge-success'
                    : status === 'completed'
                      ? 'badge-gray'
                      : status === 'confirmed'
                        ? 'badge-warning'
                        : 'badge-info';

                return (
                  <tr key={guest.id}>
                    <td className="font-bold">
                      {guest.firstName} {guest.lastName}
                    </td>
                    <td>{guest.email || '-'}</td>
                    <td>{guest.phone || '-'}</td>
                    <td>
                      <span className={`badge ${statusColor}`}>
                        {status || 'No Booking'}
                      </span>
                    </td>
                    <td className="text-right">
                      {/* Simple edit action */}
                      <Link
                        href={`/properties/${propertyId}/guests/${guest.id}`}
                        className="btn btn-ghost btn-sm"
                      >
                        Edit
                      </Link>
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
