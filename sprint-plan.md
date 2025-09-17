# Sprint Plan: Path to MVP (Fully Tested, Clearly Documented)

# Sprint Plan: Path to MVP (Fully Tested, Clearly Documented)

## Sprint Goal
Deliver the hostel-management MVP in one week with import → manage → audit flows proven end-to-end, documented, and demo-ready. No new polish—only launch-critical fixes.

## Sprint Length
5 working days.

## Outcomes Required
- Guests/rooms/bookings APIs stable: partial updates, soft archive, audit logging verified.
- CSV import/export supports dry-run, dedupe, and reliable commits; UI guides owners through the flow.
- Booking/guest/room management pages exist with CRUD + conflict handling.
- CI, unit/integration tests, and manual regression checklist cover all launch-critical paths.

## Day-by-Day Plan

### Day 0 — Baseline & Branch Sync
- **Cherry-pick fixes**: merge bookings PUT partial-update (stash@{0}), CRUD/archive commit (main), audit log integration.
- **CI**: ensure `.github/workflows/ci.yml` runs `npm run format:check` + targeted Jest suite; lint to be re-enabled at end.
- **Manual sanity**: `npm test pages/api/admin/createDemoUser.test.ts --runInBand` and smoke CRUD endpoints with `REQUIRE_API_AUTH=0`.

### Day 1 — API Hardening & Tests
- Restore `pages/api/admin/integration.test.ts` and `seed.test.ts` (remove `.skip`), mocking Supabase per test; satisfy auth/token expectations.
- Add Jest coverage for bookings PUT (success + overlap 409) and audit log helper (no PII, swallow errors).
- Manual curl script: create/update/archive bookings/guests/rooms and confirm audit rows in `audit_logs`.

### Day 2 — Guests CSV Reliability
- Implement `POST /api/csv/guests?dryRun=1` preview + commit with upsert (owner_id + email).
- Update `components/CSVImportExport` with Preview → Import flow (counts + errors).
- Tests: unit for parser dedupe; integration for CSV import (dry-run + commit + duplicate row).
- Document flow in `docs/import-guide.md` (new).

### Day 3 — Bookings CSV & Wizard
- Build `POST /api/csv/bookings` with guest/email resolution, room/bed matching, overlap validation.
- Extend wizard UI for bookings (disable import until valid preview).
- Tests: fixture CSV covering success, missing guest (auto-create disabled), overlap conflict.
- Manual QA checklist (desktop + mobile) stored in `docs/testing/mvp-regression.md` (draft).

### Day 4 — Management UI & Housekeeping
- `/bookings`: list + filter, create/edit drawer (reuses API).  
  - Tests: React Testing Library for success, conflict error banner.
- `/guests` + `/rooms`: table with archive button; disabled when API returns 400 (active bookings).  
  - Tests: component-level mocking API responses.
- Ensure dashboard “Quick Actions” link to new pages; verify housekeeping list pulls same data.

### Day 5 — Quality Gates & Documentation
- Re-enable `npm run lint` (resolve import-order warnings, Next.js link usage, etc.).
- Run full test suite (`npm test`) + Prettier + lint; CI must pass green.
- Finalize `docs/testing/mvp-regression.md`, update README (Quick Start, Auth, Import), AGENTS (CI steps, audit verification), and reference enhancement roadmap.
- Vercel redeploy with “Clear build cache”; execute regression checklist on preview.

## Definition of Done
- Format, lint, full Jest suite green in CI.
- Manual regression checklist executed and archived.
- Docs updated (README, AGENTS, import guide, regression guide).
- Vercel Preview demonstrates import → booking management → audit log, ready for stakeholder demo.

## Risks & Guards
- **Supabase schema drift**: confirm `archived` fields + `audit_logs` exist; ship SQL migration if missing.
- **CSV edge cases**: capture row-level errors in preview (no silent skips).
- **Time pressure**: defer non-critical UX polish to enhancement roadmap.

## Enhancement Roadmap
See `docs/enhancement-roadmap.md` for post-MVP items (landing polish, reporting, calendar view, mobile refinements).
