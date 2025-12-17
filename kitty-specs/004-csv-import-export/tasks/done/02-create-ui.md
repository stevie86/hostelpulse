# Task: Create UI for File Upload

**Phase:** Frontend
**Objective:** Provide user interface for CSV import.

## Requirements
1.  **Component:** `components/import/import-form.tsx`.
    *   Accepts `propertyId`, `type` (`rooms` or `bookings`), `action`.
    *   File input, submit button.
    *   Displays success/failure count, failed rows.
2.  **Pages:**
    *   `app/(dashboard)/properties/[id]/rooms/import/page.tsx`.
    *   `app/(dashboard)/properties/[id]/bookings/import/page.tsx`.
3.  **Templates:** Create dummy `.csv` template files in `public/templates/`.

## Definition of Done
*   Import forms are rendered and functional.
