/**
 * Unified Auth Service
 *
 * Single source of truth for all authentication in the application.
 * Handles Supabase OAuth, session management, and integrates with
 * NavigationSessionService for proper cleanup.
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @since 2025-12-09
 */

import { createClient } from '@/lib/supabase/client'
import { User as SupabaseUser, Provider, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { createLogger } from '@/lib/logger'
import { navigationSessionService } from './navigation-session.service'

const logger = createLogger('AuthService')

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

// ============================================
// Auth Service Class
// ============================================

class AuthService {
  private supabase = createClient()
  private listeners: Set<AuthEventCallback> = new Set()
  private currentUser: AuthUser | null = null
  private isInitialized = false

  constructor() {
    // Initialize auth state listener
    if (typeof window !== 'undefined') {
      this.initAuthListener()
    }
  }

  // ============================================
  // Initialization
  // ============================================

  private initAuthListener(): void {
    this.supabase.auth.onAuthStateChange((event, session) => {
      logger.debug('Auth state changed', { event, hasSession: !!session })

      const user = session?.user ? this.convertSupabaseUser(session.user) : null
      this.currentUser = user

      // Sync with NavigationSessionService
      if (event === 'SIGNED_IN' && user) {
        navigationSessionService.initAuthSession(user.id)
      } else if (event === 'SIGNED_OUT') {
        navigationSessionService.clearAllSessionStorage()
      }

      // Notify listeners
      this.notifyListeners(event, user)
    })

    this.isInitialized = true
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

    // Get avatar with fallback
    const avatar =
      metadata.avatar_url ||
      metadata.picture ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=16a34a&color=fff&size=128`

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
   * Get current authenticated user
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
        await navigationSessionService.initAuthSession(user.id)
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
   */
  async loginWithProvider(
    provider: Provider,
    redirectTo?: string
  ): Promise<{ error: string | null }> {
    try {
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        logger.error('OAuth login failed', { error: error.message, provider })
        return { error: error.message }
      }

      // OAuth will redirect, so we don't set user state here
      logger.info('OAuth initiated', { provider })
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
   */
  async logout(): Promise<void> {
    try {
      // Use NavigationSessionService for complete cleanup
      await navigationSessionService.logout()

      this.currentUser = null
      logger.info('Logout successful')
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
  // Event Subscription
  // ============================================

  /**
   * Subscribe to auth state changes
   */
  subscribe(callback: AuthEventCallback): () => void {
    this.listeners.add(callback)

    // Immediately notify with current state if we have a user
    if (this.currentUser) {
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
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
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
}

// ============================================
// Singleton Export
// ============================================

export const authService = new AuthService()
