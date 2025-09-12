import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseServer } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { entity } = req.query as { entity: string }
  const supabase = getSupabaseServer()
  if (!supabase) return res.status(503).json({ error: 'Supabase is not configured' })

  try {
    let rows: any[] = []
    if (entity === 'guests') {
      const { data, error } = await supabase.from('guests').select('id,name,email,phone,nationality,created_at')
      if (error) return res.status(500).json({ error: error.message })
      rows = data || []
    } else if (entity === 'bookings') {
      const { data, error } = await supabase
        .from('bookings')
        .select('id,hostel_id,guest_id,check_in,check_out,amount,status,created_at')
      if (error) return res.status(500).json({ error: error.message })
      rows = data || []
    } else {
      return res.status(400).json({ error: 'Unsupported entity. Use guests or bookings.' })
    }

    const headers = Object.keys(rows[0] || { id: '', created_at: '' })
    const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => (r[h] ?? '')).join(','))].join('\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${entity}.csv"`)
    return res.status(200).send(csv)
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Unexpected error' })
  }
}

