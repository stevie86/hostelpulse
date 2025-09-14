# PR C: App Shell with shadcn/ui (Header + Sidebar)

## Overview
Introduces a shared App Shell using shadcn/ui (Header + Sheet/Sidebar) while preserving current routes and content.

## Scope
- Replace Navbar/Drawer internals with shadcn primitives.
- Keep route structure and pages; no feature changes.

## Changes (planned)
- Create `components/app-shell/*` with Header, Sidebar, Layout.
- Wrap app pages in AppShell; ensure mobile sidebar works.

## Risks & Compatibility
- Navigation focus states and a11y; verify keyboard/screen-reader behavior.
- Theming alignment with existing styles.

## Testing
- Keyboard nav, mobile drawer, route transitions.
- Visual check on `/dashboard`, `/guests`, `/bookings`, `/rooms`.

## Rollback
- Revert AppShell usage; restore Navbar/Drawer components.

## GitHub Status Commands
```bash
REPO=stevie86/hostelpulse
gh pr list --repo "$REPO" --state all --search '"App Shell" in:title'
PR=NN
gh pr view $PR --repo "$REPO" --json title,headRefName,baseRefName,state,url,statusCheckRollup | jq '.'
SHA=$(gh pr view $PR --repo "$REPO" --json headRefOid -q .headRefOid)
gh api repos/$REPO/commits/$SHA/status | jq '.'
```

