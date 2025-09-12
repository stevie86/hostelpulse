import handler from '../pages/api/guests'

function mockReqRes(method: string, body?: any) {
  const req: any = { method, body, query: {} }
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  }
  return { req, res }
}

function makeSupabase(guests: any[] = [], created?: any, updated?: any) {
  return {
    from: (table: string) => {
      if (table !== 'guests') throw new Error('unexpected table ' + table)
      return {
        select: (_: string) => ({ order: () => Promise.resolve({ data: guests, error: null }) }),
        insert: (_payload: any) => ({ select: () => ({ single: () => Promise.resolve({ data: created || { id: 'g1' }, error: null }) }) }),
        update: (_upd: any) => ({
          eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: updated || { id: 'g1', ..._upd }, error: null }) }) }),
        }),
      }
    },
  } as any
}

jest.mock('../lib/supabase', () => ({ getSupabaseServer: jest.fn() }))
const supaModule = require('../lib/supabase')

describe('API /api/guests', () => {
  it('lists guests', async () => {
    supaModule.getSupabaseServer.mockReturnValue(makeSupabase([{ id: 'g1', name: 'João' }]))
    const { req, res } = mockReqRes('GET')
    await handler(req as any, res as any)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ guests: [{ id: 'g1', name: 'João' }] })
  })

  it('creates guest', async () => {
    supaModule.getSupabaseServer.mockReturnValue(makeSupabase([], { id: 'g2', name: 'Emma' }))
    const { req, res } = mockReqRes('POST', { name: 'Emma', email: 'emma@example.com' })
    await handler(req as any, res as any)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ guest: { id: 'g2', name: 'Emma' } })
  })
})

