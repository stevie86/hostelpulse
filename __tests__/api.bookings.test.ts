import handler from '../pages/api/bookings'

function mockReqRes(method: string, body?: any) {
  const req: any = { method, body, query: {} }
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    setHeader: jest.fn(),
    send: jest.fn(),
  }
  return { req, res }
}

// Minimal fake Supabase client builder for bookings
function makeSupabase(overlapRows: any[] = [], listRows: any[] = [], createdRow?: any) {
  return {
    from: (table: string) => {
      if (table !== 'bookings') throw new Error('unexpected table ' + table)
      return {
        select: (fields: string) => {
          if (fields.startsWith('id,')) {
            // overlap check chain: .eq().in() -> Promise
            return {
              eq: (_c: string, _v: any) => ({
                in: (_c2: string, _vals: any[]) => Promise.resolve({ data: overlapRows, error: null }),
              }),
            }
          }
          // list chain: .order() -> Promise
          return {
            order: (_f: string, _opts: any) => Promise.resolve({ data: listRows, error: null }),
          }
        },
        insert: (_payload: any) => ({
          select: (_: string) => ({
            single: () => Promise.resolve({ data: createdRow || { id: 'new-booking' }, error: null }),
          }),
        }),
        update: (_upd: any) => ({
          eq: (_c: string, _v: any) => ({
            select: (_: string) => ({ single: () => Promise.resolve({ data: { id: 'updated', status: _upd?.status }, error: null }) }),
          }),
        }),
      }
    },
  } as any
}

jest.mock('../lib/supabase', () => ({
  getSupabaseServer: jest.fn(),
}))

const supaModule = require('../lib/supabase')

describe('API /api/bookings', () => {
  it('rejects overlapping bookings with 409', async () => {
    supaModule.getSupabaseServer.mockReturnValue(
      makeSupabase(
        // overlapRows
        [{ id: 'existing', check_in: '2025-10-15', check_out: '2025-10-17' }],
        // listRows
        []
      )
    )
    const { req, res } = mockReqRes('POST', {
      hostel_id: 'h1',
      guest_id: 'g1',
      check_in: '2025-10-16',
      check_out: '2025-10-18',
      amount: 120,
    })
    await handler(req as any, res as any)
    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }))
  })

  it('creates booking when no overlap', async () => {
    supaModule.getSupabaseServer.mockReturnValue(makeSupabase([], [], { id: 'b123', status: 'confirmed' }))
    const { req, res } = mockReqRes('POST', {
      hostel_id: 'h1',
      guest_id: 'g1',
      check_in: '2025-10-10',
      check_out: '2025-10-12',
      amount: 90,
    })
    await handler(req as any, res as any)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ booking: { id: 'b123', status: 'confirmed' } })
  })

  it('lists bookings', async () => {
    supaModule.getSupabaseServer.mockReturnValue(makeSupabase([], [{ id: 'b1' }, { id: 'b2' }]))
    const { req, res } = mockReqRes('GET')
    await handler(req as any, res as any)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ bookings: [{ id: 'b1' }, { id: 'b2' }] })
  })
})

