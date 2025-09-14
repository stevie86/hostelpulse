# PR G: Branding & Theme (Design Tokens)

## Overview
Introduces branding updates as a design-only PR: color palette, typography scale, radius, spacing tokens, and asset updates.

## Scope
- Tailwind theme tokens; map to shadcn tokens.
- Update logo/assets; no functional code changes.
- Dark mode pass.

## Changes (planned)
- `tailwind.config.js` theme extension; CSS vars if needed.
- Replace legacy color literals with tokens where touched.

## Risks & Compatibility
- Ensure sufficient contrast and a11y.
- Avoid changing component APIs.

## Testing
- Visual sweep across main routes; light/dark mode.

## Rollback
- Revert theme changes and assets to prior versions.

## GitHub Status Commands
```bash
REPO=stevie86/hostelpulse
gh pr list --repo "$REPO" --state all --search '"Branding" in:title'
PR=NN
gh pr view $PR --repo "$REPO" --json title,headRefName,baseRefName,state,url,statusCheckRollup | jq '.'
SHA=$(gh pr view $PR --repo "$REPO" --json headRefOid -q .headRefOid)
gh api repos/$REPO/commits/$SHA/status | jq '.'
```

