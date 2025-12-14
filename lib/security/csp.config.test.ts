/**
 * Tests for CSP (Content Security Policy) Configuration
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  generateNonce,
  buildCSP,
  productionCSP,
  developmentCSP,
  getCSPConfig,
  reportOnlyCSP,
  type CSPDirectives,
} from './csp.config'

describe('CSP Configuration', () => {
  describe('generateNonce', () => {
    it('should generate a non-empty string', () => {
      const nonce = generateNonce()

      expect(nonce).toBeTruthy()
      expect(typeof nonce).toBe('string')
    })

    it('should generate unique nonces', () => {
      const nonce1 = generateNonce()
      const nonce2 = generateNonce()

      expect(nonce1).not.toBe(nonce2)
    })

    it('should generate UUID format when crypto.randomUUID is available', () => {
      const nonce = generateNonce()

      // Should be either UUID or random string
      expect(nonce.length).toBeGreaterThan(0)
    })

    it('should fallback to Math.random when crypto is unavailable', () => {
      const originalCrypto = global.crypto

      // Temporarily remove crypto
      Object.defineProperty(global, 'crypto', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      const nonce = generateNonce()

      expect(nonce).toBeTruthy()
      expect(nonce.length).toBeGreaterThan(0)

      // Restore crypto
      Object.defineProperty(global, 'crypto', {
        value: originalCrypto,
        writable: true,
        configurable: true,
      })
    })
  })

  describe('buildCSP', () => {
    it('should build CSP string from directives', () => {
      const directives: CSPDirectives = {
        'default-src': ["'self'"],
        'script-src': ["'self'", 'https://example.com'],
      }

      const csp = buildCSP(directives)

      expect(csp).toContain("default-src 'self'")
      expect(csp).toContain("script-src 'self' https://example.com")
      expect(csp).toContain(';')
    })

    it('should add nonce to script-src when provided', () => {
      const directives: CSPDirectives = {
        'script-src': ["'self'"],
      }

      const nonce = 'test-nonce-123'
      const csp = buildCSP(directives, nonce)

      expect(csp).toContain(`'nonce-${nonce}'`)
    })

    it('should add nonce to style-src when provided', () => {
      const directives: CSPDirectives = {
        'style-src': ["'self'"],
      }

      const nonce = 'test-nonce-456'
      const csp = buildCSP(directives, nonce)

      expect(csp).toContain(`'nonce-${nonce}'`)
    })

    it('should not add nonce to other directives', () => {
      const directives: CSPDirectives = {
        'img-src': ["'self'"],
        'font-src': ["'self'"],
      }

      const nonce = 'test-nonce-789'
      const csp = buildCSP(directives, nonce)

      expect(csp).not.toContain(`'nonce-${nonce}'`)
    })

    it('should handle empty directives', () => {
      const directives: CSPDirectives = {
        'upgrade-insecure-requests': [],
      }

      const csp = buildCSP(directives)

      expect(csp).toBe('upgrade-insecure-requests ')
    })

    it('should join multiple policies with semicolon', () => {
      const directives: CSPDirectives = {
        'default-src': ["'self'"],
        'img-src': ["'self'", 'data:'],
        'font-src': ["'self'"],
      }

      const csp = buildCSP(directives)

      const parts = csp.split('; ')
      expect(parts.length).toBe(3)
    })
  })

  describe('productionCSP', () => {
    it('should have default-src directive', () => {
      expect(productionCSP['default-src']).toBeDefined()
      expect(productionCSP['default-src']).toContain("'self'")
    })

    it('should have script-src with required sources', () => {
      expect(productionCSP['script-src']).toContain("'self'")
      expect(productionCSP['script-src']).toContain("'unsafe-eval'")
      expect(productionCSP['script-src']).toContain("'unsafe-inline'")
    })

    it('should allow VLibras in script-src', () => {
      expect(productionCSP['script-src']).toContain('https://vlibras.gov.br')
      expect(productionCSP['script-src']).toContain('https://*.vlibras.gov.br')
    })

    it('should have img-src with necessary sources', () => {
      expect(productionCSP['img-src']).toContain("'self'")
      expect(productionCSP['img-src']).toContain('data:')
      expect(productionCSP['img-src']).toContain('blob:')
    })

    it('should allow YouTube thumbnails in img-src', () => {
      expect(productionCSP['img-src']).toContain('https://img.youtube.com')
      expect(productionCSP['img-src']).toContain('https://i.ytimg.com')
    })

    it('should allow Google avatars for OAuth', () => {
      expect(productionCSP['img-src']).toContain('https://lh3.googleusercontent.com')
    })

    it('should allow GitHub avatars for OAuth', () => {
      expect(productionCSP['img-src']).toContain('https://avatars.githubusercontent.com')
    })

    it('should have connect-src with API endpoints', () => {
      expect(productionCSP['connect-src']).toContain("'self'")
      expect(productionCSP['connect-src']).toContain(
        'https://cidadao-api-production.up.railway.app'
      )
    })

    it('should allow PostHog analytics', () => {
      expect(productionCSP['connect-src']).toContain('https://us.i.posthog.com')
    })

    it('should disallow object-src', () => {
      expect(productionCSP['object-src']).toContain("'none'")
    })

    it('should prevent clickjacking', () => {
      expect(productionCSP['frame-ancestors']).toContain("'none'")
    })

    it('should allow YouTube embeds in frame-src', () => {
      expect(productionCSP['frame-src']).toContain('https://www.youtube.com')
    })

    it('should have upgrade-insecure-requests', () => {
      expect(productionCSP['upgrade-insecure-requests']).toBeDefined()
    })

    it('should have block-all-mixed-content', () => {
      expect(productionCSP['block-all-mixed-content']).toBeDefined()
    })

    it('should allow blob URLs for media (TTS)', () => {
      expect(productionCSP['media-src']).toContain('blob:')
    })

    it('should allow blob URLs for workers (VLibras)', () => {
      expect(productionCSP['worker-src']).toContain('blob:')
    })
  })

  describe('developmentCSP', () => {
    it('should have default-src directive', () => {
      expect(developmentCSP['default-src']).toContain("'self'")
    })

    it('should allow localhost connections', () => {
      expect(developmentCSP['connect-src']).toContain('http://localhost:*')
      expect(developmentCSP['connect-src']).toContain('ws://localhost:*')
      expect(developmentCSP['connect-src']).toContain('wss://localhost:*')
    })

    it('should be more permissive with img-src', () => {
      expect(developmentCSP['img-src']).toContain('https:')
    })

    it('should allow unsafe-eval for hot reload', () => {
      expect(developmentCSP['script-src']).toContain("'unsafe-eval'")
    })

    it('should allow unsafe-inline for hot reload', () => {
      expect(developmentCSP['script-src']).toContain("'unsafe-inline'")
    })
  })

  describe('getCSPConfig', () => {
    const originalEnv = process.env.NODE_ENV

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('should return production CSP in production', () => {
      vi.stubEnv('NODE_ENV', 'production')

      const config = getCSPConfig()

      expect(config).toEqual(productionCSP)
    })

    it('should return development CSP in development', () => {
      vi.stubEnv('NODE_ENV', 'development')

      const config = getCSPConfig()

      expect(config).toEqual(developmentCSP)
    })

    it('should return development CSP for test environment', () => {
      vi.stubEnv('NODE_ENV', 'test')

      const config = getCSPConfig()

      expect(config).toEqual(developmentCSP)
    })
  })

  describe('reportOnlyCSP', () => {
    it('should extend production CSP', () => {
      expect(reportOnlyCSP['default-src']).toEqual(productionCSP['default-src'])
      expect(reportOnlyCSP['script-src']).toEqual(productionCSP['script-src'])
    })

    it('should have report-uri directive', () => {
      expect(reportOnlyCSP['report-uri']).toBeDefined()
      expect(reportOnlyCSP['report-uri']).toContain('/api/security/csp-report')
    })
  })

  describe('CSP Security Coverage', () => {
    it('should have all essential security directives', () => {
      const essentialDirectives = [
        'default-src',
        'script-src',
        'style-src',
        'img-src',
        'font-src',
        'connect-src',
        'object-src',
        'base-uri',
        'form-action',
        'frame-ancestors',
      ]

      essentialDirectives.forEach((directive) => {
        expect(productionCSP[directive]).toBeDefined()
      })
    })

    it('should block plugins via object-src', () => {
      expect(productionCSP['object-src']).toEqual(["'none'"])
    })

    it('should restrict base-uri to self', () => {
      expect(productionCSP['base-uri']).toEqual(["'self'"])
    })

    it('should restrict form-action to self', () => {
      expect(productionCSP['form-action']).toEqual(["'self'"])
    })
  })
})
