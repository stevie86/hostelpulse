# Spec Kitty: The Comprehensive Guide

## What is Spec Kitty?

**Spec Kitty** is an AI-native development workflow tool designed to enforce focus, discipline, and context management. It acts as a "flight controller" for your coding sessions, preventing scope creep and ensuring that every line of code traces back to a written specification.

It is particularly powerful for "Clean Slate" rewrites (like **HostelPulse**) because it forces you to define *exactly* what you are building before you build it.

---

## 1. Core Philosophy

1.  **Spec-First:** No code is written without a `spec.md`. The spec is the contract.
2.  **Context Isolation:** Every feature lives in its own **Git Worktree**. This means when you work on Feature A, the file system literally strictly isolates you from Feature B's uncommitted changes.
3.  **Phase-Based:** Development follows a strict lifecycle: `Specify` -> `Plan` -> `Task` -> `Implement` -> `Verify` -> `Merge`.
4.  **Agent-Native:** It produces artifacts (Markdown files) specifically optimized for AI Agents (like Gemini, Claude, Codex) to read and understand.

---

## 2. Directory Structure

Your project root now looks like this:

```text
/
├── .kittify/                # Configuration & Internal State
│   ├── constitution.md      # Global rules (Style guide, Tech stack)
│   ├── templates/           # Markdown templates for specs/plans
│   └── scripts/             # Automation scripts
├── .worktrees/              # ACTIVE FEATURE WORKSPACES
│   ├── 001-feature-a/       # <--- You work here for Feature A
│   └── 002-feature-b/       # <--- You work here for Feature B
├── .venv-speckitty/         # Isolated Python environment (Hidden)
├── package.json             # NPM scripts integration
└── ... (Your normal files)
```

**Key Concept:** When you start a feature, `spec-kitty` creates a **copy** of your repo in `.worktrees/XXX-feature-name`. You should `cd` into that directory to code. This keeps your main root clean.

---

## 3. The Workflow (Lifecycle)

### Phase 1: Inception
**Command:** `npm run spec -- specify "Feature Name"`
*   **What it does:**
    *   Creates a new branch `001-feature-name`.
    *   Creates a new worktree at `.worktrees/001-feature-name`.
    *   Generates a `spec.md` template.
*   **Your Job:** Fill in the User Stories, Requirements, and Success Criteria in `spec.md`.

### Phase 2: Planning
**Command:** `npm run spec -- plan`
*   **What it does:** Reads `spec.md` and generates `plan.md`.
*   **Your Job:** Break the feature into technical steps (Architecture, Data structures, Component hierarchy).

### Phase 3: Task Breakdown
**Command:** `npm run spec -- tasks`
*   **What it does:** Reads `plan.md` and generates individual task files (prompts) in `tasks/planned/`.
*   **Your Job:** Review the tasks. Each task file acts as a specific instruction for the AI coder.

### Phase 4: Implementation (The Loop)
**Command:** `npm run spec -- implement`
*   **What it does:**
    *   Picks the next task from `tasks/planned/`.
    *   Moves it to `tasks/doing/`.
    *   Executing the task (coding).
*   **Your Job:** Write code, run tests. When a task passes tests, move it to `tasks/done/`.

### Phase 5: Completion
**Command:** `npm run spec -- accept`
*   **What it does:** Runs final checklist/validation.

**Command:** `npm run spec -- merge`
*   **What it does:**
    *   Merges the feature branch into `main`.
    *   Deletes the worktree.
    *   Cleans up.

---

## 4. Dashboard

**Command:** `npm run spec -- dashboard`
*   Runs a local web server (usually port 9237).
*   Visualizes your active features and the status of tasks (Kanban board).
*   Useful for seeing "Where are we?" at a glance.

---

## 5. Integration with Your Project

We have streamlined the setup for **HostelPulse**:

*   **NPM Integration:** You don't need to touch Python. Use `npm run spec -- <command>`.
*   **Ignored:** All `spec-kitty` folders are in `.gitignore` and `.vercelignore`, so they never mess up production.
*   **Constitution:** A global `constitution.md` file enforces your "Operation Bedrock" rules (No `any`, Next.js 15, etc.) across all worktrees.

## 6. Cheatsheet

| Action | Command |
| :--- | :--- |
| **Start Feature** | `npm run spec -- specify "Name"` |
| **Open Board** | `npm run spec -- dashboard` |
| **Fix Broken Env** | `npm run spec:setup` |
