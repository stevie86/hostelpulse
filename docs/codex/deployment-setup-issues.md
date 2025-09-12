# Deployment Setup Issues and Resolutions

This note documents the issues encountered while tightening auto-deployments, protecting the default branch, and enabling PR-based Vercel previews.

## Summary of Changes Implemented
- Renamed default branch to `main` and applied branch protection (required checks, 1 review, linear history, no force-push/delete).
- Added PR Preview deploy workflow: `.github/workflows/vercel-deploy.yml` triggers on `pull_request` to `main` and deploys Preview (no `--prod`).
- Updated CodeQL workflow to target `main` instead of `master`.
- Synced Vercel IDs into repo secrets via `gh secret set` from `.vercel/project.json`:
  - `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (user confirmed `VERCEL_TOKEN` is set).
- Opened a draft PR to validate the flow: https://github.com/stevie86/hostelpulse/pull/6

## Issues Encountered

### 1) Push Protection Blocked New Branch Push
- Symptom: `git push` rejected with “Repository rule violations … Push cannot contain secrets”.
- Detail: Secret scanning flagged a Linear API Key in `.kilocode/mcp.json` in historical commit `461c6d1...`.
- Impact: Couldn’t push a local branch containing docs/memory-bank updates.
- Workaround used: Created branch and PR via GitHub API (`gh api`) and updated workflows remotely. Memory bank/README changes were committed locally and later synced via API where possible.
- Recommended fix:
  - Rotate the affected Linear API key in Linear.
  - Remove the secret from history (BFG or `git filter-repo`) and force-push a cleaned branch (not `main`), then merge via PR.
  - Optionally, use GitHub’s unblock link temporarily, but only after the key has been rotated.

### 2) “Require conversation resolution” API 404
- Symptom: `gh api` call to `.../protection/required_conversation_resolution` returned 404.
- Likely cause: Insufficient permissions for this repo/plan or endpoint availability constraints.
- Status: Not enabled via API.
- Next step: Enable manually in GitHub → Settings → Branches → `main` → “Require conversation resolution”.

### 3) Default Branch Was `master`
- Finding: Repo default branch was `master` (not `main`). Initial protection attempt failed with 404 for `main`.
- Resolution: Created `main` from `master` and set it as default; updated workflows to target `main`.
- Cleanup suggestion: Once stable, delete `master` (`git push origin --delete master`).

### 4) Duplicate/Prod Deploy Risk in Vercel Workflow
- Finding: Existing Vercel workflow used `--prod` and triggered on `push` and `pull_request` to various branches.
- Change: Restricted workflow to `pull_request` → `main` and removed `--prod` so PRs produce Preview deployments only. Production deploys remain governed by the Test-First CI/CD workflow.

### 5) Remote File Update Nuances with `gh api`
- Symptom: Various content update attempts hit 404/409 or payload format errors.
- Cause: Using the Contents API requires per-file SHA updates/creates; Git Data API requires correct JSON structures and boolean types.
- Resolution: Used a minimal Git Data flow to update the PR branch where needed; validated with subsequent API calls.

## Current State Checklist
- [x] Default branch is `main` and protected with required checks.
- [x] PRs to `main` trigger Vercel Preview deployments.
- [x] `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` set; `VERCEL_TOKEN` set by user.
- [ ] “Require conversation resolution” enabled (manual toggle pending).
- [ ] Linear API key rotated and history cleaned (recommended).

## Follow-ups
- Manually enable “Require conversation resolution”.
- Rotate and purge the leaked Linear key from history, then merge a cleanup PR.
- After stabilization, delete `master` to avoid confusion.
- Optionally add a README badge or PR template step reminding contributors that previews are auto-provisioned on PRs to `main`.

