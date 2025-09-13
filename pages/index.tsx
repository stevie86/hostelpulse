import Head from 'next/head';
import Link from '../components/Link';
import { useAuth } from '../contexts/auth.context';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>Hostelpulse Owner Console</title>
        <meta
          name="description"
          content="Operations console for hostel owners in Lisbon: check-in/out, occupancy, CSV import/export, and tax/invoice workflows."
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-xl font-bold text-gray-900">Hostelpulse</span>
              </div>
              <div className="flex items-center space-x-4">
                {user ? (
                  <Link
                    href="/owner/dashboard"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Open Owner Console
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign in to Owner Console
                  </Link>
                )}
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <main className="py-16">
            <div className="text-center">
              <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
                Lisbon Hostel
                <span className="text-blue-600 block">Operations Console</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-8 max-w-3xl mx-auto px-2">
                Check arrivals and departures, update check‑in/out, and manage guests and bookings. Import/export CSV from your spreadsheets to migrate fast.
              </p>

              {!user ? (
                <div className="space-y-4">
                  <Link
                    href="/auth/login"
                    className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Get Started
                  </Link>
                  <p className="text-sm text-gray-500">
                    Use demo credentials: demo@hostelpulse.com / demo123
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-lg text-gray-700">Welcome back!</p>
                  <Link
                    href="/owner/dashboard"
                    className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Open Owner Console
                  </Link>
                </div>
              )}
            </div>

            {/* Features Preview */}
            <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-left sm:text-center">
                <div className="text-3xl mb-4">🗓️</div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 leading-snug">Arrivals & Departures</h3>
                <p className="text-gray-700 text-base leading-relaxed">Today’s check‑ins and check‑outs at a glance.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-left sm:text-center">
                <div className="text-3xl mb-4">🧾</div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 leading-snug">Guests & Bookings</h3>
                <p className="text-gray-700 text-base leading-relaxed">Quickly add guests, create bookings, and update status.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-left sm:text-center">
                <div className="text-3xl mb-4">📄</div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 leading-snug">CSV Import/Export</h3>
                <p className="text-gray-700 text-base leading-relaxed">Migrate from Google Sheets in minutes.</p>
              </div>
            </div>

            {/* Built for Lisbon band */}
            <div className="mt-14 bg-white p-6 rounded-lg shadow-md border">
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 leading-snug">Built for Lisbon hostels</h3>
              <p className="text-gray-700 text-base leading-relaxed mb-4">
                EU‑hosted Supabase, simple owner workflows, and a roadmap for city‑tax and invoices. See our{' '}
                <Link href="/api-docs">
                  <a className="text-blue-600 underline">API docs</a>
                </Link>{' '}for integration details.
              </p>
              <div className="flex flex-wrap gap-3 text-sm sm:text-base text-gray-700">
                <span className="px-3 py-1 rounded bg-blue-50 border border-blue-200">EU Hosting</span>
                <span className="px-3 py-1 rounded bg-green-50 border border-green-200">Owner‑only Console</span>
                <span className="px-3 py-1 rounded bg-yellow-50 border border-yellow-200">CSV Import/Export</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
