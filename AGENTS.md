# Repository Guidelines

## Project Structure & Module Organization
- App (Next.js pages router): `pages/` (routes + APIs in `pages/api/`).
- UI: reusable `components/`, page-specific `views/`.
- Logic: `lib/` (clients, auth), `utils/` (pure helpers), `hooks/` (React hooks).
- Content & assets: `posts/` (MDX), `public/` (static), `types.ts` (shared types).
- Data: `supabase/migrations/` (SQL), env wiring in `.env.local` and `env.ts`.
- Docs & change notes: `docs/`, `changes/`.

## Build, Test, and Development Commands
- Install deps: `npm install` (Node 22, npm 10).
- Run locally: `npm run dev` → http://localhost:3000.
- Production build: `npm run build`; start: `npm start`.
- Lint & format check: `npm run lint` (ESLint + Next config; Prettier via rules).

## Coding Style & Naming Conventions
- Language: TypeScript, React 17, Next.js 12 (pages router), styled-components.
- Indentation: 2 spaces; prefer named exports; keep files focused and small.
- Names: Components `PascalCase.tsx` in `components/` or `views/`; hooks `useX.ts`; utils camelCase in `utils/`; API routes camelCase in `pages/api/` but URL stays lowercase.
- Styling: co-locate styled-components with components; avoid global styles beyond `components/GlobalStyles.tsx`.
- Imports: absolute from repo root when configured, otherwise relative and tidy.

## Testing Guidelines
- No formal test runner is configured yet. For new tests, prefer Jest + React Testing Library.
- File pattern: `__tests__/**` or `*.test.ts(x)` near the unit under test.
- Aim for fast unit tests on helpers (`utils/`) and hooks; screenshot or GIF for UI/flow changes.

## Commit & Pull Request Guidelines
- Commit format: `type(scope): concise summary` (e.g., `csv(import): handle quoted fields`).
- Keep commits small and scoped; present tense; link issues `(#123)` when applicable.
- PRs must include: problem/solution summary, screenshots for UI changes, steps to verify, and any env/migration notes (e.g., new variable or SQL in `supabase/migrations/`).
- Run `npm run lint` and ensure the app starts before opening a PR.

## Security & Configuration Tips
- Required env (local/dev): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`; see `.env.example` and `README.md`.
- API endpoints default to auth-on; respect CORS in `lib/corsHandler.ts` and auth in `lib/apiAuth.ts`.
- Add SQL migrations incrementally in `supabase/migrations/NNN_description.sql` and reference them in PRs.

## Agent-Specific Instructions
- Do not rename routes or move files across domains (API/UI) without clear rationale.
- Prefer minimal, targeted changes; follow existing patterns and directory boundaries.
