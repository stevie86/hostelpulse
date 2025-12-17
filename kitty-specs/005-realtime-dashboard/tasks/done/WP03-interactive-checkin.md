---
work_package_id: WP03
subtasks:
  - T006
  - T007
  - T008
  - T009
lane: planned
---

# Work Package 03: Interactive Check-in/Check-out

## 1. Objective
Implement the core interactive functionality of the dashboard: allowing front-desk staff to check guests in and out with a single click.

## 2. Context
This work package builds on the UI created in WP02 by adding the server actions and client-side logic needed to handle booking status changes directly from the dashboard.

## 3. Implementation Guide

### Subtask T006: Add Buttons to `ActivityList`

-   **File Location:** `components/dashboard/ActivityList.tsx`
-   **Logic:**
    -   In the "Arrivals" list, add a "Check In" button to each item.
    -   In the "Departures" list, add a "Check Out" button to each item.
    -   The `onClick` handlers for these buttons will trigger the server actions you create next.

### Subtask T007: Create `checkIn` Server Action

-   **File Location:** `app/actions/dashboardActions.ts`
-   **Function Signature:** `export async function checkIn(bookingId: string)`
-   **Logic:**
    -   This is a server action that will be called from a client component.
    -   It should update the status of the specified booking to "CHECKED_IN".
    -   It should include error handling.
    -   After updating, you should revalidate the path for the dashboard (`revalidatePath('/dashboard')`) to ensure the UI reflects the change.

### Subtask T008: Create `checkOut` Server Action

-   **File Location:** `app/actions/dashboardActions.ts`
-   **Function Signature:** `export async function checkOut(bookingId: string)`
-   **Logic:**
    -   Similar to the `checkIn` action.
    -   It should update the status of the specified booking to "CHECKED_OUT".
    -   Include error handling and revalidate the dashboard path.

### Subtask T009: Implement UI Feedback

-   **File Location:** `components/dashboard/ActivityList.tsx`
-   **Logic:**
    -   Use the `useTransition` hook from React to handle the pending state of the server action.
    -   When a button is clicked and the action is pending, the button should be disabled to prevent multiple clicks.
    -   You could also show a loading spinner or change the button text (e.g., "Checking in...").
    -   This provides immediate feedback to the user.

## 4. Definition of Done
- Buttons are present on the activity list items.
- `checkIn` and `checkOut` server actions are implemented and correctly update booking statuses.
- The UI provides feedback during the action's pending state.
- The dashboard data automatically refreshes via `revalidatePath` after an action is completed.
