import { Calendar } from '@/components/ui/calendar';
import { getBookingsForMonth } from '@/app/actions/dashboard';
import { Suspense } from 'react';

export default async function CalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const { id: propertyId } = await params;
  const { month, year } = await searchParams;

  const currentMonth = month ? parseInt(month) : new Date().getMonth();
  const currentYear = year ? parseInt(year) : new Date().getFullYear();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Booking Calendar</h1>

      <div className="bg-base-100 rounded-box shadow p-6">
        <Suspense fallback={<div>Loading calendar...</div>}>
          <BookingCalendar
            propertyId={propertyId}
            month={currentMonth}
            year={currentYear}
          />
        </Suspense>
      </div>
    </div>
  );
}

async function BookingCalendar({
  propertyId,
  month,
  year,
}: {
  propertyId: string;
  month: number;
  year: number;
}) {
  const bookings = await getBookingsForMonth(propertyId, month, year);

  // Simple display - in real implementation, would render calendar with booking indicators
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">
        {new Date(year, month).toLocaleDateString('default', {
          month: 'long',
          year: 'numeric',
        })}
      </h2>
      <Calendar
        mode="single"
        selected={new Date()}
        className="rounded-md border"
      />
      <div className="mt-4">
        <h3 className="font-semibold">
          Bookings this month: {bookings.length}
        </h3>
        {/* Would render booking details here */}
      </div>
    </div>
  );
}
