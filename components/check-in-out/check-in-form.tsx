'use client';

import { useState } from 'react';
import {
  User,
  BedDouble,
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface CheckInFormProps {
  propertyId: string;
  guests: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  }>;
  rooms: Array<{
    id: string;
    name: string;
    type: string;
    pricePerNight: number;
  }>;
}

export function CheckInForm({ propertyId, guests, rooms }: CheckInFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [state, setState] = useState<{ error?: string; success?: boolean }>({});

  const handleDateChange = async (
    field: 'checkIn' | 'checkOut',
    value: string
  ) => {
    console.log(`Date changed: ${field} = ${value}`);
  };

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setState({});

    try {
      const response = await fetch(`/properties/${propertyId}/check-in`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.error) {
        setState({ error: result.error });
      } else {
        setState({ success: true });
        const form = document.getElementById(
          'check-in-form'
        ) as HTMLFormElement;
        form?.reset();
      }
    } catch (error) {
      setState({ error: 'Failed to check in guest' });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-base-200">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">Guest Check-In</h2>

        {state.error && (
          <div className="alert alert-error shadow-sm">
            <AlertCircle className="w-6 h-6" />
            <span>{state.error}</span>
          </div>
        )}

        {state.success && (
          <div className="alert alert-success shadow-sm text-success-content">
            <CheckCircle className="w-6 h-6" />
            <span>Guest checked in successfully!</span>
          </div>
        )}

        <form id="check-in-form" action={handleSubmit} className="space-y-6">
          <div className="form-control w-full">
            <div className="label">
              <span className="label-text font-semibold flex items-center gap-2">
                <User size={16} className="text-primary" />
                Select Guest
              </span>
            </div>
            <select
              name="guestId"
              className="select select-bordered w-full h-[3rem]"
              required
            >
              <option value="">Choose a guest...</option>
              {guests.map((guest) => (
                <option key={guest.id} value={guest.id}>
                  {guest.firstName} {guest.lastName}{' '}
                  {guest.email && `(${guest.email})`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control w-full">
            <div className="label">
              <span className="label-text font-semibold flex items-center gap-2">
                <BedDouble size={16} className="text-primary" />
                Select Room
              </span>
            </div>
            <select
              name="roomId"
              className="select select-bordered w-full h-[3rem]"
              required
            >
              <option value="">Choose a room...</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} - {room.type} (€{room.pricePerNight}/night)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control w-full">
              <div className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  Check-In Date
                </span>
              </div>
              <input
                type="date"
                name="checkInDate"
                className="input input-bordered w-full"
                required
                onChange={(e) => handleDateChange('checkIn', e.target.value)}
              />
            </div>

            <div className="form-control w-full">
              <div className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  Check-Out Date
                </span>
              </div>
              <input
                type="date"
                name="checkOutDate"
                className="input input-bordered w-full"
                required
                onChange={(e) => handleDateChange('checkOut', e.target.value)}
              />
            </div>
          </div>

          <div className="form-control w-full">
            <div className="label">
              <span className="label-text font-semibold flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                Notes (Optional)
              </span>
            </div>
            <textarea
              name="notes"
              className="textarea textarea-bordered h-24"
              placeholder="Special requests or notes..."
            />
          </div>

          <div className="form-control mt-6">
            <button
              type="submit"
              className="btn btn-primary w-full h-[3.5rem] text-lg shadow-lg hover:shadow-primary/30"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Checking In...
                </>
              ) : (
                'Check-In Guest'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
