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
        const { id, guest_id, room_id, bed_id, check_in, check_out, status, notes } = req.body
        
        if (!id) {
          return res.status(400).json({ error: 'Booking ID is required' })
        }

        // Check for overlapping bookings (excluding current booking)
        if (check_in && check_out && (room_id || bed_id)) {
          const { data: existingBookings, error: fetchError } = await supabase
            .from('bookings')
            .select('*')
            .eq('owner_id', ownerId)
            .neq('id', id)
            .neq('status', 'cancelled')
            .or(bed_id ? `bed_id.eq.${bed_id}` : `room_id.eq.${room_id}`)

          if (fetchError) throw fetchError

          const hasOverlap = existingBookings?.some(booking => 
            isDateOverlap(booking.check_in, booking.check_out, check_in, check_out)
          )

          if (hasOverlap) {
            return res.status(409).json({ error: 'Booking conflicts with existing reservation' })
          }
        }

        const { data: booking, error } = await supabase
          .from('bookings')
          .update({ guest_id, room_id, bed_id, check_in, check_out, status, notes })
          .eq('id', id)
          .eq('owner_id', ownerId)
          .select(`
            *,
            guests(*),
            rooms(*),
            beds(*)
          `)
          .single()

        if (error) throw error
        res.status(200).json(booking)
        await logAudit(req, auth, { owner_id: ownerId, resource: 'bookings', action: 'update', resource_id: id, fields: Object.keys(req.body || {}), succeeded: true, status_code: 200 })
      } catch (error) {
        res.status(500).json({ error: 'Failed to update booking' })
        await logAudit(req, auth, { owner_id: ownerId, resource: 'bookings', action: 'update', resource_id: (req.body||{}).id, fields: Object.keys(req.body || {}), succeeded: false, status_code: 500 })
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
