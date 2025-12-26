import { getDashboardStats } from '@/app/actions/dashboard';
import { DailyActivity } from '@/components/dashboard/daily-activity';
import { QuickCheckInOut } from '@/components/check-in-out/quick-check-in-out';
import { CheckedInGuests } from '@/components/check-in-out/checked-in-guests';

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

        {/* Main Actions */}
        <QuickCheckInOut propertyId={propertyId} />

        {/* Checked-in Guests */}
        <div
          id="checked-in-guests"
          className="bg-white rounded-xl p-6 shadow-lg border"
        >
          <CheckedInGuests propertyId={propertyId} />
        </div>

        {/* Today's Activity */}
        <div className="bg-white rounded-xl p-6 shadow-lg border">
          <h2 className="text-xl font-semibold mb-4">Today&apos;s Activity</h2>
          <DailyActivity propertyId={propertyId} />
        </div>
      </div>
    </div>
  );
}
