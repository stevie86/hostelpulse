import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '../../../lib/apiAuth'
import { supabase } from '../../../lib/supabase'

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, auth) => {
  const ownerId = auth.user?.id || 'demo-owner'
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('guests').select('name,email,phone,notes').eq('owner_id', ownerId).order('name')
    if (error) return res.status(500).json({ error: error.message })
    const headers = ['name', 'email', 'phone', 'notes']
    const csv = [headers.join(','), ...(data || []).map((r) => headers.map((h) => `"${String((r as any)[h] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="guests.csv"')
    res.status(200).send(csv)
    return
  }
  if (req.method === 'POST') {
    const { csv } = req.body as { csv?: string }
    if (!csv) return res.status(400).json({ error: 'Missing CSV content' })
    const lines = csv.split(/\r?\n/).filter(Boolean)
    const [headerLine, ...rows] = lines
    const headers = headerLine.split(',').map((h) => h.trim())
    const idx = { name: headers.indexOf('name'), email: headers.indexOf('email'), phone: headers.indexOf('phone'), notes: headers.indexOf('notes') }
    if (idx.name < 0 || idx.email < 0) return res.status(400).json({ error: 'name and email columns are required' })
    let ok = 0, fail = 0
    for (const row of rows) {
      const cols = row.split(',')
      const name = cols[idx.name]?.replace(/^"|"$/g, '')
      const email = cols[idx.email]?.replace(/^"|"$/g, '')
      const phone = idx.phone >= 0 ? cols[idx.phone]?.replace(/^"|"$/g, '') : undefined
      const notes = idx.notes >= 0 ? cols[idx.notes]?.replace(/^"|"$/g, '') : undefined
      if (!name || !email) { fail++; continue }
      const { error } = await supabase.from('guests').insert({ name, email, phone, notes, owner_id: ownerId })
      if (error) fail++; else ok++
    }
    return res.status(200).json({ message: `Imported ${ok} guests; ${fail} failed.` })
  }
  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end('Method Not Allowed')
})

