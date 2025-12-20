'use client';

import { ActionState } from '@/app/actions/bookings';
import { useSearchParams } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';

// Define simpler props types to avoid full Prisma dependency on client
type Room = { id: string; name: string; beds: number; pricePerNight: number };
type Guest = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
};

interface BookingFormProps {
  propertyId: string;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  rooms: Room[];
  guests: Guest[];
}

export function BookingForm({ action, rooms, guests }: BookingFormProps) {
  const searchParams = useSearchParams();
  const initialRoomId = searchParams.get('roomId') || '';

  const [state, formAction, isPending] = useActionState(action, {
    message: null,
    errors: {},
  });

  // Client-side Price Calc
  const [selectedRoomId, setSelectedRoomId] = useState<string>(initialRoomId);
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });

  useEffect(() => {
    if (initialRoomId) {
      setSelectedRoomId(initialRoomId);
    }
  }, [initialRoomId]);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  const calculateTotal = () => {
    if (!selectedRoom || !dates.checkIn || !dates.checkOut) return 0;
    const start = new Date(dates.checkIn);
    const end = new Date(dates.checkOut);
    const nights = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return nights > 0 ? nights * selectedRoom.pricePerNight : 0;
  };

  const total = calculateTotal();

  return (
    <form action={formAction} className="space-y-6">
      {state.message && (
        <div className="alert alert-error">
          <span>{state.message}</span>
        </div>
      )}

      {/* Dates */}
      <div className="flex gap-4">
        <div className="form-control w-1/2">
          <label className="label">Check-In</label>
          <input
            name="checkIn"
            type="date"
            className="input input-bordered w-full"
            required
            onChange={(e) => setDates({ ...dates, checkIn: e.target.value })}
          />
        </div>
        <div className="form-control w-1/2">
          <label className="label">Check-Out</label>
          <input
            name="checkOut"
            type="date"
            className="input input-bordered w-full"
            required
            onChange={(e) => setDates({ ...dates, checkOut: e.target.value })}
          />
        </div>
      </div>

      {/* Room */}
      <div className="form-control">
        <label className="label">Room</label>
        <select
          name="roomId"
          className="select select-bordered w-full"
          required
          value={selectedRoomId}
          onChange={(e) => setSelectedRoomId(e.target.value)}
        >
          <option value="" disabled>
            Select a room...
          </option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name} ({room.beds} beds) - €
              {(room.pricePerNight / 100).toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      {/* Guest */}
      <div className="form-control">
        <label className="label">Guest</label>
        <select
          name="guestId"
          className="select select-bordered w-full"
          required
          defaultValue=""
        >
          <option value="" disabled>
            Select a guest...
          </option>
          {guests.map((guest) => (
            <option key={guest.id} value={guest.id}>
              {guest.firstName} {guest.lastName}{' '}
              {guest.email ? `(${guest.email})` : ''}
            </option>
          ))}
        </select>
        <label className="label">
          <span className="label-text-alt">
            Don&apos;t see the guest?{' '}
            <a href="#" className="link">
              Create new guest
            </a>{' '}
            (Go back)
          </span>
        </label>
      </div>

      {/* Summary */}
      {total > 0 && (
        <div className="stats shadow w-full bg-base-200">
          <div className="stat">
            <div className="stat-title">Total Price</div>
            <div className="stat-value text-primary">
              {new Intl.NumberFormat('en-IE', {
                style: 'currency',
                currency: 'EUR',
              }).format(total / 100)}
            </div>
            <div className="stat-desc">For {selectedRoom?.name}</div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary w-full"
      >
        {isPending ? 'Booking...' : 'Confirm Booking'}
      </button>
    </form>
  );
}
