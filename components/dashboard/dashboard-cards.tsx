import { getDashboardStats } from "@/app/actions/dashboard";

export async function DashboardCards({ propertyId }: { propertyId: string }) {
  const stats = await getDashboardStats(propertyId);

  if (!stats) return null;

  const occupancyColor =
    stats.currentOccupancyPercentage > 80
      ? "text-error"
      : stats.currentOccupancyPercentage > 50
      ? "text-warning"
      : "text-success";

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
        <div className="stat-value">{stats.occupiedBeds}</div>
      </div>

      <div className="stat place-items-center">
        <div className="stat-title">Available Beds</div>
        <div className="stat-value">{stats.availableBeds}</div>
      </div>

      <div className="stat place-items-center">
        <div className="stat-title">Arrivals Today</div>
        <div className="stat-value">{stats.arrivalsToday}</div>
      </div>

      <div className="stat place-items-center">
        <div className="stat-title">Departures Today</div>
        <div className="stat-value">{stats.departuresToday}</div>
      </div>

      <div className="stat place-items-center">
        <div className="stat-title">Occupancy</div>
        <div className={`stat-value ${occupancyColor}`}>
          {stats.currentOccupancyPercentage.toFixed(0)}%
        </div>
      </div>
    </div>
  );
}
