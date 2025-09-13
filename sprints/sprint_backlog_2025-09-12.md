# Sprint Backlog — 2025-09-12 (Owner‑Only MVP)

Scope: Ship a useful, fast MVP for hostel owners in Lisbon with EU‑hosted Supabase, CSV migration, and a clean Owner Console UI.

## Completed
- [x] Supabase (EU) linked and schema pushed (hostels, guests, bookings, tax_rules)
- [x] Env vars wired (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
- [x] Guests API: GET/POST/PUT `/api/guests`
- [x] Bookings API: GET/POST/PUT `/api/bookings` (date overlap protection; 409)
- [x] Booking requests: POST `/api/booking-requests` (logs “requested” stays)
- [x] CSV Import endpoints: POST `/api/import/guests`, `/api/import/bookings` (body.csv)
- [x] CSV Export endpoints: GET `/api/export/guests`, `/api/export/bookings` (text/csv)
- [x] Owner pages
  - [x] `/owner/dashboard`: Arrivals/Departures with Check‑in/Check‑out/Cancel
  - [x] `/owner/bookings`: list/create/status update
  - [x] `/owner/guests`: list/add
  - [x] Back/forward navigation (PageNav) across owner pages
- [x] CSV UI (textarea + download) on `/owner/guests` and `/owner/bookings`
- [x] API docs: `/api-docs` (Redoc + `docs/openapi.json`)
- [x] Test script with smoke: `scripts/supabase-api-test.sh smoke <HOSTEL_ID>`
- [x] Sample CSVs under `samples/` (testing + templates)
- [x] Debug mode: `DEBUG_MODE=1` logs hosted/local; `/api/debug` status
- [x] UX polish: removed all placeholder text; updated landing + features; policy pages rewritten (demo policies)
- [x] Docs
  - [x] `docs/implementation-verification.md` (smoke + CLI)
  - [x] `docs/implementation-summary.md`

## In Progress / Next (near‑term)
- [ ] Open PR for `supabase` branch; verify Preview with EU env vars
- [ ] Minimal Jest tests baseline in CI + set a modest coverage threshold (we added API tests; wire CI)
- [ ] Status badges/colors in bookings list for clarity (checked_in/checked_out/cancelled)
- [ ] Link to `/api-docs` from owner pages footer/header

## Planned (coming soon)
- [ ] Keypad instructions via email (SendGrid) — route + button on booking rows
- [ ] Telegram ops bot — `/today`, `/checkin <id>`, `/checkout <id>`, `/sendcode <id>`
- [ ] Multi‑house owner scoping — owner auth + RLS; House selector in UI
- [ ] Invoices & Lisbon City Tax workflows
- [ ] GDPR DSAR — export + anonymize (erase) endpoints and audit log
- [ ] Interactive Swagger UI (swagger-ui-react) or zod-to-openapi as schemas mature

## Notes / Decisions
- Anonymization preferred over hard delete for GDPR to preserve lawful booking records
- RLS remains strict; server writes use service role key in API routes
- EU‑hosted Supabase selected (region: EU) to align with Lisbon operations

---
Use `docs/implementation-verification.md` to validate locally and in Preview. Owner flows should feel crisp, responsive, and focused on daily ops.
