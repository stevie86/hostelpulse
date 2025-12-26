/**
 * Email Service Implementation
 * Basic email functionality for MVP - SendGrid integration ready
 *
 * This provides the foundation for professional email delivery
 * Can be upgraded to use @sendgrid/mail package when npm is available
 */

export interface EmailConfig {
  provider: string; // 'sendgrid' for production
  apiKey?: string;
  fromEmail: string;
  fromName: string;
}

export interface EmailData {
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

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Mock SendGrid client for MVP demonstration
class MockSendGridClient {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  async send(emailData: EmailData): Promise<EmailResult> {
    // In production, this would use @sendgrid/mail
    console.log('📧 Email Service (MVP Mode):');
    console.log(`From: ${this.config.fromName} <${this.config.fromEmail}>`);
    console.log(`To: ${emailData.to}`);
    console.log(`Subject: ${emailData.subject}`);
    console.log(`Attachments: ${emailData.attachments?.length || 0}`);

    // Simulate successful send for MVP
    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }
}

class EmailService {
  private client: MockSendGridClient;
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
    this.client = new MockSendGridClient(config);
  }

  /**
   * Send an invoice email with PDF attachment
   */
  async sendInvoice(
    invoiceNumber: string,
    guestEmail: string,
    guestName: string,
    totalAmount: string,
    pdfContent?: string
  ): Promise<EmailResult> {
    const subject = `Invoice ${invoiceNumber} from HostelPulse`;
    const html = this.generateInvoiceEmailHTML(
      invoiceNumber,
      guestName,
      totalAmount
    );

    const emailData: EmailData = {
      to: guestEmail,
      subject,
      html,
      attachments: pdfContent
        ? [
            {
              content: Buffer.from(pdfContent).toString('base64'),
              filename: `invoice-${invoiceNumber}.pdf`,
              type: 'application/pdf',
              disposition: 'attachment',
            },
          ]
        : undefined,
    };

    return this.client.send(emailData);
  }

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmation(
    bookingId: string,
    guestEmail: string,
    guestName: string,
    checkInDate: string,
    checkOutDate: string,
    totalAmount: string
  ): Promise<EmailResult> {
    const subject = `Booking Confirmation - ${bookingId}`;
    const html = this.generateBookingEmailHTML(
      bookingId,
      guestName,
      checkInDate,
      checkOutDate,
      totalAmount
    );

    const emailData: EmailData = {
      to: guestEmail,
      subject,
      html,
    };

    return this.client.send(emailData);
  }

  /**
   * Send payment reminder email
   */
  async sendPaymentReminder(
    bookingId: string,
    guestEmail: string,
    guestName: string,
    amountDue: string,
    dueDate: string
  ): Promise<EmailResult> {
    const subject = `Payment Reminder - Booking ${bookingId}`;
    const html = this.generateReminderEmailHTML(
      bookingId,
      guestName,
      amountDue,
      dueDate
    );

    const emailData: EmailData = {
      to: guestEmail,
      subject,
      html,
    };

    return this.client.send(emailData);
  }

  /**
   * Generate professional invoice email HTML
   */
  private generateInvoiceEmailHTML(
    invoiceNumber: string,
    guestName: string,
    totalAmount: string
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">HostelPulse</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Professional Hostel Management</p>
        </div>

        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Invoice Ready</h2>

          <p>Dear ${guestName},</p>

          <p>Thank you for choosing HostelPulse for your accommodation needs. Your invoice has been generated and is attached to this email.</p>

          <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Invoice Details</h3>
            <p style="margin: 5px 0;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> €${totalAmount}</p>
            <p style="margin: 5px 0; font-size: 14px; color: #666;">
              Please find your detailed invoice attached as a PDF.
            </p>
          </div>

          <p>If you have any questions about your invoice or need assistance, please don't hesitate to contact our support team.</p>

          <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <p style="margin: 0; color: #666;">
              <strong>Need help?</strong><br>
              Contact us at support@hostelpulse.com<br>
              Or visit our help center
            </p>
          </div>

          <p style="color: #666; font-size: 14px;">
            This email was sent by HostelPulse. Please keep this invoice for your records.
          </p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            © 2025 HostelPulse. All rights reserved.<br>
            Professional hostel management for the modern traveler.
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Generate booking confirmation email HTML
   */
  private generateBookingEmailHTML(
    bookingId: string,
    guestName: string,
    checkInDate: string,
    checkOutDate: string,
    totalAmount: string
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Booking Confirmed!</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Welcome to HostelPulse</p>
        </div>

        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${guestName},</h2>

          <p>Your booking has been confirmed! We're excited to welcome you to your accommodation.</p>

          <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Booking Details</h3>
            <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${bookingId}</p>
            <p style="margin: 5px 0;"><strong>Check-in:</strong> ${checkInDate}</p>
            <p style="margin: 5px 0;"><strong>Check-out:</strong> ${checkOutDate}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> €${totalAmount}</p>
          </div>

          <div style="background: #e8f5e8; border-left: 4px solid #4caf50; padding: 20px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #2e7d32;">What's Next?</h4>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>You'll receive a check-in reminder 24 hours before arrival</li>
              <li>Bring a valid ID for check-in procedures</li>
              <li>Payment will be collected upon arrival</li>
              <li>Contact the property directly for special requests</li>
            </ul>
          </div>

          <p>If you need to make changes to your booking or have any questions, please contact us immediately.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Booking Details
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">
            This is an automated confirmation email. Please keep this email for your records.
          </p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            © 2025 HostelPulse. All rights reserved.<br>
            Professional hostel management for the modern traveler.
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Generate payment reminder email HTML
   */
  private generateReminderEmailHTML(
    bookingId: string,
    guestName: string,
    amountDue: string,
    dueDate: string
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); color: white; padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Payment Reminder</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Action Required</p>
        </div>

        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${guestName},</h2>

          <p>This is a friendly reminder that payment is due for your upcoming booking.</p>

          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #856404;">Payment Details</h3>
            <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${bookingId}</p>
            <p style="margin: 5px 0;"><strong>Amount Due:</strong> €${amountDue}</p>
            <p style="margin: 5px 0;"><strong>Due Date:</strong> ${dueDate}</p>
          </div>

          <p>Please ensure payment is made by the due date to confirm your booking. You can pay securely through our booking system or contact us for alternative arrangements.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: #4caf50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Pay Now Securely
            </a>
          </div>

          <p>If you've already made payment, please disregard this reminder. If you have any questions about your booking or payment, please contact us immediately.</p>

          <p style="color: #666; font-size: 14px;">
            This is an automated payment reminder. Booking cancellation may apply if payment is not received by the due date.
          </p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            © 2025 HostelPulse. All rights reserved.<br>
            Professional hostel management for the modern traveler.
          </p>
        </div>
      </div>
    `;
  }
}

// Default configuration for MVP
const defaultEmailConfig: EmailConfig = {
  provider: 'sendgrid',
  fromEmail: 'noreply@hostelpulse.com',
  fromName: 'HostelPulse',
};

// Export singleton instance
export const emailService = new EmailService(defaultEmailConfig);
export { EmailService };
