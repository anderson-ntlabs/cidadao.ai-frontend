/**
 * Ensure HTTPS Tests
 *
 * Tests for URL security utility functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ensureHttps, getSecureApiUrl, isSecureUrl, ensureSecureFetch } from './ensure-https'

describe('ensure-https', () => {
  describe('ensureHttps', () => {
    it('should return default URL for null input', () => {
      const result = ensureHttps(null)
      expect(result).toBe('https://cidadao-api-production.up.railway.app')
    })

    it('should return default URL for undefined input', () => {
      const result = ensureHttps(undefined)
      expect(result).toBe('https://cidadao-api-production.up.railway.app')
    })

    it('should return default URL for empty string', () => {
      const result = ensureHttps('')
      expect(result).toBe('https://cidadao-api-production.up.railway.app')
    })

    it('should convert http:// to https://', () => {
      const result = ensureHttps('http://example.com')
      expect(result).toBe('https://example.com')
    })

    it('should convert http:// with path to https://', () => {
      const result = ensureHttps('http://api.example.com/v1/endpoint')
      expect(result).toBe('https://api.example.com/v1/endpoint')
    })

    it('should preserve https:// URL', () => {
      const result = ensureHttps('https://secure.example.com')
      expect(result).toBe('https://secure.example.com')
    })

    it('should add https:// to URL without protocol', () => {
      const result = ensureHttps('example.com')
      expect(result).toBe('https://example.com')
    })

    it('should add https:// to URL with path but no protocol', () => {
      const result = ensureHttps('api.example.com/v1/data')
      expect(result).toBe('https://api.example.com/v1/data')
    })

    it('should preserve query parameters', () => {
      const result = ensureHttps('http://example.com/search?q=test&page=1')
      expect(result).toBe('https://example.com/search?q=test&page=1')
    })

    it('should preserve port number', () => {
      const result = ensureHttps('http://localhost:3000')
      expect(result).toBe('https://localhost:3000')
    })
  })

  describe('getSecureApiUrl', () => {
    const originalEnv = process.env

    beforeEach(() => {
      vi.resetModules()
      process.env = { ...originalEnv }
    })

    afterEach(() => {
      process.env = originalEnv
    })

    it('should return NEXT_PUBLIC_API_URL if set', () => {
      process.env.NEXT_PUBLIC_API_URL = 'http://custom-api.com'
      const result = getSecureApiUrl()
      expect(result).toBe('https://custom-api.com')
    })

    it('should return NEXT_PUBLIC_API_BASE_URL if NEXT_PUBLIC_API_URL not set', () => {
      delete process.env.NEXT_PUBLIC_API_URL
      process.env.NEXT_PUBLIC_API_BASE_URL = 'http://base-api.com'
      const result = getSecureApiUrl()
      expect(result).toBe('https://base-api.com')
    })

    it('should return default URL if no env vars set', () => {
      delete process.env.NEXT_PUBLIC_API_URL
      delete process.env.NEXT_PUBLIC_API_BASE_URL
      const result = getSecureApiUrl()
      expect(result).toBe('https://cidadao-api-production.up.railway.app')
    })

    it('should ensure HTTPS for env var with HTTP', () => {
      process.env.NEXT_PUBLIC_API_URL = 'http://insecure-api.com'
      const result = getSecureApiUrl()
      expect(result).toBe('https://insecure-api.com')
    })
  })

  describe('isSecureUrl', () => {
    it('should return true for https:// URLs', () => {
      expect(isSecureUrl('https://example.com')).toBe(true)
    })

    it('should return true for https:// URLs with path', () => {
      expect(isSecureUrl('https://example.com/api/v1')).toBe(true)
    })

    it('should return false for http:// URLs', () => {
      expect(isSecureUrl('http://example.com')).toBe(false)
    })

    it('should return false for URLs without protocol', () => {
      expect(isSecureUrl('example.com')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isSecureUrl('')).toBe(false)
    })

    it('should return false for ftp:// URLs', () => {
      expect(isSecureUrl('ftp://files.example.com')).toBe(false)
    })
  })

  describe('ensureSecureFetch', () => {
    it('should return array with secure URL and config', () => {
      const config: RequestInit = { method: 'POST' }
      const [url, returnedConfig] = ensureSecureFetch('http://api.com/data', config)

      expect(url).toBe('https://api.com/data')
      expect(returnedConfig).toBe(config)
    })

    it('should handle undefined config', () => {
      const [url, returnedConfig] = ensureSecureFetch('http://api.com')

      expect(url).toBe('https://api.com')
      expect(returnedConfig).toBeUndefined()
    })

    it('should preserve already secure URLs', () => {
      const [url] = ensureSecureFetch('https://secure-api.com')
      expect(url).toBe('https://secure-api.com')
    })

    it('should add https:// to URLs without protocol', () => {
      const [url] = ensureSecureFetch('api.example.com/endpoint')
      expect(url).toBe('https://api.example.com/endpoint')
    })

    it('should preserve complex config objects', () => {
      const config: RequestInit = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'value' }),
      }
      const [, returnedConfig] = ensureSecureFetch('http://api.com', config)

      expect(returnedConfig).toEqual(config)
    })
  })
})
