import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        beds: {
          include: {
            room: true,
          },
        },
        property: {
          select: {
            name: true,
            address: true,
            city: true,
            country: true,
            taxRate: true,
            cityTaxRate: true,
          },
        },
      },
    });

    if (!booking) {
      return new NextResponse('Booking not found', { status: 404 });
    }

    // Generate invoice HTML
    const nights = Math.ceil(
      (booking.checkOut.getTime() - booking.checkIn.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const roomPrice = booking.beds[0]?.pricePerNight || 0;
    const accommodationTotal = roomPrice * nights;
    const taxRate = booking.property?.taxRate || 0;
    const cityTaxRate = booking.property?.cityTaxRate || 2.0;
    const touristTax = cityTaxRate * nights;
    const subtotal = accommodationTotal;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount + touristTax;

    const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #2c3e50; margin-bottom: 5px; }
        .header p { color: #7f8c8d; margin: 0; }
        .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .info-section { flex: 1; }
        .info-section h3 { margin-bottom: 10px; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
        .info-section p { margin: 5px 0; }
        .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .invoice-table th { background-color: #3498db; color: white; }
        .invoice-table tr:nth-child(even) { background-color: #f2f2f2; }
        .totals { text-align: right; margin-top: 20px; }
        .totals div { margin: 5px 0; }
        .totals .total { font-weight: bold; font-size: 18px; color: #2c3e50; border-top: 2px solid #3498db; padding-top: 10px; }
        .footer { margin-top: 40px; text-align: center; color: #7f8c8d; font-size: 12px; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .status.paid { background-color: #27ae60; color: white; }
        .status.pending { background-color: #f39c12; color: white; }
    </style>
</head>
<body>
    <div class="header">
        <h1>INVOICE</h1>
        <p>Invoice #${booking.confirmationCode || booking.id}</p>
    </div>

    <div class="invoice-info">
        <div class="info-section">
            <h3>Property Information</h3>
            <p><strong>${booking.property?.name}</strong></p>
            <p>${booking.property?.address}</p>
            <p>${booking.property?.city}, ${booking.property?.country}</p>
        </div>
        <div class="info-section">
            <h3>Guest Information</h3>
            <p><strong>${booking.guest?.firstName} ${booking.guest?.lastName}</strong></p>
            <p>${booking.guest?.email || 'N/A'}</p>
            <p>${booking.guest?.phone || 'N/A'}</p>
        </div>
        <div class="info-section">
            <h3>Booking Details</h3>
            <p><strong>Check-in:</strong> ${booking.checkIn.toLocaleDateString()}</p>
            <p><strong>Check-out:</strong> ${booking.checkOut.toLocaleDateString()}</p>
            <p><strong>Nights:</strong> ${nights}</p>
            <p><strong>Room:</strong> ${booking.beds[0]?.room.name}</p>
            <p><strong>Status:</strong> <span class="status ${booking.paymentStatus === 'paid' ? 'paid' : 'pending'}">${booking.paymentStatus}</span></p>
        </div>
    </div>

    <table class="invoice-table">
        <thead>
            <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Room Rental - ${booking.beds[0]?.room.name}</td>
                <td>${nights} nights</td>
                <td>€${roomPrice}</td>
                <td>€${accommodationTotal.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Tourist Tax</td>
                <td>${nights} nights</td>
                <td>€${cityTaxRate}</td>
                <td>€${touristTax.toFixed(2)}</td>
            </tr>
        </tbody>
    </table>

    <div class="totals">
        <div><strong>Subtotal:</strong> €${subtotal.toFixed(2)}</div>
        <div><strong>Tax (${taxRate}%):</strong> €${taxAmount.toFixed(2)}</div>
        <div><strong>Tourist Tax:</strong> €${touristTax.toFixed(2)}</div>
        <div class="total"><strong>TOTAL:</strong> €${total.toFixed(2)}</div>
    </div>

    <div class="footer">
        <p>This invoice was automatically generated by HostelPulse</p>
        <p>Thank you for your stay!</p>
    </div>
</body>
</html>
    `;

    return new Response(invoiceHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="invoice-${booking.confirmationCode || booking.id}.html"`,
      },
    });
  } catch (error) {
    console.error('Invoice generation error:', error);
    return new NextResponse('Failed to generate invoice', { status: 500 });
  }
}
