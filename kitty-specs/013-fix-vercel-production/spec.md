---
# Feature Specification: Fix Vercel Production Login (Env Vars)

**Feature Branch**: `013-fix-vercel-production`
**Created**: 2025-12-20
**Status**: In Progress (Pending User Action)  
**Input**: Vercel Production login blocked due to incorrect/missing env vars (`DATABASE_URL`, `AUTH_SECRET`/`NEXTAUTH_SECRET`, `AUTH_URL`/`NEXTAUTH_URL`).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Production admin can sign in (Priority: P1)

As an admin, I can sign in on the Vercel Production deployment and reach the authenticated dashboard without redirect loops or session errors.

**Why this priority**: This is the deployment blocker; without sign-in the product is unusable in production.

**Independent Test**: Using the production URL, sign in with a known admin account and land on the dashboard with a valid session cookie.

**Acceptance Scenarios**:

1. **Given** Vercel Production environment variables are correctly configured, **When** I submit valid credentials on the sign-in page, **Then** I am redirected to the dashboard and the session remains valid on refresh.
2. **Given** the production database contains the admin user, **When** I sign in, **Then** I do not see "user not found" errors.
3. **Given** the Production `AUTH_SECRET`/`NEXTAUTH_SECRET` is correct, **When** I refresh an authenticated page, **Then** I do not see `JWTSessionError` / decryption failures.

---

### User Story 2 - Deployment is repeatable and auditable (Priority: P2)

As a developer, I can verify required Production env vars are set (and correctly scoped) before deploying, using a documented checklist and/or a script.

**Why this priority**: Prevents regressions when rotating secrets, changing domains, or swapping databases.

**Independent Test**: Follow the checklist/script and confirm a fresh deployment passes sign-in in under 10 minutes.

**Acceptance Scenarios**:

1. **Given** a new project/environment, **When** I follow the documented steps, **Then** all required env vars are set for Production and a deploy works end-to-end.
2. **Given** I rotate `AUTH_SECRET`, **When** I redeploy, **Then** existing sessions fail safely and new logins succeed.
