import { getGuests } from "@/app/actions/guests";
import Link from "next/link";

export async function GuestList({
  propertyId,
  query,
}: {
  propertyId: string;
  query?: string;
}) {
  const guests = await getGuests(propertyId, query);

  if (!guests.length) {
    return <div className="p-4 text-center">No guests found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Nationality</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {guests.map((guest) => (
            <tr key={guest.id}>
              <td className="font-bold">
                {guest.firstName} {guest.lastName}
              </td>
              <td>{guest.email || "-"}</td>
              <td>{guest.phone || "-"}</td>
              <td>{guest.nationality || "-"}</td>
              <td>
                <Link
                  href={`/properties/${propertyId}/guests/${guest.id}`}
                  className="btn btn-sm btn-ghost"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
