import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import createDemoUser from './createDemoUser'

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
}

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
mockCreateClient.mockReturnValue(mockSupabaseAdmin as any)

// Mock the corsHandler to avoid issues with the wrapper
jest.mock('../../../lib/corsHandler', () => ({
  withCors: (handler: any) => handler,
}))

describe('/api/admin/createDemoUser', () => {
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

      await createDemoUser(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(mockRes.setHeader).toHaveBeenCalledWith('Allow', ['POST'])
      expect(statusMock).toHaveBeenCalledWith(405)
    })
  })

  describe('Admin token validation', () => {
    beforeEach(() => {
      mockReq.method = 'POST'
    })


    it('should return 401 when admin token header is missing', async () => {
      await createDemoUser(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(401)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' })
    })

    it('should return 401 when admin token header is invalid', async () => {
      mockReq.headers = { 'x-admin-token': 'wrong-token' }

      await createDemoUser(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(401)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' })
    })
  })

  describe('Input validation', () => {
    beforeEach(() => {
      mockReq.method = 'POST'
      mockReq.headers = { 'x-admin-token': '4c23dc5f20b15c42482ac456e0d7eb59e64a04c8ea6cd2ab20bd550ae4fd8786' }
    })

    it('should return 400 when email is missing', async () => {
      mockReq.body = { password: 'test123' }

      await createDemoUser(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Email and password are required' })
    })

    it('should return 400 when password is missing', async () => {
      mockReq.body = { email: 'test@example.com' }

      await createDemoUser(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Email and password are required' })
    })

    it('should return 400 when both email and password are missing', async () => {
      mockReq.body = {}

      await createDemoUser(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Email and password are required' })
    })
  })

  describe('Successful user creation', () => {
    beforeEach(() => {
      mockReq.method = 'POST'
      mockReq.headers = { 'x-admin-token': '4c23dc5f20b15c42482ac456e0d7eb59e64a04c8ea6cd2ab20bd550ae4fd8786' }
      mockReq.body = {
        email: 'demo@hostelpulse.app',
        password: 'demo123',
        name: 'Demo Owner'
      }

      mockSupabaseAdmin.auth.admin.createUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'demo@hostelpulse.app',
          },
        },
        error: null,
      })
    })

    it('should create user successfully with valid inputs', async () => {
      await createDemoUser(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(mockSupabaseAdmin.auth.admin.createUser).toHaveBeenCalledWith({
        email: 'demo@hostelpulse.app',
        password: 'demo123',
        email_confirm: true,
        user_metadata: { name: 'Demo Owner' },
      })

      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'demo@hostelpulse.app'
      })
    })

    it('should use default name when name is not provided', async () => {
      mockReq.body = {
        email: 'demo@hostelpulse.app',
        password: 'demo123',
      }

      await createDemoUser(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(mockSupabaseAdmin.auth.admin.createUser).toHaveBeenCalledWith({
        email: 'demo@hostelpulse.app',
        password: 'demo123',
        email_confirm: true,
        user_metadata: { name: 'Demo Owner' },
      })
    })
  })

  describe('Error handling', () => {
    beforeEach(() => {
      mockReq.method = 'POST'
      mockReq.headers = { 'x-admin-token': '4c23dc5f20b15c42482ac456e0d7eb59e64a04c8ea6cd2ab20bd550ae4fd8786' }
      mockReq.body = {
        email: 'demo@hostelpulse.app',
        password: 'demo123',
      }
    })

    it('should return 500 when Supabase createUser fails', async () => {
      const errorMessage = 'User already exists'
      mockSupabaseAdmin.auth.admin.createUser.mockResolvedValue({
        data: { user: null },
        error: { message: errorMessage },
      })

      await createDemoUser(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({ error: errorMessage })
    })

    it('should return 500 with default error message when error message is missing', async () => {
      mockSupabaseAdmin.auth.admin.createUser.mockResolvedValue({
        data: { user: null },
        error: {},
      })

      await createDemoUser(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to create demo user' })
    })

    it('should return 500 when createUser throws an exception', async () => {
      const errorMessage = 'Database connection failed'
      mockSupabaseAdmin.auth.admin.createUser.mockRejectedValue(new Error(errorMessage))

      await createDemoUser(mockReq as NextApiRequest, mockRes as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({ error: errorMessage })
    })
  })
})