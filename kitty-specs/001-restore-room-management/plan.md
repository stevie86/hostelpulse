# Implementation Plan: Restore Room Management

## 1. Architecture & Design

- **Routing:** `app/(dashboard)/properties/[id]/rooms/`
  - `page.tsx`: List view.
  - `new/page.tsx`: Create form.
  - `[roomId]/page.tsx`: Edit form.
- **Data Access:**
  - `actions/rooms.ts`: Server Actions (`getRooms`, `createRoom`, `updateRoom`, `deleteRoom`).
  - Validation: Zod schema for Room.
- **Components:**
  - `RoomList.tsx`: Table with DaisyUI.
  - `RoomForm.tsx`: Reusable form for Create/Edit.

## 2. Step-by-Step Implementation

### Phase 1: Foundation

- [ ] **Task 1:** Create Zod schemas for Room validation (in `lib/schemas/room.ts`).
- [ ] **Task 2:** Implement Server Actions in `actions/rooms.ts` (CRUD).

### Phase 2: UI Implementation

- [ ] **Task 3:** Create `RoomForm` component (Client Component) with `react-hook-form`.
- [ ] **Task 4:** Create `RoomList` component (Server Component fetching data).

### Phase 3: Integration

- [ ] **Task 5:** Assemble Pages (`page.tsx`, `new/page.tsx`, `[roomId]/page.tsx`).
- [ ] **Task 6:** Add simple "Are you sure?" modal for delete.

### Phase 4: Verification

- [ ] **Task 7:** Write Unit Tests for Server Actions (`actions/rooms.test.ts`).
- [ ] **Task 8:** Manual verification of flows.
