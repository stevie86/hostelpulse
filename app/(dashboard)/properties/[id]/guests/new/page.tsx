import { createGuest } from '@/app/actions/guests';
import { GuestForm } from '@/components/guests/guest-form';
import Link from 'next/link';

export default async function NewGuestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: propertyId } = await params;
  const createGuestWithId = createGuest.bind(null, propertyId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/properties/${propertyId}/guests`}
          className="btn btn-ghost btn-sm"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-bold">New Guest</h1>
      </div>
      <div className="bg-base-100 p-6 rounded-box shadow">
        <GuestForm propertyId={propertyId} action={createGuestWithId} />
      </div>
    </div>
  );
}
