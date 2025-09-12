# Sprint Plan: HostelPulse MVP — Room Management (Owner) + Guest Frontend

Sprint length: 7–10 days (timebox). Team: 1–2 engineers + 1 reviewer.

## Objectives
- Deliver a functional MVP that simulates hostel room management for owners and a simple guest-facing site.
- Ship PR Preview deployments for every change and protect `main` with required checks.
- Achieve high test coverage (goal: ≥95% lines/branches on covered modules) and reliable CI.

## Success Criteria (Definition of Done)
- Owner can: view rooms, add/edit rooms, toggle status, view mock bookings/guests, and create bookings (simulated).
- Guest can: browse rooms, view details/amenities, see simulated availability, submit a booking request (mock).
- All new logic covered by unit/integration tests; E2E smoke validates main flows.
- CI green on PR; Vercel Preview deploy URL visible; branch protection passes.

## Scope (MVP)
- Owner dashboard (Next.js pages):
  - Rooms: list + detail + create/edit + status (available/booked/maintenance/closed).
  - Bookings: list recent (from mock) + create simulated booking + cancel.
  - Guests: list + add/edit basic info.
  - Pricing: base price per room; simple currency handling (EUR).
- Guest frontend (public pages):
  - Rooms index (cards with photo, capacity, price from mock).
  - Room detail (amenities, description, simulated availability calendar).
  - Booking request form (mock; shows confirmation toast and logs request).
- Data: use in-repo mock data (see `lib/mock-room-data.ts`) and extend as needed.
- API (simulated): Next.js API routes using in-memory or file-backed mock store for the MVP.

## Non‑Goals (MVP)
- Real payments, authentication, or persistent DB writes.
- Full channel integrations (Booking.com/Airbnb). Use mock interfaces only.

## Architecture Notes
- Keep Pages Router (Next 12) for speed; add `lib/services/*` for business logic.
- Types in `types/room-management.ts` (already present) are canonical.
- Mock store pattern:
  - `lib/store/mock-db.ts` (in-memory arrays sourced from `lib/mock-room-data.ts`).
  - Thread-safe operations simulated with simple locks or atomic array ops.

## Data Model (recap)
- Room { id, name, type, capacity, status, floor, amenities, description, createdAt, updatedAt }
- Guest { id, firstName, lastName, email, phone?, nationality?, dateOfBirth?, ... }
- Booking { id, guestId, roomId, checkInDate, checkOutDate, numberOfGuests, totals, status, source }
- Pricing { id, roomId, basePrice, currency, validFrom, validTo, isActive }

## Endpoints (simulated)
- `GET /api/rooms` → Room[]; `POST /api/rooms` → create; `PUT /api/rooms/:id` → update; `DELETE /api/rooms/:id` → remove
- `GET /api/guests` / `POST /api/guests` / `PUT /api/guests/:id`
- `GET /api/bookings` / `POST /api/bookings` / `PUT /api/bookings/:id` (cancel)
- `GET /api/pricing?roomId=...`
- `POST /api/booking-requests` (guest form → enqueue/log only)

## UX Flows
- Owner
  - Rooms list → “Add Room” → form validation → optimistic add → toast success.
  - Room detail → toggle status → immediate UI change → persisted in mock store.
  - Create booking → pick guest + room + dates → server validates conflicts (mock) → add.
- Guest
  - Rooms index → detail → select dates → booking request → confirmation.

## Backlog (story-level)
1) Mock store scaffolding (`lib/store/mock-db.ts`) with CRUD for Rooms, Guests, Bookings, Pricing.
2) API routes wired to store with Zod validation; normalized error shapes.
3) Owner UI: Rooms list/detail/create-edit; status toggles; basic pricing display.
4) Owner UI: Bookings list/create/cancel; conflict check (simple overlap algorithm).
5) Owner UI: Guests list/create-edit.
6) Guest UI: Rooms index + detail + booking request form (mock submit).
7) Loading/error states; toasts; empty states.
8) Tests: unit (store/services/utils), integration (API routes), component tests (owner/guest views), E2E smoke (Playwright).
9) CI: ensure tests, lint, typecheck, and Preview deploy on PR.
10) Docs: usage, demo script, and known limitations.

## Acceptance Criteria (examples)
- Rooms API returns active rooms; create room validates required fields; status updates reflect immediately in GET.
- Booking creation rejects overlapping stays for the same room; cancellation frees availability.
- Guest booking request captures name/email/dates and returns reference ID.
- E2E: Owner can create a room and booking; Guest can submit a booking request.

## Testing & Coverage Strategy
- Goal: ≥95% line/branch coverage on MVP modules.
- Unit tests: 
  - Store operations (rooms, bookings overlap, pricing retrieval).
  - Utilities (date formatting, read time, media queries where applicable).
- Integration tests:
  - API routes with mocked store and validation errors.
- Component tests:
  - Owner forms (rooms, bookings) with @testing-library/react.
  - Guest booking form and room lists.
- E2E (smoke):
  - Playwright: owner basic flow; guest booking request; runs on PR (preview URL) and nightly.
- Coverage enforcement:
  - Add Jest thresholds (lines/branches/functions 95) and fail CI on regression.
  - Exclude generated/types-only files.

## CI/CD Checklist
- PR: lint, typecheck, tests (+ coverage threshold), Vercel Preview deploy.
- Main: prod deploy (when ready) or keep Preview only during MVP.
- Required checks enabled in branch protection.

## Demo & Handoff
- Demo script: 
  - Owner: create room → toggle status → create booking → show bookings list.
  - Guest: browse rooms → open detail → submit booking request.
- README updates: env, local run, routes, test commands, and demo steps.

## Risks & Mitigations
- Timebox overrun → Keep API/file-store simple; defer auth/payments.
- Test flakiness → Avoid real timeouts; use deterministic mock clock; stable data fixtures.
- Coverage drag → Prioritize unit tests for logic-heavy paths first.

## Day-by-Day Outline (7 days)
- Day 1: Store scaffolding + Zod schemas + rooms API
- Day 2: Owner Rooms UI + tests
- Day 3: Bookings logic (overlap) + API + Owner UI + tests
- Day 4: Guests API/UI + tests; Pricing read + display
- Day 5: Guest UI (index/detail/form) + tests
- Day 6: E2E smoke + CI coverage thresholds + docs
- Day 7: Polish, a11y pass, demo rehearsal; cut MVP tag
