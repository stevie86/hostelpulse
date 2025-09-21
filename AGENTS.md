# Repository Guidelines

## Project Structure & Module Organization
Keep routing and API logic in `pages/` (Next.js routes and `pages/api/**`). Reusable UI belongs in `components/`, while page-level layouts live in `views/`. Shared hooks, contexts, libs, and utilities sit under their respective folders; static assets go in `public/`. Editorial content is stored in `posts/`, documentation in `docs/`, and Supabase configuration in `supabase/`. Co-locate tests with their targets as `*.test.ts[x]` (e.g., `pages/api/admin/example.test.ts`).

## Build, Test, and Development Commands
Use `npm run dev` to launch the local server at `http://localhost:3000`. `npm run build` creates the production bundle, and `npm start` serves it. Run `npm run lint` for ESLint with Next.js rules, `npm run format` to apply Prettier, and `npm run format:check` to confirm formatting. Execute `npm test` for the Jest suite, `npm run test:watch` during development, and `npm run test:coverage` for coverage reports.

## Coding Style & Naming Conventions
The project targets Node 22.x with TypeScript strict mode, 2-space indentation, 140-character lines, single quotes, and trailing commas as defined in `.prettierrc`. Keep imports alphabetized to satisfy `.eslintrc.json`. Name React components in PascalCase (`components/Button.tsx`), hooks as `useThing.ts`, utilities in camelCase (`utils/camelCase.ts`), and contexts as `ThingContext.tsx`.

## Testing Guidelines
Jest with jsdom and Testing Library powers the tests. Place suite files next to their subjects and cover both success and failure paths. Mock Supabase and network calls following the `pages/api/admin/*.test.ts` patterns. Before review, confirm `npm test` passes and review coverage when adding new functionality.

## Commit & Pull Request Guidelines
Write focused, imperative commit messages; reuse prefixes from history such as `csv(import):`, `UI:`, or priority tags (`P0/P1/P2`). Each PR should map to a single roadmap task, include a clear description, linked issues (`#123`), test results, and screenshots or docs updates when relevant. Ensure `npm run lint`, `npm run format:check`, and `npm test` succeed before requesting review.

## Security & Configuration Tips
Copy `.env.example` to `.env.local` and never commit secrets. Access configuration through `env.ts`. Set `REQUIRE_API_AUTH=0` for local dashboards, and enable it with JWT-backed requests in preview/production. Keep Supabase admin tokens server-only, configure `ALLOWED_ORIGINS`, and rely on `lib/audit.ts` for GDPR-friendly audit logging.
