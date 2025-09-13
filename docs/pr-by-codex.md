# PR Command (Codex)

Use this command to open a Pull Request from the `supabase` branch into `main` with a clear summary. Run it from the repo root after pushing the branch.

```bash
# Push local work (if not yet pushed)
git push -u origin supabase

# Create PR to main with a descriptive title and body
gh pr create \
  -B main \
  -H supabase \
  --title "feat(mvp): Owner Console + Supabase EU + CSV import/export + API docs" \
  --body "Owner-only MVP for Lisbon hostels.\n\nHighlights\n- EU-hosted Supabase wired by env (no hardcoded keys)\n- Guests/Bookings APIs with overlap protection\n- Booking-requests endpoint\n- CSV import/export endpoints + textarea UI on owner pages\n- Owner Console: /owner/dashboard, /owner/bookings, /owner/guests + PageNav\n- API docs at /api-docs (Redoc + docs/openapi.json)\n- Samples + smoke script: scripts/supabase-api-test.sh smoke <HOSTEL_ID>\n- Debug mode + /api/debug; no placeholder text\n\nDocs\n- docs/implementation-verification.md\n- docs/implementation-summary.md\n- docs/prepare4deploy2vercel.md\n- sprints/sprint_backlog_2025-09-12.md\n\nNext\n- Set Vercel Preview envs (Supabase URL/keys), run smoke in Preview, and we’re demo-ready."
```

Notes
- Ensure Vercel Preview envs are configured before testing the Preview:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- If using Vercel’s native Git integration, avoid duplicate deploys by disabling one deploy path (Actions vs native Git).
