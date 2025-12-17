---
work_package_id: WP04
subtasks:
  - T010
lane: planned
---

# Work Package 04: Real-time Updates

## 1. Objective
Ensure the dashboard data stays reasonably up-to-date without requiring manual refreshes from the user.

## 2. Context
The dashboard is a "living" view of the hostel's state. If a booking is made on another system or a guest's status changes, the front desk should see it reflected on the dashboard within a short period. This work package implements a simple polling mechanism to achieve this.

## 3. Implementation Guide

### Subtask T010: Implement 60-second Polling

-   **File Location:** `app/(dashboard)/dashboard/page.tsx`
-   **Logic:**
    -   The `spec.md` calls for auto-refresh. The simplest way to achieve this with server components is to use the Next.js `revalidate` option in the `fetch` call, but that's for caching, not for pushing updates to the client.
    -   A better approach for this requirement is to turn the page into a client component that fetches data, or to have a client component on the page that polls.
    -   Let's modify the `dashboard/page.tsx` to be a client component (`'use client'`).
    -   Use a `useEffect` hook with a `setInterval` to re-fetch the data every 60 seconds.
    -   You can use `useRouter().refresh()` inside the interval function to trigger a refresh of the server components and re-run the queries. This is a simple and effective way to "poll".

## 4. Definition of Done
- The dashboard page automatically refreshes its data approximately every 60 seconds.
- The implementation uses a client-side polling mechanism (`setInterval` + `useRouter().refresh()`).
