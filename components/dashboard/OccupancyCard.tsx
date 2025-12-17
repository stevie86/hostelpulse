'use client';

interface OccupancyCardProps {
  occupancy: number;
  arrivals: number;
  departures: number;
}

export function OccupancyCard({ occupancy, arrivals, departures }: OccupancyCardProps) {
  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Dashboard Stats</h2>
        <p>Occupancy: {occupancy}</p>
        <p>Arrivals Today: {arrivals}</p>
        <p>Departures Today: {departures}</p>
      </div>
    </div>
  );
}
