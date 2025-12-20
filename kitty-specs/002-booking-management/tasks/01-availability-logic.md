---
agent: "Gemini-CLI"
assignee: "User"
shell_pid: "9660"
lane: 'done'
---

# Task: Implement Availability Logic & Create Action

## Activity Log
- [2025-12-20 12:00] Initial implementation and unit tests for availability logic and create booking action.
  shell_pid: "9734"

**Phase:** Logic & Validation
**Objective:** The core engine of the PMS. Prevent double bookings.

## Requirements

1.  **Availability Check:**
    - Create a helper `isRoomAvailable(roomId, checkIn, checkOut, excludeBookingId?)`.
    - Logic:
      - Find all overlapping bookings for this room.
      - Count occupied beds (via `BookingBed` join or count).
      - Compare against `Room.beds`.
      - Return `true` if `occupied < capacity`.
2.  **Create Booking Action:**
    - Input: `guestId` (or details), `roomId`, `checkIn`, `checkOut`, `bedCount` (usually 1).
    - **Transaction:**
      1.  Lock/Check Availability.
      2.  Create `Booking` record.
      3.  Create `BookingBed` records (assign specific beds or just placeholders?). _Decision: Assign specific beds logic is complex. For MVP, just create records linked to Room. "Bed Assignment" can be random or sequential._
      4.  Create `Payment` record (pending).
3.  **Concurrency:**
    - If availability check fails inside transaction, throw error.

## Definition of Done

- Unit tests prove that overlapping bookings for the same bed/room capacity fail.
- `createBooking` action works end-to-end.
