# Sprint Plan: MVP Recovery (Sept 22–26, 2025)

## Sprint Goal
Stabilize and ship the hostel-owner MVP by clearing regressions, finishing CSV/management flows, and delivering a review-ready preview build. Success equals: green CI on `main`, conflict-free booking updates, CSV import confidence, and a dashboard that answers “who needs action today?”

## Constraints & Context
- Open PR backlog (#19, #20, #21, #23, #36) with failing checks and drift from latest `main`.
- Lint suite blocked by legacy import-order violations; Jest tooling pending due to network limits.
- Stashes hold demo/mobile experiments—explicitly out of scope unless MVP tasks unblock.
- Vercel preview deployments recently cancelled; final day requires a ready preview URL.

## Workstreams
1. **Core Stability (API & Tests)**
   - Merge #36 after local lint/Jest run; add coverage for partial PUT success and overlap.
   - Restore admin/seed integration tests or replace with targeted unit coverage.
   - Smoke existing endpoints with `scripts/smoke.sh` (once merged) against `REQUIRE_API_AUTH=0`.
2. **Pipeline Clean-Up**
   - Resolve import-order and Next lint errors in auth/dashboard/pages; ensure `npm run lint` passes locally, then re-run CI for lingering PRs.
   - Close or rebase any stale PRs once lint/test gates are green.
3. **CSV & Management UX**
   - Guest CSV dry-run + commit flow with clear error surfacing; add unit/integration tests where feasible.
   - Bookings CSV preview and conflict messaging; ensure overlap validation shared with API.
   - Dashboard/management pages: actionable tables, conflict banners, and quick actions wired to APIs.
4. **Documentation & Release Prep**
   - Update `README`, `AGENTS.md`, and `docs/testing` with new flows and smoke steps.
   - Produce regression checklist and capture manual validation results.
   - Trigger Vercel preview build; verify deploy parity (docs-only skips apply after #23 merges).

## Timeline
- **Day 1 (Sept 22)**: Finalize #36, fix lint blockers, re-run CI on #21/#23. Deliver green pipeline snapshot.
- **Day 2 (Sept 23)**: Implement guest CSV dry-run + commit; add tests/document log and raise PR.
- **Day 3 (Sept 24)**: Extend to bookings CSV + management UI conflict handling; regression smoke on dashboard.
- **Day 4 (Sept 25)**: Documentation sweep, regression checklist, Vercel preview verification. Hold buffer for bug fixes.
- **Day 5 (Sept 26)**: Full sign-off—run lint/format/test, complete checklist, prep demo agenda & owner walkthrough.

## Definition of Done
- `main` is green on lint/format/tests; all MVP PRs merged.
- CSV import/export validated (happy + error paths) with documented manual steps.
- Dashboard surfaces actionable booking/guest states with no broken links.
- Vercel preview deploy running latest `main`, ready for stakeholder review.
