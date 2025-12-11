/**
 * Authentication Setup for E2E Tests
 *
 * This helper provides authenticated sessions for E2E tests by:
 * 1. Mocking Supabase authentication cookies
 * 2. Setting up localStorage with user session
 * 3. Bypassing OAuth redirects
 *
 * Usage in tests:
 * ```typescript
 * import { setupAuth } from '../helpers/auth.setup'
 *
 * test.beforeEach(async ({ page, context }) => {
 *   await setupAuth(page, context)
 *   await page.goto('/pt/app/chat')
 * })
 * ```
 */

import { Page, BrowserContext } from '@playwright/test'

export interface TestUser {
  id: string
  email: string
  name: string
  avatar?: string
}

export const mockUser: TestUser = {
  id: 'test-user-123',
  email: 'test@cidadao.ai',
  name: 'Usuário de Teste',
  avatar: '/agents/abaporu.webp',
}

/**
 * Setup authentication for E2E tests
 *
 * Creates a mock authenticated session by:
 * - Intercepting Supabase auth API calls with mock responses
 * - Setting Supabase auth cookies
 * - Configuring localStorage with user data
 * - Marking user as authenticated
 */
export async function setupAuth(page: Page, context: BrowserContext): Promise<void> {
  // Set header to bypass auth in middleware
  await page.setExtraHTTPHeaders({
    'x-playwright-test': 'true',
  })

  // Mock Supabase access token (JWT format)
  const mockAccessToken = createMockJWT(mockUser)

  const mockUserData = {
    id: mockUser.id,
    email: mockUser.email,
    aud: 'authenticated',
    role: 'authenticated',
    user_metadata: {
      name: mockUser.name,
      avatar_url: mockUser.avatar,
    },
    app_metadata: {
      provider: 'email',
      providers: ['email'],
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Intercept ALL Supabase auth API calls and return mock authenticated user
  // This needs to be done BEFORE any navigation to bypass middleware checks
  await page.route('**/*.supabase.co/auth/v1/**', (route) => {
    const url = route.request().url()

    // Handle getUser / user endpoint - most important for middleware
    if (url.includes('/auth/v1/user')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify(mockUserData),
      })
    }

    // Handle token endpoint
    if (url.includes('/auth/v1/token')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({
          access_token: mockAccessToken,
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          refresh_token: 'mock-refresh-token',
          user: mockUserData,
        }),
      })
    }

    // Handle session endpoint
    if (url.includes('/auth/v1/session')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({
          access_token: mockAccessToken,
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          user: mockUserData,
        }),
      })
    }

    // For any other auth endpoint, return success
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ success: true }),
    })
  })

  // Set Supabase auth cookies
  // Supabase uses sb-<project-ref>-auth-token format, but we'll use a generic project ref for testing
  // The actual cookie format needs to match what Supabase SSR expects
  const mockAuthToken = {
    access_token: mockAccessToken,
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: {
      id: mockUser.id,
      email: mockUser.email,
      aud: 'authenticated',
      role: 'authenticated',
      user_metadata: {
        name: mockUser.name,
        avatar_url: mockUser.avatar,
      },
    },
  }

  // Set the Supabase auth token cookie (base64 encoded JSON)
  await context.addCookies([
    {
      name: 'sb-localhost-auth-token',
      value: Buffer.from(JSON.stringify(mockAuthToken)).toString('base64'),
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ])

  // Navigate to base URL to set localStorage
  await page.goto('/pt')

  // Set localStorage with auth data
  await page.evaluate((user) => {
    // Set E2E test mode flag to bypass auth redirects
    localStorage.setItem('e2e_test_mode', 'true')

    // Set user data
    localStorage.setItem('user', JSON.stringify(user))

    // Set authentication flag
    localStorage.setItem('isAuthenticated', 'true')

    // Set mock Supabase session
    const mockSession = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          name: user.name,
          avatar_url: user.avatar,
        },
      },
    }

    localStorage.setItem('supabase.auth.token', JSON.stringify(mockSession))
  }, mockUser)
}

/**
 * Create a mock JWT token for testing
 *
 * This is a simplified JWT - not cryptographically valid,
 * but sufficient for E2E tests that don't verify signatures
 */
function createMockJWT(user: TestUser): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  }

  const payload = {
    sub: user.id,
    email: user.email,
    user_metadata: {
      name: user.name,
      avatar_url: user.avatar,
    },
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    iat: Math.floor(Date.now() / 1000),
  }

  // Base64 encode (not real JWT signing, just for testing)
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')

  // Mock signature
  const signature = 'mock-signature'

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

/**
 * Clear authentication state
 *
 * Use this in test cleanup to reset auth state
 */
export async function clearAuth(page: Page, context: BrowserContext): Promise<void> {
  // Clear cookies
  await context.clearCookies()

  // Clear localStorage
  await page.evaluate(() => {
    localStorage.removeItem('e2e_test_mode')
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('supabase.auth.token')
  })
}
