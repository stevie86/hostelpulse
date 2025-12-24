'use client';

import { useActionState } from 'react';
import { checkIn } from '@/app/actions/dashboard';
import { Button } from '@/components/ui/button';
import { Loader2, UserCheck, Bed } from 'lucide-react';
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
  }[];
  checkIn: Date;
  checkOut: Date;
}

interface CheckInFormProps {
  bookings: Booking[];
  onSuccess?: () => void;
}

type ActionState = {
  message: string | null;
  errors: Record<string, string[]>;
};

export function CheckInForm({ bookings, onSuccess }: CheckInFormProps) {
  const [state, action, isPending] = useActionState(
    async (_prevState: ActionState, formData: FormData): Promise<ActionState> => {
      const result = await checkIn(formData.get('bookingId') as string);
      if (result.success) {
        onSuccess?.();
        return { message: null, errors: {} };
      }
      return { message: 'Failed to check in guest', errors: {} };
    },
    { message: null, errors: {} }
  );

  const todayBookings = bookings.filter(booking => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(booking.checkIn);
    checkInDate.setHours(0, 0, 0, 0);
    return checkInDate.getTime() === today.getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          <UserCheck size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-base-content">Guest Check-in</h3>
          <p className="text-sm text-base-content/70">Process arrivals for today</p>
        </div>
      </div>

      {state.message && (
        <div className="alert alert-error bg-red-50 text-red-700 border-red-100">
          <span>{state.message}</span>
        </div>
      )}

      {todayBookings.length === 0 ? (
        <div className="text-center py-12 bg-base-200 rounded-xl border border-dashed border-base-300">
          <UserCheck className="mx-auto mb-4 text-base-content/40" size={48} />
          <h4 className="text-lg font-medium text-base-content/70 mb-2">No arrivals today</h4>
          <p className="text-sm text-base-content/50">All guests have been checked in or there are no bookings for today.</p>
        </div>
      ) : (
        <form action={action} className="space-y-6">
          <div className="space-y-4">
            <Label className="text-sm font-semibold">Select Guest to Check-in</Label>
            <Select name="bookingId" required>
              <SelectTrigger className="w-full h-[3rem] bg-white/50 backdrop-blur-sm">
                <SelectValue placeholder="Choose a guest..." />
              </SelectTrigger>
              <SelectContent>
                {todayBookings.map((booking) => (
                  <SelectItem key={booking.id} value={booking.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {booking.guest?.firstName} {booking.guest?.lastName}
                      </span>
                      <span className="text-xs text-base-content/60">
                        {booking.beds.map(bed => `${bed.room.name} - ${bed.bedLabel}`).join(', ')}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
            <div className="flex items-center gap-3 mb-3">
              <Bed size={16} className="text-primary" />
              <span className="text-sm font-medium text-primary">Check-in Process</span>
            </div>
            <ul className="text-sm text-base-content/80 space-y-1">
              <li>• Guest identity will be verified</li>
              <li>• Room key/access will be provided</li>
              <li>• Booking status will be updated to checked-in</li>
              <li>• Actual check-in time will be recorded</li>
            </ul>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-[3.5rem] rounded-xl text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin mr-2" /> Processing Check-in...
              </>
            ) : (
              'Check-in Guest'
            )}
          </Button>
        </form>
      )}
    </div>
  );
}