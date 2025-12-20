import { RoomList } from '@/components/rooms/room-list';
import Link from 'next/link';
import { Suspense } from 'react';

export default async function RoomsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: propertyId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Rooms</h1>
          <p className="text-gray-500">
            Manage your property&apos;s inventory.
          </p>
        </div>
        <Link
          href={`/properties/${propertyId}/rooms/new`}
          className="btn btn-primary"
        >
          Add New Room
        </Link>
      </div>

      <div className="bg-base-100 rounded-box shadow">
        <Suspense
          fallback={<div className="p-10 text-center">Loading rooms...</div>}
        >
          <RoomList propertyId={propertyId} />
        </Suspense>
      </div>
    </div>
  );
}
