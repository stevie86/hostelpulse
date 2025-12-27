import GuestList from '@/components/guests/guest-list';
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
    <div className="bg-base-100 rounded-box shadow">
      <Suspense fallback={<div>Loading guests...</div>}>
        <GuestList propertyId={propertyId} query={q} />
      </Suspense>
    </div>
  );
}
