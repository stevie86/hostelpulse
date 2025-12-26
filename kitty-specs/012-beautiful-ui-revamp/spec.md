---
status: "active"
agent: "Gemini-CLI"
assignee: "User"
shell_pid: "6049"
created_at: "2025-12-20"
---

# Feature Specification: Beautiful UI Revamp (Welcome Page + Shared Layout)

## 1. Executive Summary

Modernize the **welcome page** and shared layout/components to match the provided clean, card-based aesthetic (see `tmp/beautifului.jpeg`). Keep the existing Tailwind + DaisyUI stack and focus on visual polish for demo readiness.

## 2. User Stories

- As a demo viewer, I want a polished welcome page so I immediately trust the product.
- As a hostel owner, I want a clean overview of a demo hostel (8 rooms, 5 bookings) to understand the flow.
- As a user, I want consistent buttons, cards, and spacing across shared layout elements.

## 3. Requirements

### 3.1 Visual/UX

- Match the screenshot style: light background, soft borders, subtle shadows, rounded cards, and compact typography hierarchy.
- Include a top header with hostel name + location and a row of pill buttons (dashboard/bookings/guests/add room).
- Provide a "Details" card with currency + timezone.
- Provide a "Rooms" section with a right-aligned CSV import/export action group.
- Display room cards in a responsive grid (3 columns on desktop, 2 on tablet, 1 on mobile).
- Use DaisyUI + Tailwind only (no HeroUI migration in this feature).

### 3.2 Data/Content

- Welcome page shows a **demo hostel** with **8 rooms** and **5 bookings** (static demo data is acceptable).
- No database or API changes required for this feature.

### 3.3 Shared Layout/Components

- Update shared layout components to align with the new visual system (buttons, cards, typography, spacing).
- Avoid breaking existing routes or data flows.

## 4. Non-Goals

- No backend changes, no schema changes, no auth flow changes.
- No migration to HeroUI in this feature.
- No redesign of dashboard charts or booking flow beyond shared styling.

## 5. Constraints

- Must remain fully responsive.
- Must preserve accessibility (focus states, contrast, readable text).
- Keep to Tailwind + DaisyUI (no new UI frameworks).

## 6. Acceptance Criteria

- Welcome page visually matches the target aesthetic.
- Demo data is visible and coherent (8 rooms, 5 bookings).
- Shared layout components look consistent across the app.
- No build/test regressions.

## Activity Log
- [2025-12-20 09:55] Environmental Compliance satisfied (Directories created, metadata added, tasks.md initialized).
- [2025-12-20 10:05] Initialized Shadcn UI and updated globals.css with Pulse Blue mapping.
- [2025-12-20 10:10] Created BedPulseCard with hybrid styling (Lucide + DaisyUI).
- [2025-12-20 10:15] Updated Dashboard layout and Sidebar with glassmorphism and refined spacing.
- [2025-12-20 10:20] Added mobile toggle and responsive width handling to Sidebar.
- [2025-12-22] WP05: Fixed contrast issues across UI - replaced low-contrast text-gray-400/500 with text-slate-500/600, updated borders from gray-200 to slate-200/300, fixed opacity-based text colors. All text now meets WCAG AA 4.5:1 contrast ratio.
- [2025-12-22] WP05: Added theme switcher with custom DaisyUI themes (corporate/night). Converted all hardcoded colors to semantic tokens (base-100, base-200, base-300, base-content). Full light/dark mode support.
