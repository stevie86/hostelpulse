# Feature Specification: CSV Import/Export (Status: Deferred from UI / CLI Service Used)

## 1. Executive Summary
**Intent:** Allow users to migrate from spreadsheets easily.
**Priority:** Medium (Deferred from UI in favor of CLI service)
**Value:** "Spreadsheet to Digital in minutes" is a key USP.
**Scope (Post-MVP):**
*   Download CSV Template (Rooms, Bookings).
*   Upload CSV via UI.
*   Validate Data (e.g. check for duplicate room names).
*   Bulk Insert.

**Current Alternative:**
*   A CLI tool/script will be used by the technical team to perform direct DB imports for beta users.

## 2. Functional Requirements
*   **FR-01:** Import Rooms (Name, Type, Beds, Price).
*   **FR-02:** Import Bookings (Guest Name, Room, Dates).
*   **FR-03:** Provide a report of "Rows Success / Rows Failed".

## 3. Success Criteria
*   **SC-01:** Can import 50 rooms in < 5 seconds.
*   **SC-02:** Detailed error messages for failed rows (e.g., "Row 5: Invalid Date").
