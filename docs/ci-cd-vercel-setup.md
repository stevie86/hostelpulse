# CI/CD setup for Vercel deployments from `main`

This guide outlines the minimal, reliable steps to ship Preview deployments on PRs and Production deployments from `main` using GitHub Actions and Vercel.

## Prerequisites
- Vercel account and a linked project for this repo.
- `VERCEL_TOKEN` with access to the project (Account Settings → Tokens).
- `.vercel/project.json` exists (contains `orgId` and `projectId`). If missing, run `vercel link` locally.
- gh CLI and Vercel CLI installed (`gh`, `vercel`).

## Required GitHub secrets
Set these repo secrets so workflows can deploy:

```bash
# Pull IDs from .vercel/project.json if needed
ORG_ID=$(node -e "console.log(JSON.parse(require('fs').readFileSync('.vercel/project.json','utf8')).orgId)")
PROJECT_ID=$(node -e "console.log(JSON.parse(require('fs').readFileSync('.vercel/project.json','utf8')).projectId)")

# Set secrets (replace YOUR_TOKEN)
gh secret set VERCEL_TOKEN -b YOUR_TOKEN
gh secret set VERCEL_ORG_ID -b "$ORG_ID"
gh secret set VERCEL_PROJECT_ID -b "$PROJECT_ID"
```

Tip: If you keep separate staging/production projects, also set `VERCEL_PROJECT_ID_STAGING` and `VERCEL_PROJECT_ID_PRODUCTION` and update the workflow accordingly.

## Branching model and protection
- Default branch is `main`. Protect it with:
  - Required checks (tests, security, performance, preview deploy)
  - 1 approving review, linear history, no force-push/delete
- Optional: Enable “Require conversation resolution” in Settings → Branches → `main`.

## Workflows
Two recommended paths — choose one to avoid duplicate deploys.

- Option A — GitHub Actions handles all deploys (recommended here)
  - PR Previews: `.github/workflows/vercel-deploy.yml` (runs on `pull_request` → `main`, no `--prod`).
  - Production: Add a job that runs on `push` to `main` with `--prod`.

Example production job snippet:
```yaml
name: Vercel Production Deploy
on:
  push:
    branches: [ main ]
jobs:
  deploy-prod:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: npm
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

- Option B — Use Vercel’s native GitHub integration
  - Enable Vercel’s Git integration for the repo.
  - Disable the Actions-based deploy steps to avoid duplicates.
  - Vercel will auto-deploy PRs (Preview) and `main` (Production).

## Bun vs npm in CI
This repo prefers Bun locally. You may continue using `npm ci && npm run build` in CI for consistency, or switch to Bun:

```yaml
- uses: oven-sh/setup-bun@v2
  with:
    bun-version: '1.x'
- run: bun install --frozen-lockfile
- run: bun run build
```

Ensure the same tool is used across lint/test/build steps for reproducible builds.

## Environment variables in Vercel
Set required env vars in Vercel for both environments:

```bash
# Preview environment
vercel env add NEXT_PUBLIC_... preview
vercel env add DATABASE_URL preview
# Production environment
vercel env add NEXT_PUBLIC_... production
vercel env add DATABASE_URL production
```
Or use the Vercel dashboard: Project → Settings → Environment Variables. Keep secrets out of the repo.

## Verification checklist
- Open a PR to `main` → Preview URL appears in PR checks and comment.
- Merge to `main` → Production deploy finishes and site updates.
- All required checks green before merging to `main`.
- Domain(s) configured in Vercel for Production.

## Troubleshooting
- Push Protection blocks pushes:
  - Rotate leaked key(s), remove from git history (BFG or `git filter-repo`), force-push a cleanup branch, then merge.
- Conversation resolution not enabled:
  - Toggle manually in Settings → Branches → `main` (may not be available via API for some repos/plans).
- Duplicate deploys:
  - Ensure only one deploy path is active (Actions or Vercel Git).
- Missing preview URLs:
  - Confirm `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` secrets exist.
  - Check workflow logs for `amondnet/vercel-action` steps and Vercel project permissions.

