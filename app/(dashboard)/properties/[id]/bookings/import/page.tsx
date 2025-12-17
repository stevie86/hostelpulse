import { importBookings } from "@/app/actions/import";
import { ImportForm } from "@/components/import/import-form";
import Link from "next/link";

export default async function BookingsImportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: propertyId } = await params;
  const importBookingsWithId = importBookings.bind(null, propertyId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/properties/${propertyId}/bookings`}
          className="btn btn-ghost btn-sm"
        >
          ← Back to Bookings
        </Link>
        <h1 className="text-2xl font-bold">Import Bookings</h1>
      </div>

      <div className="bg-base-100 p-6 rounded-box shadow">
        <ImportForm propertyId={propertyId} type="bookings" action={importBookingsWithId} />
      </div>
    </div>
  );
}
