# Sprint Plan: Path to MVP (Fully Tested, Clearly Documented)

## Sprint Goal
Ship the hostel-management MVP with import → manage → audit flows working end to end, fully tested, and documented for hand-off. No new polish—only launch-critical gaps.

## Sprint Length
5 working days (single focus sprint).

## Outcomes Required
- Owners can import guests/bookings, resolve duplicates, and manage records (CRUD + archive) without API calls.
- APIs enforce auth, return reliable errors, and emit audit events (no PII) for every change.
- UI surfaces booking/guest/room lists and detail drawers with conflict handling.
- Automated + manual checks cover every launch flow; docs updated to match.

## Workstreams & Tasks

### 1. Platform Hardening (API & Auth)
1.1 **Bookings PUT regression tests**  
- Add unit coverage for partial updates/conflict logic.  
- Verify curl flow: create → update subset → overlap 409.  
- Output: `__tests__/api/bookings.update.test.ts` green.

1.2 **Admin endpoints testable gate**  
- Restore `integration.test.ts` & `seed.test.ts` (remove `.skip`).  
- Mock Supabase client per call (no global state).  
- Tests assert 401/400/500 paths + seeding success.

1.3 **Audit log smoke**  
- Add Jest unit verifying `logAudit` suppresses errors, writes minimal payload.  
- Manual: trigger POST /api/guests (REQUIRE_API_AUTH=0) → row appears in `audit_logs` without PII.

### 2. CSV Import Experience
2.1 **Guests dry-run & upsert**  
- API: `POST /api/csv/guests?dryRun=1` (no write) + commit path with dedupe merge.  
- UI: update `CSVImportExport` to show preview counts + confirm step.  
- Tests: unit for parser + API integration (happy path, missing headers, duplicates).

2.2 **Bookings CSV import**  
- Resolve guests by email, rooms/beds by name; option to create missing guest.  
- Overlap detection before commit.  
- Tests: API unit + fixture CSV covering success, conflict, missing mapping.

2.3 **Wizard UX**  
- Replace dashboard widget with stepper (Upload → Preview → Import).  
- Accessibility: keyboard, focus, error messaging.  
- Manual QA: follow checklist (desktop + mobile).

### 3. Booking Management UI
3.1 **Bookings list + drawer**  
- `/bookings`: filter by status/date; create/edit modal; inline conflict errors.  
- Tests: React Testing Library for optimistic update + error fallback.

3.2 **Guests & Rooms management**  
- `/guests`: list, quick add, archive with “has bookings” guard message.  
- `/rooms`: show beds, allow archive, prevent when active bookings.  
- Tests: component tests verifying archive button disabled when API returns 400.

3.3 **Housekeeping view parity**  
- Ensure dashboard widgets pull same sources as new pages.  
- Smoke: manual sign-off checklist (arrivals/departures, quick actions).

### 4. Quality Gates & Documentation
4.1 **CI enforcement**  
- Expand workflow to `npm run lint` (after import-order tidy).  
- Re-enable full Jest suite (admin, CSV, UI).  
- Add JUnit artifact upload for diagnostics.

4.2 **Manual regression matrix**  
- Document test script covering: login, import guests/bookings, CRUD flows, archive logic, audit log check, CSV export.  
- Store in `docs/testing/mvp-regression.md`.

4.3 **Docs & hand-off**  
- Update `README` (Quick Start, Auth modes, Import guide).  
- Update `AGENTS.md` (new workflow steps, audit verification).  
- Reference roadmap doc for post-MVP backlog.

## Schedule (Suggested)
- **Day 1**: Platform Hardening (1.1–1.3).  
- **Day 2**: Guests CSV dry-run/upsert (2.1) + begin bookings import scaffolding.  
- **Day 3**: Finish bookings CSV (2.2), wizard UX (2.3).  
- **Day 4**: Booking/Guests/Rooms UI (3.1–3.2) + housekeeping parity (3.3).  
- **Day 5**: Quality gates (4.1–4.3), full regression, Vercel demo deploy.

## Definition of Done
- All sprint tasks merged to main with green CI (format, lint, full Jest suite).  
- Manual regression checklist signed off.  
- Docs updated (README, AGENTS, regression guide).  
- Vercel Preview validated end-to-end; audit logs verified in Supabase.  
- One-page demo script prepared for stakeholder walkthrough.

## Risk & Mitigation
- **Supabase schema gaps**: confirm `archived` columns + `audit_logs` exist before coding; ship SQL migration if missing.  
- **Import edge cases**: capture fallback “row skipped with reason” to avoid silent failures.  
- **Time pressure**: avoid feature creep (reports, mobile polish) unless required for MVP acceptance.

## Exit Criteria
MVP is demo-ready: data import → booking management → audit trail is reliable, documented, and repeatable with automation + manual validation.
