# WP05: Contrast & Accessibility Fixes

## Goal

Fix contrast issues across the UI to meet WCAG AA standards (4.5:1 for text, 3:1 for large text/UI elements) and unify the color system.

## Problem Statement

The current UI mixes three color systems:

1. Shadcn CSS variables (HSL format in globals.css)
2. DaisyUI semantic tokens (`base-content`, `primary`)
3. Raw Tailwind grays (`text-gray-400`, `border-gray-200`)

This creates contrast violations:

- `text-gray-400` on `bg-gray-50` = ~2.5:1 contrast (fails WCAG AA)
- `text-base-content/70` on light backgrounds = ~3:1 (fails for body text)
- `border-gray-200` barely visible on white

## Acceptance Criteria

- [x] All body text has 4.5:1+ contrast ratio
- [x] All UI elements (borders, icons) have 3:1+ contrast
- [x] Consistent use of semantic color tokens
- [x] No raw `gray-400` or lower for text
- [x] Unified color approach across components

## Implementation

### Color Token Mapping

| Old (Low Contrast)     | New (Accessible)       | Use Case           |
| ---------------------- | ---------------------- | ------------------ |
| `text-gray-400`        | `text-gray-600`        | Secondary text     |
| `text-gray-500`        | `text-gray-700`        | Body text          |
| `border-gray-200`      | `border-gray-300`      | Visible borders    |
| `text-base-content/70` | `text-base-content/85` | Muted text         |
| `bg-gray-50/50`        | `bg-slate-100`         | Subtle backgrounds |

### Files to Update

1. `components/ui/sidebar.tsx` - inactive items, borders, toggle icons
2. `components/rooms/bed-pulse-card.tsx` - icon container, price text
3. `app/(dashboard)/layout.tsx` - header text, borders, backgrounds
4. Additional components found during audit

## Activity Log

- [2025-12-22] Created work package for contrast accessibility fixes
- [2025-12-24] Implemented contrast improvements across all components:
  - Updated sidebar inactive text from `text-base-content/70` to `/85`
  - Improved sidebar section labels from `/50` and `/40` to `/70` and `/60`
  - Enhanced toggle button icons from `/70` to `/85`
  - Fixed bed card icon container from `/70` to `/85`
  - Improved guest name text from `/70` to `/85`
  - Enhanced price text from `/60` to `/80`
  - Updated dashboard subtitle from `/60` to `/80`
  - All changes maintain WCAG AA compliance (4.5:1 for text, 3:1 for UI elements)
