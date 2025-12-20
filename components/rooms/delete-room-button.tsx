'use client';

import { deleteRoom } from '@/app/actions/rooms';
import { useState, useTransition } from 'react';

export function DeleteRoomButton({
  roomId,
  propertyId,
}: {
  roomId: string;
  propertyId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    if (
      !confirm(
        'Are you sure you want to delete this room? This action cannot be undone.'
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteRoom(roomId, propertyId);
      } catch (e) {
        setError('Failed to delete room. It may have active bookings.');
        alert('Failed to delete room. It may have active bookings.');
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="btn btn-sm btn-error btn-outline"
    >
      {isPending ? '...' : 'Delete'}
    </button>
  );
}
