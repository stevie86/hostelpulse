# Implementation Verification (Owner‑Only Supabase MVP)

This guide lets you verify the Supabase‑backed APIs and owner UI locally via CLI, with clear expectations for each step.

## Prerequisites
- Env vars present in `.env.local` (copy from `.env.local.example`):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server‑only)
- Supabase schema pushed (EU project): `supabase db push`
- Local dev server running: `bunx next dev` (or `npm run dev`)

## Optional: Seed Minimal Data in EU Project
Use Supabase SQL Editor to insert one hostel and one guest (capture returned IDs):

```sql
INSERT INTO hostels (name, city) VALUES ('Lisbon Central Hostel','Lisbon') RETURNING id;
INSERT INTO guests (name, email) VALUES ('Maria Santos','maria@example.com') RETURNING id;
```

## API Smoke Tests (CLI)
Run these in a terminal while the dev server is running.

### Guests
- List
```bash
curl -s http://localhost:3000/api/guests | jq
```
- Create
```bash
curl -s -X POST http://localhost:3000/api/guests \
  -H 'Content-Type: application/json' \
  -d '{"name":"João Silva","email":"joao@example.com","phone":"+351 912 345 678","nationality":"Portuguese"}' | jq
```
- Update (replace `<GUEST_ID>`)
```bash
curl -s -X PUT http://localhost:3000/api/guests \
  -H 'Content-Type: application/json' \
  -d '{"id":"<GUEST_ID>","phone":"+351 999 000 111"}' | jq
```

### Bookings
- Create (replace `<HOSTEL_ID>`, `<GUEST_ID>`)
```bash
curl -s -X POST http://localhost:3000/api/bookings \
  -H 'Content-Type: application/json' \
  -d '{"hostel_id":"<HOSTEL_ID>","guest_id":"<GUEST_ID>","check_in":"2025-10-15","check_out":"2025-10-17","amount":120}' | jq
```
- List
```bash
curl -s http://localhost:3000/api/bookings | jq
```
- Update status (replace `<BOOKING_ID>`)
```bash
curl -s -X PUT http://localhost:3000/api/bookings \
  -H 'Content-Type: application/json' \
  -d '{"id":"<BOOKING_ID>","status":"checked_in"}' | jq
```

### Booking Requests (optional)
- Create (replace `<HOSTEL_ID>`)
```bash
curl -s -X POST http://localhost:3000/api/booking-requests \
  -H 'Content-Type: application/json' \
  -d '{"guest_name":"Emma Johnson","guest_email":"emma@example.com","hostel_id":"<HOSTEL_ID>","check_in":"2025-10-20","check_out":"2025-10-22"}' | jq
```

## CSV Export/Import

### Export CSV
- Guests
```bash
curl -s http://localhost:3000/api/export/guests -o guests.csv && wc -l guests.csv && head -n 5 guests.csv
```
- Bookings
```bash
curl -s http://localhost:3000/api/export/bookings -o bookings.csv && wc -l bookings.csv && head -n 5 bookings.csv
```

### Import CSV
- Guests (`id` optional)
```bash
cat > guests.csv << 'CSV'
id,name,email,phone,nationality
,Joao Test,joao.test@example.com,+351 911 222 333,Portuguese
CSV

curl -s -X POST http://localhost:3000/api/import/guests \
  -H 'Content-Type: application/json' \
  -d "{\"csv\":\"$(tr -d '\r' < guests.csv | sed ':a;N;$!ba;s/\n/\\n/g')\"}" | jq
```
- Bookings (replace IDs)
```bash
cat > bookings.csv << 'CSV'
id,hostel_id,guest_id,check_in,check_out,amount,status
,<HOSTEL_ID>,<GUEST_ID>,2025-10-18,2025-10-19,80,confirmed
CSV

curl -s -X POST http://localhost:3000/api/import/bookings \
  -H 'Content-Type: application/json' \
  -d "{\"csv\":\"$(tr -d '\r' < bookings.csv | sed ':a;N;$!ba;s/\n/\\n/g')\"}" | jq
```

## Expected Outcomes
- Guests/Bookings creates return 201 with created rows.
- Listing returns 200 with arrays: `{ guests: [...] }`, `{ bookings: [...] }`.
- Overlapping bookings return 409 `{ error: 'Booking overlaps...' }`.
- 503 appears only if Supabase env vars are missing.
- CSV export yields text/csv with headers; import returns `{ results: [{ index, ok, id|error }] }`.

## Troubleshooting
- 401/403 from Supabase: ensure `SUPABASE_SERVICE_ROLE_KEY` is set where the dev server runs.
- 409 on create: adjust `check_in`/`check_out` to avoid overlaps for the same `hostel_id`.
- 503 from API: verify `.env.local` values and restart the dev server.

---
Once these checks pass, the owner pages are ready to use:
- `/owner/dashboard` — arrivals/departures with quick actions
- `/owner/bookings` — list/create/cancel/check‑in/out
- `/owner/guests` — list/add
