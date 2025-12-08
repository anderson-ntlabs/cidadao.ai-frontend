/**
 * Supabase Test Mock Factory
 *
 * Provides reusable mocks for Supabase client in tests.
 * Use these mocks to test auth flows, database operations, and API calls.
 */

import { vi } from 'vitest'
import type { User, Session, AuthError } from '@supabase/supabase-js'

// ============================================================================
// Mock User Factory
// ============================================================================

export interface MockUserOptions {
  id?: string
  email?: string
  name?: string
  avatar?: string
  provider?: 'google' | 'github' | 'spotify' | 'facebook' | 'email'
  emailVerified?: boolean
  role?: string
}

export function createMockUser(options: MockUserOptions = {}): User {
  const {
    id = 'user-123',
    email = 'test@example.com',
    name = 'Test User',
    avatar = 'https://example.com/avatar.png',
    provider = 'google',
    emailVerified = true,
    role = 'user',
  } = options

  return {
    id,
    email,
    email_confirmed_at: emailVerified ? new Date().toISOString() : undefined,
    phone: undefined,
    confirmed_at: emailVerified ? new Date().toISOString() : undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    app_metadata: {
      provider,
      providers: [provider],
      role,
    },
    user_metadata: {
      full_name: name,
      name,
      avatar_url: avatar,
      email,
      email_verified: emailVerified,
    },
    aud: 'authenticated',
    role: 'authenticated',
    identities: [
      {
        id: `${provider}-identity-123`,
        user_id: id,
        identity_data: {
          email,
          full_name: name,
          avatar_url: avatar,
        },
        provider,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
      },
    ],
  } as User
}

// ============================================================================
// Mock Session Factory
// ============================================================================

export interface MockSessionOptions {
  user?: User
  accessToken?: string
  refreshToken?: string
  expiresIn?: number
  expiresAt?: number
}

export function createMockSession(options: MockSessionOptions = {}): Session {
  const {
    user = createMockUser(),
    accessToken = 'mock-access-token-123',
    refreshToken = 'mock-refresh-token-456',
    expiresIn = 3600,
    expiresAt = Math.floor(Date.now() / 1000) + 3600,
  } = options

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: expiresIn,
    expires_at: expiresAt,
    token_type: 'bearer',
    user,
  }
}

// ============================================================================
// Mock Auth Error Factory
// ============================================================================

export function createMockAuthError(
  message: string = 'Authentication failed',
  status: number = 401
): AuthError {
  return {
    name: 'AuthError',
    message,
    status,
    code: 'auth_error',
  } as AuthError
}

// ============================================================================
// Supabase Client Mock Factory
// ============================================================================

export interface MockSupabaseClientOptions {
  user?: User | null
  session?: Session | null
  authError?: AuthError | null
}

export function createMockSupabaseClient(options: MockSupabaseClientOptions = {}) {
  const { user = null, session = null, authError = null } = options

  const mockAuth = {
    getUser: vi.fn().mockResolvedValue({
      data: { user },
      error: authError,
    }),
    getSession: vi.fn().mockResolvedValue({
      data: { session },
      error: authError,
    }),
    signInWithOAuth: vi.fn().mockResolvedValue({
      data: { provider: 'google', url: 'https://oauth.example.com' },
      error: authError,
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user, session },
      error: authError,
    }),
    signUp: vi.fn().mockResolvedValue({
      data: { user, session },
      error: authError,
    }),
    signOut: vi.fn().mockResolvedValue({
      error: authError,
    }),
    refreshSession: vi.fn().mockResolvedValue({
      data: { session },
      error: authError,
    }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
    exchangeCodeForSession: vi.fn().mockResolvedValue({
      data: { session },
      error: authError,
    }),
  }

  const mockFrom = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  })

  return {
    auth: mockAuth,
    from: mockFrom,
  }
}

// ============================================================================
// Mock Supabase Module
// ============================================================================

/**
 * Create a complete mock for @/lib/supabase/client module
 * Usage in test file:
 *
 * vi.mock('@/lib/supabase/client', () => ({
 *   createClient: () => createMockSupabaseClient({ user: mockUser }),
 * }))
 */
export function createSupabaseClientMock(options: MockSupabaseClientOptions = {}) {
  return {
    createClient: vi.fn(() => createMockSupabaseClient(options)),
  }
}

/**
 * Create a mock for @supabase/ssr createServerClient
 * Usage for middleware/server component testing
 */
export function createSupabaseServerMock(options: MockSupabaseClientOptions = {}) {
  return {
    createServerClient: vi.fn(() => createMockSupabaseClient(options)),
  }
}

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Helper to create authenticated state
 */
export function createAuthenticatedState(userOptions: MockUserOptions = {}) {
  const user = createMockUser(userOptions)
  const session = createMockSession({ user })
  return { user, session }
}

/**
 * Helper to create unauthenticated state
 */
export function createUnauthenticatedState() {
  return { user: null, session: null }
}

/**
 * Helper to create error state
 */
export function createAuthErrorState(message: string = 'Invalid credentials') {
  return {
    user: null,
    session: null,
    error: createMockAuthError(message),
  }
}

// ============================================================================
// Next.js Request/Response Mocks (for middleware testing)
// ============================================================================

export function createMockNextRequest(
  options: {
    url?: string
    method?: string
    headers?: Record<string, string>
    cookies?: Record<string, string>
  } = {}
) {
  const {
    url = 'http://localhost:3000/pt/app',
    method = 'GET',
    headers = {},
    cookies = {},
  } = options

  const cookieStore = new Map(Object.entries(cookies))

  return {
    url,
    method,
    headers: {
      get: vi.fn((name: string) => headers[name] || null),
      has: vi.fn((name: string) => name in headers),
    },
    cookies: {
      get: vi.fn((name: string) => {
        const value = cookieStore.get(name)
        return value ? { name, value } : undefined
      }),
      getAll: vi.fn(() =>
        Array.from(cookieStore.entries()).map(([name, value]) => ({ name, value }))
      ),
      set: vi.fn((name: string, value: string) => cookieStore.set(name, value)),
      delete: vi.fn((name: string) => cookieStore.delete(name)),
    },
    nextUrl: new URL(url),
  }
}

export function createMockNextResponse() {
  const cookies = new Map<string, { value: string; options?: Record<string, unknown> }>()

  return {
    cookies: {
      set: vi.fn((name: string, value: string, options?: Record<string, unknown>) =>
        cookies.set(name, { value, options })
      ),
      get: vi.fn((name: string) => cookies.get(name)),
      delete: vi.fn((name: string) => cookies.delete(name)),
    },
    headers: new Map(),
  }
}
