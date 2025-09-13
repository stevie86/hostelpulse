# Dev ↔ Preview Parity (Quick Guide)

To match Vercel Preview locally:

- Check out the same branch/commit:
  - `gh pr checkout <number>` or `git checkout <sha>` from the Preview page
- Pull the same envs:
  - `vercel env pull .env.local preview` (or `production` for prod parity)
- Run prod mode locally:
  - `npm run build && npm start` (or `bunx next build && bunx next start`)

Recommended Vercel settings:
- Production Branch: `main`
- Deploy Previews: "Only for Pull Requests"
- Add envs on Preview/Prod:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `ADMIN_API_TOKEN`, `ALLOWED_ORIGINS`, `REQUIRE_API_AUTH` (keep `0` until Auth UI ships)

Optional cost saver (already configured):
- `vercel.json` skips builds when only `docs/`, `sprints/`, `.github/`, or `*.md` files change.
