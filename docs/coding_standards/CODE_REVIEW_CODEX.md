# Code Review (Created by Codex)

Context: Next.js App Router MVP for hostel management with Prisma-backed models and server actions. Review covers surfaced files only. Recent history (git log --oneline -20) shows MVP rebuild and feature drops across auth, properties/rooms, guests, bookings, dashboard, and a postinstall Prisma generate step.

## Strengths
- Clear separation of concerns between server actions and UI forms; Prisma types used in actions for safer data handling.
- [NEW] Centralized "Data Hub" for utility operations (Bulk Import/Export) keeps the core UI focused on daily operations.
- Hardened server actions with mandatory property-ownership verification via `verifyPropertyAccess()`.

## High-Priority Findings
- [RESOLVED 2025-12-19] Missing API routes for CSV exports: Created a dedicated Data Hub that correctly routes to the export APIs.
- Weak authentication handling: credentials provider falls back to plaintext password comparison and logs sensitive hints (`auth.ts:18-50`), inviting credential leakage and bypass of hashing. Enforce hashed passwords only, drop verbose logs, and add throttling/lockouts.
- Prisma client logs DATABASE_URL on every init (`lib/db.ts:5-9`), leaking secrets to logs in production. Remove secret logging and gate any debug logging behind `NODE_ENV !== 'production'`.
- [RESOLVED 2025-12-19] No authz checks on server actions: Guarded all core actions with `verifyPropertyAccess()` to prevent multi-tenant data leakage.
- Route params typed as `Promise` and awaited across pages: This is a Next.js 15 requirement for dynamic routes. The current implementation is correct for the App Router evolution.

## Additional Issues / Gaps
- [RESOLVED 2025-12-19] Booking creation logic is now transactional (`app/actions/bookings.ts`) to prevent overbooking and orphan data.
- [RESOLVED 2025-12-19] Booking totals now correctly compute `nights * pricePerNight`.
- [RESOLVED 2025-12-19] Dashboard now uses `property.timezone` for accurate daily reporting.
- Schema constrains one property per team via `teamId @unique`: Confirmed as an intentional MVP design to simplify team-hostel relationships.
- Minimal test coverage: Automated tests for auth, capacity, and CSV flows remain a high-priority gap for Phase 2.

## Recommendations
- Finalize production hardening: Remove sensitive `console.log` and `DATABASE_URL` leaks.
- Implement Guest management list/search UI (CSV import is already working in the Data Hub).
- Add Playwright smoke tests for the "One-click Check-in/out" flow to ensure dashboard stability.