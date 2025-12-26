# SEF Reporting Integration - Technical Specification

## Feature Overview

Automated SEF (Serviço de Estrangeiros e Fronteiras) reporting system for Portuguese hostel compliance. Prevents €500+ daily fines through 100% automated guest reporting.

## Functional Requirements

### FR-001: Real-time Check-in Reporting

**Description**: Automatically submit guest information to SEF within 24 hours of check-in
**Acceptance Criteria**:

- Triggered automatically on guest check-in
- Includes all required SEF data fields
- Handles submission failures gracefully
- Logs all submission attempts

### FR-002: Check-out Reporting Updates

**Description**: Update SEF records with actual departure information
**Acceptance Criteria**:

- Updates existing SEF record with check-out date
- Handles early/late departures
- Maintains audit trail of changes

### FR-003: Monthly Summary Reports

**Description**: Generate comprehensive monthly reports for all guests
**Acceptance Criteria**:

- Automated monthly generation (1st of each month)
- Includes all guests from previous month
- CSV format compatible with SEF portal
- Email notifications to property owners

### FR-004: Data Validation

**Description**: Ensure all required data is present before SEF submission
**Acceptance Criteria**:

- Validates guest name, nationality, document details
- Checks for complete booking information
- Prevents submission of incomplete records
- User-friendly error messages for missing data

### FR-005: Error Handling & Retry

**Description**: Robust error handling with automatic retry mechanisms
**Acceptance Criteria**:

- Failed submissions retried up to 3 times
- Email notifications for persistent failures
- Dashboard alerts for compliance issues
- Never blocks booking operations

### FR-006: Compliance Dashboard

**Description**: Visual compliance status and reporting history
**Acceptance Criteria**:

- Real-time compliance status indicator
- List of recent SEF submissions
- Failed submission alerts
- Monthly reporting status

## Technical Requirements

### TR-001: Database Schema

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
}

model Guest {
  // ... existing fields
  passportExpiry DateTime?  // For document validation
  sefReports     SEFReport[]
}
```

### TR-002: SEF Service API

```typescript
interface SEFService {
  submitCheckInReport(bookingId: string): Promise<SEFSubmissionResult>;
  submitCheckOutReport(bookingId: string): Promise<SEFSubmissionResult>;
  submitMonthlyReport(
    propertyId: string,
    month: number,
    year: number
  ): Promise<SEFSubmissionResult>;
  getReportStatus(reportId: string): Promise<SEFStatus>;
  retryFailedReports(): Promise<number>; // Returns number of successful retries
}

interface SEFSubmissionResult {
  success: boolean;
  reportId?: string;
  referenceId?: string;
  error?: string;
}
```

### TR-003: Data Validation Rules

**Required Fields for SEF Submission**:

- `guest.firstName + guest.lastName` (full name)
- `guest.nationality` (valid country code)
- `guest.documentType` (passport/id_card)
- `guest.documentId` (document number)
- `booking.checkIn` (check-in date)
- `booking.checkOut` (check-out date)
- `property.address` (accommodation address)

### TR-004: Integration Points

- **Check-in Process**: Hook into existing check-in action
- **Check-out Process**: Hook into existing check-out action
- **Monthly Job**: Cron job or scheduled function
- **Dashboard**: Add compliance status widget

## Implementation Details

### Phase 1: Database & Models (2 hours)

- Add SEFReport model to schema
- Add passport expiry to Guest model
- Generate and run migration
- Update Prisma client

### Phase 2: SEF Service Layer (4 hours)

- Create `lib/sef-service.ts`
- Implement submission logic with CSV generation
- Add validation and error handling
- Implement retry mechanism

### Phase 3: Integration Hooks (3 hours)

- Hook into check-in action for real-time reporting
- Hook into check-out action for updates
- Create monthly reporting job

### Phase 4: Dashboard & Monitoring (2 hours)

- Add compliance status to dashboard
- Implement alert system for failures
- Create reporting history view

### Phase 5: Testing & Validation (2 hours)

- Unit tests for SEF service
- Integration tests with booking flow
- Manual testing with sample data

## Quality Assurance

### QA-001: Data Accuracy

- All submitted data matches SEF requirements
- No personal data leaks or GDPR violations
- Proper error handling for invalid data

### QA-002: Reliability

- System continues to work even if SEF submission fails
- Automatic retry prevents data loss
- Clear error logging and monitoring

### QA-003: Performance

- SEF reporting doesn't slow down check-in/check-out
- Monthly reports generated efficiently
- Minimal database impact

## Security & Compliance

### SC-001: Data Privacy

- Guest data encrypted at rest and in transit
- Minimal data retention (GDPR compliance)
- Audit trails for all data access

### SC-002: Regulatory Compliance

- 100% adherence to Decreto-Lei n.º 28/2023
- Submission within 24-hour deadline
- Complete and accurate reporting

## Success Metrics

### SM-001: Compliance Rate

- Target: 100% of guests reported within 24 hours
- Measurement: Ratio of reported vs total guests

### SM-002: System Reliability

- Target: 99.9% successful submissions
- Measurement: Failed submission rate

### SM-003: User Experience

- Target: Zero disruption to booking operations
- Measurement: No booking failures due to SEF issues

## Risk Mitigation

### RM-001: SEF API Unavailability

- **Mitigation**: Store reports locally, manual CSV export as fallback
- **Impact**: No booking disruption, manual compliance still possible

### RM-002: Data Validation Failures

- **Mitigation**: Clear error messages, data completion workflows
- **Impact**: Users guided to complete required information

### RM-003: Submission Failures

- **Mitigation**: Automatic retry, email alerts, dashboard warnings
- **Impact**: Compliance issues highlighted immediately

## Deployment Plan

### DP-001: Gradual Rollout

1. **Development**: Complete implementation with mock SEF service
2. **Staging**: Test with production-like data
3. **Production**: Deploy with monitoring and manual override capability
4. **Validation**: Monitor first 30 days for any issues

### DP-002: Rollback Strategy

- Feature flag to disable SEF reporting
- Manual CSV export as emergency fallback
- Clear documentation for manual compliance procedures

## Documentation Updates

### DU-001: User Documentation

- Update compliance section in user manual
- Add SEF reporting FAQ
- Document manual fallback procedures

### DU-002: Technical Documentation

- API documentation for SEF service
- Database schema documentation
- Integration testing procedures

---

**Total Implementation Time**: 6 days
**Business Value**: €500+ daily fine prevention
**Risk Level**: Medium (compliance-critical)</content>
<parameter name="filePath">kitty-specs/sef-reporting-integration/spec.md
