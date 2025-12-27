# City Tax Calculation Bug Fix

## Date: 2025-12-27

## Problem Summary

The checkout form calculates city/tourist tax incorrectly, using `booking.beds.length` instead of proper `guestCount` and ignoring the 7-night legal cap required by Portuguese law.

## Affected Files

1. `components/bookings/checkout-form.tsx` - Primary bug location
2. `app/actions/dashboard.ts` - Missing fields in getDailyActivity query
3. `app/(dashboard)/dashboard/page.tsx` - Missing fields in BookingDetails interface

## Bug Details

### Current Broken Code (checkout-form.tsx line 72)

```typescript
// Calculate city tax (per person per night)
const cityTax = cityTaxRate * nights * booking.beds.length;
```

### Issues Identified

| Issue                                      | Impact                                                                            | Legal Compliance                              |
| ------------------------------------------ | --------------------------------------------------------------------------------- | --------------------------------------------- |
| Uses `beds.length` instead of `guestCount` | Incorrect tax calculation - a 4-bed dorm booking with 1 guest would charge 4x tax | Violates per-guest requirement                |
| No 7-night cap                             | Overcharges on extended stays                                                     | Violates Portuguese Law 28/2023 (Decreto-Lei) |
| Hardcoded cityTaxRate (2.0)                | Wrong rate for non-Porto municipalities                                           | Lisbon is 4.00 EUR, not 2.00 EUR              |
| Doesn't use stored `touristTaxAmount`      | Recalculates instead of using pre-calculated value                                | N/A                                           |

## Database Schema Reference

The Prisma schema already has the correct fields on Booking:

```prisma
model Booking {
  guestCount       Int     @default(1) // Number of guests (MANDATORY for tax calculation)
  municipality     String? // Municipality for tax calculation
  touristTaxAmount Int     @default(0) // Tourist tax in cents
  taxBreakdown     Json?   // Full tax calculation breakdown
}
```

## Solution

### 1. Update getDailyActivity Query

Add missing fields to the departures query:

```typescript
const departures = await prisma.booking.findMany({
  // ... existing where clause
  include: {
    // ... existing includes
  },
  select: {
    // Add these fields:
    guestCount: true,
    touristTaxAmount: true,
    municipality: true,
  },
});
```

### 2. Update Booking Interface

```typescript
interface Booking {
  id: string;
  guest: { ... } | null;
  beds: { ... }[];
  checkIn: Date;
  checkOut: Date;
  totalAmount: number;
  amountPaid: number;
  status: string;
  // ADD THESE:
  guestCount: number;
  touristTaxAmount: number;
  municipality: string | null;
}
```

### 3. Fix calculateCheckout Function

**Option A: Use pre-calculated touristTaxAmount (RECOMMENDED)**

```typescript
const calculateCheckout = (booking: Booking) => {
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate accommodation cost
  const accommodationCost = booking.beds.reduce(
    (total, bed) => total + bed.pricePerNight * nights,
    0
  );

  // Use pre-calculated tourist tax from booking (already includes 7-night cap)
  const cityTax = booking.touristTaxAmount;

  // Total amount due
  const totalDue = accommodationCost + cityTax;
  const outstanding = totalDue - booking.amountPaid;

  return { nights, accommodationCost, cityTax, totalDue, outstanding };
};
```

**Option B: Recalculate with proper logic (fallback)**

```typescript
import { portugueseTaxCalculator } from '@/lib/tourist-tax-calculator';

const calculateCheckout = (booking: Booking) => {
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const accommodationCost = booking.beds.reduce(
    (total, bed) => total + bed.pricePerNight * nights,
    0
  );

  // Proper tax calculation with 7-night cap and correct municipality rate
  const taxResult = portugueseTaxCalculator.calculateTax({
    municipality: booking.municipality || 'lisbon',
    checkInDate,
    checkOutDate,
    guestCount: booking.guestCount,
  });

  // Tax is in cents
  const cityTax = taxResult.totalTax;

  const totalDue = accommodationCost + cityTax;
  const outstanding = totalDue - booking.amountPaid;

  return { nights, accommodationCost, cityTax, totalDue, outstanding };
};
```

## Testing Scenarios

| Scenario                      | Guests | Nights | Municipality | Expected Tax             |
| ----------------------------- | ------ | ------ | ------------ | ------------------------ |
| Lisbon short stay             | 2      | 3      | lisbon       | 2 x 3 x 4.00 = 24.00 EUR |
| Lisbon extended stay (capped) | 1      | 10     | lisbon       | 1 x 7 x 4.00 = 28.00 EUR |
| Porto family                  | 4      | 5      | porto        | 4 x 5 x 2.00 = 40.00 EUR |
| Algarve week                  | 2      | 7      | algarve      | 2 x 7 x 2.00 = 28.00 EUR |

## Verification Steps

1. Run `lsp_diagnostics` on changed files
2. Test checkout form with various booking scenarios
3. Verify tax amounts match expected values from table above
4. Ensure 8+ night stays are capped at 7 taxable nights

## Notes

- Keep DaisyUI components as-is per user request
- Tourist tax is stored in cents in the database
- The `cityTaxRate` prop can be removed from CheckOutForm since we use stored/calculated values
