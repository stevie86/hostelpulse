import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '../../../lib/apiAuth'
import { supabase } from '../../../lib/supabase'
import { parseCSV } from '../../../utils/csv'

type BookingRow = {
  rowNumber: number
  guestEmail: string
  guestName?: string
  roomName?: string
  bedName?: string
  guestId: string
  roomId?: string | null
  bedId?: string | null
  checkIn: string
  checkOut: string
  status: string
  notes?: string
}

type ImportIssue = {
  row: number
  email?: string
  reason: string
}

const VALID_STATUSES = new Set(['confirmed', 'pending', 'cancelled'])

function normalize(value?: string | null) {
  const trimmed = (value ?? '').trim()
  return trimmed.length ? trimmed : undefined
}

function toIsoDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

function datesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  const startA = new Date(aStart).getTime()
  const endA = new Date(aEnd).getTime()
  const startB = new Date(bStart).getTime()
  const endB = new Date(bEnd).getTime()
  return startA < endB && startB < endA
}

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
      const map: Record<string, string> = {
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

  if (req.method === 'POST') {
    const dryRun = req.query.dryRun === '1'
    const { csv } = req.body as { csv?: string }
    if (!csv) return res.status(400).json({ error: 'Missing CSV content' })

    const table = parseCSV(csv)
    if (!table.length) return res.status(400).json({ error: 'Empty CSV' })

    const header = table[0].map((h) => h.trim().toLowerCase())
    const idx = {
      guestName: header.indexOf('guest_name'),
      guestEmail: header.indexOf('guest_email'),
      roomName: header.indexOf('room_name'),
      bedName: header.indexOf('bed_name'),
      checkIn: header.indexOf('check_in'),
      checkOut: header.indexOf('check_out'),
      status: header.indexOf('status'),
      notes: header.indexOf('notes')
    }

    if (idx.guestEmail < 0 || idx.checkIn < 0 || idx.checkOut < 0) {
      return res.status(400).json({ error: 'CSV must include headers: guest_email, check_in, check_out' })
    }

    // Preload reference data
    const [{ data: guests }, { data: rooms }, { data: beds }, { data: bookings }] = await Promise.all([
      supabase.from('guests').select('id,email,name').eq('owner_id', ownerId),
      supabase.from('rooms').select('id,name').eq('owner_id', ownerId),
      supabase.from('beds').select('id,name,room_id').eq('owner_id', ownerId),
      supabase.from('bookings')
        .select('id, room_id, bed_id, check_in, check_out, status')
        .eq('owner_id', ownerId)
        .neq('status', 'cancelled')
    ])

    const guestByEmail = new Map<string, { id: string; name?: string }>()
    ;(guests || []).forEach((guest) => {
      if (guest.email) {
        guestByEmail.set(guest.email.toLowerCase(), { id: guest.id, name: guest.name })
      }
    })

    const roomByName = new Map<string, string>()
    ;(rooms || []).forEach((room) => {
      if (room.name) roomByName.set(room.name.toLowerCase(), room.id)
    })

    const bedByName = new Map<string, { id: string; roomId?: string | null }>()
    ;(beds || []).forEach((bed) => {
      if (bed.name) bedByName.set(bed.name.toLowerCase(), { id: bed.id, roomId: bed.room_id ?? null })
    })

    const issues: ImportIssue[] = []
    const validRows: BookingRow[] = []
    const pendingInserts: Array<{ roomId?: string | null; bedId?: string | null; checkIn: string; checkOut: string }> = []

    const totalRows = table.length - 1

    for (let r = 1; r < table.length; r++) {
      const rowNumber = r + 1
      const cols = table[r]
      if (!cols || cols.length === 0 || cols.every((c) => c.trim() === '')) continue

      const guestEmailRaw = normalize(cols[idx.guestEmail])
      if (!guestEmailRaw) {
        issues.push({ row: rowNumber, reason: 'Missing guest email' })
        continue
      }
      const guestEmail = guestEmailRaw.toLowerCase()
      const guestMatch = guestByEmail.get(guestEmail)
      if (!guestMatch) {
        issues.push({ row: rowNumber, email: guestEmailRaw, reason: 'Guest not found. Create guest first.' })
        continue
      }

      const guestName = idx.guestName >= 0 ? normalize(cols[idx.guestName]) : guestMatch.name

      const rawCheckIn = normalize(cols[idx.checkIn])
      const rawCheckOut = normalize(cols[idx.checkOut])
      if (!rawCheckIn || !rawCheckOut) {
        issues.push({ row: rowNumber, email: guestEmailRaw, reason: 'Missing check-in or check-out date' })
        continue
      }

      const checkInIso = toIsoDate(rawCheckIn)
      const checkOutIso = toIsoDate(rawCheckOut)
      if (!checkInIso || !checkOutIso) {
        issues.push({ row: rowNumber, email: guestEmailRaw, reason: 'Invalid check-in or check-out date' })
        continue
      }
      if (new Date(checkOutIso) <= new Date(checkInIso)) {
        issues.push({ row: rowNumber, email: guestEmailRaw, reason: 'Check-out must be after check-in' })
        continue
      }

      const roomName = idx.roomName >= 0 ? normalize(cols[idx.roomName]) : undefined
      const bedName = idx.bedName >= 0 ? normalize(cols[idx.bedName]) : undefined

      let roomId: string | null | undefined
      let bedId: string | null | undefined

      if (bedName) {
        const bedMatch = bedByName.get(bedName.toLowerCase())
        if (!bedMatch) {
          issues.push({ row: rowNumber, email: guestEmailRaw, reason: `Bed "${bedName}" not found` })
          continue
        }
        bedId = bedMatch.id
        roomId = bedMatch.roomId ?? null
      } else if (roomName) {
        const roomMatch = roomByName.get(roomName.toLowerCase())
        if (!roomMatch) {
          issues.push({ row: rowNumber, email: guestEmailRaw, reason: `Room "${roomName}" not found` })
          continue
        }
        roomId = roomMatch
        bedId = null
      } else {
        issues.push({ row: rowNumber, email: guestEmailRaw, reason: 'Provide room_name or bed_name' })
        continue
      }

      const statusRaw = idx.status >= 0 ? normalize(cols[idx.status]) : undefined
      const status = statusRaw && VALID_STATUSES.has(statusRaw.toLowerCase())
        ? statusRaw.toLowerCase()
        : 'confirmed'

      const notes = idx.notes >= 0 ? normalize(cols[idx.notes]) : undefined

      const hasConflict =
        status !== 'cancelled' &&
        ([...(bookings || []), ...pendingInserts].some((b) => {
          const unitMatch =
            (b.bed_id && bedId && b.bed_id === bedId) ||
            (!b.bed_id && !bedId && b.room_id === roomId)
          if (!unitMatch) return false
          return datesOverlap(b.check_in || b.checkIn, b.check_out || b.checkOut, checkInIso, checkOutIso)
        }))

      if (hasConflict) {
        issues.push({ row: rowNumber, email: guestEmailRaw, reason: 'Overlaps with existing booking' })
        continue
      }

      const entry: BookingRow = {
        rowNumber,
        guestEmail: guestEmailRaw,
        guestName,
        roomName,
        bedName,
        guestId: guestMatch.id,
        roomId: roomId ?? null,
        bedId: bedId ?? null,
        checkIn: checkInIso,
        checkOut: checkOutIso,
        status,
        notes
      }

      validRows.push(entry)
      pendingInserts.push({ roomId: roomId ?? null, bedId: bedId ?? null, checkIn: checkInIso, checkOut: checkOutIso })
    }

    const summary = {
      totalRows,
      ready: validRows.length,
      toInsert: validRows.length,
      skipped: issues.length
    }

    const preview = validRows.slice(0, 10).map((row) => ({
      row: row.rowNumber,
      guestEmail: row.guestEmail,
      guestName: row.guestName,
      room: row.bedName ? `Bed: ${row.bedName}` : row.roomName ? `Room: ${row.roomName}` : '—',
      checkIn: row.checkIn,
      checkOut: row.checkOut,
      status: row.status
    }))

    if (dryRun) {
      return res.status(200).json({ mode: 'dryRun', summary, preview, issues })
    }

    if (!validRows.length) {
      return res.status(200).json({
        mode: 'commit',
        summary,
        issues,
        message: 'No valid bookings to import'
      })
    }

    const payload = validRows.map((row) => ({
      owner_id: ownerId,
      guest_id: row.guestId,
      room_id: row.roomId,
      bed_id: row.bedId,
      check_in: row.checkIn,
      check_out: row.checkOut,
      status: row.status,
      notes: row.notes ?? null
    }))

    const { error: insertError } = await supabase
      .from('bookings')
      .insert(payload)

    if (insertError) {
      return res.status(500).json({ error: insertError.message })
    }

    return res.status(200).json({
      mode: 'commit',
      summary,
      issues,
      message: `Imported ${validRows.length} booking${validRows.length === 1 ? '' : 's'}. Skipped ${issues.length}.`
    })
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end('Method Not Allowed')
})
