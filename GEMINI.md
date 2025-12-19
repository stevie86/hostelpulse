# HostelPulse - Project Context

## Project Overview
**HostelPulse** is a modern, SaaS-based Property Management System (PMS) for hostels. 
**Current State:** "Clean Slate" / "Operation Bedrock". The project has been reset to a minimal, stable Next.js 15 foundation to eliminate technical debt. Features are being re-added incrementally with a strict focus on stability and type safety.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (Strict mode, no `any` allowed)
- **Database:** PostgreSQL (via Prisma ORM)
- **Styling:** Tailwind CSS v3.4 + DaisyUI (Note: README says "no Tailwind", but it has been re-installed and configured).
- **Auth:** NextAuth.js v5 (Beta)
- **Testing:** Jest (Unit), Playwright (E2E)
- **Package Manager:** pnpm (preferred) or npm

## Key Commands
| Action | Command | Description |
| :--- | :--- | :--- |
| **Dev Server** | `npm run dev` | Starts local dev server at http://localhost:3000 |
| **Build** | `npm run build` | Production build |
| **Lint** | `npm run lint` | Runs ESLint |
| **Format** | `npm run format` | Runs Prettier |
| **Test (Unit)** | `npm run test` | Runs Jest tests |
| **Test (E2E)** | `npm run test:e2e` | Runs Playwright tests |
| **DB Push** | `npx prisma db push` | Pushes schema changes to DB (prototyping) |
| **DB Migrate** | `npm run db:migrate` | Creates migrations (production) |
| **DB Studio** | `npm run db:studio` | GUI for viewing database data |

## Project Structure
```text
/
├── app/                 # Next.js App Router
│   ├── (dashboard)/     # Protected dashboard routes (layout included)
│   ├── actions/         # Server Actions (Business Logic)
│   ├── api/             # API Routes (Legacy/External access)
│   └── login/           # Auth pages
├── lib/                 # Shared utilities & DB connection
│   ├── db.ts            # Prisma client instance
│   └── utils.ts         # Helper functions
├── prisma/              # Database schema & seeds
│   ├── schema.prisma    # Data models
│   └── seed.mjs         # Seed data script
├── components/          # React components (Atomic design preferred)
├── tests/               # E2E Tests
└── public/              # Static assets
```

## Development Conventions
1.  **Strict Typing:** Do not use `any`. Define proper interfaces/types for all data, especially database results.
2.  **Server Actions:** Prefer Server Actions over API routes for internal mutations.
3.  **Clean Slate Philosophy:** Do not re-introduce "messy" code. If a feature is added, it must be clean, typed, and tested.
4.  **Tailwind:** Use utility classes. Avoid global CSS modules unless absolutely necessary.
5.  **Database:** Always update `schema.prisma` first, then generate client/migrate.

## Current Roadmap (Operation Bedrock)
1.  **Stability & Type Safety:** Ensure 100% CI/CD success and eliminate `any` usage in core paths.
2.  **Core Feature Restoration:** Priority focus on Room Management, Booking Management, and Guest Management.
3.  **Data Management Hub:** Decoupled utility UI for bulk import/export to assist in MVP validation.
4.  **Nice-to-Have:** Real-time Dashboard and advanced analytics (basic dashboard implemented, further work deferred).
