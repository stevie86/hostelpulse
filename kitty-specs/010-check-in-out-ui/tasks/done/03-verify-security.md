# Task 3: Verify security

## Context
Ensure that the check-in/out actions verify property access.

## Instructions
1.  Check `app/actions/dashboard.ts`.
2.  Ensure `checkIn` and `checkOut` functions call `verifyPropertyAccess`.
3.  Actually, `checkIn` and `checkOut` in `dashboard.ts` currently only check `session.user.id`.
4.  Refactor them to verify that the booking belongs to a property the user has access to.

## Verification
*   Manual code review.
