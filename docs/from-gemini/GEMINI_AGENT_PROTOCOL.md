# GEMINI AGENT PROTOCOL: SPEC-KITTY & BEDROCK ARCHITECTURE

**Mission:** Operate within the "HostelPulse" Next.js 15 environment.
**Strictness:** HIGH. Deviations cause merge failures.

## 1. SPEC-KITTY COMPLIANCE (PRIORITY ZERO)
*The workflow tool "Spec-Kitty" rejects merges if these artifacts are missing. Check these FIRST.*

### A. The "Mission Directories" Hack
Spec-Kitty expects specific folders even if Next.js doesn't use them.
* **Instruction:** Verify `src/` and `contracts/` exist in the project root.
* **Action:** If missing, run:
  ```bash
  mkdir -p src contracts
  touch src/.keep contracts/.keep
B. The tasks.md Artifact
Requirement: A tasks.md file MUST exist in the worktree root.

Action: Create it immediately if missing using this template:

Markdown

# Mission Tasks
- [ ] Initialize Environment
- [ ] Implement Core Logic
- [ ] Verify UI Components
- [ ] Pass Lint & Build
C. Metadata Injection
Requirement: The active spec file in kitty-specs/ requires strict frontmatter.

Action: Update the YAML header to include:

YAML

agent: "Gemini-CLI"
assignee: "User"
shell_pid: "1234" # Mock if unavailable
2. ARCHITECTURAL STANDARDS (OPERATION BEDROCK)
A. The "Hybrid" UI Strategy
Ref: UI_LIBRARY_STRATEGY.md

Logic Layer (Shadcn UI): Use for anything with state, focus management, or ARIA requirements (Modals, Sheets, Forms, DatePickers).

Visual Layer (DaisyUI v5): Use for static styling (Buttons, Badges, Cards, Layouts).

Theme: "Pulse Blue" (#2563eb) is the primary color. Ensure globals.css maps Shadcn variables to DaisyUI semantics.

B. Design System: "Modern SaaS Bedrock"
Ref: UI_SPECIFICATION.md

Glassmorphism: Use bg-white/80 backdrop-blur-md for cards/panels.

Typography: Geist Sans. High contrast.

Icons: Lucide React only.

C. Coding Rules
Server-First: Default to Server Components. Use "use client" only for interactivity.

Type Safety: strict: true. No any. No @ts-ignore.

Data Fetching: Use Server Actions or direct DB calls in Server Components.

3. EXECUTION LOOP
READ TASKS: Parse tasks.md. Pick the next unchecked item.

EXECUTE: Write the code.

UPDATE TASKS: Mark the item [x] in tasks.md.

LOG: Append a one-line summary to the active Spec file.

VERIFY: Run the safety suite:

Bash

mise exec -- pnpm lint
mise exec -- pnpm build
If pnpm build fails, you are NOT done. Fix it immediately.

4. CLEANUP PROTOCOL
Before requesting a merge:

Delete any tmp/, docs/, or generated reports not requested by the user.

Ensure the worktree root is clean except for the required Spec-Kitty artifacts.