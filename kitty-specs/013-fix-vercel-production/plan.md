---
# Implementation Plan: Fix Vercel Production Login (Env Vars)

**Branch**: `013-fix-vercel-production` | **Date**: 2025-12-20  
**Spec**: `/kitty-specs/013-fix-vercel-production/spec.md`

## Summary

Unblock sign-in on the Vercel Production deployment by correcting and documenting the required environment variables for Auth.js/NextAuth and Prisma. Provide a repeatable checklist, and (optional) automation via Vercel CLI/API.

## Technical Context

- **Runtime**: Node.js 20.x
- **App**: Next.js (App Router)
- **Auth**: Auth.js / NextAuth (beta)
- **DB**: Prisma + Postgres
- **Tests**: Jest, Playwright
- **Hosting**: Vercel

## Constraints / Risks

- Production env vars must be set in Vercel (no secrets in git).
- A fresh/empty production DB will not contain the seeded admin user; login will fail even if auth secrets are correct.
- Rotating auth secrets invalidates existing sessions by design; must redeploy and re-login.

## Required Production Env Vars (baseline)

These must be present (names depend on the current auth config; accept either `AUTH_*` or `NEXTAUTH_*` as used by the codebase):

- `DATABASE_URL`: Production Postgres connection string (seeded or with a first-run setup path).
- `AUTH_SECRET` / `NEXTAUTH_SECRET`: Stable secret used to encrypt/sign session tokens.
- `AUTH_URL` / `NEXTAUTH_URL`: The production URL (must match the deployed domain).

## Work Plan

1. ~~Confirm which env var names are read by the current auth config and document them.~~ **DONE**
2. ~~Add a production setup checklist (Vercel UI + Vercel CLI paths).~~ **DONE**
3. ~~Add an optional scripted setup path (token-based) to set/verify env vars for Production.~~ **Deferred**
4. Verify end-to-end sign-in on Production after redeploy. **PENDING (requires user action)**

## Progress

### Completed
- Analyzed auth configuration (`auth.ts`, `auth.config.ts`)
- Confirmed NextAuth v5 uses `AUTH_SECRET`, `AUTH_URL`, `AUTH_TRUST_HOST`
- Fixed `lib/db.ts` to redact DATABASE_URL in logs (non-production only)
- Created comprehensive `/docs/VERCEL_DEPLOYMENT.md` with:
  - Required environment variables table
  - Step-by-step Vercel setup instructions
  - Database migration commands
  - Troubleshooting section
  - Pre-deployment checklist

### Pending User Action
To complete this feature, the user must:
1. Set the environment variables in Vercel Dashboard per `/docs/VERCEL_DEPLOYMENT.md`
2. Run `prisma db push` and `prisma db seed` against production database
3. Trigger a new production deployment
4. Verify sign-in works end-to-end

## Done When

- Production login works end-to-end without redirect loops.
- Refreshing authenticated pages does not produce `JWTSessionError`/decryption failures.
- A new teammate can follow the checklist to configure Production successfully.

