---
description: "Work package task list for Fix Vercel Production Login (Env Vars)"
---

# Work Packages: Fix Vercel Production Login (Env Vars)

**Inputs**: `/kitty-specs/013-fix-vercel-production/`  
**Prerequisites**: `spec.md`, `plan.md`

## Work Package WP01: Define required Production env vars (Priority: P0) [DONE]

**Goal**: Identify the exact environment variable names and values required for Production sign-in.
**Independent Test**: A checklist exists that a teammate can use to set required env vars correctly.
**Prompt**: `/kitty-specs/013-fix-vercel-production/tasks/WP01-required-env-vars.md`

### Included Subtasks

- [x] T001 Confirm which env var names the app reads (`AUTH_*` vs `NEXTAUTH_*`).
- [x] T002 Define the correct Production `AUTH_URL`/`NEXTAUTH_URL` (exact deployed domain).
- [x] T003 Define the correct Production `DATABASE_URL` source (Vercel Postgres/Neon) and ensure it is seeded or otherwise has an onboarding plan.
- [x] T004 Define how/where `AUTH_SECRET` is generated, stored, and rotated.
- [x] T004a Ensure secrets are not logged (e.g., redact `DATABASE_URL` in server logs).

---

## Work Package WP02: Document and automate setup (Priority: P1) [DONE]

**Goal**: Provide repeatable setup instructions and reduce manual config errors.
**Independent Test**: Following the doc (and optional script) results in working production login.
**Prompt**: `/kitty-specs/013-fix-vercel-production/tasks/WP02-docs-and-automation.md`

### Included Subtasks

- [x] T005 Add a Production env var checklist document (Vercel UI steps + CLI alternatives).
- [ ] T006 (Optional) Add a scriptable flow to set/verify Vercel Production env vars (requires user-provided token/project context). *Deferred: Manual setup via docs is sufficient for MVP.*

---

## Work Package WP03: Verify Production sign-in end-to-end (Priority: P0)

**Goal**: Confirm the blocker is resolved on the live Production deployment.
**Independent Test**: Sign in works on Production; authenticated refresh succeeds.
**Prompt**: `/kitty-specs/013-fix-vercel-production/tasks/WP03-production-verification.md`

### Included Subtasks

- [ ] T007 Trigger a new Production deployment after env var updates.
- [ ] T008 Validate sign-in, dashboard redirect, and session persistence (refresh + navigation).
- [ ] T009 Capture final confirmation notes (what was changed, when, and where).
