import { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '../../lib/apiAuth'
import { withCors } from '../../lib/corsHandler'
import { supabase } from '../../lib/supabase'

export default withCors(withAuth(async (req: NextApiRequest, res: NextApiResponse, auth) => {
  const { method } = req
  const ownerId = auth.user?.id || 'demo-owner'

  switch (method) {
    case 'GET':
      try {
        // Get payment records with related booking and guest information
        const { data: payments, error } = await supabase
          .from('payments')
          .select(`
            *,
            bookings!inner(guests(name))
          `)
          .eq('owner_id', ownerId)
          .order('created_at', { ascending: false })

        if (error) throw error

        res.status(200).json(payments)
      } catch (error) {
        console.error('Error fetching payments:', error)
        res.status(500).json({ error: 'Failed to fetch payments' })
      }
      break

    case 'POST':
      try {
        const { booking_id, amount, currency, method: paymentMethod, status, notes } = req.body

        if (!booking_id || amount === undefined || !currency || !paymentMethod || !status) {
          return res.status(400).json({ error: 'Booking ID, amount, currency, method, and status are required' })
        }

        const payment = {
          booking_id,
          amount,
          currency,
          method: paymentMethod,
          status,
          notes,
          owner_id: ownerId
        }

        const { data, error } = await supabase
          .from('payments')
          .insert([payment])
          .select()
          .single()

        if (error) throw error

        res.status(201).json(data)
      } catch (error) {
        console.error('Error creating payment:', error)
        res.status(500).json({ error: 'Failed to create payment' })
      }
      break

    case 'PUT':
      try {
        const { id, status, notes } = req.body

        if (!id) {
          return res.status(400).json({ error: 'Payment ID is required' })
        }

        const updates: any = {}
        if (status) updates.status = status
        if (notes) updates.notes = notes

        const { data, error } = await supabase
          .from('payments')
          .update(updates)
          .eq('id', id)
          .eq('owner_id', ownerId)
          .select()
          .single()

        if (error) throw error

        res.status(200).json(data)
      } catch (error) {
        console.error('Error updating payment:', error)
        res.status(500).json({ error: 'Failed to update payment' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}))