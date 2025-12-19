# Multi-Agent Coordination with Spec-Kitty

This document outlines the strategy for utilizing **Spec-Kitty** as a coordination layer for multiple AI agents (e.g., Gemini, Codex, Kiro) to accelerate development and minimize manual "back-and-forth".

## 1. The Core Philosophy

The bottleneck in single-agent chat is linear execution: *Context -> Prompt -> Thought -> Action -> Wait -> User Feedback*.

**Spec-Kitty** breaks this by establishing a **Shared State of Truth** (`spec.md` and `plan.md`) that exists *outside* the chat context. This allows multiple agents to work asynchronously on the same feature without stepping on each other's toes.

## 2. Agent Roles

| Role | Agent | Responsibilities |
| :--- | :--- | :--- |
| **Architect** | **Gemini** | High-level reasoning, system design, writing `spec.md`, breaking down `plan.md`, and reviewing PRs. |
| **Builder** | **Codex/Cursor** | "Heads down" coding. Picks a single checkbox from `plan.md` and implements it. Focuses on file-level changes. |
| **QA / Critic** | **Kiro/Auto** | Runs tests, verifies `spec.md` requirements against implementation, and flags regressions. |

## 3. The Coordination Workflow

### Step 1: Definition (The Architect)
*User interacts with Gemini.*
1.  **User:** "We need a new Review System."
2.  **Gemini:** Uses `spec-kitty` to create a new feature branch (`012-review-system`).
3.  **Gemini:** Drafts `spec.md` (Intent, Requirements) and `plan.md` (Task List).
4.  **Result:** A clear, itemized list of 5-10 atomic tasks in `plan.md`.

### Step 2: Parallel Execution (The Builders)
*User opens multiple windows or lets an autonomous loop run.*
1.  **Agent A:** Reads `plan.md`. Finds the first unchecked task: `[ ] Create Database Schema`.
    *   *Action:* Modifies `schema.prisma`.
    *   *Update:* Marks task as `[x]`.
2.  **Agent B:** Reads `plan.md`. Sees task 1 is done. Picks task 2: `[ ] Create Server Actions`.
    *   *Action:* Implements `actions/reviews.ts`.
    *   *Update:* Marks task as `[x]`.

*Note: Spec-Kitty's folder structure ensures Agent A and Agent B are working in the same context but can target specific files.*

### Step 3: Verification (The Critic)
*Automated or Prompted.*
1.  **QA Agent:** Reads `spec.md` "Success Criteria".
2.  **QA Agent:** Runs `npm test`.
3.  **QA Agent:** Reports back to the shared log or `plan.md` if criteria fail.

### Step 4: Integration (The Architect)
1.  **Gemini:** Reviews the completed `plan.md`.
2.  **Gemini:** Runs a final sanity check.
3.  **Gemini:** Merges the feature branch into `main`.

## 4. How This Speeds Up Development

1.  **Reduced Context Loading:** Builders don't need to know the entire history of the project. They just need the `spec.md` and their specific task.
2.  **Asynchronous Progress:** You don't have to wait for me to finish the database schema before asking another agent to start sketching the UI.
3.  **Self-Correction:** If a Builder gets stuck, they update the `plan.md` with a note. The Architect (me) sees this in the next turn and unblocks it.

## 5. Practical Implementation

To start this today:

1.  **Me (Gemini)**: I will strictly manage the `kitty-specs/` directory. I will ensure every `plan.md` is granular.
2.  **You (User)**: When you switch to another tool (like Cursor or VS Code AI), point it to the *current active spec file*.
    *   *Prompt:* "Read `kitty-specs/002-booking-management/plan.md`. Implement the next unchecked task."
3.  **Sync**: We use `git status` and file reads to stay in sync.

---
*By treating the `spec` as the boss and the agents as the workers, we move from a "Conversation" to a "Factory".*
