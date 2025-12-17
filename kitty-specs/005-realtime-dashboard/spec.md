# Feature Specification: Real-time Dashboard

## 1. Executive Summary
**Intent:** Provide an operational "Mission Control" for the front desk.
**Value:** Staff need to know "Who is arriving today?" at a glance.
**Scope:**
*   Arrivals Widget (List of check-ins today).
*   Departures Widget (List of check-outs today).
*   In-House Widget (List of current guests).
*   Occupancy Metric (%).

## 2. Functional Requirements
*   **FR-01:** "Today" is determined by Property Timezone.
*   **FR-02:** One-click "Check In" / "Check Out" buttons on the widgets.
*   **FR-03:** Auto-refresh data every 60 seconds (or use polling).

## 3. Success Criteria
*   **SC-01:** Dashboard loads in < 1s.
*   **SC-02:** Checking in a guest updates the UI immediately.
