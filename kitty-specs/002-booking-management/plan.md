# Implementation Plan: Booking Management

## 1. Architecture

*   **Database:**
    *   Models: `Booking`, `BookingBed`, `Guest`, `Room`.
    *   **Note:** There is no `Bed` model. We use "Virtual Beds".
        *   Logic: A room with `beds: 4` has virtual beds labeled "1", "2", "3", "4".
        *   Allocation: When booking a bed, we find the first label (e.g., "1") that has no overlapping `BookingBed` record for the requested dates.
*   **Server Actions:** `actions/bookings.ts`.
    *   `checkAvailability(roomId, dates)`
    *   `createBooking(data)` (Transactional)
    *   `cancelBooking(bookingId)`
    *   `getBookings(propertyId, filters)`
*   **UI Components:**
    *   `BookingForm` (Wizard style).
    *   `BookingList` (Filterable Table).
    *   `DateRangePicker` (DaisyUI/React component).

## 2. Step-by-Step Implementation

### Phase 1: Logic & Validation (The Hard Part)
*   [x] **Task 1:** Implement `AvailabilityService` (logic to check overlaps).
    *   *Sub-task:* Implement `findAvailableBedLabel(roomId, checkIn, checkOut)` helper.
*   [x] **Task 2:** Implement `createBooking` server action with `prisma.$transaction`.
*   [ ] **Task 3:** Unit Tests for Concurrency/Overlap (Critical).

### Phase 2: UI - List View
*   [x] **Task 4:** Create `BookingList` component.
*   [x] **Task 5:** Create `/bookings/page.tsx`.

### Phase 3: UI - Creation Flow
*   [x] **Task 6:** Create `BookingForm` (Multi-step).
    *   *Note:* Will use simple inputs for Guest initially until Feature 003 is fully ready.

### Phase 4: Integration
*   [x] **Task 7:** Link "Book Now" from Room List (optional convenience).
*   [x] **Task 8:** Cancellation flow.

## 3. Key Algorithms

**Overlap Check (SQL/Prisma):**
```typescript
const overlapping = await prisma.booking.findFirst({
  where: {
    roomId: targetRoomId,
    status: { in: ['confirmed', 'checked_in'] },
    checkIn: { lt: newCheckOut },
    checkOut: { gt: newCheckIn }
  }
})
```
*For dorms, we count these overlaps. If count < room.beds, we allow it.*