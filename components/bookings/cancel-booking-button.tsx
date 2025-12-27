'use client';

import { cancelBooking } from '@/app/actions/bookings';
import { useTransition } from 'react';

export function CancelBookingButton({
  bookingId,
  propertyId,
  className = 'btn btn-sm btn-error btn-outline',
}: {
  bookingId: string;
  propertyId: string;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    if (!confirm('Cancel this booking?')) return;
    startTransition(async () => {
      await cancelBooking(propertyId, bookingId);
    });
  };

  return (
    <button onClick={handleCancel} disabled={isPending} className={className}>
      {isPending ? (
        <span className="loading loading-spinner loading-xs"></span>
      ) : (
        'Cancel'
      )}
    </button>
  );
}
