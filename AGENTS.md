# Repository Guidelines & Agent Context

**Project:** HostelPulse (Clean Slate / Operation Bedrock)
**Stack:** Next.js 15, Prisma, Tailwind CSS, DaisyUI
**Package Manager:** **pnpm** (Strictly enforced)

## Core Philosophy

**Operation Bedrock:** Prioritize stability, type safety, and clean architecture over rapid feature expansion.
**Anti-Scope Creep:** Stick to the MVP Roadmap. Advanced SaaS features (AWS Lambda, EventBridge) are _reference patterns_ but should not delay the Vercel-based MVP launch unless critical.

## 1. Workflow: Spec-Driven Development

All feature work is managed by `spec-kitty`.

- **Start Feature:** `pnpm .venv-speckitty/bin/spec-kitty research --feature "feature-name"` (Creates research artifacts).
- **Plan & Task:** `pnpm .venv-speckitty/bin/spec-kitty plan` -> `pnpm .venv-speckitty/bin/spec-kitty tasks`.
- **Implement:** Work strictly within `kitty-specs/feature-name/` directory.
- **Merge:** `pnpm .venv-speckitty/bin/spec-kitty merge`.
- **Dashboard:** `pnpm .venv-speckitty/bin/spec-kitty dashboard`.

**Rule:** NEVER commit directly to `main`. Always use spec-kitty for feature development and follow the research → plan → tasks → implement → merge workflow.

## 2. Directory Structure

- `app/`: Next.js App Router (Primary).
- `app/actions/`: Server Actions (Data mutations).
- `components/`: Reusable UI (Atomic design).
- `lib/`: Shared utilities & DB (`lib/db.ts`).
- `prisma/`: Schema & Seeds.
- `kitty-specs/`: Feature specifications and plans.
- `.worktrees/`: Active development workspaces (Git ignored).

## 3. Commands

- **Install:** `mise run -- pnpm install`
- **Dev:** `mise run -- pnpm run dev`
- **Build:** `mise run -- pnpm run build`
- **Lint:** `mise run -- pnpm run lint` / `pnpm run lint:fix`
- **Format:** `mise run -- pnpm run format` / `pnpm run format:check`
- **Type-check:** `mise run -- pnpm run type-check`
- **Test (Unit):** `mise run -- pnpm run test`
- **Test (Single):** `pnpm test __tests__/path/to/test.test.ts` (Jest pattern matching)
- **Test (E2E):** `mise run -- pnpm run test:e2e`
- **Test (All):** `mise run -- pnpm run test:all`
- **DB Push:** `mise run -- npx prisma db push` (Prototyping)
- **Spec Kitty:** `mise run -- pnpm .venv-speckitty/bin/spec-kitty <command>`

## 4. Coding Standards

### Build/Lint/Test Commands

- **Install:** `mise run -- pnpm install`
- **Build:** `mise run -- pnpm run build`
- **Lint:** `mise run -- pnpm run lint` (fix with `pnpm run lint:fix`)
- **Format:** `mise run -- pnpm run format` (check with `pnpm run format:check`)
- **Type Check:** `mise run -- pnpm run type-check`
- **Unit Tests:** `mise run -- pnpm run test` (single test: `pnpm test __tests__/path/to/test.test.ts`)
- **E2E Tests:** `mise run -- pnpm run test:e2e`
- **All Tests:** `mise run -- pnpm run test:all`

### Code Style Guidelines

- **Formatting:** Single quotes, trailing comma 'es5', semicolons, 80 char width
- **Types:** Strict TypeScript, zero `any` usage, define Zod schemas in `lib/schemas/`
- **Naming:** PascalCase components, camelCase variables/functions, kebab-case files
- **Imports:** Absolute paths with `@/` alias, group by external/internal
- **Error Handling:** Try/catch in async functions, descriptive error messages
- **Server Actions:** Use for all mutations, validate inputs with Zod
- **Forms:** `react-hook-form` + `zodResolver`, handle server validation errors
- **UI:** Tailwind utility classes + DaisyUI components, atomic design pattern
- **Components:** Functional with hooks, explicit return types, prop interfaces
- **Database:** Filter all queries by `propertyId` (multi-tenancy)

## 5. SaaS Architecture Patterns

Refer to `docs/SAAS_BUILDER_SETUP.md` for multi-tenancy logic.

- **Multi-Tenancy:** Ensure every Prisma query filters by `propertyId` (which maps to Tenant).
- **Usage Tracking:** (Future) Implement tracking points where identified.

## 6. Testing

- **Unit:** Jest for all Server Actions and Logic. Colocate tests in `__tests__` or next to files.
- **E2E:** Playwright for critical user flows (Booking, Login).
- **Coverage:** Aim for 80%+ coverage for critical business actions.

## 7. Commit Guidelines

- **Format:** `feat:`, `fix:`, `chore:`.
- **Scope:** Keep changes specific to the active `spec-kitty` feature.

## 8. Interaction Logging

To keep a record of our interactions, all commands should be piped to a timestamped log file in the `logs/` directory.

**Example:**

```bash
# General command logging
some_command | tee -a logs/interaction-$(date +%Y-%m-%d).log

# Spec-kitty command logging
pnpm .venv-speckitty/bin/spec-kitty <command> | tee -a logs/interaction-$(date +%Y-%m-%d).log
```

---

## Build, Lint, Test Commands

### Single Test Execution

To run a specific test file:

```bash
pnpm test __tests__/actions/auth.test.ts
```

This uses Jest pattern matching to run only the auth test file.

### E2E Test Execution

To run Playwright E2E tests:

```bash
mise run -- pnpm run test:e2e
```

## Code Style Guidelines

### Formatting

- **Configuration**: Single quotes, trailing comma 'es5', semicolons, 80 character width
- **Tools**: Prettier for automated formatting

### TypeScript Standards

- **Strict Mode**: Enforced via tsconfig.json
- **Zero `any` Usage**: Define explicit types for all variables
- **Interface Definitions**: Use for all function signatures and component props

### Naming Conventions

- **Files**: kebab-case (e.g., `booking-form.tsx`)
- **Components**: PascalCase (e.g., `BookingForm`)
- **Variables/Functions**: camelCase (e.g., `propertyId`, `getBookings`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

### Import Organization

```typescript
// External dependencies
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { NextPage } from 'next';

// Internal utilities
import { prisma } from '@/lib/db';
import { format } from 'date-fns';
import { bookingSchema } from '@/lib/schemas/booking';

// Group imports by blank lines
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
```

### Error Handling

All async functions must use try/catch blocks with descriptive error messages:

```typescript
export async function createBooking(data: BookingData) {
  try {
    // Database operations
    const booking = await prisma.booking.create({
      data: validatedData,
    });

    return { success: true, data: booking };
  } catch (error) {
    console.error('Error creating booking:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create booking.'
    );
  }
}
```

## Database Patterns

### Multi-tenancy

All database queries MUST filter by `propertyId` for security and data isolation:

```typescript
export async function getBookings(propertyId: string) {
  const bookings = await prisma.booking.findMany({
    where: {
      propertyId, // Critical for multi-tenancy
      status: {
        in: ['confirmed', 'checked_in'],
      },
    },
    include: {
      guest: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      checkIn: 'asc',
    },
  });

  return bookings;
}
```

### Performance Optimization

Use appropriate database indexes and consider complex query optimization for large datasets.

## Component Architecture

### Atomic Design Pattern

Build small, reusable components with clear responsibilities:

```typescript
// Button component (components/ui/button.tsx)
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export function Button({ children, variant = 'primary', onClick }: ButtonProps) {
  return (
    <button
      className={btnStyles[variant]}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### Server Actions

All data mutations must use Server Actions with proper validation:

```typescript
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const bookingSchema = z.object({
  propertyId: z.string().uuid(),
  guestId: z.string().uuid().optional(),
  checkIn: z.date(),
  checkOut: z.date(),
  totalAmount: z.number().min(0),
});

export async function createBooking(prevState: any, formData: FormData) {
  const validatedData = bookingSchema.parse({
    propertyId: formData.get('propertyId'),
    guestId: formData.get('guestId'),
    checkIn: new Date(formData.get('checkIn')),
    checkOut: new Date(formData.get('checkOut')),
    totalAmount: parseInt(formData.get('totalAmount')),
  });

  const booking = await prisma.booking.create({
    data: validatedData,
  });

  revalidatePath('/bookings');

  return { success: true, data: booking };
}
```

## Form Handling

### React Hook Form

Use `react-hook-form` with Zod integration for form validation:

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers';
import { bookingSchema } from '@/lib/schemas/booking';

export function BookingForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      propertyId: '',
      guestId: '',
      checkIn: new Date(),
      checkOut: new Date()
    }
  });

  const onSubmit = async (data) => {
    const result = await createBooking(data);
    if (result.success) {
      // Handle success
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields with error handling */}
    </form>
  );
}
```

## Testing Standards

### Unit Testing

Write comprehensive tests for Server Actions and utility functions:

```typescript
// __tests__/actions/booking.test.ts
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { createBooking } from '@/app/actions/booking';

describe('createBooking', () => {
  beforeEach(async () => {
    // Setup test data
  });

  afterEach(async () => {
    // Cleanup test data
  });

  it('should create a booking with valid data', async () => {
    const bookingData = {
      propertyId: 'test-property-id',
      guestId: 'test-guest-id',
      checkIn: new Date('2024-01-01'),
      checkOut: new Date('2024-01-02'),
      totalAmount: 10000,
    };

    const result = await createBooking(undefined, createFormData(bookingData));

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('id');
    expect(result.data.totalAmount).toBe(10000);
  });

  it('should throw error with invalid data', async () => {
    const invalidData = {
      propertyId: 'invalid-id',
      // ... other fields
    };

    await expect(
      createBooking(undefined, createFormData(invalidData))
    ).rejects.toThrow('Invalid booking data');
  });
});
```

### E2E Testing

Use Playwright for end-to-end user flow testing:

```typescript
// tests/e2e/booking.spec.ts
import { test, expect } from '@playwright/test';
import { createBookingFormData } from '@/tests/utils/test-data';

test.describe('Booking Flow', () => {
  test('should allow user to create a booking', async ({ page }) => {
    await page.goto('/bookings/new');

    // Fill form
    await page.fill('input[name="propertyId"]', 'test-property-id');
    await page.fill('input[name="checkIn"]', '2024-01-01');
    await page.fill('input[name="checkOut"]', '2024-01-02');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success
    await expect(
      page.locator('text=Booking created successfully')
    ).toBeVisible();
    await expect(page).toHaveURL(/\/bookings\/[a-f0-9]{36}/);
  });
});
```

## Security Guidelines

### Input Validation

- Always validate user inputs on both client and server side
- Use Zod schemas for type-safe validation
- Sanitize all user-generated content

### Authentication

- Use NextAuth.js for authentication
- Implement role-based access control
- Secure session management

### Data Protection

- Filter database queries by `propertyId`
- Implement proper data encryption
- Follow GDPR guidelines for EU users

## Performance Standards

### Database Queries

- Use appropriate indexes
- Optimize complex queries
- Consider connection pooling
- Implement caching where appropriate

### Frontend Optimization

- Use React.memo for expensive components
- Implement lazy loading for large lists
- Optimize images and assets
- Use Next.js built-in optimizations

## Documentation Standards

### Code Comments

- Add JSDoc comments for complex functions
- Document API endpoints
- Include usage examples

### README Updates

- Update setup instructions for new features
- Document environment variables
- Include deployment guides

## Environment Management

### Development

```bash
# Local development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hostelpulse_dev"
NODE_ENV="development"
```

### Production

```bash
# Production deployment
DATABASE_URL=postgresql://user:pass@host:5432/hostelpulse_prod"
NEXTAUTH_URL=https://hostelpulse.com
NODE_ENV="production"
```

---

## Priority Framework

1. **Critical**: Bugs affecting user data or revenue
2. **High**: Feature completion for MVP
3. **Medium**: Performance improvements, UI enhancements
4. **Low**: Documentation updates, minor improvements

## Getting Help

For questions about the codebase, architecture, or best practices:

1. Search existing documentation in `docs/`
2. Check for similar implementations in the codebase
3. Review the architecture patterns in existing features
4. Ask the project maintainer or team lead

---

This document serves as a comprehensive guide for maintaining code quality and consistency across the HostelPulse codebase.
