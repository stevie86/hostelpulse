import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  // Mock authentication for MVP demo
  // In production, this would validate against a real database
  if (email === 'demo@hostelpulse.com' && password === 'demo123') {
    const mockUser = {
      id: 1,
      email: 'demo@hostelpulse.com',
      name: 'Demo Hostel Owner',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    res.status(200).json({ user: mockUser })
  } else {
    return res.status(401).json({ error: 'Invalid email or password. Use demo@hostelpulse.com / demo123' })
  }
}