# Roadmap — Booking Management MVP (Post‑Import)

## Goals
- Owners can import their data and immediately manage guests, rooms/beds, and bookings end‑to‑end.
- CSV flows are self‑explanatory, dedupe across consecutive imports, and are safe to retry.
- Overlaps prevented; clear feedback for conflicts, check‑in/out, and edits.

## Phase 0 — Preconditions & Fixes (1–2 days)
- API auth for local: set `REQUIRE_API_AUTH=0` during dev; Preview/Prod `=1` (use JWT).
- Bookings PUT: land partial‑update + overlap check fix (see stash@{0}).
- Add Prettier scripts (done) and green CI for lint/test/format.

## Phase 1 — CSV UX & Consolidation (2–3 days)
- Import wizard (replace bare uploader in `components/CSVImportExport.tsx`):
  - Stepper: Upload → Validate/Preview → Dedupe Rules → Import Results.
  - Download sample CSV + field mapping (name/email/phone/notes; bookings: guest_email/room/bed/dates/status/notes).
- Consecutive import consolidation (Guests):
  - Use `upsert` on unique `(owner_id, email)`; merge non‑empty fields; normalize emails/phones.
  - Dry‑run endpoint returns preview: created/updated/skipped with reasons.
- CSV API: add `POST /api/csv/guests?dryRun=1` (no writes) + `POST /api/csv/guests` (commit).

## Phase 2 — Booking Import (2–4 days)
- Endpoint `POST /api/csv/bookings` with parse + validate:
  - Resolve `guest_id` by email; create missing guest (optional toggle).
  - Resolve unit: `bed` name within `room` or direct `room` by name.
  - Validate dates, prevent overlaps; show conflicts in preview.
- Upsert by composite key `(guest_id, check_in, check_out, room_id|bed_id)` to consolidate retries.

## Phase 3 — Booking Management UI (3–5 days)
- Pages:
  - `/bookings`: list with filters (date range, status), create/edit drawer.
  - `/guests`: list + view with recent stays and quick actions.
  - `/rooms`: room/dorm with beds management and capacity.
- Actions: create, edit, cancel; check‑in/out toggles; conflict messages inline.

## Phase 4 — Calendar & Conflicts (3–5 days)
- Calendar/Timeline view (room or bed lane) with drag‑to‑reschedule.
- Reuse server overlap logic; optimistic UI with rollback on conflict.

## Phase 5 — Guidance & Safety (1–2 days)
- In‑app guidance: contextual tips above import areas, empty‑state cards with “Start by importing…”
- Result toasts + “See what changed” modal after imports.
- Rate‑limit CSV endpoints; hide PII from logs; strict `ALLOWED_ORIGINS` in Prod.

## Phase 6 — Release Criteria
- Import guests/bookings are retry‑safe; consecutive imports consolidate without dupes.
- CRUD for guests/rooms/bookings; calendar prevents overlaps; tests for success/failure paths.
- Docs: “Import & Manage” guide with screenshots; README link.

## Consolidating Consecutive Imports — Details
- Guests: `upsert` on `(owner_id, email)`; on conflict merge non‑empty fields; keep newest phone/notes.
- Bookings: upsert on `(owner_id, guest_id, check_in, check_out, unit)`; skip if identical; update status/notes if changed.
- Preview (dry‑run): show counts by action (create/update/skip/conflict) and highlight merged fields.

## UI Improvements (Immediate wins)
- Add sample CSV download and inline field help.
- Replace “Export only (coming soon)” with a disabled button + tooltip that links to the roadmap and tracks interest.
- Add a small “How importing works” link near the widgets.

