# Prepare for Vercel Preview (Owner‑Only MVP)

This checklist gets you a working Vercel Preview with Supabase EU and build‑gated deploys.

## 1) Open a PR into `main`
- Push your working branch (e.g., `supabase`) and open a Pull Request targeting `main`.
- Our GitHub Action (`.github/workflows/vercel-deploy.yml`) deploys on `pull_request` → `main` with a Preview build.

## 2) Set Vercel environment variables (Preview)
Add these in Vercel → Project → Settings → Environment Variables (Preview scope):
- `NEXT_PUBLIC_SUPABASE_URL` = https://<project-ref>.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = <anon-key>
- `SUPABASE_SERVICE_ROLE_KEY` = <service-role-key>

Notes
- `.env.local` is not read in Vercel; you must set env vars in the Vercel dashboard (or via `vercel env`).
- Restart/trigger a new Preview after saving envs.

## 3) Confirm deploy action secrets (GitHub repo)
Our Actions-based deploy uses these GitHub repo secrets:
- `VERCEL_TOKEN` (you added this)
- `VERCEL_ORG_ID` (synced from `.vercel/project.json`)
- `VERCEL_PROJECT_ID` (synced from `.vercel/project.json`)

## 4) Avoid duplicate preview deploys
Pick one deploy path to avoid double deployments:
- Keep GitHub Actions deploy (current setup), OR
- Enable Vercel’s native Git integration and disable the Actions-based deploy.

## 5) Build‑gated deploys and required checks
- Ensure the deploy job runs only after build/tests (deploy `needs: build` if you split the jobs).
- In branch protection, require:
  - Build/Tests (and a modest coverage threshold if enabled)
  - “Vercel Preview Deploy / Preview”
  - Optionally: Conversation resolution

## 6) Smoke‑test Preview
- In the Preview URL, seed one hostel in Supabase (SQL editor) and then use the Owner Console:
  - `/owner/dashboard` → check‑in/out buttons
  - `/owner/bookings` → create/cancel
  - `/owner/guests` → add guests
  - Try CSV import UI and download exports
- API docs: `/api-docs`

## 7) Troubleshooting
- 503 on APIs: Supabase env vars missing in Vercel — add them, redeploy.
- 401/403 in Preview: ensure `SUPABASE_SERVICE_ROLE_KEY` is present in Vercel envs.
- Overlap 409: adjust booking dates.
- Double deploy: disable one of the two deploy paths (Actions vs native Git integration).

## Should we increase code coverage first?
- Recommended but not blocking for Preview. We already added targeted API tests; you can:
  - Add a modest coverage threshold (e.g., lines ≥ 60–70%) in Jest for MVP modules.
  - Expand tests iteratively (import/export parsing, form actions) after Preview is live.

## References
- Sprint backlog (completed + next steps): `sprints/sprint_backlog_2025-09-12.md`
- Implementation summary: `docs/implementation-summary.md`
- Verification guide: `docs/implementation-verification.md`
- API docs: `/api-docs` (uses `docs/openapi.json`)
