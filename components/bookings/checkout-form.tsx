'use client';

import { useActionState } from 'react';
import { checkOut } from '@/app/actions/dashboard';
import { Button } from '@/components/ui/button';
import { Loader2, UserX, Receipt } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Booking {
  id: string;
  guest: {
    firstName: string;
    lastName: string;
    email: string | null;
  } | null;
  beds: {
    bedLabel: string;
    room: {
      name: string;
    };
    pricePerNight: number;
  }[];
  checkIn: Date;
  checkOut: Date;
  totalAmount: number;
  amountPaid: number;
  status: string;
}

interface CheckOutFormProps {
  bookings: Booking[];
  cityTaxRate: number;
  onSuccess?: () => void;
}

type ActionState = {
  message: string | null;
  errors: Record<string, string[]>;
};

export function CheckOutForm({ bookings, cityTaxRate, onSuccess }: CheckOutFormProps) {
  const [state, action, isPending] = useActionState(
    async (_prevState: ActionState, formData: FormData): Promise<ActionState> => {
      const result = await checkOut(formData.get('bookingId') as string);
      if (result.success) {
        onSuccess?.();
        return { message: null, errors: {} };
      }
      return { message: 'Failed to check out guest', errors: {} };
    },
    { message: null, errors: {} }
  );

  const checkedInBookings = bookings.filter(booking => booking.status === 'checked_in');

  const calculateCheckout = (booking: Booking) => {
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate accommodation cost
    const accommodationCost = booking.beds.reduce((total, bed) => total + (bed.pricePerNight * nights), 0);

    // Calculate city tax (per person per night)
    const cityTax = cityTaxRate * nights * booking.beds.length;

    // Total amount due
    const totalDue = accommodationCost + cityTax;

    // Amount outstanding
    const outstanding = totalDue - booking.amountPaid;

    return {
      nights,
      accommodationCost,
      cityTax,
      totalDue,
      outstanding
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          <UserX size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-base-content">Guest Check-out</h3>
          <p className="text-sm text-base-content/70">Process departures and finalize payments</p>
        </div>
      </div>

      {state.message && (
        <div className="alert alert-error bg-red-50 text-red-700 border-red-100">
          <span>{state.message}</span>
        </div>
      )}

      {checkedInBookings.length === 0 ? (
        <div className="text-center py-12 bg-base-200 rounded-xl border border-dashed border-base-300">
          <UserX className="mx-auto mb-4 text-base-content/40" size={48} />
          <h4 className="text-lg font-medium text-base-content/70 mb-2">No guests to check out</h4>
          <p className="text-sm text-base-content/50">All current guests have already checked out.</p>
        </div>
      ) : (
        <form action={action} className="space-y-6">
          <div className="space-y-4">
            <Label className="text-sm font-semibold">Select Guest to Check-out</Label>
            <Select name="bookingId" required>
              <SelectTrigger className="w-full h-[3rem] bg-white/50 backdrop-blur-sm">
                <SelectValue placeholder="Choose a guest..." />
              </SelectTrigger>
              <SelectContent>
                {checkedInBookings.map((booking) => {
                  const checkout = calculateCheckout(booking);
                  return (
                    <SelectItem key={booking.id} value={booking.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {booking.guest?.firstName} {booking.guest?.lastName}
                        </span>
                        <span className="text-xs text-base-content/60">
                          {booking.beds.map(bed => `${bed.room.name} - ${bed.bedLabel}`).join(', ')}
                        </span>
                        <span className="text-xs text-amber-600 font-medium">
                          Due: €{(checkout.outstanding / 100).toFixed(2)}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Checkout Summary - This would be shown after selection in a real implementation */}
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
            <div className="flex items-center gap-3 mb-3">
              <Receipt size={16} className="text-primary" />
              <span className="text-sm font-medium text-primary">Check-out Process</span>
            </div>
            <ul className="text-sm text-base-content/80 space-y-1">
              <li>• Final bill calculation including city tax</li>
              <li>• Payment processing for outstanding amounts</li>
              <li>• Room key collection</li>
              <li>• Booking status will be updated to completed</li>
              <li>• Actual check-out time will be recorded</li>
            </ul>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-[3.5rem] rounded-xl text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin mr-2" /> Processing Check-out...
              </>
            ) : (
              'Check-out Guest'
            )}
          </Button>
        </form>
      )}
    </div>
  );
}