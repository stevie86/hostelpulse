---
lane: "done"
---
# Task: Booking Form (Wizard)

**Phase:** Frontend
**Objective:** Create new bookings.

## Requirements
1.  **Booking Form:** `components/bookings/booking-form.tsx`.
    *   Step 1: Select Dates & Room (Dropdown).
    *   Step 2: Select Guest (Dropdown/Search).
    *   Step 3: Confirm & Submit.
2.  **Validation:**
    *   Show "Room Unavailable" if dates overlap (call `checkAvailability` client-side or server-side on step change).
3.  **Page:** `app/(dashboard)/properties/[id]/bookings/new/page.tsx`.

## Definition of Done
*   Can create a booking via UI.
*   Prevents invalid dates.
