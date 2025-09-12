import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseServer } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  try {
    const { guest_name, guest_email, hostel_id, check_in, check_out, message } = req.body || {}
    if (!guest_name || !guest_email || !hostel_id || !check_in || !check_out) {
      return res.status(400).json({ error: 'guest_name, guest_email, hostel_id, check_in, check_out required' })
    }
    // Optionally create the guest record if it does not exist
    const { data: guest } = await supabaseServer
      .from('guests')
      .upsert({ email: guest_email, name: guest_name }, { onConflict: 'email' })
      .select('*')
      .single()

    // Log a pending booking in bookings with status "requested"
    const { data: booking, error } = await supabaseServer
      .from('bookings')
      .insert({ hostel_id, guest_id: guest?.id, check_in, check_out, status: 'requested', amount: 0 })
      .select('*')
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ request_id: booking.id })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Unexpected error' })
  }
}

