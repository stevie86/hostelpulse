import prisma from '@/lib/db';

interface BillingResult {
  success: boolean;
  message: string;
  invoiceId?: string;
  url?: string;
  error?: string;
}

// Billing Service - handles invoice generation based on provider preferences
export const billingService = {
  async generateInvoice(
    bookingId: string,
    propertyId: string
  ): Promise<BillingResult> {
    try {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: {
          invoicingProvider: true,
          externalInvoiceUrl: true,
        },
      });

      if (!property) {
        throw new Error('Property not found');
      }

      switch (property.invoicingProvider) {
        case 'moloni':
          return await this.generateMoloniInvoice(bookingId, propertyId);
        case 'external':
          return await this.triggerExternalInvoice(
            bookingId,
            property.externalInvoiceUrl
          );
        case 'manual':
        default:
          return {
            success: true,
            message: 'Manual invoicing - no action taken',
          };
      }
    } catch (error) {
      console.error('Billing service error:', error);
      return {
        success: false,
        message: 'Billing failed',
        error: error instanceof Error ? error.message : 'Unknown billing error',
      };
    }
  },

  async generateMoloniInvoice(
    bookingId: string,
    propertyId: string
  ): Promise<BillingResult> {
    console.log(`📄 Generating Moloni invoice for booking ${bookingId}`);

    try {
      // Import improved Moloni service
      const { moloniService } = await import('@/lib/services/moloniService');

      // Get booking details for invoice
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          guest: true,
          room: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!booking || !booking.guest) {
        throw new Error('Booking or guest not found');
      }

      // Prepare invoice lines from booking
      const nights = Math.ceil(
        (new Date(booking.checkOut).getTime() -
          new Date(booking.checkIn).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      const invoiceLines = [
        {
          name: `Estadia - ${booking.room?.name || 'Quarto'} (${nights} noites)`,
          qty: nights,
          price: booking.totalPrice / nights, // Price per night
          taxId: '1', // Standard Portuguese tax rate (23%)
        },
      ];

      // Add tourist tax if applicable
      if (booking.totalTouristTax && booking.totalTouristTax > 0) {
        invoiceLines.push({
          name: 'Taxa Turística',
          qty: 1,
          price: booking.totalTouristTax,
          taxId: '2', // Tourist tax rate
          exemptionReason: 'Isento de taxa nos termos do artigo 15º do EBF',
        });
      }

      // Create invoice with Moloni
      const result = await moloniService.createInvoice(
        booking.guest.nif || '999999990', // Guest NIF or default
        {
          name: booking.guest.name,
          email: booking.guest.email,
          nif: booking.guest.nif,
          address: booking.guest.address,
        },
        invoiceLines,
        {
          series: 'FT', // Fatura (invoice) series
          notes: `Booking ID: ${bookingId}\nCheck-in: ${booking.checkIn.toLocaleDateString('pt-PT')}\nCheck-out: ${booking.checkOut.toLocaleDateString('pt-PT')}`,
        }
      );

      console.log('✅ Moloni invoice generated successfully:', result);

      // Send invoice by email if guest has email
      if (booking.guest.email && result.url_pdf) {
        await moloniService.sendInvoiceByEmail(
          result.document_id!,
          booking.guest.email
        );
      }

      return {
        success: true,
        message: 'Moloni invoice created and sent successfully',
        invoiceId: result.document_id,
        url: result.url,
      };
    } catch (error) {
      console.error('❌ Moloni invoice generation failed:', error);
      return {
        success: false,
        message: 'Moloni invoice generation failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async triggerExternalInvoice(
    bookingId: string,
    externalUrl?: string | null
  ): Promise<BillingResult> {
    if (!externalUrl) {
      throw new Error('External invoice URL not configured');
    }

    // TODO: Implement external invoicing workflow
    console.log(
      `🔗 Triggering external invoice at ${externalUrl} for booking ${bookingId}`
    );

    // Could send webhook, email, or redirect with booking data
    return {
      success: true,
      message: 'External invoice triggered',
      url: externalUrl,
    };
  },
};
