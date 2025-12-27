'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { CalendarIcon, User, MapPin, Bed } from 'lucide-react';
import { format } from 'date-fns';
import { portugueseTaxCalculator } from '@/lib/tourist-tax-calculator';

type Room = {
  id: string;
  name: string;
  beds: number;
  pricePerNight: number;
  type: string;
  maxOccupancy: number;
};

type Guest = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
};

type ActionState = {
  message?: string | null;
  errors?: any;
};

interface BookingFormProps {
  propertyId: string;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  rooms: Room[];
  guests: Guest[];
}

export function BookingForm({
  propertyId,
  action,
  rooms,
  guests,
}: BookingFormProps) {
  const [state, formAction, isPending] = useActionState(action, {
    message: null,
    errors: {},
  });

  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const [availableBeds, setAvailableBeds] = useState<string[]>([]);
  const [selectedBed, setSelectedBed] = useState<string | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [isCheckingBeds, startCheckingBeds] = useTransition();

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const municipalities = portugueseTaxCalculator.getAllMunicipalities();

  useEffect(() => {
    if (selectedRoomId && dates.checkIn && dates.checkOut) {
      startCheckingBeds(async () => {
        try {
          const response = await fetch(
            `/api/properties/${propertyId}/availability`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                roomId: selectedRoomId,
                checkIn: dates.checkIn,
                checkOut: dates.checkOut,
              }),
            }
          );
          const data = await response.json();
          setAvailableBeds(data.availableBeds || []);
          setSelectedBed(null);
        } catch (error) {
          console.error('Error checking availability:', error);
          setAvailableBeds([]);
        }
      });
    }
  }, [selectedRoomId, dates.checkIn, dates.checkOut, propertyId]);

  const calculateBreakdown = () => {
    if (!selectedRoom || !dates.checkIn || !dates.checkOut) {
      return {
        accommodation: 0,
        touristTax: 0,
        total: 0,
        originalNights: 0,
        taxableNights: 0,
        isCapped: false,
      };
    }
    const start = new Date(dates.checkIn);
    const end = new Date(dates.checkOut);
    const originalNights = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const taxableNights = Math.min(originalNights, 7);
    const isCapped = originalNights > 7;

    const isDormitory = selectedRoom.type === 'dormitory';

    let accommodation = 0;
    if (originalNights > 0) {
      if (isDormitory) {
        accommodation =
          originalNights * guestCount * selectedRoom.pricePerNight;
      } else {
        accommodation = originalNights * selectedRoom.pricePerNight;
      }
    }

    let touristTax = 0;
    if (selectedMunicipality) {
      try {
        const taxResult = portugueseTaxCalculator.calculateTax({
          municipality: selectedMunicipality,
          checkInDate: start,
          checkOutDate: end,
          guestCount: guestCount,
        });
        touristTax = taxResult.totalTax;
      } catch (error) {
        console.warn('Tax calculation error:', error);
      }
    }

    return {
      accommodation,
      touristTax,
      total: accommodation + touristTax,
      originalNights,
      taxableNights,
      isCapped,
    };
  };

  const {
    accommodation,
    touristTax,
    total,
    originalNights,
    taxableNights,
    isCapped,
  } = calculateBreakdown();

  return (
    <div className="card bg-base-100 shadow-xl border border-base-200">
      <div className="card-body">
        <form action={formAction} className="space-y-6">
          {state?.message && (
            <div className="alert alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{state.message}</span>
            </div>
          )}

          <div className="form-control w-full">
            <div className="label">
              <span className="label-text font-semibold flex items-center gap-2">
                <Bed size={16} className="text-primary" />
                Room Selection
              </span>
            </div>
            <select
              className="select select-bordered w-full h-[3rem]"
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

          <div className="form-control w-full">
            <div className="label">
              <span className="label-text font-semibold flex items-center gap-2">
                <CalendarIcon size={16} className="text-primary" />
                Stay Duration
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  name="checkIn"
                  type="date"
                  className="input input-bordered w-full"
                  required
                  onChange={(e) =>
                    setDates({ ...dates, checkIn: e.target.value })
                  }
                />
                <div className="label">
                  <span className="label-text-alt text-base-content/60">
                    Check-in
                  </span>
                </div>
              </div>
              <div>
                <input
                  name="checkOut"
                  type="date"
                  className="input input-bordered w-full"
                  required
                  onChange={(e) =>
                    setDates({ ...dates, checkOut: e.target.value })
                  }
                />
                <div className="label">
                  <span className="label-text-alt text-base-content/60">
                    Check-out
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-control w-full">
            <div className="label">
              <span className="label-text font-semibold flex items-center gap-2">
                <User size={16} className="text-primary" />
                Guest Information
              </span>
            </div>
            <select
              name="guestId"
              className="select select-bordered w-full h-[3rem]"
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
          </div>

          <div className="form-control w-full">
            <div className="label">
              <span className="label-text font-semibold flex items-center gap-2">
                <User size={16} className="text-primary" />
                Number of Guests
              </span>
            </div>
            <input
              type="number"
              min="1"
              max={selectedRoom?.maxOccupancy || 10}
              value={guestCount}
              onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
              className="input input-bordered w-full"
              required
            />
            <div className="label">
              <span className="label-text-alt text-base-content/60">
                Required for accurate tourist tax calculation
              </span>
            </div>
          </div>

          <div className="form-control w-full">
            <div className="label">
              <span className="label-text font-semibold flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                Municipality (for Tourist Tax)
              </span>
            </div>

            <div className="alert alert-info shadow-sm mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <div>
                <h3 className="font-bold text-xs">
                  Portuguese Tourist Tax: 7-Night Legal Maximum
                </h3>
                <div className="text-xs">
                  By law (Decreto-Lei 28/2023), tourist tax cannot exceed 7
                  nights per stay.
                </div>
              </div>
            </div>

            <select
              name="municipality"
              value={selectedMunicipality}
              onChange={(e) => setSelectedMunicipality(e.target.value)}
              className="select select-bordered w-full h-[3rem]"
              required
            >
              <option value="" disabled>
                Select municipality for tax calculation...
              </option>
              {Object.entries(municipalities)
                .sort(([, a], [, b]) => a.region.localeCompare(b.region))
                .map(([key, data]) => (
                  <option key={key} value={key}>
                    {data.displayName} - €{data.rate.toFixed(2)}/night (
                    {data.region})
                  </option>
                ))}
            </select>
            <div className="label">
              <span className="label-text-alt text-base-content/60">
                Required for Portuguese tourist tax calculation (Decreto-Lei
                28/2023)
              </span>
            </div>
          </div>

          {availableBeds.length > 0 && (
            <div className="form-control w-full">
              <div className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <Bed size={16} className="text-primary" />
                  Bed Selection
                  {isCheckingBeds && (
                    <span className="loading loading-spinner loading-xs text-primary"></span>
                  )}
                </span>
              </div>
              <select
                name="bedId"
                value={selectedBed || ''}
                onChange={(e) => setSelectedBed(e.target.value)}
                className="select select-bordered w-full h-[3rem]"
                required
                disabled={isCheckingBeds}
              >
                <option value="" disabled>
                  Select an available bed...
                </option>
                {availableBeds.map((bedLabel) => (
                  <option key={bedLabel} value={bedLabel}>
                    {bedLabel}
                  </option>
                ))}
              </select>
            </div>
          )}

          {total > 0 && (
            <div className="card bg-success/10 border-success/20 border-2">
              <div className="card-body items-center text-center p-6">
                <div className="text-4xl font-bold text-success mb-2">
                  {new Intl.NumberFormat('en-IE', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(total / 100)}
                </div>
                <p className="font-bold text-success">Total Price</p>
                <p className="text-sm text-success/80 mt-1">
                  {selectedRoom?.name} •{' '}
                  {format(new Date(dates.checkIn), 'MMM d')} -{' '}
                  {format(new Date(dates.checkOut), 'MMM d')}
                </p>
                <div className="text-xs text-success/70 mt-2 space-y-1">
                  <p>Accommodation: €{(accommodation / 100).toFixed(2)}</p>
                  {touristTax > 0 && (
                    <>
                      <p>
                        Tourist Tax: €{(touristTax / 100).toFixed(2)} (
                        {municipalities[selectedMunicipality]?.displayName})
                      </p>
                      {isCapped && (
                        <div className="alert alert-warning p-2 mt-2 text-xs flex justify-center">
                          <span>
                            ⚖️ 7-Night Legal Cap Applied: Tax on {taxableNights}{' '}
                            of {originalNights} nights
                          </span>
                        </div>
                      )}
                      {!isCapped && originalNights > 0 && (
                        <p className="font-semibold">
                          ✅ Within 7-night legal limit ({originalNights}{' '}
                          nights)
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedBed || isPending}
            className="btn btn-primary w-full h-[3.5rem] text-lg shadow-lg hover:shadow-primary/30"
          >
            {isPending && <span className="loading loading-spinner"></span>}
            Confirm Reservation
          </button>
        </form>
      </div>
    </div>
  );
}
