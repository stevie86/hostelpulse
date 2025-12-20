'use client';

import { cancelBooking } from '@/app/actions/bookings';
import { useTransition } from 'react';

export function CancelBookingButton({
  bookingId,
  propertyId,
}: {
  bookingId: string;
  propertyId: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    if (!confirm('Cancel this booking?')) return;
    startTransition(async () => {
      await cancelBooking(propertyId, bookingId);
    });
  };

  return (
    <button
      onClick={handleCancel}
      disabled={isPending}
      className="btn btn-xs btn-error btn-outline"
    >
      Cancel
    </button>
  );
}
