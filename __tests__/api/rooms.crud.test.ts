import { NextApiRequest, NextApiResponse } from 'next'
import handler from '../../pages/api/rooms'

jest.mock('../../lib/corsHandler', () => ({ withCors: (h: any) => h }))
jest.mock('../../lib/apiAuth', () => ({ withAuth: (h: any) => (req: any, res: any) => h(req, res, { user: { id: 'owner-1' }, isAdmin: false }) }))
jest.mock('../../lib/audit', () => ({ logAudit: jest.fn().mockResolvedValue(undefined) }))

const roomsObj: any = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  order: jest.fn().mockResolvedValue({ data: [{ id: 'r1', beds: [{ id: 'b1', archived: false }] }], error: null }),
  single: jest.fn().mockResolvedValue({ data: { id: 'r1', beds: [] }, error: null }),
  update: jest.fn().mockResolvedValue({ data: { id: 'r1' }, error: null }),
}

const bedsObj: any = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  update: jest.fn().mockResolvedValue({ data: null, error: null }),
  delete: jest.fn().mockResolvedValue({ data: null, error: null }),
}

const bookingsObj: any = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  or: jest.fn().mockResolvedValue({ data: [], error: null }),
}

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'rooms') return roomsObj
      if (table === 'beds') return bedsObj
      if (table === 'bookings') return bookingsObj
      throw new Error('unexpected table ' + table)
    },
  },
}))

function createRes() {
  const res: Partial<NextApiResponse> = {
    setHeader: jest.fn(),
    status: jest.fn().mockReturnValue({ json: jest.fn(), end: jest.fn() }),
    json: jest.fn(),
    end: jest.fn(),
  }
  return res as NextApiResponse
}

describe('Rooms API - CRUD (soft delete)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('lists rooms and filters archived beds', async () => {
    const req = { method: 'GET' } as unknown as NextApiRequest
    const res = createRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('archives room and beds on DELETE when no active bookings', async () => {
    const req = { method: 'DELETE', body: { id: 'r1' } } as unknown as NextApiRequest
    const res = createRes()
    await handler(req, res)
    expect(bedsObj.update).toHaveBeenCalled()
    expect(roomsObj.update).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(200)
  })
})
