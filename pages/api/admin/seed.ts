import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ADMIN = process.env.ADMIN_API_TOKEN

const admin = createClient(supabaseUrl, serviceKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end('Method Not Allowed')
  }
  if (!ADMIN || req.headers['x-admin-token'] !== ADMIN) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const { owner_id } = req.body as { owner_id?: string }
  if (!owner_id) return res.status(400).json({ error: 'owner_id required' })
  try {
    // Create rooms
    const { data: room1, error: r1e } = await admin.from('rooms').insert({ name: 'Private Room 1', type: 'private', max_capacity: 1, owner_id }).select().single()
    if (r1e) throw r1e
    const { data: dorm, error: r2e } = await admin.from('rooms').insert({ name: 'Dorm A', type: 'dorm', max_capacity: 4, owner_id }).select().single()
    if (r2e) throw r2e
    const beds = ['A1','A2','A3','A4'].map(name => ({ room_id: dorm!.id, name, owner_id }))
    const { error: be } = await admin.from('beds').insert(beds)
    if (be) throw be

    // Create guests
    const guests = [
      { name: 'Alex Hostel', email: 'alex@example.com' },
      { name: 'Ben Lee', email: 'ben@example.com' },
      { name: 'Cara Diaz', email: 'cara@example.com' },
    ].map(g => ({ ...g, owner_id }))
    const { data: guestsIns, error: ge } = await admin.from('guests').insert(guests).select()
    if (ge) throw ge

    // Create a booking arriving today
    const today = new Date(); const tomorrow = new Date(today.getTime()+86400000)
    const g = guestsIns![0]
    const { error: bk1e } = await admin.from('bookings').insert({
      guest_id: g.id,
      room_id: room1!.id,
      check_in: today.toISOString(),
      check_out: tomorrow.toISOString(),
      status: 'confirmed',
      owner_id,
    })
    if (bk1e) throw bk1e

    return res.status(200).json({ ok: true })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Seed failed' })
  }
}

