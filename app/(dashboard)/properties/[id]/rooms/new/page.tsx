import { createRoom } from "@/app/actions/rooms";
import { RoomForm } from "@/components/rooms/room-form";
import Link from "next/link";

export default async function NewRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: propertyId } = await params;

  // Bind the action to the propertyId
  const createRoomWithId = createRoom.bind(null, propertyId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/properties/${propertyId}/rooms`}
          className="btn btn-ghost btn-sm"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-bold">Create New Room</h1>
      </div>

      <div className="bg-base-100 p-6 rounded-box shadow max-w-2xl">
        <RoomForm propertyId={propertyId} action={createRoomWithId} />
      </div>
    </div>
  );
}
