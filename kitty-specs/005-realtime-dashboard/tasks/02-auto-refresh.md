---
id: WP02
name: Implement Auto-Refresh
status: planned
lane: "planned"
---

# Task: Implement Auto-Refresh

## Context
FR-03 requires data to refresh every 60 seconds. Currently, it's a static Server Component.

## Objectives
1.  Enhance `app/properties/[id]/dashboard/page.tsx` to support refreshing.
2.  **Option A**: Add a `<meta http-equiv="refresh" content="60">` (Simple, but full reload).
3.  **Option B (Preferred)**: Use a Client Component wrapper that calls `router.refresh()` every 60s.

## Implementation Details
*   Create `components/dashboard/auto-refresh.tsx` (Client Component).
*   Use `useEffect` with `setInterval` calling `useRouter().refresh()`.
*   Import this component into the server page.

## Verification
*   Open dashboard, change data in DB (manually), wait 60s, see if UI updates.
