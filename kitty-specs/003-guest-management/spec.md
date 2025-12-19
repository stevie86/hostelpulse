# Feature Specification: Guest Management

## 1. Executive Summary
**Intent:** Manage guest profiles and history.
**Value:** Compliance (ID logging) and CRM (Repeat guests).
**Scope:**
*   Guest List with Search (Name, Email).
*   Create/Edit Guest Profile.
*   Link Guests to Bookings.

## 2. Functional Requirements
*   **FR-01:** Store First Name, Last Name, Email, Phone, Nationality.
*   **FR-02:** Store Document ID (Passport/ID Card) - *Required for Portugal compliance*.
*   **FR-03:** Search guests by partial name match.
*   **FR-04:** View guest booking history.
*   **FR-05:** "Blacklist" flag for problem guests.

## 3. Data Dictionary (Schema Map)
*   `firstName`, `lastName` -> Strings
*   `documentType`, `documentId` -> Strings
*   `email` -> String (Unique per property? Or global? *Decision: Per Property for MVP*)

## 4. Success Criteria
*   **SC-01:** Search results appear in < 200ms.
*   **SC-02:** Duplicate guest detection (by email or passport) warns user.