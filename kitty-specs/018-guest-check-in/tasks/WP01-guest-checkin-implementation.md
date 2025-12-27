---
work_package_id: 'WP01'
title: 'Guest Check-In Implementation'
lane: 'doing'
subtasks:
  - 'T001'
  - 'T002'
  - 'T003'
phase: 'Phase 1 - Core Check-In'
assignee: ''
agent: ''
shell_pid: ''
review_status: ''
reviewed_by: ''
history:
  - timestamp: '2025-12-27T00:00:00Z'
    lane: 'doing'
    agent: 'opencode'
    action: 'Created work package for guest check-in implementation'
---

# Work Package Prompt: WP01 – Guest Check-In Implementation

## Task Overview

Implement the guest check-in/check-out system with real-time validation, room assignment, automated billing, and SEF compliance reporting.

## Implementation Tasks

### T001: Check-In Form & Validation

Create mobile-responsive check-in form with:

- Guest details registration (name, ID, contact, nationality)
- Real-time validation using Zod schemas
- Touch-optimized interface with large buttons
- Room type selection with availability checking

### T002: Room Assignment Logic

Implement server-side room assignment:

- Check room availability for selected dates
- Prevent double-bookings
- Update room status to occupied
- Handle room type preferences

### T003: Billing & Check-Out Integration

Create check-out process with:

- Final billing calculation with taxes
- SEF-compliant report generation
- Payment status tracking
- Room status update to available

## Technical Requirements

- Use existing Prisma schema and database models
- Follow existing UI patterns with DaisyUI components
- Implement proper error handling and validation
- Ensure mobile-responsive design
- Use TypeScript with strict typing

## Acceptance Criteria

1. Receptionist can complete guest check-in in under 60 seconds
2. System validates guest information in real-time
3. Room assignment prevents conflicts and updates availability
4. Check-out generates accurate billing and SEF reports
5. All forms work correctly on mobile devices

## Files to Modify/Create

- `app/actions/check-in-out.ts` - Server actions for check-in/out
- `app/(dashboard)/properties/[id]/check-in/page.tsx` - Check-in form
- `app/(dashboard)/properties/[id]/check-out/page.tsx` - Check-out process
- `components/check-in-out/check-in-form.tsx` - Check-in form component
- `components/check-in-out/check-out-form.tsx` - Check-out form component
- `lib/schemas/check-in-out.ts` - Validation schemas
