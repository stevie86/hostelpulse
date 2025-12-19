'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDashboardStats, getDailyActivity } from '@/app/actions/dashboard';
import { OccupancyCard } from '@/components/dashboard/OccupancyCard';
import { ActivityList } from '@/components/dashboard/ActivityList';
import { DashboardStats } from '@/types/dashboard';

interface BookingDetails {
  id: string;
  checkIn: Date;
  checkOut: Date;
  status: string;
  guest: {
    firstName: string;
    lastName: string;
  } | null;
  beds: {
    room: {
      name: string;
    };
  }[];
}

interface DailyActivity {
  arrivals: BookingDetails[];
  departures: BookingDetails[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<DailyActivity>({ arrivals: [], departures: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Hardcoding propertyId for now, ideally this would come from the user's session or context
  const propertyId = 'clx6r2g740000109o2016x11k'; // Replace with dynamic propertyId

  // Initial data fetch
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const statsData = await getDashboardStats(propertyId);
        const activityData = await getDailyActivity(propertyId);
        setStats(statsData);
        setActivity(activityData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [propertyId]);

  // Polling mechanism
  useEffect(() => {
    const interval = setInterval(() => {
      // Since we converted the whole page to a client component,
      // we need to manually re-fetch the data.
      async function reFetchData() {
        try {
          const statsData = await getDashboardStats(propertyId);
          const activityData = await getDailyActivity(propertyId);
          setStats(statsData);
          setActivity(activityData);
        } catch (error) {
          console.error('Failed to re-fetch dashboard data:', error);
        }
      }
      reFetchData();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [propertyId]);

  if (isLoading) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats && (
          <OccupancyCard
            occupancy={stats.occupancy}
            arrivals={stats.arrivals}
            departures={stats.departures}
          />
        )}
        {/* Other dashboard cards would go here */}
      </div>

      <div className="mt-8">
        <ActivityList arrivals={activity.arrivals} departures={activity.departures} />
      </div>
    </div>
  );
}