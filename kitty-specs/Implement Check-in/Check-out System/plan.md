# Implementation Plan: Check-in/Check-out System

## Phase 1: Database Schema Updates
- Add cityTaxRate to Property model
- Add actualCheckIn/actualCheckOut to Booking model
- Migrate existing data

## Phase 2: Server Actions
- Implement checkInBooking action
- Implement checkOutBooking action
- Add tax calculation logic
- Update booking status handling

## Phase 3: UI Components
- Create CheckInForm component
- Create CheckOutForm component
- Update dashboard with arrival/departure widgets
- Add quick action buttons to booking list

## Phase 4: Integration
- Update booking list with status badges
- Add check-in/check-out routes
- Integrate with existing booking flow
- Add confirmation dialogs

## Phase 5: Testing
- Unit tests for check-in/check-out actions
- E2E tests for complete workflows
- Dashboard widget verification