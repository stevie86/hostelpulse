import type { NextApiRequest, NextApiResponse } from 'next'
import { hasServiceRole, hasSupabaseEnv } from '../../lib/supabase'

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const mode = supabaseUrl.includes('supabase.co') ? 'hosted' : (supabaseUrl ? 'local' : 'missing')
  res.status(200).json({
    env: process.env.NODE_ENV,
    supabase: {
      hasSupabaseEnv,
      hasServiceRole,
      urlPresent: Boolean(supabaseUrl),
      mode,
    },
  })
}
