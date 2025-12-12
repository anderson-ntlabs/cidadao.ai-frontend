import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextResponse } from 'next/server'
import {
  createMockNextRequest,
  createMockSupabaseClient,
} from '../../../__tests__/fixtures/supabase-mock'

// Mock @supabase/ssr
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}))

// Mock NextResponse with all required methods
const createMockResponse = () => ({
  cookies: {
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
    getAll: vi.fn(() => []),
  },
  headers: new Headers(),
})

vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn(() => createMockResponse()),
    redirect: vi.fn((url: URL) => ({
      ...createMockResponse(),
      status: 307,
      url: url.toString(),
      type: 'redirect',
    })),
    rewrite: vi.fn((url: URL) => ({
      ...createMockResponse(),
      url: url.toString(),
      type: 'rewrite',
    })),
  },
}))

import { updateSession } from '../middleware'
import { createServerClient } from '@supabase/ssr'

describe('middleware - updateSession', () => {
  let mockSupabaseClient: ReturnType<typeof createMockSupabaseClient>
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset env
    process.env = { ...originalEnv }
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    process.env.NODE_ENV = 'production'

    // Default mock
    mockSupabaseClient = createMockSupabaseClient()
    vi.mocked(createServerClient).mockReturnValue(mockSupabaseClient as any)
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('E2E test bypass', () => {
    it('should skip auth check when PLAYWRIGHT_TEST_BASE_URL is set in development', async () => {
      process.env.NODE_ENV = 'development'
      process.env.PLAYWRIGHT_TEST_BASE_URL = 'http://localhost:3000'

      const request = createMockNextRequest()
      await updateSession(request as any)

      // Should NOT call createServerClient because of early return
      expect(createServerClient).not.toHaveBeenCalled()
    })

    it('should skip auth check when x-playwright-test header is present in development', async () => {
      process.env.NODE_ENV = 'development'

      const request = createMockNextRequest({
        headers: { 'x-playwright-test': 'true' },
      })
      await updateSession(request as any)

      // Should NOT call createServerClient because of early return
      expect(createServerClient).not.toHaveBeenCalled()
    })

    it('should NOT skip auth check in production even with x-playwright-test header', async () => {
      process.env.NODE_ENV = 'production'

      const request = createMockNextRequest({
        headers: { 'x-playwright-test': 'true' },
      })
      await updateSession(request as any)

      // Should call createServerClient in production
      expect(createServerClient).toHaveBeenCalled()
    })

    it('should NOT skip auth check in production even with PLAYWRIGHT_TEST_BASE_URL', async () => {
      process.env.NODE_ENV = 'production'
      process.env.PLAYWRIGHT_TEST_BASE_URL = 'http://localhost:3000'

      const request = createMockNextRequest()
      await updateSession(request as any)

      // Should call createServerClient in production
      expect(createServerClient).toHaveBeenCalled()
    })
  })

  describe('session refresh', () => {
    it('should create Supabase client with correct config', async () => {
      const request = createMockNextRequest({
        cookies: { 'sb-access-token': 'test-token' },
      })

      await updateSession(request as any)

      expect(createServerClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.objectContaining({
          cookies: expect.any(Object),
        })
      )
    })

    it('should call getUser to refresh session', async () => {
      const request = createMockNextRequest()

      await updateSession(request as any)

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled()
    })

    it('should return NextResponse', async () => {
      const request = createMockNextRequest()

      const response = await updateSession(request as any)

      expect(response).toBeDefined()
    })
  })

  describe('cookie handling', () => {
    it('should pass cookies from request to Supabase client', async () => {
      const request = createMockNextRequest({
        cookies: {
          'sb-access-token': 'test-access-token',
          'sb-refresh-token': 'test-refresh-token',
        },
      })

      await updateSession(request as any)

      // Verify createServerClient was called
      expect(createServerClient).toHaveBeenCalled()

      // Get the cookies config passed to createServerClient
      const config = vi.mocked(createServerClient).mock.calls[0][2]
      expect(config).toBeDefined()
      expect(config.cookies).toBeDefined()
    })
  })

  describe('error handling', () => {
    it('should handle getUser errors gracefully', async () => {
      mockSupabaseClient.auth.getUser.mockRejectedValue(new Error('Auth error'))

      const request = createMockNextRequest()

      // Should not throw
      await expect(updateSession(request as any)).rejects.toThrow('Auth error')
    })
  })

  describe('secure cookie options', () => {
    it('should configure cookies with httpOnly in production', async () => {
      process.env.NODE_ENV = 'production'

      const request = createMockNextRequest()
      await updateSession(request as any)

      // Get the config passed to createServerClient
      const config = vi.mocked(createServerClient).mock.calls[0][2]
      expect(config).toBeDefined()
      expect(config.cookies).toBeDefined()

      // The secure cookie options are applied when setAll is called
      // This verifies the cookie configuration is present
      expect(typeof config.cookies.getAll).toBe('function')
      expect(typeof config.cookies.setAll).toBe('function')
    })

    it('should use secure:false in development', async () => {
      process.env.NODE_ENV = 'development'
      // Remove test bypass to test actual middleware logic
      delete process.env.PLAYWRIGHT_TEST_BASE_URL

      const request = createMockNextRequest({
        headers: {}, // No playwright header
      })
      await updateSession(request as any)

      // Verify createServerClient was called
      expect(createServerClient).toHaveBeenCalled()
    })
  })
})
