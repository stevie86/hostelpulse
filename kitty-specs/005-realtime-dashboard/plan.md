# Implementation Plan: Real-time Dashboard

## 1. Architecture
*   **Data Fetching:**
    *   `getDashboardStats(propertyId)`: Returns aggregated counts (Occupancy, Arrivals, Departures).
    *   `getDailyActivity(propertyId)`: Returns list of specific bookings for today.
*   **UI Components:**
    *   `OccupancyCard`: Donut chart or simple % stat.
    *   `ActivityList`: List of "Arriving" and "Departing" guests.
    *   `QuickActions`: Check-in button (triggers server action).

## 2. Step-by-Step Implementation
*   [ ] **Task 1:** Dashboard Server Actions (Aggregation queries).
*   [ ] **Task 2:** Dashboard Page Layout (Grid).
*   [ ] **Task 3:** "Check In" Action integration.
