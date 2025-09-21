import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '../../../lib/apiAuth'
import { supabase } from '../../../lib/supabase'
import { parseCSV } from '../../../utils/csv'

type GuestRow = {
  rowNumber: number
  name: string
  email: string
  originalEmail: string
  phone?: string
  notes?: string
}

type ImportIssue = {
  row: number
  email?: string
  reason: string
}

function normalize(value?: string | null) {
  const trimmed = (value ?? '').trim()
  return trimmed.length ? trimmed : undefined
}

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
    const dryRun = req.query.dryRun === '1'
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

    const issues: ImportIssue[] = []
    const rows: GuestRow[] = []
    const seenEmails = new Set<string>()

    for (let r = 1; r < table.length; r++) {
      const rowNumber = r + 1
      const cols = table[r]
      if (!cols || cols.length === 0 || cols.every((c) => c.trim() === '')) continue

      const name = normalize(cols[idx.name])
      const emailRaw = normalize(cols[idx.email])
      const phone = idx.phone >= 0 ? normalize(cols[idx.phone]) : undefined
      const notes = idx.notes >= 0 ? normalize(cols[idx.notes]) : undefined

      if (!name || !emailRaw) {
        issues.push({ row: rowNumber, reason: 'Missing name or email' })
        continue
      }

      const email = emailRaw.toLowerCase()
      if (seenEmails.has(email)) {
        issues.push({ row: rowNumber, email: emailRaw, reason: 'Duplicate email in CSV' })
        continue
      }
      seenEmails.add(email)

      rows.push({ rowNumber, name, email, originalEmail: emailRaw, phone, notes })
    }

    const uniqueEmails = rows.map((row) => row.email)
    let existingEmails = new Set<string>()
    if (uniqueEmails.length) {
      const { data: existing, error: existingError } = await supabase
        .from('guests')
        .select('email')
        .eq('owner_id', ownerId)
        .in('email', uniqueEmails)

      if (existingError) {
        return res.status(500).json({ error: existingError.message })
      }
      existingEmails = new Set((existing || []).map((g) => (g.email || '').toLowerCase()))
    }

    const toUpdate = rows.filter((row) => existingEmails.has(row.email))
    const toInsert = rows.filter((row) => !existingEmails.has(row.email))

    const summary = {
      totalRows: table.length - 1,
      ready: rows.length,
      toInsert: toInsert.length,
      toUpdate: toUpdate.length,
      skipped: issues.length,
    }

    const preview = rows.slice(0, 10).map((row) => ({
      name: row.name,
      email: row.originalEmail,
      phone: row.phone,
      notes: row.notes,
      action: existingEmails.has(row.email) ? 'update' : 'insert',
      row: row.rowNumber,
    }))

    if (dryRun) {
      return res.status(200).json({ mode: 'dryRun', summary, preview, issues })
    }

    if (!rows.length) {
      return res.status(200).json({
        mode: 'commit',
        summary,
        issues,
        message: 'No valid rows to import',
      })
    }

    const payload = rows.map((row) => ({
      owner_id: ownerId,
      name: row.name,
      email: row.email,
      phone: row.phone ?? null,
      notes: row.notes ?? null,
    }))

    const { error: upsertError } = await supabase
      .from('guests')
      .upsert(payload, { onConflict: 'owner_id,email' })

    if (upsertError) {
      return res.status(500).json({ error: upsertError.message })
    }

    return res.status(200).json({
      mode: 'commit',
      summary,
      issues,
      message: `Imported ${toInsert.length} new guest${toInsert.length === 1 ? '' : 's'} and updated ${toUpdate.length}. Skipped ${issues.length}.`,
    })
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end('Method Not Allowed')
})
