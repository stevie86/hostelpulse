# Feature Specification: One-click Check-in and Check-out UI (Lisbon Pilot)

## 1. Executive Summary

**Intent:** Provide property managers with a fast, one-click interface on the dashboard to update guest statuses (Check-in/Check-out), specifically tailored for the Lisbon market (City Tax) and non-technical staff.
**Value:** Reduces friction during busy operational hours, ensures City Tax compliance, and empowers volunteer staff with zero training.
**Scope:**

- Add "Guest Arrived" (Check In) button to the "Arrivals Today" list on the Dashboard.
- Add "Guest Departed" (Check Out) button to the "Departures Today" list on the Dashboard.
- **New:** Interstitial Modal for City Tax collection (Calculated at 2€/night/guest, max 7 nights).
- Implement optimistic UI updates.

## 2. Actors & User Stories

- **Volunteer Receptionist:** "When a guest arrives, I want to tap a big button, see exactly how much City Tax to collect, and finish the process in under 10 seconds."
- **Property Owner:** "I want to ensure every volunteer collects the correct City Tax amount without needing a calculator."

## 3. Functional Requirements

- **FR-01:** Dashboard "Arrivals Today" list must show a large, touch-friendly "Guest Arrived" button (min 44px height).
- **FR-02:** Clicking "Guest Arrived" must open a Modal:
  - Display: "Collect City Tax: X.00€" (Calculation: 2€ * nights * guests, capped at 14€/guest).
  - Action: "Tax Collected & Check In".
- **FR-03:** Dashboard "Departures Today" list must show a "Guest Departed" button.
- **FR-04:** Clicking "Guest Departed" must call the `checkOut` server action immediately (no tax check needed on exit usually, or simple confirmation).
- **FR-05:** Success/Error feedback via toast.

## 4. Success Criteria

- **SC-01:** Check-in flow (including Tax prompt) completes in < 15 seconds.
- **SC-02:** City Tax calculation is accurate for 100% of test cases.
- **SC-03:** Button targets pass "Fat Finger" test on tablet resolution.

## 5. Technical Constraints

- Use existing `checkIn` and `checkOut` actions in `app/actions/dashboard.ts` (need modification for tax logging if applicable, or just UI prompt for now).
- **Tablet-First Design:** Use `btn-lg` or custom padding for touch targets.
- **Language:** Avoid PMS jargon. Use natural phrases.
