# Spec-Kitty: Email Integration & Invoice Delivery

## Overview

**Goal**: Implement professional email functionality for HostelPulse to send invoices, booking confirmations, and notifications using SendGrid for reliable delivery.

**Scope**: Email service integration, invoice delivery, booking confirmations, template management, and delivery tracking.

**Success Criteria**: 99%+ email delivery rate, professional invoice emails with PDF attachments, automated booking confirmations.

---

## Email Requirements Analysis

### Core Use Cases

1. **Invoice Delivery**: Send professional invoices with PDF attachments
2. **Booking Confirmations**: Automated booking confirmation emails
3. **Payment Reminders**: Follow-up emails for outstanding payments
4. **Guest Communications**: Welcome emails and check-in instructions

### Technical Requirements

- **Provider**: SendGrid for reliability and ease of use
- **Templates**: HTML templates with dynamic content
- **Attachments**: PDF invoice attachments
- **Tracking**: Delivery confirmation and bounce handling
- **Localization**: Portuguese + English support

### Compliance Requirements

- **GDPR**: Consent management for marketing emails
- **CAN-SPAM**: Proper unsubscribe mechanisms
- **Data Protection**: Secure handling of guest email addresses
- **Audit Trail**: Email delivery logging for compliance

---

## Implementation Plan

### Phase 1: SendGrid Integration Setup (1-2 weeks)

#### 1.1 SendGrid Account Configuration

- Create SendGrid account and verify domain
- Set up API keys and sending domains
- Configure email templates and branding
- Test email delivery and spam filters

#### 1.2 Email Service Architecture

```typescript
interface EmailConfig {
  provider: 'sendgrid';
  apiKey: string;
  fromEmail: string;
  fromName: string;
  templates: {
    invoice: string;
    bookingConfirmation: string;
    paymentReminder: string;
  };
}

interface EmailData {
  to: string;
  subject: string;
  templateId?: string;
  dynamicData?: Record<string, any>;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
  }>;
}

class EmailService {
  async sendInvoice(invoice: Invoice, guest: Guest): Promise<EmailResult>;
  async sendBookingConfirmation(booking: Booking): Promise<EmailResult>;
  async sendPaymentReminder(booking: Booking): Promise<EmailResult>;
}
```

#### 1.3 Environment Configuration

```env
# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@hostelpulse.com
SENDGRID_FROM_NAME=HostelPulse

# Email Templates
SENDGRID_INVOICE_TEMPLATE=d-template-id-for-invoices
SENDGRID_BOOKING_TEMPLATE=d-template-id-for-bookings
```

### Phase 2: Invoice Email Automation (1 week)

#### 2.1 Invoice Email Template

```html
<!-- Invoice Email Template -->
<h1>Invoice from {{hostelName}}</h1>

<p>Dear {{guestName}},</p>

<p>
  Thank you for staying with us! Here is your invoice for your recent visit.
</p>

<div class="invoice-summary">
  <h3>Invoice #{{invoiceNumber}}</h3>
  <p>Check-in: {{checkInDate}}</p>
  <p>Check-out: {{checkOutDate}}</p>
  <p>Total Amount: €{{totalAmount}}</p>
</div>

<p>Please find your invoice attached as a PDF.</p>

<p>If you have any questions, please contact us at {{contactEmail}}.</p>

<p>Best regards,<br />{{hostelName}} Team</p>
```

#### 2.2 PDF Invoice Attachment

- Generate PDF invoices using existing invoice data
- Attach PDF to email automatically
- Ensure proper formatting and branding
- Include tourist tax breakdown

#### 2.3 Email Integration in Booking Flow

```typescript
// In booking creation action
export async function createBookingWithEmail(
  propertyId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // ... existing booking logic ...

  // Generate invoice
  const invoice = await generateInvoice(booking.id);

  // Send invoice email
  const emailService = new EmailService();
  await emailService.sendInvoice(invoice, booking.guest);

  return {
    message: 'Booking created! Invoice sent to guest email.',
  };
}
```

### Phase 3: Advanced Email Features (1-2 weeks)

#### 3.1 Email Templates Management

- Dynamic template system for different email types
- Multi-language support (Portuguese/English)
- Customizable branding per property
- Template versioning and A/B testing

#### 3.2 Delivery Tracking & Analytics

```typescript
interface EmailResult {
  success: boolean;
  messageId?: string;
  deliveryStatus?: 'delivered' | 'bounced' | 'complained';
  error?: string;
}

// Email analytics tracking
class EmailAnalytics {
  trackDelivery(emailId: string, status: string): Promise<void>;
  getDeliveryStats(
    propertyId: string,
    dateRange: DateRange
  ): Promise<EmailStats>;
}
```

#### 3.3 Error Handling & Retry Logic

- Automatic retry for failed deliveries
- Bounce and complaint handling
- Unsubscribe list management
- Email validation before sending

### Phase 4: Compliance & Monitoring (1 week)

#### 4.1 GDPR Compliance

- Consent management for marketing emails
- Right to erasure (email deletion)
- Data retention policies for email logs
- Privacy notice integration

#### 4.2 Monitoring & Alerting

- Email delivery rate monitoring
- Bounce rate alerts
- Spam complaint tracking
- Performance dashboards

#### 4.3 Backup Email System

- Fallback email provider (Resend/Mailgun)
- Automatic failover on SendGrid outages
- Email queue persistence during outages

---

## Testing Strategy

### Unit Tests

```typescript
describe('EmailService', () => {
  test('should send invoice email successfully', async () => {
    const emailService = new EmailService();
    const result = await emailService.sendInvoice(mockInvoice, mockGuest);

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  test('should handle SendGrid API errors gracefully', async () => {
    // Mock SendGrid API failure
    const result = await emailService.sendInvoice(mockInvoice, mockGuest);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### Integration Tests

```typescript
describe('Email Integration', () => {
  test('should send email after booking creation', async () => {
    // Create booking
    const booking = await createBooking(testData);

    // Verify email was sent (mock or check email service)
    const emailLogs = await getEmailLogs(booking.id);
    expect(emailLogs.length).toBeGreaterThan(0);
  });
});
```

### E2E Tests

```typescript
test.describe('Email User Journey', () => {
  test('guest receives invoice after booking', async ({ page, browser }) => {
    // Create booking through UI
    await page.goto('/booking');
    // ... fill booking form ...

    // Check email was sent
    const emailContext = await browser.newContext();
    // Verify email delivery in test email account
  });
});
```

---

## Success Metrics

### Technical Metrics

- **Email Delivery Rate**: 99%+ successful deliveries
- **Bounce Rate**: <1% hard bounces
- **Open Rate**: >40% for invoice emails
- **Response Time**: <2 seconds for email sending

### Business Metrics

- **Guest Satisfaction**: 95%+ positive feedback on email communications
- **Invoice Processing**: 100% automated invoice delivery
- **Payment Speed**: 20% faster payments due to email reminders
- **Support Reduction**: 30% fewer support tickets about invoices

### Compliance Metrics

- **GDPR Compliance**: 100% consent management
- **Unsubscribe Handling**: <0.1% spam complaints
- **Data Retention**: Automated email log cleanup
- **Audit Trail**: Complete email delivery logging

---

## Risk Assessment

### Technical Risks

- **SendGrid API Limits**: Rate limiting and quota management
- **Email Deliverability**: Domain reputation and spam filters
- **Template Complexity**: Dynamic content rendering issues
- **Attachment Handling**: PDF generation and attachment failures

### Business Risks

- **Email Delivery Failures**: Impact on guest experience and payments
- **Spam Complaints**: Damage to sender reputation
- **GDPR Violations**: Fines for improper consent management
- **Cost Overruns**: Unexpected email volume increases

### Mitigation Strategies

1. **Rate Limiting**: Implement email queuing and throttling
2. **Monitoring**: Real-time delivery tracking and alerts
3. **Fallbacks**: Multiple email providers for redundancy
4. **Testing**: Comprehensive email testing before production

---

## Dependencies & Prerequisites

### External Dependencies

- **SendGrid Account**: API key and verified sending domain
- **Email Templates**: Designed and created in SendGrid dashboard
- **Domain Verification**: SPF/DKIM/DMARC setup for deliverability
- **PDF Generation**: Invoice PDF creation capability

### Internal Dependencies

- **Invoice System**: Working invoice generation (Moloni integration)
- **Booking System**: Completed booking creation workflow
- **Guest Data**: Email addresses and consent status
- **Authentication**: Property access verification

---

## Implementation Timeline

### Week 1: Core Email Setup

- SendGrid account setup and configuration
- Basic email service implementation
- Invoice email template creation
- Simple booking confirmation emails

### Week 2: Advanced Features

- PDF invoice attachments
- Email delivery tracking
- Error handling and retry logic
- GDPR compliance features

### Week 3: Testing & Optimization

- Comprehensive testing across all email types
- Performance optimization
- Delivery rate monitoring
- User feedback integration

### Week 4: Production Deployment

- Production SendGrid configuration
- Monitoring and alerting setup
- Documentation and training
- Go-live support

---

## Questions for Clarification

1. **Email Volume**: Expected monthly email volume (invoices, confirmations, reminders)?
2. **Template Customization**: Need per-property branding or standard templates sufficient?
3. **Multi-language**: Portuguese + English only, or additional languages needed?
4. **Backup Provider**: SendGrid as primary with Resend as backup, or different combination?
5. **Cost Budget**: Monthly email budget and SendGrid plan selection?

This specification provides a comprehensive email integration system that ensures professional communication with guests while maintaining compliance and deliverability standards.
