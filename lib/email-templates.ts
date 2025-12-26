/**
 * Email Templates for HostelPulse
 * Professional HTML templates for invoice and booking emails
 */

export const invoiceEmailTemplate = (data: {
  guestName: string;
  invoiceNumber: string;
  totalAmount: string;
  checkInDate: string;
  checkOutDate: string;
  hostelName: string;
  contactEmail: string;
  touristTax?: string;
}) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">${data.hostelName || 'HostelPulse'}</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Professional Hostel Management</p>
    </div>

    <div style="padding: 30px 20px;">
      <h2 style="color: #333; margin-bottom: 20px;">Invoice Ready</h2>

      <p>Dear ${data.guestName},</p>

      <p>Thank you for choosing ${data.hostelName || 'HostelPulse'} for your accommodation needs. Your invoice has been generated and is attached to this email.</p>

      <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Invoice Details</h3>
        <p style="margin: 5px 0;"><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
        <p style="margin: 5px 0;"><strong>Check-in:</strong> ${data.checkInDate}</p>
        <p style="margin: 5px 0;"><strong>Check-out:</strong> ${data.checkOutDate}</p>
        ${data.touristTax ? `<p style="margin: 5px 0;"><strong>Tourist Tax:</strong> €${data.touristTax}</p>` : ''}
        <p style="margin: 5px 0;"><strong>Total Amount:</strong> €${data.totalAmount}</p>
        <p style="margin: 5px 0; font-size: 14px; color: #666;">
          Please find your detailed invoice attached as a PDF.
        </p>
      </div>

      <p>If you have any questions about your invoice or need assistance, please don't hesitate to contact our support team.</p>

      <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <p style="margin: 0; color: #666;">
          <strong>Need help?</strong><br>
          Contact us at ${data.contactEmail || 'support@hostelpulse.com'}<br>
          Or visit our help center
        </p>
      </div>

      <p style="color: #666; font-size: 14px;">
        This email was sent by ${data.hostelName || 'HostelPulse'}. Please keep this invoice for your records.
      </p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="margin: 0; color: #666; font-size: 12px;">
        © 2025 ${data.hostelName || 'HostelPulse'}. All rights reserved.<br>
        Professional hostel management for the modern traveler.
      </p>
    </div>
  </div>
`;

export const bookingConfirmationTemplate = (data: {
  guestName: string;
  bookingId: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: string;
  hostelName: string;
  touristTax?: string;
  roomType?: string;
}) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">Booking Confirmed!</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Welcome to ${data.hostelName || 'HostelPulse'}</p>
    </div>

    <div style="padding: 30px 20px;">
      <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.guestName},</h2>

      <p>Your booking has been confirmed! We're excited to welcome you to ${data.hostelName || 'HostelPulse'}.</p>

      <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Booking Details</h3>
        <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${data.bookingId}</p>
        <p style="margin: 5px 0;"><strong>Check-in:</strong> ${data.checkInDate}</p>
        <p style="margin: 5px 0;"><strong>Check-out:</strong> ${data.checkOutDate}</p>
        ${data.roomType ? `<p style="margin: 5px 0;"><strong>Room Type:</strong> ${data.roomType}</p>` : ''}
        ${data.touristTax ? `<p style="margin: 5px 0;"><strong>Tourist Tax:</strong> €${data.touristTax}</p>` : ''}
        <p style="margin: 5px 0;"><strong>Total Amount:</strong> €${data.totalAmount}</p>
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
        © 2025 ${data.hostelName || 'HostelPulse'}. All rights reserved.<br>
        Professional hostel management for the modern traveler.
      </p>
    </div>
  </div>
`;

export const paymentReminderTemplate = (data: {
  guestName: string;
  bookingId: string;
  amountDue: string;
  dueDate: string;
  hostelName: string;
  contactEmail: string;
}) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
    <div style="background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); color: white; padding: 30px 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">Payment Reminder</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Action Required</p>
    </div>

    <div style="padding: 30px 20px;">
      <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.guestName},</h2>

      <p>This is a friendly reminder that payment is due for your upcoming booking with ${data.hostelName || 'HostelPulse'}.</p>

      <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">Payment Details</h3>
        <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${data.bookingId}</p>
        <p style="margin: 5px 0;"><strong>Amount Due:</strong> €${data.amountDue}</p>
        <p style="margin: 5px 0;"><strong>Due Date:</strong> ${data.dueDate}</p>
      </div>

      <p>Please ensure payment is made by the due date to confirm your booking. You can pay securely through our booking system or contact us for alternative arrangements.</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="#" style="background: #4caf50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Pay Now Securely
        </a>
      </div>

      <p>If you've already made payment, please disregard this reminder. If you have any questions about your booking or payment, please contact us at ${data.contactEmail || 'support@hostelpulse.com'}.</p>

      <p style="color: #666; font-size: 14px;">
        This is an automated payment reminder. Booking cancellation may apply if payment is not received by the due date.
      </p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="margin: 0; color: #666; font-size: 12px;">
        © 2025 ${data.hostelName || 'HostelPulse'}. All rights reserved.<br>
        Professional hostel management for the modern traveler.
      </p>
    </div>
  </div>
`;

// Test function to demonstrate templates
export const testEmailTemplates = () => {
  console.log('=== Email Template Test ===\n');

  // Test invoice template
  const invoiceHtml = invoiceEmailTemplate({
    guestName: 'João Silva',
    invoiceNumber: 'INV-2025-0001',
    totalAmount: '156.00',
    checkInDate: '2025-07-01',
    checkOutDate: '2025-07-05',
    hostelName: 'Lisbon Central Hostel',
    contactEmail: 'support@lisbonhostel.com',
    touristTax: '20.00',
  });

  console.log('✅ Invoice template generated');
  console.log('📧 Invoice HTML length:', invoiceHtml.length, 'characters\n');

  // Test booking confirmation template
  const bookingHtml = bookingConfirmationTemplate({
    guestName: 'Maria Santos',
    bookingId: 'BK-2025-0123',
    checkInDate: '2025-08-15',
    checkOutDate: '2025-08-20',
    totalAmount: '280.00',
    hostelName: 'Porto Backpackers',
    touristTax: '32.00',
    roomType: '6-bed dorm',
  });

  console.log('✅ Booking confirmation template generated');
  console.log('📧 Booking HTML length:', bookingHtml.length, 'characters\n');

  // Test payment reminder template
  const reminderHtml = paymentReminderTemplate({
    guestName: 'Carlos Oliveira',
    bookingId: 'BK-2025-0456',
    amountDue: '120.00',
    dueDate: '2025-06-30',
    hostelName: 'Algarve Surf Hostel',
    contactEmail: 'bookings@algarvehostel.com',
  });

  console.log('✅ Payment reminder template generated');
  console.log('📧 Reminder HTML length:', reminderHtml.length, 'characters\n');

  console.log('🎨 All email templates ready for production use!');
};
