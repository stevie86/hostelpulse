# Feature Specification: UI Modernization with HeroUI (v3)

## 1. Executive Summary
**Intent:** Migrate the existing Tailwind+DaisyUI interface to a unified, accessible, and modern design system using HeroUI (v3).
**Value:**
- **Consistency:** Standardized components reduce design debt.
- **Accessibility:** Built-in WCAG compliance for better inclusivity.
- **Velocity:** Faster development with pre-built, themeable components.
- **Modernization:** Aligns with 2025 design trends (glassmorphism, micro-interactions).

## 2. Technical Strategy

### 2.1 Core Components
Replace/Wrap existing DaisyUI components with HeroUI equivalents:
- **Buttons:** `Button` with variants (solid, ghost, flat).
- **Forms:** `Input`, `Select`, `Checkbox`, `Radio`.
- **Feedback:** `Spinner` (loading), `Skeleton` (suspense), `Toast` (via Sonner/Toast).
- **Layout:** `Card`, `Divider`, `Spacer`.
- **Navigation:** `Navbar`, `Sidebar` (custom with list items), `Breadcrumbs`.

### 2.2 Layout System
- **Grid:** Responsive 12-column grid system (Grid/Row/Col).
- **Spacing:** Strict spacing scale (xs, sm, md, lg, xl, 2xl) mapped to Tailwind spacing.
- **Container:** Standard `max-w-7xl` centered containers for dashboard views.

### 2.3 Theming
- **Palette:** Define primary (Brand), secondary (Accent), success/warning/error (System).
- **Dark Mode:** Native support via `next-themes` provider.
- **Typography:** Inter (Sans) and Geist Mono (Code/Numbers).

### 2.4 State Management
- **Server State:** React Server Components (RSC) for initial data.
- **Client State:** `useOptimistic` for instant UI feedback on mutations.
- **URL State:** Search params for filters/pagination (Server-driven UI).

### 2.5 API Integration
- **Fetching:** Server Components directly call database/services.
- **Mutations:** Server Actions with `useActionState` (React 19).
- **Validation:** Zod schemas shared between client forms and server actions.

### 2.6 Accessibility (A11y)
- **Keyboard Nav:** Focus visible rings, logical tab order.
- **ARIA:** Proper labels for inputs and interactive elements.
- **Contrast:** AA compliance for text/background ratios.

### 2.7 Testing Strategy
- **Unit:** Jest for utility functions and hooks.
- **Integration:** Component testing for complex interactive widgets.
- **E2E:** Playwright for critical user journeys (Login, Booking Flow).

## 3. Implementation Plan

### Phase 1: Foundation
- [ ] Install `@heroui/react` and `framer-motion`.
- [ ] Configure `tailwind.config.js` with HeroUI plugin.
- [ ] Setup `Providers` (Theme, HeroUI).

### Phase 2: Component Migration
- [ ] Create `ui/` directory for wrapped HeroUI components.
- [ ] Migrate `Button`, `Input`, `Card`.
- [ ] Replace `DaisyUI` global styles.

### Phase 3: Page Refactor
- [ ] **Dashboard:** Stats cards, charts.
- [ ] **Data Tables:** Booking/Guest lists with sorting/pagination.
- [ ] **Forms:** Booking Wizard using new Input components.

### Phase 4: Polish
- [ ] Dark mode toggle.
- [ ] Micro-interactions (hover states, transitions).
- [ ] Accessibility audit.