import type { NextApiRequest } from 'next'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined

export type AuthCheck = {
  ok: boolean
  reason?: string
  jwt?: string
}

export function requireAuth(req: NextApiRequest): AuthCheck {
  const shouldRequire = /^1|true|on|yes$/i.test(process.env.REQUIRE_API_AUTH || '')
  if (!shouldRequire) return { ok: true }

  const auth = req.headers.authorization || ''
  if (auth.startsWith('Bearer ')) {
    const jwt = auth.slice('Bearer '.length)
    if (jwt) return { ok: true, jwt }
  }

  const adminHeader = (req.headers['x-admin-token'] || req.headers['x-owner-token']) as string | undefined
  const adminToken = process.env.ADMIN_API_TOKEN || process.env.OWNER_API_TOKEN
  if (adminHeader && adminToken && adminHeader === adminToken) {
    return { ok: true }
  }

  return { ok: false, reason: 'Missing or invalid authorization' }
}

export function supabaseForRequest(auth: AuthCheck): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null
  const globalHeaders = auth.jwt ? { Authorization: `Bearer ${auth.jwt}` } : undefined
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: globalHeaders },
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

