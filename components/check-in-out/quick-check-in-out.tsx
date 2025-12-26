import { CheckCircle, LogOut, Users, Calendar, UserPlus } from 'lucide-react';
import Link from 'next/link';

interface QuickCheckInOutProps {
  propertyId: string;
}

export function QuickCheckInOut({ propertyId }: QuickCheckInOutProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Check-in Section */}
      <div className="bg-white rounded-xl p-6 shadow-lg border">
        <div className="flex items-center mb-4">
          <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
          <h2 className="text-xl font-semibold">Quick Check-in</h2>
        </div>

        <div className="space-y-4">
          <Link
            href={`/properties/${propertyId}/bookings/new`}
            className="w-full btn btn-primary btn-lg block text-center"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            New Guest Check-in
          </Link>

          <Link
            href={`/properties/${propertyId}/guests`}
            className="w-full btn btn-outline btn-lg block text-center"
          >
            <Users className="w-5 h-5 mr-2" />
            Returning Guest
          </Link>

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
          <a
            href="#checked-in-guests"
            className="w-full btn btn-secondary btn-lg block text-center"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Guest Check-out
          </a>

          <button className="w-full btn btn-outline btn-lg">
            <Users className="w-5 h-5 mr-2" />
            Bulk Check-out
          </button>

          <Link
            href={`/properties/${propertyId}/calendar`}
            className="w-full btn btn-outline btn-lg block text-center"
          >
            <Calendar className="w-5 h-5 mr-2" />
            View Departures
          </Link>
        </div>
      </div>
    </div>
  );
}
