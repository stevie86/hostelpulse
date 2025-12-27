# HostelPulse Priority Roadmap

## Updated: 2025-12-27

---

## P0 - Critical (Immediate)

### Moloni Integration + Billing

**Goal**: Complete Moloni invoicing integration for Portuguese fiscal compliance.

**Requirements**:

- Generate legal invoices via Moloni API
- Auto-include tourist tax on invoices
- Handle payment recording
- Invoice numbering compliance (Portuguese AT requirements)

**Files to Review**:

- `lib/moloni-integration.ts` - Existing integration code
- `lib/billing-service.ts` - Billing logic
- `components/invoicing-setup.tsx` - Setup UI

**Acceptance Criteria**:

- [ ] Create invoice on checkout
- [ ] Include tourist tax line item
- [ ] Record payment method
- [ ] Generate compliant invoice number
- [ ] Email invoice to guest (optional)

---

## P1 - High Priority

### Prevent Double Booking

**Goal**: Real-time conflict detection to prevent overlapping bookings on same beds.

**Requirements**:

- Check bed availability before confirming booking
- Handle concurrent booking attempts
- Clear error messaging for conflicts
- Calendar visual indicator for conflicts

**Files to Review**:

- `lib/availability.ts` - Availability checking logic
- `app/actions/bookings.ts` - Booking creation
- Booking calendar components

**Acceptance Criteria**:

- [ ] Block booking if bed occupied for date range
- [ ] Show clear error with alternative suggestions
- [ ] Handle race conditions (optimistic locking or transactions)
- [ ] Visual conflict indicator on calendar

---

## P2 - Medium Priority

### SEF Export (Simple CSV/JSON)

**Goal**: Simple export format for manual SEF reporting (before full automation).

**Requirements**:

- Export guest data in SEF-compatible format
- Support CSV and JSON output
- Include all required SEF fields
- Date range filtering

**SEF Required Fields**:

- Guest name, nationality, document type/number
- Check-in/check-out dates
- Date of birth
- Address (optional but recommended)

**Files to Review**:

- `prisma/schema.prisma` - Guest and SEFReport models
- `app/api/` - Existing API routes

**Acceptance Criteria**:

- [ ] Export button on guests page
- [ ] CSV format with SEF column headers
- [ ] JSON format for programmatic use
- [ ] Date range selector
- [ ] Download file or copy to clipboard

---

## P3 - Lower Priority (Backlog)

### City Tax Calculation Fix

**Status**: Documented in `docs/fixes/city-tax-calc-fix.md`

**Issue**: Checkout form uses `beds.length` instead of `guestCount` and ignores 7-night cap.

**Quick Fix**: Use stored `touristTaxAmount` from booking instead of recalculating.

---

## Technical Debt Notes

1. **Unused imports** in `app/actions/dashboard.ts` - Clean up
2. **Duplicate tax calculators** - Consolidate `lib/tourist-tax-calculator.ts`, `lib/portuguese-tourist-tax.ts`, and `lib/simple-tax-calculator.ts` into single source
3. **Hardcoded propertyId** in dashboard - Should come from session

---

## Implementation Order

```
Week 1: P0 - Moloni + Billing
  - Day 1-2: Moloni API integration testing
  - Day 3-4: Invoice generation on checkout flow
  - Day 5: Payment recording and testing

Week 2: P1 - Double Booking Prevention
  - Day 1-2: Availability service hardening
  - Day 3-4: Transaction-based booking creation
  - Day 5: UI feedback and testing

Week 3: P2 - SEF Export
  - Day 1-2: Export service and formats
  - Day 3: UI integration
  - Day 4-5: Testing and polish
```
