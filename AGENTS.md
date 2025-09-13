# Repository Guidelines

## Project Structure & Module Organization
- `pages/` Next.js routes and API handlers; keep route-level logic thin.
- `components/` Reusable UI; colocate styles and tests when small.
- `views/` Page-level compositions wiring data → components.
- `utils/`, `hooks/`, `contexts/` Shared logic and state.
- `public/` Static assets; reference via `/img.png`.
- `__tests__/` Unit/integration tests; co-located `*.test.ts(x)` also allowed.
- `prisma/`, `supabase/` Data layer configs; avoid checking secrets.
- `docs/` User/developer docs; update when behavior changes.

## Build, Test, and Development Commands
- `npm run dev` Start local dev server (Next 12) with Bun runner.
- `npm run build` Production build (checks `next.config.js`, loads envs).
- `npm start` Serve the production build.
- `npm run lint` ESLint over TS/JS with Next + Prettier rules.
- `npm test` Jest unit/integration tests (jsdom env).
- `npm run test:coverage` Print coverage summary and HTML report in `coverage/`.
- `npm run build:verify` Repo build smoke-check via `scripts/build-check.sh`.

## Coding Style & Naming Conventions
- TypeScript preferred; 2-space indent, single quotes, trailing commas (see `.prettierrc`).
- File names: `kebab-case` for files/dirs, `PascalCase` for React components, `camelCase` for utilities.
- Imports: honor `import/order` groups; auto-sort enabled; alias `@/` maps to repo root.
- Keep components presentational; move effects/data-fetching to hooks/contexts.

## Testing Guidelines
- Frameworks: Jest + @testing-library/react.
- Locations: `__tests__/` or co-located `*.test.ts(x)`.
- Write user-focused tests (queries by role/text), avoid implementation details.
- CI: Husky runs `npm run test:ci` on push; coverage not enforced—use `test:coverage` locally.

## Commit & Pull Request Guidelines
- Conventional Commits used in history: `feat:`, `fix:`, `docs:`, `test:`, `ci:`, `chore:` with optional scopes (e.g., `fix(build): ...`).
- Branches: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`.
- PRs must include: clear description, linked issues (`Closes #123`), screenshots/GIFs for UI, and notes on env/config changes. Update `docs/` as needed.

## Security & Configuration
- Copy `.env.example` → `.env.local`; never commit secrets. Use `env.ts` to centralize access.
- Supabase/SendGrid keys required for related features; see `README.md` for setup.
- Before deploy, run `npm run predeploy` to execute repo checks.

### Vercel Environment Variables
- Preview and Production envs are already configured in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Do not block PRs on missing local envs; use mocks or guard rails for CI.
- To sync locally: `npx vercel env pull .env.local` (requires Vercel CLI login).
