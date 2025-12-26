import { Suspense } from 'react';
import { DashboardCards } from '@/components/dashboard/dashboard-cards';
import { DailyActivity } from '@/components/dashboard/daily-activity';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import prisma from '@/lib/db';
import { CreditCard } from 'lucide-react';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: propertyId } = await params;

  // Get invoicing preferences
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { invoicingProvider: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href={`/properties/${propertyId}/settings`}
          className="btn btn-ghost btn-sm"
        >
          <Settings size={16} className="mr-2" />
          Settings
        </Link>
      </div>

      <Suspense fallback={<div>Loading Stats...</div>}>
        <DashboardCards propertyId={propertyId} />
      </Suspense>

      {/* Billing Status */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-primary" />
            <h2 className="card-title">Billing Status</h2>
          </div>
          <div className="flex items-center gap-2">
            {property?.invoicingProvider === 'moloni' && (
              <div className="badge badge-success gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Moloni Active
              </div>
            )}
            {property?.invoicingProvider === 'external' && (
              <div className="badge badge-info gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                External Provider
              </div>
            )}
            {(!property?.invoicingProvider ||
              property?.invoicingProvider === 'manual') && (
              <div className="badge badge-warning gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Manual Invoicing
              </div>
            )}
            <span className="text-sm text-base-content/70">
              Invoices generated automatically on check-out
            </span>
          </div>
        </div>
      </div>

      <Suspense fallback={<div>Loading Activity...</div>}>
        <DailyActivity propertyId={propertyId} />
      </Suspense>
    </div>
  );
}
