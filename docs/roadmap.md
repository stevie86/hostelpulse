# Consolidated Roadmap

This roadmap consolidates near‑term product work, marketing milestones, and integrations. It balances immediate owner value (minutes and nights saved) with pragmatic paths to “one‑click sync”.

## Near‑Term Product (Weeks 1–2)

Week 1 — Time saved now
- Today quick actions: one‑tap check‑in/out; WhatsApp/Email buttons on arrivals.
- Housekeeping list: printable daily list; CSV export for staff.
- CSV import wizard: dedupe (name+email), preview before import, results summary.
- Door‑code email: one click from Today; simple editable template.

Week 2 — Money & compliance
- City/tourist tax export: daily/monthly CSV totals by date range.
- Payment link + receipt: Stripe link, mark paid, email receipt.
- Late‑arrival alert: remind at X pm; “checked in?” follow‑up.

Owner value metric (visible)
- “Nights saved” counter on dashboard: conflicts prevented, late arrivals salvaged, rooms turned on time. Monthly summary converts to € using owner’s own nightly rate.

References
- See: docs/marketing/roadmap-to-monetizable-features.md

## Integrations Roadmap (Pragmatic “One‑Click Sync”)

Reality of OTA APIs
- Booking.com/Airbnb/Expedia/Hostelworld are gated partner programs (access after certification and scale). Not immediate for indie apps.

Ship now (no gated APIs)
- Channel‑manager connectors (owner tokens): Beds24 first; then Cloudbeds marketplace/OAuth; Sirvoy Pro (API on add‑on); FrontDesk Master PMS APIs.
- iCal (read‑only) from OTAs to populate Today board.
- Email‑inbox parsing of booking confirmations (owner‑consented).
- CSV wizard (round‑trip safe) + simple exports (e.g., city tax).

Scale toward direct OTA access
- Milestones: 50–200 properties, documented SLAs, security posture (secrets, audit logs, GDPR), support responsiveness → apply/certify with one OTA.

References
- See: docs/roadmap-considerations.md
- Backlog: docs/integrations/backlog.md

## Marketing & Validation Tie‑In

- 7‑day validation with 5–8 owners; 2‑week pilots with “≥1 night/month” or “≥30 min/day” success criteria.
- Pricing anchored to “one saved night”: Starter €39/mo; Pro €69–€79/mo; 14‑day free pilot; no setup fee.
- Objections: “keep your current tools”, “go live today”, “EU‑hosted, export anytime”.

References
- docs/marketing/validation-plan.md
- docs/marketing/interview-guide.md
- docs/marketing/pricing-positioning.md
- docs/marketing/objection-handling.md

## Risks & Dependencies

- Content and UX: keep owner language; hide jargon in Help.
- Security/compliance: token storage, audit logs, GDPR; EU hosting documented.
- Integrations: ensure opt‑in and clear failure modes (retry, resume, manual CSV fallback).

