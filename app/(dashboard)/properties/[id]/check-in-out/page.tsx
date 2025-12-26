import { getDashboardStats } from '@/app/actions/dashboard';
import { getRooms } from '@/app/actions/rooms';
import { DailyActivity } from '@/components/dashboard/daily-activity';
import { CheckInOutClient } from '@/components/check-in-out/check-in-out-client';
import { CheckCircle, LogOut, Users, Calendar, UserPlus } from 'lucide-react';

export default async function CheckInOutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: propertyId } = await params;
  const [stats, rooms] = await Promise.all([
    getDashboardStats(propertyId),
    getRooms(propertyId),
  ]);

  if (!stats) return <div>Access denied</div>;

  return (
    <CheckInOutClient propertyId={propertyId} stats={stats} rooms={rooms} />
  );
}
