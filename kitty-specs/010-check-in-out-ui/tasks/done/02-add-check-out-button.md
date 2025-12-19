# Task 2: Add "Check Out" button to Departures list

## Context
We need to update the dashboard to allow receptionists to check out guests with one click.

## Instructions
1.  Open `components/dashboard/daily-activity.tsx`.
2.  Import `checkOut` from `@/app/actions/dashboard`.
3.  Add a "Check Out" button to each list item in the "Departures Today" section.
4.  Use `useTransition` to handle the pending state.
5.  Style the button using DaisyUI (`btn-secondary`, `btn-sm`).

## Verification
*   Identify a guest scheduled to depart today.
*   Click "Check Out".
*   Verify guest disappears from the "Departures" list.
