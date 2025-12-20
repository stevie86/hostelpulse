---
lane: done
---

# WP01: Define required Production env vars (P0)

## Goal

Identify the exact env var names/values required for Vercel Production sign-in, including source-of-truth for each value.

## Checklist

- [x] Confirm auth config reads `AUTH_URL`/`AUTH_SECRET` vs `NEXTAUTH_URL`/`NEXTAUTH_SECRET`.
- [x] Enumerate *all* required env vars for Production (Auth + Prisma + any adapters).
- [x] Define the production domain value for URL env var (exact, no trailing slashes unless required).
- [x] Decide DB strategy: seeded admin in Production DB vs first-run bootstrap flow.
- [x] Ensure secrets are not logged in production (redact/disable env debug logs).

## Findings

### Auth Configuration Analysis

NextAuth v5 (as used in this project) reads environment variables in this order:
1. `AUTH_SECRET` (preferred) or `NEXTAUTH_SECRET` (legacy fallback)
2. `AUTH_URL` (preferred) or `NEXTAUTH_URL` (legacy fallback)
3. `AUTH_TRUST_HOST` for preview/dynamic deployments

**Source:** `auth.ts` uses `NextAuth()` with `trustHost: true` and JWT session strategy.

### Required Environment Variables

| Variable | Production | Preview | Source |
|----------|------------|---------|--------|
| `AUTH_SECRET` | Required | Required | `openssl rand -base64 32` |
| `AUTH_URL` | Required | Not needed | Production URL (e.g., `https://hostelpulse-ng.vercel.app`) |
| `AUTH_TRUST_HOST` | Not needed | Required (`true`) | Static value |
| `DATABASE_URL` | Required | Required | Vercel Postgres / Neon connection string |

### Production Domain

The exact production URL should be:
- Format: `https://<project-name>.vercel.app` (no trailing slash)
- Example: `https://hostelpulse-ng.vercel.app`

### Database Strategy

**Decision:** Seed admin user in Production DB via `prisma db seed`.

Rationale:
- Consistent with development workflow
- Admin credentials (`admin@hostelpulse.com` / `password`) allow immediate testing
- No code changes required for first-run bootstrap

**Important:** The seed script stores a plaintext password for development convenience. For production security, the admin should change their password after first login (feature request for password change UI).

### Secrets Logging

**Status:** Fixed in `lib/db.ts`

The `prismaClientSingleton()` function now:
1. Only logs in non-production (`NODE_ENV !== 'production'`)
2. Redacts credentials from the DATABASE_URL using `redactDatabaseUrl()` helper

## Deliverables

- [x] `/kitty-specs/013-fix-vercel-production/tasks/WP01-required-env-vars.md` updated with final values and references.
- [x] `/docs/VERCEL_DEPLOYMENT.md` created with complete setup guide.
