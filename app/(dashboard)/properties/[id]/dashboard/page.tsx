import { Suspense } from "react";
import { DashboardCards } from "@/components/dashboard/dashboard-cards";
import { DailyActivity } from "@/components/dashboard/daily-activity";
import Link from "next/link";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: propertyId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <Suspense fallback={<div>Loading Stats...</div>}>
        <DashboardCards propertyId={propertyId} />
      </Suspense>

      <Suspense fallback={<div>Loading Activity...</div>}>
        <DailyActivity propertyId={propertyId} />
      </Suspense>
    </div>
  );
}
