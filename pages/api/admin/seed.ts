import { NextApiRequest, NextApiResponse } from 'next'
import { withCors } from '../../../lib/corsHandler'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../../lib/supabase'

let cachedAdmin: SupabaseClient<Database> | null = null

function getAdminClient() {
  if (cachedAdmin) return cachedAdmin
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase admin configuration missing')
  }
  cachedAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)
  return cachedAdmin
}

export default withCors(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
    return
  }

  // Check admin token
  const adminToken = process.env.ADMIN_API_TOKEN
  const adminTokenHeader = req.headers['x-admin-token']
  if (!adminToken || adminTokenHeader !== adminToken) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const payload = (req.body && typeof req.body === 'object') ? req.body : {}
  const { owner_id } = payload as { owner_id?: string }

  if (!owner_id) {
    res.status(400).json({ error: 'Owner ID is required' })
    return
  }

  try {
    const supabaseAdmin = getAdminClient()

    // Create hostels
    const { data: hostels, error: hostelsError } = await supabaseAdmin
      .from('hostels')
      .insert([
        { name: 'Hostel Lisbon', city: 'Lisbon', country: 'Portugal', owner_id },
        { name: 'Dorm Hostel', city: 'Lisbon', country: 'Portugal', owner_id },
      ])
      .select()

    if (hostelsError) throw hostelsError

    // Create guests
    const { data: guests, error: guestsError } = await supabaseAdmin
      .from('guests')
      .insert([
        { name: 'John Doe', email: 'john@example.com', phone: '+351 912 345 678', nationality: 'USA' },
        { name: 'Jane Smith', email: 'jane@example.com', phone: '+351 913 456 789', nationality: 'UK' },
        { name: 'Mike Johnson', email: 'mike@example.com', nationality: 'Canada' },
      ])
      .select()

    if (guestsError) throw guestsError

    // Create a booking arriving today
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const john = guests.find(g => g.name === 'John Doe')
    const hostel = hostels.find(h => h.name === 'Hostel Lisbon')

    if (john && hostel) {
      const { error: bookingError } = await supabaseAdmin
        .from('bookings')
        .insert({
          guest_id: john.id,
          hostel_id: hostel.id,
          check_in: today.toISOString().split('T')[0],
          check_out: tomorrow.toISOString().split('T')[0],
          status: 'confirmed',
          amount: 50.00,
        })

      if (bookingError) throw bookingError
    }

    res.status(200).json({ message: 'Demo data seeded successfully' })
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to seed demo data' })
  }
})
