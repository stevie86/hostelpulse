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
