import handler from '../pages/api/booking-requests'

function mockReqRes(method: string, body?: any) {
  const req: any = { method, body, query: {} }
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  }
  return { req, res }
}

function makeSupabase() {
  return {
    from: (table: string) => {
      if (table === 'guests') {
        return {
          upsert: (_payload: any) => ({ select: () => ({ single: () => Promise.resolve({ data: { id: 'guest-1' }, error: null }) }) }),
        }
      }
      if (table === 'bookings') {
        return {
          insert: (_payload: any) => ({ select: () => ({ single: () => Promise.resolve({ data: { id: 'req-1' }, error: null }) }) }),
        }
      }
      throw new Error('unexpected table ' + table)
    },
  } as any
}

jest.mock('../lib/supabase', () => ({ getSupabaseServer: jest.fn() }))
const supaModule = require('../lib/supabase')

describe('API /api/booking-requests', () => {
  it('creates a requested booking and returns request_id', async () => {
    supaModule.getSupabaseServer.mockReturnValue(makeSupabase())
    const { req, res } = mockReqRes('POST', {
      guest_name: 'Emma',
      guest_email: 'emma@example.com',
      hostel_id: 'h1',
      check_in: '2025-10-20',
      check_out: '2025-10-22',
    })
    await handler(req as any, res as any)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ request_id: 'req-1' })
  })
})

