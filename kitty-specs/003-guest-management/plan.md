# Implementation Plan: Guest Management

## 1. Architecture
*   **Server Actions:** `actions/guests.ts`
    *   `getGuests(propertyId, search)`
    *   `createGuest(data)`
    *   `updateGuest(id, data)`
*   **UI Components:**
    *   `GuestList`: Table with search bar.
    *   `GuestForm`: Create/Edit modal or page.

## 2. Step-by-Step Implementation
*   [ ] **Task 1:** Zod Schema (`lib/schemas/guest.ts`).
*   [ ] **Task 2:** Server Actions (CRUD).
*   [ ] **Task 3:** Guest List Page (`/guests`).
*   [ ] **Task 4:** Guest Form (reuse in Booking Flow later).
