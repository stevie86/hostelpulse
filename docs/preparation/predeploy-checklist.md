# Pre‑Deploy Checklist (Git + Vercel)

Use this checklist to verify a PR branch (e.g., `supabase`) is ready to deploy to Vercel and merge to `main`.

## 1) Sync and Compare with `main`
- Fetch latest and set local base:
  - `git fetch origin --prune`
  - `git fetch origin main:main`
- Check divergence and common base:
  - `git rev-list --left-right --count supabase...main`
  - `git merge-base supabase main`
- Interpret the results:
  - Output like `31	0` means: 31 commits ahead of `main`, 0 behind → good to PR/merge once checks pass.
  - If the second number is > 0 (e.g., `31	5`): you’re behind `main`. Rebase or merge `main` into your branch:
    - Rebase (clean history): `git rebase origin/main` then resolve conflicts and `git push --force-with-lease`.
    - Merge (no rewrite): `git merge origin/main` then `git push`.
  - `git merge-base` prints a SHA when histories are connected. If it errors or is empty, stitch histories:
    - `git merge -s ours --no-ff --allow-unrelated-histories origin/main -m "chore(repo): stitch histories post-secret purge (keep supabase tree)"`
    - `git push`
- Review what will merge:
  - `git log --oneline main..supabase | head -n 20`
  - `git diff --name-status main..supabase`

## 2) Local Sanity Checks
- Lint/types/build:
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npm run build`
- Optional predeploy script (if present):
  - `npm run predeploy`

## 3) Quick Secret Scan (prevent push protection blocks)
- `rg -n "LINEAR|API_KEY|SERVICE_ROLE|SUPABASE|SECRET" -S`

## 4) Handle Open PRs and Failing Checks
- Check PR status:
  - `gh pr status`
- Inspect failing checks (open links to logs):
  - `gh pr view <PR_NUMBER> --json statusCheckRollup -q '.statusCheckRollup[] | [.name, .conclusion, .detailsUrl] | @tsv'`
  - `gh pr view <PR_NUMBER> --web`
- Pull PR locally, fix, and push:
  - `gh pr checkout <PR_NUMBER>`
  - `npm run lint && npx tsc --noEmit && npm run build`
  - `git add -A && git commit -m "fix(ci): address failing checks" && git push`
- Re‑run flaky CI (GitHub Actions):
  - `gh run list -B supabase`
  - `gh run view <RUN_ID> --log`
  - `gh run rerun <RUN_ID>`
- Enable auto‑merge once green:
  - `gh pr merge <PR_NUMBER> --auto --squash`

### Quick readiness signal (all green when true)
- Ahead only: `git rev-list --left-right --count supabase...main` → second number should be `0`.
- Common base exists: `git merge-base supabase main` → prints a SHA.
- CI checks passing on PR: `gh pr view <PR_NUMBER> --json statusCheckRollup -q 'all(.statusCheckRollup[].conclusion == "SUCCESS")'`

## 5) Vercel Environment Variables
- Set on Vercel (Dashboard → Project → Settings → Environment Variables):
  - `NEXT_PUBLIC_SUPABASE_URL` (Preview, Production)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Preview, Production)
  - `SUPABASE_SERVICE_ROLE_KEY` (server‑only; Preview, Production)
  - Optional: `SENDGRID_API_KEY`, Tina CMS vars
- CLI alternative (apply to all Preview branches by pressing Enter at branch prompt):
  - `npx vercel@latest env add NEXT_PUBLIC_SUPABASE_URL preview`
  - `npx vercel@latest env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview`
  - `npx vercel@latest env add SUPABASE_SERVICE_ROLE_KEY preview`
  - Repeat for `production` scope.
- Verify/pull envs:
  - `npx vercel@latest env ls`
  - `npx vercel@latest env pull .env.local`

## 6) Preview Validation
- Ensure PR preview is deployed and healthy (checks green).
- Smoke test endpoints (replace `<HOSTEL_ID>`):
  - `scripts/supabase-api-test.sh smoke <HOSTEL_ID>`
- Manually spot‑check in Preview:
  - `/owner/dashboard`, `/owner/bookings`, `/owner/guests`
  - `/api/guests`, `/api/bookings`, `/api/booking-requests`, `/api-docs`, `/api/debug`

## 7) Merge and Production Deploy
- Merge when all checks are green:
  - `gh pr merge <PR_NUMBER> --squash --delete-branch`
- Production deploy should trigger from `main` in Vercel (ensure Production env vars are set).
- Post‑merge checks:
  - `git fetch origin --prune`
  - `git checkout main && git pull`
  - Validate production site and run smoke again.

## 8) Team Notes (if history was rewritten)
- Ask collaborators to reset local branch:
  - `git fetch origin`
  - `git checkout supabase`
  - `git reset --hard origin/supabase`

## 9) Troubleshooting
- “No history in common” when creating PR:
  - Stitch histories (keep feature tree):
    - `git switch supabase`
    - `git merge -s ours --no-ff --allow-unrelated-histories origin/main -m "chore(repo): stitch histories post-secret purge (keep supabase tree)"`
    - `git push`
- Behind `main` (second count > 0):
  - Rebase onto `origin/main` and force‑push: `git fetch origin && git rebase origin/main && git push --force-with-lease`
  - Or merge `origin/main` and push (no rewrite): `git fetch origin && git merge origin/main && git push`
- Push Protection blocked by secrets:
  - Remove secret from commits (history rewrite), rotate the secret, push again.
