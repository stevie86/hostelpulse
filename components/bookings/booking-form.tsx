'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, Loader2, User, MapPin, Bed } from 'lucide-react';
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

  // Auto-fetch beds when room or dates change
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
    const taxableNights = Math.min(originalNights, 7); // 7-night legal cap
    const isCapped = originalNights > 7;

    // Hostel pricing logic: dorms = per person, private rooms = per room
    const isDormitory = selectedRoom.type === 'dormitory';

    let accommodation = 0;
    if (originalNights > 0) {
      if (isDormitory) {
        // Dorms: charge per person × guest count
        accommodation =
          originalNights * guestCount * selectedRoom.pricePerNight;
      } else {
        // Private rooms: charge per room (flat rate)
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
    <form
      action={formAction}
      className="space-y-4 max-w-2xl mx-auto px-4 sm:px-6"
    >
      {state?.message && (
        <div className="alert alert-error">
          <span>{state.message}</span>
        </div>
      )}
      {/* Room Selection */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold flex items-center gap-2">
          <Bed size={16} className="text-primary" />
          Room Selection
        </Label>
        <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
          <SelectTrigger className="w-full h-[3rem] bg-white/50 backdrop-blur-sm">
            <SelectValue placeholder="Select a room..." />
          </SelectTrigger>
          <SelectContent>
            {rooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                {room.name} ({room.beds} beds) - €
                {(room.pricePerNight / 100).toFixed(2)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Selection */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold flex items-center gap-2">
          <CalendarIcon size={16} className="text-primary" />
          Stay Duration
        </Label>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-2">
          <div className="sm:flex-1">
            <input
              name="checkIn"
              type="date"
              className="input input-bordered w-full bg-white/50 backdrop-blur-sm focus:border-primary transition-all text-sm min-h-[3rem]"
              required
              onChange={(e) => setDates({ ...dates, checkIn: e.target.value })}
            />
            <div className="text-xs text-gray-500 mt-1">Check-in</div>
          </div>
          <div className="sm:flex-1">
            <input
              name="checkOut"
              type="date"
              className="input input-bordered w-full bg-white/50 backdrop-blur-sm focus:border-primary transition-all text-sm min-h-[3rem]"
              required
              onChange={(e) => setDates({ ...dates, checkOut: e.target.value })}
            />
            <div className="text-xs text-gray-500 mt-1">Check-out</div>
          </div>
        </div>
      </div>

      {/* Guest Selection */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold flex items-center gap-2">
          <User size={16} className="text-primary" />
          Guest Information
        </Label>
        <Select name="guestId" required>
          <SelectTrigger className="w-full h-[3rem] bg-white/50 backdrop-blur-sm">
            <SelectValue placeholder="Select a guest..." />
          </SelectTrigger>
          <SelectContent>
            {guests.map((guest) => (
              <SelectItem key={guest.id} value={guest.id}>
                {guest.firstName} {guest.lastName}{' '}
                {guest.email ? `(${guest.email})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Guest Count for Tax Calculation */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold flex items-center gap-2">
          <User size={16} className="text-primary" />
          Number of Guests
        </Label>
        <input
          type="number"
          min="1"
          max={selectedRoom?.maxOccupancy || 10}
          value={guestCount}
          onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
          className="input input-bordered w-full bg-white/50 backdrop-blur-sm"
          required
        />
        <p className="text-xs text-base-content/60">
          Required for accurate tourist tax calculation
        </p>
      </div>

      {/* Municipality Selection for Tax Calculation */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold flex items-center gap-2">
          <MapPin size={16} className="text-primary" />
          Municipality (for Tourist Tax)
        </Label>

        {/* 7-Night Legal Cap Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="text-blue-600 text-sm">ℹ️</div>
            <div className="text-xs text-blue-700">
              <p className="font-medium mb-1">
                Portuguese Tourist Tax: 7-Night Legal Maximum
              </p>
              <p>
                By law (Decreto-Lei 28/2023), tourist tax cannot exceed 7 nights
                per stay, regardless of actual stay duration. This protects
                guests from excessive taxation on long stays.
              </p>
            </div>
          </div>
        </div>
        <Select
          name="municipality"
          value={selectedMunicipality}
          onValueChange={setSelectedMunicipality}
          required
        >
          <SelectTrigger className="w-full h-[3rem] bg-white/50 backdrop-blur-sm">
            <SelectValue placeholder="Select municipality for tax calculation..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(municipalities)
              .sort(([, a], [, b]) => a.region.localeCompare(b.region))
              .map(([key, data]) => (
                <SelectItem key={key} value={key}>
                  {data.displayName} - €{data.rate.toFixed(2)}/night (
                  {data.region})
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-base-content/60">
          Required for Portuguese tourist tax calculation (Decreto-Lei 28/2023)
        </p>
      </div>

      {/* Bed Selection */}
      {availableBeds.length > 0 && (
        <div className="space-y-4">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Bed size={16} className="text-primary" />
            Bed Selection
          </Label>
          <Select value={selectedBed || ''} onValueChange={setSelectedBed}>
            <SelectTrigger className="w-full h-[3rem] bg-white/50 backdrop-blur-sm">
              <SelectValue placeholder="Select an available bed..." />
            </SelectTrigger>
            <SelectContent>
              {availableBeds.map((bedLabel) => (
                <SelectItem key={bedLabel} value={bedLabel}>
                  {bedLabel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Simple Total Display */}
      {total > 0 && (
        <div className="p-6 bg-green-50 border-2 border-green-200 rounded-2xl animate-in zoom-in-95 duration-300">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-700 mb-2">
              💰{' '}
              {new Intl.NumberFormat('en-IE', {
                style: 'currency',
                currency: 'EUR',
              }).format(total / 100)}
            </div>
            <p className="text-green-600 font-medium">Total Price</p>
            <p className="text-sm text-green-500 mt-1">
              {selectedRoom?.name} • {format(new Date(dates.checkIn), 'MMM d')}{' '}
              - {format(new Date(dates.checkOut), 'MMM d')}
            </p>
            <div className="text-xs text-green-400 mt-2 space-y-1">
              <p>💰 Accommodation: €{(accommodation / 100).toFixed(2)}</p>
              {touristTax > 0 && (
                <>
                  <p>
                    🏛️ Tourist Tax: €{(touristTax / 100).toFixed(2)} (
                    {municipalities[selectedMunicipality]?.displayName})
                  </p>
                  {isCapped && (
                    <div className="bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-2">
                      <p className="text-amber-700 font-medium text-xs">
                        ⚖️ 7-Night Legal Cap Applied
                      </p>
                      <p className="text-amber-600 text-xs">
                        Stay: {originalNights} nights → Tax calculated on{' '}
                        {taxableNights} nights
                      </p>
                      <p className="text-amber-600 text-xs">
                        Decree-Law 28/2023 - Maximum 7 nights taxable
                      </p>
                    </div>
                  )}
                  {!isCapped && originalNights > 0 && (
                    <p className="text-green-600 text-xs">
                      ✅ Within 7-night legal limit ({originalNights} nights)
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={!selectedBed}
        className="w-full h-[3.5rem] rounded-xl text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
      >
        Confirm Reservation
      </Button>
    </form>
  );
}
