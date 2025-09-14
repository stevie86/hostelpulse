# Summary — Demo Banner + Admin Seed: Validation & Next Steps

Date: 2025-09-14

## Verified in repo
- Demo banner and autofill in `pages/auth/login.tsx`, gated by `NEXT_PUBLIC_SHOW_DEMO_CREDS` with `NEXT_PUBLIC_DEMO_EMAIL`, `NEXT_PUBLIC_DEMO_PASSWORD`, `NEXT_PUBLIC_DEMO_NOTE`.
- Admin endpoints protected by `ADMIN_API_TOKEN`:
  - `POST /api/admin/createDemoUser` — creates Supabase Auth user (confirmed).
  - `POST /api/admin/seed` — creates rooms, beds, 3 guests, and a booking.

## Required environment (Vercel)
- Preview: `NEXT_PUBLIC_SHOW_DEMO_CREDS=1`, plus `NEXT_PUBLIC_DEMO_EMAIL`, `NEXT_PUBLIC_DEMO_PASSWORD`, `NEXT_PUBLIC_DEMO_NOTE`.
- Production: `NEXT_PUBLIC_SHOW_DEMO_CREDS=0` (or unset).
- Both: `ADMIN_API_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## How to seed (after env set)
1) Create user:
```
curl -X POST "$BASE_URL/api/admin/createDemoUser" \
  -H 'Content-Type: application/json' \
  -H "x-admin-token: $ADMIN_API_TOKEN" \
  -d '{"email":"demo@hostelpulse.app","password":"demo123","name":"Demo Owner"}'
```
2) Seed:
```
curl -X POST "$BASE_URL/api/admin/seed" \
  -H 'Content-Type: application/json' \
  -H "x-admin-token: $ADMIN_API_TOKEN" \
  -d '{"owner_id":"<id from previous step>"}'
```

## Suggested follow-ups
- Add demo keys to `.env.example` for discoverability.
- Optionally: add `changes/` to `vercel.json` ignore list to skip preview builds for log-only commits.
- Open PR for current branch and ensure Preview has required envs; verify “Autofill → Log in → Dashboard”.

