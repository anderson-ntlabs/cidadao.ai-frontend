/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createMockUser,
  createMockSession,
  createMockAuthError,
  createMockSupabaseClient,
} from '../../../__tests__/fixtures/supabase-mock'

// Use vi.hoisted to create mock that can be used in vi.mock factory
const mockLogger = vi.hoisted(() => ({
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
  warn: vi.fn(),
}))

// Mock logger with hoisted mock
vi.mock('@/lib/utils/logger', () => ({
  logger: mockLogger,
}))

// Mock the Supabase client module
vi.mock('../client', () => ({
  createClient: vi.fn(),
}))

import {
  signInWithGoogle,
  signInWithGithub,
  signInWithSpotify,
  signInWithFacebook,
  signOut,
  isAuthenticated,
  getCurrentUser,
} from '../auth-helpers'
import { createClient } from '../client'

describe('auth-helpers', () => {
  let mockSupabaseClient: ReturnType<typeof createMockSupabaseClient>
  let originalLocationHref: string

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock client
    mockSupabaseClient = createMockSupabaseClient()
    vi.mocked(createClient).mockReturnValue(mockSupabaseClient as any)

    // Save original and mock window.location
    originalLocationHref = window.location.href
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        origin: 'http://localhost:3000',
        href: 'http://localhost:3000/pt/login',
      },
      writable: true,
    })
  })

  afterEach(() => {
    // Restore window.location
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        href: originalLocationHref,
      },
      writable: true,
    })
  })

  describe('signInWithGoogle', () => {
    it('should call signInWithOAuth with correct parameters', async () => {
      await signInWithGoogle()

      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback?next=/pt/app',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
    })

    it('should return data on success', async () => {
      const mockData = { provider: 'google', url: 'https://oauth.google.com' }
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: mockData,
        error: null,
      })

      const result = await signInWithGoogle()

      expect(result).toEqual(mockData)
    })

    it('should throw and log error on failure', async () => {
      const mockError = createMockAuthError('Google OAuth failed')
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: mockError,
      })

      await expect(signInWithGoogle()).rejects.toThrow()
      expect(mockLogger.error).toHaveBeenCalledWith(mockError, {
        provider: 'google',
        action: 'signInWithOAuth',
      })
    })
  })

  describe('signInWithGithub', () => {
    it('should call signInWithOAuth with correct parameters', async () => {
      await signInWithGithub()

      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'github',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback?next=/pt/app',
        },
      })
    })

    it('should return data on success', async () => {
      const mockData = { provider: 'github', url: 'https://oauth.github.com' }
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: mockData,
        error: null,
      })

      const result = await signInWithGithub()

      expect(result).toEqual(mockData)
    })

    it('should throw and log error on failure', async () => {
      const mockError = createMockAuthError('GitHub OAuth failed')
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: mockError,
      })

      await expect(signInWithGithub()).rejects.toThrow()
      expect(mockLogger.error).toHaveBeenCalledWith(mockError, {
        provider: 'github',
        action: 'signInWithOAuth',
      })
    })
  })

  describe('signInWithSpotify', () => {
    it('should call signInWithOAuth with correct scopes', async () => {
      await signInWithSpotify()

      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'spotify',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback?next=/pt/app',
          scopes: 'user-read-email user-read-private',
        },
      })
    })

    it('should throw and log error on failure', async () => {
      const mockError = createMockAuthError('Spotify OAuth failed')
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: mockError,
      })

      await expect(signInWithSpotify()).rejects.toThrow()
      expect(mockLogger.error).toHaveBeenCalledWith(mockError, {
        provider: 'spotify',
        action: 'signInWithOAuth',
      })
    })
  })

  describe('signInWithFacebook', () => {
    it('should call signInWithOAuth with correct scopes', async () => {
      await signInWithFacebook()

      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'facebook',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback?next=/pt/app',
          scopes: 'email public_profile',
        },
      })
    })

    it('should throw and log error on failure', async () => {
      const mockError = createMockAuthError('Facebook OAuth failed')
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: mockError,
      })

      await expect(signInWithFacebook()).rejects.toThrow()
      expect(mockLogger.error).toHaveBeenCalledWith(mockError, {
        provider: 'facebook',
        action: 'signInWithOAuth',
      })
    })
  })

  describe('signOut', () => {
    it('should call signOut and redirect to landing page', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null })

      await signOut()

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
      expect(window.location.href).toBe('/pt')
    })

    it('should throw and log error on failure', async () => {
      const mockError = createMockAuthError('Sign out failed')
      mockSupabaseClient.auth.signOut.mockResolvedValue({ error: mockError })

      await expect(signOut()).rejects.toThrow()
      expect(mockLogger.error).toHaveBeenCalledWith(mockError, { action: 'signOut' })
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when session exists', async () => {
      const mockSession = createMockSession()
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      const result = await isAuthenticated()

      expect(result).toBe(true)
    })

    it('should return false when no session', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const result = await isAuthenticated()

      expect(result).toBe(false)
    })
  })

  describe('getCurrentUser', () => {
    it('should return user when authenticated', async () => {
      const mockUser = createMockUser({ email: 'test@example.com' })
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await getCurrentUser()

      expect(result).toEqual(mockUser)
    })

    it('should return null and log error when getUser fails', async () => {
      const mockError = createMockAuthError('User not found')
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: mockError,
      })

      const result = await getCurrentUser()

      expect(result).toBeNull()
      expect(mockLogger.error).toHaveBeenCalledWith(mockError, { action: 'getCurrentUser' })
    })
  })
})
