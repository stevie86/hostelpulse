import { NextApiRequest, NextApiResponse } from 'next'

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
const isDev = process.env.NODE_ENV === 'development'

export function corsHandler(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  const origin = req.headers.origin
  
  // In development, allow all origins
  if (isDev) {
    res.setHeader('Access-Control-Allow-Origin', '*')
  } else {
    // In production, only allow specified origins
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
    }
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-token')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  
  next()
}

export function withCors(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    return new Promise<void>((resolve, reject) => {
      corsHandler(req, res, async () => {
        try {
          await handler(req, res)
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    })
  }
}
