# Spec-Kitty: User Testing Paths & QA Framework

## Overview

**Goal**: Define comprehensive user testing paths and QA procedures for HostelPulse to ensure reliable, user-friendly operation across all Portuguese compliance features.

**Scope**: Testing scenarios for hostel owners, staff, and guests covering booking, compliance, invoicing, and administrative functions.

**Success Criteria**: 95%+ test coverage, zero critical bugs in production, <2 second response times for all user flows.

---

## User Testing Scenarios

### 1. **Hostel Owner User Paths**

#### **Path 1: Initial Setup & Compliance Configuration**

```
Start → Sign Up → Property Setup → Compliance Configuration → Dashboard
```

**Test Cases**:

- Account creation with NIF validation
- Property registration with AL license
- Tourist tax municipality selection (€4 Lisbon, €2 Porto)
- SIBA/SEF compliance setup
- Moloni invoicing integration

#### **Path 2: Daily Operations Management**

```
Dashboard → Booking Management → Guest Check-in → Compliance Monitoring → Reporting
```

**Test Cases**:

- Real-time occupancy dashboard
- Booking conflict detection
- Automated tourist tax calculation
- SIBA reporting status monitoring
- Monthly compliance reports

#### **Path 3: Financial & Compliance Reporting**

```
Dashboard → Invoices → Compliance Reports → Tax Authority Submissions → Analytics
```

**Test Cases**:

- Invoice generation and PDF download
- SAF-T file export validation
- Tourist tax revenue tracking
- Compliance audit trails
- Financial reporting accuracy

### 2. **Hostel Staff User Paths**

#### **Path 1: Guest Reception Workflow**

```
Login → Check-in Queue → Guest Verification → Room Assignment → Invoice Generation
```

**Test Cases**:

- Touch-optimized check-in interface
- Guest document scanning (SIBA compliance)
- Real-time availability checking
- Automated invoice creation
- Payment processing integration

#### **Path 2: Daily Operations**

```
Shift Start → Guest Management → Maintenance Requests → End-of-Day Reporting
```

**Test Cases**:

- Bed-level inventory management
- Guest information updates
- Emergency contact handling
- Daily occupancy reporting
- Staff handover procedures

#### **Path 3: Compliance Tasks**

```
Daily Tasks → SIBA Reporting → Tourist Tax Collection → Guest Documentation
```

**Test Cases**:

- Automated 3-day SIBA deadline alerts
- Tourist tax payment collection
- Guest document verification
- Compliance status updates

### 3. **Guest User Paths**

#### **Path 1: Online Booking**

```
Property Search → Availability Check → Guest Information → Payment → Confirmation
```

**Test Cases**:

- Multi-language booking interface (PT/EN/ES)
- Real-time availability updates
- Guest data validation (SIBA requirements)
- Secure payment processing
- Automated confirmation emails

#### **Path 2: Check-in Process**

```
Arrival → Digital Check-in → Document Verification → Room Assignment → Welcome
```

**Test Cases**:

- Mobile check-in app compatibility
- QR code scanning for quick check-in
- Document upload and validation
- Room preference matching
- Welcome package delivery

#### **Path 3: Stay Management**

```
In-Stay → Service Requests → Billing Review → Check-out → Feedback
```

**Test Cases**:

- In-app service ordering
- Real-time bill updates
- Tourist tax transparency
- Self-service check-out
- Post-stay feedback collection

---

## Testing Frameworks & Tools

### **Automated Testing Stack**

- **Playwright**: E2E user flow testing
- **Jest**: Unit and integration testing
- **React Testing Library**: Component testing
- **MSW**: API mocking for testing
- **Cypress**: Alternative E2E framework

### **Performance Testing**

- **Lighthouse**: Frontend performance audits
- **WebPageTest**: Real user monitoring
- **k6**: Load testing for booking spikes
- **Artillery**: API performance testing

### **Compliance Testing**

- **SAF-T Validator**: Portuguese tax authority file format validation
- **SIBA XML Schema**: Guest registration format validation
- **VAT Calculator**: Portuguese tax computation verification
- **Accessibility Auditor**: WCAG compliance checking

---

## Critical User Flows & Test Cases

### **Booking Engine Testing**

#### **TC-001: Standard Booking Creation**

```typescript
// Test Case: Complete booking flow with compliance
test('should create booking with tourist tax calculation', async ({ page }) => {
  await page.goto('/bookings/new');
  await page.fill('[data-testid="guest-name"]', 'João Silva');
  await page.fill('[data-testid="guest-nif"]', '123456789');
  await page.selectOption('[data-testid="municipality"]', 'lisbon');
  await page.fill('[data-testid="check-in"]', '2024-07-01');
  await page.fill('[data-testid="check-out"]', '2024-07-08');
  await page.click('[data-testid="create-booking"]');

  // Assertions
  await expect(page.locator('[data-testid="tourist-tax"]')).toContainText(
    '€32.00'
  );
  await expect(page.locator('[data-testid="total-amount"]')).toContainText(
    '€432.00'
  );
  await expect(page.locator('[data-testid="siba-required"]')).toBeVisible();
});
```

#### **TC-002: Availability Conflict Detection**

```typescript
test('should prevent double booking of beds', async ({ page }) => {
  // Setup: Create booking for Bed A
  await createBooking({
    bedId: 'A',
    checkIn: '2024-07-01',
    checkOut: '2024-07-05',
  });

  // Attempt second booking for same bed
  await page.goto('/bookings/new');
  await page.selectOption('[data-testid="bed"]', 'A');
  await page.fill('[data-testid="check-in"]', '2024-07-03');
  await page.fill('[data-testid="check-out"]', '2024-07-07');

  // Should show conflict warning
  await expect(page.locator('[data-testid="conflict-warning"]')).toBeVisible();
  await expect(page.locator('[data-testid="create-booking"]')).toBeDisabled();
});
```

### **Compliance Testing**

#### **TC-003: SIBA Guest Registration**

```typescript
test('should handle SIBA reporting workflow', async ({ page }) => {
  // Create booking with foreign guest
  await createBooking({
    guest: {
      nationality: 'BR',
      documentType: 'passport',
      documentId: 'AB123456',
    },
  });

  // Check SIBA dashboard
  await page.goto('/compliance/siba');
  await expect(page.locator('[data-testid="pending-reports"]')).toContainText(
    '1'
  );

  // Generate XML report
  await page.click('[data-testid="generate-xml"]');
  await expect(page.locator('[data-testid="xml-content"]')).toBeVisible();

  // Mark as reported
  await page.click('[data-testid="mark-reported"]');
  await expect(page.locator('[data-testid="pending-reports"]')).toContainText(
    '0'
  );
});
```

#### **TC-004: Tourist Tax Calculation**

```typescript
test('should calculate tourist tax correctly', async ({ page }) => {
  // Lisbon booking: 8 nights (should cap at 7)
  await page.fill('[data-testid="municipality"]', 'lisbon');
  await page.fill('[data-testid="nights"]', '8');
  await page.fill('[data-testid="guests"]', '2');

  // Should calculate €4 × 7 nights × 2 guests = €56
  await expect(page.locator('[data-testid="tourist-tax"]')).toContainText(
    '€56.00'
  );
  await expect(page.locator('[data-testid="tax-breakdown"]')).toContainText(
    '7 nights (capped)'
  );
});
```

### **Invoicing Testing**

#### **TC-005: Portuguese Invoice Generation**

```typescript
test('should generate compliant Portuguese invoice', async ({ page }) => {
  // Setup booking with tourist tax
  const booking = await createBookingWithTax();

  // Generate invoice
  await page.goto(`/bookings/${booking.id}/invoice`);
  await page.click('[data-testid="generate-invoice"]');

  // Verify Portuguese compliance
  await expect(page.locator('[data-testid="invoice-number"]')).toMatch(
    /^INV-\d{4}-\d{4}$/
  );
  await expect(page.locator('[data-testid="vat-rate"]')).toContainText('6%');
  await expect(page.locator('[data-testid="tourist-tax-line"]')).toBeVisible();
  await expect(page.locator('[data-testid="download-pdf"]')).toBeEnabled();
});
```

---

## QA Testing Procedures

### **Pre-Release Testing Checklist**

#### **Functional Testing**

- [ ] All user paths complete without errors
- [ ] Portuguese tax calculations accurate
- [ ] SIBA XML generation valid
- [ ] Invoice PDF generation working
- [ ] Email delivery functional
- [ ] Mobile responsiveness verified

#### **Performance Testing**

- [ ] Page load times <2 seconds
- [ ] Booking creation <3 seconds
- [ ] Report generation <5 seconds
- [ ] Concurrent users (50+) supported
- [ ] Memory usage stable

#### **Security Testing**

- [ ] Guest data encryption verified
- [ ] NIF validation working
- [ ] Payment processing secure
- [ ] File upload restrictions enforced
- [ ] SQL injection protection active

#### **Compliance Testing**

- [ ] Tourist tax capped at 7 nights
- [ ] SIBA fields required for foreigners
- [ ] Portuguese VAT calculation correct
- [ ] Invoice numbering sequential
- [ ] SAF-T export format valid

### **User Acceptance Testing**

#### **Beta Tester Program**

- **Target**: 10 Lisbon hostels for 4-week testing
- **Success Criteria**:
  - 95% booking completion rate
  - <5% error rate in tax calculations
  - 90% user satisfaction score
  - Zero data security incidents

#### **Feedback Integration**

- **Daily Bug Reports**: Critical issues fixed within 24 hours
- **Weekly Feature Requests**: Prioritized for next sprint
- **Monthly Usability Testing**: UI/UX improvements implemented
- **End-of-Beta Review**: Feature completeness assessment

---

## Automated Test Suite

### **Unit Tests**

```typescript
// Tax calculation tests
describe('PortugueseTouristTaxCalculator', () => {
  test('calculates Lisbon tax correctly', () => {
    const result = calculator.calculateTax(dates, 2, 'lisbon');
    expect(result.amount).toBe(56.0);
    expect(result.breakdown.ratePerNight).toBe(4.0);
  });

  test('caps at 7 nights maximum', () => {
    const result = calculator.calculateTax(longStay, 1, 'lisbon');
    expect(result.breakdown.taxableNights).toBe(7);
  });

  test('exempts children under 12', () => {
    const result = calculator.calculateTax(dates, 1, 'lisbon', [childGuest]);
    expect(result.exemption).toBeDefined();
    expect(result.amount).toBe(0);
  });
});
```

### **Integration Tests**

```typescript
// Full booking workflow
describe('BookingWorkflow', () => {
  test('complete booking with compliance', async () => {
    // Create guest with SIBA requirements
    const guest = await createGuest({
      nationality: 'BR',
      documentType: 'passport',
    });

    // Create booking
    const booking = await createBooking({
      guestId: guest.id,
      checkIn: '2024-07-01',
      checkOut: '2024-07-08',
      municipality: 'lisbon',
    });

    // Verify compliance
    expect(booking.touristTax).toBe(32.0); // €4 × 2 guests × 4 nights
    expect(booking.sibaRequired).toBe(true);

    // Generate invoice
    const invoice = await generateInvoice(booking.id);
    expect(invoice.vatAmount).toBeDefined();
    expect(invoice.totalAmount).toBeGreaterThan(0);
  });
});
```

### **E2E Test Scenarios**

```typescript
// Critical user journeys
test.describe('Critical User Journeys', () => {
  test('hostel owner onboarding', async ({ page }) => {
    await page.goto('/onboarding');
    // Complete setup flow
    // Verify compliance configuration
    // Test dashboard access
  });

  test('guest booking to check-in', async ({ page }) => {
    await page.goto('/booking/property-123');
    // Complete booking
    // Receive confirmation
    // Check-in at property
    // Verify invoice generation
  });

  test('staff compliance workflow', async ({ page }) => {
    await loginAsStaff(page);
    // Process check-ins
    // Handle SIBA reporting
    // Generate invoices
    // End-of-day reporting
  });
});
```

---

## Success Metrics & Monitoring

### **Test Coverage Targets**

- **Unit Tests**: 90%+ code coverage
- **Integration Tests**: All critical paths covered
- **E2E Tests**: All user journeys automated
- **Performance Tests**: <2s response times maintained

### **Quality Gates**

- **Pre-commit**: ESLint, TypeScript, unit tests pass
- **Pre-merge**: Integration tests, accessibility checks
- **Pre-release**: E2E tests, performance benchmarks, security scan
- **Post-release**: Real user monitoring, error tracking

### **Monitoring & Alerting**

- **Error Tracking**: Sentry integration for production issues
- **Performance Monitoring**: Response time alerts
- **User Flow Tracking**: Conversion funnel analytics
- **Compliance Monitoring**: Automated compliance checks

---

## Implementation Plan

### **Phase 1: Testing Infrastructure (Week 1-2)**

- Set up Playwright and testing frameworks
- Create test utilities and mock data
- Implement basic user flow tests
- Configure CI/CD testing pipeline

### **Phase 2: Core Feature Testing (Week 3-4)**

- Booking engine test coverage
- Compliance feature validation
- Invoicing system testing
- Mobile responsiveness verification

### **Phase 3: Performance & Security (Week 5-6)**

- Load testing implementation
- Security vulnerability testing
- Accessibility compliance
- Cross-browser compatibility

### **Phase 4: User Acceptance & Launch (Week 7-8)**

- Beta tester program execution
- Feedback integration and fixes
- Final QA validation
- Production deployment preparation

---

## Risk Mitigation

### **Testing Risks**

- **Incomplete Coverage**: Prioritize critical user paths first
- **Flaky Tests**: Implement retry logic and stable selectors
- **Environment Differences**: Use containerized testing environments
- **Data Dependencies**: Create comprehensive test data factories

### **Quality Risks**

- **Regression Bugs**: Maintain comprehensive test suite
- **Performance Degradation**: Continuous performance monitoring
- **Security Vulnerabilities**: Automated security scanning
- **Compliance Failures**: Dedicated compliance test suite

---

## Questions for Clarification

1. **Testing Scope**: Which user roles should have the most comprehensive testing (hostel owners, staff, or guests)?

2. **Automation Level**: What percentage of tests should be automated vs manual?

3. **Performance Benchmarks**: What are the acceptable response time targets for different operations?

4. **Compliance Testing**: Should we include third-party validation of SIBA XML and SAF-T files?

5. **Beta Program**: How many hostels and what duration for the beta testing phase?

This specification provides a comprehensive framework for testing HostelPulse's critical user paths, ensuring reliable operation and compliance with Portuguese regulations across all user journeys.
