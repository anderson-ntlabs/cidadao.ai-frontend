/**
 * Route Constants
 *
 * Centralized route management for the application.
 * Use these constants throughout the app to ensure consistency
 * and make route changes easier to manage.
 *
 * Route Structure:
 * - Public routes (bilingual): /pt/* and /en/*
 * - Authenticated routes (Portuguese only): /pt/app/*
 * - Auth routes: /auth/*
 *
 * Note: The authenticated system (/pt/app/*) is only available in Portuguese.
 * English users are redirected to Portuguese system after login.
 */

// ============================================================================
// Public Routes (Portuguese)
// ============================================================================
export const PUBLIC_ROUTES_PT = {
  HOME: '/pt',
  LOGIN: '/pt/login',
  ABOUT: '/pt/about',
  AGENTS: '/pt/agents',
  PRIVACY: '/pt/privacy',
  TERMS: '/pt/terms',
  HELP: '/pt/help',
} as const

// ============================================================================
// Public Routes (English)
// ============================================================================
export const PUBLIC_ROUTES_EN = {
  HOME: '/en',
  LOGIN: '/en/login',
  ABOUT: '/en/about',
  AGENTS: '/en/agents',
  PRIVACY: '/en/privacy',
  TERMS: '/en/terms',
  HELP: '/en/help',
} as const

// ============================================================================
// Authenticated Routes (Portuguese only - system is not bilingual after login)
// ============================================================================
export const AUTH_ROUTES = {
  // Main authenticated pages
  APP: '/pt/app',
  CHAT: '/pt/app/chat',
  DASHBOARD: '/pt/app/dashboard',
  INVESTIGATIONS: '/pt/app/investigacoes',
  PROFILE: '/pt/app/perfil',
  SETTINGS: '/pt/app/configuracoes',
  NOTIFICATIONS: '/pt/app/notificacoes',

  // Investigation details (use with ID parameter)
  INVESTIGATION_DETAIL: (id: string) => `/pt/app/investigacoes/${id}`,
} as const

// ============================================================================
// Auth System Routes
// ============================================================================
export const AUTH_SYSTEM_ROUTES = {
  CALLBACK: '/auth/callback',
  SIGNUP: '/pt/signup', // Currently only Portuguese
  LOGOUT: '/auth/logout',
} as const

// ============================================================================
// API Routes
// ============================================================================
export const API_ROUTES = {
  TELEMETRY: '/api/telemetry',
  HEALTH: '/api/health',
} as const

// ============================================================================
// Route Helpers
// ============================================================================

/**
 * Get public routes for specific locale
 */
export function getPublicRoutes(locale: 'pt' | 'en') {
  return locale === 'pt' ? PUBLIC_ROUTES_PT : PUBLIC_ROUTES_EN
}

/**
 * Check if route requires authentication
 * Note: Authenticated routes only exist in Portuguese
 */
export function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith('/pt/app/')
}

/**
 * Check if route is public
 */
export function isPublicRoute(pathname: string): boolean {
  const publicPaths = [
    '/pt', '/en',
    '/pt/login', '/en/login',
    '/pt/about', '/en/about',
    '/pt/agents', '/en/agents',
    '/pt/privacy', '/en/privacy',
    '/pt/terms', '/en/terms',
    '/pt/help', '/en/help',
    '/auth/callback'
  ]

  return publicPaths.some(path => pathname === path || pathname.startsWith(path + '?'))
}

/**
 * Get default auth redirect
 * Note: Always returns Portuguese /pt/app (system is not bilingual after login)
 */
export function getDefaultAuthRedirect(): string {
  return AUTH_ROUTES.APP
}

/**
 * Get login route for locale
 */
export function getLoginRoute(locale: 'pt' | 'en'): string {
  return locale === 'pt' ? PUBLIC_ROUTES_PT.LOGIN : PUBLIC_ROUTES_EN.LOGIN
}

// ============================================================================
// Type Exports
// ============================================================================

export type PublicRoutePT = typeof PUBLIC_ROUTES_PT[keyof typeof PUBLIC_ROUTES_PT]
export type PublicRouteEN = typeof PUBLIC_ROUTES_EN[keyof typeof PUBLIC_ROUTES_EN]
export type AuthRoute = typeof AUTH_ROUTES[keyof typeof AUTH_ROUTES]
export type Locale = 'pt' | 'en'
