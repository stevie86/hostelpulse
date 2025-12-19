'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getUserFirstPropertyId } from '@/app/actions/user'; // New server action to fetch propertyId

// This page will now handle redirection to the user's property dashboard
export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  useEffect(() => {
    async function handleRedirect() {
      console.log('AppPage: useEffect running. Status:', status, 'Redirect attempted:', redirectAttempted);
      if (status === 'authenticated' && !redirectAttempted) {
        setRedirectAttempted(true); // Prevent multiple redirects
        console.log('AppPage: Authenticated and redirect not yet attempted. Fetching property ID...');
        const propertyId = await getUserFirstPropertyId();
        
        if (propertyId) {
          router.push(`/properties/${propertyId}/dashboard`);
        } else {
          // Handle case where user has no property (e.g., show a setup page)
          router.push('/no-property-setup'); 
        }
      } else if (status === 'unauthenticated') {
        router.push('/login');
      }
    }
    handleRedirect();
  }, [session, status, router, redirectAttempted]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (status === 'authenticated' && !redirectAttempted) {
    // Show a loading state while redirect is being processed
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return null;
}