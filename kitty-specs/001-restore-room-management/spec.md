# Feature Specification: Restore Room Management

## 1. Executive Summary
**Intent:** Restore the core Room Management functionality (CRUD) to allow property owners to manage their room inventory.
**Value:** This is a foundational feature. Without rooms, bookings cannot be created.
**Scope:**
*   List View of all rooms.
*   Create Room form.
*   Edit Room form.
*   Delete Room (Soft Delete/Archive).
*   **Out of Scope:** Advanced occupancy calculations (deferred), Bulk import (deferred).

## 2. Actors & User Stories
*   **Property Owner/Manager:** "As a manager, I want to add my rooms so I can start taking bookings."
*   **Receptionist:** "As a receptionist, I want to quickly see room details (bed count) to answer guest queries."

## 3. Functional Requirements

### 3.1 Room List
*   **FR-01:** Display a list of all rooms for the current property.
*   **FR-02:** Columns: Name, Type (Dorm/Private), Bed Count, Base Price, Status.
*   **FR-03:** "Add Room" button prominent at top.

### 3.2 Create Room
*   **FR-04:** Form fields:
    *   Name (Required, e.g., "101", "Blue Dorm").
    *   Type (Select: Dormitory, Private, Suite).
    *   Bed Count (Number, Min: 1).
    *   Base Price (Number, stored in cents).
*   **FR-05:** Validation: Name must be unique within property.

### 3.3 Edit Room
*   **FR-06:** Ability to modify all fields defined in 3.2.
*   **FR-07:** Changing "Bed Count" should warn if active bookings exist (future: blocking). For now: Allow with warning.

### 3.4 Delete Room
*   **FR-08:** "Soft Delete" mechanism.
    *   *Implementation Note:* Since `deletedAt` is not in schema yet, use `status = 'archived'` (or add column if needed during task phase).
    *   *Decision:* For this spec, we will treat "Deletion" as checking for dependencies (bookings). If no bookings, hard delete. If bookings, prevent delete (or archive).

## 4. Success Criteria
*   **SC-01:** A user can create a valid room in under 30 seconds.
*   **SC-02:** Room list loads in < 500ms for < 50 rooms.
*   **SC-03:** Form prevents submission of negative prices or 0 beds.

## 5. Technical Constraints & Assumptions
*   **Stack:** Next.js 15, Server Actions, Prisma.
*   **Type Safety:** Strict TypeScript (no `any`).
*   **UI:** Tailwind CSS + DaisyUI.
*   **Database:** Use existing `Room` model.

## 6. Assumptions
*   User is already authenticated and has a `teamId`/`propertyId` (Mock/Seed data or existing Auth).
*   Currency is fixed to property default (EUR) for MVP.
