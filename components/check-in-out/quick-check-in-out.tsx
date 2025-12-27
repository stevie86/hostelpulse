import { CheckCircle, LogOut, Users, Calendar, UserPlus } from 'lucide-react';
import Link from 'next/link';

interface QuickCheckInOutProps {
  propertyId: string;
}

export function QuickCheckInOut({ propertyId }: QuickCheckInOutProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Check-in Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">
            <CheckCircle className="w-6 h-6 text-success" />
            Quick Check-in
          </h2>

          <div className="space-y-4 mt-4">
            <Link
              href={`/properties/${propertyId}/bookings/new`}
              className="btn btn-primary btn-lg w-full"
            >
              <UserPlus className="w-5 h-5" />
              New Guest Check-in
            </Link>

            <Link
              href={`/properties/${propertyId}/guests`}
              className="btn btn-outline btn-lg w-full"
            >
              <Users className="w-5 h-5" />
              Returning Guest
            </Link>

            <button className="btn btn-outline btn-lg w-full">
              <Calendar className="w-5 h-5" />
              Group Check-in
            </button>
          </div>
        </div>
      </div>

      {/* Check-out Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">
            <LogOut className="w-6 h-6 text-info" />
            Quick Check-out
          </h2>

          <div className="space-y-4 mt-4">
            <a
              href="#checked-in-guests"
              className="btn btn-secondary btn-lg w-full"
            >
              <LogOut className="w-5 h-5" />
              Guest Check-out
            </a>

            <button className="btn btn-outline btn-lg w-full">
              <Users className="w-5 h-5" />
              Bulk Check-out
            </button>

            <Link
              href={`/properties/${propertyId}/calendar`}
              className="btn btn-outline btn-lg w-full"
            >
              <Calendar className="w-5 h-5" />
              View Departures
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
