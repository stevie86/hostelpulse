# Task 1: Add "Check In" button to Arrivals list

## Context
We need to update the dashboard to allow receptionists to check in guests with one click.

## Instructions
1.  Open `components/dashboard/daily-activity.tsx`.
2.  Import `checkIn` from `@/app/actions/dashboard`.
3.  Add a "Check In" button to each list item in the "Arrivals Today" section.
4.  Use `useTransition` to handle the pending state of the button.
5.  Style the button using DaisyUI (`btn-primary`, `btn-sm`).

## Verification
*   Create a booking for today.
*   Go to dashboard.
*   Click "Check In".
*   Verify guest moves to "Departures" (if checkout is today) or occupancy stats update.
