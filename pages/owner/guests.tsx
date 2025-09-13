import { useEffect, useState } from 'react'
import Link from 'next/link'
import OwnerNav from '../../components/OwnerNav'
import PageNav from '../../components/PageNav'

export default function OwnerGuests() {
  const [guests, setGuests] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', nationality: '' })
  const [csvText, setCsvText] = useState('')
  const [importResult, setImportResult] = useState<any[] | null>(null)

  async function load() {
    setError(null)
    const res = await fetch('/api/guests')
    const json = await res.json()
    if (!res.ok) return setError(json.error || 'Failed to load')
    setGuests(json.guests || [])
  }

  useEffect(() => {
    load()
  }, [])

  async function addGuest(e: any) {
    e.preventDefault()
    const res = await fetch('/api/guests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const json = await res.json()
    if (!res.ok) return alert(json.error || 'Create failed')
    setForm({ name: '', email: '', phone: '', nationality: '' })
    load()
  }

  async function importCsv() {
    setImportResult(null)
    const res = await fetch('/api/import/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csv: csvText }),
    })
    const json = await res.json()
    if (!res.ok) {
      alert(json.error || 'Import failed')
      return
    }
    setImportResult(json.results || [])
    load()
  }

  return (
    <div className="p-6 space-y-6">
      <OwnerNav />
      <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Guests</h1>
      {error && <div className="p-3 rounded bg-yellow-50 text-yellow-800">{error}</div>}

      <form onSubmit={addGuest} className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end">
        <input className="border p-2 text-sm" placeholder="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="border p-2 text-sm" placeholder="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="border p-2 text-sm" placeholder="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="border p-2 text-sm" placeholder="nationality" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
        <button className="bg-blue-600 text-white px-3 py-2 rounded text-sm" type="submit">
          Add
        </button>
      </form>

      <div className="border rounded overflow-x-auto">
        <table className="min-w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2">ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Nationality</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((g) => (
              <tr key={g.id} className="border-t">
                <td className="p-2">{g.id?.slice?.(0, 6) || '-'}</td>
                <td className="p-2">{g.name}</td>
                <td className="p-2">{g.email}</td>
                <td className="p-2">{g.phone}</td>
                <td className="p-2">{g.nationality}</td>
              </tr>
            ))}
            {guests.length === 0 && (
              <tr>
                <td className="p-2 text-xs text-gray-500" colSpan={5}>
                  No guests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="border rounded p-4">
        <h2 className="font-semibold mb-2">CSV Import / Export</h2>
        <p className="text-xs text-gray-600 mb-2">Format: id,name,email,phone,nationality</p>
        <textarea
          className="w-full border p-2 text-sm h-40"
          placeholder="Paste CSV here to import guests"
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
        />
        <div className="mt-2 flex items-center gap-2">
          <button className="bg-blue-600 text-white px-3 py-2 rounded text-sm" onClick={importCsv}>
            Import CSV
          </button>
          <Link href="/api/export/guests">
            <a className="text-sm text-blue-600 underline">Download guests.csv</a>
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

      <PageNav prev={{ href: '/owner/bookings', label: 'Back to Bookings' }} />
    </div>
  )
}
