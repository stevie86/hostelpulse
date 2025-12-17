# Feature Specification: CSV Import/Export

## 1. Executive Summary
**Intent:** Allow users to migrate from spreadsheets easily.
**Value:** "Spreadsheet to Digital in minutes" is a key USP.
**Scope:**
*   Download CSV Template (Rooms, Bookings).
*   Upload CSV.
*   Validate Data (e.g. check for duplicate room names).
*   Bulk Insert.

## 2. Functional Requirements
*   **FR-01:** Import Rooms (Name, Type, Beds, Price).
*   **FR-02:** Import Bookings (Guest Name, Room, Dates).
*   **FR-03:** Provide a report of "Rows Success / Rows Failed".

## 3. Success Criteria
*   **SC-01:** Can import 50 rooms in < 5 seconds.
*   **SC-02:** Detailed error messages for failed rows (e.g., "Row 5: Invalid Date").
