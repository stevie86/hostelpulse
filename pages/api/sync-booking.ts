import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Mock Booking.com sync
    // In production, this would connect to Booking.com API
    const syncResult = {
      syncedBookings: 3,
      newBookings: 1,
      updatedBookings: 2,
      lastSync: new Date().toISOString(),
      status: 'success'
    }

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000))

    res.status(200).json({
      success: true,
      message: 'Successfully synced with Booking.com!',
      result: syncResult
    })
  } catch (error) {
    console.error('Booking.com sync error:', error)
    res.status(500).json({ error: 'Failed to sync with Booking.com' })
  }
}