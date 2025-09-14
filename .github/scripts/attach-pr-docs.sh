#!/usr/bin/env bash
set -euo pipefail

BRANCH_REF=${GITHUB_REF_NAME:-$(git rev-parse --abbrev-ref HEAD)}
ROOT_DIR=$(git rev-parse --show-toplevel)
cd "$ROOT_DIR"

pending_dir="docs/prs/pending"
attached_dir="docs/prs/attached"

mkdir -p "$attached_dir"

changed=0

have_file() { [ -f "$1" ]; }
have_dir() { [ -d "$1" ]; }
grep_file() { grep -RqsE "$1" ${2:-.}; }

# PR A: Next14/React18
if have_file package.json && ( grep_file '"react"\s*:\s*"?18' package.json || grep_file '"next"\s*:\s*"?1[4-9]' package.json ); then
  if [ -f "$pending_dir/pr-a-next14-react18.md" ] && [ ! -f "$attached_dir/pr-a-next14-react18.md" ]; then
    cp "$pending_dir/pr-a-next14-react18.md" "$attached_dir/pr-a-next14-react18.md"
    echo "\n\n> Auto-attached on branch: $BRANCH_REF" >> "$attached_dir/pr-a-next14-react18.md"
    changed=1
  fi
fi

# PR B: Tailwind + shadcn/ui scaffold
if have_file tailwind.config.js || have_file postcss.config.js || have_file components.json || have_dir components/ui; then
  if [ -f "$pending_dir/pr-b-tailwind-shadcn-scaffold.md" ] && [ ! -f "$attached_dir/pr-b-tailwind-shadcn-scaffold.md" ]; then
    cp "$pending_dir/pr-b-tailwind-shadcn-scaffold.md" "$attached_dir/pr-b-tailwind-shadcn-scaffold.md"
    echo "\n\n> Auto-attached on branch: $BRANCH_REF" >> "$attached_dir/pr-b-tailwind-shadcn-scaffold.md"
    changed=1
  fi
fi

# PR C: App Shell
if have_dir components/app-shell || grep -Rqs "AppShell" components pages; then
  if [ -f "$pending_dir/pr-c-app-shell.md" ] && [ ! -f "$attached_dir/pr-c-app-shell.md" ]; then
    cp "$pending_dir/pr-c-app-shell.md" "$attached_dir/pr-c-app-shell.md"
    echo "\n\n> Auto-attached on branch: $BRANCH_REF" >> "$attached_dir/pr-c-app-shell.md"
    changed=1
  fi
fi

# PR D: Auth UI with shadcn
if grep -Rqs "components/ui" pages/auth 2>/dev/null; then
  if [ -f "$pending_dir/pr-d-auth-ui-shadcn.md" ] && [ ! -f "$attached_dir/pr-d-auth-ui-shadcn.md" ]; then
    cp "$pending_dir/pr-d-auth-ui-shadcn.md" "$attached_dir/pr-d-auth-ui-shadcn.md"
    echo "\n\n> Auto-attached on branch: $BRANCH_REF" >> "$attached_dir/pr-d-auth-ui-shadcn.md"
    changed=1
  fi
fi

# PR E: Dashboard with shadcn
if grep -Rqs "components/ui" pages/dashboard.tsx 2>/dev/null; then
  if [ -f "$pending_dir/pr-e-dashboard-shadcn.md" ] && [ ! -f "$attached_dir/pr-e-dashboard-shadcn.md" ]; then
    cp "$pending_dir/pr-e-dashboard-shadcn.md" "$attached_dir/pr-e-dashboard-shadcn.md"
    echo "\n\n> Auto-attached on branch: $BRANCH_REF" >> "$attached_dir/pr-e-dashboard-shadcn.md"
    changed=1
  fi
fi

# PR F: Guests/Bookings migration to shadcn
if grep -Rqs "components/ui" pages/guests.tsx pages/bookings.tsx 2>/dev/null; then
  if [ -f "$pending_dir/pr-f-guests-bookings-shadcn.md" ] && [ ! -f "$attached_dir/pr-f-guests-bookings-shadcn.md" ]; then
    cp "$pending_dir/pr-f-guests-bookings-shadcn.md" "$attached_dir/pr-f-guests-bookings-shadcn.md"
    echo "\n\n> Auto-attached on branch: $BRANCH_REF" >> "$attached_dir/pr-f-guests-bookings-shadcn.md"
    changed=1
  fi
fi

# PR G: Branding/Theme
if have_file tailwind.config.js && grep_file "theme:\s*{" tailwind.config.js; then
  if [ -f "$pending_dir/pr-g-branding-theme.md" ] && [ ! -f "$attached_dir/pr-g-branding-theme.md" ]; then
    cp "$pending_dir/pr-g-branding-theme.md" "$attached_dir/pr-g-branding-theme.md"
    echo "\n\n> Auto-attached on branch: $BRANCH_REF" >> "$attached_dir/pr-g-branding-theme.md"
    changed=1
  fi
fi

if [ "$changed" -eq 1 ]; then
  git add "$attached_dir"
  git -c user.name="auto-pr-docs" -c user.email="actions@users.noreply.github.com" \
    commit -m "docs(pr): auto-attach relevant PR docs for branch $BRANCH_REF"
else
  echo "No PR docs matched for auto-attach on branch $BRANCH_REF"
fi

