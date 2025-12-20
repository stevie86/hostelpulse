---
lane: 'done'
---

# Task: Schema & Server Actions

**Phase:** Backend
**Objective:** Create data access layer for Guests.

## Requirements

1.  **Zod Schema:** `lib/schemas/guest.ts`.
    - Fields: firstName, lastName, email, phone, documentId, documentType, nationality.
2.  **Server Actions:** `actions/guests.ts`.
    - `getGuests(propertyId, query)`: Search by name/email.
    - `createGuest(data)`: Create with validation.
    - `updateGuest(id, data)`: Update.
    - `deleteGuest(id)`: Soft delete or check booking constraints? _Decision: Check bookings. If bookings exist, forbid delete._

## Definition of Done

- Unit tests pass.
- Validation works.
