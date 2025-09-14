# PR D: Auth UI with shadcn/ui

## Overview
Rebuilds Login/Register forms with shadcn/ui components while keeping Supabase auth logic intact.

## Scope
- Replace forms on `/auth/login` and `/auth/register`.
- Add proper validation, disabled/loading states, and error presentation.

## Changes (planned)
- Use shadcn `Input`, `Button`, `Form`, `Toast` for feedback.
- Optional: `react-hook-form` + `zod` for tight validation.

## Risks & Compatibility
- Ensure redirects/session handling unchanged.
- Don’t regress accessibility (labels, errors, focus).

## Testing
- Happy path and failure states for login/register.
- Preview green and manual smoke.

## Rollback
- Restore previous form components/markup.

## GitHub Status Commands
```bash
REPO=stevie86/hostelpulse
gh pr list --repo "$REPO" --state all --search '"Auth UI" in:title'
PR=NN
gh pr view $PR --repo "$REPO" --json title,headRefName,baseRefName,state,url,statusCheckRollup | jq '.'
SHA=$(gh pr view $PR --repo "$REPO" --json headRefOid -q .headRefOid)
gh api repos/$REPO/commits/$SHA/status | jq '.'
```

