# Manual Testing Guide: Real-time Dashboard

**Feature**: 005-realtime-dashboard
**Target URL**: `http://localhost:3000/properties/prop-csv-test/dashboard` (or port 4002 if testing E2E setup)

## 1. Setup

Ensure your local development server is running and the database is seeded.

```bash
# In the project root
pnpm run db:reset  # Optional: Resets DB to clean slate
pnpm run dev
```

## 2. Test Scenarios

### Scenario A: Verify "Today's Arrivals"
**Goal**: Confirm that a booking starting TODAY appears in the Arrivals list.

1.  **Preparation**:
    *   Go to `http://localhost:3000/properties/prop-csv-test/bookings/new`.
    *   Create a booking with **Check-in Date = Today**.
    *   Status should be "Confirmed".
2.  **Action**:
    *   Navigate to the Dashboard.
    *   Look at the "Today's Arrivals" card.
3.  **Expected Result**:
    *   The guest name should be visible.
    *   A green "Check In" button should be visible.
4.  **Execute**:
    *   Click "Check In".
5.  **Verify**:
    *   The page refreshes (or updates).
    *   The "Check In" button disappears.
    *   The status badge changes to "Checked In".
    *   The "Occupancy" counter at the top increases.

### Scenario B: Verify "Today's Departures"
**Goal**: Confirm that a guest leaving TODAY appears in the Departures list.

1.  **Preparation**:
    *   (If you just checked in the guest from Scenario A):
    *   Go to DB Studio (`pnpm db:studio`) or use SQL to update that booking's `checkOut` date to **Today**.
    *   Ensure status is "checked_in".
2.  **Action**:
    *   Refresh Dashboard.
    *   Look at "Today's Departures".
3.  **Expected Result**:
    *   The guest name is visible.
    *   A yellow "Check Out" button is visible.
4.  **Execute**:
    *   Click "Check Out".
5.  **Verify**:
    *   The button disappears.
    *   The status badge changes to "Checked Out".
    *   The "Occupancy" counter decreases.

### Scenario C: Verify Occupancy Stats
**Goal**: Confirm the top stats bar is accurate.

1.  **Action**: Compare the "Occupancy" percentage with the actual number of in-house guests vs total beds.
2.  **Expected**: `(Occupied Beds / Total Beds) * 100` rounded to nearest integer.

## 3. Reporting Results

If all steps pass, the feature is verified. If something fails, please report:
*   Which step failed?
*   Did the button click throw an error?
*   Did the data not update?
