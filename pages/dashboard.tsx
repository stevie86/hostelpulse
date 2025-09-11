import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import Container from '../components/Container';
import Button from '../components/Button';
import SectionTitle from '../components/SectionTitle';

const Dashboard = () => {
  const queryClient = useQueryClient();

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery(
    'dashboard',
    () => fetch('/api/dashboard').then(res => res.json())
  );

  // Mock tax collection data (replace with real API when available)
  const taxData = [
    { id: 1, amount: 45, date: '2023-09-10', guest: 'Alice Johnson', platform: 'Booking.com' },
    { id: 2, amount: 30, date: '2023-09-09', guest: 'Bob Smith', platform: 'Hostelworld' },
    { id: 3, amount: 60, date: '2023-09-08', guest: 'Charlie Brown', platform: 'Airbnb' },
    { id: 4, amount: 25, date: '2023-09-07', guest: 'Diana Prince', platform: 'Direct' },
  ];

  // Mock invoice data (replace with real API when available)
  const invoiceData = [
    { id: 1, number: 'INV-001', amount: 120, date: '2023-09-10', client: 'Business Corp' },
    { id: 2, number: 'INV-002', amount: 85, date: '2023-09-09', client: 'Travel Ltd' },
    { id: 3, number: 'INV-003', amount: 200, date: '2023-09-08', client: 'Hotel Chain' },
  ];

  // Sync mutation
  const syncMutation = useMutation(
    (platform: string) =>
      fetch('/api/sync-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, bookingData: { id: 'mock-booking-id' } }),
      }).then(res => res.json()),
    {
      onSuccess: (data) => {
        toast.success(`Successfully synced with ${data.platform}`);
        queryClient.invalidateQueries('dashboard');
      },
      onError: () => {
        toast.error('Sync failed. Please try again.');
      },
    }
  );

  const handleSync = (platform: string) => {
    syncMutation.mutate(platform);
  };

  return (
    <Container>
      <div className="py-8">
        <SectionTitle>Hostelpulse Dashboard</SectionTitle>

        {/* Overview Stats */}
        {dashboardLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md border animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : dashboardError ? (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-8">
            <p className="text-red-600">Failed to load dashboard data. Please try again.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <h3 className="text-lg font-semibold text-gray-800">Total Taxes Collected</h3>
              <p className="text-2xl font-bold text-blue-600">€{dashboardData?.taxCollected?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-gray-500">This month</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <h3 className="text-lg font-semibold text-gray-800">Invoices Generated</h3>
              <p className="text-2xl font-bold text-green-600">{dashboardData?.invoicesGenerated || 0}</p>
              <p className="text-sm text-gray-500">This week</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <h3 className="text-lg font-semibold text-gray-800">Active Bookings</h3>
              <p className="text-2xl font-bold text-orange-600">{dashboardData?.bookingsThisMonth || 0}</p>
              <p className="text-sm text-gray-500">Across platforms</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <h3 className="text-lg font-semibold text-gray-800">Revenue Protected</h3>
              <p className="text-2xl font-bold text-purple-600">€{dashboardData?.totalRevenue?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-gray-500">From automation</p>
            </div>
          </div>
        )}

        {/* Recent Tax Collections */}
        <div className="bg-white p-6 rounded-lg shadow-md border mb-8">
          <h3 className="text-xl font-semibold mb-4">Recent Tax Collections</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Guest</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Platform</th>
                </tr>
              </thead>
              <tbody>
                {taxData.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2">{item.guest}</td>
                    <td className="px-4 py-2">€{item.amount}</td>
                    <td className="px-4 py-2">{item.date}</td>
                    <td className="px-4 py-2">{item.platform}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white p-6 rounded-lg shadow-md border mb-8">
          <h3 className="text-xl font-semibold mb-4">Recent Invoices</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Invoice #</th>
                  <th className="px-4 py-2 text-left">Client</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2">{item.number}</td>
                    <td className="px-4 py-2">{item.client}</td>
                    <td className="px-4 py-2">€{item.amount}</td>
                    <td className="px-4 py-2">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Platform Sync Section */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-xl font-semibold mb-4">Platform Synchronization</h3>
          <p className="text-gray-600 mb-4">
            Keep your inventory synchronized across all booking platforms to prevent double bookings and maximize revenue.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => handleSync('Booking.com')} className="bg-blue-600 hover:bg-blue-700">
              Sync Booking.com
            </Button>
            <Button onClick={() => handleSync('Hostelworld')} className="bg-green-600 hover:bg-green-700">
              Sync Hostelworld
            </Button>
            <Button onClick={() => handleSync('Airbnb')} className="bg-red-600 hover:bg-red-700">
              Sync Airbnb
            </Button>
            <Button onClick={() => handleSync('Expedia')} className="bg-purple-600 hover:bg-purple-700">
              Sync Expedia
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Dashboard;