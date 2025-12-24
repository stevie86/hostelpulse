# Research: Implement Check-in/Check-out System

## Current Status
- Booking system implemented with conflict detection
- Basic booking statuses: confirmed, checked_in, cancelled, completed
- No dedicated check-in/check-out UI or workflows

## Requirements Analysis
From MVP roadmap (Lisbon focus):

### Check-in Flow
- **Fast Check-in UI**: Search guest -> Assign Bed -> Mark "Checked In" -> Done
- **Guest Search**: Quick lookup by name/email/phone
- **Bed Assignment**: If not pre-assigned, select available bed
- **Status Update**: Change booking status to 'checked_in'

### Check-out Flow
- **Departure Processing**: Mark booking as 'completed'
- **City Tax Calculation**: Lisbon tax (2€/night/person) toggle/calculator
- **Final Totals**: Calculate total amount including taxes

### Dashboard Integration
- **Arriving Today**: List of guests checking in today
- **Departing Today**: List of guests checking out today
- **Actionable Widgets**: One-click check-in/check-out

## Technical Implementation
- **Server Actions**: checkInBooking, checkOutBooking
- **Status Updates**: Use Prisma transactions
- **UI Components**: New check-in/check-out pages or modal
- **Dashboard Widgets**: Update OccupancyCard with arrival/departure lists

## Success Criteria
- Check-in under 60 seconds for volunteer
- No manual double bookings
- Accurate tax calculations
- Real-time dashboard updates