# Sprint Execution Guide — MVP Automation Focus

Goal: ship the MVP in five working days with minimal manual effort by maximizing repeatable scripts/tests. Follow steps in order; treat each as “complete” only when commands pass and documentation is updated.

## Day 0 – Baseline & Branch Sync

1. **Confirm branch**: `git status` clean; pull latest `main`.
2. **Cherry-pick fixes** (if not already merged):
   - Bookings PUT partial update (stash@{0}).
   - CRUD + soft archive commit (main history).
   - Audit log integration.
3. **Environment**: ensure `.env.local` exists with `REQUIRE_API_AUTH=0`.
4. **Smoke tests**:
   - `npm test pages/api/admin/createDemoUser.test.ts --runInBand`.
   - `curl` scripts for bookings/guests/rooms CRUD (store as `scripts/smoke.sh`).
5. **CI sanity**: run `npm run format:check`; verify `.github/workflows/ci.yml` is unchanged (format, targeted Jest).

## Day 1 – API Hardening & Unit Tests

1. Restore admin suites:
   - Rename `pages/api/admin/integration.test.skip.ts` → `.test.ts`.
   - Update Supabase mocks to be per-test factories.
2. Add unit tests:
   - `__tests__/api/bookings.update.test.ts` covering partial update + overlap errors.
   - `__tests__/lib/audit.test.ts` ensuring metadata-only payload and error suppression.
3. Commands:
   - `npm test pages/api/admin/*.test.ts --runInBand`.
   - `npm test __tests__/api/bookings.update.test.ts --runInBand`.
4. Update `docs/testing/mvp-regression.md` with API verification steps.

## Day 2 – Guests CSV Reliability

1. API work:
   - Implement `POST /api/csv/guests?dryRun=1` + commit path with upsert and merge rules.
2. UI update:
   - Modify `components/CSVImportExport.tsx` to add preview step.
3. Tests:
   - Add API integration test using fixture CSV (happy path, duplicate, missing fields).
4. Scripts:
   - Add `npm run test:csv-guests` alias pointing to the new suite.
5. Manual validation: run `node scripts/demo-import.js guests.csv` to ensure results message matches preview.

## Day 3 – Bookings CSV & Wizard

1. API: `POST /api/csv/bookings` with guest/email and room/bed resolution, overlap prevention, optional guest creation flag.
2. UI: extend wizard to support bookings import (disable commit until preview success).
3. Tests:
   - API integration test with success + conflict fixture.
   - Component test verifying preview renders counts.
4. Update docs: add bookings CSV examples to `docs/import-guide.md`.

## Day 4 – Management UI

1. `/bookings` page:
   - List, filters, create/edit drawer, conflict messaging.
   - RTL test: simulate success + 409 conflict.
2. `/guests` & `/rooms` pages:
   - Archive buttons (disabled when API returns 400).
   - Tests: ensure error toast shown when archive blocked.
3. Dashboard parity: Quick Actions link to new pages; housekeeping board uses same data.
4. Regression script: update `docs/testing/mvp-regression.md` with UI steps.

## Day 5 – Quality Gates & Documentation

1. Lint cleanup:
   - Resolve import-order, Next.js `<Link>` warnings, unused imports.
   - Reintroduce `npm run lint` to CI workflow.
2. Full test suite: `npm test --runInBand`.
3. Prettier & lint: `npm run format:check`, `npm run lint` (must be green).
4. Documentation updates:
   - README (Quick Start, auth modes, import steps).
   - AGENTS.md (CI commands, audit verification).
   - `docs/testing/mvp-regression.md` final checklist.
5. Vercel deploy:
   - Redeploy with “Clear build cache”.
   - Execute regression checklist on preview; capture screenshots for stakeholder deck.

## Post-Sprint (Enhancements List)

See `docs/enhancement-roadmap.md` for deferred work (reports, calendar, mobile polish, OTA connectors).
