import { getDashboardStats } from '@/app/actions/dashboard';
import DailyActivity from '@/components/dashboard/daily-activity';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle,
  UserPlus,
  Users,
  CalendarDays,
  Plus,
  Monitor,
} from 'lucide-react';

export default async function POSPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: propertyId } = await params;

  let stats = null;
  try {
    stats = await getDashboardStats(propertyId);
  } catch (error) {
    console.log('POS access error:', error);
  }

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-6 shadow-xl">
            <Monitor className="w-10 h-10 text-primary-content" />
          </div>
          <h1 className="text-5xl font-bold text-base-content mb-3">
            HostelPOS
          </h1>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Modern, touch-friendly booking management
          </p>
          <div className="mt-4">
            <span className="badge badge-success gap-2">
              <span className="w-2 h-2 rounded-full bg-success-content animate-pulse"></span>
              Live
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats stats-vertical md:stats-horizontal shadow-xl w-full mb-8 bg-base-100">
          <div className="stat">
            <div className="stat-figure text-primary">
              <Users className="w-8 h-8" />
            </div>
            <div className="stat-title">Occupied Beds</div>
            <div className="stat-value text-primary">
              {stats?.occupiedBeds || 0}/{stats?.totalBeds || 0}
            </div>
          </div>

          <div className="stat">
            <div className="stat-figure text-success">
              <UserPlus className="w-8 h-8" />
            </div>
            <div className="stat-title">Arrivals Today</div>
            <div className="stat-value text-success">
              {stats?.arrivalsToday || 0}
            </div>
          </div>

          <div className="stat">
            <div className="stat-figure text-warning">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="stat-title">Departures Today</div>
            <div className="stat-value text-warning">
              {stats?.departuresToday || 0}
            </div>
          </div>

          <div className="stat">
            <div className="stat-figure text-secondary">
              <CalendarDays className="w-8 h-8" />
            </div>
            <div className="stat-title">Occupancy Rate</div>
            <div className="stat-value text-secondary">
              {(stats?.currentOccupancyPercentage || 0).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href={`/properties/${propertyId}/bookings/new`}
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
          >
            <div className="card-body items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-2">
                <Plus className="w-8 h-8 text-primary-content" />
              </div>
              <h2 className="card-title">New Booking</h2>
              <p className="text-base-content/70">Create a new reservation</p>
            </div>
          </Link>

          <Link
            href={`/properties/${propertyId}/calendar`}
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
          >
            <div className="card-body items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-info to-primary flex items-center justify-center mb-2">
                <Calendar className="w-8 h-8 text-primary-content" />
              </div>
              <h2 className="card-title">Calendar View</h2>
              <p className="text-base-content/70">See all bookings</p>
            </div>
          </Link>

          <Link
            href={`/properties/${propertyId}/guests`}
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
          >
            <div className="card-body items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-success flex items-center justify-center mb-2">
                <Users className="w-8 h-8 text-accent-content" />
              </div>
              <h2 className="card-title">Guest Manager</h2>
              <p className="text-base-content/70">Manage guest profiles</p>
            </div>
          </Link>
        </div>

        {/* Today's Activity */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title justify-center mb-4">
              <CalendarDays className="w-6 h-6 text-primary" />
              Today&apos;s Activity
            </h2>
            <DailyActivity propertyId={propertyId} />
          </div>
        </div>
      </div>
    </div>
  );
}
