import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '../../../lib/apiAuth'
import { supabase } from '../../../lib/supabase'
import { parseCSV } from '../../../utils/csv'

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, auth) => {
  const ownerId = auth.user?.id || 'demo-owner'
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('bookings')
      .select('id,check_in,check_out,status,notes,guests(name,email),rooms(name),beds(name)')
      .eq('owner_id', ownerId)
      .order('check_in')
    if (error) return res.status(500).json({ error: error.message })
    const headers = ['guest_name','guest_email','room_name','bed_name','check_in','check_out','status','notes']
    const rows = (data || []).map((b: any) => headers.map((h) => {
      const map: any = {
        guest_name: b.guests?.name || '',
        guest_email: b.guests?.email || '',
        room_name: b.rooms?.name || '',
        bed_name: b.beds?.name || '',
        check_in: b.check_in,
        check_out: b.check_out,
        status: b.status,
        notes: b.notes || ''
      }
      return `"${String(map[h] ?? '').replace(/"/g, '""')}"`
    }).join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="bookings.csv"')
    return res.status(200).send(csv)
  }
  if (req.method === 'POST') {
    const { csv } = req.body as { csv?: string }
    if (!csv) return res.status(400).json({ error: 'Missing CSV content' })
    const rows = parseCSV(csv)
    if (!rows.length) return res.status(400).json({ error: 'Empty CSV' })
    const header = rows[0].map(h => h.trim().toLowerCase())
    const H = (k: string) => header.indexOf(k)
    const idx = { guest_email: H('guest_email'), room_name: H('room_name'), bed_name: H('bed_name'), check_in: H('check_in'), check_out: H('check_out'), status: H('status'), notes: H('notes') }
    if (idx.guest_email < 0 || idx.check_in < 0 || idx.check_out < 0) return res.status(400).json({ error: 'CSV must include guest_email, check_in, check_out' })
    let ok = 0, fail = 0
    for (let r = 1; r < rows.length; r++) {
      const cols = rows[r]
      if (!cols || cols.every(c => c.trim() === '')) continue
      const guest_email = (cols[idx.guest_email] ?? '').trim()
      const room_name = idx.room_name >= 0 ? (cols[idx.room_name] ?? '').trim() : ''
      const bed_name = idx.bed_name >= 0 ? (cols[idx.bed_name] ?? '').trim() : ''
      const check_in = (cols[idx.check_in] ?? '').trim()
      const check_out = (cols[idx.check_out] ?? '').trim()
      const status = (idx.status >= 0 ? (cols[idx.status] ?? '').trim() : 'confirmed') || 'confirmed'
      const notes = idx.notes >= 0 ? (cols[idx.notes] ?? '').trim() : undefined
      if (!guest_email || !check_in || !check_out) { fail++; continue }
      // lookups
      const { data: guest } = await supabase.from('guests').select('id').eq('owner_id', ownerId).eq('email', guest_email).single()
      if (!guest) { fail++; continue }
      let room_id: string | undefined = undefined
      let bed_id: string | undefined = undefined
      if (bed_name) {
        const { data: bed } = await supabase.from('beds').select('id, room_id').eq('owner_id', ownerId).eq('name', bed_name).single()
        if (!bed) { fail++; continue }
        bed_id = bed.id
      } else if (room_name) {
        const { data: room } = await supabase.from('rooms').select('id').eq('owner_id', ownerId).eq('name', room_name).single()
        if (!room) { fail++; continue }
        room_id = room.id
      }
      // conflict check minimal: same unit overlapping, excluding cancelled
      const { data: existing } = await supabase.from('bookings').select('*').eq('owner_id', ownerId).neq('status', 'cancelled').or(bed_id ? `bed_id.eq.${bed_id}` : (room_id ? `room_id.eq.${room_id}` : 'room_id.is.null'))
      const s1 = new Date(check_in).getTime(), e1 = new Date(check_out).getTime()
      const overlap = (existing || []).some(b => {
        const s2 = new Date(b.check_in).getTime(); const e2 = new Date(b.check_out).getTime();
        return s1 < e2 && s2 < e1
      })
      if (overlap) { fail++; continue }
      const ins = await supabase.from('bookings').insert({ guest_id: guest.id, room_id, bed_id, check_in, check_out, status, notes, owner_id: ownerId })
      if (ins.error) fail++; else ok++
    }
    return res.status(200).json({ message: `Imported ${ok} bookings; ${fail} failed.` })
  }
  res.setHeader('Allow', ['GET'])
  res.status(405).end('Method Not Allowed')
})
