# Summary — Demo Path, UI Toggle, Admin Provisioning & Seed

Date: 2025-09-14

## What was requested
Backfill a change log entry and preserve the exact operational guidance for enabling a demo login flow with seeded data in Preview/Production.

## Shipped in code (ready)

- Login demo banner (Preview/Prod controlled by env)
  - Shows demo email and password only when `NEXT_PUBLIC_SHOW_DEMO_CREDS=1`.
  - Autofill button fills both fields (`demoEmail` + `demoPassword`).
  - File: `pages/auth/login.tsx`.
- Admin endpoints (protected via `ADMIN_API_TOKEN`)
  - `POST /api/admin/createDemoUser`
    - Body: `{ email, password, name? }` → creates a Supabase Auth user (`email_confirmed`).
  - `POST /api/admin/seed`
    - Body: `{ owner_id }` → creates:
      - “Private Room 1” (private), “Dorm A” (4 beds)
      - 3 guests
      - 1 confirmed booking arriving today
  - Files: `pages/api/admin/createDemoUser.ts`, `pages/api/admin/seed.ts`.

## What you need to set (Vercel Env)

- For Preview (to show demo creds):
  - `NEXT_PUBLIC_SHOW_DEMO_CREDS=1`
  - `NEXT_PUBLIC_DEMO_EMAIL=demo@hostelpulse.app`
  - `NEXT_PUBLIC_DEMO_PASSWORD=demo123`
  - `NEXT_PUBLIC_DEMO_NOTE="Use Autofill, then Log in"`
- For Production (hide demo by default, but enabled if you want):
  - `NEXT_PUBLIC_SHOW_DEMO_CREDS=0` (or unset)
- For both Preview/Prod:
  - `ADMIN_API_TOKEN=your-strong-admin-token`
  - `SUPABASE_SERVICE_ROLE_KEY=...` (already present)
  - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (already present)

## How to provision the demo user + seed data

Run from your shell after setting `ADMIN_API_TOKEN` in Vercel env and deploying:

- Create user (returns id):

```
curl -X POST https://hostelpulse.vercel.app/api/admin/createDemoUser \
  -H 'Content-Type: application/json' \
  -H 'x-admin-token: YOUR_ADMIN_TOKEN' \
  -d '{"email":"demo@hostelpulse.app","password":"demo123","name":"Demo Owner"}'
```

- Then seed:

```
curl -X POST https://hostelpulse.vercel.app/api/admin/seed \
  -H 'Content-Type: application/json' \
  -H 'x-admin-token: YOUR_ADMIN_TOKEN' \
  -d '{"owner_id":"<id from previous step>"}'
```

## What’s live for owners without a channel manager

- Features page (real copy), header Login to `/auth/login`.
- Dashboard: Import/Export (CSV) widgets (Guests/Bookings), Housekeeping page (`/housekeeping`).
- CSV import is round‑trip safe (names/notes with commas/quotes).
- Guests/Bookings/Rooms APIs with conflict checks.

## Queued next

- Today quick actions: one‑tap check‑in/out + WhatsApp/Email buttons.
- Booking create/edit form (guest typeahead, room/bed, dates, conflict handling).
- CSV import wizard: preview + dedupe for Bookings too.
- “Nights saved” counter wired to events.

## Note on pushing the demo PRs

I created the demo branch updates locally; GitHub had a transient network hiccup, so I couldn’t open the PR automatically. The code is ready and staged — I can retry opening the PR as soon as GitHub responds again or commit directly to `main` if you prefer speed.

## Next steps I can take upon approval

- Set the Preview env to show demo creds (1) and Production to hide (0).
- Create the demo user and seed data via the endpoints.
- Re-deploy and verify that “Autofill → Log in → Dashboard” is a smooth demo flow.

