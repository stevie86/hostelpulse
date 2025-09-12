# Implementation Report — 2025‑09‑12 (Owner‑Only MVP)

This is an honest snapshot of what we built in this sprint to deliver a practical MVP for hostel owners in Lisbon. It focuses on day‑to‑day operations (arrivals/departures, guests, bookings) and fast migration from spreadsheets, all backed by an EU‑hosted Supabase backend.

## What’s working now
- EU Supabase live + wired via env vars (no hardcoded keys)
- Core APIs
  - Guests: `GET/POST/PUT /api/guests`
  - Bookings: `GET/POST/PUT /api/bookings` with date‑overlap protection (409)
  - Booking requests: `POST /api/booking-requests` (logs a “requested” stay)
  - CSV Import/Export: `POST /api/import/{guests|bookings}`, `GET /api/export/{guests|bookings}`
- Owner Console
  - `/owner/dashboard`: Arrivals & Departures with one‑click Check‑in/Check‑out/Cancel
  - `/owner/bookings`: list + create + status updates
  - `/owner/guests`: list + add
  - Back/forward navigation across owner pages
  - CSV import textarea + “Download CSV” on Guests and Bookings pages
- Tooling & docs
  - Smoke test: `./scripts/supabase-api-test.sh smoke <HOSTEL_ID>` (creates guest/booking, lists, exports CSVs)
  - API docs at `/api-docs` (Redoc + `docs/openapi.json`)
  - Samples: `samples/*.csv` (testing + templates)
  - Verification guide: `docs/implementation-verification.md`
  - Implementation summary: `docs/implementation-summary.md`
  - Debug mode: `DEBUG_MODE=1` prints Supabase mode; `/api/debug` for status
- UI polish
  - Removed placeholder text site‑wide; more inviting, owner‑focused landing + features
  - Policy pages rewritten as minimal, realistic placeholders (to be replaced before production)

## What’s not done (and why)
- Keypad instructions via email (SendGrid): not implemented yet to prioritize core ops + CSV migration
- Telegram ops bot: good fit, deferred to keep MVP small
- Multi‑house owner scoping + RLS auth context: data model supports it; full UX/RLS next
- Invoices & Lisbon City Tax flows: noted on roadmap, after daily ops
- Interactive Swagger UI: static Redoc shipped first (zero deps); can add swagger-ui-react later
- GDPR DSAR tooling: planned as anonymize/erase endpoints with audit logs

## How to try it quickly
1) Seed a hostel in Supabase (SQL editor):
   ```sql
   INSERT INTO hostels (name, city) VALUES ('Lisbon Central Hostel','Lisbon') RETURNING id;
   ```
2) Run dev: `bunx next dev` (or `npm run dev`)
3) Smoke test: `./scripts/supabase-api-test.sh smoke <HOSTEL_ID>`
4) Click through: `/owner/dashboard`, `/owner/bookings`, `/owner/guests`
5) Import CSV via UI (paste in textarea) and download exports

## What’s next
See the dated sprint backlog for a checked‑off list and the next action items:
- `sprints/sprint_backlog_2025-09-12.md`

This MVP is intentionally simple: it’s fast, owner‑only, and EU‑hosted. It proves the daily value first (check‑in/out, guests, bookings, CSV), with clear next steps for keypad email, multi‑house scoping, and integrations.
