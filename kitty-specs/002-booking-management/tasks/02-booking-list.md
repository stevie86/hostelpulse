---
agent: "Gemini-CLI"
assignee: "User"
shell_pid: "9660"
lane: 'done'
---

# Task: Booking List & Pages

## Activity Log
- [2025-12-20 12:05] Initial implementation of booking list and associated server action.
  shell_pid: "9734"

**Phase:** Frontend
**Objective:** View bookings.

## Requirements

1.  **Server Action:** `getBookings(propertyId, filter)`.
    - Return bookings with Guest and Room data.
2.  **Booking List:** `components/bookings/booking-list.tsx`.
    - Table: Guest, Room, Dates, Status, Total.
    - Filter: Status (Active/All).
3.  **Page:** `app/(dashboard)/properties/[id]/bookings/page.tsx`.

## Definition of Done

- Can view list of bookings.
