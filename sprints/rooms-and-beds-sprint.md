# Sprint: Rooms & Beds — Owner-Scoped Rooms, Beds, Assignment, Availability

## Goal
Give owners a complete “Rooms” package: define rooms (private/dorm), manage beds for dorms, assign rooms/beds on bookings, and prevent overlaps — all owner-scoped via RLS and CSV-friendly.

## Deliverables
- DB: `rooms`, `beds`; extend `bookings` with `room_id`, `bed_id`; indexes.
- RLS: enable and scope `rooms/beds/bookings` to the owner (Preview → Prod).
- APIs: CRUD for rooms/beds; extend bookings with room/bed assignment; availability endpoint.
- CSV: import/export for rooms and beds.
- UI: `/owner/rooms` page + bed editor; booking assignment UI.

## Data Model (Supabase/Postgres)
- rooms: id, hostel_id, name, type('private'|'dorm'), capacity, bathroom('ensuite'|'shared'), default_rate, status('active'|'maintenance'), amenities_json, timestamps
- beds: id, room_id, label, status('active'|'blocked'|'maintenance'), timestamps
- bookings: add nullable room_id, bed_id
- Indexes: rooms(hostel_id); beds(room_id); bookings(room_id, check_in, check_out); bookings(bed_id, check_in, check_out)

Example SQL (concise)
```sql
-- Enums
create type room_type as enum ('private','dorm');
create type bathroom_type as enum ('ensuite','shared');

-- Tables
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references public.hostels(id) on delete cascade,
  name text not null,
  type room_type not null,
  capacity int not null default 1,
  bathroom bathroom_type not null default 'shared',
  default_rate numeric(10,2),
  status text not null default 'active' check (status in ('active','maintenance')),
  amenities_json jsonb not null default '[]',
  created_at timestamptz default now()
);
create index on public.rooms(hostel_id);

create table public.beds (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  label text not null,
  status text not null default 'active' check (status in ('active','blocked','maintenance')),
  created_at timestamptz default now()
);
create index on public.beds(room_id);

alter table public.bookings add column room_id uuid references public.rooms(id);
alter table public.bookings add column bed_id uuid references public.beds(id);
create index on public.bookings(room_id, check_in, check_out);
create index on public.bookings(bed_id, check_in, check_out);
```

RLS (Preview first)
```sql
alter table public.rooms enable row level security;
create policy rooms_rw_own on public.rooms for all
  using (exists (
    select 1 from public.hostels h
    where h.id = rooms.hostel_id and h.owner_id = auth.uid()
  ));

alter table public.beds enable row level security;
create policy beds_rw_own on public.beds for all
  using (exists (
    select 1 from public.rooms r join public.hostels h on h.id = r.hostel_id
    where r.id = beds.room_id and h.owner_id = auth.uid()
  ));

-- Ensure bookings are already RLS-scoped via hostel ownership
```

## Rules
- Overlap: Private → reject if any booking overlaps for same `room_id`. Dorm → reject if any booking overlaps for same `bed_id`.
- Capacity: For private rooms, `capacity` is informational; for dorms, enforce bed-level assignment.
- Maintenance: status='maintenance' excludes room/beds from availability and selection.

## APIs
- `GET/POST/PUT /api/rooms` (list/create/update)
- `GET/POST/PUT /api/rooms/:id/beds` (list/upsert)
- `GET /api/availability?hostel_id&from&to[&room_id]` → availability/next-conflict per room; optional per-bed
- Extend bookings `POST/PUT` to accept `room_id`, `bed_id` and apply overlap rules

## CSV
- rooms.csv: name,type,capacity,bathroom,default_rate,amenities,status
- beds.csv: room_id(or name),label,status
- Endpoints: `POST /api/import/{rooms|beds}`; `GET /api/export/{rooms|beds}`

## UI
- `/owner/rooms`: grid/list with filters (type, status). Add/Edit drawer. For dorms: “Manage Beds” inline editor (labels, status).
- Bookings UI: add room selector (filter by type/status); show bed selector when dorm chosen. Clear conflict errors.

## Rollout Plan
1) DB + RLS in Preview; smoke with admin token.
2) APIs and overlap logic behind `REQUIRE_API_AUTH=1` once Auth UI lands.
3) UI pages and booking assignment.
4) CSV import/export and availability endpoint.
5) Promote to Prod after smoke.

## Env & Security
- API requires JWT once Auth UI ships: `REQUIRE_API_AUTH=1` (Preview → Prod).
- Keep `ADMIN_API_TOKEN` for CI/emergency only. Set `ALLOWED_ORIGINS` for CORS.

## Acceptance Criteria
- Owners can CRUD rooms/beds; assign room/bed on bookings without overlaps.
- Availability endpoint returns free rooms in a date range.
- CSV round-trips rooms and beds.
- RLS blocks cross-tenant access; APIs work with `Authorization: Bearer <JWT>`.

## Timeline
- DB/RLS/Indexes: 0.5 day
- APIs + overlap logic: 0.5–1 day
- UI (rooms + beds + assignment): 1–1.5 days
- CSV + availability: 0.5 day
- Smoke + polish: 0.5 day

## Risks & Mitigations
- Policy errors block access → start in Preview; keep admin token fallback.
- UI complexity for beds → simple list editor, no drag/drop.
- Data mismatches on CSV → strict validation + clear errors.

## Verification
- JWT smoke: CRUD rooms/beds succeeds; cross-tenant fails.
- Overlap test: booking with conflicting room/bed returns 409.
- Availability returns expected rooms for sample ranges.
