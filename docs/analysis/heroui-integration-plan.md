# HeroUI Integration Plan For HostelPulse

Status: draft plan, aligned with MVP stability first

## 1. Current UI Stack Snapshot

From `ARCHITECTURE.md`, `tailwind.config.js`, and `components/ui/*`:

- Tailwind CSS 3.4.x.
- DaisyUI themes (corporate and night) wired via `data-theme` and `class="dark"` on `html`.
- shadcn style primitives in `components/ui` using Radix UI for popover, select, label, and Slot.
- Custom theming layer in `app/globals.css` with CSS variables for background, foreground, primary, secondary, etc.

There is no HeroUI v3 in the codebase yet. `kitty-specs/009-ui-modernization-2025` already mentions `@heroui/react` and `framer-motion`, so HeroUI is planned as a dedicated feature.

## 2. Constraints From HeroUI v3

From the official docs and research task results:

- HeroUI v3 is built on Tailwind CSS v4 and React 19.
- It expects CSS imports of the form:
  - `@import "tailwindcss";`
  - `@import "@heroui/styles";`
- It ships its own CSS layers for base, components, and themes.
- It favors a CSS first configuration with fewer JavaScript plugins.

Implication: adopting HeroUI v3 in this project means planning a Tailwind v3 to v4 migration and reconciling DaisyUI and custom CSS with the HeroUI theming model.

## 3. Strategic Recommendation

For a **stable MVP**, treat HeroUI as a **Phase 2 UI modernization**, not a Phase 1 dependency.

- Use the current Tailwind + DaisyUI + shadcn mix to ship and harden the MVP flows.
- De risk HeroUI by introducing it in a controlled, non critical surface after Operation Bedrock is solid.
- Keep `kitty-specs/009-ui-modernization-2025` as the canonical feature umbrella for HeroUI work.

The rest of this document assumes you follow that ordering.

## 4. Phase 0: Pre work After MVP

Before touching HeroUI:

- Freeze the visual language for the dashboard temporarily.
- Clean up `components/ui/*` so there is a single primary Button, Input, and Card abstraction used across the dashboard.
- Document the current color tokens and semantic mapping in one place (for example `docs/specs/UI_ROADMAP.md` or a new `docs/analysis/ui-tokens-current.md`).

Deliverable: one stable, well used set of primitives that you can later swap behind the scenes.

## 5. Phase 1: Tailwind v4 Migration Spike (Sandbox)

Goal: prove that Tailwind v4 and HeroUI CSS can coexist in this repo without breaking the dashboard.

Suggested approach:

1. Create a small sandbox route, for example `app/heroui-lab/page.tsx`, that is not linked from production navigation.
2. In a feature branch, follow Tailwind v4 migration guides:
   - Install Tailwind v4 and update `postcss.config.js` to use `"@tailwindcss/postcss"` if needed.
   - Reshape `tailwind.config.js` into the new configuration style recommended for v4.
   - Update imports in `app/globals.css` to the new Tailwind syntax when you are ready to add HeroUI.
3. Verify that existing screens compile and render correctly with Tailwind v4 utilities.

Only once Tailwind v4 runs cleanly should you introduce HeroUI v3 styles.

## 6. Phase 2: HeroUI Provider And Styles

Goal: wire HeroUI into the app router without rewriting everything.

1. Install dependencies (using pnpm in this repo):
   - `pnpm add @heroui/styles@beta @heroui/react@beta framer-motion next-themes`.
2. Create `app/providers.tsx`:
   - Add a `HeroUIProvider` and `NextThemesProvider` wrapper component.
   - Keep the existing `SessionProvider` in `app/layout.tsx` and wrap it with the new providers.
3. Update `app/layout.tsx` to:
   - Import and use `Providers` around `{children}`.
   - Keep the existing `data-theme` and `class="dark"` logic until you fully switch to HeroUI themes.
4. In `app/globals.css`, add the HeroUI imports in the correct order:
   - `@import "tailwindcss";`
   - `@import "@heroui/styles";`

At this point HeroUI components should be usable in isolated parts of the app.

## 7. Phase 3: Isolated Component Adoption

Goal: get real world confidence with minimal blast radius.

Suggested first adoption surface:

- Marketing or public pages such as `app/page.tsx`.
- Low risk internal screens such as a settings sub page or a dedicated "UI lab" route.

Migration pattern:

1. Introduce HeroUI components alongside existing components, for example HeroUI `Button` and `Input` on the marketing page only.
2. Do not swap core dashboard components yet.
3. Confirm that:
   - Dark and light modes behave as expected.
   - HeroUI styles do not unexpectedly override the main dashboard.
   - Bundle size and performance remain acceptable.

## 8. Phase 4: Dashboard Primitive Swap

Once you trust HeroUI and Tailwind v4 in isolation, design a controlled migration of dashboard primitives.

Order of migration:

1. Buttons and Inputs
   - Map the existing button variants (primary, secondary, ghost, destructive) to HeroUI button props and class names.
   - Provide a compatibility wrapper if needed so consuming code uses the same prop names.
2. Cards and Panels
   - Replace `GlassCard` and similar components with HeroUI equivalents where appropriate, while preserving the current information hierarchy.
3. Form Controls
   - Gradually swap selects, popovers, and date pickers to HeroUI versions, verifying accessibility and keyboard use.

Always keep the migration behind a single `components/ui/*` abstraction so you can fall back if needed.

## 9. Risks And Guardrails

Key risks:

- Tailwind v3 to v4 migration causing subtle layout regressions.
- DaisyUI themes and HeroUI themes conflicting in CSS variables.
- Over investing in visual polish before core flows are stable.

Guardrails:

- Only migrate UI in feature branches with Playwright regression coverage for the main dashboard flows.
- Keep a documented rollback plan for each step (for example keeping the old component implementation in git for quick reversion).
- Align all HeroUI work with `kitty-specs/009-ui-modernization-2025` so it does not leak into unrelated features.

## 10. Summary

- Ship and stabilize the MVP using the current Tailwind 3 + DaisyUI + shadcn setup.
- Treat HeroUI as a post MVP modernization project, starting with a Tailwind v4 spike and a small HeroUI lab.
- Gradually migrate primitives behind `components/ui`, keeping business logic and layouts as unchanged as possible.

This keeps your product safe for real hostels while still giving you a clear path to a more modern, HeroUI powered interface when the time is right.
