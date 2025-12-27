'use client';

interface GuestActionsProps {
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

  const handleCheckOut = async () => {
    if (!bookingId) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('bookingId', bookingId);

      const response = await fetch(`/properties/${propertyId}/api/check-out`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        window.location.reload();
      } else {
        throw new Error('Check-out failed');
      }
    } catch (error) {
      console.error('Check-out error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Check-in Button */}
      {!bookingId && bookingStatus === 'confirmed' && (
        <a
          href={`/properties/${propertyId}/check-in-out#checkin?guestId=${guestId}`}
          className="btn btn-primary btn-sm"
        >
          Check-in
        </a>
      )}

      {/* Check-out Button */}
      {bookingId && bookingStatus === 'checked_in' && (
        <button
          onClick={handleCheckOut}
          disabled={isProcessing}
          className="btn btn-secondary btn-sm"
          title="Check-out Guest"
        >
          {isProcessing ? 'Processing...' : 'Check-out'}
        </button>
      )}

      {/* Edit Guest */}
      <a
        href={`/properties/${propertyId}/guests/${guestId}`}
        className="btn btn-ghost btn-sm"
        title="Edit Guest"
      >
        ✏️
      </a>

      {/* View Invoice */}
      {bookingId && bookingStatus === 'completed' && (
        <a
          href={`/properties/${propertyId}/invoices/${bookingId}`}
          className="btn btn-ghost btn-sm"
          title="View Invoice"
        >
          📄
        </a>
      )}

      {/* Record Payment */}
      {bookingId && bookingStatus !== 'completed' && (
        <button className="btn btn-ghost btn-sm" title="Record Payment">
          💳
        </button>
      )}
    </div>
  );
}
