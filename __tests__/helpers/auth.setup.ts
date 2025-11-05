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
  avatar: '/agents/abaporu.png',
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
  // Mock Supabase access token (JWT format)
  const mockAccessToken = createMockJWT(mockUser)

  // Intercept Supabase auth API calls and return mock session
  await page.route('**/auth/v1/token**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: mockAccessToken,
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: 'mock-refresh-token',
        user: {
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
        },
      }),
    })
  })

  // Intercept Supabase user session check
  await page.route('**/auth/v1/user**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
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
      }),
    })
  })

  // Set Supabase auth cookies
  await context.addCookies([
    {
      name: 'sb-access-token',
      value: mockAccessToken,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
    {
      name: 'sb-refresh-token',
      value: 'mock-refresh-token',
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
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('supabase.auth.token')
  })
}
