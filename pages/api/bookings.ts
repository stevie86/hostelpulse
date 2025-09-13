import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseServer } from '../../lib/supabase'
import { requireAuth, supabaseForRequest } from '../../lib/apiAuth'

function datesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  const aS = new Date(aStart).getTime()
  const aE = new Date(aEnd).getTime()
  const bS = new Date(bStart).getTime()
  const bE = new Date(bEnd).getTime()
  return aS < bE && bS < aE
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = requireAuth(req)
    if (!auth.ok) return res.status(401).json({ error: 'Unauthorized' })
    // Prefer anon client + JWT when available (RLS-friendly); fallback to server for legacy flows
    const supabase = auth.jwt ? supabaseForRequest(auth) : getSupabaseServer()
    if (!supabase) return res.status(503).json({ error: 'Supabase is not configured' })
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, guests(*), hostels(*)')
        .order('check_in', { ascending: true })
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ bookings: data })
    }

    if (req.method === 'POST') {
      const { hostel_id, guest_id, check_in, check_out, amount } = req.body || {}
      if (!hostel_id || !guest_id || !check_in || !check_out) {
        return res.status(400).json({ error: 'hostel_id, guest_id, check_in, check_out are required' })
      }
      // Overlap check for the same hostel
      const { data: existing, error: fetchErr } = await supabase
        .from('bookings')
        .select('id, check_in, check_out')
        .eq('hostel_id', hostel_id)
        .in('status', ['confirmed', 'checked_in'])
      if (fetchErr) return res.status(500).json({ error: fetchErr.message })
      const hasOverlap = (existing || []).some((b) => datesOverlap(b.check_in as any, b.check_out as any, check_in, check_out))
      if (hasOverlap) return res.status(409).json({ error: 'Booking overlaps with an existing stay' })

      const { data, error } = await supabase
        .from('bookings')
        .insert({ hostel_id, guest_id, check_in, check_out, amount: amount ?? 0, status: 'confirmed' })
        .select('*')
        .single()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(201).json({ booking: data })
    }

    if (req.method === 'PUT') {
      const { id, status } = req.body || {}
      if (!id) return res.status(400).json({ error: 'id is required' })
      const update: Record<string, any> = {}
      if (status) update.status = status
      const { data, error } = await supabase.from('bookings').update(update).eq('id', id).select('*').single()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ booking: data })
    }

    res.setHeader('Allow', 'GET,POST,PUT')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Unexpected error' })
  }
}
