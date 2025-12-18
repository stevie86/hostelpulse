---
id: WP01
name: E2E Testing for Dashboard
status: planned
lane: "doing"
---

# Task: Implement E2E Tests for Dashboard

## Context
The Dashboard UI exists, but we have zero automated tests for it. We need to verify that "Checking In" and "Checking Out" actually works.

## Objectives
1.  Create `tests/e2e/dashboard/daily-ops.spec.ts`.
2.  Test Flow:
    *   Login as admin.
    *   Navigate to Property Dashboard.
    *   Find a "Confirmed" booking in "Arrivals".
    *   Click "Check In".
    *   Verify it moves to "Departures" (or In-House list) and status badge changes.

## Constraints
*   Use `playwright`.
*   You may need to seed data in the test (`beforeAll`) to ensure there is a booking *today*.
*   Use `page.getByRole('button', { name: 'Check In' })`.

## Verification
*   Run `pnpm test:e2e` and ensure it passes.
