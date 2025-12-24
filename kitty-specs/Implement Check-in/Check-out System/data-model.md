# Data Model: Check-in/Check-out System

## Booking Status Flow
confirmed → checked_in → completed
         → cancelled

## Check-in Process
- Find booking by guest/confirmation code
- Verify dates (check-in date = today)
- Assign bed if not assigned
- Update status to 'checked_in'
- Revalidate dashboard

## Check-out Process
- Find active booking (checked_in status)
- Calculate nights stayed
- Apply city tax (configurable per property)
- Update total amount
- Update status to 'completed'

## New Fields Needed?
- Property.cityTaxRate (decimal, default 2.00 for Lisbon)
- Booking.actualCheckIn (DateTime, when checked in)
- Booking.actualCheckOut (DateTime, when checked out)

## API Endpoints
- POST /api/bookings/[id]/checkin
- POST /api/bookings/[id]/checkout
- GET /api/dashboard/arrivals (today's check-ins)
- GET /api/dashboard/departures (today's check-outs)