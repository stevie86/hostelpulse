import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ADMIN = process.env.ADMIN_API_TOKEN

const admin = createClient(supabaseUrl, serviceKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end('Method Not Allowed')
  }
  if (!ADMIN || req.headers['x-admin-token'] !== ADMIN) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const { email, password, name } = req.body as { email?: string; password?: string; name?: string }
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })
  try {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: name || 'Demo Owner' },
    } as any)
    if (error) throw error
    return res.status(200).json({ id: data.user?.id, email: data.user?.email })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Create failed' })
  }
}

