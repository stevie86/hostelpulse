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
  const stats = await getDashboardStats(propertyId);

  if (!stats) return <div>Access denied</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-900 dark:via-gray-900 dark:to-zinc-900 p-4 relative overflow-hidden">
      {/* Modern background pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary)) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, hsl(var(--secondary)) 0%, transparent 50%)`,
          }}
        ></div>
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-600 to-gray-700 mb-6 shadow-2xl">
            <Monitor className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 dark:from-slate-300 dark:via-gray-300 dark:to-zinc-300 bg-clip-text text-transparent mb-3">
            HostelPOS
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 font-medium max-w-2xl mx-auto">
            Modern, touch-friendly booking management for contemporary hostels
          </p>
          <div className="mt-6 flex justify-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium shadow-lg">
              <div className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse"></div>
              Live Demo
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20 dark:border-white/10 hover:shadow-xl hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.occupiedBeds}/{stats.totalBeds}
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Occupied Beds
            </div>
          </div>
          <div className="group bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20 dark:border-white/10 hover:shadow-xl hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.arrivalsToday}
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Arrivals Today
            </div>
          </div>
          <div className="group bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20 dark:border-white/10 hover:shadow-xl hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.departuresToday}
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Departures Today
            </div>
          </div>
          <div className="group bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20 dark:border-white/10 hover:shadow-xl hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
              <CalendarDays className="w-7 h-7 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.currentOccupancyPercentage.toFixed(0)}%
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Occupancy Rate
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href={`/properties/${propertyId}/bookings/new`}
            className="group bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-white/30 dark:border-white/10 hover:shadow-xl hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] block"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">
              New Booking
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Create a new reservation
            </div>
          </Link>

          <Link
            href={`/properties/${propertyId}/calendar`}
            className="group bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-white/30 dark:border-white/10 hover:shadow-xl hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] block"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">
              Calendar View
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              See all bookings
            </div>
          </Link>

          <Link
            href={`/properties/${propertyId}/guests`}
            className="group bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-white/30 dark:border-white/10 hover:shadow-xl hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] block"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-500 to-gray-600 mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">
              Guest Manager
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Manage guest profiles
            </div>
          </Link>
        </div>

        {/* Today's Activity */}
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30 dark:border-white/10">
          <h2 className="text-3xl font-bold mb-6 flex items-center justify-center text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-500 to-gray-600 mr-4 shadow-lg">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <span className="text-gray-900 dark:text-white">
              Today&apos;s Activity
            </span>
          </h2>
          <div className="bg-gray-50/80 dark:bg-gray-800/50 rounded-xl p-6 shadow-inner border border-gray-200/50 dark:border-gray-700/50">
            <DailyActivity propertyId={propertyId} />
          </div>
        </div>
      </div>
    </div>
  );
}
