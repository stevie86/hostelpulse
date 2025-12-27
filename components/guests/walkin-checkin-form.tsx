'use client';

import React, { useActionState, useState } from 'react';
import { createWalkInBooking } from '@/app/actions/dashboard';
import { User, Calendar, CreditCard, MapPin, FileText } from 'lucide-react';
import { portugueseTaxCalculator } from '@/lib/portuguese-tourist-tax';

interface Room {
  id: string;
  name: string;
  type: string;
  pricePerNight: number;
  maxOccupancy: number;
  status: string;
}

interface WalkInCheckInFormProps {
  propertyId: string;
  rooms: Room[];
  onSuccess?: () => void;
}

type ActionState = {
  message: string | null;
  errors: Record<string, string[]>;
};

export function WalkInCheckInForm({
  propertyId,
  rooms,
  onSuccess,
}: WalkInCheckInFormProps) {
  const [state, action, isPending] = useActionState(
    async (
      _prevState: ActionState,
      formData: FormData
    ): Promise<ActionState> => {
      const result = await createWalkInBooking(formData);
      if (result.success) {
        onSuccess?.();
        return { message: null, errors: {} };
      }
      return {
        message: result.message || 'Failed to check in guest',
        errors: result.errors || {},
      };
    },
    { message: null, errors: {} }
  );

  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [checkInDate, setCheckInDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [checkOutDate, setCheckOutDate] = useState<string>(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [guestCount, setGuestCount] = useState<number>(1);
  const [taxCalculation, setTaxCalculation] = useState<{
    amount: number;
    breakdown: {
      taxableNights: number;
      ratePerNight: number;
      totalGuests: number;
    };
  } | null>(null);

  React.useEffect(() => {
    if (checkInDate && checkOutDate && guestCount > 0) {
      const taxResult = portugueseTaxCalculator.calculateTax(
        new Date(checkInDate),
        new Date(checkOutDate),
        guestCount,
        'lisbon'
      );
      setTaxCalculation(taxResult);
    }
  }, [checkInDate, checkOutDate, guestCount]);

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId);

  const calculateTotal = () => {
    if (!selectedRoom || !checkInDate || !checkOutDate) return 0;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    const accommodationCost = selectedRoom.pricePerNight * nights;
    const taxAmount = taxCalculation?.amount || 0;

    return accommodationCost + taxAmount;
  };

  const totalAmount = calculateTotal();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <User size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-base-content">
            Walk-in Guest Check-in
          </h3>
          <p className="text-sm text-base-content/70">
            Register new guest and process check-in
          </p>
        </div>
      </div>

      {state.message && (
        <div className="alert alert-error shadow-sm">
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

      <form action={action} className="space-y-6">
        <input type="hidden" name="propertyId" value={propertyId} />
        <input type="hidden" name="selectedRoomId" value={selectedRoomId} />

        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body">
            <h4 className="card-title text-lg flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              Guest Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">First Name *</span>
                </label>
                <input
                  name="firstName"
                  required
                  placeholder="Enter first name"
                  className={`input input-bordered w-full ${state.errors.firstName ? 'input-error' : ''}`}
                />
                {state.errors.firstName && (
                  <span className="label-text-alt text-error mt-1">
                    {state.errors.firstName[0]}
                  </span>
                )}
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Last Name *</span>
                </label>
                <input
                  name="lastName"
                  required
                  placeholder="Enter last name"
                  className={`input input-bordered w-full ${state.errors.lastName ? 'input-error' : ''}`}
                />
                {state.errors.lastName && (
                  <span className="label-text-alt text-error mt-1">
                    {state.errors.lastName[0]}
                  </span>
                )}
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="guest@example.com"
                  className={`input input-bordered w-full ${state.errors.email ? 'input-error' : ''}`}
                />
                {state.errors.email && (
                  <span className="label-text-alt text-error mt-1">
                    {state.errors.email[0]}
                  </span>
                )}
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Phone</span>
                </label>
                <input
                  name="phone"
                  placeholder="+351 123 456 789"
                  className={`input input-bordered w-full ${state.errors.phone ? 'input-error' : ''}`}
                />
                {state.errors.phone && (
                  <span className="label-text-alt text-error mt-1">
                    {state.errors.phone[0]}
                  </span>
                )}
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Nationality</span>
                </label>
                <input
                  name="nationality"
                  placeholder="Portuguese"
                  className={`input input-bordered w-full ${state.errors.nationality ? 'input-error' : ''}`}
                />
                {state.errors.nationality && (
                  <span className="label-text-alt text-error mt-1">
                    {state.errors.nationality[0]}
                  </span>
                )}
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Document Type</span>
                </label>
                <select
                  name="documentType"
                  className="select select-bordered w-full"
                >
                  <option value="passport">Passport</option>
                  <option value="id_card">ID Card</option>
                  <option value="drivers_license">Driver&apos;s License</option>
                </select>
              </div>

              <div className="form-control w-full md:col-span-2">
                <label className="label">
                  <span className="label-text">Document ID *</span>
                </label>
                <input
                  name="documentId"
                  required
                  placeholder="Document number"
                  className={`input input-bordered w-full ${state.errors.documentId ? 'input-error' : ''}`}
                />
                {state.errors.documentId && (
                  <span className="label-text-alt text-error mt-1">
                    {state.errors.documentId[0]}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body">
            <h4 className="card-title text-lg flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              Stay Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Check-in Date *</span>
                </label>
                <input
                  name="checkIn"
                  type="date"
                  required
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className={`input input-bordered w-full ${state.errors.checkIn ? 'input-error' : ''}`}
                />
                {state.errors.checkIn && (
                  <span className="label-text-alt text-error mt-1">
                    {state.errors.checkIn[0]}
                  </span>
                )}
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Check-out Date *</span>
                </label>
                <input
                  name="checkOut"
                  type="date"
                  required
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className={`input input-bordered w-full ${state.errors.checkOut ? 'input-error' : ''}`}
                />
                {state.errors.checkOut && (
                  <span className="label-text-alt text-error mt-1">
                    {state.errors.checkOut[0]}
                  </span>
                )}
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Number of Guests *</span>
                </label>
                <select
                  name="guestCount"
                  value={guestCount.toString()}
                  onChange={(e) => setGuestCount(parseInt(e.target.value))}
                  className="select select-bordered w-full"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body">
            <h4 className="card-title text-lg flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              Room Selection
            </h4>

            <div className="space-y-4">
              <label className="label">
                <span className="label-text font-semibold">
                  Available Rooms
                </span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rooms
                  .filter((room) => room.status === 'available')
                  .map((room) => (
                    <div
                      key={room.id}
                      className={`border rounded-xl p-4 cursor-pointer transition-all ${
                        selectedRoomId === room.id
                          ? 'border-primary bg-primary/10 shadow-md'
                          : 'border-base-300 hover:border-primary/50 hover:bg-base-200'
                      }`}
                      onClick={() => setSelectedRoomId(room.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-bold">{room.name}</h5>
                        <div className="badge badge-primary badge-outline">
                          €{room.pricePerNight}/night
                        </div>
                      </div>
                      <p className="text-sm text-base-content/70 mb-2">
                        {room.type} • Max {room.maxOccupancy} guests
                      </p>
                      {selectedRoomId === room.id && (
                        <div className="text-xs text-primary font-bold flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Selected
                        </div>
                      )}
                    </div>
                  ))}
              </div>
              {rooms.filter((room) => room.status === 'available').length ===
                0 && (
                <div className="alert alert-warning shadow-sm">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>No rooms available for the selected dates</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedRoom && taxCalculation && (
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body">
              <h4 className="card-title text-lg flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                Billing Summary
              </h4>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Accommodation ({selectedRoom.name})</span>
                  <span className="font-mono">
                    €{selectedRoom.pricePerNight} ×{' '}
                    {Math.ceil(
                      (new Date(checkOutDate).getTime() -
                        new Date(checkInDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{' '}
                    nights
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Tourist Tax</span>
                  <span className="font-mono">
                    €{taxCalculation.amount.toFixed(2)}
                  </span>
                </div>

                <div className="divider my-2"></div>

                <div className="flex justify-between font-bold text-lg text-primary">
                  <span>Total Amount</span>
                  <span className="font-mono">€{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body">
            <h4 className="card-title text-lg flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-primary" />
              Notes
            </h4>
            <textarea
              name="notes"
              placeholder="Any special requests or notes..."
              className="textarea textarea-bordered w-full h-24"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || !selectedRoomId}
          className="btn btn-primary w-full h-[3.5rem] text-lg shadow-lg hover:shadow-primary/30"
        >
          {isPending ? (
            <span className="loading loading-spinner"></span>
          ) : (
            'Complete Check-in'
          )}
        </button>
      </form>
    </div>
  );
}
