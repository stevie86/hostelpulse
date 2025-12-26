/**
 * Simple Portuguese Tourist Tax Calculator
 * Based on spreadsheet logic for quick MVP implementation
 *
 * Formula: Tax = Nights × Guests × Rate (capped at 7 nights)
 *
 * Rates (2025):
 * - Lisbon: €4/night
 * - Porto: €2/night
 * - Algarve: €2/night
 * - Madeira: €2/night
 * - Default: €2/night
 */

export interface TaxCalculationInput {
  municipality: string;
  checkInDate: Date;
  checkOutDate: Date;
  guestCount: number;
  isChild?: boolean; // Future: child exemptions
}

export interface TaxCalculationResult {
  taxAmount: number;
  currency: string;
  breakdown: {
    nights: number;
    cappedNights: number;
    ratePerNight: number;
    guestCount: number;
    municipality: string;
  };
  formula: string;
}

class SimplePortugueseTaxCalculator {
  // Municipality rates based on 2025 Portuguese law
  private rates: Record<string, number> = {
    lisbon: 4.0,
    lisboa: 4.0, // Alternative spelling
    porto: 2.0,
    algarve: 2.0,
    faro: 2.0,
    madeira: 2.0,
    funchal: 2.0,
    ponta_delgada: 2.0,
    default: 2.0,
  };

  /**
   * Calculate tourist tax using simple spreadsheet logic
   */
  calculateTax(input: TaxCalculationInput): TaxCalculationResult {
    const { municipality, checkInDate, checkOutDate, guestCount } = input;

    // Step 1: Calculate total nights
    const totalNights = this.calculateNights(checkInDate, checkOutDate);

    // Step 2: Apply 7-night legal cap (Portuguese Law 28/2023)
    const cappedNights = Math.min(totalNights, 7);

    // Step 3: Get municipal rate
    const ratePerNight = this.getRate(municipality);

    // Step 4: Calculate tax amount
    const taxAmount = cappedNights * guestCount * ratePerNight;

    return {
      taxAmount: Math.round(taxAmount * 100) / 100, // Round to cents
      currency: 'EUR',
      breakdown: {
        nights: totalNights,
        cappedNights,
        ratePerNight,
        guestCount,
        municipality: municipality.toLowerCase(),
      },
      formula: `${cappedNights} × ${guestCount} × €${ratePerNight} = €${taxAmount.toFixed(2)}`,
    };
  }

  /**
   * Calculate number of nights between dates
   */
  private calculateNights(checkIn: Date, checkOut: Date): number {
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * Get tax rate for municipality
   */
  private getRate(municipality: string): number {
    const key = municipality.toLowerCase().replace(/\s+/g, '_');
    return this.rates[key] || this.rates['default'];
  }

  /**
   * Get all available municipalities and their rates
   */
  getMunicipalityRates(): Record<string, number> {
    return { ...this.rates };
  }
}

// Export singleton instance for easy use
export const portugueseTaxCalculator = new SimplePortugueseTaxCalculator();

// Convenience functions for common use cases
export const calculateLisbonTax = (nights: number, guests: number): number => {
  const result = portugueseTaxCalculator.calculateTax({
    municipality: 'lisbon',
    checkInDate: new Date(),
    checkOutDate: new Date(Date.now() + nights * 24 * 60 * 60 * 1000),
    guestCount: guests,
  });
  return result.taxAmount;
};

export const calculatePortoTax = (nights: number, guests: number): number => {
  const result = portugueseTaxCalculator.calculateTax({
    municipality: 'porto',
    checkInDate: new Date(),
    checkOutDate: new Date(Date.now() + nights * 24 * 60 * 60 * 1000),
    guestCount: guests,
  });
  return result.taxAmount;
};

// Example usage for testing
export const testTaxCalculations = () => {
  console.log('=== Portuguese Tourist Tax Calculator Test ===\n');

  // Test case 1: Lisbon, 5 nights, 2 guests
  const lisbonResult = portugueseTaxCalculator.calculateTax({
    municipality: 'lisbon',
    checkInDate: new Date('2024-07-01'),
    checkOutDate: new Date('2024-07-06'), // 5 nights
    guestCount: 2,
  });
  console.log(
    'Lisbon (5 nights, 2 guests):',
    `€${lisbonResult.taxAmount} (${lisbonResult.formula})`
  );

  // Test case 2: Porto, 8 nights (capped to 7), 1 guest
  const portoResult = portugueseTaxCalculator.calculateTax({
    municipality: 'porto',
    checkInDate: new Date('2024-08-01'),
    checkOutDate: new Date('2024-08-09'), // 8 nights
    guestCount: 1,
  });
  console.log(
    'Porto (8 nights capped to 7, 1 guest):',
    `€${portoResult.taxAmount} (${portoResult.formula})`
  );

  // Test case 3: Algarve, 3 nights, 3 guests
  const algarveResult = portugueseTaxCalculator.calculateTax({
    municipality: 'algarve',
    checkInDate: new Date('2024-09-01'),
    checkOutDate: new Date('2024-09-04'), // 3 nights
    guestCount: 3,
  });
  console.log(
    'Algarve (3 nights, 3 guests):',
    `€${algarveResult.taxAmount} (${algarveResult.formula})`
  );

  console.log('\n=== All Municipality Rates ===');
  console.log(
    JSON.stringify(portugueseTaxCalculator.getMunicipalityRates(), null, 2)
  );
};
