'use client';

import { useTransition, useState } from 'react';
import { checkIn, checkOut } from '@/app/actions/dashboard';
import { CheckCircle, XCircle } from 'lucide-react';

export function CheckInButton({
  bookingId,
  className = 'btn btn-primary btn-sm',
}: {
  bookingId: string;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    billingStatus?: string;
  } | null>(null);

  const handleCheckIn = () => {
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await checkIn(bookingId);
        if (result.success) {
          setFeedback({
            type: 'success',
            message: 'Guest checked in successfully!',
          });
          setTimeout(() => setFeedback(null), 3000);
        }
      } catch (error) {
        setFeedback({
          type: 'error',
          message: error instanceof Error ? error.message : 'Check-in failed',
        });
        setTimeout(() => setFeedback(null), 5000);
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
      <button
        onClick={handleCheckIn}
        disabled={isPending}
        className={className}
      >
        {isPending ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          'Check In'
        )}
      </button>
      {feedback && (
        <div
          className={`alert alert-${
            feedback.type === 'success'
              ? 'success'
              : feedback.type === 'error'
                ? 'error'
                : 'info'
          } p-2 text-xs max-w-xs`}
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              {feedback.type === 'success' ? (
                <CheckCircle size={12} />
              ) : feedback.type === 'error' ? (
                <XCircle size={12} />
              ) : (
                <span className="loading loading-dots loading-xs"></span>
              )}
              <span>{feedback.message}</span>
            </div>
            {feedback.billingStatus && (
              <div className="text-xs opacity-75 ml-4">
                💰 {feedback.billingStatus}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function CheckOutButton({
  bookingId,
  className = 'btn btn-secondary btn-sm',
}: {
  bookingId: string;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    billingStatus?: string;
  } | null>(null);

  const handleCheckOut = () => {
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await checkOut(bookingId);
        if (result.success) {
          setFeedback({
            type: 'info',
            message: 'Processing SEF & billing...',
          });

          // Show success message after processing
          setTimeout(() => {
            setFeedback({
              type: 'success',
              message: 'Guest checked out successfully!',
              billingStatus: 'Invoice generated automatically',
            });
            setTimeout(() => setFeedback(null), 5000);
          }, 1500);
        }
      } catch (error) {
        setFeedback({
          type: 'error',
          message: error instanceof Error ? error.message : 'Check-out failed',
        });
        setTimeout(() => setFeedback(null), 5000);
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
      <button
        onClick={handleCheckOut}
        disabled={isPending}
        className={className}
      >
        {isPending ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          'Check Out'
        )}
      </button>
      {feedback && (
        <div
          className={`alert alert-${
            feedback.type === 'success'
              ? 'success'
              : feedback.type === 'error'
                ? 'error'
                : 'info'
          } p-2 text-xs max-w-xs`}
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              {feedback.type === 'success' ? (
                <CheckCircle size={12} />
              ) : feedback.type === 'error' ? (
                <XCircle size={12} />
              ) : (
                <span className="loading loading-dots loading-xs"></span>
              )}
              <span>{feedback.message}</span>
            </div>
            {feedback.billingStatus && (
              <div className="text-xs opacity-75 ml-4">
                💰 {feedback.billingStatus}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
