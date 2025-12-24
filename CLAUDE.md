# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HostelPulse is a multi-tenant hostel property management system built with Next.js 16 (App Router), Prisma, and Tailwind CSS. The project follows a spec-driven development workflow using `spec-kitty`.

## Development Commands

```bash
# Install dependencies (pnpm is strictly enforced)
pnpm install

# Development server (runs on port 4002)
pnpm dev

# Build for production
pnpm build

# Linting and formatting
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check

# Type checking
pnpm type-check

# Testing
pnpm test              # Jest unit tests
pnpm test:e2e          # Playwright E2E tests
pnpm test:all          # Run both

# Database
pnpm db:generate       # Generate Prisma client
pnpm db:push           # Push schema to database (prototyping)
pnpm db:migrate        # Create migration
pnpm db:studio         # Open Prisma Studio
npx prisma db seed     # Seed database with test data
```

## Spec-Kitty Workflow (Feature Development)

All feature work is managed by spec-kitty. Never commit directly to `main`.

```bash
# Create a new feature (creates branch + worktree)
pnpm spec:specify

# Plan the feature (after spec.md is written)
pnpm spec:plan

# Generate tasks (after plan.md is written)
pnpm spec:tasks

# Accept a completed feature
pnpm spec:accept

# Merge feature to main
pnpm spec:merge
```

**Important:** Work in feature worktrees located at `.worktrees/XXX-feature-name/`. Each worktree has its own copy of the codebase on its feature branch.

## Architecture

### Directory Structure
- `app/` - Next.js App Router pages and layouts
- `app/actions/` - Server Actions for all data mutations
- `app/api/` - API routes (minimal - prefer Server Actions)
- `components/` - Reusable UI components
- `components/ui/` - Atomic UI components (Shadcn-style)
- `lib/` - Shared utilities, database client, validation schemas
- `lib/schemas/` - Zod validation schemas
- `types/` - TypeScript type definitions
- `prisma/` - Database schema and seed script
- `kitty-specs/` - Feature specifications (managed by spec-kitty)

### Key Patterns
- **Server-First**: Use Server Components by default, Server Actions for mutations
- **Multi-Tenancy**: All queries filter by `propertyId` via `verifyPropertyAccess()`
- **Authentication**: NextAuth v5 with JWT strategy
- **Validation**: Zod schemas for all form inputs before mutation
- **Styling**: Tailwind CSS + DaisyUI + Shadcn-style components

### Database Models (Core)
- `User` → `TeamMember` → `Team` → `Property` (multi-tenancy chain)
- `Property` → `Room` → `BookingBed` ← `Booking` ← `Guest`

## Code Standards

- **TypeScript**: Strict mode, zero `any` tolerance
- **Forms**: `react-hook-form` + `@hookform/resolvers/zod`
- **Components**: Max 150 lines, use composition for larger components
- **Server Actions**: Return `ActionState` type with `errors` and `message`

## Testing

- Unit tests in `__tests__/` directory, colocated with source
- E2E tests in `tests/e2e/`
- Mock patterns: `@/auth`, `next/cache`, `next/navigation`, `@/lib/db`

## Environment Variables

Required for local development:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Session encryption key (32 chars)
- `NEXTAUTH_URL` - App URL (http://localhost:4002)

See `docs/VERCEL_DEPLOYMENT.md` for production configuration.
