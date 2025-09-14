# Roadmap Considerations — OTA Sync & Integrations

This note captures realistic paths to “one‑click sync” with booking platforms and what we can ship now without waiting for gated OTA programs.

## Reality of OTA APIs
- Booking.com: Connectivity Partner Program only (gated). Requires technical certification, support SLAs, security, and portfolio scale.
- Airbnb: Closed partner program aimed at larger property managers.
- Expedia/Hostelworld: Partner programs with business + technical prerequisites and certification.
- Implication: Indie apps can’t just enroll and pull bookings on day one. Access is controlled and takes time.

## Practical Path to “One‑Click Sync” Now
1) Integrate via the owner’s channel manager (fastest)
   - Beds24 API: accessible to customers; robust and affordable.
   - Cloudbeds: marketplace / OAuth; data sync via official integrations.
   - Sirvoy Pro: API available on paid add‑ons; use owner tokens.
   - FrontDesk Master: PMS APIs for customers.
   - Value: we piggyback on the system owners already use; we don’t replace it.

2) Lightweight fallbacks (for owners without a channel manager)
   - iCal (read‑only) calendar feeds from OTAs. Limited but good enough to populate the Today board.
   - Email parsing of booking confirmations from a dedicated inbox (owner‑consented). Extract guest, dates, contact; resilient to minor template drift.
   - CSV import/export: zero‑friction bulk sync; we already support round‑trip‑safe CSV.

## When to Pursue Direct OTA Access
- Maturity signals: 50–200 properties, documented SLAs, security posture (secret handling, audit logs, GDPR), and support responsiveness.
- Then apply to Booking.com Connectivity / Expedia EPS / others and expect a certification timeline.
- We should sequence this after we have local traction and references.

## Security & Compliance Notes
- Store tokens/keys securely (server env + KMS), never in client.
- Audit logs for sync actions; clear opt‑in/opt‑out for owners.
- Data residency: keep EU hosting and document exports.

## Owner Messaging (today)
- “Works with what you already have. Import your spreadsheet, pull calendars, or connect your channel manager — no migration required.”
- “If it saves one paid night per month, it pays for itself.”

## Milestones (Integrations Track)
- M1: Channel‑manager connectors (Beds24 first), iCal import, email‑inbox parser.
- M2: 100 active properties; publish SLAs; complete security checklist.
- M3: Apply to Booking.com Connectivity; certify one OTA.

## What We Ship Now (No Gated APIs)
- Beds24 connector (token‑based) for owners who use it.
- iCal and email‑parser ingestion to populate arrivals/departures.
- CSV wizard (dedupe/preview) and city‑tax exports.
- “Nights saved” counter to make value visible (conflicts prevented, late arrivals salvaged, rooms turned on time).

