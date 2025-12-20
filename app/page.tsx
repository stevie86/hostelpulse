import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserFirstPropertyId } from '@/app/actions/user';

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const propertyId = await getUserFirstPropertyId();

  if (propertyId) {
    redirect(`/properties/${propertyId}/dashboard`);
  } else {
    redirect('/no-property-setup');
  }
}
