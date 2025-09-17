import { NextApiRequest, NextApiResponse } from 'next'
import handler from '../../pages/api/bookings'

// Mock CORS and Auth wrappers to pass-through
jest.mock('../../lib/corsHandler', () => ({ withCors: (h: any) => h }))
jest.mock('../../lib/apiAuth', () => ({ withAuth: (h: any) => (req: any, res: any) => h(req, res, { user: { id: 'owner-1' }, isAdmin: false }) }))
jest.mock('../../lib/audit', () => ({ logAudit: jest.fn().mockResolvedValue(undefined) }))

// Supabase mock
const mockUpdate = jest.fn()
const mockSelect = jest.fn()
const mockEq = jest.fn()
const mockOrder = jest.fn()
const mockSingle = jest.fn()

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'bookings') {
        return {
          update: mockUpdate,
          select: mockSelect.mockReturnThis(),
          eq: mockEq.mockReturnThis(),
          order: mockOrder,
          single: mockSingle,
          neq: jest.fn().mockReturnThis(),
          or: jest.fn().mockReturnThis(),
        }
      }
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

describe('Bookings API - CRUD', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('archives booking on DELETE (soft delete)', async () => {
    mockUpdate.mockResolvedValueOnce({ data: { id: 'b1' }, error: null })

    const req = { method: 'DELETE', body: { id: 'b1' } } as unknown as NextApiRequest
    const res = createRes()
    await handler(req, res)

    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 'cancelled' }))
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('fetches a single booking by id', async () => {
    singleMock.mockResolvedValueOnce({ data: { id: 'b1' }, error: null })
    const req = { method: 'GET', query: { id: 'b1' } } as unknown as NextApiRequest
    const res = createRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect((res.json as any).mock.calls[0][0]).toEqual({ id: 'b1' })
  })
})
