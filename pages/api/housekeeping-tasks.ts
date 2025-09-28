import { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '../../lib/apiAuth'
import { withCors } from '../../lib/corsHandler'
import { supabase } from '../../lib/supabase'

type HousekeepingTask = {
  id: string
  room_id: string
  room_name: string
  assigned_to?: string
  assigned_date: string
  completed: boolean
  completed_by?: string
  completed_at?: string
  notes?: string
  task_type: 'checkout_cleaning' | 'maintenance' | 'inspection' | 'deep_clean'
  owner_id: string
}

export default withCors(withAuth(async (req: NextApiRequest, res: NextApiResponse, auth) => {
  const { method } = req
  const ownerId = auth.user?.id || 'demo-owner'

  switch (method) {
    case 'GET':
      try {
        // First, get all bookings that require housekeeping (recently checked out)
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            room_id,
            bed_id,
            check_out,
            status,
            rooms(name),
            beds(name),
            guests(name)
          `)
          .eq('owner_id', ownerId)
          .gte('check_out', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
          .in('status', ['confirmed', 'cancelled'])

        if (bookingsError) throw bookingsError

        // Create housekeeping tasks based on bookings
        const tasks: HousekeepingTask[] = bookings.map(booking => ({
          id: `hk-${booking.id}`,
          room_id: booking.room_id || (booking.beds as any)?.room_id || booking.id,
          room_name: booking.beds ? `Bed: ${(booking.beds as any).name}` : booking.rooms ? `Room: ${(booking.rooms as any).name}` : 'Unassigned',
          assigned_date: new Date().toISOString(),
          completed: false, // In a real app, this would come from the actual housekeeping table
          task_type: 'checkout_cleaning',
          notes: `Clean after ${(booking.guests as any)?.name || 'guest'} checkout on ${new Date(booking.check_out).toLocaleDateString()}`,
          owner_id: ownerId
        }))

        res.status(200).json(tasks)
      } catch (error) {
        console.error('Error fetching housekeeping tasks:', error)
        res.status(500).json({ error: 'Failed to fetch housekeeping tasks' })
      }
      break

    case 'POST':
      try {
        const { room_id, task_type, notes } = req.body

        if (!room_id || !task_type) {
          return res.status(400).json({ error: 'Room ID and task type are required' })
        }

        // Create a new housekeeping task
        const newTask = {
          room_id,
          task_type,
          notes,
          assigned_date: new Date().toISOString(),
          completed: false,
          owner_id: ownerId
        }

        const { data, error } = await supabase
          .from('housekeeping_tasks') // This table doesn't exist yet, but we'll create it
          .insert([newTask])
          .select()
          .single()

        if (error) throw error

        res.status(201).json(data)
      } catch (error) {
        console.error('Error creating housekeeping task:', error)
        res.status(500).json({ error: 'Failed to create housekeeping task' })
      }
      break

    case 'PUT':
      try {
        const { id, completed } = req.body

        if (!id) {
          return res.status(400).json({ error: 'Task ID is required' })
        }

        const { data, error } = await supabase
          .from('housekeeping_tasks')
          .update({ 
            completed, 
            completed_at: completed ? new Date().toISOString() : null,
            completed_by: completed ? auth.user?.email : null
          })
          .eq('id', id)
          .eq('owner_id', ownerId)
          .select()
          .single()

        if (error) throw error

        res.status(200).json(data)
      } catch (error) {
        console.error('Error updating housekeeping task:', error)
        res.status(500).json({ error: 'Failed to update housekeeping task' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}))