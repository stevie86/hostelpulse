import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '../../../lib/apiAuth'
import { supabase } from '../../../lib/supabase'
import { parseCSV } from '../../../utils/csv'

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, auth) => {
  const ownerId = auth.user?.id || 'demo-owner'

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('guests')
      .select('name,email,phone,notes')
      .eq('owner_id', ownerId)
      .order('name')
    if (error) return res.status(500).json({ error: error.message })
    const headers = ['name', 'email', 'phone', 'notes']
    const csv = [
      headers.join(','),
      ...(data || []).map((r) =>
        headers.map((h) => `"${String((r as any)[h] ?? '').replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="guests.csv"')
    res.status(200).send(csv)
    return
  }

  if (req.method === 'POST') {
    const { csv } = req.body as { csv?: string }
    if (!csv) return res.status(400).json({ error: 'Missing CSV content' })

    const table = parseCSV(csv)
    if (!table.length) return res.status(400).json({ error: 'Empty CSV' })
    const header = table[0].map((h) => h.trim().toLowerCase())
    const idx = {
      name: header.indexOf('name'),
      email: header.indexOf('email'),
      phone: header.indexOf('phone'),
      notes: header.indexOf('notes'),
    }
    if (idx.name < 0 || idx.email < 0) {
      return res.status(400).json({ error: 'CSV must include headers: name,email[,phone,notes]' })
    }

    let ok = 0
    let fail = 0
    for (let r = 1; r < table.length; r++) {
      const cols = table[r]
      if (!cols || cols.length === 0 || cols.every((c) => c.trim() === '')) continue
      const name = (cols[idx.name] ?? '').trim()
      const email = (cols[idx.email] ?? '').trim()
      const phone = idx.phone >= 0 ? (cols[idx.phone] ?? '').trim() : undefined
      const notes = idx.notes >= 0 ? (cols[idx.notes] ?? '').trim() : undefined
      if (!name || !email) { fail++; continue }
      const { error } = await supabase
        .from('guests')
        .insert({ name, email, phone, notes, owner_id: ownerId })
      if (error) fail++
      else ok++
    }
    return res.status(200).json({ message: `Imported ${ok} guests; ${fail} failed.` })
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end('Method Not Allowed')
})

