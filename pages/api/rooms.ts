import { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '../../lib/apiAuth'
import { supabase } from '../../lib/supabase'

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, auth) => {
  const { method } = req
  const ownerId = auth.user?.id || 'demo-owner'

  switch (method) {
    case 'GET':
      try {
        const { data: rooms, error } = await supabase
          .from('rooms')
          .select(`
            *,
            beds(*)
          `)
          .eq('owner_id', ownerId)
          .order('created_at', { ascending: false })

        if (error) throw error
        res.status(200).json(rooms)
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch rooms' })
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
      } catch (error) {
        res.status(500).json({ error: 'Failed to create room' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
})
