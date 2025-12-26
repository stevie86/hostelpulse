import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserFirstPropertyId } from '@/app/actions/user';

export default async function NoPropertySetup() {
  // Check if user already has a property
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const propertyId = await getUserFirstPropertyId();

  if (propertyId) {
    redirect(`/properties/${propertyId}/dashboard`);
  }

  // If database is seeded but user has no property, redirect to login
  // This handles the case where db:seed was run but no property was created for this user
  redirect('/login?message=Please run pnpm run db:seed to set up demo data');
}
