import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseServer } from '../../../lib/supabase'

type ImportResult = { index: number; ok: boolean; error?: string; id?: string }

function parseCsv(csv: string): { headers: string[]; rows: string[][] } {
  const lines = csv.trim().split(/\r?\n/)
  const headers = (lines.shift() || '').split(',').map((h) => h.trim())
  const rows = lines.map((l) => l.split(',').map((c) => c.trim()))
  return { headers, rows }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { entity } = req.query as { entity: string }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabase = getSupabaseServer()
  if (!supabase) return res.status(503).json({ error: 'Supabase is not configured' })

  try {
    // Accept JSON body: { csv: "..." }
    const csv = (req.body && (req.body.csv as string)) || ''
    if (!csv) return res.status(400).json({ error: 'csv is required in body' })

    const { headers, rows } = parseCsv(csv)
    const results: ImportResult[] = []
    if (entity === 'guests') {
      // Allowed columns: id, name, email, phone, nationality
      for (let i = 0; i < rows.length; i++) {
        const row = Object.fromEntries(headers.map((h, idx) => [h, rows[i][idx]])) as any
        try {
          const payload: any = {
            name: row.name,
            email: row.email,
            phone: row.phone,
            nationality: row.nationality,
          }
          if (row.id) payload.id = row.id
          const { data, error } = await supabase.from('guests').upsert(payload, { onConflict: 'email' }).select('id').single()
          if (error) results.push({ index: i, ok: false, error: error.message })
          else results.push({ index: i, ok: true, id: data?.id })
        } catch (e: any) {
          results.push({ index: i, ok: false, error: e?.message || 'unknown' })
        }
      }
    } else if (entity === 'bookings') {
      // Allowed columns: id, hostel_id, guest_id, check_in, check_out, amount, status
      for (let i = 0; i < rows.length; i++) {
        const row = Object.fromEntries(headers.map((h, idx) => [h, rows[i][idx]])) as any
        try {
          const payload: any = {
            hostel_id: row.hostel_id,
            guest_id: row.guest_id,
            check_in: row.check_in,
            check_out: row.check_out,
            amount: row.amount ? Number(row.amount) : 0,
            status: row.status || 'confirmed',
          }
          if (row.id) payload.id = row.id
          const { data, error } = await supabase.from('bookings').upsert(payload, { onConflict: 'id' }).select('id').single()
          if (error) results.push({ index: i, ok: false, error: error.message })
          else results.push({ index: i, ok: true, id: data?.id })
        } catch (e: any) {
          results.push({ index: i, ok: false, error: e?.message || 'unknown' })
        }
      }
    } else {
      return res.status(400).json({ error: 'Unsupported entity. Use guests or bookings.' })
    }

    return res.status(200).json({ results })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Unexpected error' })
  }
}

