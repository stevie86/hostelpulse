# PR F: Migrate Guests & Bookings UI to shadcn/ui

## Overview
Ports Guests and Bookings pages to shadcn/ui (forms and lists) for a consistent design system without touching APIs.

## Scope
- `/guests`: create form + list -> shadcn `Form`, `Input`, `Button`, `Table`.
- `/bookings`: list view -> shadcn `Table`, `Badge`, `Skeleton` as needed.

## Changes (planned)
- Replace styled inputs/buttons with shadcn primitives.
- Keep fetch/update logic identical.

## Risks & Compatibility
- Ensure CSV import/export UX stays discoverable (if present on these pages later).

## Testing
- Create/update guest; bookings list renders with correct fields.
- Error/loading states.

## Rollback
- Restore current page components.

## GitHub Status Commands
```bash
REPO=stevie86/hostelpulse
gh pr list --repo "$REPO" --state all --search '"Guests & Bookings" in:title'
PR=NN
gh pr view $PR --repo "$REPO" --json title,headRefName,baseRefName,state,url,statusCheckRollup | jq '.'
SHA=$(gh pr view $PR --repo "$REPO" --json headRefOid -q .headRefOid)
gh api repos/$REPO/commits/$SHA/status | jq '.'
```

