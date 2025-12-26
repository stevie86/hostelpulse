# Task 1: SendGrid Setup & Basic Email Service

## Overview

Establish SendGrid integration and create a basic email service for HostelPulse to send invoices and booking confirmations.

## Objectives

- Configure SendGrid account and API access
- Implement basic EmailService class
- Create email templates for invoices and bookings
- Set up environment configuration

## Implementation Steps

### 1.1 SendGrid Account Setup

- Create SendGrid account at sendgrid.com
- Verify sending domain (noreply@hostelpulse.com)
- Generate API key with full access permissions
- Configure domain authentication (SPF, DKIM, DMARC)
- Test email delivery to ensure deliverability

### 1.2 Email Service Implementation

```typescript
// lib/email-service.ts
import sgMail from '@sendgrid/mail';

interface EmailConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
}

class EmailService {
  constructor(config: EmailConfig) {
    sgMail.setApiKey(config.apiKey);
    this.fromEmail = config.fromEmail;
    this.fromName = config.fromName;
  }

  async sendEmail(
    emailData: EmailData
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const msg = {
        to: emailData.to,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: emailData.subject,
        html: emailData.html,
        attachments: emailData.attachments,
      };

      const result = await sgMail.send(msg);

      return {
        success: true,
        messageId: result[0]?.headers?.['x-message-id'],
      };
    } catch (error) {
      console.error('SendGrid email error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email error',
      };
    }
  }
}
```

### 1.3 Basic Email Templates

```typescript
// lib/email-templates.ts
export const invoiceEmailTemplate = (data: {
  guestName: string;
  invoiceNumber: string;
  totalAmount: string;
  checkInDate: string;
  checkOutDate: string;
  hostelName: string;
  contactEmail: string;
}) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #2563eb;">Invoice from ${data.hostelName}</h1>

    <p>Dear ${data.guestName},</p>

    <p>Thank you for staying with us! Here is your invoice for your recent visit.</p>

    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Invoice #${data.invoiceNumber}</h3>
      <p><strong>Check-in:</strong> ${data.checkInDate}</p>
      <p><strong>Check-out:</strong> ${data.checkOutDate}</p>
      <p><strong>Total Amount:</strong> €${data.totalAmount}</p>
    </div>

    <p>Please find your invoice attached as a PDF.</p>

    <p>If you have any questions, please contact us at <a href="mailto:${data.contactEmail}">${data.contactEmail}</a>.</p>

    <p>Best regards,<br>The ${data.hostelName} Team</p>
  </div>
`;

export const bookingConfirmationTemplate = (data: {
  guestName: string;
  bookingId: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: string;
  hostelName: string;
}) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #2563eb;">Booking Confirmation</h1>

    <p>Dear ${data.guestName},</p>

    <p>Your booking has been confirmed! Here are the details:</p>

    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Booking #${data.bookingId}</h3>
      <p><strong>Check-in:</strong> ${data.checkInDate}</p>
      <p><strong>Check-out:</strong> ${data.checkOutDate}</p>
      <p><strong>Total Amount:</strong> €${data.totalAmount}</p>
    </div>

    <p>We look forward to welcoming you to ${data.hostelName}!</p>

    <p>Best regards,<br>The ${data.hostelName} Team</p>
  </div>
`;
```

### 1.4 Environment Configuration

```env
# SendGrid Configuration
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
SENDGRID_FROM_EMAIL=noreply@hostelpulse.com
SENDGRID_FROM_NAME=HostelPulse

# Email Service Settings
EMAIL_ENABLED=true
EMAIL_PROVIDER=sendgrid
```

## Success Criteria

- [ ] SendGrid account created and verified
- [ ] API key generated and configured
- [ ] EmailService class functional
- [ ] Basic email templates created
- [ ] Test emails sent successfully
- [ ] Environment variables configured

## Dependencies

- SendGrid account creation (external)
- Domain verification (external)
- Environment variable setup

## Testing

- Send test emails to verify deliverability
- Test different email clients (Gmail, Outlook, etc.)
- Verify email formatting and branding
- Test error handling for invalid email addresses

## Deliverables

- [ ] SendGrid account and API configuration
- [ ] `lib/email-service.ts` with EmailService class
- [ ] `lib/email-templates.ts` with basic templates
- [ ] Environment configuration documented
- [ ] Test email functionality verified
