# Code Review (Created by Codex)

Context: Next.js App Router MVP for hostel management with Prisma-backed models and server actions. Review covers surfaced files only. Recent history (git log --oneline -20) shows MVP rebuild and feature drops across auth, properties/rooms, guests, bookings, dashboard, and a postinstall Prisma generate step.

## Strengths
- Clear separation of concerns between server actions and UI forms; Prisma types used in actions for safer data handling.
- CSV import flows for rooms/bookings show intention for bulk ops and basic validation with Zod.
- Dashboard surfaces operational stats (arrivals/departures/occupancy) with minimal round-trips by batching Prisma calls.

## High-Priority Findings
- Missing API routes for CSV exports: UI links point to `/api/export/rooms|bookings|guests/:id` but no routes exist (`app/properties/[id]/page.tsx:73-78`, `app/properties/[id]/bookings/page.tsx:33-44`, `app/properties/[id]/guests/page.tsx:24-34`), resulting in 404s and broken flows. Add API routes or remove links.
- Weak authentication handling: credentials provider falls back to plaintext password comparison and logs sensitive hints (`auth.ts:18-50`), inviting credential leakage and bypass of hashing. Enforce hashed passwords only, drop verbose logs, and add throttling/lockouts.
- Prisma client logs DATABASE_URL on every init (`lib/db.ts:5-9`), leaking secrets to logs in production. Remove secret logging and gate any debug logging behind `NODE_ENV !== 'production'`.
- No authz checks on server actions (`app/actions/rooms.ts`, `app/actions/bookings.ts`, `app/actions/guests.ts`, `app/actions/import.ts`); any caller can mutate data for arbitrary `propertyId`. Guard actions with `auth()` and verify property ownership/team membership before writes.
- Route params typed as `Promise` and awaited across pages (`app/properties/[id]/page.tsx:8-9` and similar in bookings/guests/rooms dashboards). Next.js passes plain objects; this type misuse hides mistakes and breaks type inference. Change to `{ params: { id: string } }` and drop `await`.

## Additional Issues / Gaps
- Booking creation/import logic is not transactional and can leave orphan guests or partial state on failure; no concurrency protection around capacity checks (`app/actions/bookings.ts:25-136, 142-238`). Wrap availability check + booking + bed creation in a transaction and lock per room to avoid double-booking.
- Booking totals use `room.pricePerNight` without multiplying by nights (`app/actions/bookings.ts:83-115`), so multi-night stays underbill. Compute `nights * pricePerNight` and respect room currency/tax.
- Dashboard uses server-local dates (`app/properties/[id]/dashboard/page.tsx:8-52`) instead of property timezone; arrivals/departures will be wrong for non-UTC properties. Use `property.timezone` with a timezone-aware library.
- Schema constrains one property per team via `teamId @unique` (`prisma/schema.prisma:109-131`); confirm intent, as it blocks multi-property accounts.
- Exports/imports lack validation feedback and retry strategy; imports skip malformed rows quietly and don’t dedupe guests/rooms beyond basic checks (`app/actions/import.ts`, `app/actions/bookings.ts:142-238`, `app/actions/rooms.ts:62-142`).
- Minimal test coverage; no automated tests for auth, booking capacity, or CSV flows. Critical behaviors are unverified.

## Recommendations
- Implement export API routes with shared CSV serializer utilities; backfill integration tests for import/export.
- Harden auth: hashed-only passwords, structured audit logging, rate limiting, and user lockout logic integrated with existing `invalid_login_attempts` fields.
- Add authorization middleware/helpers that check session + team membership before any `propertyId` mutation, and ensure Prisma queries scope by team.
- Remove sensitive logging in production; introduce structured debug logging behind a flag.
- Refactor booking creation/import to run inside Prisma transactions with consistent billing calculations and overlap checks that match occupancy rules.
- Add unit/integration tests for server actions and timezone-aware dashboards; add Playwright smoke for the main CRUD flows once routes stabilize.
