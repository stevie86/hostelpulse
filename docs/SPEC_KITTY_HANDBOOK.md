# Spec-Kitty Handbook 🐱
> **The Definitive Guide to Agent-Augmented Development in HostelPulse**

**Spec-Kitty** is our workflow engine for enforcing a "Spec-First" discipline. It isolates features into **Worktrees** and uses AI Agents to drive the lifecycle from Specification to Merge.

This handbook guides both **Human Developers** and **AI Agents** on how to navigate this workflow correctly in the current environment (where `mise` and `pnpm` are available).

---

## 1. Core Concepts

### The "Spec-First" Philosophy
No code is written without a specification. The `spec.md` is the contract. If the spec is vague, the code will be buggy. We clarify requirements *before* writing code.

### Feature Isolation (Worktrees)
Every feature gets its own **Git Worktree**.
- **Main Repo**: Contains the stable `main` branch.
- **Worktrees**: Located in `.worktrees/XXX-feature-name`.
- **Isolation**: When working on Feature A, you are physically in a different folder than Feature B. You never "switch branches" in the root folder; you `cd` into worktrees.

### Agent-Driven vs. Manual
While `spec-kitty` provides a CLI, in this project we rely heavily on **AI Agents** (like Gemini/Claude) to orchestrate the "creative" steps (Specify, Plan, Tasks) via prompts and scripts, while the "mechanical" steps (Merge, Dashboard) can be run via CLI.

---

## 2. Prerequisites

Ensure your environment is set up:
```bash
# Install dependencies using pnpm (managed by mise)
pnpm install

# Setup Spec-Kitty virtual environment (if not already done)
pnpm run spec:setup
```

---

## 3. The Lifecycle & Commands

### Phase 1: Inception (Specify)
**Goal**: Create a new feature branch, worktree, and empty spec.

*   **🤖 AI Agent Method (Preferred)**:
    *   **Prompt**: "Start a new feature called 'Guest Management' with the software-dev mission."
    *   **Agent Action**: Runs `.kittify/scripts/bash/create-new-feature.sh`.
*   **👤 Manual Method**:
    ```bash
    # From project root
    .kittify/scripts/bash/create-new-feature.sh --feature-name "Guest Management" --mission "software-dev"
    ```
    *   **Output**: A new folder `.worktrees/00X-guest-management`.
    *   **Action**: `cd .worktrees/00X-guest-management` (You MUST work here!).

### Phase 2: Specification (Spec)
**Goal**: Define *what* we are building.

*   **Process**:
    1.  Open `kitty-specs/00X-guest-management/spec.md` (inside the worktree).
    2.  Fill in User Stories, Requirements, and Constraints.
    3.  **Agent Role**: Ask the Agent to "Refine the spec" or "Check for gaps".

### Phase 3: Planning (Plan)
**Goal**: Define *how* we will build it (Architecture, Data, Components).

*   **🤖 AI Agent Method**:
    *   **Prompt**: "Plan the implementation for this feature."
    *   **Agent Action**:
        1.  Validates it is in the worktree.
        2.  Asks clarifying questions if needed.
        3.  Runs `.kittify/scripts/bash/setup-plan.sh --json`.
        4.  Generates/Updates `plan.md` with technical details.
*   **👤 Manual Method**:
    ```bash
    # Inside worktree
    ../../.kittify/scripts/bash/setup-plan.sh
    # Then edit kitty-specs/00X-.../plan.md manually
    ```

### Phase 4: Task Breakdown (Tasks)
**Goal**: Create small, actionable "Work Packages" (WP) for the AI to execute.

*   **🤖 AI Agent Method**:
    *   **Prompt**: "Generate tasks for this plan."
    *   **Agent Action**:
        1.  Reads `spec.md` and `plan.md`.
        2.  Creates `tasks.md` (overview).
        3.  Creates individual task files in `kitty-specs/00X-.../tasks/planned/`.
*   **👤 Manual Method**:
    *   Manually create `tasks.md`.
    *   Manually create markdown files in `tasks/planned/` describing each step.

### Phase 5: Implementation (Implement)
**Goal**: Write code.

*   **Loop**:
    1.  **Select Task**: Pick a task from `tasks/planned/`.
    2.  **Move to Doing**: Move file to `tasks/doing/`.
    3.  **Execute**: Write code, run tests.
        *   **Agent Prompt**: "Implement task WP01-01".
    4.  **Verify**: Run `pnpm test`, `pnpm build`, etc.
    5.  **Done**: Move file to `tasks/done/`.

### Phase 6: Completion (Accept & Merge)
**Goal**: Validate and merge back to main.

*   **Validation**:
    ```bash
    pnpm run spec -- accept
    ```
    *   Checks if all tasks are done, tests pass, etc.
*   **Merge**:
    ```bash
    pnpm run spec -- merge
    ```
    *   Merges feature branch to main.
    *   Deletes the worktree folder.

---

## 4. The Dashboard

To see a Kanban board of all active features and tasks:

```bash
pnpm run spec -- dashboard
```
Open `http://localhost:9237` in your browser.

---

## 5. For AI Agents (Technical Reference)

**Directory Structure**:
- **Root**: Contains `.kittify/` (scripts/config).
- **Worktrees**: `.worktrees/` (Active features).
- **Specs**: Inside worktree: `kitty-specs/<feature-slug>/`.

**Script Locations** (Execute from Root or Relative):
- **Create Feature**: `.kittify/scripts/bash/create-new-feature.sh`
- **Setup Plan**: `.kittify/scripts/bash/setup-plan.sh`
- **Helpers**: `.kittify/scripts/bash/common.sh`

**Command Aliases** (in `package.json`):
## 6. Using Spec-Kitty with Codex

Spec-Kitty is fully configured for **Codex** as well as Gemini.

**Configuration Status**:
- ✅ **Gemini CLI**: Commands are mapped in `.gemini/commands/*.toml`.
- ✅ **Codex**: Prompts are mapped in `.codex/prompts/*.md`.

**How to use with Codex**:
Instead of CLI commands, you feed the specific prompt file to Codex context to trigger the workflow step.

| Step | Prompt File | Description |
| :--- | :--- | :--- |
| **Specify** | `.codex/prompts/spec-kitty.specify.md` | Start a new feature spec. |
| **Plan** | `.codex/prompts/spec-kitty.plan.md` | Generate technical architecture. |
| **Tasks** | `.codex/prompts/spec-kitty.tasks.md` | Break down into work packages. |
| **Implement** | `.codex/prompts/spec-kitty.implement.md` | Write code for a task. |
| **Review** | `.codex/prompts/spec-kitty.review.md` | Critique code (Code Critic). |

## 7. Mandatory Interaction Logging

Per `AGENTS.md`, all interactions (especially shell commands and spec-kitty operations) **must** be logged for traceability.

**Command Template**:
```bash
# Standard command
pnpm <command> | tee -a logs/interaction-$(date +%Y-%m-%d).log

# Spec-Kitty operation
pnpm spec <command> | tee -a logs/interaction-$(date +%Y-%m-%d).log
```

---

## 8. Dual Configuration (Gemini + Codex)

Spec-Kitty in this repo is uniquely configured to support both the **Gemini CLI** and the **Codex CLI**.

### Gemini CLI (TOML Based)
- **Location**: `.gemini/commands/spec-kitty.*.toml`
- **Variable Syntax**: `{{args}}`
- **Usage**: Invoked via the Gemini interface using the mapped commands.

### Codex CLI (Markdown Based)
- **Location**: `.codex/prompts/spec-kitty.*.md`
- **Variable Syntax**: `$ARGUMENTS`
- **Usage**: Used by Codex to drive the same underlying bash scripts as Gemini.

**Status Check**:
- `logs/development-log-2025-12-17-spec-kitty-setup.md` confirms initialization with `--ai codex,gemini`.
- Both environments are synchronized to use the same `.kittify/scripts/bash/` core.
