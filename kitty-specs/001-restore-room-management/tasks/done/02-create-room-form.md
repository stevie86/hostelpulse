# Task: Create RoomForm Component

**Phase:** UI Implementation
**Objective:** Develop a reusable form for creating and editing room details.

## Context
This form will be used on both the create (`/new`) and edit (`/[roomId]`) room pages. It should leverage the Zod schema defined in `lib/schemas/room.ts`.

## Requirements
1.  **Client Component:** Must be a React Client Component.
2.  **Form Library:** Use `react-hook-form` for form management.
3.  **UI Elements:**
    *   Input fields for: `name`, `beds`, `pricePerNight`, `maxOccupancy`, `description`.
    *   Select field for: `type` (dormitory, private, suite).
    *   Display validation errors from server actions.
4.  **Submission:**
    *   Accepts `propertyId` as a prop.
    *   Accepts an `action` prop (either `createRoom` or `updateRoom` from `actions/rooms.ts`).
    *   Handles form submission with `useFormState` (if applicable) or client-side validation then server action.
5.  **Initial Values:** Should accept `defaultValues` for editing existing rooms.

## Definition of Done
*   Component renders correctly.
*   Client-side validation (from Zod) is integrated.
*   Form submission triggers the correct server action.
*   Validation errors from server action are displayed.
