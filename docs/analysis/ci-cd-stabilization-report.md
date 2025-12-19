# CI/CD Stabilization Analysis & Plan

## Current Status
- **Vercel Deployment:** ✅ **Ready**
  - **Issue:** Deployment failed due to >2GB upload size.
  - **Fix:** Updated `.vercelignore` to exclude `.worktrees`, `.cleanup-temp`, and `.git`.
  - **Status:** Preview deployment `https://hostelpulse-qc4bce8tf-stefan-pirkers-projects.vercel.app` is live and functional.

- **Build Pipeline:** ✅ **Passing**
  - **Issue:** `Type error: 'signIn' is of type 'unknown'` due to NextAuth v5 beta types.
  - **Fix:** Updated `auth.ts` and `auth.config.ts` with correct type definitions and `eslint-disable` suppressions for unavoidable `any` usage.
  - **Status:** `pnpm build` passes locally and in CI.

- **Test Suite (CI):** ❌ **Failing**
  - **Issue 1:** `SyntaxError: Cannot use import statement outside a module` in `jest.setup.js`.
    - **Fix:** Converted to `jest.setup.ts`, updated `jest.config.js`, and used `require` for CJS compatibility + `Request`/`Response` polyfills.
  - **Issue 2:** Database Race Conditions & Foreign Key Violations.
    - **Context:** Tests run in parallel against a single shared Postgres container in CI.
    - **Fix Attempt 1:** Added `--runInBand` to `test:ci`.
    - **Current Failure:** Tests failing on logic/assertions (e.g., `Guest` creation violating constraints, `dashboard` stats mismatch). This suggests `beforeEach` cleanup isn't sufficient or shared state is leaking even with sequential execution.

## Blockers
1.  **Test Isolation:** `__tests__/actions/dashboard.test.ts` and `guests.test.ts` conflict on shared database state despite cleanup hooks.
2.  **Mock Consistency:** Inconsistent mocking of `auth()` and `verifyPropertyAccess` across different test files led to "Unauthorized" errors (now largely patched with global mocks, but verification needed).

## Action Plan (Spec-Kitty WP04)

We are executing **Work Package WP04: CI/CD Stabilization**.

### Step 1: Isolate Database Logic (T009)
- **Strategy:** Instead of relying on `deleteMany` which can be flaky in shared envs, ensuring strict ordering and potentially unique IDs for test data per suite (already partially implemented).
- **Immediate Action:** Review `dashboard.test.ts` failure. The expectation `occupiedBeds` was 3, received 1. This implies data setup failed or query logic is incorrect in the test environment.

### Step 2: Finalize Jest Environment (T007)
- **Strategy:** Ensure `jest.setup.ts` is robust.
- **Verification:** Run `pnpm run test:ci` locally to replicate CI failure exactly.

### Step 3: Verify & Merge
- **Goal:** Green Check on PR #43.
- **Action:** Once tests pass, merge PR #43 to `main`. Vercel will auto-deploy.

## Spec-Kitty Role
- **Tracking:** WP04 tracks these specific tasks.
- **Verification:** `tasks_cli.py accept` will enforce that we don't merge until these specific issues are resolved.
- **Documentation:** This artifact serves as the "Research" output for the stabilization phase.
