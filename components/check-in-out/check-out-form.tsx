'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  Euro,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface CheckOutFormProps {
  booking: {
    id: string;
    guest: { firstName: string; lastName: string };
    room?: { id?: string; name: string; type: string };
    checkIn: string;
    totalAmount: number;
  };
  propertyId: string;
}

export function CheckOutForm({ booking, propertyId }: CheckOutFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [state, setState] = useState<{ error?: string; success?: boolean }>({});
  const [finalAmount, setFinalAmount] = useState(booking.totalAmount / 100);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setState({});

    try {
      const response = await fetch(`/api/check-out`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.error) {
        setState({ error: result.error });
      } else {
        setState({ success: true });
        window.location.href = `/properties/${propertyId}/check-in-out`;
      }
    } catch (error) {
      setState({ error: 'Failed to check out guest' });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-base-200">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">Guest Check-Out</h2>

        <div className="bg-base-200/50 p-6 rounded-xl border border-base-200 mb-6 space-y-2">
          <h3 className="font-bold text-lg mb-3">Booking Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="font-semibold text-base-content/70">Guest:</span>{' '}
              {booking.guest.firstName} {booking.guest.lastName}
            </div>
            <div>
              <span className="font-semibold text-base-content/70">Room:</span>{' '}
              {booking.room?.name || 'Unknown'} (
              {booking.room?.type || 'Unknown'})
            </div>
            <div>
              <span className="font-semibold text-base-content/70">
                Check-In:
              </span>{' '}
              {mounted
                ? new Date(booking.checkIn).toLocaleDateString()
                : new Date(booking.checkIn).toISOString().split('T')[0]}
            </div>
            <div>
              <span className="font-semibold text-base-content/70">
                Current Amount:
              </span>{' '}
              <span className="font-mono">
                €{(booking.totalAmount / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {state.error && (
          <div className="alert alert-error shadow-sm">
            <AlertCircle className="w-6 h-6" />
            <span>{state.error}</span>
          </div>
        )}

        {state.success && (
          <div className="alert alert-success shadow-sm text-success-content">
            <CheckCircle className="w-6 h-6" />
            <span>Guest checked out successfully!</span>
          </div>
        )}

        <form action={handleSubmit} className="space-y-6">
          <div className="form-control w-full">
            <div className="label">
              <span className="label-text font-semibold flex items-center gap-2">
                <Euro size={16} className="text-primary" />
                Final Amount (€)
              </span>
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              value={finalAmount}
              onChange={(e) => setFinalAmount(Number(e.target.value))}
              className="input input-bordered w-full h-[3rem] font-mono text-lg"
              required
            />
            <input type="hidden" name="finalAmount" value={finalAmount} />
            <input type="hidden" name="bookingId" value={booking.id} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control w-full">
              <div className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <CreditCard size={16} className="text-primary" />
                  Payment Method
                </span>
              </div>
              <select
                name="paymentMethod"
                className="select select-bordered w-full h-[3rem]"
                required
              >
                <option value="">Select payment method...</option>
                <option value="cash">Cash</option>
                <option value="card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="moloni">Moloni</option>
              </select>
            </div>

            <div className="form-control w-full">
              <div className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <CheckCircle size={16} className="text-primary" />
                  Payment Status
                </span>
              </div>
              <select
                name="paymentStatus"
                className="select select-bordered w-full h-[3rem]"
                required
              >
                <option value="">Select status...</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial Payment</option>
                <option value="paid">Paid in Full</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="form-control w-full">
            <div className="label">
              <span className="label-text font-semibold flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                Check-Out Notes (Optional)
              </span>
            </div>
            <textarea
              name="notes"
              className="textarea textarea-bordered h-24"
              placeholder="Any notes about the stay or payment..."
            />
          </div>

          <div className="form-control mt-6">
            <button
              type="submit"
              className="btn btn-primary w-full h-[3.5rem] text-lg shadow-lg hover:shadow-primary/30"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Checking Out...
                </>
              ) : (
                'Check-Out Guest'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
