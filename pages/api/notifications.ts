import { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '../../lib/apiAuth'
import { withCors } from '../../lib/corsHandler'
import { supabase } from '../../lib/supabase'

type Notification = {
  id: string
  created_at: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'urgent' | 'success'
  read: boolean
  booking_id?: string
  guest_id?: string
}

export default withCors(withAuth(async (req: NextApiRequest, res: NextApiResponse, auth) => {
  const { method } = req
  const userId = auth.user?.id || 'demo-user'

  switch (method) {
    case 'GET':
      try {
        const { data: notifications, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('owner_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error

        res.status(200).json(notifications)
      } catch (error) {
        console.error('Error fetching notifications:', error)
        res.status(500).json({ error: 'Failed to fetch notifications' })
      }
      break

    case 'POST':
      try {
        const { title, message, type, booking_id, guest_id } = req.body

        if (!title || !message) {
          return res.status(400).json({ error: 'Title and message are required' })
        }

        const notification = {
          user_id: userId,
          title,
          message,
          type: type || 'info',
          read: false,
          booking_id,
          guest_id,
          owner_id: userId
        }

        const { data, error } = await supabase
          .from('notifications')
          .insert([notification])
          .select()
          .single()

        if (error) throw error

        res.status(201).json(data)
      } catch (error) {
        console.error('Error creating notification:', error)
        res.status(500).json({ error: 'Failed to create notification' })
      }
      break

    case 'PUT':
      try {
        const { id, read } = req.body

        if (!id) {
          return res.status(400).json({ error: 'Notification ID is required' })
        }

        const { data, error } = await supabase
          .from('notifications')
          .update({ read })
          .eq('id', id)
          .eq('owner_id', userId)
          .select()
          .single()

        if (error) throw error

        res.status(200).json(data)
      } catch (error) {
        console.error('Error updating notification:', error)
        res.status(500).json({ error: 'Failed to update notification' })
      }
      break

    case 'DELETE':
      try {
        const { id } = req.body

        if (!id) {
          return res.status(400).json({ error: 'Notification ID is required' })
        }

        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', id)
          .eq('owner_id', userId)

        if (error) throw error

        res.status(200).json({ success: true })
      } catch (error) {
        console.error('Error deleting notification:', error)
        res.status(500).json({ error: 'Failed to delete notification' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}))