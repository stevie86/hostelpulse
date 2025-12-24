# Implementation Plan: Beautiful UI Revamp (Welcome Page + Shared Layout)

## 1. Goal

Deliver a modern, demo-ready welcome page and shared layout/components that match the target screenshot, using Tailwind + DaisyUI only. No backend changes.

## 2. Scope

### In Scope

- Welcome page UI layout and styling.
- Shared layout/components (header, buttons, cards, typography, spacing).
- Static demo data for 8 rooms and 5 bookings (if needed for visuals).

### Out of Scope

- Database, API, or auth flow changes.
- HeroUI migration.
- Non-welcome pages beyond shared layout styling.

## 3. Architecture & Files

### Likely Files

- `app/page.tsx` (welcome page content)
- `app/layout.tsx` (shared layout wrappers)
- `app/globals.css` (global typography/spacing variables if needed)
- `components/` (shared header, buttons, cards)

### UI Building Blocks

- Button styles: DaisyUI buttons with custom classes for pill styling.
- Card styles: DaisyUI `card` + Tailwind border/shadow overrides.
- Grid: Tailwind responsive grid for room cards.

## 4. UI Breakdown (Welcome Page)

- **Header Row**: Hostel name + location, actions row (dashboard, bookings, guests, add room).
- **Details Card**: Currency + timezone in a compact two-column layout.
- **Rooms Section**: Section header + right-aligned CSV actions.
- **Room Cards**: Name, type, beds, occupancy, price, status badge, delete link.

## 5. Data Strategy

- Use static demo data (8 rooms, 5 bookings) within the welcome page component.
- Avoid touching DB or server actions.

## 6. Tasks

1. Audit existing layout components and welcome page entry.
2. Implement shared layout styles (buttons, cards, typography).
3. Build welcome page structure to match screenshot.
4. Add demo data rendering for rooms and bookings.
5. Verify responsive behavior (desktop/tablet/mobile).

## 7. Acceptance Criteria

- Visual parity with target screenshot for layout, spacing, and tone.
- Welcome page renders without auth redirects in demo context.
- Shared layout components reflect the new style.
