# Repository Guidelines & Agent Context

**Project:** HostelPulse (Clean Slate / Operation Bedrock)
**Stack:** Next.js 15, Prisma, Tailwind CSS, DaisyUI
**Package Manager:** **pnpm** (Strictly enforced)

## Core Philosophy
**Operation Bedrock:** Prioritize stability, type safety, and clean architecture over rapid feature expansion.
**Anti-Scope Creep:** Stick to the MVP Roadmap. Advanced SaaS features (AWS Lambda, EventBridge) are *reference patterns* but should not delay the Vercel-based MVP launch unless critical.

## 1. Workflow: Spec-Driven Development
All feature work is managed by `spec-kitty`.
*   **Start Feature:** `npm run spec -- specify "Feature Name"` (Creates branch & worktree).
*   **Plan & Task:** `npm run spec -- plan` -> `npm run spec -- tasks`.
*   **Implement:** Work strictly within `.worktrees/XXX-feature-name`.
*   **Merge:** `npm run spec -- merge`.
*   **Dashboard:** `npm run spec -- dashboard`.

**Rule:** NEVER commit directly to `main`. Always use a feature branch managed by `spec-kitty`.

## 2. Directory Structure
*   `app/`: Next.js App Router (Primary).
*   `app/actions/`: Server Actions (Data mutations).
*   `components/`: Reusable UI (Atomic design).
*   `lib/`: Shared utilities & DB (`lib/db.ts`).
*   `prisma/`: Schema & Seeds.
*   `kitty-specs/`: Feature specifications and plans.
*   `.worktrees/`: Active development workspaces (Git ignored).

## 3. Commands
*   **Install:** `mise run -- pnpm install`
*   **Dev:** `mise run -- pnpm run dev`
*   **Build:** `mise run -- pnpm run build`
*   **Lint:** `mise run -- pnpm run lint`
*   **Format:** `mise run -- pnpm run format`
*   **Test (Unit):** `mise run -- pnpm run test`
*   **Test (E2E):** `mise run -- pnpm run test:e2e`
*   **DB Push:** `mise run -- npx prisma db push` (Prototyping)
*   **Spec Kitty:** `mise run -- pnpm run spec -- <command>`

## 4. Coding Standards
*   **Strict Types:** Zero tolerance for `any`. Define Zod schemas in `lib/schemas/`.
*   **Server Actions:** Use for all mutations. Validate inputs with Zod.
*   **UI:** Use Tailwind utility classes and DaisyUI components.
*   **Forms:** `react-hook-form` + `zodResolver`.
*   **Quality Gates:** Refer to `docs/CODE_CRITIC_CODEX.md` and `docs/CODE_REVIEW_CODEX.md` before marking tasks as done.

## 5. SaaS Architecture Patterns
Refer to `docs/SAAS_BUILDER_SETUP.md` for multi-tenancy logic.
*   **Multi-Tenancy:** Ensure every Prisma query filters by `propertyId` (which maps to Tenant).
*   **Usage Tracking:** (Future) Implement tracking points where identified.

## 6. Testing
*   **Unit:** Jest for all Server Actions and Logic. Colocate tests in `__tests__` or next to files.
*   **E2E:** Playwright for critical user flows (Booking, Login).

## 7. Commit Guidelines
*   Format: `feat:`, `fix:`, `chore:`.
*   Scope: Keep changes specific to the active `spec-kitty` feature.

## 8. Interaction Logging
To keep a record of our interactions, all commands should be piped to a timestamped log file in the `logs/` directory.

**Example:**
```bash
# General command logging
some_command | tee -a logs/interaction-$(date +%Y-%m-%d).log

# Spec-kitty command logging
pnpm run spec -- <command> | tee -a logs/interaction-$(date +%Y-%m-%d).log
```