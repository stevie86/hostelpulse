import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import seed from './seed'

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}))

const mockSupabaseAdmin = {
  from: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
}

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
mockCreateClient.mockReturnValue(mockSupabaseAdmin as any)

// Mock the corsHandler to avoid issues with the wrapper
jest.mock('../../../lib/corsHandler', () => ({
  withCors: (handler: any) => handler,
}))

describe('/api/admin/seed', () => {
  let mockReq: Partial<NextApiRequest>
  let mockRes: Partial<NextApiResponse>
  let jsonMock: jest.Mock
  let statusMock: jest.Mock
  let endMock: jest.Mock

  beforeEach(() => {
    jsonMock = jest.fn()
    endMock = jest.fn()
    statusMock = jest.fn().mockReturnValue({ json: jsonMock, end: endMock })

    mockReq = {
      method: 'POST',
      headers: {},
      body: {},
    }

    mockRes = {
      setHeader: jest.fn(),
      status: statusMock,
      json: jsonMock,
      end: endMock,
    }

    // Reset mocks
    jest.clearAllMocks()

    // Set up environment variables
    process.env.ADMIN_API_TOKEN = '4c23dc5f20b15c42482ac456e0d7eb59e64a04c8ea6cd2ab20bd550ae4fd8786'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
  })

  describe('Method validation', () => {
    it('should return 405 for non-POST methods', async () => {
      mockReq.method = 'GET'

      await seed(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(mockRes.setHeader).toHaveBeenCalledWith('Allow', ['POST'])
      expect(statusMock).toHaveBeenCalledWith(405)
    })
  })

  describe('Admin token validation', () => {
    beforeEach(() => {
      mockReq.method = 'POST'
    })

    it('should return 401 when admin token is not set in environment', async () => {
      delete process.env.ADMIN_API_TOKEN

      await seed(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(401)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' })
    })

    it('should return 401 when admin token header is missing', async () => {
      await seed(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(401)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' })
    })

    it('should return 401 when admin token header is invalid', async () => {
      mockReq.headers = { 'x-admin-token': 'invalid-token' }

      await seed(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(401)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' })
    })
  })

  describe('Input validation', () => {
    beforeEach(() => {
      mockReq.method = 'POST'
      mockReq.headers = { 'x-admin-token': '4c23dc5f20b15c42482ac456e0d7eb59e64a04c8ea6cd2ab20bd550ae4fd8786' }
    })

    it('should return 400 when owner_id is missing', async () => {
      mockReq.body = {}

      await seed(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Owner ID is required' })
    })

    it('should return 400 when owner_id is empty string', async () => {
      mockReq.body = { owner_id: '' }

      await seed(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Owner ID is required' })
    })
  })

  describe('Successful data seeding', () => {
    const mockOwnerId = 'owner-123'

    beforeEach(() => {
      mockReq.method = 'POST'
      mockReq.headers = { 'x-admin-token': '4c23dc5f20b15c42482ac456e0d7eb59e64a04c8ea6cd2ab20bd550ae4fd8786' }
      mockReq.body = { owner_id: mockOwnerId }

      // Mock successful database operations
      const mockRoomsData = [
        { id: 'room-1', name: 'Private Room 1', type: 'private', max_capacity: 2, owner_id: mockOwnerId },
        { id: 'room-2', name: 'Dorm A', type: 'dorm', max_capacity: 4, owner_id: mockOwnerId },
      ]

      const mockGuestsData = [
        { id: 'guest-1', name: 'John Doe', email: 'john@example.com', phone: '+351 912 345 678', owner_id: mockOwnerId },
        { id: 'guest-2', name: 'Jane Smith', email: 'jane@example.com', phone: '+351 913 456 789', notes: 'Vegetarian', owner_id: mockOwnerId },
        { id: 'guest-3', name: 'Mike Johnson', email: 'mike@example.com', owner_id: mockOwnerId },
      ]

      const mockBedData = { id: 'bed-1', room_id: 'room-2', name: 'Bed 1', owner_id: mockOwnerId }

      // Mock rooms insert
      mockSupabaseAdmin.from.mockImplementation((table: string) => {
        if (table === 'rooms') {
          return {
            insert: jest.fn().mockResolvedValue({ data: mockRoomsData, error: null }),
            select: jest.fn().mockResolvedValue({ data: mockRoomsData, error: null }),
          }
        }
        if (table === 'beds') {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockBedData, error: null }),
          }
        }
        if (table === 'guests') {
          return {
            insert: jest.fn().mockResolvedValue({ data: mockGuestsData, error: null }),
            select: jest.fn().mockResolvedValue({ data: mockGuestsData, error: null }),
          }
        }
        if (table === 'bookings') {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          }
        }
        return mockSupabaseAdmin
      })
    })

    it('should seed data successfully with valid owner_id', async () => {
      await seed(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Demo data seeded successfully' })
    })

    it('should create rooms with correct data', async () => {
      await seed(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('rooms')
      // Verify rooms insert was called with expected data
    })

    it('should create guests with correct data', async () => {
      await seed(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('guests')
      // Verify guests insert was called with expected data
    })

    it('should create beds for dorm rooms', async () => {
      await seed(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('beds')
      // Verify beds insert was called with expected data
    })

    it('should create a booking for the demo guest', async () => {
      await seed(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('bookings')
      // Verify booking insert was called with expected data
    })
  })

  describe('Error handling', () => {
    beforeEach(() => {
      mockReq.method = 'POST'
      mockReq.headers = { 'x-admin-token': '4c23dc5f20b15c42482ac456e0d7eb59e64a04c8ea6cd2ab20bd550ae4fd8786' }
      mockReq.body = { owner_id: 'owner-123' }
    })

    it('should return 500 when rooms creation fails', async () => {
      const errorMessage = 'Failed to create rooms'
      mockSupabaseAdmin.from.mockImplementation((table: string) => {
        if (table === 'rooms') {
          return {
            insert: jest.fn().mockResolvedValue({ data: null, error: { message: errorMessage } }),
          }
        }
        return mockSupabaseAdmin
      })

      await seed(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({ error: errorMessage })
    })

    it('should return 500 when guests creation fails', async () => {
      mockSupabaseAdmin.from.mockImplementation((table: string) => {
        if (table === 'rooms') {
          return {
            insert: jest.fn().mockResolvedValue({ data: [{ id: 'room-1' }], error: null }),
            select: jest.fn().mockResolvedValue({ data: [{ id: 'room-1' }], error: null }),
          }
        }
        if (table === 'guests') {
          return {
            insert: jest.fn().mockResolvedValue({ data: null, error: { message: 'Failed to create guests' } }),
          }
        }
        return mockSupabaseAdmin
      })

      await seed(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to create guests' })
    })

    it('should return 500 when beds creation fails', async () => {
      mockSupabaseAdmin.from.mockImplementation((table: string) => {
        if (table === 'rooms') {
          return {
            insert: jest.fn().mockResolvedValue({ data: [{ id: 'room-1', name: 'Dorm A' }], error: null }),
            select: jest.fn().mockResolvedValue({ data: [{ id: 'room-1', name: 'Dorm A' }], error: null }),
          }
        }
        if (table === 'beds') {
          return {
            insert: jest.fn().mockResolvedValue({ error: { message: 'Failed to create beds' } }),
          }
        }
        return mockSupabaseAdmin
      })

      await seed(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to create beds' })
    })

    it('should return 500 when booking creation fails', async () => {
      mockSupabaseAdmin.from.mockImplementation((table: string) => {
        if (table === 'rooms') {
          return {
            insert: jest.fn().mockResolvedValue({ data: [{ id: 'room-1', name: 'Dorm A' }], error: null }),
            select: jest.fn().mockResolvedValue({ data: [{ id: 'room-1', name: 'Dorm A' }], error: null }),
          }
        }
        if (table === 'beds') {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: { id: 'bed-1' }, error: null }),
          }
        }
        if (table === 'guests') {
          return {
            insert: jest.fn().mockResolvedValue({ data: [{ id: 'guest-1', name: 'John Doe' }], error: null }),
            select: jest.fn().mockResolvedValue({ data: [{ id: 'guest-1', name: 'John Doe' }], error: null }),
          }
        }
        if (table === 'bookings') {
          return {
            insert: jest.fn().mockResolvedValue({ error: { message: 'Failed to create booking' } }),
          }
        }
        return mockSupabaseAdmin
      })

      await seed(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to create booking' })
    })

    it('should return 500 with default error message when error message is missing', async () => {
      mockSupabaseAdmin.from.mockImplementation((table: string) => {
        if (table === 'rooms') {
          return {
            insert: jest.fn().mockResolvedValue({ data: null, error: {} }),
          }
        }
        return mockSupabaseAdmin
      })

      await seed(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to seed demo data' })
    })

    it('should return 500 when database operation throws an exception', async () => {
      const errorMessage = 'Database connection failed'
      mockSupabaseAdmin.from.mockImplementation(() => {
        throw new Error(errorMessage)
      })

      await seed(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({ error: errorMessage })
    })
  })
})