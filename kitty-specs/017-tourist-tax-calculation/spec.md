# Spec-Kitty: Tourist Tax Calculation - PRIORITY 1

## Overview

**Goal**: Implement automated Portuguese tourist tax calculation as the foundation for revenue generation and compliance in HostelPulse.

**Critical Priority**: This is the core revenue feature that differentiates HostelPulse from generic booking platforms.

**Business Impact**: €4,320 annual revenue increase per hostel through automated €4/night tourist tax collection.

---

## Tourist Tax Requirements Analysis

### Portuguese Legal Framework

- **Law Reference**: Decree-Law 28/2023 - Taxa Municipal Turística
- **Collection**: Mandatory at accommodation establishments
- **Administration**: Municipal responsibility with national oversight
- **Reporting**: Monthly submissions to local tax authorities

### Municipal Variations (40+ Municipalities)

```json
{
  "municipal_rates": {
    "lisbon": { "rate": 4.0, "max_nights": 7 },
    "porto": { "rate": 2.0, "max_nights": 7 },
    "algarve": { "rate": 2.0, "max_nights": 7 },
    "funchal": { "rate": 2.0, "max_nights": 7 },
    "default": { "rate": 2.0, "max_nights": 7 }
  },
  "exemptions": [
    { "condition": "age_under_12", "description": "Children under 12 years" },
    {
      "condition": "medical_treatment",
      "description": "Medical treatment stays"
    },
    { "condition": "disability", "description": "Disabled persons" }
  ]
}
```

### Calculation Rules

1. **Rate Application**: Municipality-specific rates (€4 Lisbon, €2 Porto)
2. **Night Cap**: Maximum 7 nights per stay (legal requirement)
3. **Guest Count**: Per person per night
4. **Exemptions**: Children under 12, medical stays, disabled persons
5. **Collection Timing**: At checkout/payment
6. **Reporting**: Monthly municipal reporting

---

## Implementation Architecture

### Core Calculation Engine

```typescript
interface TouristTaxCalculation {
  municipality: string;
  checkInDate: Date;
  checkOutDate: Date;
  guestCount: number;
  exemptions: Exemption[];
}

interface TaxResult {
  amount: number; // Total tax in cents
  breakdown: {
    taxableNights: number;
    ratePerNight: number;
    guestCount: number;
    municipality: string;
    exemptions: ExemptionResult[];
  };
  legalReference: string;
  warnings: string[];
}

class TouristTaxCalculator {
  calculateTax(params: TouristTaxCalculation): TaxResult;
  validateMunicipality(municipality: string): boolean;
  getMunicipalityRate(municipality: string): number;
}
```

### Integration Points

- **Booking Creation**: Calculate tax during booking
- **Booking Display**: Show tax breakdown to guests
- **Invoice Generation**: Include tax in professional invoices
- **Reporting**: Aggregate data for municipal reporting
- **Admin Dashboard**: Tax revenue tracking and analytics

---

## Implementation Plan

### Phase 1: Core Calculation Engine (Week 1)

#### 1.1 Tax Rules Configuration

- JSON-based municipality configuration
- Rate validation and updates
- Exemption rule definitions
- Legal compliance verification

#### 1.2 Calculation Logic Implementation

- Night calculation (check-in to check-out)
- 7-night cap enforcement
- Municipal rate application
- Exemption processing

#### 1.3 Error Handling & Validation

- Invalid municipality detection
- Date range validation
- Guest count verification
- Exemption eligibility checking

#### Deliverables

- [ ] TouristTaxCalculator class with full logic
- [ ] Municipality configuration system
- [ ] Unit tests for all calculation scenarios
- [ ] Error handling for edge cases

### Phase 2: Booking Integration (Week 1-2)

#### 2.1 Booking Flow Integration

- Add municipality selection to booking form
- Real-time tax calculation display
- Tax inclusion in total pricing
- Guest communication about tax requirements

#### 2.2 Database Schema Updates

- Add municipality field to bookings
- Store tax calculation results
- Audit trail for tax changes
- Historical tax rate tracking

#### 2.3 UI Components

- Municipality dropdown with Portuguese locations
- Tax breakdown display component
- Exemption selection interface
- Tax confirmation in booking summary

#### Deliverables

- [ ] Booking form with municipality selection
- [ ] Real-time tax calculation in UI
- [ ] Tax storage in booking records
- [ ] Guest-facing tax communication

### Phase 3: Advanced Features (Week 2-3)

#### 3.1 Exemption Management

- Child age verification logic
- Medical exemption documentation
- Disability exemption processing
- Exemption audit trail

#### 3.2 Reporting & Analytics

- Monthly tax collection reports
- Municipal reporting exports
- Revenue analytics dashboard
- Tax compliance monitoring

#### 3.3 Multi-Currency Support

- EUR base currency
- Future EU expansion preparation
- Currency conversion for reporting
- International tax rule support

#### Deliverables

- [ ] Full exemption processing system
- [ ] Tax reporting and analytics
- [ ] Multi-currency foundation
- [ ] Compliance monitoring tools

### Phase 4: Production Optimization (Week 3-4)

#### 4.1 Performance Optimization

- Tax calculation caching
- Batch processing for reports
- Database query optimization
- Real-time calculation limits

#### 4.2 Error Recovery & Monitoring

- Failed calculation retry logic
- Tax discrepancy detection
- Audit logging for compliance
- Performance monitoring alerts

#### 4.3 Integration Testing

- End-to-end booking flows
- Tax calculation accuracy testing
- Reporting validation
- Multi-municipality coverage

#### Deliverables

- [ ] Optimized calculation performance
- [ ] Comprehensive error handling
- [ ] Full integration test coverage
- [ ] Production monitoring setup

---

## Technical Specifications

### Database Extensions

```sql
-- Booking tax information
ALTER TABLE "Booking" ADD COLUMN "municipality" VARCHAR(100);
ALTER TABLE "Booking" ADD COLUMN "tourist_tax_amount" INTEGER DEFAULT 0; -- in cents
ALTER TABLE "Booking" ADD COLUMN "tax_calculation" JSONB; -- full breakdown

-- Tax rate configuration
CREATE TABLE "TaxRate" (
  "id" SERIAL PRIMARY KEY,
  "municipality" VARCHAR(100) UNIQUE,
  "rate_per_night" INTEGER NOT NULL, -- in cents
  "max_nights" INTEGER DEFAULT 7,
  "valid_from" DATE NOT NULL,
  "valid_to" DATE,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- Tax exemptions tracking
CREATE TABLE "TaxExemption" (
  "id" SERIAL PRIMARY KEY,
  "booking_id" VARCHAR(36) NOT NULL,
  "exemption_type" VARCHAR(50) NOT NULL,
  "justification" TEXT,
  "verified_by" VARCHAR(100),
  "verified_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

```
GET  /api/tax/municipalities          # List all municipalities and rates
POST /api/tax/calculate               # Calculate tax for booking parameters
GET  /api/tax/report/:municipality    # Monthly tax collection reports
POST /api/bookings                    # Enhanced with tax calculation
```

### Calculation Algorithm

```typescript
function calculateTouristTax(
  checkIn: Date,
  checkOut: Date,
  guestCount: number,
  municipality: string,
  exemptions: Exemption[] = []
): TaxResult {
  // 1. Calculate total nights
  const totalNights = calculateNights(checkIn, checkOut);

  // 2. Apply 7-night legal maximum
  const taxableNights = Math.min(totalNights, 7);

  // 3. Get municipal rate (in cents)
  const ratePerNight = getMunicipalityRate(municipality);

  // 4. Apply exemptions
  const { taxableGuests, exemptionDetails } = applyExemptions(
    guestCount,
    exemptions
  );

  // 5. Calculate tax amount
  const taxAmount = taxableNights * taxableGuests * ratePerNight;

  return {
    amount: taxAmount,
    breakdown: {
      taxableNights,
      ratePerNight,
      guestCount,
      taxableGuests,
      municipality,
      exemptions: exemptionDetails,
    },
    legalReference: 'Decreto-Lei n.º 28/2023',
    warnings: generateWarnings(totalNights, municipality),
  };
}
```

---

## Success Metrics

### Technical Metrics

- **Calculation Accuracy**: 100% correct tax computations
- **Performance**: <100ms tax calculation response time
- **Error Rate**: <0.1% calculation errors
- **Coverage**: 40+ Portuguese municipalities supported

### Business Metrics

- **Revenue Generation**: €4,320+ annual tax collection per hostel
- **Compliance Rate**: 100% accurate tax application
- **Guest Satisfaction**: 95%+ positive tax transparency feedback
- **Administrative Efficiency**: 90% reduction in manual tax calculations

### Compliance Metrics

- **Legal Compliance**: 100% adherence to Decree-Law 28/2023
- **Municipal Reporting**: Monthly reports generated automatically
- **Audit Trail**: Complete tax calculation history
- **Exemption Processing**: 100% accurate exemption applications

---

## Risk Assessment

### Technical Risks

- **Rate Updates**: Municipality tax rate changes require updates
- **Calculation Errors**: Complex exemption logic could cause mistakes
- **Performance Issues**: High-volume booking periods
- **Integration Complexity**: Booking flow modifications

### Business Risks

- **Revenue Loss**: Incorrect tax calculations
- **Legal Fines**: Non-compliance penalties (€2,500-€40,000)
- **Guest Disputes**: Tax transparency issues
- **Competitive Disadvantage**: Manual tax processes vs automation

### Mitigation Strategies

1. **Automated Updates**: Monitor municipal rate changes
2. **Comprehensive Testing**: Edge case and exemption testing
3. **Error Monitoring**: Real-time calculation validation
4. **Guest Communication**: Clear tax breakdown and policies

---

## Dependencies & Prerequisites

### Internal Dependencies

- **Booking System**: Complete booking creation flow
- **Guest Management**: Guest data for exemptions
- **Database Schema**: Extended booking and tax tables
- **UI Components**: Municipality selection and tax display

### External Dependencies

- **Municipal Data**: Official Portuguese municipality tax rates
- **Legal Updates**: Monitoring of Decree-Law 28/2023 changes
- **Tax Authority APIs**: Future integration for reporting
- **Exchange Rates**: For future multi-currency support

---

## Implementation Timeline

### Week 1: Foundation

- Tax calculation engine implementation
- Municipality configuration setup
- Basic booking integration
- Unit test coverage

### Week 2: Enhancement

- Exemption processing system
- UI integration and tax display
- Database schema updates
- Error handling and validation

### Week 3: Production

- Performance optimization
- Reporting and analytics
- Integration testing
- Documentation completion

### Week 4: Launch

- Production deployment
- User acceptance testing
- Monitoring and support
- Revenue tracking setup

---

## Questions for Clarification

1. **Rate Update Frequency**: How often do Portuguese municipal tax rates change?
2. **Exemption Verification**: Do we need manual verification for disability/medical exemptions?
3. **Historical Tracking**: Should we track tax rate changes over time?
4. **Multi-Booking Support**: How to handle tax for bookings with multiple rooms?
5. **Currency Precision**: Should we use cents or decimal for tax calculations?

This specification establishes tourist tax calculation as the foundation for HostelPulse's revenue generation and Portuguese compliance, providing €4,320+ annual value per hostel through automated tax collection.
