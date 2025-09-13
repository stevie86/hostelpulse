# Talking to Codex — Project Structure, Priorities, and Next Steps

This note captures guidance I (Codex) shared about how to structure work, what’s strong, what to change, and exactly what to ship next. It’s meant to keep focus and velocity high.

## What’s Strong
- Clear P0/P1/P2/P3 prioritization and a realistic roadmap.
- Owner‑focused copy and mobile readability improvements.
- “Preview‑first → Production readiness” with Vercel.
- Concrete sprint docs (e.g., Rooms & Dorms), suggested PRs, and a simple pricing model.

## Where It’s Getting Noisy
- Scope creep inside single PRs (security, UI, docs, badges in PR #17).
- CI is noisy and occasionally blocking with non‑essential checks.
- Branding changes overlapped with infra and feature work.
- Security still opt‑in; multi‑owner is the key blocker for paid use.

## What To Change
- Prefer small, single‑theme PRs
  - Keep PR #17 lean. Land a “CI stabilizer” PR on main. Then ship focused PRs: API security gate, dashboard polish, landing mobile, docs/FAQ, env badge.
  - Use a branding branch for design‑only changes to keep review simple.
- Lock the production blocker first (P1)
  - Supabase Auth + RLS + `REQUIRE_API_AUTH=1` in Preview. Unlocks safe multi‑owner pilots.
- Stabilize CI and branch protection
  - Required checks: build + Vercel Preview. Gate the rest later when tests exist.
  - Add minimal Jest wiring so “Run Tests” is meaningful but not blocking.
- Definition of Done per phase
  - Auth+RLS: Unauth 401; cross‑tenant blocked by RLS; smoke test with JWT.
  - UI polish: mobile hero sizes, features cards, dashboard stats/status chips, skeletons.
  - Docs: owner‑focused README, FAQ, pitch; updated implementation report.
- Tighten environment discipline
  - Separate Supabase projects (or schemas) for Preview and Prod.
  - Short post‑merge smoke for Prod; include rollback.
- Measure and learn
  - Lightweight logging (error counts) and a feedback button to capture early owner feedback.
  - Identify 3–5 pilot hostels; track a simple funnel: demo → CSV paste → day‑7 retained.

## Immediate Next Steps
1) Merge PR #17 after minimal fixes.
2) Open PR 0: CI stabilizer (skip Slack when unset; node 18; npm install).
3) Open PR 1: API security gate (opt‑in via `REQUIRE_API_AUTH`).
4) Open PR 2: Dashboard polish (stats/status/skeletons).
5) Open PR 3/4: Landing + home components (fluid type, dark‑mode badges).
6) Open PR 5: Docs/FAQ/Roadmap/Sprints (owner‑focused content).
7) Open PR 6: Env badge (Local/Preview).
8) Start PR 8 (Phase 1 Auth + RLS) as a dedicated epic.
9) In parallel: branding PR that carries only design files.

## Product Guardrails
- Weekly cadence: 1–2 focused PRs merged; 1 demo to a pilot; 1 doc update.
- Don’t mix: infra/branding/security/features in one PR.
- Use sprint docs as acceptance contracts; each sprint produces a short operator guide and smoke steps.

## Pricing (for docs/FAQ)
- €49/month or €39/month billed yearly (save €120/year). Annual: €468 upfront. Prices exclude VAT; EU VAT invoicing supported.
- 14‑day free trial. Founders’ offer available on request.

## Sales Readiness (Opinion)
- You can sell pilots now with “spreadsheet → console in 5 minutes” + white‑glove onboarding.
- To sell widely and charge confidently, ship Auth+RLS (P1) and the first integration milestone (P3 preview: import/dedupe), then collect 3–5 testimonials and publish results.

## Suggested PRs (Snapshot)
- PR 0 — CI stabilization (workflows; keep only essential checks required).
- PR 1 — API security gate (opt‑in `REQUIRE_API_AUTH`, CLI headers).
- PR 2 — Owner dashboard polish (stats/status/skeletons).
- PR 3 — Landing mobile readability (larger fluid type, simplified copy).
- PR 4 — Home components: fluid type + dark‑mode badges.
- PR 5 — Docs + FAQ + roadmap + sprints.
- PR 6 — Env badge (Local/Preview).
- PR 7 — Jest wiring (tests job green).
- PR 8 — Phase 1: Auth + RLS (epic, dedicated PR).

## Rooms & Dorms Sprint (Package Plan)
- One sprint to ship rooms, beds for dorms, assignment in bookings, availability guard, CSV import/export, RLS.
- Day 1: Schema + RLS + APIs. Day 2: UI + CSV + availability. Day 3: polish/tests/docs.
- Split PRs: migrations/APIs; UI; CSV+availability; docs+tests.

---

Keep momentum by landing small wins often, and protect focus by isolating big rocks (Auth+RLS, integrations) into dedicated PRs.
