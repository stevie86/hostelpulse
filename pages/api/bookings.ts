import { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '../../lib/apiAuth'
import { withCors } from '../../lib/corsHandler'
import { supabase } from '../../lib/supabase'
import { logAudit } from '../../lib/audit'

function isDateOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const s1 = new Date(start1)
  const e1 = new Date(end1)
  const s2 = new Date(start2)
  const e2 = new Date(end2)
  
  return s1 < e2 && s2 < e1
}

export default withCors(withAuth(async (req: NextApiRequest, res: NextApiResponse, auth) => {
  const { method } = req
  const ownerId = auth.user?.id || 'demo-owner'
  console.log('Bookings API - Method:', method, 'OwnerId:', ownerId, 'Auth user:', auth.user?.id, 'IsAdmin:', auth.isAdmin)

  switch (method) {
    case 'GET':
      try {
        console.log('Bookings API - Executing query for ownerId:', ownerId)
        const id = (req.query.id as string | undefined) || undefined
        const base = supabase
          .from('bookings')
          .select(`
            *,
            guests(*),
            rooms(*),
            beds(*)
          `)
          .eq('owner_id', ownerId)
        const query = id ? base.eq('id', id).single() : base.order('check_in', { ascending: true })
        const { data: bookings, error } = (await query) as any

        console.log('Bookings API - Query result:', { bookingsCount: bookings?.length, error })
        if (error) throw error
        res.status(200).json(bookings)
        if (id) await logAudit(req, auth, { owner_id: ownerId, resource: 'bookings', action: 'read', resource_id: id, fields: null, succeeded: true, status_code: 200 })
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookings' })
        const id = (req.query.id as string | undefined) || undefined
        if (id) await logAudit(req, auth, { owner_id: ownerId, resource: 'bookings', action: 'read', resource_id: id, fields: null, succeeded: false, status_code: 500 })
      }
      break

    case 'POST':
      try {
        const { guest_id, room_id, bed_id, check_in, check_out, status = 'confirmed', notes } = req.body
        
        if (!guest_id || !check_in || !check_out) {
          return res.status(400).json({ error: 'Guest ID, check-in, and check-out are required' })
        }

        if (!room_id && !bed_id) {
          return res.status(400).json({ error: 'Either room_id or bed_id is required' })
        }

        // Check for overlapping bookings
        const { data: existingBookings, error: fetchError } = await supabase
          .from('bookings')
          .select('*')
          .eq('owner_id', ownerId)
          .neq('status', 'cancelled')
          .or(bed_id ? `bed_id.eq.${bed_id}` : `room_id.eq.${room_id}`)

        if (fetchError) throw fetchError

        const hasOverlap = existingBookings?.some(booking => 
          isDateOverlap(booking.check_in, booking.check_out, check_in, check_out)
        )

        if (hasOverlap) {
          return res.status(409).json({ error: 'Booking conflicts with existing reservation' })
        }

        const { data: booking, error } = await supabase
          .from('bookings')
          .insert({
            guest_id,
            room_id,
            bed_id,
            check_in,
            check_out,
            status,
            notes,
            owner_id: ownerId
          })
          .select(`
            *,
            guests(*),
            rooms(*),
            beds(*)
          `)
          .single()

        if (error) throw error
        res.status(201).json(booking)
        await logAudit(req, auth, { owner_id: ownerId, resource: 'bookings', action: 'create', resource_id: booking?.id, fields: Object.keys(req.body || {}), succeeded: true, status_code: 201 })
      } catch (error) {
        res.status(500).json({ error: 'Failed to create booking' })
        await logAudit(req, auth, { owner_id: ownerId, resource: 'bookings', action: 'create', resource_id: null, fields: Object.keys(req.body || {}), succeeded: false, status_code: 500 })
      }
      break

    case 'PUT':
      try {
        const { id, guest_id, room_id, bed_id, check_in, check_out, status, notes } = req.body as {
          id?: string
          guest_id?: string
          room_id?: string | null
          bed_id?: string | null
          check_in?: string
          check_out?: string
          status?: string
          notes?: string
        }

        if (!id) {
          return res.status(400).json({ error: 'Booking ID is required' })
        }

        const { data: current, error: curErr } = await supabase
          .from('bookings')
          .select('id, room_id, bed_id, check_in, check_out')
          .eq('id', id)
          .eq('owner_id', ownerId)
          .single()

        if (curErr || !current) {
          return res.status(404).json({ error: 'Booking not found' })
        }

        const nextRoomId = typeof room_id !== 'undefined' ? room_id : current.room_id
        const nextBedId = typeof bed_id !== 'undefined' ? bed_id : current.bed_id
        const nextCheckIn = typeof check_in !== 'undefined' ? check_in : current.check_in
        const nextCheckOut = typeof check_out !== 'undefined' ? check_out : current.check_out

        if (nextCheckIn && nextCheckOut && (nextRoomId || nextBedId)) {
          const { data: existingBookings, error: fetchError } = await supabase
            .from('bookings')
            .select('id, check_in, check_out')
            .eq('owner_id', ownerId)
            .neq('id', id)
            .neq('status', 'cancelled')
            .or(nextBedId ? `bed_id.eq.${nextBedId}` : `room_id.eq.${nextRoomId}`)

          if (fetchError) throw fetchError

          const hasOverlap = existingBookings?.some(booking =>
            isDateOverlap(booking.check_in, booking.check_out, nextCheckIn, nextCheckOut)
          )

          if (hasOverlap) {
            return res.status(409).json({ error: 'Booking conflicts with existing reservation' })
          }
        }

        const update: Record<string, any> = {}
        if (typeof guest_id !== 'undefined') update.guest_id = guest_id
        if (typeof room_id !== 'undefined') update.room_id = room_id
        if (typeof bed_id !== 'undefined') update.bed_id = bed_id
        if (typeof check_in !== 'undefined') update.check_in = check_in
        if (typeof check_out !== 'undefined') update.check_out = check_out
        if (typeof status !== 'undefined') update.status = status
        if (typeof notes !== 'undefined') update.notes = notes

        const query = supabase
          .from('bookings')
          .update(update)
          .eq('id', id)
          .eq('owner_id', ownerId)
          .select(`
            *,
            guests(*),
            rooms(*),
            beds(*)
          `)

        const { data: booking, error } = await query.single()

        if (error) throw error
        res.status(200).json(booking)
        await logAudit(req, auth, { owner_id: ownerId, resource: 'bookings', action: 'update', resource_id: id, fields: Object.keys(update), succeeded: true, status_code: 200 })
      } catch (error) {
        const statusCode = (error as any)?.code === 'PGRST116' ? 404 : 500
        res.status(statusCode).json({ error: statusCode === 404 ? 'Booking not found' : 'Failed to update booking' })
        await logAudit(req, auth, { owner_id: ownerId, resource: 'bookings', action: 'update', resource_id: (req.body || {}).id, fields: Object.keys(req.body || {}), succeeded: false, status_code: statusCode })
      }
      break

    case 'DELETE':
      try {
        const { id } = req.body as { id?: string }
        if (!id) return res.status(400).json({ error: 'Booking ID is required' })
        // Soft-delete: cancel booking (archive)
        const { error } = await supabase
          .from('bookings')
          .update({ status: 'cancelled', archived: true, archived_at: new Date().toISOString() })
          .eq('id', id)
          .eq('owner_id', ownerId)
        if (error) throw error
        res.status(200).json({ success: true })
        await logAudit(req, auth, { owner_id: ownerId, resource: 'bookings', action: 'archive', resource_id: id, fields: ['status','archived'], succeeded: true, status_code: 200 })
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete booking' })
        await logAudit(req, auth, { owner_id: ownerId, resource: 'bookings', action: 'archive', resource_id: (req.body||{}).id, fields: ['status','archived'], succeeded: false, status_code: 500 })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}))
