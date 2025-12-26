'use client';

import React, { useActionState, useState } from 'react';
import { createWalkInBooking } from '@/app/actions/dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Calendar, CreditCard, MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

  // Calculate taxes when dates or guest count change
  React.useEffect(() => {
    if (checkInDate && checkOutDate && guestCount > 0) {
      const taxResult = portugueseTaxCalculator.calculateTax(
        new Date(checkInDate),
        new Date(checkOutDate),
        guestCount,
        'lisbon' // Assuming Lisbon for now
      );
      setTaxCalculation(taxResult);
    }
  }, [checkInDate, checkOutDate, guestCount]);

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId);

  // Calculate total cost
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
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          <User size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-base-content">
            Walk-in Guest Check-in
          </h3>
          <p className="text-sm text-base-content/70">
            Register new guest and process check-in
          </p>
        </div>
      </div>

      {state.message && (
        <div className="alert alert-error bg-red-50 text-red-700 border-red-100">
          <span>{state.message}</span>
        </div>
      )}

      <form action={action} className="space-y-6">
        <input type="hidden" name="propertyId" value={propertyId} />
        <input type="hidden" name="selectedRoomId" value={selectedRoomId} />

        {/* Guest Information */}
        <div className="bg-base-100 rounded-xl p-6 border border-base-200">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h4 className="text-lg font-medium">Guest Information</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                required
                placeholder="Enter first name"
                className={state.errors.firstName ? 'border-red-500' : ''}
              />
              {state.errors.firstName && (
                <p className="text-sm text-red-600">
                  {state.errors.firstName[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                required
                placeholder="Enter last name"
                className={state.errors.lastName ? 'border-red-500' : ''}
              />
              {state.errors.lastName && (
                <p className="text-sm text-red-600">
                  {state.errors.lastName[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="guest@example.com"
                className={state.errors.email ? 'border-red-500' : ''}
              />
              {state.errors.email && (
                <p className="text-sm text-red-600">{state.errors.email[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="+351 123 456 789"
                className={state.errors.phone ? 'border-red-500' : ''}
              />
              {state.errors.phone && (
                <p className="text-sm text-red-600">{state.errors.phone[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                name="nationality"
                placeholder="Portuguese"
                className={state.errors.nationality ? 'border-red-500' : ''}
              />
              {state.errors.nationality && (
                <p className="text-sm text-red-600">
                  {state.errors.nationality[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type</Label>
              <Select name="documentType">
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="id_card">ID Card</SelectItem>
                  <SelectItem value="drivers_license">
                    Driver&apos;s License
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="documentId">Document ID *</Label>
              <Input
                id="documentId"
                name="documentId"
                required
                placeholder="Document number"
                className={state.errors.documentId ? 'border-red-500' : ''}
              />
              {state.errors.documentId && (
                <p className="text-sm text-red-600">
                  {state.errors.documentId[0]}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stay Details */}
        <div className="bg-base-100 rounded-xl p-6 border border-base-200">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h4 className="text-lg font-medium">Stay Details</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check-in Date *</Label>
              <Input
                id="checkIn"
                name="checkIn"
                type="date"
                required
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className={state.errors.checkIn ? 'border-red-500' : ''}
              />
              {state.errors.checkIn && (
                <p className="text-sm text-red-600">
                  {state.errors.checkIn[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOut">Check-out Date *</Label>
              <Input
                id="checkOut"
                name="checkOut"
                type="date"
                required
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className={state.errors.checkOut ? 'border-red-500' : ''}
              />
              {state.errors.checkOut && (
                <p className="text-sm text-red-600">
                  {state.errors.checkOut[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestCount">Number of Guests *</Label>
              <Select
                name="guestCount"
                value={guestCount.toString()}
                onValueChange={(value) => setGuestCount(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Room Selection */}
        <div className="bg-base-100 rounded-xl p-6 border border-base-200">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h4 className="text-lg font-medium">Room Selection</h4>
          </div>

          <div className="space-y-4">
            <Label>Available Rooms</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms
                .filter((room) => room.status === 'available')
                .map((room) => (
                  <div
                    key={room.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedRoomId === room.id
                        ? 'border-primary bg-primary/5'
                        : 'border-base-200 hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedRoomId(room.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium">{room.name}</h5>
                      <span className="text-sm text-primary font-medium">
                        €{room.pricePerNight}/night
                      </span>
                    </div>
                    <p className="text-sm text-base-content/70 mb-2">
                      {room.type} • Max {room.maxOccupancy} guests
                    </p>
                    {selectedRoomId === room.id && (
                      <div className="text-xs text-primary font-medium">
                        ✓ Selected
                      </div>
                    )}
                  </div>
                ))}
            </div>
            {rooms.filter((room) => room.status === 'available').length ===
              0 && (
              <p className="text-center text-base-content/50 py-4">
                No rooms available for the selected dates
              </p>
            )}
          </div>
        </div>

        {/* Billing Summary */}
        {selectedRoom && taxCalculation && (
          <div className="bg-base-100 rounded-xl p-6 border border-base-200">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <h4 className="text-lg font-medium">Billing Summary</h4>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Accommodation ({selectedRoom.name})</span>
                <span>
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
                <span>€{taxCalculation.amount.toFixed(2)}</span>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Amount</span>
                  <span>€{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="bg-base-100 rounded-xl p-6 border border-base-200">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            name="notes"
            placeholder="Any special requests or notes..."
            className="w-full mt-2 px-3 py-2 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={3}
          />
        </div>

        <Button
          type="submit"
          disabled={isPending || !selectedRoomId}
          className="w-full h-[3.5rem] rounded-xl text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin mr-2" /> Processing Check-in...
            </>
          ) : (
            'Complete Check-in'
          )}
        </Button>
      </form>
    </div>
  );
}
