import { createClient } from '@supabase/supabase-js'
import { NextApiRequest, NextApiResponse } from 'next'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const adminToken = process.env.ADMIN_API_TOKEN
// Default to ON unless explicitly disabled with REQUIRE_API_AUTH=0
const requireAuth = process.env.REQUIRE_API_AUTH !== '0'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function authenticateRequest(req: NextApiRequest, res: NextApiResponse) {
  // Skip auth if not required (MVP mode)
  if (!requireAuth) {
    return { user: null, isAdmin: false }
  }

  // Check admin token first (emergency/CI access)
  const adminTokenHeader = req.headers['x-admin-token']
  if (adminTokenHeader === adminToken && adminToken) {
    return { user: null, isAdmin: true }
  }

  // Check JWT token
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' })
    return null
  }

  const token = authHeader.slice(7)
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !user) {
    res.status(401).json({ error: 'Invalid token' })
    return null
  }

  return { user, isAdmin: false }
}

export function withAuth(handler: (req: NextApiRequest, res: NextApiResponse, auth: { user: any, isAdmin: boolean }) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const auth = await authenticateRequest(req, res)
    if (!auth) return // Response already sent
    
    return handler(req, res, auth)
  }
}
