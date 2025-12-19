# Spec-Kitty Workflow Guide

## Overview
We use **Spec Kitty** to manage our development lifecycle. This tool enforces a **Spec-First** approach, ensuring we define *what* we are building before we write a single line of code. It also isolates work into **Feature Branches** (via Git Worktrees) to keep our `main` branch stable.

## Quick Start

### 1. Start a New Feature
When you have a new task (e.g., "Add Booking Cancellation"), run:

```bash
npm run spec -- specify "Booking Cancellation"
```

This will:
1.  Create a git branch `00X-booking-cancellation`.
2.  Create a folder `.worktrees/00X-booking-cancellation`.
3.  Generate `kitty-specs/.../spec.md`.

### 2. Define & Plan
Navigate to the worktree and edit the spec files:

1.  **Edit Spec:** Fill in `spec.md` with User Stories and Requirements.
2.  **Generate Plan:** Run `npm run spec -- plan`. This creates `plan.md`.
3.  **Breakdown Tasks:** Run `npm run spec -- tasks`. This creates task files in `tasks/planned/`.

### 3. Implement (The Loop)
**Always work inside the worktree folder:** `.worktrees/00X-booking-cancellation`.

1.  Pick a task from `tasks/planned/`.
2.  Move it to `tasks/doing/`.
3.  Write code & tests.
4.  Verify (Lint/Test).
5.  Move task to `tasks/done/`.

### 4. Merge & Close
When all tasks are done:

```bash
npm run spec -- accept  # Runs final validation
npm run spec -- merge   # Merges to main and deletes worktree
```

## The Dashboard
To visualize progress:
```bash
npm run spec -- dashboard
```
Open `http://localhost:9237`.

## Key Rules
*   **Constitution:** All code must adhere to `.kittify/memory/constitution.md`.
*   **Isolation:** Never modify `main` directly. Only modify code inside your feature worktree.
*   **Safety:** The `.worktrees/` folder is git-ignored. Spec Kitty handles the git magic for you.
