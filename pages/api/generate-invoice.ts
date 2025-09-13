import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Mock invoice generation
    // In production, this would generate a real PDF invoice
    const invoiceData = {
      invoiceNumber: `INV-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      hostelName: 'Lisbon Central Hostel',
      guestName: 'João Silva',
      amount: 120.00,
      taxAmount: 4.00, // Lisbon City Tax
      totalAmount: 124.00,
      items: [
        {
          description: 'Room booking (3 nights)',
          quantity: 1,
          unitPrice: 120.00,
          total: 120.00
        },
        {
          description: 'Lisbon City Tax',
          quantity: 1,
          unitPrice: 4.00,
          total: 4.00
        }
      ]
    }

    // For MVP, just return the invoice data
    // In production, this would generate and return a PDF
    res.status(200).json({
      success: true,
      message: 'Invoice generated successfully!',
      invoice: invoiceData
    })
  } catch (error) {
    console.error('Invoice generation error:', error)
    res.status(500).json({ error: 'Failed to generate invoice' })
  }
}