# T005: Implement Database Integration Methods

## Task Description

Complete the SEF service database integration methods to store and retrieve SEF reports from the database.

## Implementation Details

### 1. Database Methods Implemented

```typescript
// Save individual check-in/check-out reports
await prisma.sEFReport.create({
  data: {
    propertyId,
    guestId: guestData.guestId,
    bookingId: bookingData.bookingId,
    reportType: 'CHECK_IN',
    status: 'SUBMITTED',
    submittedAt: new Date(),
    referenceId: `HP-${Date.now().toString(36).toUpperCase()}`,
  },
});

// Update reports with check-out data
await prisma.sEFReport.update({
  where: { id: existingReport.id },
  data: {
    reportType: 'CHECK_OUT',
    submittedAt: new Date(),
  },
});

// Generate monthly reports from booking data
const bookings = await prisma.booking.findMany({
  where: {
    propertyId,
    checkIn: { gte: startOfMonth, lt: endOfMonth },
  },
  include: { guest: true, property: true },
});
```

### 2. Error Handling & Logging

- Failed submissions logged to database with error details
- Retry mechanism through status tracking
- Comprehensive error messages for debugging

### 3. Data Relationships

- SEFReport linked to Property, Guest, and Booking
- Audit trail maintained through createdAt/updatedAt
- Status tracking for compliance monitoring

## Acceptance Criteria

- ✅ Reports saved to database on submission
- ✅ Check-out updates existing reports
- ✅ Monthly reports aggregate booking data
- ✅ Failed submissions logged for retry
- ✅ All database relationships work correctly

## Testing

- Integration tests with actual database
- Error scenarios handled gracefully
- Data consistency verified
- Performance impact minimal</content>
  <parameter name="filePath">kitty-specs/sef-reporting-integration/tasks/05-database-integration.md
