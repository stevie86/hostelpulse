# HostelPulse MVP Stabilization Plan

Status: draft guidance for stable MVP

## 1. Context

- Product: multi property hostel PMS focused on Lisbon pilot.
- Core domain: Properties, Rooms, Beds, Guests, Bookings, Check in, Check out, City tax, SEF.
- Architecture: Next.js 15 app router, Prisma, PostgreSQL, Tailwind + DaisyUI + shadcn style components.

This document focuses on what to stabilize first so you can confidently run a real hostel on HostelPulse.

## 2. MVP Definition (Lisbon Pilot)

For a "stable MVP" you should be able to:

1. Operate a single property end to end for basic stays.
2. Avoid revenue killing mistakes (double bookings, wrong dates, lost guests).
3. Keep compliance friction low enough that staff do not fall back to spreadsheets.

Concretely, MVP is stable when the following daily workflows are boring and predictable:

- Reception can check guests in and out quickly.
- Staff can create, modify, and cancel bookings without conflicts.
- Beds and rooms never double book.
- Guest details are easy to capture and find.
- Simple invoices / receipts can be produced when needed.
- Data survives restarts, deploys, and schema changes.

## 3. Stabilization Priorities

### P1: Check in / Check out flows

Goal: no stress at reception.

- Guarantee that the flows under `app/(dashboard)/properties/[id]/check-in` and `app/(dashboard)/properties/[id]/check-out` handle the full lifecycle defined in `DOMAIN_MODEL.md`.
- Ensure clear states: Pending, Confirmed, Checked in, Checked out.
- Make sure staff can:
  - Search by guest name, booking code, or room/bed.
  - Assign or move beds at check in.
  - Apply city tax and mark it as collected.
- Add happy path Playwright coverage for:
  - "New booking -> Arriving today -> Check in -> Check out" for a single bed booking.

### P1: Booking engine and conflict prevention

Goal: zero double bookings.

- Reuse the availability rules in `DOMAIN_MODEL.md` (bed availability by date range and booking status).
- Focus on `app/actions/bookings.ts` and related actions for creating and updating bookings.
- Add an explicit conflict checker that:
  - Runs before every booking creation or bed assignment.
  - Refuses to save if any overlapping booking exists for the same bed and overlapping dates.
- Add targeted Jest tests for:
  - Overlapping bookings on same bed are rejected.
  - Adjacent bookings (checkout on day N, next check in on day N) are allowed.

### P2: Room, bed, and property data integrity

Goal: the inventory model never surprises you.

- Confirm that every Bed belongs to exactly one Room and Property and is never orphaned.
- Ensure that deleting a Room or Property is either:
  - Forbidden when active/future bookings exist, or
  - Safely cascaded with explicit business rules.
- Add basic admin pages for:
  - Viewing all rooms and beds for a property.
  - Spot checking occupancy for a given date range.

### P2: Guest data and searchability

Goal: always find the right person.

- Stabilize guest forms and validation in `app/(dashboard)/properties/[id]/guests`.
- Require: first name, last name, and at least one contact method.
- Add simple but fast search by name, email, and national id/passport.
- Ensure guest history shows previous stays and outstanding balances.

### P3: Invoicing and basic compliance stubs

Goal: enough structure that real invoices and SEF can be layered on later.

- Validate the invoices route under `app/api/invoices/[bookingId]/route.ts` and associated UI.
- For MVP, aim for:
  - A simple invoice PDF or HTML with totals, city tax line, and basic property info.
  - A clearly defined hook place for later fiscal integration (Moloni, certified invoicing).
- For SEF:
  - Add a simple export that lists all checked in guests by date range in the format you will later map to SEF xml.
  - Treat full SEF automation as a Phase 2 feature, but keep the data model ready.

## 4. Reliability and Testing Strategy

Once the flows above are in place, stabilize by shrinking the surface area:

1. Identify the top 3 daily flows:
   - Create booking -> Check in -> Check out.
   - Walk in booking -> Immediate check in.
   - Guest search -> View history.
2. For each flow, ensure you have:
   - At least one Jest test for the core business logic (actions and lib helpers).
   - At least one Playwright test that covers the happy path.
3. Add a lightweight manual test checklist (can live in `docs/guides/MANUAL_TESTING_GUIDE.md` as a new section) for reception to run after major changes.

## 5. Hard Trade offs for MVP

To keep the MVP stable, explicitly postpone:

- Full visual redesigns or library swaps (HeroUI, Tailwind v4) until Operation Bedrock is robust.
- Channel integrations (Booking.com, others) that would multiply the conflict surface.
- Advanced analytics beyond a simple dashboard with occupancy, arrivals, and departures for today.

You are better off with a boring but rock solid dashboard than a beautiful one that staff cannot trust.

## 6. Suggested Sequence

1. Lock in the domain rules from `docs/DOMAIN_MODEL.md` and make sure all actions enforce them.
2. Finish check in / check out flows with good UX and tests.
3. Harden the booking engine and conflict checker.
4. Tighten room/bed integrity and guest search.
5. Add simple invoices and SEF export stubs.
6. Only then, revisit UI modernization and HeroUI integration.
