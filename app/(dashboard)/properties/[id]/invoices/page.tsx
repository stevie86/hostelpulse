import prisma from '@/lib/db';
import { CreditCard, Download, ExternalLink, CheckCircle } from 'lucide-react';

export default async function InvoicesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: propertyId } = await params;

  // Get recent bookings with check-out dates (invoices would be generated here)
  const recentBookings = await prisma.booking.findMany({
    where: {
      propertyId,
      status: 'completed',
      actualCheckOut: {
        not: null,
      },
    },
    include: {
      guest: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      beds: {
        select: {
          bedLabel: true,
          pricePerNight: true,
          room: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      actualCheckOut: 'desc',
    },
    take: 20, // Show last 20 invoices
  });

  // Get invoicing preferences
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { invoicingProvider: true, externalInvoiceUrl: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-base-content/70 mt-1">
            Manage and view generated invoices
          </p>
        </div>
        <div className="flex items-center gap-2">
          {property?.invoicingProvider === 'moloni' && (
            <div className="badge badge-success gap-1">
              <CheckCircle size={12} />
              Moloni Connected
            </div>
          )}
          {property?.invoicingProvider === 'external' && (
            <div className="badge badge-info gap-1">
              <ExternalLink size={12} />
              External Provider
            </div>
          )}
        </div>
      </div>

      {/* Invoice Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">
                  {recentBookings.length}
                </div>
                <div className="text-sm text-base-content/70">
                  Recent Invoices
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded text-white flex items-center justify-center font-bold">
                €
              </div>
              <div>
                <div className="text-2xl font-bold">
                  €
                  {recentBookings.reduce(
                    (total, booking) =>
                      total +
                      (booking.beds[0]?.pricePerNight || 0) *
                        Math.ceil(
                          (booking.checkOut.getTime() -
                            booking.checkIn.getTime()) /
                            (1000 * 60 * 60 * 24)
                        ),
                    0
                  )}
                </div>
                <div className="text-sm text-base-content/70">
                  Total Revenue
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded text-white flex items-center justify-center font-bold">
                {property?.invoicingProvider === 'moloni' ? 'M' : 'E'}
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {property?.invoicingProvider === 'moloni'
                    ? 'Moloni'
                    : property?.invoicingProvider === 'external'
                      ? 'External'
                      : 'Manual'}
                </div>
                <div className="text-sm text-base-content/70">
                  Invoice Provider
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Recent Invoices</h2>

          {recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-base-content/30 mx-auto mb-4" />
              <p className="text-base-content/70">No invoices generated yet.</p>
              <p className="text-sm text-base-content/50 mt-2">
                Invoices are automatically generated when guests check out.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => {
                const nights = Math.ceil(
                  (booking.checkOut.getTime() - booking.checkIn.getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                const totalAmount =
                  (booking.beds[0]?.pricePerNight || 0) * nights;

                return (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 bg-base-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {booking.guest?.firstName} {booking.guest?.lastName}
                          </div>
                          <div className="text-sm text-base-content/70">
                            Room: {booking.beds[0]?.room.name || 'N/A'} •{' '}
                            {nights} night{nights !== 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-base-content/60">
                            Checked out:{' '}
                            {booking.actualCheckOut?.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold">€{totalAmount}</div>
                      <div className="text-sm text-base-content/70">
                        €{booking.beds[0]?.pricePerNight}/night
                      </div>
                    </div>

                    <div className="ml-4">
                      <button className="btn btn-ghost btn-sm">
                        <Download size={16} className="mr-2" />
                        Download
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Invoice Provider Info */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">Invoice Provider Settings</h3>

          {property?.invoicingProvider === 'moloni' && (
            <div className="alert alert-success">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} />
                <div>
                  <div className="font-semibold">Moloni Integration Active</div>
                  <div className="text-sm">
                    Portuguese invoices are automatically generated with
                    €6.49/month service. All compliance requirements are met.
                  </div>
                </div>
              </div>
            </div>
          )}

          {property?.invoicingProvider === 'external' && (
            <div className="alert alert-info">
              <div className="flex items-center gap-2">
                <ExternalLink size={16} />
                <div>
                  <div className="font-semibold">External Invoice Provider</div>
                  <div className="text-sm">
                    Invoices are sent to your external provider at checkout.
                    {property.externalInvoiceUrl && (
                      <span> URL: {property.externalInvoiceUrl}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {(!property?.invoicingProvider ||
            property?.invoicingProvider === 'manual') && (
            <div className="alert alert-warning">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <div>
                  <div className="font-semibold">Manual Invoicing</div>
                  <div className="text-sm">
                    Invoices are not automatically generated. You handle
                    invoicing manually.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
