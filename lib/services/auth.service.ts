/**
 * Unified Auth Service
 *
 * Single source of truth for all authentication in the application.
 * Handles Supabase OAuth, session management, and integrates with
 * NavigationSessionService for proper cleanup.
 *
 * Key improvements (2025-12-10):
 * - Added waitForInit() for async initialization
 * - Added initPromise to prevent race conditions
 * - Better error handling and logging
 * - Cache user to avoid duplicate queries
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @since 2025-12-09
 * @updated 2025-12-10
 */

import { createClient } from '@/lib/supabase/client'
import { User as SupabaseUser, Provider, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { createLogger } from '@/lib/logger'

const logger = createLogger('AuthService')

// Lazy import to avoid circular dependency
// navigation-session.service imports supabase/client which may import auth.service
let _navigationSessionService:
  | typeof import('./navigation-session.service').navigationSessionService
  | null = null

async function getNavigationSessionService() {
  if (!_navigationSessionService) {
    const module = await import('./navigation-session.service')
    _navigationSessionService = module.navigationSessionService
  }
  return _navigationSessionService
}

// ============================================
// Types
// ============================================

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar: string
  role: string
  githubUsername?: string
  provider?: string
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export type AuthEventCallback = (event: AuthChangeEvent, user: AuthUser | null) => void

// URLs that should never be saved as redirect targets
const INVALID_REDIRECT_PATHS = [
  '/',
  '/pt',
  '/en',
  '/pt/login',
  '/en/login',
  '/pt/agora/login',
  '/auth/callback',
]

// ============================================
// Auth Service Class
// ============================================

class AuthService {
  private supabase = createClient()
  private listeners: Set<AuthEventCallback> = new Set()
  private currentUser: AuthUser | null = null
  private isInitialized = false
  private initPromise: Promise<AuthUser | null> | null = null
  private initResolvers: Array<(user: AuthUser | null) => void> = []

  constructor() {
    // Initialize auth state listener only on client
    if (typeof window !== 'undefined') {
      this.initPromise = this.initialize()
    }
  }

  // ============================================
  // Initialization
  // ============================================

  /**
   * Initialize the auth service and check for existing session
   * Returns a promise that resolves when initialization is complete
   */
  private async initialize(): Promise<AuthUser | null> {
    try {
      logger.debug('Initializing auth service...')

      // Set up auth state change listener FIRST
      this.supabase.auth.onAuthStateChange((event, session) => {
        logger.debug('Auth state changed', { event, hasSession: !!session })

        const user = session?.user ? this.convertSupabaseUser(session.user) : null
        const previousUser = this.currentUser
        this.currentUser = user

        // Sync with NavigationSessionService (async to avoid circular dependency)
        if (event === 'SIGNED_IN' && user) {
          getNavigationSessionService().then((navService) => navService.initAuthSession(user.id))
        } else if (event === 'SIGNED_OUT') {
          getNavigationSessionService().then((navService) => navService.clearAllSessionStorage())
        }

        // Mark as initialized on first auth state change
        if (!this.isInitialized) {
          this.isInitialized = true
          // Resolve any pending waitForInit calls
          this.initResolvers.forEach((resolve) => resolve(user))
          this.initResolvers = []
        }

        // Notify listeners (skip duplicate SIGNED_IN if user didn't change)
        if (event !== 'SIGNED_IN' || previousUser?.id !== user?.id) {
          this.notifyListeners(event, user)
        }
      })

      // Check for existing session
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser()

      if (error) {
        logger.debug('No existing session', { error: error.message })
      }

      if (user) {
        this.currentUser = this.convertSupabaseUser(user)
        logger.info('Existing session found', { userId: this.currentUser.id })
      }

      this.isInitialized = true
      return this.currentUser
    } catch (error) {
      logger.error('Auth initialization failed', { error })
      this.isInitialized = true
      return null
    }
  }

  /**
   * Wait for the auth service to be fully initialized
   * Use this when you need to know the auth state before proceeding
   * Has a timeout to prevent indefinite waiting
   */
  async waitForInit(): Promise<AuthUser | null> {
    // If already initialized, return current user
    if (this.isInitialized) {
      return this.currentUser
    }

    // If init promise exists, wait for it with timeout
    if (this.initPromise) {
      try {
        return await Promise.race([
          this.initPromise,
          new Promise<AuthUser | null>((resolve) => {
            setTimeout(() => {
              logger.warn('waitForInit timeout, checking session directly')
              // On timeout, try to get session directly
              this.getUser().then((user) => {
                this.isInitialized = true
                this.currentUser = user
                resolve(user)
              })
            }, 3000) // 3 second timeout
          }),
        ])
      } catch {
        return this.currentUser
      }
    }

    // Create a new promise with timeout
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        logger.warn('waitForInit resolver timeout')
        this.isInitialized = true
        resolve(this.currentUser)
      }, 3000)

      this.initResolvers.push((user) => {
        clearTimeout(timeoutId)
        resolve(user)
      })
    })
  }

  // ============================================
  // User Conversion
  // ============================================

  private convertSupabaseUser(supabaseUser: SupabaseUser): AuthUser {
    const metadata = supabaseUser.user_metadata || {}

    // Get name from different possible fields
    const name =
      metadata.full_name ||
      metadata.name ||
      metadata.user_name ||
      metadata.preferred_username ||
      supabaseUser.email?.split('@')[0] ||
      'User'

    // Get avatar with fallback - check multiple sources
    let avatar = metadata.avatar_url || metadata.picture || metadata.avatar || null

    // Try identities array for raw OAuth data
    if (!avatar && supabaseUser.identities && supabaseUser.identities.length > 0) {
      const identity = supabaseUser.identities[0]
      const identityData = identity.identity_data || {}
      avatar = identityData.avatar_url || identityData.picture || identityData.avatar || null
    }

    // Fallback to UI Avatars
    if (!avatar) {
      avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=16a34a&color=fff&size=128`
    }

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name,
      avatar,
      role: supabaseUser.app_metadata?.role || 'user',
      githubUsername: metadata.user_name || metadata.preferred_username,
      provider: supabaseUser.app_metadata?.provider,
    }
  }

  // ============================================
  // Public Methods - Authentication
  // ============================================

  /**
   * Get current authenticated user (async, validates with server)
   */
  async getUser(): Promise<AuthUser | null> {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser()

      if (error) {
        logger.debug('No authenticated user', { error: error.message })
        return null
      }

      if (user) {
        this.currentUser = this.convertSupabaseUser(user)
        return this.currentUser
      }

      return null
    } catch (error) {
      logger.error('Failed to get user', { error })
      return null
    }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<Session | null> {
    try {
      const {
        data: { session },
        error,
      } = await this.supabase.auth.getSession()

      if (error) {
        logger.error('Failed to get session', { error })
        return null
      }

      return session
    } catch (error) {
      logger.error('Session retrieval error', { error })
      return null
    }
  }

  /**
   * Login with email and password
   */
  async loginWithPassword(
    email: string,
    password: string
  ): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        logger.error('Login failed', { error: error.message })
        return { user: null, error: error.message }
      }

      if (data.user) {
        const user = this.convertSupabaseUser(data.user)
        this.currentUser = user
        const navService = await getNavigationSessionService()
        await navService.initAuthSession(user.id)
        logger.info('Login successful', { userId: user.id })
        return { user, error: null }
      }

      return { user: null, error: 'Login failed' }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Login error', { error })
      return { user: null, error: message }
    }
  }

  /**
   * Login with OAuth provider (Google, GitHub)
   * @param provider - OAuth provider
   * @param redirectTo - Full redirect URL after OAuth (defaults to /auth/callback)
   * @param nextPath - Path to redirect to after auth callback (e.g., /pt/agora)
   */
  async loginWithProvider(
    provider: Provider,
    redirectTo?: string,
    nextPath?: string
  ): Promise<{ error: string | null }> {
    try {
      // Build redirect URL with next param if provided
      let finalRedirectTo = redirectTo || `${window.location.origin}/auth/callback`

      if (nextPath && !finalRedirectTo.includes('next=')) {
        const url = new URL(finalRedirectTo)
        url.searchParams.set('next', nextPath)
        finalRedirectTo = url.toString()
      }

      const { error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: finalRedirectTo,
          scopes: provider === 'github' ? 'read:user user:email' : undefined,
        },
      })

      if (error) {
        logger.error('OAuth login failed', { error: error.message, provider })
        return { error: error.message }
      }

      logger.info('OAuth initiated', { provider, redirectTo: finalRedirectTo })
      return { error: null }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      logger.error('OAuth error', { error, provider })
      return { error: message }
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(
    email: string,
    password: string,
    metadata?: { name?: string }
  ): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        logger.error('Sign up failed', { error: error.message })
        return { user: null, error: error.message }
      }

      if (data.user) {
        const user = this.convertSupabaseUser(data.user)
        logger.info('Sign up successful', { userId: user.id })
        return { user, error: null }
      }

      return { user: null, error: 'Sign up failed' }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Sign up error', { error })
      return { user: null, error: message }
    }
  }

  /**
   * Logout - clears all sessions and state
   * @param redirectTo - Optional path to redirect after logout
   */
  async logout(redirectTo?: string): Promise<void> {
    try {
      // Use NavigationSessionService for complete cleanup
      const navService = await getNavigationSessionService()
      await navService.logout()

      this.currentUser = null
      logger.info('Logout successful')

      // Redirect if specified
      if (redirectTo && typeof window !== 'undefined') {
        window.location.href = redirectTo
      }
    } catch (error) {
      logger.error('Logout error', { error })
      // Even on error, clear local state
      this.currentUser = null
    }
  }

  /**
   * Refresh the current session
   */
  async refreshSession(): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession()

      if (error) {
        logger.error('Session refresh failed', { error: error.message })
        return { user: null, error: error.message }
      }

      if (data.user) {
        const user = this.convertSupabaseUser(data.user)
        this.currentUser = user
        return { user, error: null }
      }

      return { user: null, error: 'Session refresh failed' }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Session refresh error', { error })
      return { user: null, error: message }
    }
  }

  // ============================================
  // Redirect URL Management
  // ============================================

  /**
   * Save a URL to redirect to after login
   * Validates that the URL is not a landing/login page
   */
  saveRedirectUrl(url: string): void {
    if (typeof window === 'undefined') return

    // Don't save invalid paths
    if (INVALID_REDIRECT_PATHS.some((path) => url === path || url.startsWith(path + '?'))) {
      logger.debug('Ignoring invalid redirect URL', { url })
      return
    }

    localStorage.setItem('redirectAfterLogin', url)
    logger.debug('Saved redirect URL', { url })
  }

  /**
   * Get and clear the saved redirect URL
   */
  getAndClearRedirectUrl(): string | null {
    if (typeof window === 'undefined') return null

    const url = localStorage.getItem('redirectAfterLogin')
    if (url) {
      localStorage.removeItem('redirectAfterLogin')

      // Validate the URL before returning
      if (INVALID_REDIRECT_PATHS.some((path) => url === path || url.startsWith(path + '?'))) {
        logger.debug('Cleared invalid redirect URL', { url })
        return null
      }

      logger.debug('Retrieved redirect URL', { url })
      return url
    }

    return null
  }

  /**
   * Get the appropriate default redirect based on origin
   */
  getDefaultRedirect(origin?: string): string {
    // If coming from Agora, go back to Agora
    if (origin?.includes('/agora')) {
      return '/pt/agora'
    }

    // Default to app
    return '/pt/app'
  }

  // ============================================
  // Event Subscription
  // ============================================

  /**
   * Subscribe to auth state changes
   * Returns unsubscribe function
   */
  subscribe(callback: AuthEventCallback): () => void {
    this.listeners.add(callback)

    // Immediately notify with current state if initialized
    if (this.isInitialized && this.currentUser) {
      callback('SIGNED_IN', this.currentUser)
    }

    return () => {
      this.listeners.delete(callback)
    }
  }

  private notifyListeners(event: AuthChangeEvent, user: AuthUser | null): void {
    this.listeners.forEach((callback) => {
      try {
        callback(event, user)
      } catch (error) {
        logger.error('Error in auth listener', { error })
      }
    })
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Check if user is currently authenticated (sync)
   */
  isAuthenticatedSync(): boolean {
    return this.currentUser !== null
  }

  /**
   * Get cached current user (sync, may be stale)
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUser
  }

  /**
   * Check if service is initialized
   */
  isReady(): boolean {
    return this.isInitialized
  }

  /**
   * Get Supabase client (for advanced use cases)
   */
  getSupabaseClient() {
    return this.supabase
  }
}

// ============================================
// Singleton Export
// ============================================

export const authService = new AuthService()
