---
work_package_id: WP02
subtasks:
  - T003
  - T004
  - T005
lane: planned
---

# Work Package 02: Basic Dashboard UI Structure

## 1. Objective
Create the basic, non-interactive UI structure for the dashboard. This includes the main page layout and the components that will display data from the backend actions created in WP01.

## 2. Context
With the data-fetching actions in place, we can now build the visual shell of the dashboard. This work package focuses on creating the components and arranging them on the page, and hooking them up to the data sources.

## 3. Implementation Guide

### Subtask T003: Create Main Dashboard Grid Layout

-   **File Location:** `app/(dashboard)/dashboard/page.tsx` (create directory and file if needed).
-   **Logic:**
    -   This will be a server component.
    -   Call `getDashboardStats` and `getDailyActivity` to fetch the initial data.
    -   Use CSS Grid or Flexbox to create a layout for the dashboard widgets. A 2x2 grid might be appropriate.
    -   Pass the fetched data as props to the components you'll create in the next steps.

### Subtask T004: Create `OccupancyCard` Component

-   **File Location:** `components/dashboard/OccupancyCard.tsx` (create directory and file).
-   **Logic:**
    -   This is a client component (`'use client'`).
    -   It should accept the dashboard stats (occupancy, arrivals, departures) as props.
    -   Display the occupancy percentage. A simple text display is fine for now. You can also add displays for arrival and departure counts.
    -   Style it using TailwindCSS to look like a "card".

### Subtask T005: Create `ActivityList` Component

-   **File Location:** `components/dashboard/ActivityList.tsx` (create directory and file).
-   **Logic:**
    -   This is a client component (`'use client'`).
    -   It should accept the daily activity data (arrivals and departures arrays) as props.
    -   Render two lists: one for "Arrivals" and one for "Departures".
    -   For each item in the lists, display key information like guest name and room number.

## 4. Definition of Done
- The main dashboard page is created and lays out the child components.
- `OccupancyCard` is created and displays the stats.
- `ActivityList` is created and displays the arrival and departure lists.
- The dashboard page successfully fetches and passes data to the components.
