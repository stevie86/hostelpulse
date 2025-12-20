# GEMINI AGENT PROTOCOL: SPEC-KITTY COMPLIANCE & BEDROCK STANDARDS

**Target System:** HostelPulse (Operation Bedrock)
**Workflow Tool:** Spec-Kitty
**Strictness Level:** CRITICAL

## 1. ENVIRONMENTAL COMPLIANCE (The "Merge Gate" Blockers)
*Before writing any application code, you must satisfy Spec-Kitty's structural requirements.*

### A. Directory Structure Violations
Spec-Kitty expects specific "mission directories". If they are missing, the merge fails.
* **Instruction:** Check for the existence of `src/` and `contracts/` in the worktree root.
* **Action:** If missing, create them immediately as empty placeholders to satisfy the linter, even if Next.js does not use them.
    ```bash
    mkdir -p src contracts
    touch src/.keep contracts/.keep
    ```

### B. The `tasks.md` Artifact
* **Requirement:** A file named `tasks.md` MUST exist in the worktree root.
* **Content:** It must contain a Markdown checklist of the mission objectives.
* **Action:** Create `tasks.md` with the following template:
    ```markdown
    # Mission Tasks: UI Revamp
    - [ ] Initialize Environment (Shadcn + DaisyUI)
    - [ ] Create BedPulseCard Component (Hybrid)
    - [ ] Implement Dashboard Layout (Glassmorphism)
    - [ ] Verify Mobile Responsiveness
    - [ ] Pass Linting & Build Checks
    ```

### C. Spec File Metadata (Frontmatter)
* **Requirement:** The active spec file in `kitty-specs/` must have complete YAML frontmatter.
* **Action:** Update the header to include `agent`, `assignee`, and `shell_pid`.
    ```yaml
    ---
    status: "active"
    agent: "Gemini-CLI"
    assignee: "User"
    shell_pid: "1234"  # MUST be present (mock if necessary)
    created_at: "2025-12-20"
    ---
    ```

## 2. CODING STANDARDS (The "Bedrock" Architecture)
*All code generated must adhere to these strictly enforced rules.*

### A. The "Hybrid" UI Strategy
* **Reference:** `UI_LIBRARY_STRATEGY.md`
* **Rule:** 1.  Use **Shadcn UI** for logic/interaction (Modals, Sheets, Forms, Popovers).
    2.  Use **DaisyUI** for static visuals (Buttons, Cards, Badges).
* **Theme Integration:** Ensure `globals.css` maps Shadcn CSS variables (e.g., `--primary`) to DaisyUI semantic colors.

### B. Type Safety (Zero Tolerance)
* **Reference:** `PROJECT_CHARTER.md`
* **Rule:** No `any`. No `@ts-ignore`.
* **Action:** All Props must be typed via interfaces. All server actions must validate inputs using Zod.

### C. Server-First Mentality
* **Reference:** `ARCHITECTURE.md`
* **Rule:** Default to Server Components.
* **Exception:** Only use `"use client"` when handling React state (`useState`, `useEffect`) or browser events.

## 3. EXECUTION LOGIC (The Loop)
*Follow this sequence for every request.*

1.  **UPDATE TASKS:** Mark the current sub-task as `[x]` in `tasks.md`.
2.  **LOG ACTIVITY:** Append a brief log line to the Spec file or `LOGS.md`.
    * *Format:* `[YYYY-MM-DD HH:MM] Action Description`
3.  **BUILD:** Generate the code.
4.  **VERIFY:** Run the project health check suite:
    ```bash
    mise exec -- pnpm lint
    mise exec -- pnpm build
    ```
5.  **CLEANUP:** Delete any temporary files or unexpected directories (e.g., `tmp/`, `docs/`) that were not explicitly requested.

## 4. FINAL HANDOFF CHECKLIST
*Do not signal completion until:*
1.  [ ] `pnpm build` is GREEN (Exit Code 0).
2.  [ ] `tasks.md` has completed items.
3.  [ ] Spec-Kitty metadata is present.
4.  [ ] No untracked junk files exist in root.