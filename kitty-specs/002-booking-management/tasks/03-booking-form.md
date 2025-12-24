---
agent: "Gemini-CLI"
assignee: "User"
shell_pid: "9660"
lane: 'done'
---

# Task: Booking Form (Wizard)

## Activity Log
- [2025-12-20 12:10] Implemented BookingForm with Shadcn/DaisyUI hybrid components.
- [2025-12-20 12:15] Integrated interactive bed selection and real-time availability.
  shell_pid: "9734"

**Phase:** Frontend
**Objective:** Create new bookings.

## Requirements

1.  **Booking Form:** `components/bookings/booking-form.tsx`.
    - Step 1: Select Dates & Room (Dropdown).
    - Step 2: Select Guest (Dropdown/Search).
    - Step 3: Confirm & Submit.
2.  **Validation:**
    - Show "Room Unavailable" if dates overlap (call `checkAvailability` client-side or server-side on step change).
3.  **Page:** `app/(dashboard)/properties/[id]/bookings/new/page.tsx`.

## Definition of Done

- Can create a booking via UI.
- Prevents invalid dates.
