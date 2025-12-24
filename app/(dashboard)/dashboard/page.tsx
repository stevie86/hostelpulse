'use client';

import { useEffect, useState } from 'react';
import { getDashboardStats, getDailyActivity } from '@/app/actions/dashboard';
import { OccupancyCard } from '@/components/dashboard/OccupancyCard';
import { ActivityList } from '@/components/dashboard/ActivityList';
import { CheckInForm } from '@/components/bookings/checkin-form';
import { CheckOutForm } from '@/components/bookings/checkout-form';
import { DashboardStats } from '@/types/dashboard';

interface BookingDetails {
  id: string;
  checkIn: Date;
  checkOut: Date;
  status: string;
  totalAmount: number;
  amountPaid: number;
  guest: {
    firstName: string;
    lastName: string;
    email: string | null;
  } | null;
  beds: {
    bedLabel: string;
    pricePerNight: number;
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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<DailyActivity>({
    arrivals: [],
    departures: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [cityTaxRate, setCityTaxRate] = useState<number>(2.0);

  // Hardcoding propertyId for now, ideally this would come from the user's session or context
  const propertyId = 'clx6r2g740000109o2016x11k'; // Replace with dynamic propertyId

  // Function to refresh dashboard data
  const refreshData = async () => {
    try {
      const statsData = await getDashboardStats(propertyId);
      const activityData = await getDailyActivity(propertyId);
      setStats(statsData);
      setActivity(activityData);
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
    }
  };

  // Function to fetch property data
  const fetchPropertyData = async () => {
    try {
      // For now, we'll hardcode the city tax rate as it's in the schema default
      // In a real implementation, you'd fetch this from the property
      setCityTaxRate(2.0);
    } catch (error) {
      console.error('Failed to fetch property data:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const statsData = await getDashboardStats(propertyId);
        const activityData = await getDailyActivity(propertyId);
        await fetchPropertyData();
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
      refreshData();
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
        <ActivityList
          arrivals={activity.arrivals}
          departures={activity.departures}
        />
      </div>

      {/* Check-in/Check-out Operations */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-base-300 p-6">
          <CheckInForm
            bookings={activity.arrivals}
            onSuccess={refreshData}
          />
        </div>
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-base-300 p-6">
          <CheckOutForm
            bookings={activity.departures}
            cityTaxRate={cityTaxRate}
            onSuccess={refreshData}
          />
        </div>
      </div>
    </div>
  );
}
