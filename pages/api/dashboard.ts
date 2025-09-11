import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseServer } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // In a real app, you'd get userId from session/auth
  // For demo, we'll return all hostel data with bookings and Lisbon tax info
  try {
    // Get all hostels with their bookings and guest info
    const { data: hostels, error: hostelsError } = await supabaseServer
      .from('hostels')
      .select(`
        *,
        bookings (
          *,
          guests (*)
        )
      `)

    if (hostelsError) {
      throw hostelsError
    }

    // Get total bookings count
    const { count: totalBookings, error: countError } = await supabaseServer
      .from('bookings')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      throw countError
    }

    // Get total revenue
    const { data: revenueData, error: revenueError } = await supabaseServer
      .from('bookings')
      .select('amount')

    if (revenueError) {
      throw revenueError
    }

    const totalRevenue = revenueData?.reduce((sum, booking) => sum + booking.amount, 0) || 0

    // Get Lisbon tax information
    const { data: taxRules, error: taxError } = await supabaseServer
      .from('tax_rules')
      .select('*')
      .eq('city', 'Lisbon')

    if (taxError) {
      throw taxError
    }

    res.status(200).json({
      hostels: hostels || [],
      stats: {
        totalBookings: totalBookings || 0,
        totalRevenue,
        lisbonTaxRate: taxRules?.[0]?.tax_rate || 4,
        taxConditions: taxRules?.[0]?.conditions || 'City tax applied to all stays'
      }
    })
  } catch (error) {
    console.error('Dashboard data error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}