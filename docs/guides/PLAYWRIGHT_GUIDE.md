# Playwright Testing Guide 🎭

This document outlines how to perform End-to-End (E2E) testing for HostelPulse using Playwright. 

> **Policy:** All E2E tests are currently executed manually by the User, not the AI Agent.

---

## 1. Prerequisites

Ensure your environment is set up. We use `mise` to manage Node.js versions.

```bash
# 1. Install dependencies (if you haven't already)
pnpm install

# 2. Install Playwright browsers
pnpm exec playwright install
```

---

## 2. Test Structure

Tests are located in `tests/e2e/`. 
*   `auth/`: Login and authentication flows.
*   `dashboard/`: Daily operations (Check-in, Check-out).
*   *(Future)*: `rooms/`, `bookings/`, `guests/`.

**Configuration:** `playwright.config.ts` handles the setup.
*   **Port:** Tests run against a local dev server on port **4002**.
*   **Timeout:** 120 seconds (to allow for Next.js compilation).
*   **Mode:** Headless by default.

---

## 3. Running Tests

### Option A: The "One-Liner" (Recommended)
This command handles everything: starts the dev server, waits for it to be ready, and runs the tests.

```bash
# Run ALL tests
pnpm test:e2e

# Run a SPECIFIC test file
pnpm exec playwright test tests/e2e/dashboard/daily-ops.spec.ts
```

### Option B: The "Debug Mode" (Visual)
If you want to see the browser open and watch the test click through your app:

```bash
# Run with UI helper
pnpm exec playwright test --ui
```

### Option C: Manual Server Control (For Troubleshooting)
If the tests time out or fail to start the server, run these in two separate terminal windows:

**Terminal 1: Start the Server**
```bash
# Start Next.js on the test port
pnpm run dev -p 4002
```

**Terminal 2: Run the Tests**
```bash
# Run tests against the already-running server
pnpm exec playwright test
```

---

## 4. Writing New Tests

1.  **Create File:** Add a new `.spec.ts` file in the appropriate `tests/e2e/` folder.
2.  **Use Page Objects:** (Recommended) Keep selectors clean.
3.  **Authentication:** Most tests require login. Use `test.beforeEach` to authenticate:
    ```typescript
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[name="email"]', 'admin@hostelpulse.com');
      await page.fill('input[name="password"]', 'password');
      await page.click('button[type="submit"]');
      await page.waitForURL('/');
    });
    ```

---

## 5. Troubleshooting

*   **Timeout Errors:** Next.js compilation is slow on the first run. Try running the test again; the second run is usually much faster.
*   **Port In Use:** Ensure no other process is using port `4002`. Run `lsof -i :4002` to check.
*   **Database State:** Tests run against your local database. If tests rely on specific data (like "a booking for today"), ensure your seed data is fresh or the test creates its own data (like `daily-ops.spec.ts` does).
