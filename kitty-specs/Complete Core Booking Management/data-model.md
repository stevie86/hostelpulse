# Data Model: Complete Core Booking Management

## Core Entities

### Booking

- id: UUID primary key
- guestId: Foreign key to Guest
- roomId: Foreign key to Room
- checkIn: DateTime
- checkOut: DateTime
- status: Enum (confirmed, checked_in, cancelled, completed)
- totalPrice: Decimal
- createdAt, updatedAt: Timestamps

### BookingBed

- id: UUID primary key
- bookingId: Foreign key to Booking
- bedLabel: String (e.g., "A1", "B2")
- pricePerNight: Decimal

### Room

- id: UUID
- propertyId: Foreign key
- name: String
- type: Enum (private, dorm)
- beds: Int (total bed count)
- pricePerNight: Decimal

### Guest

- id: UUID
- propertyId: Foreign key
- name: String
- email: String
- phone: String

## Conflict Detection Logic

To prevent double bookings:

```sql
-- Check for overlap on specific bed
SELECT COUNT(*) FROM BookingBed bb
JOIN Booking b ON bb.bookingId = b.id
WHERE b.roomId = ? AND bb.bedLabel = ?
  AND b.status IN ('confirmed', 'checked_in')
  AND b.checkIn < ? AND b.checkOut > ?
```

For dorms: Count active bookings vs total beds.

## Transaction Requirements

All booking creation must use transactions:

- Check availability
- Create booking
- Create booking beds
- Fail if any step fails
