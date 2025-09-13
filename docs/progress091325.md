# Progress Update — 2025‑09‑13

## Overview
We refocused the repo toward a secure, shippable MVP with green previews and a clear path to a mobile‑first UI. Work was split into small, reviewable PRs, with CI noise reduced and Vercel configured to avoid unnecessary builds.

## What Changed
- Build stability
  - Fixed Next/TS error by typing `BasicCardProps` and cleaning the Home Features list.
  - Added `type-check` script; improved quality‑gate behavior on PRs.
- Security P0 (low‑risk layer)
  - Added `lib/apiAuth.ts` with `REQUIRE_API_AUTH` gate and anon+JWT path for RLS.
  - Kept admin token fallback (`x-admin-token`) for CI/emergency.
  - Hardened Next/Image SVG handling for Preview (local icons only).
- Developer experience
  - Husky hooks made fast and resilient (lint‑staged on commit; tests run only if Jest exists locally).
  - Added `vercel.json` to skip docs/CI‑only preview builds.
- UI scaffold (mobile‑first)
  - New pages: `/auth/login`, `/auth/register`, `/auth/reset-password`, `/help` (styled‑components, non‑breaking).
  - Addressed PR feedback: render submit buttons as real buttons (`as="button"`).
- Docs & planning
  - AGENTS.md (Contributor guide), Dev↔Preview parity guide, Rooms & Beds sprint plan.
  - Opened tracking issue for Vercel/GitHub housekeeping and env gates.

## Open PRs
- #18 Green PR: Build fix + lenient quality gate for PRs
- #19 Security P0 Mini: Optional API Auth + SVG hardening
- #20 Docs: Rooms & Beds Sprint Plan
- #21 DevX: Fast Husky Hooks + lint‑staged
- #22 UI Scaffold: Mobile‑first Auth Pages + Help (button fix applied)
- #23 Vercel: Ignore docs‑only builds + Dev↔Preview parity guide

## Next Steps
- Merge order: 18 → 19 → 22 → 23 → 20/21.
- Add Vercel Preview envs: `ADMIN_API_TOKEN`, `ALLOWED_ORIGINS`, `REQUIRE_API_AUTH=0` (flip to 1 after Auth UI ships).
- Scaffold Tailwind + shadcn/ui (non‑breaking), then App Shell (Header + Sheet sidebar + Dashboard cards).
- After Auth UI lands, enable `REQUIRE_API_AUTH=1` on Preview and proceed with RLS policies.
