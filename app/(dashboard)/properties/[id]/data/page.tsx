import {
  importRooms,
  importBookings,
  importGuests,
} from '@/app/actions/import';
import { ImportForm } from '@/components/import/import-form';
import Link from 'next/link';
import { Download } from 'lucide-react';

export default async function DataManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: propertyId } = await params;

  const importRoomsWithId = importRooms.bind(null, propertyId);
  const importBookingsWithId = importBookings.bind(null, propertyId);
  const importGuestsWithId = importGuests.bind(null, propertyId);

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
        <p className="text-base-content/70 mt-2">
          Decoupled utility tools for bulk importing and exporting property
          data.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Import Section */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold border-b pb-2">Import Data</h2>

          <div className="collapse collapse-arrow bg-base-100 border border-base-200 shadow-sm">
            <input type="radio" name="import-accordion" defaultChecked />
            <div className="collapse-title text-lg font-medium">
              Import Rooms
            </div>
            <div className="collapse-content">
              <ImportForm
                propertyId={propertyId}
                type="rooms"
                action={importRoomsWithId}
              />
            </div>
          </div>

          <div className="collapse collapse-arrow bg-base-100 border border-base-200 shadow-sm">
            <input type="radio" name="import-accordion" />
            <div className="collapse-title text-lg font-medium">
              Import Guests
            </div>
            <div className="collapse-content">
              <ImportForm
                propertyId={propertyId}
                type="guests"
                action={importGuestsWithId}
              />
            </div>
          </div>

          <div className="collapse collapse-arrow bg-base-100 border border-base-200 shadow-sm">
            <input type="radio" name="import-accordion" />
            <div className="collapse-title text-lg font-medium">
              Import Bookings
            </div>
            <div className="collapse-content">
              <ImportForm
                propertyId={propertyId}
                type="bookings"
                action={importBookingsWithId}
              />
            </div>
          </div>
        </section>

        {/* Export Section */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold border-b pb-2">Export Data</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href={`/api/export/rooms/${propertyId}`}
              className="btn btn-outline gap-2 h-auto py-4 flex-col items-center justify-center"
              download
            >
              <Download size={24} />
              <div className="text-center">
                <div className="font-bold">Export Rooms</div>
                <div className="text-xs text-base-content/70">Download as CSV</div>
              </div>
            </a>

            <a
              href={`/api/export/guests/${propertyId}`}
              className="btn btn-outline gap-2 h-auto py-4 flex-col items-center justify-center"
              download
            >
              <Download size={24} />
              <div className="text-center">
                <div className="font-bold">Export Guests</div>
                <div className="text-xs text-base-content/70">Download as CSV</div>
              </div>
            </a>

            <a
              href={`/api/export/bookings/${propertyId}`}
              className="btn btn-outline gap-2 h-auto py-4 flex-col items-center justify-center col-span-full"
              download
            >
              <Download size={24} />
              <div className="text-center">
                <div className="font-bold">Export All Bookings</div>
                <div className="text-xs text-base-content/70">Full history download</div>
              </div>
            </a>
          </div>

          <div className="alert alert-info shadow-sm mt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div>
              <h3 className="font-bold text-sm">Backup Recommendation</h3>
              <div className="text-xs">
                We recommend exporting your data weekly during the beta phase.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
