import { importRooms } from '@/app/actions/import';
import { ImportForm } from '@/components/import/import-form';
import Link from 'next/link';

export default async function RoomsImportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: propertyId } = await params;
  const importRoomsWithId = importRooms.bind(null, propertyId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/properties/${propertyId}/rooms`}
          className="btn btn-ghost btn-sm"
        >
          ← Back to Rooms
        </Link>
        <h1 className="text-2xl font-bold">Import Rooms</h1>
      </div>

      <div className="bg-base-100 p-6 rounded-box shadow">
        <ImportForm
          propertyId={propertyId}
          type="rooms"
          action={importRoomsWithId}
        />
      </div>
    </div>
  );
}
