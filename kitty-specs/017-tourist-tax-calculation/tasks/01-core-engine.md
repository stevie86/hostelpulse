# Task 1: Core Tax Calculation Engine

## Overview

Implement the foundational tourist tax calculation engine with support for all Portuguese municipalities, legal compliance, and exemption processing.

## Objectives

- Create TouristTaxCalculator class with complete logic
- Implement 40+ municipality tax rates and 7-night legal cap
- Add exemption processing for children and special cases
- Ensure 100% compliance with Decree-Law 28/2023

## Implementation Steps

### 1.1 Tax Configuration Setup

- Create JSON configuration file with all Portuguese municipalities
- Include current 2025 tax rates (€4 Lisbon, €2 Porto, etc.)
- Add municipality metadata (population, region, etc.)
- Implement configuration validation

### 1.2 Core Calculation Logic

```typescript
// lib/tourist-tax-calculator.ts
interface TaxCalculationParams {
  municipality: string;
  checkInDate: Date;
  checkOutDate: Date;
  guestCount: number;
  guestAges?: number[]; // For child exemptions
  specialExemptions?: Exemption[];
}

interface TaxResult {
  totalTax: number; // Total in cents
  breakdown: {
    taxableNights: number;
    ratePerNight: number;
    taxableGuests: number;
    municipality: string;
    exemptions: ExemptionResult[];
  };
  legalReference: string;
  warnings?: string[];
}

class TouristTaxCalculator {
  private municipalRates: Record<string, number> = {
    lisbon: 400, // €4.00 in cents
    porto: 200, // €2.00 in cents
    algarve: 200,
    funchal: 200,
    default: 200,
  };

  calculateTax(params: TaxCalculationParams): TaxResult {
    // 1. Calculate nights (with 7-night cap)
    const totalNights = this.calculateNights(
      params.checkInDate,
      params.checkOutDate
    );
    const taxableNights = Math.min(totalNights, 7);

    // 2. Get municipal rate
    const ratePerNight =
      this.municipalRates[params.municipality.toLowerCase()] ||
      this.municipalRates.default;

    // 3. Process exemptions
    const { taxableGuests, exemptions } = this.processExemptions(
      params.guestCount,
      params.guestAges || [],
      params.specialExemptions || []
    );

    // 4. Calculate tax
    const totalTax = taxableNights * taxableGuests * ratePerNight;

    return {
      totalTax,
      breakdown: {
        taxableNights,
        ratePerNight,
        taxableGuests,
        municipality: params.municipality,
        exemptions,
      },
      legalReference: 'Decreto-Lei n.º 28/2023 - Taxa Municipal Turística',
    };
  }

  private calculateNights(checkIn: Date, checkOut: Date): number {
    const diffTime = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private processExemptions(
    totalGuests: number,
    ages: number[],
    specialExemptions: Exemption[]
  ): { taxableGuests: number; exemptions: ExemptionResult[] } {
    let taxableGuests = totalGuests;
    const exemptionResults: ExemptionResult[] = [];

    // Child exemptions (under 12)
    ages.forEach((age, index) => {
      if (age < 12) {
        taxableGuests--;
        exemptionResults.push({
          type: 'child',
          description: `Child under 12 (age ${age})`,
          exemptedGuests: 1,
        });
      }
    });

    // Special exemptions
    specialExemptions.forEach((exemption) => {
      if (this.isValidExemption(exemption)) {
        taxableGuests = Math.max(0, taxableGuests - exemption.guestCount);
        exemptionResults.push({
          type: exemption.type,
          description: exemption.description,
          exemptedGuests: exemption.guestCount,
        });
      }
    });

    return { taxableGuests, exemptions: exemptionResults };
  }
}
```

### 1.3 Exemption Processing

- Child age verification (under 12)
- Medical treatment exemptions
- Disability exemptions with documentation
- Exemption audit trail

### 1.4 Validation & Error Handling

- Municipality validation
- Date range validation
- Guest count validation
- Rate update validation

### 1.5 Unit Testing

- All calculation scenarios
- Edge cases (0 nights, 100 nights, etc.)
- Exemption combinations
- Invalid municipality handling

## Success Criteria

- [ ] 100% accurate tax calculations for all Portuguese municipalities
- [ ] 7-night legal cap automatically enforced
- [ ] Child exemptions processed correctly
- [ ] All edge cases handled gracefully
- [ ] Performance <50ms per calculation

## Dependencies

- Basic project setup and configuration
- No external API dependencies for MVP

## Testing

- Unit tests for all calculation methods
- Edge case testing (weekend bookings, year transitions)
- Performance testing for bulk calculations
- Accuracy validation against legal requirements

## Deliverables

- [ ] TouristTaxCalculator class with complete logic
- [ ] Municipality configuration with 40+ locations
- [ ] Exemption processing system
- [ ] Comprehensive unit test suite
- [ ] Performance benchmarks documented
