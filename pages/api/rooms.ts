import { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '../../lib/apiAuth'
import { withCors } from '../../lib/corsHandler'
import { supabase } from '../../lib/supabase'
import { logAudit } from '../../lib/audit'

export default withCors(withAuth(async (req: NextApiRequest, res: NextApiResponse, auth) => {
  const { method } = req
  const ownerId = auth.user?.id || 'demo-owner'

  switch (method) {
    case 'GET':
      try {
        const id = (req.query.id as string | undefined) || undefined
        const base = supabase
          .from('rooms')
          .select(`
            *,
            beds(*)
          `)
          .eq('owner_id', ownerId)
          .neq('archived', true)
        const query = id ? base.eq('id', id).single() : base.order('created_at', { ascending: false })
        const { data: rooms, error } = (await query) as any

        if (error) throw error
        // Filter out archived beds client-side (nested filter is cumbersome in single query)
        const filtered = Array.isArray(rooms)
          ? rooms.map((r: any) => ({ ...r, beds: (r.beds || []).filter((b: any) => b.archived !== true) }))
          : rooms && typeof rooms === 'object'
          ? { ...rooms, beds: (rooms.beds || []).filter((b: any) => b.archived !== true) }
          : rooms
        res.status(200).json(filtered)
        if (id) await logAudit(req, auth, { owner_id: ownerId, resource: 'rooms', action: 'read', resource_id: id, fields: null, succeeded: true, status_code: 200 })
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch rooms' })
        const id = (req.query.id as string | undefined) || undefined
        if (id) await logAudit(req, auth, { owner_id: ownerId, resource: 'rooms', action: 'read', resource_id: id, fields: null, succeeded: false, status_code: 500 })
      }
      break

    case 'POST':
      try {
        const { name, type, max_capacity, beds } = req.body
        
        if (!name || !type || !max_capacity) {
          return res.status(400).json({ error: 'Name, type, and max_capacity are required' })
        }

        // Create room
        const { data: room, error: roomError } = await supabase
          .from('rooms')
          .insert({
            name,
            type,
            max_capacity,
            owner_id: ownerId
          })
          .select()
          .single()

        if (roomError) throw roomError

        // Create beds if it's a dorm and beds are provided
        if (type === 'dorm' && beds && Array.isArray(beds)) {
          const bedsToInsert = beds.map((bedName: string) => ({
            room_id: room.id,
            name: bedName,
            owner_id: ownerId
          }))

          const { error: bedsError } = await supabase
            .from('beds')
            .insert(bedsToInsert)

          if (bedsError) throw bedsError
        }

        // Return room with beds
        const { data: fullRoom, error: fetchError } = await supabase
          .from('rooms')
          .select(`
            *,
            beds(*)
          `)
          .eq('id', room.id)
          .single()

        if (fetchError) throw fetchError
        res.status(201).json(fullRoom)
        await logAudit(req, auth, { owner_id: ownerId, resource: 'rooms', action: 'create', resource_id: fullRoom?.id, fields: Object.keys(req.body || {}), succeeded: true, status_code: 201 })
      } catch (error) {
        res.status(500).json({ error: 'Failed to create room' })
        await logAudit(req, auth, { owner_id: ownerId, resource: 'rooms', action: 'create', resource_id: null, fields: Object.keys(req.body || {}), succeeded: false, status_code: 500 })
      }
      break

    case 'PUT':
      try {
        const { id, name, type, max_capacity, beds } = req.body as {
          id?: string
          name?: string
          type?: 'private' | 'dorm'
          max_capacity?: number
          beds?: string[]
        }
        if (!id) return res.status(400).json({ error: 'Room ID is required' })

        // Update room fields
        const update: Record<string, any> = {}
        if (typeof name !== 'undefined') update.name = name
        if (typeof type !== 'undefined') update.type = type
        if (typeof max_capacity !== 'undefined') update.max_capacity = max_capacity

        if (Object.keys(update).length) {
          const { error: roomErr } = await supabase.from('rooms').update(update).eq('id', id).eq('owner_id', ownerId)
          if (roomErr) throw roomErr
        }

        // If room becomes private, remove beds
        if (typeof type !== 'undefined' && type !== 'dorm') {
          const { error: delBedsErr } = await supabase.from('beds').delete().eq('room_id', id).eq('owner_id', ownerId)
          if (delBedsErr) throw delBedsErr
        }

        // If beds array provided for dorm, replace set
        if (Array.isArray(beds)) {
          // Delete existing beds then insert provided list
          const { error: delErr } = await supabase.from('beds').delete().eq('room_id', id).eq('owner_id', ownerId)
          if (delErr) throw delErr
          if (beds.length) {
            const toInsert = beds.map((name) => ({ room_id: id, name, owner_id: ownerId }))
            const { error: insErr } = await supabase.from('beds').insert(toInsert)
            if (insErr) throw insErr
          }
        }

        const { data: fullRoom, error: fetchError } = await supabase
          .from('rooms')
          .select(`
            *,
            beds(*)
          `)
          .eq('id', id)
          .single()
        if (fetchError) throw fetchError
        res.status(200).json(fullRoom)
        await logAudit(req, auth, { owner_id: ownerId, resource: 'rooms', action: 'update', resource_id: id, fields: Object.keys(req.body || {}), succeeded: true, status_code: 200 })
      } catch (error) {
        res.status(500).json({ error: 'Failed to update room' })
        await logAudit(req, auth, { owner_id: ownerId, resource: 'rooms', action: 'update', resource_id: (req.body||{}).id, fields: Object.keys(req.body || {}), succeeded: false, status_code: 500 })
      }
      break

    case 'DELETE':
      try {
        const { id } = req.body as { id?: string }
        if (!id) return res.status(400).json({ error: 'Room ID is required' })

        // Check for active bookings linked to this room or its beds
        const { data: roomBeds, error: bedsErr } = await supabase.from('beds').select('id').eq('room_id', id).eq('owner_id', ownerId)
        if (bedsErr) throw bedsErr
        const bedIds = (roomBeds || []).map((b: any) => b.id)
        let orFilters = [`room_id.eq.${id}`]
        if (bedIds.length) {
          orFilters = orFilters.concat(bedIds.map((bid) => `bed_id.eq.${bid}`))
        }
        const { data: activeBookings, error: bookingsErr } = await supabase
          .from('bookings')
          .select('id,status')
          .eq('owner_id', ownerId)
          .neq('status', 'cancelled')
          .or(orFilters.join(','))
        if (bookingsErr) throw bookingsErr
        if (activeBookings && activeBookings.length > 0) {
          return res.status(400).json({ error: 'Room has active bookings. Cancel them before deleting.' })
        }

        // Archive beds then room
        const { error: delBeds } = await supabase
          .from('beds')
          .update({ archived: true, archived_at: new Date().toISOString() })
          .eq('room_id', id)
          .eq('owner_id', ownerId)
        if (delBeds) throw delBeds
        const { error } = await supabase
          .from('rooms')
          .update({ archived: true, archived_at: new Date().toISOString() })
          .eq('id', id)
          .eq('owner_id', ownerId)
        if (error) throw error
        res.status(200).json({ success: true })
        await logAudit(req, auth, { owner_id: ownerId, resource: 'rooms', action: 'archive', resource_id: id, fields: ['archived'], succeeded: true, status_code: 200 })
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete room' })
        await logAudit(req, auth, { owner_id: ownerId, resource: 'rooms', action: 'archive', resource_id: (req.body||{}).id, fields: ['archived'], succeeded: false, status_code: 500 })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}))
