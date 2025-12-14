/**
 * CSRF Protection Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

import {
  generateCSRFToken,
  setCSRFCookie,
  getCSRFTokenFromCookie,
  getCSRFTokenFromHeader,
  verifyCSRFToken,
  csrfProtection,
  initializeCSRFToken,
  getCSRFToken,
} from './csrf'

describe('CSRF Protection', () => {
  describe('generateCSRFToken', () => {
    it('should generate a non-empty token', () => {
      const token = generateCSRFToken()
      expect(token).toBeTruthy()
      expect(token.length).toBeGreaterThan(0)
    })

    it('should generate unique tokens', () => {
      const token1 = generateCSRFToken()
      const token2 = generateCSRFToken()
      expect(token1).not.toBe(token2)
    })

    it('should generate token with valid format (UUID or hex)', () => {
      const token = generateCSRFToken()
      // Should be either UUID format or hex string (32 chars for fallback)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)
      const isHex = /^[0-9a-f]{32}$/i.test(token)
      expect(isUUID || isHex).toBe(true)
    })

    it('should generate tokens of consistent length', () => {
      const tokens = Array.from({ length: 5 }, () => generateCSRFToken())
      const lengths = new Set(tokens.map((t) => t.length))
      // All tokens should have same length (either 36 for UUID or 32 for hex)
      expect(lengths.size).toBe(1)
    })
  })

  describe('setCSRFCookie', () => {
    it('should set cookie with correct options', () => {
      const mockSet = vi.fn()
      const response = {
        cookies: { set: mockSet },
      } as unknown as NextResponse

      setCSRFCookie(response, 'test-token')

      expect(mockSet).toHaveBeenCalledWith('csrf_token', 'test-token', {
        httpOnly: true,
        secure: false, // NODE_ENV is 'test'
        sameSite: 'strict',
        path: '/',
        maxAge: 86400, // 24 hours
      })
    })
  })

  describe('getCSRFTokenFromCookie', () => {
    it('should return token from cookie', () => {
      const request = {
        cookies: {
          get: vi.fn().mockReturnValue({ value: 'cookie-token' }),
        },
      } as unknown as NextRequest

      const token = getCSRFTokenFromCookie(request)

      expect(token).toBe('cookie-token')
    })

    it('should return undefined when cookie not present', () => {
      const request = {
        cookies: {
          get: vi.fn().mockReturnValue(undefined),
        },
      } as unknown as NextRequest

      const token = getCSRFTokenFromCookie(request)

      expect(token).toBeUndefined()
    })
  })

  describe('getCSRFTokenFromHeader', () => {
    it('should return token from header', () => {
      const request = {
        headers: {
          get: vi.fn().mockReturnValue('header-token'),
        },
      } as unknown as NextRequest

      const token = getCSRFTokenFromHeader(request)

      expect(token).toBe('header-token')
    })

    it('should return undefined when header not present', () => {
      const request = {
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
      } as unknown as NextRequest

      const token = getCSRFTokenFromHeader(request)

      expect(token).toBeUndefined()
    })
  })

  describe('verifyCSRFToken', () => {
    it('should return true when tokens match', () => {
      const request = {
        cookies: {
          get: vi.fn().mockReturnValue({ value: 'matching-token' }),
        },
        headers: {
          get: vi.fn().mockReturnValue('matching-token'),
        },
      } as unknown as NextRequest

      const result = verifyCSRFToken(request)

      expect(result).toBe(true)
    })

    it('should return false when tokens dont match', () => {
      const request = {
        cookies: {
          get: vi.fn().mockReturnValue({ value: 'cookie-token' }),
        },
        headers: {
          get: vi.fn().mockReturnValue('different-token'),
        },
      } as unknown as NextRequest

      const result = verifyCSRFToken(request)

      expect(result).toBe(false)
    })

    it('should return false when cookie token missing', () => {
      const request = {
        cookies: {
          get: vi.fn().mockReturnValue(undefined),
        },
        headers: {
          get: vi.fn().mockReturnValue('header-token'),
        },
      } as unknown as NextRequest

      const result = verifyCSRFToken(request)

      expect(result).toBe(false)
    })

    it('should return false when header token missing', () => {
      const request = {
        cookies: {
          get: vi.fn().mockReturnValue({ value: 'cookie-token' }),
        },
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
      } as unknown as NextRequest

      const result = verifyCSRFToken(request)

      expect(result).toBe(false)
    })
  })

  describe('csrfProtection', () => {
    it('should return null for GET requests', () => {
      const request = {
        method: 'GET',
        nextUrl: { pathname: '/api/test' },
      } as unknown as NextRequest

      const result = csrfProtection(request)

      expect(result).toBeNull()
    })

    it('should return null for HEAD requests', () => {
      const request = {
        method: 'HEAD',
        nextUrl: { pathname: '/api/test' },
      } as unknown as NextRequest

      const result = csrfProtection(request)

      expect(result).toBeNull()
    })

    it('should return null for OPTIONS requests', () => {
      const request = {
        method: 'OPTIONS',
        nextUrl: { pathname: '/api/test' },
      } as unknown as NextRequest

      const result = csrfProtection(request)

      expect(result).toBeNull()
    })

    it('should skip webhook paths', () => {
      const request = {
        method: 'POST',
        nextUrl: { pathname: '/api/webhooks/stripe' },
      } as unknown as NextRequest

      const result = csrfProtection(request)

      expect(result).toBeNull()
    })

    it('should skip CSP report path', () => {
      const request = {
        method: 'POST',
        nextUrl: { pathname: '/api/security/csp-report' },
      } as unknown as NextRequest

      const result = csrfProtection(request)

      expect(result).toBeNull()
    })

    it('should return 403 when token verification fails', () => {
      const request = {
        method: 'POST',
        nextUrl: { pathname: '/api/test' },
        cookies: {
          get: vi.fn().mockReturnValue(undefined),
        },
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
      } as unknown as NextRequest

      const result = csrfProtection(request)

      expect(result).toBeInstanceOf(NextResponse)
      expect(result?.status).toBe(403)
    })

    it('should return null when token verification passes', () => {
      const request = {
        method: 'POST',
        nextUrl: { pathname: '/api/test' },
        cookies: {
          get: vi.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: {
          get: vi.fn().mockReturnValue('valid-token'),
        },
      } as unknown as NextRequest

      const result = csrfProtection(request)

      expect(result).toBeNull()
    })

    it('should check CSRF for PUT requests', () => {
      const request = {
        method: 'PUT',
        nextUrl: { pathname: '/api/test' },
        cookies: {
          get: vi.fn().mockReturnValue(undefined),
        },
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
      } as unknown as NextRequest

      const result = csrfProtection(request)

      expect(result?.status).toBe(403)
    })

    it('should check CSRF for PATCH requests', () => {
      const request = {
        method: 'PATCH',
        nextUrl: { pathname: '/api/test' },
        cookies: {
          get: vi.fn().mockReturnValue(undefined),
        },
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
      } as unknown as NextRequest

      const result = csrfProtection(request)

      expect(result?.status).toBe(403)
    })

    it('should check CSRF for DELETE requests', () => {
      const request = {
        method: 'DELETE',
        nextUrl: { pathname: '/api/test' },
        cookies: {
          get: vi.fn().mockReturnValue(undefined),
        },
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
      } as unknown as NextRequest

      const result = csrfProtection(request)

      expect(result?.status).toBe(403)
    })
  })

  describe('initializeCSRFToken', () => {
    it('should set new token when none exists', () => {
      const mockCookieSet = vi.fn()
      const mockHeaderSet = vi.fn()

      const request = {
        cookies: {
          get: vi.fn().mockReturnValue(undefined),
        },
      } as unknown as NextRequest

      const response = {
        cookies: { set: mockCookieSet },
        headers: { set: mockHeaderSet },
      } as unknown as NextResponse

      const result = initializeCSRFToken(request, response)

      expect(mockCookieSet).toHaveBeenCalled()
      expect(mockHeaderSet).toHaveBeenCalled()
      expect(result).toBe(response)
    })

    it('should not set token when one exists', () => {
      const mockCookieSet = vi.fn()
      const mockHeaderSet = vi.fn()

      const request = {
        cookies: {
          get: vi.fn().mockReturnValue({ value: 'existing-token' }),
        },
      } as unknown as NextRequest

      const response = {
        cookies: { set: mockCookieSet },
        headers: { set: mockHeaderSet },
      } as unknown as NextResponse

      initializeCSRFToken(request, response)

      expect(mockCookieSet).not.toHaveBeenCalled()
      expect(mockHeaderSet).not.toHaveBeenCalled()
    })
  })

  describe('getCSRFToken', () => {
    it('should return existing token from cookie', () => {
      const request = {
        cookies: {
          get: vi.fn().mockReturnValue({ value: 'existing-token' }),
        },
      } as unknown as NextRequest

      const token = getCSRFToken(request)

      expect(token).toBe('existing-token')
    })

    it('should generate new token when none exists', () => {
      const request = {
        cookies: {
          get: vi.fn().mockReturnValue(undefined),
        },
      } as unknown as NextRequest

      const token = getCSRFToken(request)

      expect(token).toBeTruthy()
      expect(token.length).toBeGreaterThan(0)
    })
  })
})
