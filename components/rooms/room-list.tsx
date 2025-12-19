import { getRooms } from "@/app/actions/rooms";
import Link from "next/link";
import { DeleteRoomButton } from "./delete-room-button";

export async function RoomList({ propertyId }: { propertyId: string }) {
  const rooms = await getRooms(propertyId);

  if (!rooms.length) {
    return (
      <div className="text-center py-10 bg-base-200 rounded-lg">
        <h3 className="font-bold text-lg">No Rooms Found</h3>
        <p className="py-4">Get started by creating your first room.</p>
        <Link
          href={`/properties/${propertyId}/rooms/new`}
          className="btn btn-primary"
        >
          Add Room
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Beds</th>
            <th>Max Occ.</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td className="font-bold">{room.name}</td>
              <td className="capitalize">{room.type}</td>
              <td>{room.beds}</td>
              <td>{room.maxOccupancy}</td>
              <td>
                {new Intl.NumberFormat("en-IE", {
                  style: "currency",
                  currency: "EUR",
                }).format(room.pricePerNight / 100)}
              </td>
              <td className="flex gap-2">
                <Link
                  href={`/properties/${propertyId}/bookings/new?roomId=${room.id}`}
                  className="btn btn-sm btn-primary btn-outline"
                >
                  Book
                </Link>
                <Link
                  href={`/properties/${propertyId}/rooms/${room.id}`}
                  className="btn btn-sm btn-ghost"
                >
                  Edit
                </Link>
                <DeleteRoomButton roomId={room.id} propertyId={propertyId} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
