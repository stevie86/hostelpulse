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

- You can create a demo user in Supabase Auth and seed 2 rooms (incl. one dorm), 3 guests, and 2 bookings to showcase the dashboard.
- For a Preview‑only banner and autofill on /auth/login, set:
  - `NEXT_PUBLIC_SHOW_DEMO_CREDS=1`, `NEXT_PUBLIC_DEMO_EMAIL=…`

## Documentation

- Product roadmap: docs/roadmap.md
- Marketing playbook: docs/marketing/README.md
- Competitor research: docs/marketing/competitor-research.md
- OTA sync considerations: docs/roadmap-considerations.md
- Integrations backlog: docs/integrations/backlog.md

## License

MIT — see LICENSE
