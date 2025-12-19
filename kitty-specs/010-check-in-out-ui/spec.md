# Feature Specification: One-click Check-in and Check-out UI

## 1. Executive Summary
**Intent:** Provide property managers with a fast, one-click interface on the dashboard to update guest statuses (Check-in/Check-out).
**Value:** This reduces friction during busy operational hours and fulfills a core "Must-Have" requirement for the MVP.
**Scope:**
*   Add "Check In" button to the "Arrivals Today" list on the Dashboard.
*   Add "Check Out" button to the "Departures Today" list on the Dashboard.
*   Implement optimistic UI updates or revalidation to ensure the dashboard remains accurate.

## 2. Actors & User Stories
*   **Receptionist:** "When a guest arrives, I want to click a single button to mark them as checked in so I can quickly move to the next guest."
*   **Property Manager:** "I want to see real-time updates of who has arrived and who has left today."

## 3. Functional Requirements
*   **FR-01:** Dashboard "Arrivals Today" list must show a "Check In" button for every booking with status `confirmed` or `pending`.
*   **FR-02:** Dashboard "Departures Today" list must show a "Check Out" button for every booking with status `checked_in`.
*   **FR-03:** Clicking "Check In" must call the `checkIn` server action and update the booking status to `checked_in`.
*   **FR-04:** Clicking "Check Out" must call the `checkOut` server action and update the booking status to `checked_out`.
*   **FR-05:** Success/Error feedback should be provided via toast or standard alert.

## 4. Success Criteria
*   **SC-01:** Status update completes in < 1 second.
*   **SC-02:** Checked-in guest immediately moves from "Arrivals" to "Occupied" (stats) or disappears from the Arrivals list.

## 5. Technical Constraints
*   Use existing `checkIn` and `checkOut` actions in `app/actions/dashboard.ts`.
*   Maintain type safety (No `any`).
*   Tailwind + DaisyUI for the buttons.
