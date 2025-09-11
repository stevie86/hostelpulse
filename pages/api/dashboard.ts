import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Mock dashboard data for tax/invoice information
  const dashboardData = {
    taxCollected: 1500.50,
    invoicesGenerated: 45,
    totalRevenue: 25000.00,
    bookingsThisMonth: 120,
    pendingTaxes: 200.00,
    lastSync: new Date().toISOString(),
  };

  res.status(200).json(dashboardData);
}