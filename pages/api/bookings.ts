import { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '../../lib/apiAuth'
import { supabase } from '../../lib/supabase'

function isDateOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const s1 = new Date(start1)
  const e1 = new Date(end1)
  const s2 = new Date(start2)
  const e2 = new Date(end2)
  
  return s1 < e2 && s2 < e1
}

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, auth) => {
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
      } catch (error) {
        res.status(500).json({ error: 'Failed to update booking' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
})
