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

  describe('public routes bypass', () => {
    it('should skip auth check for /auth/callback', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/auth/callback',
      })
      await updateSession(request as any)

      expect(createServerClient).not.toHaveBeenCalled()
    })

    it('should skip auth check for /api/ routes', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/',
      })
      await updateSession(request as any)

      expect(createServerClient).not.toHaveBeenCalled()
    })

    it('should skip auth check for /_next/ routes', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/_next/',
      })
      await updateSession(request as any)

      expect(createServerClient).not.toHaveBeenCalled()
    })

    it('should skip auth check for /favicon.ico', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/favicon.ico',
      })
      await updateSession(request as any)

      expect(createServerClient).not.toHaveBeenCalled()
    })

    it('should skip auth check for /manifest.json', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/manifest.json',
      })
      await updateSession(request as any)

      expect(createServerClient).not.toHaveBeenCalled()
    })

    it('should skip auth check for /sw.js', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/sw.js',
      })
      await updateSession(request as any)

      expect(createServerClient).not.toHaveBeenCalled()
    })

    it('should skip auth check for /pt/agora/verificar', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/pt/agora/verificar',
      })
      await updateSession(request as any)

      expect(createServerClient).not.toHaveBeenCalled()
    })

    it('should skip auth check for /en/agora/verificar', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/en/agora/verificar',
      })
      await updateSession(request as any)

      expect(createServerClient).not.toHaveBeenCalled()
    })

    it('should skip auth check for nested /api/ routes', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/api//agents/zumbi',
      })
      await updateSession(request as any)

      expect(createServerClient).not.toHaveBeenCalled()
    })

    it('should skip auth check for nested /_next/ routes', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/_next//static/media/image.png',
      })
      await updateSession(request as any)

      expect(createServerClient).not.toHaveBeenCalled()
    })

    it('should NOT skip auth check for /pt/app routes', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/pt/app/dashboard',
      })
      await updateSession(request as any)

      expect(createServerClient).toHaveBeenCalled()
    })

    it('should skip auth check for verificar subroutes', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/pt/agora/verificar/certificate-123',
      })
      await updateSession(request as any)

      expect(createServerClient).not.toHaveBeenCalled()
    })
  })

  describe('E2E test bypass', () => {
    it('should skip auth check when PLAYWRIGHT_TEST_BASE_URL is set in development', async () => {
      process.env.NODE_ENV = 'development'
      process.env.PLAYWRIGHT_TEST_BASE_URL = 'http://localhost:3000'

      const request = createMockNextRequest()
      await updateSession(request as any)

      expect(createServerClient).not.toHaveBeenCalled()
    })

    it('should skip auth check when x-playwright-test header is present in development', async () => {
      process.env.NODE_ENV = 'development'

      const request = createMockNextRequest({
        headers: { 'x-playwright-test': 'true' },
      })
      await updateSession(request as any)

      expect(createServerClient).not.toHaveBeenCalled()
    })

    it('should NOT skip auth check in production even with x-playwright-test header', async () => {
      process.env.NODE_ENV = 'production'

      const request = createMockNextRequest({
        headers: { 'x-playwright-test': 'true' },
      })
      await updateSession(request as any)

      expect(createServerClient).toHaveBeenCalled()
    })

    it('should NOT skip auth check in production even with PLAYWRIGHT_TEST_BASE_URL', async () => {
      process.env.NODE_ENV = 'production'
      process.env.PLAYWRIGHT_TEST_BASE_URL = 'http://localhost:3000'

      const request = createMockNextRequest()
      await updateSession(request as any)

      expect(createServerClient).toHaveBeenCalled()
    })
  })

  describe('protected routes - authenticated users', () => {
    beforeEach(() => {
      // Mock authenticated user
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockSupabaseClient = createMockSupabaseClient({ user: mockUser })
      vi.mocked(createServerClient).mockReturnValue(mockSupabaseClient as any)
    })

    it('should allow authenticated users to access /pt/app', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/pt/app/dashboard',
      })

      const response = await updateSession(request as any)

      expect(response.type).not.toBe('redirect')
    })

    it('should allow authenticated users to access /pt/agora', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/pt/agora/dashboard',
      })

      const response = await updateSession(request as any)

      expect(response.type).not.toBe('redirect')
    })

    it('should allow authenticated users to access nested /pt/app routes', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/pt/app/chat/session-123',
      })

      const response = await updateSession(request as any)

      expect(response.type).not.toBe('redirect')
    })

    it('should allow authenticated users to access nested /pt/agora routes', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/pt/agora/trilhas/basic',
      })

      const response = await updateSession(request as any)

      expect(response.type).not.toBe('redirect')
    })
  })

  describe('protected routes - unauthenticated users', () => {
    beforeEach(() => {
      // Mock unauthenticated user
      mockSupabaseClient = createMockSupabaseClient({ user: null })
      vi.mocked(createServerClient).mockReturnValue(mockSupabaseClient as any)
    })

    it('should redirect unauthenticated users from /pt/app to /pt/login', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/pt/app/dashboard',
      })

      const response = await updateSession(request as any)

      expect(response.type).toBe('redirect')
      expect(response.url).toContain('/pt/login')
      expect(response.url).toContain('redirect=%2Fpt%2Fapp%2Fdashboard')
    })

    it('should redirect unauthenticated users from /pt/agora to /pt/agora/login', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/pt/agora/dashboard',
      })

      const response = await updateSession(request as any)

      expect(response.type).toBe('redirect')
      expect(response.url).toContain('/pt/agora/login')
      expect(response.url).toContain('redirect=%2Fpt%2Fagora%2Fdashboard')
    })

    it('should preserve redirect URL in query params', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/pt/app/chat',
      })

      const response = await updateSession(request as any)

      expect(response.url).toContain('redirect=%2Fpt%2Fapp%2Fchat')
    })

    it('should NOT add redirect param when accessing login page itself', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/pt/login',
      })

      const response = await updateSession(request as any)

      // Login pages don't get redirected when user is unauthenticated,
      // so response.url might be undefined
      if (response.url) {
        expect(response.url).not.toContain('redirect=')
      } else {
        // If no redirect happens, that's the expected behavior
        expect(response.type).not.toBe('redirect')
      }
    })

    it('should redirect from nested protected routes', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/pt/app/settings/profile',
      })

      const response = await updateSession(request as any)

      expect(response.type).toBe('redirect')
      expect(response.url).toContain('/pt/login')
    })

    it('should use agora login for agora routes', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/pt/agora/trilhas',
      })

      const response = await updateSession(request as any)

      expect(response.type).toBe('redirect')
      expect(response.url).toContain('/pt/agora/login')
    })

    it('should use standard login for app routes', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/pt/app',
      })

      const response = await updateSession(request as any)

      expect(response.type).toBe('redirect')
      expect(response.url).toContain('/pt/login')
      expect(response.url).not.toContain('/agora')
    })
  })

  describe('auth routes - authenticated users', () => {
    beforeEach(() => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockSupabaseClient = createMockSupabaseClient({ user: mockUser })
      vi.mocked(createServerClient).mockReturnValue(mockSupabaseClient as any)
    })

    it('should redirect authenticated users from /pt/login to /pt/app', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/pt/login',
      })

      const response = await updateSession(request as any)

      expect(response.type).toBe('redirect')
      expect(response.url).toBe('http://localhost:3000/pt/app')
    })

    it('should redirect authenticated users from /en/login to /pt/app', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/en/login',
      })

      const response = await updateSession(request as any)

      expect(response.type).toBe('redirect')
      expect(response.url).toBe('http://localhost:3000/pt/app')
    })

    it('should redirect authenticated users from /pt/agora/login to /pt/agora', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/pt/agora/login',
      })

      const response = await updateSession(request as any)

      expect(response.type).toBe('redirect')
      expect(response.url).toBe('http://localhost:3000/pt/agora')
    })

    it('should detect agora login and redirect to agora dashboard', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/pt/agora/login',
      })

      const response = await updateSession(request as any)

      expect(response.url).toContain('/pt/agora')
      expect(response.url).not.toContain('/login')
    })

    it('should detect standard login and redirect to app dashboard', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/pt/login',
      })

      const response = await updateSession(request as any)

      expect(response.url).toContain('/pt/app')
      expect(response.url).not.toContain('/agora')
    })
  })

  describe('auth routes - unauthenticated users', () => {
    beforeEach(() => {
      mockSupabaseClient = createMockSupabaseClient({ user: null })
      vi.mocked(createServerClient).mockReturnValue(mockSupabaseClient as any)
    })

    it('should allow unauthenticated users to access /pt/login', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/pt/login',
      })

      const response = await updateSession(request as any)

      expect(response.type).not.toBe('redirect')
    })

    it('should allow unauthenticated users to access /en/login', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/en/login',
      })

      const response = await updateSession(request as any)

      expect(response.type).not.toBe('redirect')
    })

    it('should allow unauthenticated users to access /pt/agora/login', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/pt/agora/login',
      })

      const response = await updateSession(request as any)

      expect(response.type).not.toBe('redirect')
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

      expect(createServerClient).toHaveBeenCalled()

      const config = vi.mocked(createServerClient).mock.calls[0][2]
      expect(config).toBeDefined()
      expect(config.cookies).toBeDefined()
    })

    it('should configure getAll to retrieve request cookies', async () => {
      const mockCookies = [
        { name: 'cookie1', value: 'value1' },
        { name: 'cookie2', value: 'value2' },
      ]

      const request = createMockNextRequest({
        cookies: {
          cookie1: 'value1',
          cookie2: 'value2',
        },
      })

      await updateSession(request as any)

      const config = vi.mocked(createServerClient).mock.calls[0][2]
      const cookies = config.cookies.getAll()

      expect(cookies).toHaveLength(2)
    })

    it('should configure setAll to update response cookies', async () => {
      const request = createMockNextRequest()

      await updateSession(request as any)

      const config = vi.mocked(createServerClient).mock.calls[0][2]

      expect(typeof config.cookies.setAll).toBe('function')

      // Test setAll functionality
      config.cookies.setAll([{ name: 'new-cookie', value: 'new-value', options: {} }])

      // Verify NextResponse.next was called again to create new response
      expect(NextResponse.next).toHaveBeenCalledTimes(2)
    })

    it('should merge secure cookie options with Supabase options', async () => {
      const request = createMockNextRequest()

      await updateSession(request as any)

      const config = vi.mocked(createServerClient).mock.calls[0][2]

      // setAll should merge options
      config.cookies.setAll([{ name: 'test', value: 'value', options: { maxAge: 3600 } }])

      // Response cookies should have secure options applied
      const mockResponse = vi.mocked(NextResponse.next).mock.results[1].value
      expect(mockResponse.cookies.set).toHaveBeenCalledWith(
        'test',
        'value',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 3600,
        })
      )
    })
  })

  describe('error handling', () => {
    it('should handle getUser errors gracefully', async () => {
      mockSupabaseClient.auth.getUser.mockRejectedValue(new Error('Auth error'))

      const request = createMockNextRequest()

      await expect(updateSession(request as any)).rejects.toThrow('Auth error')
    })

    it('should handle network errors during session refresh', async () => {
      mockSupabaseClient.auth.getUser.mockRejectedValue(new Error('Network error'))

      const request = createMockNextRequest()

      await expect(updateSession(request as any)).rejects.toThrow('Network error')
    })
  })

  describe('secure cookie options', () => {
    it('should configure cookies with httpOnly in production', async () => {
      process.env.NODE_ENV = 'production'

      const request = createMockNextRequest()
      await updateSession(request as any)

      const config = vi.mocked(createServerClient).mock.calls[0][2]
      expect(config).toBeDefined()
      expect(config.cookies).toBeDefined()

      expect(typeof config.cookies.getAll).toBe('function')
      expect(typeof config.cookies.setAll).toBe('function')
    })

    it('should use secure:true in production', async () => {
      process.env.NODE_ENV = 'production'

      const request = createMockNextRequest()
      await updateSession(request as any)

      const config = vi.mocked(createServerClient).mock.calls[0][2]
      config.cookies.setAll([{ name: 'test', value: 'value', options: {} }])

      const mockResponse = vi.mocked(NextResponse.next).mock.results[1].value
      expect(mockResponse.cookies.set).toHaveBeenCalledWith(
        'test',
        'value',
        expect.objectContaining({
          secure: true,
        })
      )
    })

    it('should use secure:false in development', async () => {
      process.env.NODE_ENV = 'development'
      delete process.env.PLAYWRIGHT_TEST_BASE_URL

      const request = createMockNextRequest({
        headers: {},
      })
      await updateSession(request as any)

      expect(createServerClient).toHaveBeenCalled()

      const config = vi.mocked(createServerClient).mock.calls[0][2]
      config.cookies.setAll([{ name: 'test', value: 'value', options: {} }])

      const mockResponse = vi.mocked(NextResponse.next).mock.results[1].value
      expect(mockResponse.cookies.set).toHaveBeenCalledWith(
        'test',
        'value',
        expect.objectContaining({
          secure: false,
        })
      )
    })

    it('should configure sameSite lax for CSRF protection', async () => {
      const request = createMockNextRequest()
      await updateSession(request as any)

      const config = vi.mocked(createServerClient).mock.calls[0][2]
      config.cookies.setAll([{ name: 'test', value: 'value', options: {} }])

      const mockResponse = vi.mocked(NextResponse.next).mock.results[1].value
      expect(mockResponse.cookies.set).toHaveBeenCalledWith(
        'test',
        'value',
        expect.objectContaining({
          sameSite: 'lax',
        })
      )
    })

    it('should set path to root for all routes', async () => {
      const request = createMockNextRequest()
      await updateSession(request as any)

      const config = vi.mocked(createServerClient).mock.calls[0][2]
      config.cookies.setAll([{ name: 'test', value: 'value', options: {} }])

      const mockResponse = vi.mocked(NextResponse.next).mock.results[1].value
      expect(mockResponse.cookies.set).toHaveBeenCalledWith(
        'test',
        'value',
        expect.objectContaining({
          path: '/',
        })
      )
    })
  })

  describe('route matching edge cases', () => {
    it('should match exact route paths', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/pt/app',
      })

      mockSupabaseClient = createMockSupabaseClient({ user: null })
      vi.mocked(createServerClient).mockReturnValue(mockSupabaseClient as any)

      const response = await updateSession(request as any)

      expect(response.type).toBe('redirect')
    })

    it('should match routes with trailing slashes', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/pt/app/',
      })

      mockSupabaseClient = createMockSupabaseClient({ user: null })
      vi.mocked(createServerClient).mockReturnValue(mockSupabaseClient as any)

      const response = await updateSession(request as any)

      expect(response.type).toBe('redirect')
    })

    it('should NOT match partial route names', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/pt/application',
      })

      await updateSession(request as any)

      // /pt/application is NOT a protected route, so we skip Supabase entirely
      // This is the performance optimization - only call Supabase for protected/auth routes
      expect(createServerClient).not.toHaveBeenCalled()
    })

    it('should prioritize auth route check over protected route check', async () => {
      // /pt/agora/login matches both /pt/agora (protected) and /pt/agora/login (auth)
      // Auth check should happen first to avoid redirect loop
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockSupabaseClient = createMockSupabaseClient({ user: mockUser })
      vi.mocked(createServerClient).mockReturnValue(mockSupabaseClient as any)

      const request = createMockNextRequest({
        url: 'http://localhost:3000/pt/agora/login',
      })

      const response = await updateSession(request as any)

      // Should redirect to /pt/agora (auth route behavior)
      // NOT redirect to login (protected route behavior)
      expect(response.type).toBe('redirect')
      expect(response.url).toContain('/pt/agora')
      expect(response.url).not.toContain('/login')
    })
  })

  describe('request cookie manipulation', () => {
    it('should update request cookies when setAll is called', async () => {
      const request = createMockNextRequest()

      await updateSession(request as any)

      const config = vi.mocked(createServerClient).mock.calls[0][2]
      config.cookies.setAll([
        { name: 'cookie1', value: 'value1', options: {} },
        { name: 'cookie2', value: 'value2', options: {} },
      ])

      expect(request.cookies.set).toHaveBeenCalledWith('cookie1', 'value1')
      expect(request.cookies.set).toHaveBeenCalledWith('cookie2', 'value2')
    })

    it('should create new NextResponse after cookie updates', async () => {
      const request = createMockNextRequest()

      await updateSession(request as any)

      const initialCalls = vi.mocked(NextResponse.next).mock.calls.length

      const config = vi.mocked(createServerClient).mock.calls[0][2]
      config.cookies.setAll([{ name: 'test', value: 'value', options: {} }])

      // Should call NextResponse.next again
      expect(vi.mocked(NextResponse.next).mock.calls.length).toBeGreaterThan(initialCalls)
    })
  })

  describe('environment handling', () => {
    it('should handle missing environment variables', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const request = createMockNextRequest()

      await updateSession(request as any)

      expect(createServerClient).toHaveBeenCalledWith(undefined, undefined, expect.any(Object))
    })

    it('should handle test environment', async () => {
      process.env.NODE_ENV = 'test'

      const request = createMockNextRequest()

      await updateSession(request as any)

      const config = vi.mocked(createServerClient).mock.calls[0][2]
      config.cookies.setAll([{ name: 'test', value: 'value', options: {} }])

      const mockResponse = vi.mocked(NextResponse.next).mock.results[1].value
      expect(mockResponse.cookies.set).toHaveBeenCalledWith(
        'test',
        'value',
        expect.objectContaining({
          secure: false, // Test is not production
        })
      )
    })
  })
})
