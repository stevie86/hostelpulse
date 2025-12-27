import { getDashboardStats } from '@/app/actions/dashboard';
import { Settings } from 'lucide-react';

export async function DashboardCards({ propertyId }: { propertyId: string }) {
  const stats = await getDashboardStats(propertyId);

  if (!stats) {
    return (
      <div className="alert alert-warning">
        <Settings size={16} className="mr-2" />
        Please check your property access permissions
      </div>
    );
  }

  const occupancyColor =
    stats.currentOccupancyPercentage > 80
      ? 'text-error'
      : stats.currentOccupancyPercentage > 50
        ? 'text-warning'
        : 'text-success';

  return (
    <div className="stats shadow w-full stats-vertical lg:stats-horizontal">
      <div className="stat place-items-center">
        <div className="stat-title">Total Rooms</div>
        <div className="stat-value">{stats.totalRooms}</div>
      </div>

      <div className="stat place-items-center">
        <div className="stat-title">Total Beds</div>
        <div className="stat-value">{stats.totalBeds}</div>
      </div>

      <div className="stat place-items-center">
        <div className="stat-title">Occupied Beds</div>
        <div className="stat-value">
          {stats.occupiedBeds}
          {stats.occupiedBeds === 0 && (
            <span className="text-xs text-base-content/50 ml-2">
              (No guests checked in)
            </span>
          )}
        </div>
      </div>

      <div className="stat place-items-center">
        <div className="stat-title">Available Beds</div>
        <div className="stat-value">
          {stats.availableBeds}
          {stats.availableBeds === stats.totalBeds && (
            <span className="text-xs text-base-content/50 ml-2">
              (All beds available)
            </span>
          )}
        </div>
      </div>

      <div className="stat place-items-center">
        <div className="stat-title">Arrivals Today</div>
        <div className="stat-value">
          {stats.arrivalsToday}
          {stats.arrivalsToday === 0 && (
            <span className="text-xs text-base-content/50 ml-2">
              (No arrivals scheduled)
            </span>
          )}
        </div>
      </div>

      <div className="stat place-items-center">
        <div className="stat-title">Departures Today</div>
        <div className="stat-value">
          {stats.departuresToday}
          {stats.departuresToday === 0 && (
            <span className="text-xs text-base-content/50 ml-2">
              (No departures scheduled)
            </span>
          )}
        </div>
      </div>

      <div className="stat place-items-center">
        <div className="stat-title">Occupancy</div>
        <div className={`stat-value ${occupancyColor}`}>
          {stats.currentOccupancyPercentage.toFixed(0)}%
          {stats.currentOccupancyPercentage === 0 && (
            <span className="text-xs text-base-content/50 ml-2">
              (No occupancy)
            </span>
          )}
        </div>
        <div className="stat-desc">
          <progress
            className={`progress ${stats.currentOccupancyPercentage > 80 ? 'progress-error' : stats.currentOccupancyPercentage > 50 ? 'progress-warning' : 'progress-success'}`}
            value={stats.currentOccupancyPercentage}
            max="100"
          ></progress>
        </div>
      </div>
    </div>
  );
}
