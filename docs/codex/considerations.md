# Considerations and Reasoning

This document summarizes key decisions, trade‑offs, and safety considerations taken or proposed while tightening deployments, securing branches, and improving project reliability.

## Branching & History
- Default branch rename (master → main)
  - Reasoning: Aligns with ecosystem defaults and existing workflows referencing `main`.
  - Risk: Breaking default branch references in tools/CI. Mitigation: updated workflows; verified protection rules.
- Push Protection finding (Linear key in history)
  - Reasoning: Historical leak blocks pushes and poses risk. We created `clean/main` with the file purged.
  - Alternatives: `git filter-repo` (preferred, faster) vs `git filter-branch` (used here due to availability).
  - Safety: Do not merge `clean/main` via PR; use force‑update of `main` or switch default to `clean/main`, then retire old history.
- .gitignore for `.kilocode/mcp.json`
  - Reasoning: Prevents re‑introducing local MCP config/secrets.

## CI/CD & Deployments
- PR Preview deploys via GitHub Actions
  - Reasoning: Consistent, reproducible builds; explicit required checks before merge.
  - Alternative: Vercel Git Integration. Choose one path to avoid duplicate deploys.
- Required checks and gates
  - Reasoning: Protect `main` with tests, security, performance, and preview deploy checks; require at least one review and linear history.
  - Safety: Add “Require conversation resolution” (manual toggle) to prevent merging with unresolved threads.
- Secrets
  - Reasoning: Store `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` as GitHub repo secrets; keep env separation (Preview vs Production).
  - Safety: Add gitleaks scanning in CI; rotate leaked keys promptly; avoid secrets in example files.

## Test Strategy
- Runner choice: Jest vs Bun
  - Reasoning: Current tests mix Jest APIs with Bun’s runner. Pick one to stabilize (Jest recommended for RTL ecosystem).
  - Safety: Avoid partial migrations; ensure all tests run under the chosen runner before enforcing checks.
- Coverage improvements
  - Reasoning: Added low‑effort unit tests (env, i18n, mock data) to increase coverage with minimal risk.

## Dependencies & Tooling
- Single tool path in CI
  - Reasoning: Choose Bun or npm in CI for reproducibility; avoid divergent lockfiles.
  - Safety: Cache installs and builds; pin critical versions if regressions occur.
- Husky v10 + lint‑staged
  - Reasoning: Faster feedback on staged files; remove deprecated Husky shim lines.

## Security & Headers
- Security headers (CSP, HSTS, frame‑ancestors)
  - Reasoning: Reduce XSS/clickjacking risk; align with best practices.
  - Safety: Roll out CSP in report‑only mode first to collect violations before enforcing.
- Rate limiting & input validation
  - Reasoning: Throttle abusive traffic; Zod at API boundaries prevents schema drift and injection.

## Observability
- Sentry or OpenTelemetry
  - Reasoning: Trace errors and latency; improve MTTR.
  - Safety: Redact PII; sample rates to control cost; document dashboards and alerts.

## Performance & Migration
- Next.js upgrade plan (12 → 13/14)
  - Reasoning: Security/maintenance and performance benefits; better tooling.
  - Safety: Incremental migration; start with Pages Router and evaluate App Router later; validate build artifacts.
- Perceived performance
  - Reasoning: Prefetch routes, cache reads with React Query, lazy‑load heavy components; improves UX without risking correctness.

## Governance & Collaboration
- CODEOWNERS and review policy
  - Reasoning: Clear ownership; ensures knowledgeable reviews for sensitive areas.
  - Safety: Pair with branch protections and required checks to avoid bypasses.
- Documentation updates
  - Reasoning: README, CI/CD guides, and memory bank entries reduce onboarding friction and prevent regressions after changes.

## Rollback & Recovery
- Deployment rollback
  - Reasoning: Keep simple rollback instructions (redeploy previous Vercel build or revert commit) documented.
  - Safety: Ensure migrations are backward‑compatible or include down migrations; stage risky releases with feature flags/canaries.

