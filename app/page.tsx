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
      }
    }
    handleRedirect();
  }, [session, status, router, redirectAttempted]);

  if (status === 'loading') {
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

  // If not authenticated or redirect already attempted, show a default landing page
  // For MVP, this might be a simple "Login" button or marketing text.
  // Or if no property found, a setup page.
  return (
    <div className="min-h-screen hero bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Welcome to HostelPulse</h1>
          <p className="py-6">Your modern property management system for hostels.</p>
          <button onClick={() => router.push('/login')} className="btn btn-primary">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}