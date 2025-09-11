import React, { useEffect, useState } from 'react'
import WedgeCard from './WedgeCard'

interface InvoiceData {
  invoiceNumber: string
  date: string
  hostelName: string
  guestName: string
  amount: number
  taxAmount: number
  totalAmount: number
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
}

interface SyncResult {
  syncedBookings: number
  newBookings: number
  updatedBookings: number
  lastSync: string
  status: string
}

interface DashboardData {
  hostels: any[]
  stats: {
    totalBookings: number
    totalRevenue: number
    lisbonTaxRate: number
    taxConditions: string
  }
}

const ContentArea: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingInvoice, setGeneratingInvoice] = useState(false)
  const [syncingBooking, setSyncingBooking] = useState(false)
  const [lastInvoice, setLastInvoice] = useState<InvoiceData | null>(null)
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard')
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleGenerateInvoice = async () => {
    setGeneratingInvoice(true)
    try {
      const response = await fetch('/api/generate-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const result = await response.json()
      if (result.success) {
        setLastInvoice(result.invoice)
        alert(`Invoice ${result.invoice.invoiceNumber} generated successfully!`)
      } else {
        alert('Failed to generate invoice')
      }
    } catch (error) {
      console.error('Invoice generation error:', error)
      alert('Failed to generate invoice')
    } finally {
      setGeneratingInvoice(false)
    }
  }

  const handleSyncBooking = async () => {
    setSyncingBooking(true)
    try {
      const response = await fetch('/api/sync-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const result = await response.json()
      if (result.success) {
        setLastSyncResult(result.result)
        alert(`${result.result.syncedBookings} bookings synced successfully!`)
      } else {
        alert('Failed to sync with Booking.com')
      }
    } catch (error) {
      console.error('Booking sync error:', error)
      alert('Failed to sync with Booking.com')
    } finally {
      setSyncingBooking(false)
    }
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Welcome to your Hostelpulse dashboard. Manage your hostel operations here.
            </p>
          </div>

          {/* Dashboard content */}
          <div className="space-y-4 sm:space-y-6">
            {/* Welcome section */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">H</span>
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Welcome to Hostelpulse
                      </dt>
                      <dd className="text-base sm:text-lg font-medium text-gray-900">
                        Your hostel management platform
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Stats */}
            {loading ? (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ) : data ? (
              <>
              <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-6 w-6 text-gray-400">🏨</div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Hostels
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {data.hostels.length}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-6 w-6 text-gray-400">📅</div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Bookings
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {data.stats.totalBookings}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-6 w-6 text-gray-400">💰</div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Revenue
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            €{data.stats.totalRevenue.toFixed(2)}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-6 w-6 text-green-500">🏛️</div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Lisbon City Tax
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {data.stats.lisbonTaxRate}€ per night
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lisbon Tax Information */}
              {data && (
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Lisbon Tax Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Current Tax Rate</dt>
                        <dd className="text-2xl font-bold text-green-600">{data.stats.lisbonTaxRate}€</dd>
                        <dd className="text-sm text-gray-600">per night per guest</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Tax Conditions</dt>
                        <dd className="text-sm text-gray-900">{data.stats.taxConditions}</dd>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              </>
            ) : null}

            {/* Wedge Features */}
            <div>
              <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4 px-1">Core Features</h2>
              <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                <WedgeCard
                  title="City Tax Collector"
                  description="Automatically collect Lisbon City Tax from all bookings"
                  icon="💰"
                  onClick={handleGenerateInvoice}
                />
                <WedgeCard
                  title="Factura Generator"
                  description="Generate official Portuguese facturas instantly"
                  icon="📄"
                  onClick={handleGenerateInvoice}
                />
                <WedgeCard
                  title="Sync with Booking.com"
                  description="Sync bookings and availability with Booking.com"
                  icon="🔄"
                  onClick={handleSyncBooking}
                />
              </div>
            </div>

            {/* Additional features placeholder */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Coming Soon</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-6 w-6 text-gray-400">
                          📊
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Analytics Dashboard
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            Revenue Insights
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-6 w-6 text-gray-400">
                          📅
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Booking Management
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            Multi-Platform Sync
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-6 w-6 text-gray-400">
                          ⚙️
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Settings
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            Configuration
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ContentArea