## Metrics & Instrumentation

### Plain definition of “1 night saved”
“A booking night that would likely have been lost without Hostelpulse, but was kept because the system prevented an error or prompted a recovery action.”

We count “nights saved” conservatively from two auditable events:
- Conflicts prevented (overlaps): an attempted overlapping booking was blocked and adjusted.
- Late arrivals recovered: a reminder sent for a late arrival resulted in a check‑in within a short window.

### What we show to owners (Dashboard)
- Nights Saved = Conflicts Prevented + Late Arrivals Recovered (conservative 1 per incident).
- Minutes saved today (self‑estimate or heuristic), with a weekly roll‑up.
- Rooms turned on time (departed → cleaned before next arrival).

### How we count (events + logic)
- conflict_prevented
  - Emitted when an overlap is detected and the owner adjusts to a non‑overlapping plan.
  - Data: booking_id, unit_id, overlap_nights, timestamp.
  - Count: 1 per incident (conservative) or overlap_nights (optimistic option).
- late_arrival_reminder_sent and checkin_marked
  - Emitted when a reminder is sent after X pm, and the guest checks in within Y hours.
  - Count: 1 per recovered arrival (conservative).
- housekeeping_list_generated and tasks_completed (optional for minutes‑saved evidence).
- csv_import/export counts (adoption evidence).

### € estimate (owner‑friendly)
- Owner sets a typical nightly rate (ADR) once.
- Euros protected (conservative) = nights_saved_conservative × ADR.
- We label confidence (Conservative vs Optimistic) and let owners click through to “View details” (events list).

### Dual success metric for pilots
- ≥ 1 night/month recovered OR ≥ 30 minutes/day saved.
- Pilot close uses whichever is stronger for the owner.
