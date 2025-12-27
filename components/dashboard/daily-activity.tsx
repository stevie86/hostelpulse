'use client';

import { useState, useEffect } from 'react';
import { getDailyActivity } from '@/app/actions/dashboard';
import { CheckInButton, CheckOutButton } from './activity-buttons';
import { CheckCircle, LogOut } from 'lucide-react';

export default function DailyActivity({ propertyId }: { propertyId: string }) {
  const [activities, setActivities] = useState<{
    arrivals: any[];
    departures: any[];
  }>({
    arrivals: [],
    departures: [],
  });

  useEffect(() => {
    const loadActivity = async () => {
      try {
        const data = await getDailyActivity(propertyId);
        setActivities(data);
      } catch (error) {
        console.error('Failed to load activity:', error);
      }
    };

    loadActivity();
  }, [propertyId]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Today's Arrivals */}
      <div className="bg-base-100 rounded-lg p-4 border border-base-300">
        <h3 className="font-semibold text-base-content mb-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-success" />
          Today&apos;s Arrivals ({activities.arrivals.length})
        </h3>
        <div className="space-y-2">
          {activities.arrivals.length === 0 ? (
            <p className="text-sm text-base-content/50">No arrivals today</p>
          ) : (
            activities.arrivals.map((booking: any) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-2 bg-success/10 rounded"
              >
                <div>
                  <p className="font-medium">{booking.guest?.name}</p>
                  <p className="text-sm text-base-content/70">
                    Check-in: {new Date(booking.checkIn).toLocaleTimeString()}
                  </p>
                </div>
                <CheckInButton bookingId={booking.id} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Today's Departures */}
      <div className="bg-base-100 rounded-lg p-4 border border-base-300">
        <h3 className="font-semibold text-base-content mb-3 flex items-center gap-2">
          <LogOut className="h-5 w-5 text-info" />
          Today&apos;s Departures ({activities.departures.length})
        </h3>
        <div className="space-y-2">
          {activities.departures.length === 0 ? (
            <p className="text-sm text-base-content/50">No departures today</p>
          ) : (
            activities.departures.map((booking: any) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-2 bg-info/10 rounded"
              >
                <div>
                  <p className="font-medium">{booking.guest?.name}</p>
                  <p className="text-sm text-base-content/70">
                    Check-out: {new Date(booking.checkOut).toLocaleTimeString()}
                  </p>
                </div>
                <CheckOutButton bookingId={booking.id} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
