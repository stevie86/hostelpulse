<h1 align="center">Hostelpulse — Owner Console</h1>

Run your hostel day to day. Check arrivals/departures, update check‑in/out, manage guests and bookings, and import/export spreadsheets — in owner language, with EU‑hosted data, no migration required.

- Production: https://hostelpulse.vercel.app
- Roadmap: docs/roadmap.md • Marketing: docs/marketing/README.md • Integrations: docs/integrations/backlog.md

## Features

- Today board: who’s coming/going; one‑tap check‑in/out (UI in progress)
- Guests & Bookings: add/update guests and bookings; conflict detection to prevent double‑bookings
- Import & Export (CSV): round‑trip safe; import guests, export guests/bookings; dashboard widgets
- Housekeeping: simple, printable list of today’s departures
- City/tourist tax: simple CSV exports (by date range; see roadmap)
- Security: default‑on API auth, CORS/headers, EU‑hosted; export anytime

## Quickstart (Local)

Requirements: Node 22, npm 10

1) Copy env and set required keys
```
cp .env.local.example .env.local
# Set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
```

2) Install & run
```
npm install
npm run dev
```

3) Visit http://localhost:3000

## Deploy (Vercel)

- Production branch: `main`
- Required env (Production):
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `REQUIRE_API_AUTH=1`
  - `ALLOWED_ORIGINS=https://hostelpulse.vercel.app[,custom domains]`
  - `ADMIN_API_TOKEN` (optional for CLI/ops)
- Previews: enable for PRs only; set `REQUIRE_API_AUTH=0` for smooth demos.

## Demo (optional)

Enable a Preview‑only banner on `/auth/login` that shows demo credentials and provides an Autofill button, then provision a demo user and seed data.

1) Enable the banner (Vercel env)
- Preview: set `NEXT_PUBLIC_SHOW_DEMO_CREDS=1`
- Also set: `NEXT_PUBLIC_DEMO_EMAIL`, `NEXT_PUBLIC_DEMO_PASSWORD`, `NEXT_PUBLIC_DEMO_NOTE`
- Production: set `NEXT_PUBLIC_SHOW_DEMO_CREDS=0` (or leave unset)

2) Protect admin endpoints (Vercel env)
- Required: `ADMIN_API_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`
- Already present: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3) Create the demo user (returns id)
```
curl -X POST https://<your-deploy>/api/admin/createDemoUser \
  -H 'Content-Type: application/json' \
  -H 'x-admin-token: YOUR_ADMIN_API_TOKEN' \
  -d '{"email":"demo@hostelpulse.app","password":"demo123","name":"Demo Owner"}'
```

4) Seed sample data (rooms, beds, guests, booking)
```
curl -X POST https://<your-deploy>/api/admin/seed \
  -H 'Content-Type: application/json' \
  -H 'x-admin-token: YOUR_ADMIN_API_TOKEN' \
  -d '{"owner_id":"<id from previous step>"}'
```

Now visit `/auth/login` → Autofill → Log in → `/dashboard`.

## Documentation

- Product roadmap: docs/roadmap.md
- Marketing playbook: docs/marketing/README.md
- Competitor research: docs/marketing/competitor-research.md
- OTA sync considerations: docs/roadmap-considerations.md
- Integrations backlog: docs/integrations/backlog.md

## License

MIT — see LICENSE
