# Implementation Plan: UI Modernization (HeroUI)

## 1. Architecture

*   **Design System:** HeroUI v3 (formerly NextUI).
*   **Animation:** Framer Motion (required dependency).
*   **Theming:** `next-themes` for dark mode support.
*   **Structure:**
    *   `app/providers.tsx`: Global providers wrapper.
    *   `components/ui/`: Wrapped HeroUI components (Facade pattern).

## 2. Step-by-Step Implementation

### Phase 1: Foundation (The Setup)
*   [ ] **Task 1:** Install dependencies.
    *   `npm install @heroui/react framer-motion next-themes`
*   [ ] **Task 2:** Configure Tailwind.
    *   Update `tailwind.config.js` to include HeroUI plugin and content paths.
*   [ ] **Task 3:** Create Providers.
    *   Create `app/providers.tsx` with `<HeroUIProvider>`.
    *   Wrap `app/layout.tsx` children with `<Providers>`.

### Phase 2: Core Components (The Toolkit)
*   [ ] **Task 4:** Create `components/ui/button.tsx`.
    *   Export a standard `Button` wrapping HeroUI's version.
*   [ ] **Task 5:** Create `components/ui/input.tsx` and `components/ui/select.tsx`.
    *   Ensure they work with `react-hook-form` props.
*   [ ] **Task 6:** Create `components/ui/card.tsx`.
    *   Standardize padding and shadow.

### Phase 3: Migration (The Refactor)
*   [ ] **Task 7:** Refactor `LoginForm` (`app/login/login-form.tsx`).
    *   Replace standard `input` with `components/ui/Input`.
    *   Replace `button` with `components/ui/Button`.
*   [ ] **Task 8:** Refactor `RoomList` (`components/rooms/room-list.tsx`).
    *   Replace DaisyUI card/table structure with HeroUI Card/Grid.
*   [ ] **Task 9:** Refactor `BookingForm` (`components/bookings/booking-form.tsx`).
    *   Use new form components.

### Phase 4: Polish
*   [ ] **Task 10:** Add Dark Mode Toggle to Sidebar or Navbar.
*   [ ] **Task 11:** Verify Mobile Responsiveness.

## 3. Builder Instructions
*   **Context:** Use `spec.md` for design guidelines.
*   **Style:** Do NOT mix DaisyUI classes (`btn`, `card`) with HeroUI components.
*   **Validation:** Run `npm run lint` after each task.
