import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password, name } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  // Mock registration for MVP demo
  // In production, this would create a real user in the database
  if (email === 'demo@hostelpulse.com') {
    return res.status(400).json({ error: 'User already exists. Use login instead.' })
  }

  const mockUser = {
    id: Date.now(), // Simple ID generation for demo
    email,
    name: name || 'New User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  res.status(201).json({ user: mockUser })
}