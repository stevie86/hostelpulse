---
lane: done
---

# WP02: Document and automate setup (P1)

## Goal

Make Production env setup repeatable (and less error-prone) via documentation and optional automation.

## Checklist

- [x] Add a checklist doc for Vercel Production env vars and where to set them.
- [x] Include a quick verification procedure (expected behavior + common failure modes).
- [ ] (Optional) Add a scriptable flow (Vercel CLI/API) if the user provides required access (token/project info). *Deferred.*

## Deliverables

- [x] `/docs/VERCEL_DEPLOYMENT.md` - Comprehensive deployment guide with:
  - Required environment variables table
  - Step-by-step Vercel setup instructions
  - Database migration commands
  - Troubleshooting section
  - Pre-deployment checklist

