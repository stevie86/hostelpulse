---
status: "active"
agent: "Gemini-CLI"
assignee: "User"
shell_pid: "9734"
created_at: "2025-12-20"
---

---
status: "active"
agent: "Gemini-CLI"
assignee: "User"
shell_pid: "9587"
created_at: "2025-12-20"
---

# Feature Specification: Booking Management

## Activity Log
- [2025-12-20 11:30] Mission initiated. Updated metadata and tasks.md for Booking Management Polish.
- [2025-12-20 11:35] Completed: Update Spec Metadata (Priority Zero)
- [2025-12-20 11:40] Completed: Initialize Shadcn Booking Form (Hybrid)
- [2025-12-20 11:45] Completed: Implement Interactive Bed Selection Logic
- [2025-12-20 11:50] Completed: Integrate Real-time Availability Feedback
- [2025-12-20 11:55] Completed: Pass Linting & Build Checks

## 1. Executive Summary

**Intent:** Enable property owners to create, view, and cancel bookings with strict availability checks.
**Value:** Prevents revenue loss from double bookings and manual errors.
**Scope:**

- **Booking Creation:** Multi-step form (Dates -> Room/Bed Selection -> Guest Details -> Confirm).
- **Conflict Detection:** Strict overlap checking logic.
- **Booking List:** Filterable view (All, Confirmed, Checked In, Cancelled).
- **Booking Detail:** View/Edit booking.
- **Cancellation:** Release beds back to inventory.

## 2. Functional Requirements

### 2.1 Conflict Detection (The Core)

- **FR-01:** Before creating a booking, check `BookingBed` table.
- **FR-02:** Overlap Logic: New CheckIn < Existing CheckOut AND New CheckOut > Existing CheckIn.
- **FR-03:** If overlap found for specific `RoomId`/`BedLabel`, reject.
- **FR-04:** For Dorms: Count active bookings vs `Room.beds`. If Count >= Beds, reject.

### 2.2 Create Booking Flow

- **FR-05:** Step 1: Select Dates & Room Type.
- **FR-06:** Step 2: Show available Rooms/Beds.
- **FR-07:** Step 3: Select Guest (Search existing or Create new - _Dependency on Feature 003, but will stub simple inputs for now_).
- **FR-08:** Step 4: Confirm Price & Save.

### 2.3 Booking List

- **FR-09:** Table columns: Guest Name, Room, Dates, Status, Total Price.
- **FR-10:** Filters: Status (Active, Past, Cancelled), Search (Guest Name).

### 2.4 Cancellation

- **FR-11:** Soft cancel (Status -> "cancelled").
- **FR-12:** Immediately frees up availability.

## 3. Technical Constraints

- **Transactions:** `prisma.$transaction` is mandatory for the "Check Availability + Create" sequence to avoid race conditions.
- **Timezones:** Store dates as UTC midnight (or property local midnight). _Decision: Store as DateTime at noon property time to avoid timezone edge cases, or strict UTC._

## 4. Success Criteria

- **SC-01:** Concurrency Test: 2 requests for the same last bed at the same millisecond -> Only 1 succeeds.
- **SC-02:** Booking list loads < 500ms.
- [2025-12-20 11:15] Implemented interactive Bed Selection in BookingForm. Updated createBooking action to respect specific bed choices. Integrated real-time availability checking via Server Actions.
- [2025-12-20 11:25] Linting and build checks passed successfully.
