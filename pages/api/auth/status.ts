import { NextApiRequest, NextApiResponse } from 'next'
import { withCors } from '../../../lib/corsHandler'
import { supabase } from '../../../lib/supabase'
import { createClient } from '@supabase/supabase-js'

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, supabaseServiceKey)

export default withCors(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const authHeader = req.headers.authorization
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header', authenticated: false })
  }

  const token = authHeader.slice(7)
  
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token', authenticated: false })
    }
    
    res.status(200).json({ 
      authenticated: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', authenticated: false })
  }
})
