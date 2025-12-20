import { updateRoom } from '@/app/actions/rooms';
import { RoomForm } from '@/components/rooms/room-form';
import prisma from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditRoomPage({
  params,
}: {
  params: Promise<{ id: string; roomId: string }>;
}) {
  const { id: propertyId, roomId } = await params;

  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    notFound();
  }

  // Bind the action
  const updateRoomWithId = updateRoom.bind(null, roomId, propertyId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/properties/${propertyId}/rooms`}
          className="btn btn-ghost btn-sm"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-bold">Edit Room: {room.name}</h1>
      </div>

      <div className="bg-base-100 p-6 rounded-box shadow max-w-2xl">
        <RoomForm
          propertyId={propertyId}
          action={updateRoomWithId}
          isEditMode={true}
          roomId={roomId}
          initialValues={{
            name: room.name,
            type: room.type as 'dormitory' | 'private' | 'suite',
            beds: room.beds,
            pricePerNight: room.pricePerNight,
            maxOccupancy: room.maxOccupancy,
            description: room.description || '',
          }}
        />
      </div>
    </div>
  );
}
