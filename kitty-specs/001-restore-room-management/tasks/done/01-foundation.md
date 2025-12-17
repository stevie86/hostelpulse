# Task: Implement Room Server Actions & Validation

**Phase:** Foundation
**Objective:** Create the backend logic for Room CRUD.

## Context
We need secure, typed Server Actions to handle database operations for Rooms.

## Requirements
1.  **Zod Schema:** Define `RoomSchema` in `lib/schemas/room.ts`.
    *   Fields: name (min 2 chars), type (enum), beds (min 1), price (min 0).
2.  **Server Actions:** `actions/rooms.ts`.
    *   `getRooms(propertyId)`: Returns list.
    *   `createRoom(data)`: Validates & inserts.
    *   `updateRoom(id, data)`: Validates & updates.
    *   `deleteRoom(id)`: Checks for bookings -> Deletes or Throws Error.
3.  **Security:** Ensure user owns the property (mock auth check for now if auth not fully ready, or use `auth()` if available).

## Definition of Done
*   Unit tests pass.
*   Types are strict.
