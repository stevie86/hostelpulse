# Sprint Plan: MVP Finalization (Sept 23–27, 2025)

## Sprint Snapshot
- Booking PUT partial-update safeguards merged into `main` (#36).
- Guest CSV dry-run + upsert flow ready for review (#37).
- Lint/import-order cleanup merged; pipelines now green.
- Legacy PR backlog (#23, #21, #20, #19, #7, #6) still failing checks or out of date.

## Current Goals
Deliver a review-ready MVP preview by end of week: CSV import confidence, bookings management without conflicts, audit-ready dashboards, and clean CI.

## Workstreams & Owners
1. **Guest Import Completion (Owner: You)**
   - Review/merge #37 (guest CSV dry-run + commit).
   - Add scripted smoke test for dry-run + commit (if tooling permits) or document manual test matrix.

2. **Bookings CSV & Management UX (Owner: You)**
   - Implement bookings CSV dry-run/commit with overlap detection parity.
   - Extend management UI (bookings/guests/rooms) with conflict banners and action buttons tied to APIs.
   - Ensure dashboard quick actions and counts update after imports.

3. **Pipeline & Backlog Cleanup (Owner: You)**
   - Rebase and triage existing PR backlog (#23, #21, #20, #19, #7, #6); close or update where obsolete.
   - Re-enable branch protection review requirement (set approving review count to 1).
   - Confirm `npm run lint`, `npm run format:check`, `npm test` pass on main before next merges.

4. **Documentation & QA (Owner: You)**
   - Update README/AGENTS with finalized flows (guest + booking import, manual QA).
   - Author regression checklist covering import → management → audit path.
   - Prepare launch notes (manual validation steps, known gaps).

## Timeline & Key Deliverables
- **Day 1 (Sept 23)**: Merge #37; re-enable branch protection; cherry-pick/close stale PRs.
- **Day 2 (Sept 24)**: Ship bookings CSV dry-run + UI updates (open PR #39).
- **Day 3 (Sept 25)**: QA bookings/guest flows end-to-end; finish regression checklist; update docs.
- **Day 4 (Sept 26)**: Resolve backlog PRs or archive; run full lint/test suite; smoke test Vercel preview.
- **Day 5 (Sept 27)**: Sign-off meeting prep; finalize manual validation notes and demo script.

## Definition of Done
- Both CSV flows (guests + bookings) support dry-run, dedupe, and conflict handling; UI communicates status.
- Dashboard/management screens show accurate counts/actions post-import.
- CI green on `main`; branch protection restored; stale PR backlog addressed.
- Regression checklist executed with outcomes logged; docs updated for handoff.
- Vercel preview (or local demo) ready for stakeholder walkthrough.
