# HostelPulse - Immediate Next Steps

## Current Status Summary
- ✅ MVP is buildable and deployable (fixed all build errors)
- ✅ Core features implemented: guests, rooms, bookings, dashboard, housekeeping
- ✅ Database schema completed (added missing payments and notifications tables)
- 🔄 Outstanding PRs: #23, #21, #20, #19, #7, #6 (from sprint plan)
- 📋 Current sprint: MVP Finalization (Sept 23-27, 2025)
- 📊 Roadmap: Near-term features (Weeks 1-2) and integration plans

## Immediate Action Plan (This Week)

### 1. Fix API Authentication with Local Supabase (PRIORITY 1)
- [ ] Debug the 500 errors occurring in API endpoints when using local Supabase
- [ ] Verify JWT configuration works with local Supabase instance
- [ ] Test authentication flow: registration → login → API access
- [ ] Ensure RLS policies are properly enforced
- [ ] Test complete user flow: registration → create guest/room/booking → verify data isolation

### 2. CSV Import/Export Completion (Priority 2)
- [ ] Review/merge #37 (guest CSV dry-run + commit) if not already merged
- [ ] Implement bookings CSV dry-run/commit with overlap detection parity
- [ ] Add scripted smoke test for CSV flows or document manual test matrix

### 3. UI/UX Enhancements
- [ ] Extend management UI (bookings/guests/rooms) with conflict banners and action buttons
- [ ] Add "Nights saved" counter on dashboard (conflicts prevented, late arrivals salvaged)
- [ ] Improve CSV import wizard: dedupe (name+email), preview before import, results summary

### 4. Security & Compliance
- [ ] Flip `REQUIRE_API_AUTH=1` on Preview (after Auth UI is fully working)
- [ ] Verify RLS policies are working correctly in Supabase (completed - all tables now have RLS)
- [ ] Ensure proper CORS configuration with `ALLOWED_ORIGINS`

### 5. Quality Assurance
- [ ] Run full lint/test suite (`npm run lint`, `npm test`, `npm run build`)
- [ ] Execute regression checklist covering import → management → audit path
- [ ] Smoke test Vercel preview deployment

## Week 2 Priorities (Revenue-Generating Features)
- [ ] City/tourist tax export: daily/monthly CSV totals by date range
- [ ] Payment link + receipt: Stripe integration, mark paid, email receipt
- [ ] Late-arrival alert: remind at X pm; "checked in?" follow-up
- [ ] Housekeeping list: printable daily list; CSV export for staff

## Integration Roadmap
- [ ] Beds24 connector (token-based) for owners who use it
- [ ] iCal and email-parser ingestion to populate arrivals/departures
- [ ] "Nights saved" metric to make value visible

## Validation Plan
- [ ] Prepare 7-day validation with 5-8 owners
- [ ] Set up 2-week pilots with "≥1 night/month" or "≥30 min/day" success criteria
- [ ] Pricing: Starter €39/mo; Pro €69–€79/mo; 14-day free pilot

## Success Metrics
- [ ] Both CSV flows (guests + bookings) support dry-run, dedupe, and conflict handling
- [ ] Dashboard/management screens show accurate counts/actions post-import
- [ ] CI green on `main`; branch protection restored; stale PR backlog addressed
- [ ] Vercel preview ready for stakeholder walkthrough