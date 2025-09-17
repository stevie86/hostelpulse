import { NextApiRequest, NextApiResponse } from 'next'
import handler from '../../pages/api/guests'

jest.mock('../../lib/corsHandler', () => ({ withCors: (h: any) => h }))
jest.mock('../../lib/apiAuth', () => ({ withAuth: (h: any) => (req: any, res: any) => h(req, res, { user: { id: 'owner-1' }, isAdmin: false }) }))
jest.mock('../../lib/audit', () => ({ logAudit: jest.fn().mockResolvedValue(undefined) }))

const chain = () => ({ select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), neq: jest.fn().mockReturnThis(), order: jest.fn() })

const supabaseMock = {
  from: (table: string) => {
    if (table === 'guests') {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [{ id: 'g1' }], error: null }),
        single: jest.fn().mockResolvedValue({ data: { id: 'g1' }, error: null }),
        update: jest.fn().mockResolvedValue({ data: { id: 'g1' }, error: null }),
      }
    }
    if (table === 'bookings') {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        // No active bookings
        then: undefined,
        order: jest.fn(),
        // simulate final call on select chain
        // Use a method that our code calls last: eq/neq returns this; we need to return final value via a resolved promise
        // We'll intercept by returning value when .neq is called in test setup if needed
      } as any
    }
    throw new Error('unexpected table ' + table)
  },
}

jest.mock('../../lib/supabase', () => ({ supabase: supabaseMock }))

function createRes() {
  const res: Partial<NextApiResponse> = {
    setHeader: jest.fn(),
    status: jest.fn().mockReturnValue({ json: jest.fn(), end: jest.fn() }),
    json: jest.fn(),
    end: jest.fn(),
  }
  return res as NextApiResponse
}

describe('Guests API - CRUD (soft delete)', () => {
  it('lists guests (non-archived)', async () => {
    const req = { method: 'GET' } as unknown as NextApiRequest
    const res = createRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('archives guest on DELETE when no active bookings', async () => {
    // Mock bookings select to return empty array
    const bookings = supabaseMock.from('bookings') as any
    bookings.select = jest.fn().mockReturnThis()
    bookings.eq = jest.fn().mockReturnThis()
    bookings.neq = jest.fn().mockResolvedValue({ data: [], error: null })

    const req = { method: 'DELETE', body: { id: 'g1' } } as unknown as NextApiRequest
    const res = createRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
  })
})
