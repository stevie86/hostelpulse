import React from 'react';
import { Bed } from 'lucide-react';

interface BedPulseCardProps {
  label: string;
  status: 'available' | 'occupied' | 'maintenance';
  guestName?: string;
  price?: number;
}

export const BedPulseCard: React.FC<BedPulseCardProps> = ({
  label,
  status,
  guestName,
  price,
}) => {
  const statusStyles = {
    available: 'bg-green-100 text-green-700 border-green-200',
    occupied: 'bg-blue-100 text-blue-700 border-blue-200',
    maintenance: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm transition-all hover:shadow-md">
      <div className="card-body p-4 flex flex-row items-center gap-4">
        <div className="p-3 rounded-full bg-base-200 text-base-content/85">
          <Bed size={20} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-base-content">Bed {label}</h3>
            <span className={`badge badge-sm ${statusStyles[status]}`}>
              {status}
            </span>
          </div>
          {guestName && (
            <p className="text-sm text-base-content/85 mt-1 truncate">
              {guestName}
            </p>
          )}
          {price && (
            <p className="text-xs font-medium text-base-content/80 mt-1">
              €{(price / 100).toFixed(2)} / night
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
