'use client';

import { useActionState } from 'react';
import { updateInvoicingPreferences } from '@/app/actions/properties';

interface InvoicingSetupProps {
  propertyId: string;
  currentProvider?: string | null;
  externalUrl?: string | null;
}

export function InvoicingSetup({
  propertyId,
  currentProvider,
  externalUrl,
}: InvoicingSetupProps) {
  const [state, action, isPending] = useActionState(
    updateInvoicingPreferences,
    {
      message: null,
      errors: {},
    }
  );

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          💰 Invoicing Setup
        </h3>
        <p className="text-blue-700 mb-4">
          Choose how you want to handle invoices for your guests.
        </p>

        {state.message && (
          <div className="alert alert-info mb-4">
            <span>{state.message}</span>
          </div>
        )}

        <form action={action} className="space-y-4">
          <input type="hidden" name="propertyId" value={propertyId} />

          {/* Invoicing Method Selection */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Invoice Generation Method
              </span>
            </label>

            <div className="space-y-3">
              {/* Moloni Integration Option */}
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  name="invoicingProvider"
                  value="moloni"
                  defaultChecked={currentProvider === 'moloni'}
                  className="radio radio-primary mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium">
                    🔗 Moloni Integration (Recommended)
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Automated Portuguese-compliant invoicing with PDF delivery
                    and email sending.
                    <br />• Certified Portuguese invoicing
                    <br />• Automatic tourist tax inclusion
                    <br />• Email delivery to guests
                    <br />• €6.49/month
                  </div>
                </div>
              </div>

              {/* External Tool Option */}
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  name="invoicingProvider"
                  value="external"
                  defaultChecked={currentProvider === 'external'}
                  className="radio radio-primary mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium">📤 Export to External Tool</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Export booking data in CSV format for import into your
                    existing invoicing software.
                    <br />• CSV export with all booking details
                    <br />• Tourist tax calculations included
                    <br />• Compatible with most accounting software
                    <br />• Free option
                  </div>
                  <div className="mt-2">
                    <input
                      type="url"
                      name="externalInvoiceUrl"
                      placeholder="https://your-invoicing-tool.com"
                      defaultValue={externalUrl || ''}
                      className="input input-bordered input-sm w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Optional: Link to your external invoicing tool
                    </div>
                  </div>
                </div>
              </div>

              {/* Manual Option */}
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  name="invoicingProvider"
                  value=""
                  defaultChecked={!currentProvider}
                  className="radio radio-primary mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium">📝 Manual Invoicing</div>
                  <div className="text-sm text-gray-600 mt-1">
                    No automated invoicing. Use HostelPulse for bookings and
                    handle invoices manually.
                    <br />• Complete booking management
                    <br />• Tourist tax calculations for reference
                    <br />• Export data as needed
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn btn-primary w-full"
          >
            {isPending ? 'Saving...' : 'Save Invoicing Preferences'}
          </button>
        </form>

        {/* Benefits Comparison */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-3">💡 Comparison</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-green-700">
                Moloni Integration
              </div>
              <div className="text-xs text-gray-600 mt-1">
                ✅ Automated
                <br />
                ✅ Portuguese compliant
                <br />
                ✅ PDF + Email
                <br />
                €6.49/month
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium text-blue-700">External Tool</div>
              <div className="text-xs text-gray-600 mt-1">
                ✅ Your existing software
                <br />
                ✅ Manual import
                <br />
                ✅ CSV export
                <br />
                Free
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-700">Manual</div>
              <div className="text-xs text-gray-600 mt-1">
                ⚠️ Time consuming
                <br />
                ⚠️ Error prone
                <br />
                ⚠️ No automation
                <br />
                Free
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
