# Integrations Backlog

Owner‑first integrations that deliver “one‑click sync” in practice, without waiting for gated OTA programs.

## Beds24 Connector (Phase 1)
- Auth: Owner provides API key/token.
- Read: Bookings (date range), rooms/beds, availability; normalize into Hostelpulse types.
- Write (optional): Check‑in/out status update; notes.
- Sync strategy: daily full + incremental webhooks/poll; idempotent upserts.
- Errors: retry with backoff; owner‑visible status; CSV fallback.

## Cloudbeds Connector (Marketplace/OAuth)
- Auth: OAuth via marketplace app (owner consent).
- Read: reservations, units, availability; map dorm beds if exposed.
- Write (optional): status updates, notes.
- Compliance: app listing requirements; test sandbox.

## Sirvoy Pro Connector (API add‑on)
- Auth: API key if plan enables it.
- Read: bookings, rooms, availability; push notes/status (if supported).
- Doc variability by plan — surface capability matrix to owners.

## FrontDesk Master Connector
- Auth: PMS tokens; confirm available scopes.
- Read/write parity similar to Beds24; adapt to FDM endpoints.

## iCal Import (Read‑Only)
- Owner pastes iCal feed URLs (Booking.com/Airbnb where available).
- Parse events → guests (when present), dates, unit mapping.
- Best effort for Today board; no writes.

## Email Parser (Booking Confirmations)
- Dedicated inbox (forwarding from owner’s email).
- Parse guest name, contact, dates, room/bed notes from templates; tolerate minor drift.
- Privacy: owner‑consented, store minimal, redact on export.

## Common
- Secrets: server‑side storage, rotation; never in client.
- Auditing: log every sync; owner admin view with timestamps and row counts.
- Failure modes: retry queue, manual CSV import fallback, clear error messages.

## Milestones (Sequenced)
- M1: Beds24 (read), iCal, email parser → Today board populated for most owners.
- M2: Beds24 (write minimal), Cloudbeds/Sirvoy read, owner sync dashboard.
- M3: Publish SLAs; reach 100 properties; begin OTA partner applications.

