# Repository Guidelines

## Project Structure & Module Organization
- App: `pages/` (Next.js routes), UI: `components/`, views: `views/`.
- State/logic: `hooks/`, `contexts/`, helpers: `utils/`, `lib/`.
- Data: `prisma/` (schema, local `dev.db`), `supabase/` (migrations, seed).
- Assets: `public/`. Tests: `__tests__/`. Docs: `docs/`.

## Build, Test, and Development Commands
- Install deps: `bun install` (Bun is required).
- Dev server: `bun run dev` (Next dev on localhost).
- Build: `bun run build` (Next production build).
- Start: `npm start` (serve production build).
- Tests: `npm test`, coverage: `npm run test:coverage`.
- CI helpers: `./scripts/build-check.sh dev|prod|verify` and `./scripts/pre-deploy-check.sh`.

## Coding Style & Naming Conventions
- TypeScript preferred; 2‑space indent, single quotes, trailing commas (see `.prettierrc`).
- ESLint config extends `next/core-web-vitals`; fix lint before PR (`npm run lint`).
- Import order enforced (`import/order`, `sort-imports`); use internal paths like `components/...`, `utils/...`.
- File names: kebab‑case for files, PascalCase for React components, camelCase for functions/vars.

## Testing Guidelines
- Framework: Jest + Testing Library (`jest.config.js`, `jest.setup.js`).
- Place tests in `__tests__/` or alongside code as `*.test.ts(x)` / `*.spec.ts(x)`.
- Target user‑visible behavior; mock network/DB where practical. Run `npm run test:coverage` and keep coverage stable for changed code.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `ci:`, `test:` with optional scope (e.g., `fix(build): ...`).
- PRs must include: clear description, linked issues, test plan (commands + expected outcomes), screenshots for UI, and notes on env/config changes.
- Production builds must come from `main` and a clean repo (see `pre-deploy-check.sh`).

## Security & Configuration Tips
- Never commit secrets. Use `.env.local` (git‑ignored); update `.env.local.example` when adding vars.
- Supabase/Prisma changes: include migration notes and any seed data updates.

## Agent‑Specific Notes
- This guide applies repo‑wide. If a nested `AGENTS.md` exists, it overrides within its directory tree.
- Follow the style and paths above when generating or modifying files.

