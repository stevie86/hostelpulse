import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey)
export const hasServiceRole = Boolean(serviceRoleKey)

export function getSupabaseClient(): SupabaseClient | null {
  if (!hasSupabaseEnv) return null
  return createClient(supabaseUrl as string, supabaseAnonKey as string, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export function getSupabaseServer(): SupabaseClient | null {
  if (!hasSupabaseEnv) return null
  const key = (serviceRoleKey || supabaseAnonKey) as string
  return createClient(supabaseUrl as string, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
