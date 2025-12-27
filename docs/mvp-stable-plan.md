# HostelPulse Stable MVP Steering Plan

> Scope: Make the Lisbon pilot rock-solid and demoable, before large UI rewrites.

## 1. MVP Definition (What “Stable” Means)

A **stable MVP** for HostelPulse is:

- Used daily by a real Lisbon hostel for **check-in/out and manual bookings**.
- Prevents **double bookings** at the bed level.
- Calculates **Lisbon city tax** reliably.
- Survives **shift changes and volunteer turnover** (15–30 minute training).
- Survives **browser refreshes and network blips** without corrupting data.

Anything that does not materially contribute to those outcomes is **optional** until after the pilot.

## 2. Critical User Flows To Finish & Harden

These flows should be considered **production-critical** and tested end-to-end.

### 2.1 Check-In / Check-Out

Files: `app/(dashboard)/properties/[id]/check-in/page.tsx`, `app/(dashboard)/properties/[id]/check-out/page.tsx`, `app/actions/check-in-out.ts`

- Ensure staff can:
  - Search/select a booking or guest quickly.
  - Assign a specific **bed** (for dorm rooms) or room (for privates).
  - Mark guest as **checked in** and **checked out** with minimal clicks.
- Business rules:
  - Prevent check-in if booking is not `confirmed`.
  - Prevent overlapping occupancy for the same bed.
  - When checking out, ensure totals (nights, tax, invoices) are locked.
- Stability work:
  - Add clear error states when server actions fail.
  - Ensure idempotency: double-clicking a button should not create double operations.

### 2.2 Manual Booking Creation (Back Office)

Files: `app/(dashboard)/properties/[id]/bookings/new/page.tsx`, `app/actions/bookings.ts`, `lib/availability.ts`

- Staff can:
  - Pick date range, room/bed, and guest (or create a new guest).
  - See availability and conflicts **before** saving.
- Business rules:
  - Conflict detection must be authoritative (single source of truth in Prisma models).
  - Enforce bed-level uniqueness within date ranges.
- Stability work:
  - Unit tests around `availability` and conflict detection.
  - E2E flow: create booking -> see it on calendar -> check in/out.

### 2.3 Daily Operations Dashboard

Files: `app/(dashboard)/properties/[id]/dashboard/page.tsx`, `app/actions/dashboard.ts`, `components/dashboard/*`

- Surface:
  - **Arrivals today**, **departures today**, **in-house right now**.
  - Simple occupancy metric (beds occupied / total beds).
- Stability work:
  - Ensure queries are efficient for the expected data size.
  - Handle empty states gracefully (no properties, no bookings, etc.).

### 2.4 Lisbon City Tax Calculation

Files: `lib/portuguese-tourist-tax.ts`, booking/check-out actions, invoicing routes

- Implement and test:
  - Correct nightly rate (2 EUR capped by nights/guest according to Lisbon rules).
  - Display tax clearly during check-out and invoice generation.
- Stability work:
  - Unit tests with edge cases (long stays, minors, comped nights).
  - Clear explanation on the UI so staff trust the numbers.

## 3. Technical Stabilization Priorities

### 3.1 Type Safety & Actions

- Run and fix: `pnpm run type-check` and `pnpm run lint` for:
  - `app/actions/*.ts`
  - `lib/*.ts` related to bookings/availability/tax.
- Apply **schema-driven** validation:
  - Ensure Zod schemas exist for booking and guest mutations.
  - Reject invalid payloads early in server actions.

### 3.2 Database Integrity

- Verify Prisma models enforce:
  - Unique constraints for `BookingBed` on `(bedId, dateRange)`.
  - Proper foreign keys between `Booking`, `Guest`, `Property`, `Room`, `Bed`.
- Add safety rails:
  - No hard deletes for bookings; use soft flags or statuses.
  - Migration scripts tested on a realistic dev database (seeded data).

### 3.3 E2E Test Coverage For MVP Flows

Tests dir: `tests/e2e/*`

Recommended flows to cover (Playwright):

1. Login -> Select Property -> **Create booking** -> Check in -> Check out.
2. Attempt to create **overlapping booking** for same bed -> see error.
3. Check-in/out flows with Lisbon city tax display.
4. Basic navigation around the dashboard (dashboard -> bookings -> rooms -> guests).

## 4. Product Scope Guardrails (What To Defer)

To reach a stable MVP sooner, explicitly **defer**:

- Full-blown channel manager (Booking.com/Airbnb sync).
- Advanced analytics dashboards and forecasting.
- Complex staff permissions system beyond “admin vs basic staff”.
- Large UI redesigns (e.g., wholesale HeroUI migration) until the operational flows above are battle-tested.

## 5. Suggested Short-Term Roadmap (Next 4–6 Weeks)

Each bullet should translate into one or more Spec Kitty work packages in `kitty-specs/*`.

1. **Lock Down Check-In/Out**
   - Close functional gaps in check-in/out actions and UI.
   - Add tests around state transitions and tax handling.

2. **Harden Booking Creation & Conflict Detection**
   - Confirm domain rules match `docs/DOMAIN_MODEL.md`.
   - Write unit tests for availability calculations and conflict guards.

3. **Operational Dashboard First Version**
   - Ship a clear, low-noise dashboard for daily operations.

4. **Lisbon City Tax Feature Complete**
   - Ensure the math is correct and explainable.
   - Wire it into invoices where needed.

5. **Stabilization & Bug Fix Sprint**
   - Run focused QA using `docs/guides/MANUAL_TESTING_GUIDE.md`.
   - Fix only MVP-blocking bugs; defer cosmetic issues.

## 6. Relationship To HeroUI Modernization

- Treat `kitty-specs/009-ui-modernization-2025` (HeroUI work) as a **separate track**.
- Do **not** block the MVP on a full HeroUI migration.
- Use HeroUI selectively (e.g., for marketing/demo surfaces) only after MVP flows are stable.

This plan keeps the team focused on **operational reliability** and the **Lisbon pilot** while creating space to modernize the UI later without jeopardizing core flows.
