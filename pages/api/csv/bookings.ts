import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '../../../lib/apiAuth'
import { supabase } from '../../../lib/supabase'

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
  res.setHeader('Allow', ['GET'])
  res.status(405).end('Method Not Allowed')
})

