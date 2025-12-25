import { getDashboardStats } from '@/app/actions/dashboard';
import { DailyActivity } from '@/components/dashboard/daily-activity';
import { CheckCircle, LogOut, Users, Calendar, UserPlus } from 'lucide-react';

export default async function CheckInOutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: propertyId } = await params;
  const stats = await getDashboardStats(propertyId);

  if (!stats) return <div>Access denied</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Check-in & Check-out
          </h1>
          <p className="text-lg text-base-content/70">
            Simple, fast guest operations
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 text-center shadow-lg border">
            <div className="text-2xl font-bold text-green-600">
              {stats.arrivalsToday}
            </div>
            <div className="text-sm text-base-content/70">Arrivals Today</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg border">
            <div className="text-2xl font-bold text-blue-600">
              {stats.departuresToday}
            </div>
            <div className="text-sm text-base-content/70">Departures Today</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg border">
            <div className="text-2xl font-bold text-purple-600">
              {stats.occupiedBeds}/{stats.totalBeds}
            </div>
            <div className="text-sm text-base-content/70">Occupied Beds</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg border">
            <div className="text-2xl font-bold text-orange-600">
              {stats.currentOccupancyPercentage.toFixed(0)}%
            </div>
            <div className="text-sm text-base-content/70">Occupancy</div>
          </div>
        </div>

        {/* Main Actions - Simplified */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Check-in Section */}
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
              <h2 className="text-xl font-semibold">Quick Check-in</h2>
            </div>

            <div className="space-y-4">
              <button className="w-full btn btn-primary btn-lg">
                <UserPlus className="w-5 h-5 mr-2" />
                New Guest Check-in
              </button>

              <button className="w-full btn btn-outline btn-lg">
                <Users className="w-5 h-5 mr-2" />
                Returning Guest
              </button>

              <button className="w-full btn btn-outline btn-lg">
                <Calendar className="w-5 h-5 mr-2" />
                Group Check-in
              </button>
            </div>
          </div>

          {/* Check-out Section */}
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <div className="flex items-center mb-4">
              <LogOut className="w-6 h-6 mr-2 text-blue-500" />
              <h2 className="text-xl font-semibold">Quick Check-out</h2>
            </div>

            <div className="space-y-4">
              <button className="w-full btn btn-secondary btn-lg">
                <LogOut className="w-5 h-5 mr-2" />
                Guest Check-out
              </button>

              <button className="w-full btn btn-outline btn-lg">
                <Users className="w-5 h-5 mr-2" />
                Bulk Check-out
              </button>

              <button className="w-full btn btn-outline btn-lg">
                <Calendar className="w-5 h-5 mr-2" />
                View Departures
              </button>
            </div>
          </div>
        </div>

        {/* Today's Activity - Simplified */}
        <div className="bg-white rounded-xl p-6 shadow-lg border">
          <h2 className="text-xl font-semibold mb-4">Today&apos;s Activity</h2>
          <DailyActivity propertyId={propertyId} />
        </div>
      </div>
    </div>
  );
}
