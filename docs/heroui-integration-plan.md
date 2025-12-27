# HeroUI Integration Plan For HostelPulse

> Goal: Introduce HeroUI v3 without destabilizing the Lisbon MVP.

## 1. Current Frontend Stack Snapshot

From the repo:

- **Framework**: Next.js 15 (App Router, React 19).
- **Styling**: Tailwind CSS 3.4 + DaisyUI 5.
- **UI components**:
  - `components/ui/*` – shadcn-style primitives using Radix UI (`button`, `input`, `label`, `select`, `popover`, `calendar`, etc.).
  - DaisyUI theme switching (`corporate` / `night`) via `data-theme` and `components/ui/theme-switcher.tsx`.
  - Custom pieces like `components/ui/glass-card.tsx`, `components/ui/sidebar.tsx`.
- **Design tokens**:
  - CSS variables in `app/globals.css` (`--background`, `--foreground`, `--primary`, etc.).
  - Tailwind config in `tailwind.config.js` mapping those CSS vars.

HeroUI v3 requires:

- **React 19+** (already satisfied).
- **Tailwind CSS v4** (currently **not** satisfied – project is on v3.4).
- Importing `@heroui/styles` in your main CSS.

This makes a **full, immediate migration risky** for the MVP timeline.

## 2. Strategic Decision

- **Primary objective**: Ship a stable MVP (see `docs/mvp-stable-plan.md`).
- **HeroUI objective**: Modernize the UI and DX **after** core flows are stable.
- Conclusion: Treat HeroUI work as **Feature 009** (`kitty-specs/009-ui-modernization-2025`) and keep it **decoupled from MVP blocking work**.

## 3. High-Level Phases

### Phase 0 – Pre-Work (No User-Visible Changes)

1. **Inventory current UI usage**
   - Map where `components/ui/button`, `components/ui/input`, `components/ui/select`, etc. are used across `app/(dashboard)/*`.
   - Identify which screens are **highest-traffic / most important** for MVP (check-in/out, bookings, dashboard).

2. **Confirm Tailwind v4 migration feasibility**
   - Check DaisyUI and other plugins for Tailwind v4 compatibility.
   - Decide whether to:
     - (A) Migrate to Tailwind v4 in place, or
     - (B) Keep Tailwind v3 for MVP and postpone HeroUI v3 until after the migration.

### Phase 1 – Tailwind v4 Migration (Prerequisite For HeroUI v3)

This phase is **foundational** and should only start once MVP flows are functionally complete.

Key tasks:

- Upgrade Tailwind from 3.4 to 4.x.
- Update `postcss.config.js` to use the Tailwind v4 PostCSS plugin.
- Adjust `tailwind.config.js` or create the new Tailwind v4 entrypoint according to the official guide.
- Verify `app/globals.css` still applies the correct CSS variables and base layers.
- Run `pnpm run build` and fix any class or config regressions.

Success criteria:

- All existing screens render correctly with Tailwind v4.
- E2E tests for core flows still pass.

### Phase 2 – Introduce HeroUI Infrastructure

With Tailwind v4 in place, add HeroUI **without** removing existing components yet.

1. **Install HeroUI & dependencies** (using `pnpm`):

   ```bash
   pnpm add @heroui/styles@beta @heroui/react@beta
   pnpm add framer-motion next-themes
   ```

2. **Wire up styles in `app/globals.css`**:

   ```css
   @import 'tailwindcss';
   @import '@heroui/styles';
   ```

   - Ensure Tailwind is imported **before** `@heroui/styles`.

3. **Create a top-level provider** (e.g. `app/providers.tsx`):

   ```tsx
   'use client';

   import { HeroUIProvider } from '@heroui/react';
   import { ThemeProvider as NextThemesProvider } from 'next-themes';

   export function Providers({ children }: { children: React.ReactNode }) {
     return (
       <HeroUIProvider>
         <NextThemesProvider attribute="class" defaultTheme="dark">
           {children}
         </NextThemesProvider>
       </HeroUIProvider>
     );
   }
   ```

4. **Wrap the app in `app/layout.tsx`**:

   ```tsx
   import type { Metadata } from 'next';
   import { Geist, Geist_Mono } from 'next/font/google';
   import './globals.css';
   import { SessionProvider } from 'next-auth/react';
   import { Providers } from './providers';

   export const metadata: Metadata = {
     /* ... */
   };

   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode;
   }) {
     return (
       <html lang="en" suppressHydrationWarning>
         <body className={`${geistSans.variable} ${geistMono.variable}`}>
           <SessionProvider>
             <Providers>{children}</Providers>
           </SessionProvider>
         </body>
       </html>
     );
   }
   ```

5. **Align theme tokens**
   - Map existing CSS variables (`--background`, `--foreground`, `--primary`, etc.) to HeroUI semantic tokens where useful.
   - Keep the current DaisyUI themes for MVP while gradually introducing HeroUI tokens.

### Phase 3 – Targeted Component Migration (Post-MVP)

Avoid a big-bang rewrite. Instead, pick **one surface at a time**.

Suggested order:

1. **Non-critical demo/marketing pages** (e.g. `app/page.tsx`):
   - Use HeroUI `Card`, `Button`, `Navbar` to create a polished home/marketing page.
   - Low risk: if something breaks, it does not disrupt hostel operations.

2. **Dashboard shell** (`app/(dashboard)/layout.tsx`, `components/ui/sidebar.tsx`):
   - Replace layout chrome (sidebar, top bar, cards) with HeroUI equivalents.
   - Keep the **inner forms and tables** mostly unchanged initially.

3. **Forms & inputs on secondary screens** (e.g. guests, rooms management):
   - Swap `components/ui/button`, `components/ui/input`, `components/ui/select` with HeroUI `Button`, `Input`, `Select` where straightforward.
   - Validate keyboard accessibility and focus management.

4. **Primary flows (optional, later)**:
   - Only after MVP is stable for a while, consider migrating check-in/out and booking creation forms to HeroUI inputs and buttons.

At each step:

- Run E2E tests for the affected flows.
- Keep shadcn components around until the usage count is close to zero.

### Phase 4 – Clean-Up & Consolidation

Once HeroUI is the dominant UI layer:

- Remove unused shadcn components from `components/ui/*`.
- Simplify Tailwind config to align with HeroUI’s theming system.
- Revisit DaisyUI usage; decide whether to fully remove it or keep a subset of patterns.

## 4. Constraints & Risks

- **Tailwind v4 migration risk**: Plugins (especially DaisyUI) may lag behind. This is why the plan keeps that migration **after** core MVP flows are stable.
- **Visual churn during pilot**: Rapid UI changes can confuse staff. Limit major visual changes until staff are comfortable with the current UX.
- **Dual-component stack**: For a period, both shadcn and HeroUI will coexist. Keep a clear rule: new feature work prefers HeroUI once the base is in place.

## 5. Practical Recommendations

- **For the next 4–6 weeks**: Focus on stability work in `docs/mvp-stable-plan.md`. Do not start Tailwind v4 or HeroUI work unless it is isolated to demo surfaces.
- **Track HeroUI work as its own feature**: Use `kitty-specs/009-ui-modernization-2025/*` to manage all tasks and avoid mixing them with core booking/check-in work.
- **When ready to start**: Begin with the home/marketing page and dashboard chrome, not check-in/out.

This plan lets you adopt HeroUI v3 deliberately, with clear prerequisites and blast-radius control, while keeping the Lisbon MVP on track.
