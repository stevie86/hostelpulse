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
  bookingStatus
}: {
  guestId: string;
  propertyId: string;
  bookingId?: string;
  bookingStatus?: string;
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuickCheckOut = async (bookingId: string) => {
    try {
      const response = await checkOut(bookingId);
      if (response.success) {
        window.location.reload();
      } else {
        throw new Error('Check-out failed');
      }
    } catch (error) {
      throw new Error(`Check-out error: ${error.message}`);
    }
  };
  
  return (
    <div className="flex gap-2">
      {/* Check-out Button */}
      {bookingId && bookingStatus === 'checked_in' && (
        <button
          onClick={() => handleQuickCheckOut(bookingId!)}
          disabled={isProcessing}
          className="btn btn-danger btn-sm"
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
      
      {/* View Invoice */}
      {bookingId && bookingStatus === 'completed' && (
        <a
          href={`/properties/${propertyId}/invoices/${bookingId}`}
          className="btn btn-ghost btn-sm"
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
