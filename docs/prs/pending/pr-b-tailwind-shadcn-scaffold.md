# PR B: Tailwind + shadcn/ui Scaffold

## Overview
Adds Tailwind CSS and initializes shadcn/ui primitives to enable faster UI iteration without touching feature logic yet.

## Scope
- Tailwind: add `tailwind.config.js`, `postcss.config.js`, base styles, and import in `_app.tsx`.
- shadcn/ui: add config and generate core components: Button, Input, Card, Sheet (Drawer).
- No page rewrites in this PR.

## Changes (planned)
- Install Tailwind + PostCSS + Autoprefixer.
- Add shadcn CLI config; generate components into `components/ui/*`.
- Keep existing styled-components; both may coexist during transition.

## Risks & Compatibility
- CSS precedence: ensure Tailwind base doesn’t break legacy styles; scope via layers.
- Bundle size check; only minimal shadcn primitives.

## Testing
- Visual smoke on `/`, `/dashboard` to confirm no regressions.
- Ensure new primitives render in a sandbox page (non-linked).

## Rollback
- Remove Tailwind and shadcn config/dirs; revert package changes.

## GitHub Status Commands
```bash
REPO=stevie86/hostelpulse

# Find the PR by title
gh pr list --repo "$REPO" --state all --search '"Tailwind + shadcn/ui Scaffold" in:title'

# Once you know the PR number
PR=NN
gh pr view $PR --repo "$REPO" --json title,headRefName,baseRefName,state,url,statusCheckRollup | jq '.'

SHA=$(gh pr view $PR --repo "$REPO" --json headRefOid -q .headRefOid)
gh api repos/$REPO/commits/$SHA/status | jq '.'
```

