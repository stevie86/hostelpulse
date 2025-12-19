---
lane: "done"
---
# Task: Assemble Pages (Room List, Create, Edit)

**Phase:** Integration
**Objective:** Create the Next.js pages for room management using the `RoomList` and `RoomForm` components.

## Context
These pages will reside under `app/(dashboard)/properties/[id]/rooms/`.

## Requirements
1.  **Room List Page:** `page.tsx`
    *   Renders the `RoomList` component, passing `propertyId`.
    *   Includes a prominent "Add New Room" button linking to `/properties/[id]/rooms/new`.
2.  **Create Room Page:** `new/page.tsx`
    *   Renders the `RoomForm` component, configured for creation.
    *   Passes `propertyId` and `createRoom` action.
3.  **Edit Room Page:** `[roomId]/page.tsx`
    *   Fetches existing room data using Prisma (or a dedicated server action).
    *   Renders the `RoomForm` component, pre-filled with room data, configured for update.
    *   Passes `propertyId`, `roomId`, and `updateRoom` action.

## Definition of Done
*   All three pages are accessible and render their respective components.
*   Navigation between list, create, and edit works correctly.
*   Data flows correctly to and from forms.
