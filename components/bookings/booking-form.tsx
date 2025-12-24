'use client';

import { ActionState } from '@/app/actions/bookings';
import { getAvailableBedsAction } from '@/app/actions/availability';
import { useSearchParams } from 'next/navigation';
import { useActionState, useEffect, useState, useTransition } from 'react';
import { BedPulseCard } from '@/components/rooms/bed-pulse-card';
import { CalendarIcon, Loader2, User, Home, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

export function BookingForm({
  propertyId,
  action,
  rooms,
  guests,
}: BookingFormProps) {
  const searchParams = useSearchParams();
  const initialRoomId = searchParams.get('roomId') || '';

  const [state, formAction, isPending] = useActionState(action, {
    message: null,
    errors: {},
  });

  const [selectedRoomId, setSelectedRoomId] = useState<string>(initialRoomId);
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const [availableBeds, setAvailableBeds] = useState<string[]>([]);
  const [selectedBed, setSelectedBed] = useState<string | null>(null);
  const [isCheckingBeds, startCheckingBeds] = useTransition();

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  // Auto-fetch beds when room or dates change
  useEffect(() => {
    if (selectedRoomId && dates.checkIn && dates.checkOut) {
      startCheckingBeds(async () => {
        const beds = await getAvailableBedsAction(
          propertyId,
          selectedRoomId,
          dates.checkIn,
          dates.checkOut
        );
        setAvailableBeds(beds);
        setSelectedBed(null); // Reset selection
      });
    }
  }, [selectedRoomId, dates.checkIn, dates.checkOut, propertyId]);

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
    <form action={formAction} className="space-y-8">
      {state.message && (
        <div className="alert alert-error bg-red-50 text-red-700 border-red-100 mb-6">
          <span>{state.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Selection */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <CalendarIcon size={16} className="text-primary" />
            Stay Duration
          </Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                name="checkIn"
                type="date"
                className="input input-bordered w-full bg-white/50 backdrop-blur-sm focus:border-primary transition-all"
                required
                onChange={(e) => setDates({ ...dates, checkIn: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <input
                name="checkOut"
                type="date"
                className="input input-bordered w-full bg-white/50 backdrop-blur-sm focus:border-primary transition-all"
                required
                onChange={(e) =>
                  setDates({ ...dates, checkOut: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Room Selection */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Home size={16} className="text-primary" />
            Room Type
          </Label>
          <Select
            name="roomId"
            defaultValue={initialRoomId}
            onValueChange={(value) => setSelectedRoomId(value)}
          >
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
      </div>

      {/* Bed Selection - Interactive Layer */}
      {selectedRoomId && (
        <div className="space-y-4 p-6 bg-base-200 rounded-2xl border border-base-300 animate-in fade-in slide-in-from-top-4">
          <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
            <CreditCard size={16} className="text-primary" />
            Select a Bed
            {isCheckingBeds && <Loader2 className="animate-spin size-4 ml-2 text-primary" />}
          </Label>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {isCheckingBeds ? (
              <div className="col-span-full py-10 flex flex-col items-center justify-center text-base-content/60 gap-2">
                <Loader2 className="animate-spin" />
                <span className="text-xs">Checking availability...</span>
              </div>
            ) : availableBeds.length > 0 ? (
              availableBeds.map((bedLabel) => (
                <div 
                  key={bedLabel} 
                  onClick={() => setSelectedBed(bedLabel)}
                  className={`cursor-pointer transition-all ${selectedBed === bedLabel ? 'ring-2 ring-primary ring-offset-2 rounded-xl' : ''}`}
                >
                  <BedPulseCard label={bedLabel} status="available" />
                </div>
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-base-content/70 bg-base-100 rounded-xl border border-dashed border-base-300">
                No beds available for these dates.
              </div>
            )}
          </div>
          <input type="hidden" name="bedLabel" value={selectedBed || ''} />
        </div>
      )}

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

      {/* Summary Stat */}
      {total > 0 && (
        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 flex justify-between items-center animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-xs text-primary/60 font-medium uppercase tracking-wider">Estimated Total</p>
              <p className="text-2xl font-bold text-base-content">
                {new Intl.NumberFormat('en-IE', {
                  style: 'currency',
                  currency: 'EUR',
                }).format(total / 100)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-base-content">{selectedRoom?.name}</p>
            <p className="text-xs text-base-content/70">{format(new Date(dates.checkIn), 'MMM d')} - {format(new Date(dates.checkOut), 'MMM d')}</p>
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending || !selectedBed}
        className="w-full h-[3.5rem] rounded-xl text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
      >
        {isPending ? (
          <>
            <Loader2 className="animate-spin mr-2" /> Processing...
          </>
        ) : (
          'Confirm Reservation'
        )}
      </Button>
    </form>
  );
}