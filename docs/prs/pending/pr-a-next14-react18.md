# PR A: Upgrade to React 18 + Next 14 (Node 22)

## Overview
Upgrades the framework to React 18 and Next.js 14, aligning with Vercel’s Node 22 requirement and preparing for shadcn/ui and Tailwind adoption.

## Scope
- Bump `next`, `react`, `react-dom`, types, and Next ESLint plugins.
- Keep pages router for now; no route restructuring.
- Verify styled-components SWC compiler option (already enabled).
- Ensure builds and previews remain green.

## Changes (planned)
- package.json: upgrade deps; ensure `engines.node: 22.x` (already set).
- Update imports to `next/app` where needed; remove legacy Next 12 flags.
- Minimal code fixes for React 18/Next 14 warnings.

## Risks & Compatibility
- Potential typing changes from Next types; verify `_app`, `_document`, API types.
- Next ESLint rules may surface; build keeps ESLint ignored to protect previews.

## Testing
- Local: `npm run build && npm start` smoke test.
- Preview: Vercel green check; verify key routes load: `/`, `/dashboard`, `/guests`, `/bookings`, `/rooms`.

## Rollback
- Revert the upgrade commit; restore previous lockfile.

## GitHub Status Commands
```bash
REPO=stevie86/hostelpulse

# Find the PR by title
gh pr list --repo "$REPO" --state all --search '"React 18 + Next 14" in:title'

# Once you know the PR number
PR=NN
gh pr view $PR --repo "$REPO" --json title,headRefName,baseRefName,state,url,statusCheckRollup | jq '.'

# Check head commit statuses
SHA=$(gh pr view $PR --repo "$REPO" --json headRefOid -q .headRefOid)
gh api repos/$REPO/commits/$SHA/status | jq '.'
```

