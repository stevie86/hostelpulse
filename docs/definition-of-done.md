# Definition of Done (DoD)

## MVP (Owner Console)
- Guests: list + create/update via `/api/guests` (200 on GET, 201 on POST).
- Bookings: list + create/update via `/api/bookings`; overlap conflicts return 409.
- CSV: import/export endpoints exist or return clear 501/404 (no 500s).
- Home/Features render without console errors in prod build.

## Security (P0 → P1)
- P0 (now):
  - API supports `Authorization: Bearer <JWT>`; `REQUIRE_API_AUTH=0` by default.
  - `ADMIN_API_TOKEN` path (header `x-admin-token`) works for CI/emergency only.
  - CORS locked in production via `ALLOWED_ORIGINS`; security headers present.
- P1 (after Auth UI):
  - `REQUIRE_API_AUTH=1` (Preview → Production).
  - RLS policies enabled; owner can access only own rows.

## UI/UX
- Mobile‑first layouts; tap targets ≥ 44px; primary action per screen.
- Auth pages (login/register/reset) present and usable; forms submit; disabled states block multi‑submit.
- Dashboard shows Today’s Arrivals/Departures cards; empty states are clear and helpful.
- Copy avoids jargon; advanced details live in Help.

## CI/CD & Checks
- PRs pass required check: “Vercel Preview Deploy / Preview”.
- No TypeScript errors (`next build` succeeds); `npm run lint` passes or surfaces only non‑blocking warnings.
- Docs‑only commits are ignored by Vercel (via `vercel.json`).

## Vercel Preview
- Builds green with envs: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Security envs configured:
  - `ADMIN_API_TOKEN`, `ALLOWED_ORIGINS`, `REQUIRE_API_AUTH` (0 for MVP; 1 after Auth UI).
- Preview URL loads `/`, `/features`, `/contact`, and API endpoints return expected JSON or clear errors.

## Testing
- Happy‑path tests for core flows (Guests/Bookings) or manual smoke documented.
- Overlap logic validated (automated or manual) with at least one conflicting case (409).

## Documentation
- AGENTS.md up to date (structure, commands, style, testing, PR guidelines).
- Progress note updated (e.g., `docs/progressYYYYMMDD.md`).
- Dev ↔ Preview parity guide present and accurate.
- Sprint docs updated when scope changes (e.g., Rooms & Beds).

## Pull Requests
- Clear title + description; linked issues (e.g., `Closes #123`).
- Screenshots/GIFs for UI changes; note env/config changes.
- Small, focused diffs; green Preview; merge order respected when dependencies exist.
