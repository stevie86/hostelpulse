# HostelPulse Tech Stack

## Overview
HostelPulse is built on a modern, type-safe, full-stack web architecture designed for performance, scalability, and ease of maintenance.

## 1. Core Frameworks & Languages
- **Framework:** Next.js 16.1 (App Router)
- **Language:** TypeScript 5 (Strict Mode)
- **Runtime:** Node.js 20.x

## 2. Frontend & UI
- **Library:** React 19
- **Styling:**
  - Tailwind CSS 3.4
  - DaisyUI 5 (Component Library)
  - `tailwindcss-animate`
- **Icons:** Lucide React
- **Motion:** Framer Motion 12
- **Forms:** React Hook Form + Zod Resolution
- **UI Components:** Radix UI Primitives (Select, Popover, Label, Slot)

## 3. Backend & Database
- **Database:** PostgreSQL
- **ORM:** Prisma 5.22
- **Authentication:** NextAuth.js 5.0 (Beta) / Auth.js
  - Prisma Adapter
  - Credential & Provider Support
- **Utilities:**
  - `date-fns` / `date-fns-tz` for timezone handling
  - `bcryptjs` for hashing
  - `papaparse` for CSV handling

## 4. API & Data Access
- **Server Actions:** Primary method for mutations (located in `app/actions/`)
  - `auth.ts`, `availability.ts`, `bookings.ts`, `dashboard.ts`, `guests.ts`, `import.ts`, `rooms.ts`, `user.ts`
- **API Routes:** Legacy/External access points (located in `app/api/`)
  - `/api/auth/[...nextauth]`
  - `/api/export`
  - `/api/health`

## 5. Testing Strategy
- **Unit/Integration Testing:** Jest + React Testing Library
  - Configured in `jest.config.js`
  - Tests located in `__tests__/`
- **E2E Testing:** Playwright
  - Configured in `playwright.config.ts`
  - Headless Chromium
  - Tests located in `tests/e2e/`

## 6. Deployment & CI/CD
- **Platform:** Vercel (recommended for Next.js) or Docker-compatible hosts
- **CI/CD:** GitHub Actions
  - Workflow: `.github/workflows/ci.yml` (runs tests & linting)
- **Package Manager:** pnpm (version 10.x)

## 7. Security Measures
- **Authentication:** Secure session handling via NextAuth.js
- **Validation:** Zod schemas for all inputs (API & Forms)
- **Type Safety:** Strict TypeScript configuration prevents common runtime errors
- **Database:** Prisma injection protection
- **Environment:** strict `.env` management (verified by `zod` in some patterns)

## 8. Performance
- **Rendering:** Server-Side Rendering (SSR) & React Server Components (RSC)
- **Optimization:** Next.js Image Optimization & Font Optimization
- **Caching:** Next.js App Router caching mechanisms
