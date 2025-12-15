/**
 * Tests for Supabase Server Client
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createMockSupabaseClient } from '../../__tests__/fixtures/supabase-mock'

// Unmock the global mock from vitest.setup.ts - we want to test the real module
vi.unmock('@/lib/supabase/server')

// Create hoisted mocks to survive vi.clearAllMocks()
const { mockCookieStore, mockCreateServerClient } = vi.hoisted(() => ({
  mockCookieStore: {
    getAll: vi.fn(() => []),
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
  mockCreateServerClient: vi.fn(),
}))

// Mock @supabase/ssr
vi.mock('@supabase/ssr', () => ({
  createServerClient: mockCreateServerClient,
}))

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => mockCookieStore),
}))

import { createClient } from './server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

describe('lib/supabase/server', () => {
  let mockSupabaseClient: ReturnType<typeof createMockSupabaseClient>
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup environment
    process.env = { ...originalEnv }
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    process.env.NODE_ENV = 'production'

    // Setup default mock using hoisted mock
    mockSupabaseClient = createMockSupabaseClient()
    mockCreateServerClient.mockReturnValue(mockSupabaseClient as any)

    // Reset cookie store functions (hoisted mocks survive clearAllMocks)
    mockCookieStore.getAll.mockReturnValue([])
    mockCookieStore.set.mockClear()
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any)
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('createClient', () => {
    it('should create server client with correct credentials', async () => {
      await createClient()

      expect(mockCreateServerClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.objectContaining({
          cookies: expect.any(Object),
        })
      )
    })

    it('should configure cookie handlers', async () => {
      await createClient()

      const config = mockCreateServerClient.mock.calls[0][2]
      expect(config.cookies).toBeDefined()
      expect(typeof config.cookies.getAll).toBe('function')
      expect(typeof config.cookies.setAll).toBe('function')
    })

    it('should call cookies() from next/headers', async () => {
      await createClient()

      expect(vi.mocked(cookies)).toHaveBeenCalled()
    })

    it('should use secure cookie options in production', async () => {
      process.env.NODE_ENV = 'production'

      await createClient()

      const config = mockCreateServerClient.mock.calls[0][2]

      // Call setAll to verify secure options are applied
      const testCookies = [
        { name: 'sb-access-token', value: 'test-token', options: { maxAge: 3600 } },
      ]

      config.cookies.setAll(testCookies)

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'sb-access-token',
        'test-token',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 3600,
        })
      )
    })

    it('should use insecure cookies in development', async () => {
      process.env.NODE_ENV = 'development'

      await createClient()

      const config = mockCreateServerClient.mock.calls[0][2]

      // Call setAll to verify secure:false in dev
      const testCookies = [{ name: 'sb-access-token', value: 'test-token', options: {} }]

      config.cookies.setAll(testCookies)

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'sb-access-token',
        'test-token',
        expect.objectContaining({
          httpOnly: true,
          secure: false, // false in development
          sameSite: 'lax',
          path: '/',
        })
      )
    })

    it('should retrieve all cookies via getAll', async () => {
      const testCookies = [
        { name: 'sb-access-token', value: 'access-123' },
        { name: 'sb-refresh-token', value: 'refresh-456' },
      ]
      mockCookieStore.getAll.mockReturnValue(testCookies)

      await createClient()

      const config = mockCreateServerClient.mock.calls[0][2]
      const returnedCookies = config.cookies.getAll()

      expect(returnedCookies).toEqual(testCookies)
      expect(mockCookieStore.getAll).toHaveBeenCalled()
    })

    it('should handle multiple cookies in setAll', async () => {
      await createClient()

      const config = mockCreateServerClient.mock.calls[0][2]

      const testCookies = [
        { name: 'cookie1', value: 'value1', options: { maxAge: 100 } },
        { name: 'cookie2', value: 'value2', options: { maxAge: 200 } },
        { name: 'cookie3', value: 'value3', options: {} },
      ]

      config.cookies.setAll(testCookies)

      expect(mockCookieStore.set).toHaveBeenCalledTimes(3)
      expect(mockCookieStore.set).toHaveBeenNthCalledWith(
        1,
        'cookie1',
        'value1',
        expect.objectContaining({ maxAge: 100 })
      )
      expect(mockCookieStore.set).toHaveBeenNthCalledWith(
        2,
        'cookie2',
        'value2',
        expect.objectContaining({ maxAge: 200 })
      )
      expect(mockCookieStore.set).toHaveBeenNthCalledWith(
        3,
        'cookie3',
        'value3',
        expect.any(Object)
      )
    })

    it('should merge Supabase options with secure defaults', async () => {
      await createClient()

      const config = mockCreateServerClient.mock.calls[0][2]

      const testCookies = [
        {
          name: 'sb-token',
          value: 'token-value',
          options: {
            maxAge: 7200,
            domain: '.example.com',
          },
        },
      ]

      config.cookies.setAll(testCookies)

      // Should have both secure defaults AND Supabase options
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'sb-token',
        'token-value',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 7200, // From Supabase
          domain: '.example.com', // From Supabase
        })
      )
    })

    it('should catch and ignore errors from Server Component context', async () => {
      mockCookieStore.set.mockImplementation(() => {
        throw new Error('Cannot modify cookies in Server Component')
      })

      await createClient()

      const config = mockCreateServerClient.mock.calls[0][2]

      // Should not throw
      expect(() => {
        config.cookies.setAll([{ name: 'test', value: 'value', options: {} }])
      }).not.toThrow()
    })

    it('should return the created Supabase client', async () => {
      const client = await createClient()

      expect(client).toBe(mockSupabaseClient)
      expect(client.auth).toBeDefined()
      expect(client.from).toBeDefined()
    })

    it('should handle empty cookie list', async () => {
      mockCookieStore.getAll.mockReturnValue([])

      await createClient()

      const config = mockCreateServerClient.mock.calls[0][2]
      const cookies = config.cookies.getAll()

      expect(cookies).toEqual([])
    })

    it('should configure httpOnly to prevent XSS', async () => {
      await createClient()

      const config = mockCreateServerClient.mock.calls[0][2]
      config.cookies.setAll([{ name: 'test', value: 'value', options: {} }])

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'test',
        'value',
        expect.objectContaining({
          httpOnly: true, // Prevents JavaScript access
        })
      )
    })

    it('should configure sameSite to prevent CSRF', async () => {
      await createClient()

      const config = mockCreateServerClient.mock.calls[0][2]
      config.cookies.setAll([{ name: 'test', value: 'value', options: {} }])

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'test',
        'value',
        expect.objectContaining({
          sameSite: 'lax', // Prevents CSRF attacks
        })
      )
    })

    it('should set cookie path to root', async () => {
      await createClient()

      const config = mockCreateServerClient.mock.calls[0][2]
      config.cookies.setAll([{ name: 'test', value: 'value', options: {} }])

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'test',
        'value',
        expect.objectContaining({
          path: '/', // Available for all routes
        })
      )
    })

    it('should handle undefined NODE_ENV as non-production', async () => {
      delete process.env.NODE_ENV

      await createClient()

      const config = mockCreateServerClient.mock.calls[0][2]
      config.cookies.setAll([{ name: 'test', value: 'value', options: {} }])

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'test',
        'value',
        expect.objectContaining({
          secure: false, // Not production
        })
      )
    })

    it('should handle test environment', async () => {
      process.env.NODE_ENV = 'test'

      await createClient()

      const config = mockCreateServerClient.mock.calls[0][2]
      config.cookies.setAll([{ name: 'test', value: 'value', options: {} }])

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'test',
        'value',
        expect.objectContaining({
          secure: false, // Not production
        })
      )
    })

    it('should allow Supabase to override maxAge', async () => {
      await createClient()

      const config = mockCreateServerClient.mock.calls[0][2]
      config.cookies.setAll([{ name: 'test', value: 'value', options: { maxAge: 9999 } }])

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'test',
        'value',
        expect.objectContaining({
          maxAge: 9999,
        })
      )
    })

    it('should silently handle setAll errors without logging', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockCookieStore.set.mockImplementation(() => {
        throw new Error('Server Component context')
      })

      await createClient()

      const config = mockCreateServerClient.mock.calls[0][2]
      config.cookies.setAll([{ name: 'test', value: 'value', options: {} }])

      // Should not log errors
      expect(consoleErrorSpy).not.toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('secure cookie options function', () => {
    it('should return production-safe options when NODE_ENV=production', async () => {
      process.env.NODE_ENV = 'production'

      await createClient()

      const config = mockCreateServerClient.mock.calls[0][2]
      config.cookies.setAll([{ name: 'test', value: 'value', options: {} }])

      const callArgs = mockCookieStore.set.mock.calls[0][2]

      expect(callArgs).toMatchObject({
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
      })
    })

    it('should return development options when NODE_ENV=development', async () => {
      process.env.NODE_ENV = 'development'

      await createClient()

      const config = mockCreateServerClient.mock.calls[0][2]
      config.cookies.setAll([{ name: 'test', value: 'value', options: {} }])

      const callArgs = mockCookieStore.set.mock.calls[0][2]

      expect(callArgs).toMatchObject({
        httpOnly: true,
        secure: false, // Development allows HTTP
        sameSite: 'lax',
        path: '/',
      })
    })
  })
})
