import type { NextApiRequest } from 'next'
import { createClient } from '@supabase/supabase-js'

type AuthCtx = { user: { id: string } | null; isAdmin: boolean }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Admin client for server-side inserts. If missing, logging becomes a no-op.
const admin = supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null

export type AuditEvent = {
  owner_id: string | null
  actor_id: string | null
  actor_role: 'admin' | 'user' | 'anonymous'
  resource: 'guests' | 'rooms' | 'bookings' | string
  action: 'create' | 'read' | 'update' | 'archive' | 'list' | string
  resource_id?: string | null
  fields?: string[] | null
  succeeded: boolean
  status_code?: number | null
  ip?: string | null
  user_agent?: string | null
}

function getIp(req: NextApiRequest): string | null {
  const xf = (req.headers['x-forwarded-for'] as string) || ''
  if (xf) return xf.split(',')[0].trim()
  // @ts-ignore
  return (req.socket && (req.socket.remoteAddress as string)) || null
}

export async function logAudit(req: NextApiRequest, auth: AuthCtx, event: Omit<AuditEvent, 'actor_id' | 'actor_role' | 'ip' | 'user_agent'>) {
  try {
    if (!admin) return // No-op if not configured
    const ip = getIp(req)
    const ua = (req.headers['user-agent'] as string) || null
    const actor_id = auth.user?.id || null
    const actor_role: AuditEvent['actor_role'] = auth.isAdmin ? 'admin' : actor_id ? 'user' : 'anonymous'

    const payload: AuditEvent = {
      ...event,
      actor_id,
      actor_role,
      ip,
      user_agent: ua,
    }
    // Insert audit row
    await admin.from('audit_logs').insert(payload)

    // Opportunistic retention: purge logs older than TTL with low probability to avoid extra load
    const ttlDays = Number(process.env.AUDIT_LOG_TTL_DAYS || 180)
    if (Math.random() < 0.02) {
      await admin.rpc('purge_old_audit_logs', { older_than_days: ttlDays }).catch(() => {})
    }
  } catch (e) {
    // Never throw from audit path
    // eslint-disable-next-line no-console
    console.warn('[audit] log failure (ignored):', (e as any)?.message)
  }
}

