# Project Charter: Operation Bedrock
**Mission:** Rebuild HostelPulse into a world-class, high-stability SaaS platform.

## 1. Context
The original HostelPulse (v1) successfully validated the market but accumulated significant technical debt (Pages Router, mixed styling patterns, legacy Agno integration issues). 

**Operation Bedrock** is the mandate to rebuild the core on a "clean slate" to ensure the project can scale to thousands of properties without architectural collapse.

## 2. Core Objectives
- **Extreme Stability:** 100% CI/CD pass rate. No merging without automated tests.
- **Modern Stack:** Full adoption of Next.js 15 App Router and React 19.
- **Type Safety:** Eliminate `any` and "guesswork" coding.
- **Scalability:** Built from day one as a multi-tenant system (Users -> Teams -> Properties).

## 3. Success Metrics (MVP)
- A manager can log in, create a property, and add a room.
- A guest can be imported via CSV or created manually.
- A booking can be created with real-time bed availability checks.
- Zero known UI bugs on the core "Happy Path."

## 4. Guiding Mantra
*"Build it right, or don't build it yet."* We prioritize architectural integrity over feature count.
