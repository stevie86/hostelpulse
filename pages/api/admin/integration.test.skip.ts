import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import createDemoUser from './createDemoUser'
import seed from './seed'

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}))

const mockSupabaseAdmin = {
  auth: {
    admin: {
      createUser: jest.fn(),
    },
  },
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

function createMockResponse(): Partial<NextApiResponse> {
  const json = jest.fn()
  const end = jest.fn()
  const status = jest.fn().mockReturnValue({ json, end })
  return {
    setHeader: jest.fn(),
    status,
    json,
    end,
  }
}

describe('Admin Endpoints Integration Tests', () => {
  const validAdminToken = '4c23dc5f20b15c42482ac456e0d7eb59e64a04c8ea6cd2ab20bd550ae4fd8786'
  const demoEmail = 'demo@hostelpulse.app'
  const demoPassword = 'demo123'
  const demoName = 'Demo Owner'

  beforeEach(() => {
    jest.clearAllMocks()

    // Set up environment variables
    process.env.ADMIN_API_TOKEN = '4c23dc5f20b15c42482ac456e0d7eb59e64a04c8ea6cd2ab20bd550ae4fd8786'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
  })

  describe('Demo User Creation and Seeding Flow', () => {
    it('should successfully create demo user and seed data', async () => {
      const userId = 'user-123'

      // Mock successful user creation
      mockSupabaseAdmin.auth.admin.createUser.mockResolvedValue({
        data: {
          user: {
            id: userId,
            email: demoEmail,
          },
        },
        error: null,
      })

      // Mock successful data seeding
      const mockRoomsData = [
        { id: 'room-1', name: 'Private Room 1', type: 'private', max_capacity: 2, owner_id: userId },
        { id: 'room-2', name: 'Dorm A', type: 'dorm', max_capacity: 4, owner_id: userId },
      ]

      const mockGuestsData = [
        { id: 'guest-1', name: 'John Doe', email: 'john@example.com', phone: '+351 912 345 678', owner_id: userId },
        { id: 'guest-2', name: 'Jane Smith', email: 'jane@example.com', phone: '+351 913 456 789', notes: 'Vegetarian', owner_id: userId },
        { id: 'guest-3', name: 'Mike Johnson', email: 'mike@example.com', owner_id: userId },
      ]

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
            single: jest.fn().mockResolvedValue({ data: { id: 'bed-1', room_id: 'room-2', name: 'Bed 1', owner_id: userId }, error: null }),
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

      // Step 1: Create demo user
      const createUserReq: Partial<NextApiRequest> = {
        method: 'POST',
        headers: { 'x-admin-token': validAdminToken },
        body: { email: demoEmail, password: demoPassword, name: demoName },
      }

      const createUserRes = createMockResponse()

      await createDemoUser(createUserReq as NextApiRequest, createUserRes as NextApiResponse)

      expect(createUserRes.status).toHaveBeenCalledWith(200)
      expect(createUserRes.json).toHaveBeenCalledWith({
        id: userId,
        email: demoEmail,
      })

      // Step 2: Seed demo data
      const seedReq: Partial<NextApiRequest> = {
        method: 'POST',
        headers: { 'x-admin-token': validAdminToken },
        body: { owner_id: userId },
      }

      const seedRes = createMockResponse()

      await seed(seedReq as NextApiRequest, seedRes as NextApiResponse)

      expect(seedRes.status).toHaveBeenCalledWith(200)
      expect(seedRes.json).toHaveBeenCalledWith({ message: 'Demo data seeded successfully' })

      // Verify the complete flow
      expect(mockSupabaseAdmin.auth.admin.createUser).toHaveBeenCalledWith({
        email: demoEmail,
        password: demoPassword,
        email_confirm: true,
        user_metadata: { name: demoName },
      })

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('rooms')
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('guests')
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('beds')
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('bookings')
    })

    it('should handle demo user creation failure gracefully', async () => {
      // Mock user creation failure
      mockSupabaseAdmin.auth.admin.createUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'User already exists' },
      })

      const createUserReq: Partial<NextApiRequest> = {
        method: 'POST',
        headers: { 'x-admin-token': validAdminToken },
        body: { email: demoEmail, password: demoPassword },
      }

      const createUserRes = createMockResponse()

      await createDemoUser(createUserReq as NextApiRequest, createUserRes as NextApiResponse)

      expect(createUserRes.status).toHaveBeenCalledWith(500)
      expect(createUserRes.json).toHaveBeenCalledWith({ error: 'User already exists' })

      // Verify seeding is not attempted when user creation fails
      expect(mockSupabaseAdmin.from).not.toHaveBeenCalled()
    })

    it('should handle seeding failure after successful user creation', async () => {
      const userId = 'user-123'

      // Mock successful user creation
      mockSupabaseAdmin.auth.admin.createUser.mockResolvedValue({
        data: {
          user: {
            id: userId,
            email: demoEmail,
          },
        },
        error: null,
      })

      // Mock seeding failure
      mockSupabaseAdmin.from.mockImplementation((table: string) => {
        if (table === 'rooms') {
          return {
            insert: jest.fn().mockResolvedValue({ data: null, error: { message: 'Database connection failed' } }),
          }
        }
        return mockSupabaseAdmin
      })

      // Step 1: Create demo user (should succeed)
      const createUserReq: Partial<NextApiRequest> = {
        method: 'POST',
        headers: { 'x-admin-token': validAdminToken },
        body: { email: demoEmail, password: demoPassword },
      }

      const createUserRes = createMockResponse()

      await createDemoUser(createUserReq as NextApiRequest, createUserRes as NextApiResponse)

      expect(createUserRes.status).toHaveBeenCalledWith(200)

      // Step 2: Seed demo data (should fail)
      const seedReq: Partial<NextApiRequest> = {
        method: 'POST',
        headers: { 'x-admin-token': validAdminToken },
        body: { owner_id: userId },
      }

      const seedRes = createMockResponse()

      await seed(seedReq as NextApiRequest, seedRes as NextApiResponse)

      expect(seedRes.status).toHaveBeenCalledWith(500)
      expect(seedRes.json).toHaveBeenCalledWith({ error: 'Database connection failed' })
    })
  })

  describe('Authentication Flow Simulation', () => {
    it('should simulate successful authentication after demo setup', async () => {
      const userId = 'user-123'

      // Mock successful user creation
      mockSupabaseAdmin.auth.admin.createUser.mockResolvedValue({
        data: {
          user: {
            id: userId,
            email: demoEmail,
          },
        },
        error: null,
      })

      // Create demo user
      const createUserReq: Partial<NextApiRequest> = {
        method: 'POST',
        headers: { 'x-admin-token': validAdminToken },
        body: { email: demoEmail, password: demoPassword },
      }

      const createUserRes = createMockResponse()

      await createDemoUser(createUserReq as NextApiRequest, createUserRes as NextApiResponse)

      expect(createUserRes.status).toHaveBeenCalledWith(200)

      // Simulate login attempt (this would typically be handled by Supabase Auth)
      // In a real scenario, the user would use the created credentials to log in
      expect(mockSupabaseAdmin.auth.admin.createUser).toHaveBeenCalledWith({
        email: demoEmail,
        password: demoPassword,
        email_confirm: true,
        user_metadata: { name: 'Demo Owner' },
      })
    })

    it('should handle invalid admin token for both endpoints', async () => {
      const invalidToken = 'wrong-token'

      // Test createDemoUser with invalid token
      const createUserReq: Partial<NextApiRequest> = {
        method: 'POST',
        headers: { 'x-admin-token': invalidToken },
        body: { email: demoEmail, password: demoPassword },
      }

      const createUserRes = createMockResponse()

      await createDemoUser(createUserReq as NextApiRequest, createUserRes as NextApiResponse)

      expect(createUserRes.status).toHaveBeenCalledWith(401)
      expect(createUserRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' })

      // Test seed with invalid token
      const seedReq: Partial<NextApiRequest> = {
        method: 'POST',
        headers: { 'x-admin-token': invalidToken },
        body: { owner_id: 'user-123' },
      }

      const seedRes: Partial<NextApiResponse> = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      }

      await seed(seedReq as NextApiRequest, seedRes as NextApiResponse)

      expect(seedRes.status).toHaveBeenCalledWith(401)
      expect(seedRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    })
  })

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle duplicate user creation attempts', async () => {
      // First attempt succeeds
      mockSupabaseAdmin.auth.admin.createUser.mockResolvedValueOnce({
        data: {
          user: {
            id: 'user-123',
            email: demoEmail,
          },
        },
        error: null,
      })

      // Second attempt fails with duplicate error
      mockSupabaseAdmin.auth.admin.createUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'User already registered' },
      })

      // First creation
      const req1: Partial<NextApiRequest> = {
        method: 'POST',
        headers: { 'x-admin-token': validAdminToken },
        body: { email: demoEmail, password: demoPassword },
      }

      const res1: Partial<NextApiResponse> = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnValue({ json: jest.fn(), end: jest.fn() }),
        json: jest.fn(),
        end: jest.fn(),
      }

      await createDemoUser(req1 as NextApiRequest, res1 as NextApiResponse)
      expect(res1.status).toHaveBeenCalledWith(200)

      // Duplicate creation attempt
      const req2: Partial<NextApiRequest> = {
        method: 'POST',
        headers: { 'x-admin-token': validAdminToken },
        body: { email: demoEmail, password: demoPassword },
      }

      const res2: Partial<NextApiResponse> = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnValue({ json: jest.fn(), end: jest.fn() }),
        json: jest.fn(),
        end: jest.fn(),
      }

      await createDemoUser(req2 as NextApiRequest, res2 as NextApiResponse)
      expect(res2.status).toHaveBeenCalledWith(500)
      expect(res2.json).toHaveBeenCalledWith({ error: 'User already registered' })
    })

    it('should handle missing environment variables', async () => {
      // Remove admin token
      delete process.env.ADMIN_API_TOKEN

      const req: Partial<NextApiRequest> = {
        method: 'POST',
        headers: { 'x-admin-token': 'some-token' },
        body: { email: demoEmail, password: demoPassword },
      }

      const res: Partial<NextApiResponse> = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnValue({ json: jest.fn(), end: jest.fn() }),
        json: jest.fn(),
        end: jest.fn(),
      }

      await createDemoUser(req as NextApiRequest, res as NextApiResponse)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    })

    it('should handle malformed request bodies', async () => {
      const req: Partial<NextApiRequest> = {
        method: 'POST',
        headers: { 'x-admin-token': validAdminToken },
        body: null, // Malformed body
      }

      const res: Partial<NextApiResponse> = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnValue({ json: jest.fn(), end: jest.fn() }),
        json: jest.fn(),
        end: jest.fn(),
      }

      await createDemoUser(req as NextApiRequest, res as NextApiResponse)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ error: 'Email and password are required' })
    })
  })
})
