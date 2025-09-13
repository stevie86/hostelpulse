# Git Repository Cleanup and Streamlining Guide (by Codex)

This guide proposes a pragmatic, low‑risk sequence to make the repo clean, consistent, and well‑documented while preserving useful history and enabling reliable CI/CD.

## Goals
- Single, trusted default branch with protected gates.
- Clean history without secrets; clear, minimal branch model.
- Reproducible CI/CD that deploys only after successful builds/tests.
- Concise documentation for contributors.

## 1) Default Branch and History
- Adopt `clean/main` as the canonical history (secret purged):
  - Option A (recommended): Switch default branch to `clean/main` in GitHub → Settings → Branches.
  - Option B: Force‑update `main` to match `clean/main`:
    - `git fetch origin && git checkout clean/main && git push origin +clean/main:main`
- Retarget any open PRs to the new default branch.
- Archive the previous state:
  - Tag pre‑clean history: `git tag archive/pre-cleanup <old-main-sha> && git push --tags`.
  - Delete stale `master`/old `main` after verifying PRs: `git push origin --delete master` (and old main if replaced).

## 2) Branch Protection
- Enable on the default branch:
  - Required checks: Lint, Typecheck (optional), Unit/Integration tests (with coverage threshold), Vercel Preview Deploy.
  - Require ≥1 approving review; dismiss stale reviews.
  - Enforce linear history; disallow force pushes and deletions.
  - Enable “Require conversation resolution”.
- Periodically review required checks as workflows evolve.

## 3) CI/CD Normalization
- Keep two workflows:
  - PR workflow: lint → typecheck → tests (coverage) → build → Preview deploy.
  - Main workflow: build/tests; deploy only if previous job succeeds (deploy `needs: build`).
- Remove duplicate or deprecated workflows to avoid double deploys.
- Cache installs/builds; use a single toolchain in CI (Bun or npm) for reproducibility.

## 4) Test Runner and Coverage
- Choose one runner (Jest recommended for RTL) and align tests accordingly (remove mixed Bun/Jest APIs).
- Add coverage thresholds in Jest (e.g., lines/branches/functions ≥95 for MVP modules).
- Start with unit tests for logic‑heavy paths; add a few integration tests for API routes and 1–2 component tests for forms.

## 5) Secrets and Scanning
- Keep sensitive files out of Git:
  - `.gitignore`: include `.kilocode/mcp.json` and other local config.
- Add gitleaks in CI and optionally a pre‑push hook.
- Rotate any previously leaked keys (e.g., Linear) and document rotation procedures in `/docs/security/secrets.md`.

## 6) Dependencies and Tooling
- Pick a single lockfile/tool in CI (Bun or npm) and enforce it.
- Remove unused deps (use `depcheck`) and pin critical versions that affect stability.
- Add/confirm `.editorconfig` and `.gitattributes` (LF endings) for consistent formatting and diffs.

## 7) Husky and lint‑staged
- Upgrade Husky to v10; remove deprecated shim lines.
- Add lint‑staged to format/lint changed files on commit for fast feedback.

## 8) Documentation and Governance
- Replace template README sections with project‑specific content (purpose, run, test, deploy, troubleshooting).
- Link to:
  - `docs/ci-cd-vercel-setup.md` — CI/CD guidance
  - `docs/codex/deployment-setup-issues.md` — known issues
  - `docs/codex/considerations.md` — decisions and trade‑offs
  - `sprints/codex-mvp-sprint.md` — MVP plan
- Add `CODEOWNERS`, issue/PR templates, and a brief `CONTRIBUTING.md`.

## 9) Branch Hygiene
- Use short‑lived, thematic branches (e.g., `ci/…`, `docs/…`, `feat/…`, `fix/…`).
- Squash‑merge PRs to keep linear history readable.
- Delete merged branches promptly.

## 10) Verification Checklist (after cleanup)
- Default branch set to `clean/main` (or `main` updated to it).
- Branch protection gates enabled; required checks enforced.
- PR → Preview deploy runs after build/tests; main deploy gated by successful build.
- Tests are green with a single runner and coverage threshold respected.
- README and docs reflect current workflows and setup.

## Appendix: Quick Commands
- Force‑update main to clean history (use with caution):
  - `git fetch origin && git checkout clean/main && git push origin +clean/main:main`
- Protect default branch via `gh` (example skeleton):
  - `gh api -X PUT repos/<owner>/<repo>/branches/<default>/protection --input protection.json`
- Set secrets (example):
  - `gh secret set VERCEL_TOKEN -b <token>`
  - `gh secret set VERCEL_ORG_ID -b <orgId>`
  - `gh secret set VERCEL_PROJECT_ID -b <projectId>`

---
Following these steps yields a tidy, safe repo: a single protected default branch, dependable CI/CD that never deploys broken builds, and documentation that onboards contributors quickly.
