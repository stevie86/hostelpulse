# Summary — CSV Import/Export and Core APIs

Date: 2025-09-14

## What was requested
Backfill a concise record of CSV features and the core Guests/Bookings/Rooms APIs, including conflict checks and round‑trip CSV safety.

## Shipped in code (ready)

- CSV Import/Export UI
  - Component: `components/CSVImportExport.tsx` supports `guests` and `bookings` with import/export, inline status, and user‑friendly errors.
  - Uses `GET /api/export/:type` if available, else falls back to `GET /api/csv/:type`.
- CSV Endpoints
  - Guests: `pages/api/csv/guests.ts`
    - `GET` returns CSV with `name,email,phone,notes`.
    - `POST` parses CSV safely (quotes doubled), inserts rows, and returns a summary (`Imported X guests; Y failed.`).
  - Bookings: `pages/api/csv/bookings.ts`
    - `GET` returns CSV with `guest_name,guest_email,room_name,bed_name,check_in,check_out,status,notes`.
    - `POST` looks up guest/room/bed by names, performs minimal conflict check for overlapping stays on the same unit, inserts rows, returns a summary.
- Core APIs (Pages Router, Supabase backend)
  - Guests: `pages/api/guests.ts` — `GET`, `POST`, `PUT`; owner scoping via auth; basic validation.
  - Rooms: `pages/api/rooms.ts` — `GET`, `POST`; can create dorm beds in batch.
  - Bookings: `pages/api/bookings.ts` — `GET`, `POST`, `PUT`; date‑range overlap detection prevents conflicts; returns expanded guest/room/bed relations.
- Housekeeping & Dashboard
  - Housekeeping view (`pages/housekeeping.tsx`) shows rooms/beds departing today.
  - Dashboard (`pages/dashboard.tsx`) integrates CSV widgets and overview lists.

## Security / infra

- API routes are wrapped with `withAuth` and `withCors` where applicable.
- Admin endpoints use `x-admin-token` with `ADMIN_API_TOKEN`.
- Supabase service role is used only in admin/seed flows; regular API routes use standard Supabase client.

## Notes

- CSV parsing is handled by `utils/csv.ts` with escaping support (quotes doubled), enabling round‑trip safety for names/notes containing commas/quotes.
- Exports set `Content-Type: text/csv` and `Content-Disposition` to prompt downloads in browsers.

