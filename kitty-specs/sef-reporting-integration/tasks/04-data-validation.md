# T004: Create SEF Service Structure

## Task Description

Create the core SEF service layer with interfaces, validation, and CSV generation for Portuguese immigration compliance reporting.

## Implementation Details

### 1. Service Architecture

```typescript
export class SEFReportingService {
  // Core reporting methods
  submitCheckInReport();
  submitCheckOutReport();
  submitMonthlyReport();

  // Helper methods
  validateGuestData();
  generateSEFCSV();
  saveReportToDatabase();
}
```

### 2. Data Interfaces

```typescript
interface SEFSubmissionResult {
  success: boolean;
  reportId?: string;
  referenceId?: string;
  error?: string;
}

interface SEFGuestData {
  firstName: string;
  lastName: string;
  nationality: string;
  documentType: string;
  documentId: string;
  passportExpiry?: Date;
}

interface SEFBookingData {
  checkIn: Date;
  checkOut: Date;
  propertyAddress: string;
}
```

### 3. CSV Format Requirements

SEF requires specific CSV format:

- `Nome`: Full name (First + Last)
- `Nacionalidade`: Nationality
- `TipoDocumento`: Document type (passport/ID)
- `NumeroDocumento`: Document number
- `DataEntrada`: Check-in date (YYYY-MM-DD)
- `DataSaida`: Check-out date (YYYY-MM-DD)
- `MoradaAlojamento`: Property address
- `TipoRelatorio`: Report type (CHECK_IN/CHECK_OUT/MONTHLY)

### 4. Validation Rules

- All required fields present
- Document not expired
- Valid date formats
- Complete address information

### 5. Error Handling

- Graceful failure handling
- Detailed error logging
- Retry mechanisms for transient failures
- User-friendly error messages

## Acceptance Criteria

- ✅ SEFReportingService class created
- ✅ All interfaces defined
- ✅ CSV generation produces valid format
- ✅ Data validation works correctly
- ✅ Error handling implemented
- ✅ Service exports properly

## Testing

- Unit tests for validation functions
- CSV generation format validation
- Error handling scenarios
- Integration with existing booking flow</content>
  <parameter name="filePath">kitty-specs/sef-reporting-integration/tasks/03-sef-service-structure.md
