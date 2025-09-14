# PR E: Dashboard with shadcn/ui Components

## Overview
Ports dashboard cards/lists/skeletons to shadcn/ui components with mobile-first polish, without changing data flows.

## Scope
- Replace the visual layer of `/dashboard` (cards, badges, lists).
- Keep existing fetch and state logic intact.

## Changes (planned)
- Use shadcn `Card`, `Badge`, `Skeleton`, `Table` where applicable.
- Improve touch target sizes (≥44px) and responsive spacing.

## Risks & Compatibility
- Ensure no change to API contracts; UI-only change.

## Testing
- Visual regression check; empty/loading/error states.
- Mobile viewport checks.

## Rollback
- Restore current styled-components dashboard markup.

## GitHub Status Commands
```bash
REPO=stevie86/hostelpulse
gh pr list --repo "$REPO" --state all --search '"Dashboard" in:title'
PR=NN
gh pr view $PR --repo "$REPO" --json title,headRefName,baseRefName,state,url,statusCheckRollup | jq '.'
SHA=$(gh pr view $PR --repo "$REPO" --json headRefOid -q .headRefOid)
gh api repos/$REPO/commits/$SHA/status | jq '.'
```

