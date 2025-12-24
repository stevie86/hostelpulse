'use client';

import React, { useTransition } from 'react';
import { checkIn, checkOut } from '@/app/actions/dashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bed, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

interface GuestDetails {
  firstName: string;
  lastName: string;
}

interface RoomDetails {
  name: string;
}

interface BookingBedDetails {
  room: RoomDetails;
}

interface BookingDetails {
  id: string;
  checkIn: Date;
  checkOut: Date;
  status: string;
  guest: GuestDetails | null;
  beds: BookingBedDetails[];
}

interface ActivityListProps {
  arrivals: BookingDetails[];
  departures: BookingDetails[];
}

const ActivityCard = ({
  booking,
  type,
  isPending,
  onAction,
}: {
  booking: BookingDetails;
  type: 'arrival' | 'departure';
  isPending: boolean;
  onAction: (id: string) => void;
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative bg-base-100 border border-base-200 rounded-2xl p-4 shadow-sm hover:shadow-modern transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl ${type === 'arrival' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}
          >
            <User size={18} />
          </div>
          <div>
            <h4 className="font-bold text-base-content leading-tight">
              {booking.guest
                ? `${booking.guest.firstName} ${booking.guest.lastName}`
                : 'Guest'}
            </h4>
            <div className="flex items-center gap-2 text-xs text-base-content/60 mt-1">
              <Bed size={12} />
              <span>{booking.beds.map((bed) => bed.room.name).join(', ')}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`badge badge-sm font-bold ${
              booking.status === 'confirmed'
                ? 'badge-primary'
                : booking.status === 'checked_in'
                  ? 'badge-success'
                  : 'badge-neutral'
            }`}
          >
            {booking.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-base-200 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-base-content/60">
          <Clock size={12} />
          <span>
            {type === 'arrival' ? 'Check-in from 14:00' : 'Check-out by 11:00'}
          </span>
        </div>

        {((type === 'arrival' && booking.status !== 'checked_in') ||
          (type === 'departure' && booking.status === 'checked_in')) && (
          <button
            onClick={() => onAction(booking.id)}
            disabled={isPending}
            className={`btn btn-sm rounded-xl px-4 normal-case border-none ${
              type === 'arrival' ? 'btn-primary' : 'btn-secondary'
            } shadow-sm group-hover:shadow-lg transition-all`}
          >
            {isPending ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <>
                <span>{type === 'arrival' ? 'Check In' : 'Check Out'}</span>
                <ArrowRight
                  size={14}
                  className="ml-1 group-hover:translate-x-1 transition-transform"
                />
              </>
            )}
          </button>
        )}

        {((type === 'arrival' && booking.status === 'checked_in') ||
          (type === 'departure' && booking.status === 'checked_out')) && (
          <div className="flex items-center gap-1 text-success text-sm font-bold">
            <CheckCircle2 size={16} />
            <span>Completed</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export function ActivityList({ arrivals, departures }: ActivityListProps) {
  const [isPending, startTransition] = useTransition();

  const handleAction = (id: string, action: 'in' | 'out') => {
    startTransition(async () => {
      if (action === 'in') await checkIn(id);
      else await checkOut(id);
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            Arrivals Today
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-lg text-xs font-black">
              {arrivals.length}
            </span>
          </h2>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {arrivals.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-base-content/60 text-center py-10 bg-base-100/50 rounded-3xl border border-dashed border-base-300"
              >
                No arrivals scheduled for today.
              </motion.p>
            ) : (
              arrivals.map((booking) => (
                <ActivityCard
                  key={booking.id}
                  booking={booking}
                  type="arrival"
                  isPending={isPending}
                  onAction={(id) => handleAction(id, 'in')}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            Departures Today
            <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded-lg text-xs font-black">
              {departures.length}
            </span>
          </h2>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {departures.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-base-content/60 text-center py-10 bg-base-100/50 rounded-3xl border border-dashed border-base-300"
              >
                No departures scheduled for today.
              </motion.p>
            ) : (
              departures.map((booking) => (
                <ActivityCard
                  key={booking.id}
                  booking={booking}
                  type="departure"
                  isPending={isPending}
                  onAction={(id) => handleAction(id, 'out')}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
