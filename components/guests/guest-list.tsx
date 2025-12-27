'use client';

import { useState, useEffect } from 'react';
import { getGuests } from '@/app/actions/guests';
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
  const [guests, setGuests] = useState<Guest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const guestsData = await getGuests(propertyId, query);
        // TODO: Implement getBookings action
        const bookingsData: Booking[] = [];
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
      {/* Header with Search */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search guests by name, email..."
            className="input input-bordered w-full"
            defaultValue={query}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const searchValue = (e.target as HTMLInputElement).value;
                if (searchValue.trim() === '') {
                  window.location.href = `/properties/${propertyId}/guests`;
                } else {
                  window.location.href = `/properties/${propertyId}/guests?q=${encodeURIComponent(searchValue)}`;
                }
              }
            }}
          />
        </div>
        <Link
          href={`/properties/${propertyId}/guests/new`}
          className="btn btn-primary"
        >
          Add Guest
        </Link>
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
                        : status === 'no_booking'
                          ? 'badge-ghost'
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
                        {status === 'no_booking'
                          ? 'No Booking'
                          : status === 'checked_in'
                            ? 'Checked In'
                            : status === 'completed'
                              ? 'Completed'
                              : status === 'confirmed'
                                ? 'Confirmed'
                                : status}
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
