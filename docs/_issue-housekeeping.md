Title: Housekeeping: CI/Vercel parity & security envs

This tracks small-but-important settings to keep PRs green, previews predictable, and security sane while we focus on MVP UI.

Checklist
- Vercel (Preview): add envs
  - [ ] ADMIN_API_TOKEN (random strong string)
  - [ ] ALLOWED_ORIGINS = https://<preview>.vercel.app,https://<prod-domain>
  - [ ] REQUIRE_API_AUTH = 0 (flip to 1 after Auth UI lands)
- Vercel Git settings
  - [ ] Production Branch = main
  - [ ] Deploy Previews = Only for Pull Requests
  - [ ] Disable auto-deploy for long-lived branches (e.g., supabase) unless opened as PRs
- GitHub branch protection (main)
  - [x] Required checks = “Vercel Preview Deploy / Preview” (minimal)
  - [ ] Confirm the check label matches exactly in the PR Checks tab; adjust if needed
- Local ↔ Preview parity
  - [ ] Pull Preview envs locally: `vercel env pull .env.local preview`
  - [ ] Use prod mode to compare: `npm run build && npm start`
- Cost saver (done in code)
  - [x] vercel.json ignores docs/ci-only changes for previews

Acceptance
- Previews deploy only for PRs and use the right envs; CORS works.
- main requires only the Vercel Preview check.
- Local matches Preview when using the parity guide (branch + env + prod build).

Notes
- Follow-up PRs: Tailwind + shadcn/ui scaffolding, App Shell, Auth UI, then flip REQUIRE_API_AUTH=1 on Preview.
