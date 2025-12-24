# Lisbon Pilot Strategy: "The Comfort Pilot"

**Target Market:** Small-to-Medium Hostels in Lisbon (20-100 beds).
**Objective:** Prove that a "No Bullshit" system works better than Excel or enterprise bloat.

---

## 1. The "Lisbon Pain Points"
Through research and local context, we identified these specific needs:

### A. The "City Tax" Headache
*   **Context:** Lisbon charges ~2€ per guest/night (capped at 7 nights).
*   **Current Pain:** Manual calculation, cash collection, and separate spreadsheets.
*   **Our Solution:** Auto-calculator at Check-In. "Collect 14€" prompt.

### B. The SEF (Immigration) Burden
*   **Context:** Every non-Portuguese guest must be reported to SEF (Immigration) within 3 days.
*   **Current Pain:** Typing passport details into a slow government website manually.
*   **Our Solution:** One-click generation of the SEF-compliant XML or list.

### C. The "Volunteer" Factor
*   **Context:** Many hostels rely on volunteers who change every month.
*   **Current Pain:** Complex software requires training sessions.
*   **Our Solution:** "Zero Training UI". Big buttons. Clear language ("Guest Arrived" vs "Check In").

---

## 2. Feature Specification (Pilot Scope)

### Core: The "Comfort" Check-In
1.  **Search:** Find guest by name (fuzzy search).
2.  **Verify:** Show booking dates and assigned bed.
3.  **Tax:**
    *   Prompt: "City Tax Due: 14.00€" (Calculated automatically).
    *   Action: "Mark Paid & Check In".
4.  **Done:** Status updates to `checked_in`.

### Core: The "Sleep Easy" Inventory
1.  **Visual Guard:** If a bed is booked, it cannot be double-booked in the backend.
2.  **Bed View:** Simple list of "Who is sleeping where tonight".

---

## 3. Success Metrics for Pilot
*   **Zero Double Bookings.**
*   **100% City Tax Collection Accuracy.**
*   **< 2 Minutes to Check-In a Group of 4.**

---
*This document guides the immediate development priorities for the Lisbon launch.*
