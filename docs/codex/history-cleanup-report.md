# History Cleanup Report: .kilocode/mcp.json

This report documents the removal of a leaked secret path from git history and the creation of a cleaned branch.

## Background
- GitHub Push Protection flagged a Linear API key within `.kilocode/mcp.json` (commit `461c6d1...`).
- The file is now ignored via `.gitignore` to prevent future commits.

## Actions Taken
1) Rewrote history on a new branch `clean/main` to remove the file from all commits in that branch:

```
# From origin/main
git checkout -B clean/main origin/main
FILTER_BRANCH_SQUELCH_WARNING=1 \
  git filter-branch --force \
  --index-filter "git rm -r --cached --ignore-unmatch .kilocode/mcp.json" \
  --prune-empty --tag-name-filter cat \
  -- clean/main
```

2) Verified the path is no longer present in commit history for `clean/main`.

3) Pushed `clean/main` to origin: `git push -u origin clean/main`.

## Next Steps (Owner Action)
- Rotate the affected Linear API key (if not already rotated).
- Switch default branch to `clean/main` in GitHub → Settings → Branches.
- Option A (fast-forward): Force-update `main` to the cleaned branch, if you prefer to retain the `main` name:

```
# Carefully confirm refs before running these commands
# On a local admin clone
git fetch origin
git checkout clean/main
# Replace main with cleaned history
git push origin +clean/main:main
```

- Option B (rename): Set `clean/main` as default, then delete old `main` after all open PRs are retargeted.

## Notes
- Tags were not rewritten. If any tag references the leaked file, consider rewriting those or deleting/recreating the tag(s).
- Do not merge `clean/main` into `main` with a PR — that preserves old history. Use the force-update approach or switch defaults.
- The `.gitignore` includes `.kilocode/mcp.json` to prevent reintroduction.

## Validation
- Confirm Push Protection allows pushes based on the new branch.
- CI passes on `clean/main` and Vercel preview deploys on PRs to the default branch.

