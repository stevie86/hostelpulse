# Task: Guest UI (List & Form)

**Phase:** Frontend
**Objective:** Create screens to manage guests.

## Requirements
1.  **Guest Form:** `components/guests/guest-form.tsx`.
    *   Client Component.
    *   React Hook Form + Zod.
2.  **Guest List:** `components/guests/guest-list.tsx`.
    *   Server Component.
    *   Table display.
    *   Search Bar (Client component updating URL `?q=`).
3.  **Pages:**
    *   `/properties/[id]/guests/page.tsx` (List)
    *   `/properties/[id]/guests/new/page.tsx` (Create)
    *   `/properties/[id]/guests/[guestId]/page.tsx` (Edit)

## Definition of Done
*   Can create a guest.
*   Can search for a guest.
*   Can edit a guest.
