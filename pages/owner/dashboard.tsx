import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageNav from '../../components/PageNav'
import OwnerNav from '../../components/OwnerNav'

type Booking = {
  id: string
  guest_id: string
  hostel_id: string
  check_in: string
  check_out: string
  status: string
}

export default function OwnerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/bookings')
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to load bookings')
        setBookings(json.bookings || [])
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const today = new Date().toISOString().slice(0, 10)
  const arrivals = bookings.filter((b) => b.check_in === today)
  const departures = bookings.filter((b) => b.check_out === today)

  async function updateStatus(id: string, status: string) {
    const res = await fetch('/api/bookings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    const json = await res.json()
    if (!res.ok) {
      alert(json.error || 'Update failed')
      return
    }
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
  }

  return (
    <div className="p-6 space-y-6">
      <OwnerNav />
      <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Owner Dashboard</h1>
      <div className="text-sm sm:text-base text-gray-700 leading-relaxed">Quick view of arrivals/departures and booking ops</div>

      {loading && <div>Loading...</div>}
      {error && (
        <div className="p-3 rounded bg-yellow-50 text-yellow-800">
          {error} — Supabase not configured? Add env vars and reload.
        </div>
      )}

      {!loading && !error && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Today&apos;s Arrivals ({arrivals.length})</h2>
            <ul className="space-y-2">
              {arrivals.map((b) => (
                <li key={b.id} className="flex items-center justify-between text-xs sm:text-sm leading-relaxed">
                  <span>
                    Booking {b.id.slice(0, 6)} • status: <b>{b.status}</b>
                  </span>
                  <div className="space-x-2">
                    <button className="px-2 py-1 text-xs bg-green-600 text-white rounded" onClick={() => updateStatus(b.id, 'checked_in')}>
                      Check in
                    </button>
                    <button className="px-2 py-1 text-xs bg-red-600 text-white rounded" onClick={() => updateStatus(b.id, 'cancelled')}>
                      Cancel
                    </button>
                  </div>
                </li>
              ))}
              {arrivals.length === 0 && <li className="text-xs text-gray-500">No arrivals today.</li>}
            </ul>
          </div>

          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Today&apos;s Departures ({departures.length})</h2>
            <ul className="space-y-2">
              {departures.map((b) => (
                <li key={b.id} className="flex items-center justify-between text-xs sm:text-sm leading-relaxed">
                  <span>
                    Booking {b.id.slice(0, 6)} • status: <b>{b.status}</b>
                  </span>
                  <div className="space-x-2">
                    <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded" onClick={() => updateStatus(b.id, 'checked_out')}>
                      Check out
                    </button>
                  </div>
                </li>
              ))}
              {departures.length === 0 && <li className="text-xs text-gray-500">No departures today.</li>}
            </ul>
          </div>
        </div>
      )}

      <div className="flex gap-3 text-sm">
        <Link href="/owner/bookings">
          <a className="text-blue-600 underline">Manage bookings</a>
        </Link>
        <Link href="/owner/guests">
          <a className="text-blue-600 underline">Manage guests</a>
        </Link>
      </div>
      <PageNav next={{ href: '/owner/bookings', label: 'Go to Bookings' }} />
    </div>
  )
}
