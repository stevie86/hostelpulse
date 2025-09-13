import { useEffect, useState } from 'react'
import Link from 'next/link'
import OwnerNav from '../../components/OwnerNav'
import PageNav from '../../components/PageNav'

type BookingForm = { hostel_id: string; guest_id: string; check_in: string; check_out: string; amount: number }

export default function OwnerBookings() {
  const [bookings, setBookings] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<BookingForm>({ hostel_id: '', guest_id: '', check_in: '', check_out: '', amount: 0 })
  const [csvText, setCsvText] = useState('')
  const [importResult, setImportResult] = useState<any[] | null>(null)

  async function load() {
    setError(null)
    const res = await fetch('/api/bookings')
    const json = await res.json()
    if (!res.ok) return setError(json.error || 'Failed to load')
    setBookings(json.bookings || [])
  }

  useEffect(() => {
    load()
  }, [])

  async function createBooking(e: any) {
    e.preventDefault()
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const json = await res.json()
    if (!res.ok) return alert(json.error || 'Create failed')
    setForm({ hostel_id: '', guest_id: '', check_in: '', check_out: '', amount: 0 })
    load()
  }

  async function setStatus(id: string, status: string) {
    const res = await fetch('/api/bookings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    const json = await res.json()
    if (!res.ok) return alert(json.error || 'Update failed')
    load()
  }

  return (
    <div className="p-6 space-y-6">
      <OwnerNav />
      <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Bookings</h1>
      {error && <div className="p-3 rounded bg-yellow-50 text-yellow-800">{error}</div>}

      <form onSubmit={createBooking} className="grid grid-cols-2 md:grid-cols-6 gap-2 items-end">
        <input className="border p-2 text-sm" placeholder="hostel_id" value={form.hostel_id} onChange={(e) => setForm({ ...form, hostel_id: e.target.value })} />
        <input className="border p-2 text-sm" placeholder="guest_id" value={form.guest_id} onChange={(e) => setForm({ ...form, guest_id: e.target.value })} />
        <input className="border p-2 text-sm" type="date" value={form.check_in} onChange={(e) => setForm({ ...form, check_in: e.target.value })} />
        <input className="border p-2 text-sm" type="date" value={form.check_out} onChange={(e) => setForm({ ...form, check_out: e.target.value })} />
        <input className="border p-2 text-sm" type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
        <button className="bg-blue-600 text-white px-3 py-2 rounded text-sm" type="submit">
          Create
        </button>
      </form>

      <div className="border rounded overflow-x-auto">
        <table className="min-w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2">ID</th>
              <th className="p-2">Guest</th>
              <th className="p-2">Check-in</th>
              <th className="p-2">Check-out</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="p-2 whitespace-nowrap">{b.id.slice(0, 6)}</td>
                <td className="p-2">{b.guests?.name || b.guest_id}</td>
                <td className="p-2">{b.check_in}</td>
                <td className="p-2">{b.check_out}</td>
                <td className="p-2">{b.status}</td>
                <td className="p-2 space-x-2">
                  <button className="px-2 py-1 text-xs bg-green-600 text-white rounded" onClick={() => setStatus(b.id, 'checked_in')}>
                    Check in
                  </button>
                  <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded" onClick={() => setStatus(b.id, 'checked_out')}>
                    Check out
                  </button>
                  <button className="px-2 py-1 text-xs bg-red-600 text-white rounded" onClick={() => setStatus(b.id, 'cancelled')}>
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td className="p-2 text-xs text-gray-500" colSpan={6}>
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="border rounded p-4">
        <h2 className="font-semibold mb-2">CSV Import / Export</h2>
        <p className="text-xs text-gray-600 mb-2">Format: id,hostel_id,guest_id,check_in,check_out,amount,status</p>
        <textarea
          className="w-full border p-2 text-sm h-40"
          placeholder="Paste CSV here to import bookings"
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            className="bg-blue-600 text-white px-3 py-2 rounded text-sm"
            onClick={async () => {
              setImportResult(null)
              const res = await fetch('/api/import/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ csv: csvText }),
              })
              const json = await res.json()
              if (!res.ok) return alert(json.error || 'Import failed')
              setImportResult(json.results || [])
              load()
            }}
          >
            Import CSV
          </button>
          <Link href="/api/export/bookings">
            <a className="text-sm text-blue-600 underline">Download bookings.csv</a>
          </Link>
        </div>
        {importResult && (
          <div className="mt-3 text-xs">
            <div className="font-semibold mb-1">Import results</div>
            <ul className="space-y-1 max-h-40 overflow-auto">
              {importResult.map((r, i) => (
                <li key={i} className={r.ok ? 'text-green-700' : 'text-red-700'}>
                  Row {r.index + 1}: {r.ok ? `ok${r.id ? ` (id ${r.id})` : ''}` : r.error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <PageNav prev={{ href: '/owner/dashboard', label: 'Back to Dashboard' }} next={{ href: '/owner/guests', label: 'Go to Guests' }} />
    </div>
  )
}
