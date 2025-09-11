import Head from 'next/head';
import Link from '../components/Link';
import { useAuth } from '../contexts/auth.context';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>Hostelpulse - Modern Hostel Management</title>
        <meta
          name="description"
          content="Hostelpulse is the all-in-one platform for modern hostel management. Automate tax collection, generate invoices, and sync with booking platforms."
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">Hostelpulse</span>
              </div>
              <div className="flex items-center space-x-4">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <main className="py-16">
            <div className="text-center">
              <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
                Modern Hostel
                <span className="text-blue-600 block">Management</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Automate tax collection, generate official invoices, and sync with booking platforms.
                Save time and increase revenue with Hostelpulse.
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
                  <p className="text-lg text-gray-700">Welcome back, {user.name}!</p>
                  <Link
                    href="/dashboard"
                    className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Access Dashboard
                  </Link>
                </div>
              )}
            </div>

            {/* Features Preview */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-4">💰</div>
                <h3 className="text-xl font-semibold mb-2">Tax Automation</h3>
                <p className="text-gray-600">Automatically collect Lisbon City Tax from all bookings</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-4">📄</div>
                <h3 className="text-xl font-semibold mb-2">Invoice Generation</h3>
                <p className="text-gray-600">Generate official Portuguese facturas instantly</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-4">🔄</div>
                <h3 className="text-xl font-semibold mb-2">Platform Sync</h3>
                <p className="text-gray-600">Sync bookings and availability with Booking.com</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}


