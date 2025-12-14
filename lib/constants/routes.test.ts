/**
 * Routes Constants Tests
 */

import { describe, it, expect } from 'vitest'
import {
  PUBLIC_ROUTES_PT,
  PUBLIC_ROUTES_EN,
  AUTH_ROUTES,
  AUTH_SYSTEM_ROUTES,
  API_ROUTES,
  ALLOWED_OAUTH_REDIRECTS,
  getPublicRoutes,
  isAuthRoute,
  isPublicRoute,
  getDefaultAuthRedirect,
  getLoginRoute,
  isValidOAuthRedirect,
  getSafeOAuthRedirect,
} from './routes'

describe('Route Constants', () => {
  describe('PUBLIC_ROUTES_PT', () => {
    it('should have correct Portuguese routes', () => {
      expect(PUBLIC_ROUTES_PT.HOME).toBe('/pt')
      expect(PUBLIC_ROUTES_PT.LOGIN).toBe('/pt/login')
      expect(PUBLIC_ROUTES_PT.ABOUT).toBe('/pt/about')
      expect(PUBLIC_ROUTES_PT.AGENTS).toBe('/pt/agents')
      expect(PUBLIC_ROUTES_PT.PRIVACY).toBe('/pt/privacy')
      expect(PUBLIC_ROUTES_PT.TERMS).toBe('/pt/terms')
      expect(PUBLIC_ROUTES_PT.HELP).toBe('/pt/help')
    })
  })

  describe('PUBLIC_ROUTES_EN', () => {
    it('should have correct English routes', () => {
      expect(PUBLIC_ROUTES_EN.HOME).toBe('/en')
      expect(PUBLIC_ROUTES_EN.LOGIN).toBe('/en/login')
      expect(PUBLIC_ROUTES_EN.ABOUT).toBe('/en/about')
      expect(PUBLIC_ROUTES_EN.AGENTS).toBe('/en/agents')
      expect(PUBLIC_ROUTES_EN.PRIVACY).toBe('/en/privacy')
      expect(PUBLIC_ROUTES_EN.TERMS).toBe('/en/terms')
      expect(PUBLIC_ROUTES_EN.HELP).toBe('/en/help')
    })
  })

  describe('AUTH_ROUTES', () => {
    it('should have correct authenticated routes', () => {
      expect(AUTH_ROUTES.APP).toBe('/pt/app')
      expect(AUTH_ROUTES.CHAT).toBe('/pt/app/chat')
      expect(AUTH_ROUTES.DASHBOARD).toBe('/pt/app/dashboard')
      expect(AUTH_ROUTES.INVESTIGATIONS).toBe('/pt/app/investigacoes')
      expect(AUTH_ROUTES.PROFILE).toBe('/pt/app/perfil')
      expect(AUTH_ROUTES.SETTINGS).toBe('/pt/app/configuracoes')
      expect(AUTH_ROUTES.NOTIFICATIONS).toBe('/pt/app/notificacoes')
    })

    it('should generate investigation detail route', () => {
      expect(AUTH_ROUTES.INVESTIGATION_DETAIL('123')).toBe('/pt/app/investigacoes/123')
      expect(AUTH_ROUTES.INVESTIGATION_DETAIL('abc-456')).toBe('/pt/app/investigacoes/abc-456')
    })
  })

  describe('AUTH_SYSTEM_ROUTES', () => {
    it('should have correct auth system routes', () => {
      expect(AUTH_SYSTEM_ROUTES.CALLBACK).toBe('/auth/callback')
      expect(AUTH_SYSTEM_ROUTES.SIGNUP).toBe('/pt/signup')
      expect(AUTH_SYSTEM_ROUTES.LOGOUT).toBe('/auth/logout')
    })
  })

  describe('API_ROUTES', () => {
    it('should have correct API routes', () => {
      expect(API_ROUTES.TELEMETRY).toBe('/api/telemetry')
      expect(API_ROUTES.HEALTH).toBe('/api/health')
    })
  })

  describe('ALLOWED_OAUTH_REDIRECTS', () => {
    it('should include main app routes', () => {
      expect(ALLOWED_OAUTH_REDIRECTS).toContain('/pt/app')
      expect(ALLOWED_OAUTH_REDIRECTS).toContain('/pt/app/chat')
      expect(ALLOWED_OAUTH_REDIRECTS).toContain('/pt/app/dashboard')
    })

    it('should include agora routes', () => {
      expect(ALLOWED_OAUTH_REDIRECTS).toContain('/pt/agora')
      expect(ALLOWED_OAUTH_REDIRECTS).toContain('/pt/agora/dashboard')
      expect(ALLOWED_OAUTH_REDIRECTS).toContain('/pt/agora/kids')
    })
  })
})

describe('Route Helpers', () => {
  describe('getPublicRoutes', () => {
    it('should return Portuguese routes for pt locale', () => {
      const routes = getPublicRoutes('pt')
      expect(routes.HOME).toBe('/pt')
      expect(routes.LOGIN).toBe('/pt/login')
    })

    it('should return English routes for en locale', () => {
      const routes = getPublicRoutes('en')
      expect(routes.HOME).toBe('/en')
      expect(routes.LOGIN).toBe('/en/login')
    })
  })

  describe('isAuthRoute', () => {
    it('should return true for authenticated routes', () => {
      expect(isAuthRoute('/pt/app/')).toBe(true)
      expect(isAuthRoute('/pt/app/chat')).toBe(true)
      expect(isAuthRoute('/pt/app/dashboard')).toBe(true)
    })

    it('should return false for public routes', () => {
      expect(isAuthRoute('/pt')).toBe(false)
      expect(isAuthRoute('/pt/login')).toBe(false)
      expect(isAuthRoute('/en/about')).toBe(false)
    })
  })

  describe('isPublicRoute', () => {
    it('should return true for public routes', () => {
      expect(isPublicRoute('/pt')).toBe(true)
      expect(isPublicRoute('/en')).toBe(true)
      expect(isPublicRoute('/pt/login')).toBe(true)
      expect(isPublicRoute('/en/login')).toBe(true)
      expect(isPublicRoute('/pt/about')).toBe(true)
      expect(isPublicRoute('/auth/callback')).toBe(true)
    })

    it('should return true for public routes with query params', () => {
      expect(isPublicRoute('/pt/login?redirect=/app')).toBe(true)
      expect(isPublicRoute('/auth/callback?code=123')).toBe(true)
    })

    it('should return false for authenticated routes', () => {
      expect(isPublicRoute('/pt/app')).toBe(false)
      expect(isPublicRoute('/pt/app/chat')).toBe(false)
    })
  })

  describe('getDefaultAuthRedirect', () => {
    it('should return default app route', () => {
      expect(getDefaultAuthRedirect()).toBe('/pt/app')
    })
  })

  describe('getLoginRoute', () => {
    it('should return Portuguese login for pt locale', () => {
      expect(getLoginRoute('pt')).toBe('/pt/login')
    })

    it('should return English login for en locale', () => {
      expect(getLoginRoute('en')).toBe('/en/login')
    })
  })
})

describe('OAuth Redirect Validation', () => {
  describe('isValidOAuthRedirect', () => {
    it('should return false for null', () => {
      expect(isValidOAuthRedirect(null)).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isValidOAuthRedirect('')).toBe(false)
    })

    it('should return false for paths not starting with /', () => {
      expect(isValidOAuthRedirect('pt/app')).toBe(false)
      expect(isValidOAuthRedirect('example.com/pt/app')).toBe(false)
    })

    it('should return false for protocol-relative URLs', () => {
      expect(isValidOAuthRedirect('//example.com/pt/app')).toBe(false)
      expect(isValidOAuthRedirect('//evil.com')).toBe(false)
    })

    it('should return false for paths with protocols', () => {
      expect(isValidOAuthRedirect('javascript:alert(1)')).toBe(false)
      expect(isValidOAuthRedirect('data:text/html,<script>alert(1)</script>')).toBe(false)
      expect(isValidOAuthRedirect('/pt/app?redirect=http://evil.com')).toBe(false)
    })

    it('should return true for allowed paths', () => {
      expect(isValidOAuthRedirect('/pt/app')).toBe(true)
      expect(isValidOAuthRedirect('/pt/app/chat')).toBe(true)
      expect(isValidOAuthRedirect('/pt/agora')).toBe(true)
      expect(isValidOAuthRedirect('/pt/agora/kids')).toBe(true)
    })

    it('should return true for subpaths of allowed paths', () => {
      expect(isValidOAuthRedirect('/pt/app/chat/session/123')).toBe(true)
      expect(isValidOAuthRedirect('/pt/agora/kids/videos')).toBe(true)
    })

    it('should return false for non-allowed paths', () => {
      expect(isValidOAuthRedirect('/evil/path')).toBe(false)
      expect(isValidOAuthRedirect('/admin')).toBe(false)
    })
  })

  describe('getSafeOAuthRedirect', () => {
    it('should return path if valid', () => {
      expect(getSafeOAuthRedirect('/pt/app')).toBe('/pt/app')
      expect(getSafeOAuthRedirect('/pt/agora/chat')).toBe('/pt/agora/chat')
    })

    it('should return default for invalid path', () => {
      expect(getSafeOAuthRedirect(null)).toBe('/pt/app')
      expect(getSafeOAuthRedirect('//evil.com')).toBe('/pt/app')
      expect(getSafeOAuthRedirect('/not/allowed')).toBe('/pt/app')
    })

    it('should allow custom default path', () => {
      expect(getSafeOAuthRedirect(null, '/pt/agora')).toBe('/pt/agora')
      expect(getSafeOAuthRedirect('//evil.com', '/custom')).toBe('/custom')
    })
  })
})
