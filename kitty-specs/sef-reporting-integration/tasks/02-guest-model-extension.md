# T001: Add SEFReport Model to Database Schema

## Task Description

Add the SEFReport model to the Prisma schema to track all SEF reporting submissions, their status, and maintain audit trails for compliance.

## Implementation Steps

### 1. Add SEFReport Model

```prisma
model SEFReport {
  id            String       @id @default(uuid())
  propertyId    String
  guestId       String
  bookingId     String
  reportType    SEFReportType
  status        SEFStatus
  submittedAt   DateTime?
  referenceId   String?      // SEF reference number
  errorMessage  String?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @default(now())

  property      Property     @relation(fields: [propertyId], references: [id])
  guest         Guest        @relation(fields: [guestId], references: [id])
  booking       Booking      @relation(fields: [bookingId], references: [id])

  @@index([propertyId, status])
  @@index([submittedAt])
}
```

### 2. Add Required Enums

```prisma
enum SEFReportType {
  CHECK_IN
  CHECK_OUT
  MONTHLY_SUMMARY
}

enum SEFStatus {
  PENDING
  SUBMITTED
  FAILED
  RETRY
}
```

### 3. Update Guest Model

```prisma
model Guest {
  // ... existing fields
  passportExpiry DateTime?
  sefReports     SEFReport[]
}
```

### 4. Update Property Model

```prisma
model Property {
  // ... existing fields
  sefReports     SEFReport[]
}
```

### 5. Update Booking Model

```prisma
model Booking {
  // ... existing fields
  sefReports     SEFReport[]
}
```

## Acceptance Criteria

- ✅ SEFReport model compiles without errors
- ✅ All relationships properly defined
- ✅ Indexes added for performance
- ✅ Enums properly defined
- ✅ Migration generates successfully

## Testing

- Run `pnpm run db:push` to apply schema changes
- Verify Prisma client generates new types
- Check that relationships work in Prisma Studio</content>
  <parameter name="filePath">kitty-specs/sef-reporting-integration/tasks/01-database-schema.md
