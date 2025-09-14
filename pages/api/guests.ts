import { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '../../lib/apiAuth'
import { supabase } from '../../lib/supabase'

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, auth) => {
  const { method } = req
  const ownerId = auth.user?.id || 'demo-owner'

  switch (method) {
    case 'GET':
      try {
        const { data: guests, error } = await supabase
          .from('guests')
          .select('*')
          .eq('owner_id', ownerId)
          .order('created_at', { ascending: false })

        if (error) throw error
        res.status(200).json(guests)
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch guests' })
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
      } catch (error) {
        res.status(500).json({ error: 'Failed to create guest' })
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
      } catch (error) {
        res.status(500).json({ error: 'Failed to update guest' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
})
