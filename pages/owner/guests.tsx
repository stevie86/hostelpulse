import { useEffect, useState } from 'react'

export default function OwnerGuests() {
  const [guests, setGuests] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', nationality: '' })

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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Guests</h1>
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

      <div className="border rounded">
        <table className="w-full text-sm">
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
    </div>
  )}

