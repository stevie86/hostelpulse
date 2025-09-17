# GDPR-Friendly Audit Logging

This project logs access and changes to personal data without persisting raw PII in the log.

## Design
- Event fields: `owner_id`, `actor_id`, `actor_role`, `resource`, `action`, `resource_id`, `fields`, `succeeded`, `status_code`, `ip`, `user_agent`.
- No PII values are stored. Only field names and resource identifiers are logged.
- Retention: purge logs older than `AUDIT_LOG_TTL_DAYS` (default 180). A lightweight background purge is triggered probabilistically on writes; you can also schedule a routine in the DB.

## Required Schema (Supabase / Postgres)
```sql
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  owner_id text,
  actor_id text,
  actor_role text check (actor_role in ('admin','user','anonymous')),
  resource text not null,
  action text not null,
  resource_id text,
  fields text[],
  succeeded boolean not null,
  status_code int,
  ip text,
  user_agent text
);

-- Optional RPC for retention
create or replace function public.purge_old_audit_logs(older_than_days int)
returns void language plpgsql security definer as $$
begin
  delete from public.audit_logs where created_at < now() - make_interval(days => older_than_days);
end
$$;
```

## App Integration
- Server inserts are via `lib/audit.ts` using the Supabase service role key.
- API handlers call `logAudit(req, auth, { ... })` after success/failure.
- Reads: only single-record `GET ?id=...` are logged (listing endpoints are not logged to reduce noise).

## Configuration
- `AUDIT_LOG_TTL_DAYS`: days to retain logs (default 180).
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set on the server.

## Access & Export
- Audit data is non-PII metadata and supports incident review and accountability.
- For data subject requests, export actual data from your primary tables; do not rely on audit logs for PII.

## Notes
- Avoid logging request bodies; never include raw emails/phones in the audit payload.
- In production, secure access to the `audit_logs` table with RLS and role-based grants.
```
-- Example RLS (read-only for admin role)
-- alter table public.audit_logs enable row level security;
-- create policy admin_read on public.audit_logs for select using (auth.role() = 'service_role');
```

