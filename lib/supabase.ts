import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { debugLog } from './debug'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey)
export const hasServiceRole = Boolean(serviceRoleKey)

let loggedOnce = false

export function getSupabaseClient(): SupabaseClient | null {
  if (!hasSupabaseEnv) {
    if (!loggedOnce) {
      debugLog('Supabase env missing; APIs will respond 503 until NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
      loggedOnce = true
    }
    return null
  }
  if (!loggedOnce) {
    const mode = supabaseUrl?.includes('supabase.co') ? 'hosted' : 'local'
    debugLog(`Supabase client initialized [mode=${mode}]`, supabaseUrl)
    loggedOnce = true
  }
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
