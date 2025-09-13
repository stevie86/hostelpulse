import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '../../../lib/apiAuth'
import { withCors } from '../../../lib/corsHandler'
import { supabase } from '../../../lib/supabase'

export default withCors(withAuth(async (req: NextApiRequest, res: NextApiResponse, auth) => {
  const { entity } = req.query as { entity: string }
  const ownerId = auth.user?.id || 'demo-owner'

  try {
    let rows: any[] = []
    let headers: string[] = []
    
    if (entity === 'guests') {
      const { data, error } = await supabase
        .from('guests')
        .select('id,name,email,phone,notes,created_at')
        .eq('owner_id', ownerId)
        .order('name')
      if (error) return res.status(500).json({ error: error.message })
      rows = data || []
      headers = ['id', 'name', 'email', 'phone', 'notes', 'created_at']
    } else if (entity === 'bookings') {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          check_in,
          check_out,
          status,
          notes,
          created_at,
          guests(name, email),
          rooms(name),
          beds(name)
        `)
        .eq('owner_id', ownerId)
        .order('check_in')
      if (error) return res.status(500).json({ error: error.message })
      
      // Flatten the nested data for CSV
      rows = (data || []).map(booking => ({
        id: booking.id,
        guest_name: booking.guests?.name || '',
        guest_email: booking.guests?.email || '',
        room_name: booking.rooms?.name || '',
        bed_name: booking.beds?.name || '',
        check_in: booking.check_in,
        check_out: booking.check_out,
        status: booking.status,
        notes: booking.notes || '',
        created_at: booking.created_at
      }))
      headers = ['id', 'guest_name', 'guest_email', 'room_name', 'bed_name', 'check_in', 'check_out', 'status', 'notes', 'created_at']
    } else {
      return res.status(400).json({ error: 'Unsupported entity. Use guests or bookings.' })
    }

    if (rows.length === 0) {
      const emptyRow = headers.reduce((acc, header) => ({ ...acc, [header]: '' }), {})
      rows = [emptyRow]
    }

    const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => {
      const value = r[h] ?? ''
      return `"${value.toString().replace(/"/g, '""')}"`
    }).join(','))].join('\n')
    
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${entity}.csv"`)
    return res.status(200).send(csv)
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Unexpected error' })
  }
}))
