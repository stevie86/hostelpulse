'use client';

import { useState } from 'react';
import { LogOut, Edit, CreditCard } from 'lucide-react';

export interface GuestActionsProps {
  guestId: string;
  propertyId: string;
  bookingId?: string;
  bookingStatus?: string;
}

export default function GuestActions({
  guestId,
  propertyId,
  bookingId,
  bookingStatus,
}: GuestActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuickCheckOut = async (bookingId: string) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('bookingId', bookingId);
      formData.append('finalAmount', '0');
      formData.append('paymentMethod', 'cash');
      formData.append('paymentStatus', 'pending');

      const response = await fetch('/api/check-out', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('Check-out failed');
      }
    } catch (error) {
      console.error('Check-out error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex gap-2">
      {bookingId && bookingStatus === 'checked_in' && (
        <button
          onClick={() => handleQuickCheckOut(bookingId)}
          disabled={isProcessing}
          className="btn btn-danger btn-sm"
          title="Check out immediately"
        >
          <LogOut className="w-4 h-4" /> Check Out
        </button>
      )}

      {/* Edit Guest */}
      <a
        href={`/properties/${propertyId}/guests/${guestId}`}
        className="btn btn-ghost btn-sm"
      >
        <Edit className="w-4 h-4" />
      </a>

      {/* Invoice */}
      {bookingId && (
        <a
          href={`/properties/${propertyId}/invoices/${bookingId}`}
          className="btn btn-ghost btn-sm"
        >
          <CreditCard className="w-4 h-4" />
          📄
        </a>
      )}

      {/* Payment */}
      {bookingId && bookingStatus !== 'completed' && (
        <button className="btn btn-ghost btn-sm" title="Record Payment">
          💳
        </button>
      )}
    </div>
  );
}
