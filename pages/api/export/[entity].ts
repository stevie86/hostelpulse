import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '../../../lib/apiAuth'

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, auth) => {
  const { entity } = req.query as { entity: string }
  const ownerId = auth.user?.id || 'demo-owner'

  try {
    let rows: any[] = []
    let headers: string[] = []

    const { supabase } = await import('../../../lib/supabase')

    if (entity === 'guests') {
      const { data, error } = await supabase.from('guests').select('id,name,email,phone,notes,created_at').eq('owner_id', ownerId).order('name')
      if (error) return res.status(500).json({ error: error.message })
      rows = data || []
      headers = ['id', 'name', 'email', 'phone', 'notes', 'created_at']
    } else if (entity === 'bookings') {
      const { data, error } = await supabase
        .from('bookings')
        .select('id,check_in,check_out,status,notes,created_at,guests(name,email),rooms(name),beds(name)')
        .eq('owner_id', ownerId)
        .order('check_in')
      if (error) return res.status(500).json({ error: error.message })
      rows = (data || []).map((b: any) => ({
        id: b.id,
        guest_name: b.guests?.name || '',
        guest_email: b.guests?.email || '',
        room_name: b.rooms?.name || '',
        bed_name: b.beds?.name || '',
        check_in: b.check_in,
        check_out: b.check_out,
        status: b.status,
        notes: b.notes || '',
        created_at: b.created_at,
      }))
      headers = ['id', 'guest_name', 'guest_email', 'room_name', 'bed_name', 'check_in', 'check_out', 'status', 'notes', 'created_at']
    } else {
      return res.status(400).json({ error: 'Unsupported entity. Use guests or bookings.' })
    }

    if (rows.length === 0) {
      const emptyRow = headers.reduce((acc, h) => ({ ...acc, [h]: '' }), {} as any)
      rows = [emptyRow]
    }

    const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${entity}.csv"`)
    res.status(200).send(csv)
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Unexpected error' })
  }
})

