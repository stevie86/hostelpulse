import { NextApiRequest, NextApiResponse } from 'next'
import { withCors } from '../../../lib/corsHandler'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let cachedAdmin: SupabaseClient | null = null

function getAdminClient() {
  if (cachedAdmin) return cachedAdmin

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase admin configuration missing')
  }
  cachedAdmin = createClient(supabaseUrl, supabaseServiceKey)
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
  const { email, password, name } = payload as { email?: string; password?: string; name?: string }

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  try {
    const supabaseAdmin = getAdminClient()

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: name || 'Demo Owner' },
    })

    if (error) {
      throw error
    }

    res.status(200).json({ id: data.user?.id, email: data.user?.email })
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to create demo user' })
  }
})
