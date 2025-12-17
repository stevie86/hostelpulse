# Task Breakdown: Real-time Dashboard

This document outlines the work packages and subtasks required to implement the Real-time Dashboard feature.

## Work Packages

### WP01: Backend Data Endpoints
- **Priority:** High
- **Goal:** Create the foundational server actions for fetching dashboard data.
- **Prompt:** [tasks/planned/WP01-backend-data-endpoints.md](./tasks/planned/WP01-backend-data-endpoints.md)
- **Subtasks:**
  - [x] **T001:** Create `getDashboardStats` server action for aggregated counts.
  - [x] **T002:** Create `getDailyActivity` server action for arrival/departure lists.

### WP02: Basic Dashboard UI Structure
- **Priority:** High
- **Goal:** Set up the non-interactive dashboard page with data display components.
- **Prompt:** [tasks/planned/WP02-basic-dashboard-ui.md](./tasks/planned/WP02-basic-dashboard-ui.md)
- **Subtasks:**
  - [x] **T003:** Create main dashboard grid layout.
  - [x] **T004:** Create `OccupancyCard` component.
  - [x] **T005:** Create `ActivityList` component.

### WP03: Interactive Check-in/Check-out
- **Priority:** Medium
- **Goal:** Implement the core check-in and check-out functionality.
- **Prompt:** [tasks/planned/WP03-interactive-checkin.md](./tasks/planned/WP03-interactive-checkin.md)
- **Subtasks:**
  - [x] **T006:** Add "Check-In" / "Check-Out" buttons to the `ActivityList`.
  - [x] **T007:** Create the `checkIn` server action.
  - [x] **T008:** Create the `checkOut` server action.
  - [x] **T009:** Implement UI feedback for actions (e.g., loading states).

### WP04: Real-time Updates
- **Priority:** Medium
- **Goal:** Add auto-refresh capabilities to the dashboard.
- **Prompt:** [tasks/planned/WP04-real-time-updates.md](./tasks/planned/WP04-real-time-updates.md)
- **Subtasks:**
  - [x] **T010:** Implement a 60-second polling mechanism to re-fetch dashboard data.
