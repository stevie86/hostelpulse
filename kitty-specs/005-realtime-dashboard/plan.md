# Implementation Plan: 005-realtime-dashboard

**Branch**: `005-realtime-dashboard` | **Date**: 2025-12-18 | **Spec**: [Link](./spec.md)
**Status**: Core Implementation Complete (Verification & Testing Phase)

## Summary

The "Real-time Dashboard" provides front-desk staff with an immediate view of daily operations (Arrivals, Departures, Occupancy).
**Current State**: The UI and Server Actions are implemented in `app/properties/[id]/dashboard`.
**Remaining Work**: This plan focuses on **Verification** and **E2E Testing** to close the gap between code and quality assurance.

## Technical Context

**Stack**: Next.js 15, Prisma, Tailwind, DaisyUI.
**Key Components**:

- `DashboardPage` (`app/properties/[id]/dashboard/page.tsx`): Server Component fetching aggregated data.
- `checkInBooking` / `checkOutBooking` (`app/actions/bookings.ts`): Server Actions for status updates.

**Testing Strategy**:

- **E2E (Playwright)**:
  - Test Flow 1: "Morning Shift" -> Verify Arrivals list, Click "Check In", Verify status update.
  - Test Flow 2: "Evening Shift" -> Verify Departures list, Click "Check Out", Verify status update.
- **Unit (Jest)**:
  - Verify `checkInBooking` action validates state (can't check in a cancelled booking).

## Constitution Check

- ✅ **Strict Types**: Dashboard uses Prisma generated types.
- ✅ **No API Routes**: Uses Server Actions.
- ✅ **Tailwind**: Uses utility classes.

## Project Structure

### Source Code

```
app/
└── properties/
    └── [id]/
        └── dashboard/
            └── page.tsx      # MAIN DASHBOARD UI (Implemented)

tests/
└── e2e/
    └── dashboard/
        └── daily-ops.spec.ts # NEW: E2E Test for this feature
```

## Implementation Steps (Tasks)

1.  **WP01 - Verification**: Manual walkthrough of the dashboard to ensure the existing code works as expected. Fix any immediate UI bugs.
2.  **WP02 - E2E Testing**: Create `tests/e2e/dashboard/daily-ops.spec.ts` covering the Check-in/Check-out flows.
3.  **WP03 - Refinement**: Add auto-refresh (polling) if missing (FR-03).
