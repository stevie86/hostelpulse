---
work_package_id: WP01
subtasks:
  - T001
  - T002
lane: planned
---

# Work Package 01: Backend Data Endpoints

## 1. Objective
Create the foundational server actions required to fetch all data for the real-time dashboard. This includes aggregated statistics and lists of daily activities.

## 2. Context
The dashboard requires two primary data sources:
1.  High-level stats (Occupancy, arrivals, departures).
2.  Detailed lists of guests arriving and departing today.

These actions will be the backbone of the dashboard UI.

## 3. Implementation Guide

### Subtask T001: Create `getDashboardStats` Server Action

-   **File Location:** `app/actions/dashboardActions.ts` (create if it doesn't exist).
-   **Function Signature:** `export async function getDashboardStats(propertyId: string)`
-   **Logic:**
    -   Query the database to get counts for:
        -   Total number of guests currently checked in (`occupancy`).
        -   Number of bookings scheduled to arrive today (`arrivals`).
        -   Number of bookings scheduled to depart today (`departures`).
    -   Return an object: `{ occupancy: number; arrivals: number; departures: number; }`
-   **Note:** "Today" should be calculated based on the property's timezone. You may need a utility function for this.

### Subtask T002: Create `getDailyActivity` Server Action

-   **File Location:** `app/actions/dashboardActions.ts`
-   **Function Signature:** `export async function getDailyActivity(propertyId: string)`
-   **Logic:**
    -   Query the database for bookings.
    -   Fetch all bookings scheduled to arrive today.
    -   Fetch all bookings scheduled to depart today.
    -   Return an object containing two arrays: `{ arrivals: Booking[]; departures: Booking[]; }`
    -   Ensure you return enough data for the UI (guest name, room number, booking status).

## 4. Definition of Done
- Both `getDashboardStats` and `getDailyActivity` server actions are created and exported.
- The functions are typed correctly and contain the necessary database queries.
- The functions handle the `propertyId` parameter.
