# UI Test Strategy & Playwright Workflow

This document defines the strategy for validating the HostelPulse UI. It serves as a guide for **current manual testing** and a **blueprint for future Playwright automation**.

## 1. UI Test Scope

The testing scope covers the critical user journeys for property management.

### Primary Areas
- **Authentication**: Login flow and protection of secured routes.
- **Navigation**: Sidebar functionality, collapse states, and correct routing.
- **Dashboard**: Widget rendering and data visualization.
- **Core Features**:
  - **Room Management**: Listing, filtering, and status updates.
  - **Guest Management**: Guest profiles, search, and history.
  - **Bookings**: Calendar view and booking creation.
  - **Data Hub**: Import/Export interfaces.

## 2. Target Components & Pages

| Feature Area | Route Pattern | Target Components |
| :--- | :--- | :--- |
| **Auth** | `/login` | `LoginForm`, Error Toasts |
| **Dashboard** | `/properties/[id]/dashboard` | `Sidebar`, `StatsWidget`, `RecentBookings` |
| **Rooms** | `/properties/[id]/rooms` | `RoomGrid`, `RoomCard`, `StatusBadge` |
| **Guests** | `/properties/[id]/guests` | `GuestList`, `GuestSearch`, `GuestDetailModal` |
| **Bookings** | `/properties/[id]/bookings` | `BookingCalendar`, `NewBookingForm` |
| **Data Hub** | `/properties/[id]/data` | `FileUploader`, `ImportPreview` |

## 3. Test Assertions

For each test case (manual or automated), verify:

1.  **Visibility**: Key elements (buttons, inputs, headers) are visible on load.
2.  **Interactivity**: Buttons respond to clicks; inputs accept text.
3.  **State Change**: UI reflects actions (e.g., clicking "Edit" opens a modal).
4.  **Data Accuracy**: Displayed data matches expected test data (e.g., Room 101 is "Occupied").
5.  **Routing**: URL updates correctly after navigation.
6.  **Responsiveness**: Layout adapts to mobile/desktop (Sidebar collapse).

## 4. Test Data Requirements

A consistent seed data set is required for reproducible tests.

-   **User**: `admin@hostelpulse.com` / `password123`
-   **Property**: "Downtown Hostel" (ID: `default` or UUID)
-   **Rooms**:
    -   101 (Dorm, 6 beds, Mixed)
    -   102 (Private, Double)
-   **Guests**:
    -   "John Doe" (Current guest)
    -   "Jane Smith" (Future booking)

*Recommendation*: Use `prisma/seed.mjs` to reset this state before testing.

## 5. Expected Outcomes

-   **Success Path**: Actions complete without errors; success toasts appear; lists update immediately.
-   **Error Path**: Invalid inputs trigger field-level validation messages; network errors show global alerts.
-   **Performance**: Pages load < 1s; interactions < 200ms latency.

## 6. Test Execution Plan (Manual)

1.  **Reset Environment**: Run `npx prisma db seed` (or `npm run db:reset` if configured).
2.  **Start Server**: Run `npm run dev`.
3.  **Open Browser**: Navigate to `http://localhost:3000/login`.
4.  **Execute Flow**:
    -   Login as Admin.
    -   Navigate to Rooms -> Verify list.
    -   Navigate to Guests -> Search for "John".
    -   Collapse/Expand Sidebar.
5.  **Log Issues**: Record visual bugs or console errors in `docs/DEVELOPMENT_LOG.md`.

## 7. Setup Prerequisites

-   **Node.js**: v18+ installed.
-   **Database**: Local Postgres running or connected to a dev DB.
-   **Environment**: `.env` file configured with `DATABASE_URL` and `NEXTAUTH_SECRET`.
-   **Dependencies**: `pnpm install` completed.

## 8. Test Environment Details

-   **Local**: `http://localhost:3000` (Manual) / `http://localhost:4002` (Playwright).
-   **Browser**: Chrome (Primary), Firefox/Safari (Secondary checks).
-   **Viewport**: Desktop (1920x1080) and Mobile (375x667).

## 9. Version Control Strategy

-   **Tests as Code**: Playwright specs live in `tests/e2e/`.
-   **Branching**: New UI features *must* include updated test specs in the same PR.
-   **CI Integration**: GitHub Actions runs `npm run test:e2e` on every push to `main` and PRs.

## 10. Rollback Procedure

If a UI deployment fails critical tests:

1.  **Identify**: Check CI logs for failing assertions.
2.  **Revert**: `git revert <commit-hash>`.
3.  **Deploy**: Push the revert commit to trigger a safe deployment.
4.  **Debug**: Pull the failing commit locally to reproduce and fix.

---

## Future Playwright Implementation Guide

When ready to automate, create spec files in `tests/e2e/` following this pattern:

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@hostelpulse.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  
  await expect(page).toHaveURL(/.*\/dashboard/);
});
```
