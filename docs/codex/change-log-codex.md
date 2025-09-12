# Codex Change Log (Automated Work Summary)

This log documents branches, commits, PRs, and operational actions performed to tighten deployments, improve governance, and set up the MVP sprint.

## Branches Created
- clean/main — cleaned history to remove `.kilocode/mcp.json` (see docs/codex/history-cleanup-report.md). Pushed to origin.
- docs/codex-updates-clean — batched documentation updates from clean history.
- ci/vercel-preview-clean — Vercel PR Preview workflow and CodeQL target updates.
- test/codecoverage-clean — added low-effort tests to raise coverage.
- codex-mvp — sprint plan for Owner Room Management + Guest Frontend MVP.
- codecoverage — local coverage experiments (superseded by test/codecoverage-clean).
- codex-docs-update — earlier docs PR branch (#7).

## Commits (by branch)

### docs/codex-updates-clean
- 2f7905c — docs: add codex considerations, deployment issues, CI/CD guide, and usability/stability recommendations; ignore mcp.json
  - Files: docs/codex/considerations.md, docs/codex/deployment-setup-issues.md, docs/codex/usability-stability-recommendations.md, docs/ci-cd-vercel-setup.md, .gitignore

### ci/vercel-preview-clean
- 6dbf4fe — ci(vercel): add PR preview deploy workflow; update CodeQL to main
  - Files: .github/workflows/vercel-deploy.yml (new), .github/workflows/codeql-analysis.yml (updated)

### test/codecoverage-clean
- 7ed4264 — test(coverage): add basic env/i18n/mock-data tests
  - Files: __tests__/i18n.test.ts, __tests__/env.test.ts, lib/__tests__/mock-room-data.test.ts

### codex-mvp
- 92a617f — docs(sprint): add MVP plan for owner room management and guest frontend with coverage and CI goals
  - File: sprints/codex-mvp-sprint.md

### codecoverage (experimental local)
- a684070 — test(coverage): add unit tests and include lib, env, i18n in coverage
- c6ffec9 — docs: add usability and stability recommendations

### codex-docs-update (earlier PR branch)
- c6ffec9 — docs: add usability and stability recommendations (PR #7)

## Pull Requests
- #6 — chore(ci): verify PR preview deploys (created earlier to validate PR-based previews)
- #7 — docs: usability & stability recommendations; ignore .kilocode/mcp.json
- New branches pushed and ready for PRs:
  - docs/codex-updates-clean → open PR to main
  - ci/vercel-preview-clean → open PR to main
  - test/codecoverage-clean → open PR to main
  - codex-mvp → open PR to main

## Operational Actions (no code commits)
- Branch protection applied to main/master (now main):
  - Required status checks (tests, integration, security, performance, Vercel preview) and 1 review, linear history, no force-push/delete.
  - Note: “Require conversation resolution” must be toggled manually in GitHub settings.
- Vercel secrets configured via gh:
  - VERCEL_ORG_ID, VERCEL_PROJECT_ID set from .vercel/project.json.
  - VERCEL_TOKEN added by repo owner.
- History cleanup:
  - Removed `.kilocode/mcp.json` from history; see docs/codex/history-cleanup-report.md.
  - Added `.kilocode/mcp.json` to .gitignore.

## References
- Workflows: .github/workflows/vercel-deploy.yml, .github/workflows/codeql-analysis.yml
- Docs: docs/codex/considerations.md, docs/codex/deployment-setup-issues.md, docs/codex/usability-stability-recommendations.md, docs/ci-cd-vercel-setup.md, sprints/codex-mvp-sprint.md, docs/codex/history-cleanup-report.md
- Tests: __tests__/i18n.test.ts, __tests__/env.test.ts, lib/__tests__/mock-room-data.test.ts

## Notes
- Some commits were created via the GitHub API on remote branches; local logs may not include those SHAs unless the branch is checked out.
- To finalize history cleanup, either force-update `main` from `clean/main` or make `clean/main` the default branch and deprecate the old `main`.

## Recommended Next Steps (Clean, Protected, Deployable)

1) Finalize history cleanup and default branch
- Switch default branch to `clean/main` in GitHub Settings → Branches, or force-update `main` from `clean/main`:
  - `git fetch origin && git checkout clean/main && git push origin +clean/main:main`
- Retarget open PRs to the new default, then delete the old `main` and `master` to avoid confusion.

2) Reapply and verify branch protection on the default branch
- Require status checks before merging (set as required):
  - Lint, Typecheck, Unit/Integration tests, Coverage threshold, Vercel Preview Deploy
- Require at least 1 approving review and dismiss stale reviews.
- Enforce linear history; disallow force pushes and deletions.
- Enable “Require conversation resolution”.

3) Merge CI branches and ensure deploys depend on successful builds
- Open/merge PRs for:
  - `ci/vercel-preview-clean` (Vercel PR previews)
  - `test/codecoverage-clean` (baseline tests)
  - `docs/codex-updates-clean` (documentation)
- In GitHub Actions, make deploy jobs depend on build/tests and fail on build failure:

```yaml
name: Vercel Production Deploy
on:
  push:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run build   # if this fails, job fails

  deploy:
    runs-on: ubuntu-latest
    needs: build            # ensures deploy does not run if build fails
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

- For PR previews, keep deploy in the same job after the build steps (current workflow), or split as above with `needs: build`.

4) Secrets and environment configuration
- Confirm repo secrets exist: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- In Vercel, add Preview and Production env vars (NEXT_PUBLIC_*, DATABASE_URL if applicable).

5) Testing and coverage enforcement
- Pick a single test runner for React tests (Jest recommended) or adapt tests to Bun consistently.
- Add coverage thresholds to Jest (e.g., lines/branches/functions: 95) and fail CI when under threshold.
- Add a tiny Playwright smoke suite that runs on PR against the Preview URL (optional at MVP stage).

6) Security hygiene
- Add gitleaks to CI and a pre-push hook to prevent secret commits.
- Keep `.kilocode/mcp.json` in `.gitignore`; rotate any previously leaked keys.

7) Documentation and governance
- Merge docs PR; add README links to the CI/CD guide and MVP sprint plan.
- Add CODEOWNERS and ensure required-review policy aligns with owners.
