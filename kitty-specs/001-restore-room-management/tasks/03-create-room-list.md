---
lane: "done"
---
# Task: Create RoomList Component

**Phase:** UI Implementation
**Objective:** Develop a Server Component to display a paginated list of rooms.

## Context
This component will fetch room data from `actions/rooms.ts` and render it in a table format using DaisyUI for styling.

## Requirements
1.  **Server Component:** Must be a React Server Component.
2.  **Data Fetching:**
    *   Call `getRooms(propertyId)` from `actions/rooms.ts`.
    *   Accepts `propertyId` as a prop.
3.  **UI Elements:**
    *   Table to display rooms: Name, Type, Beds, Price (formatted), Status.
    *   "Edit" and "Delete" buttons for each room.
    *   Use DaisyUI table components for styling.
4.  **Actions:**
    *   "Delete" button should trigger the `deleteRoom` server action (with confirmation modal).

## Definition of Done
*   Component renders a list of rooms correctly.
*   "Edit" button navigates to the edit page.
*   "Delete" button (with confirmation) triggers the server action and revalidates path.
