# Implementation Plan: CSV Import/Export

## 1. Architecture

- **Library:** `papaparse` for CSV parsing.
- **Server Actions:** `actions/import.ts`.
  - `importRooms(propertyId, csvData)`
- **UI Components:**
  - `ImportWizard`:
    1.  Download Template.
    2.  Upload File.
    3.  Preview/Validate.
    4.  Commit.

## 2. Step-by-Step Implementation

- [ ] **Task 1:** Install `papaparse`.
- [ ] **Task 2:** Create "Import Rooms" logic (Validate names, parse beds).
- [ ] **Task 3:** Create UI for File Upload.
