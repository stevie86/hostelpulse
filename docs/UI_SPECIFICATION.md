# HostelPulse - UI Design Specification & Aesthetics
**Status:** Defined & Iterating
**Last Updated:** December 20, 2025

## 1. Aesthetic Direction: "Modern SaaS Bedrock"
The UI is defined by a clean, premium, and functional aesthetic that prioritizes speed and clarity for hostel managers.

### Key Pillars
- **Minimalist Clarity:** Removing all non-essential visual noise. 
- **High Contrast & Type-Driven:** Using typography to define hierarchy rather than heavy borders or backgrounds.
- **Glassmorphism (Subtle):** Utilizing translucent overlays for cards and modals to create depth.
- **Micro-interactions:** Subtle Framer Motion transitions between pages and state changes.

## 2. Visual Palette
| Component | Choice | Hex/Class |
| :--- | :--- | :--- |
| **Primary Theme** | Light/Clean | `bg-white` / `bg-gray-50` |
| **Accent Color** | Pulse Blue | `#2563eb` (Blue-600) |
| **Surface Elements** | Glass Cards | `bg-white/80 backdrop-blur-md` |
| **Typography** | Geist Sans | Native Next.js font |

## 3. Layout Strategy
- **Sidebar-Centric:** A collapsible, persistent sidebar for primary navigation (Dashboard, Bookings, Rooms, Guests).
- **Sticky Headers:** Action bars (Search, Create New) remain visible during scroll.
- **Responsive-First:** 100% functional on mobile tablets (essential for floor staff) while leveraging widescreen desktop space for data density.

## 4. Interaction Principles
1. **Instant Feedback:** Every button click triggers a loading state or a transition.
2. **Predictable Navigation:** Property-level context is always visible (e.g., "HostelPulse Lisbon" breadcrumb).
3. **Empty States:** No "empty white boxes"—all empty views contain helpful calls to action (e.g., "No bookings found. Create your first booking?").

## 5. Frameworks & Tools
- **Tailwind CSS 3.4:** For rapid, utility-first styling.
- **DaisyUI v5:** For base components (Buttons, Modals, Spinners) to ensure accessibility and consistent sizing.
- **Framer Motion:** For page-level entry/exit animations.
- **Lucide React:** Standardized icon set.

## 6. Implementation Notes (Operation Bedrock)
- **Worktree Reference:** The implementation details were prototyped in the `012-beautiful-ui-revamp` worktree.
- **Clean Slate:** We are porting the "Beautiful UI" logic into the main branch incrementally, ensuring each component is strictly typed and doesn't re-introduce legacy debt.
