---
work_package_id: "WP04"
title: "CI/CD Stabilization & Test Fixes"
lane: "planned"
subtasks:
  - "T007"
  - "T008"
  - "T009"
phase: "Phase 4 - Stabilization"
assignee: "user"
agent: "Gemini"
shell_pid: "12345"
---

# Work Package Prompt: WP04 – CI/CD Stabilization & Test Fixes

## Goal
Resolve persistent CI/CD failures related to NextAuth types, database race conditions in tests, and environment configuration.

## Tasks
- T007: Fix `jest.setup.ts` and `jest.config.js` to properly support TypeScript and global mocks (TextEncoder, Request/Response).
- T008: update `__tests__` to correctly mock `verifyPropertyAccess` and `auth()` to bypass RBAC and avoid "Unauthorized" errors.
- T009: Stabilize `import.test.ts` timeouts and ensure `dashboard.test.ts` database operations are isolated or sequential.

## Activity Log
history:
  - timestamp: "2025-12-19T20:55:00Z"
    lane: "planned"
    agent: "system"
    action: "Prompt generated to address CI failures"
  - timestamp: "2025-12-19T21:00:00Z"
    lane: "doing"
    agent: "Gemini"
    action: "Implemented T007, T008, T009 fixes"
  - timestamp: "2025-12-19T21:30:00Z"
    lane: "done"
    agent: "Gemini"
    action: "Resolved all test failures and verified locally"
