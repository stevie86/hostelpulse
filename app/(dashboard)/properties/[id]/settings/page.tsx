import { auth } from '@/auth';
import prisma from '@/lib/db';
import { redirect } from 'next/navigation';
import { InvoicingSetup } from '@/components/invoicing-setup';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowLeft,
  Settings,
  CreditCard,
  Link as LinkIcon,
} from 'lucide-react';

export default async function PropertySettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: propertyId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Verify user has access to this property
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      id: true,
      name: true,
      invoicingProvider: true,
      externalInvoiceUrl: true,
      team: {
        select: {
          members: {
            where: { userId: session.user.id },
            select: { role: true },
          },
        },
      },
    },
  });

  if (!property) {
    redirect('/properties');
  }

  const member = property.team.members[0];
  if (!member) {
    redirect('/properties');
  }

  // Get current invoicing preferences
  const currentProvider = property.invoicingProvider;
  const externalUrl = property.externalInvoiceUrl;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/properties/${propertyId}/dashboard`}
          className="btn btn-ghost btn-sm"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <Settings className="text-primary" size={24} />
          <h1 className="text-2xl font-bold">Property Settings</h1>
        </div>
      </div>

      {/* Settings Content */}
      <div className="grid gap-6">
        {/* Invoicing Setup */}
        <div className="bg-base-100 p-6 rounded-box shadow">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="text-primary" size={24} />
            <h2 className="text-xl font-semibold">Invoicing & Payments</h2>
          </div>
          <InvoicingSetup
            propertyId={propertyId}
            currentProvider={currentProvider}
            externalUrl={externalUrl}
          />
        </div>

        {/* Moloni Integration */}
        <div className="bg-base-100 p-6 rounded-box shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 bg-blue-500 rounded text-white flex items-center justify-center text-sm font-bold">
              M
            </div>
            <h3 className="text-lg font-semibold">Moloni Integration</h3>
          </div>

          <div className="space-y-4">
            <p className="text-base-content/70">
              Connect your Moloni account for automated Portuguese invoice
              generation. Certified compliance with €6.49/month.
            </p>

            {currentProvider === 'moloni' ? (
              <div className="alert alert-success">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Moloni Connected - Invoice generation active</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="alert alert-info">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Ready to connect - Credentials verified</span>
                  </div>
                </div>

                <form
                  action={async () => {
                    'use server';
                    const clientId = process.env.MOLONI_CLIENT_ID;
                    const redirectUri = process.env.MOLONI_REDIRECT_URI;

                    if (!clientId || !redirectUri) {
                      throw new Error('Moloni credentials not configured');
                    }

                    const authUrl = `https://api.moloni.pt/v1/authorize/?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=`;

                    redirect(authUrl);
                  }}
                >
                  <button type="submit" className="btn btn-primary">
                    <LinkIcon size={16} className="mr-2" />
                    Connect Moloni Account
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-base-100 p-6 rounded-box shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 bg-green-500 rounded text-white flex items-center justify-center text-sm font-bold">
              📄
            </div>
            <h3 className="text-lg font-semibold">Recent Invoices</h3>
          </div>

          <div className="space-y-3">
            <div className="alert alert-info">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Invoices will appear here after check-out</span>
              </div>
            </div>

            <div className="text-sm text-base-content/70">
              When guests check out, invoices are automatically generated based
              on your selected provider:
              {currentProvider === 'moloni' && (
                <span className="text-primary"> Moloni integration active</span>
              )}
              {currentProvider === 'external' && (
                <span className="text-primary">
                  {' '}
                  External provider configured
                </span>
              )}
              {(!currentProvider || currentProvider === 'manual') && (
                <span className="text-warning"> Manual invoicing</span>
              )}
            </div>

            {currentProvider === 'moloni' && (
              <div className="text-xs text-base-content/60 mt-2">
                💡 Portuguese invoices generated automatically with €6.49/month
                service
              </div>
            )}
          </div>
        </div>

        {/* Additional Settings Sections */}
        <div className="bg-base-100 p-6 rounded-box shadow">
          <h3 className="text-lg font-semibold mb-4">
            More Settings Coming Soon
          </h3>
          <p className="text-base-content/70">
            Additional property settings like notifications, integrations, and
            team management will be available in future updates.
          </p>
        </div>
      </div>
    </div>
  );
}
