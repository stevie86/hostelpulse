# Repository Guidelines

## Project Structure & Module Organization
- `pages/` Next.js routes and API (`pages/api/**`).
- `components/` reusable UI; `views/` page-level assemblies.
- `hooks/`, `contexts/`, `lib/`, `utils/` shared logic; `public/` static assets.
- `posts/` content; `docs/` documentation; `supabase/` config/assets.
- Tests are colocated as `*.test.ts[x]` near code (see `pages/api/admin/*.test.ts`).

## Build, Test, and Development Commands
- `npm run dev` start local dev server at `http://localhost:3000`.
- `npm run build` production build; `npm start` serve built app.
- `npm run lint` run ESLint with Next rules; `npm run format` apply Prettier; `npm run format:check` verify formatting.
- `npm test` run Jest; `npm run test:watch` watch mode; `npm run test:coverage` report coverage.
- Requires Node `22.x` and npm `10` (see `package.json`).

## Coding Style & Naming Conventions
- TypeScript enabled (`strict: true`). Indent 2 spaces; line width 140; single quotes; trailing commas (see `.prettierrc`).
- Lint & Format: run `npm run lint` and `npm run format` before pushing. CI expects sorted/alphabetized imports per `.eslintrc.json`.
- Naming: React components `PascalCase` in `components/` (`Button.tsx`); hooks `useX.ts`; utilities `camelCase.ts`; contexts `PascalCaseContext.tsx`.
- Pages follow Next routing (`pages/bookings.tsx`, dynamic: `pages/rooms/[id].tsx`).

## Testing Guidelines
- Jest with `jsdom` and Testing Library. Prefer colocated tests: `componentName.test.tsx` or `fileName.test.ts`.
- Mock network/Supabase where applicable; see `pages/api/admin/*.test.ts` for patterns.
- Run fast locally (`npm test`); for new features add tests covering success and failure paths. Coverage reporting available via `test:coverage`.

## Commit & Pull Request Guidelines
- Commits: imperative subject, optional scope; keep focused. Recognized patterns in history include prefixes like `csv(import): ...`, `UI: ...`, and priority labels `P0/P1/P2`.
  - Examples: `csv(import): robust parser for quoted fields`, `P2: CSV import/export endpoints`, `UI: polish auth forms spacing and copy`.
- Stacked PRs: prefer small, reviewable PRs stacked on each other. First commit sets scaffolding and passes CI; subsequent commits add isolated changes. Rebase stacks as they merge.
- PR checklist: description, linked issues/PRs (`#123`), test plan, screenshots for UI, and docs updates when applicable. Keep PRs scoped to one task.
- Gates: `npm run lint`, `npm run format:check`, and `npm test` must pass before request for review.

## Security & Configuration Tips
- Copy `.env.example` to `.env.local`; never commit secrets. Update `.env.example` when adding new vars.
- Keep Supabase service keys server-side only. Admin APIs require `x-admin-token` set to `ADMIN_API_TOKEN`.
- Access env via `env.ts` to keep usage consistent.
- Auth gate (`REQUIRE_API_AUTH`): for local/preview during MVP, set `REQUIRE_API_AUTH=0` so dashboard and CSV tools work without auth headers; for Preview/Production, set `REQUIRE_API_AUTH=1` and call APIs with `Authorization: Bearer <JWT>` (from Supabase Auth). The admin token path is for CI/emergency only.
- CORS: set `ALLOWED_ORIGINS` in production; security headers are applied by `lib/corsHandler.ts`.
- Data handling: avoid logging PII; ensure exports are filtered by `owner_id`; prefer RLS policies in Supabase and pass the user JWT to enforce them server-side.
- Audit log: APIs write GDPR-friendly audit events via `lib/audit.ts` to `audit_logs` (no PII, only metadata). See `docs/gdpr-audit-log.md`. Configure `AUDIT_LOG_TTL_DAYS` (default 180); ensure `SUPABASE_SERVICE_ROLE_KEY` set.

## Roadmap & Planning
- Align work with the sprint plan in `sprint-plan.md` (e.g., Tasks 1.x for booking form, 2.x reporting, 3.x mobile).
- Open one PR per task; reference the task in the title/description for traceability.
