import { GuestList } from '@/components/guests/guest-list';
import Link from 'next/link';
import { Suspense } from 'react';

export default async function GuestsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id: propertyId } = await params;
  const { q } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Guests</h1>
        <Link
          href={`/properties/${propertyId}/guests/new`}
          className="btn btn-primary"
        >
          Add Guest
        </Link>
      </div>

      <div className="form-control w-full max-w-xs">
        <form>
          <input
            name="q"
            type="text"
            placeholder="Search guests..."
            className="input input-bordered w-full"
            defaultValue={q}
          />
        </form>
      </div>

      <div className="bg-base-100 rounded-box shadow">
        <Suspense fallback={<div>Loading...</div>}>
          <GuestList propertyId={propertyId} query={q} />
        </Suspense>
      </div>
    </div>
  );
}
