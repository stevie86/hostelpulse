import { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '../../lib/apiAuth'
import { withCors } from '../../lib/corsHandler'
import { supabase } from '../../lib/supabase'
import { logAudit } from '../../lib/audit'

export default withCors(withAuth(async (req: NextApiRequest, res: NextApiResponse, auth) => {
  const { method } = req
  const ownerId = auth.user?.id || 'demo-owner'
  console.log('Guests API - Method:', method, 'OwnerId:', ownerId, 'Auth user:', auth.user?.id, 'IsAdmin:', auth.isAdmin)

  switch (method) {
    case 'GET':
      try {
        console.log('Guests API - Executing query for ownerId:', ownerId)
        const id = (req.query.id as string | undefined) || undefined
        const base = supabase
          .from('guests')
          .select('*')
          .eq('owner_id', ownerId)
          .neq('archived', true)
        const query = id ? base.eq('id', id).single() : base.order('created_at', { ascending: false })
        const { data: guests, error } = (await query) as any

        console.log('Guests API - Query result:', { guestsCount: guests?.length, error })
        if (error) throw error
        res.status(200).json(guests)
        if (id) await logAudit(req, auth, { owner_id: ownerId, resource: 'guests', action: 'read', resource_id: id, fields: null, succeeded: true, status_code: 200 })
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch guests' })
        const q: any = req.query || {}
        const id = (q.id as string | undefined) || undefined
        if (id) await logAudit(req, auth, { owner_id: ownerId, resource: 'guests', action: 'read', resource_id: id, fields: null, succeeded: false, status_code: 500 })
      }
      break

    case 'POST':
      try {
        const { name, email, phone, notes } = req.body
        
        if (!name || !email) {
          return res.status(400).json({ error: 'Name and email are required' })
        }

        const { data: guest, error } = await supabase
          .from('guests')
          .insert({
            name,
            email,
            phone,
            notes,
            owner_id: ownerId
          })
          .select()
          .single()

        if (error) throw error
        res.status(201).json(guest)
        await logAudit(req, auth, { owner_id: ownerId, resource: 'guests', action: 'create', resource_id: guest?.id, fields: Object.keys(req.body || {}), succeeded: true, status_code: 201 })
      } catch (error) {
        res.status(500).json({ error: 'Failed to create guest' })
        await logAudit(req, auth, { owner_id: ownerId, resource: 'guests', action: 'create', resource_id: null, fields: Object.keys(req.body || {}), succeeded: false, status_code: 500 })
      }
      break

    case 'PUT':
      try {
        const { id, name, email, phone, notes } = req.body
        
        if (!id) {
          return res.status(400).json({ error: 'Guest ID is required' })
        }

        const { data: guest, error } = await supabase
          .from('guests')
          .update({ name, email, phone, notes })
          .eq('id', id)
          .eq('owner_id', ownerId)
          .select()
          .single()

        if (error) throw error
        res.status(200).json(guest)
        await logAudit(req, auth, { owner_id: ownerId, resource: 'guests', action: 'update', resource_id: id, fields: Object.keys(req.body || {}), succeeded: true, status_code: 200 })
      } catch (error) {
        res.status(500).json({ error: 'Failed to update guest' })
        await logAudit(req, auth, { owner_id: ownerId, resource: 'guests', action: 'update', resource_id: (req.body||{}).id, fields: Object.keys(req.body || {}), succeeded: false, status_code: 500 })
      }
      break

    case 'DELETE':
      try {
        const { id } = req.body as { id?: string }
        if (!id) {
          return res.status(400).json({ error: 'Guest ID is required' })
        }

        // Prevent delete if there are active bookings for this guest
        const { data: activeBookings, error: bookingsErr } = await supabase
          .from('bookings')
          .select('id,status')
          .eq('owner_id', ownerId)
          .eq('guest_id', id)
          .neq('status', 'cancelled')

        if (bookingsErr) throw bookingsErr
        if (activeBookings && activeBookings.length > 0) {
          return res.status(400).json({ error: 'Guest has active bookings. Cancel them before deleting.' })
        }

        const { error } = await supabase
          .from('guests')
          .update({ archived: true, archived_at: new Date().toISOString() })
          .eq('id', id)
          .eq('owner_id', ownerId)
        if (error) throw error
        res.status(200).json({ success: true })
        await logAudit(req, auth, { owner_id: ownerId, resource: 'guests', action: 'archive', resource_id: id, fields: ['archived'], succeeded: true, status_code: 200 })
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete guest' })
        await logAudit(req, auth, { owner_id: ownerId, resource: 'guests', action: 'archive', resource_id: (req.body||{}).id, fields: ['archived'], succeeded: false, status_code: 500 })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}))
