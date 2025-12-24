# Repository Guidelines & Agent Context

**Project:** HostelPulse (Clean Slate / Operation Bedrock)
**Stack:** Next.js 15, Prisma, Tailwind CSS, DaisyUI
**Package Manager:** **pnpm** (Strictly enforced)

## Core Philosophy

**Operation Bedrock:** Prioritize stability, type safety, and clean architecture over rapid feature expansion.
**Anti-Scope Creep:** Stick to the MVP Roadmap. Advanced SaaS features (AWS Lambda, EventBridge) are _reference patterns_ but should not delay the Vercel-based MVP launch unless critical.

## 1. Workflow: Spec-Driven Development

All feature work is managed by `spec-kitty`.

- **Start Feature:** `npm run spec -- specify "Feature Name"` (Creates branch & worktree).
- **Plan & Task:** `npm run spec -- plan` -> `npm run spec -- tasks`.
- **Implement:** Work strictly within `.worktrees/XXX-feature-name`.
- **Merge:** `npm run spec -- merge`.
- **Dashboard:** `npm run spec -- dashboard`.

**Rule:** NEVER commit directly to `main`. Always use a feature branch managed by `spec-kitty`.

## 2. Directory Structure

- `app/`: Next.js App Router (Primary).
- `app/actions/`: Server Actions (Data mutations).
- `components/`: Reusable UI (Atomic design).
- `lib/`: Shared utilities & DB (`lib/db.ts`).
- `prisma/`: Schema & Seeds.
- `kitty-specs/`: Feature specifications and plans.
- `.worktrees/`: Active development workspaces (Git ignored).

## 3. Commands

- **Install:** `mise run -- pnpm install`
- **Dev:** `mise run -- pnpm run dev`
- **Build:** `mise run -- pnpm run build`
- **Lint:** `mise run -- pnpm run lint` / `pnpm run lint:fix`
- **Format:** `mise run -- pnpm run format` / `pnpm run format:check`
- **Type-check:** `mise run -- pnpm run type-check`
- **Test (Unit):** `mise run -- pnpm run test`
- **Test (Single):** `pnpm test __tests__/actions/auth.test.ts` (Jest pattern matching)
- **Test (E2E):** `mise run -- pnpm run test:e2e`
- **Test (All):** `mise run -- pnpm run test:all`
- **DB Push:** `mise run -- npx prisma db push` (Prototyping)
- **Spec Kitty:** `mise run -- pnpm run spec -- <command>`

## 4. Coding Standards

### Build/Lint/Test Commands

- **Install:** `mise run -- pnpm install`
- **Build:** `mise run -- pnpm run build`
- **Lint:** `mise run -- pnpm run lint` (fix with `pnpm run lint:fix`)
- **Format:** `mise run -- pnpm run format` (check with `pnpm run format:check`)
- **Type Check:** `mise run -- pnpm run type-check`
- **Unit Tests:** `mise run -- pnpm run test` (single test: `pnpm test __tests__/path/to/test.test.ts`)
- **E2E Tests:** `mise run -- pnpm run test:e2e`
- **All Tests:** `mise run -- pnpm run test:all`

### Code Style Guidelines

- **Formatting:** Single quotes, trailing comma 'es5', semicolons, 80 char width
- **Types:** Strict TypeScript, zero `any` usage, define Zod schemas in `lib/schemas/`
- **Naming:** PascalCase components, camelCase variables/functions, kebab-case files
- **Imports:** Absolute paths with `@/` alias, group by external/internal
- **Error Handling:** Try/catch in async functions, descriptive error messages
- **Server Actions:** Use for all mutations, validate inputs with Zod
- **Forms:** `react-hook-form` + `zodResolver`, handle server validation errors
- **UI:** Tailwind utility classes + DaisyUI components, atomic design pattern
- **Components:** Functional with hooks, explicit return types, prop interfaces
- **Database:** Filter all queries by `propertyId` (multi-tenancy)

## 5. SaaS Architecture Patterns

Refer to `docs/SAAS_BUILDER_SETUP.md` for multi-tenancy logic.

- **Multi-Tenancy:** Ensure every Prisma query filters by `propertyId` (which maps to Tenant).
- **Usage Tracking:** (Future) Implement tracking points where identified.

## 6. Testing

- **Unit:** Jest for all Server Actions and Logic. Colocate tests in `__tests__` or next to files.
- **E2E:** Playwright for critical user flows (Booking, Login).

## 7. Commit Guidelines

- Format: `feat:`, `fix:`, `chore:`.
- Scope: Keep changes specific to the active `spec-kitty` feature.

## 8. Interaction Logging

To keep a record of our interactions, all commands should be piped to a timestamped log file in the `logs/` directory.

**Example:**

```bash
# General command logging
some_command | tee -a logs/interaction-$(date +%Y-%m-%d).log

# Spec-kitty command logging
pnpm run spec -- <command> | tee -a logs/interaction-$(date +%Y-%m-%d).log
```
