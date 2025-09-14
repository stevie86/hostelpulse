# Summary — Next.js Middleware Considerations

Date: 2025-09-14

## What was requested
Assess whether issues highlighted in a public article about Next.js middleware apply to this repository and call out anything to consider.

## Actions taken
- Scanned the codebase for middleware usage and related patterns.
- Reviewed `next.config.js`, `vercel.json`, and the `pages/` and `pages/api/` structure.
- Read `lib/apiAuth.ts` and `lib/corsHandler.ts` to understand current auth/CORS strategy.
- Spot-checked a representative page (`pages/dashboard.tsx`) for how it interacts with API routes.

## Findings / decisions
- No `middleware.ts` present. App uses the Pages Router with API routes.
- Auth and CORS are enforced in API routes via `withAuth` and `withCors` (Node runtime), which is appropriate.
- Using Supabase admin client within API routes; this would not be suitable for Edge middleware bundles.
- If middleware is introduced, keep it extremely light (cookies/headers only), with a very tight `matcher`, and avoid DB or SDK calls.

## Key middleware caveats (relevant highlights)
- Edge runtime: no Node APIs; limited bundle size; prefer Web Crypto and simple logic.
- Body is inaccessible: middleware cannot read request body; rely on cookies/headers.
- Performance tax: runs on matched paths; tighten `matcher` and exclude assets.
- Caching: matching paths can lose static/CDN caching; risky for marketing pages.
- Rewrites/redirects: easy to create loops or affect SEO; test carefully (including `HEAD`).
- Database/auth calls: avoid in middleware; keep heavy lifting in API routes or SSR.

## Code changes
None. Analysis-only task. Added this summary under `changes/`.

## Recommendations / next steps
- Continue enforcing auth at the API layer (defense in depth).
- For page gating in Pages Router, prefer `getServerSideProps` or client-side handling plus API auth, rather than middleware.
- If middleware is later required (e.g., simple redirect based on a small, signed cookie), implement a minimal `middleware.ts` with a strict `matcher` and no external SDKs.

