# HostelPulse - System Architecture & Engineering Standards
**Project State:** Operation Bedrock (Next.js 15 Clean Slate)
**Last Updated:** December 20, 2025

## 1. Core Technology Stack
| Layer | Technology | Version | Notes |
| :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | v20.x | Managed via `mise` |
| **Framework** | Next.js | 15.1.x (App Router) | Utilizing React 19 (RC/Stable) |
| **Language** | TypeScript | 5.x | Strict Mode Enabled |
| **Database** | PostgreSQL | v15+ | Hosted on Vercel/Supabase |
| **ORM** | Prisma | 5.22.0 | Type-safe schema & migrations |
| **Auth** | NextAuth.js | 5.0.0-beta.x | Auth.js v5 |
| **Styling** | Tailwind CSS | 3.4.x | Utility-first + DaisyUI v5 |
| **Package Mgr**| pnpm | 10.x | Strictly enforced via `mise` |

## 2. System Architecture
HostelPulse is built as a multi-tenant SaaS application where each **User** belongs to a **Team**, and each Team manages one or more **Properties**.

### Data Flow
1. **Request Entry:** Handled by `middleware.ts` (or `proxy.ts`) for session validation and locale detection.
2. **Routing:** Next.js App Router (File-based).
3. **Logic Layer:** 
   - **Server Actions:** Primary method for mutations (Bookings, Room updates).
   - **Server Components:** Default for data fetching to minimize client-side JS.
4. **Database:** Prisma Client acts as the type-safe bridge to PostgreSQL.

## 3. Directory Standards
- `/app`: Routing and layout logic.
- `/app/actions`: Domain-specific Server Actions (Business Logic).
- `/components/ui`: Atomic, reusable UI elements (Shadcn-style).
- `/components/[feature]`: Feature-specific complex components.
- `/lib`: Shared utilities, database singleton, and shared schemas.
- `/types`: Global TypeScript definitions and NextAuth extensions.

## 4. Coding Principles (The Bedrock Manifesto)
1. **Zero `any` Tolerance:** Everything must be typed. Use generics or `unknown` with type guards if necessary.
2. **Server-First:** Prefer Server Components and Server Actions over client-side `useEffect` and API routes.
3. **Schema-Driven Development:** All forms and mutations must use **Zod** schemas for validation.
4. **Atomic Design:** Keep components small. If a component exceeds 150 lines, refactor sub-elements.
5. **No Technical Debt:** Fix linting and type errors immediately. Do not use `@ts-ignore` without a critical documented reason.
6. **Unified Management:** All shell commands must run through `mise exec -- pnpm` to ensure environment consistency.

## 5. Deployment & CI/CD
- **Platform:** Vercel (Next.js optimized).
- **Environment Variables:**
  - `AUTH_SECRET`: Used for session encryption.
  - `DATABASE_URL`: Connection string for Postgres.
  - `AUTH_TRUST_HOST`: Required for local/preview proxy stability.
- **Workflow:** Spec Kitty managed feature branches with mandatory lint/test passing before merge.

## 6. Testing Strategy
- **Unit (Jest):** Logic in `/app/actions` and `/lib`.
- **E2E (Playwright):** Critical user flows (Login -> Create Room -> Create Booking).
- **Manual:** Verified via Vercel Preview deployments.
