import { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '../../lib/apiAuth'
import { withCors } from '../../lib/corsHandler'
import { supabase } from '../../lib/supabase'

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

  switch (method) {
    case 'GET':
      try {
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select(`
            *,
            guests(*),
            rooms(*),
            beds(*)
          `)
          .eq('owner_id', ownerId)
          .order('check_in', { ascending: true })

        if (error) throw error
        res.status(200).json(bookings)
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookings' })
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
      } catch (error) {
        res.status(500).json({ error: 'Failed to create booking' })
      }
      break

    case 'PUT':
      try {
        const { id, guest_id, room_id, bed_id, check_in, check_out, status, notes } = req.body as {
          id?: string; guest_id?: string; room_id?: string | null; bed_id?: string | null; check_in?: string; check_out?: string; status?: string; notes?: string
        }

        if (!id) {
          return res.status(400).json({ error: 'Booking ID is required' })
        }

        // Fetch current booking to derive missing fields for validation
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

        // Check for overlapping bookings on the resolved unit (excluding current booking)
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

        // Build partial update to avoid unintentionally nulling fields
        const update: Record<string, any> = {}
        if (typeof guest_id !== 'undefined') update.guest_id = guest_id
        if (typeof room_id !== 'undefined') update.room_id = room_id
        if (typeof bed_id !== 'undefined') update.bed_id = bed_id
        if (typeof check_in !== 'undefined') update.check_in = check_in
        if (typeof check_out !== 'undefined') update.check_out = check_out
        if (typeof status !== 'undefined') update.status = status
        if (typeof notes !== 'undefined') update.notes = notes

        const { data: booking, error } = await supabase
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
          .single()

        if (error) throw error
        res.status(200).json(booking)
      } catch (error) {
        res.status(500).json({ error: 'Failed to update booking' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}))
