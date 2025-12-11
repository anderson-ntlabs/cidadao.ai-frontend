/**
 * Navigation Session Service
 *
 * Centralized service for managing navigation state and session hierarchy.
 * Ensures consistent state management across the application with proper
 * cleanup on logout, page close, and system transitions.
 *
 * Session Hierarchy:
 * 1. Auth Session (Supabase) - Root level
 *    └── 2. Ágora Session (Study session)
 *        └── 3. Kids Session (Child mode)
 *
 * When a parent session ends, all child sessions must be cleaned up.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'

const logger = createLogger('NavigationSession')

// Session types in hierarchy order
export type SessionLevel = 'auth' | 'agora' | 'kids'

// Navigation targets
export type NavigationTarget =
  | 'landing' // /pt or /en
  | 'login' // /pt/agora/login
  | 'agora-dashboard' // /pt/agora
  | 'agora-chat' // /pt/agora/chat
  | 'kids-dashboard' // /pt/agora/kids
  | 'kids-videos' // /pt/agora/kids/videos

// LocalStorage keys managed by this service
const STORAGE_KEYS = {
  KIDS_STORE: 'agora-kids-store',
  CHAT_STORE: 'cidadao-chat-store',
  AGORA_PREFERENCES: 'agora-preferences',
  LAST_ROUTE: 'agora-last-route',
} as const

// Session state
interface SessionState {
  isAuthenticated: boolean
  isInAgora: boolean
  isInKidsMode: boolean
  userId: string | null
  lastActivity: number
}

class NavigationSessionService {
  private state: SessionState = {
    isAuthenticated: false,
    isInAgora: false,
    isInKidsMode: false,
    userId: null,
    lastActivity: Date.now(),
  }

  private listeners: Set<(state: SessionState) => void> = new Set()
  private cleanupHandlerAttached = false

  constructor() {
    // Attach cleanup handler on initialization (client-side only)
    if (typeof window !== 'undefined') {
      this.attachCleanupHandler()
    }
  }

  /**
   * Get current session state
   */
  getState(): Readonly<SessionState> {
    return { ...this.state }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: SessionState) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    const stateCopy = { ...this.state }
    this.listeners.forEach((listener) => listener(stateCopy))
  }

  /**
   * Update session state
   */
  private updateState(updates: Partial<SessionState>): void {
    this.state = { ...this.state, ...updates, lastActivity: Date.now() }
    this.notifyListeners()
    logger.debug('Session state updated', this.state)
  }

  // ============================================
  // Session Lifecycle Methods
  // ============================================

  /**
   * Initialize auth session (called after successful login)
   */
  async initAuthSession(userId: string): Promise<void> {
    logger.info('Initializing auth session', { userId })
    this.updateState({
      isAuthenticated: true,
      userId,
      isInAgora: false,
      isInKidsMode: false,
    })
  }

  /**
   * Enter Ágora mode (study platform)
   */
  enterAgora(): void {
    if (!this.state.isAuthenticated) {
      logger.warn('Cannot enter Ágora without authentication')
      return
    }
    logger.info('Entering Ágora mode')
    this.updateState({ isInAgora: true })
  }

  /**
   * Enter Kids mode (child-safe environment)
   */
  enterKidsMode(): void {
    if (!this.state.isAuthenticated || !this.state.isInAgora) {
      logger.warn('Cannot enter Kids mode without Ágora session')
      return
    }
    logger.info('Entering Kids mode')
    this.updateState({ isInKidsMode: true })
  }

  /**
   * Exit Kids mode (return to Ágora)
   */
  async exitKidsMode(): Promise<void> {
    if (!this.state.isInKidsMode) {
      logger.debug('Not in Kids mode, nothing to exit')
      return
    }

    logger.info('Exiting Kids mode')

    // Clean up kids-specific state
    await this.cleanupKidsSession()

    this.updateState({ isInKidsMode: false })
  }

  /**
   * Exit Ágora mode (return to main app)
   */
  async exitAgora(): Promise<void> {
    if (!this.state.isInAgora) {
      logger.debug('Not in Ágora, nothing to exit')
      return
    }

    logger.info('Exiting Ágora mode')

    // If in Kids mode, exit that first
    if (this.state.isInKidsMode) {
      await this.exitKidsMode()
    }

    // Clean up Ágora-specific state
    await this.cleanupAgoraSession()

    this.updateState({ isInAgora: false })
  }

  /**
   * Full logout - cleans all sessions
   */
  async logout(): Promise<void> {
    logger.info('Performing full logout')

    // Exit all modes in reverse hierarchy order
    if (this.state.isInKidsMode) {
      await this.exitKidsMode()
    }
    if (this.state.isInAgora) {
      await this.exitAgora()
    }

    // Clean up auth session
    await this.cleanupAuthSession()

    // Reset state
    this.updateState({
      isAuthenticated: false,
      userId: null,
      isInAgora: false,
      isInKidsMode: false,
    })

    logger.info('Logout complete')
  }

  // ============================================
  // Cleanup Methods
  // ============================================

  /**
   * Clean up Kids session data
   */
  private async cleanupKidsSession(): Promise<void> {
    logger.debug('Cleaning up Kids session')

    // End kids session via API if needed
    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon('/api/kids/end-session', JSON.stringify({ timestamp: Date.now() }))
      }
    } catch (error) {
      logger.warn('Failed to send kids session end beacon', { error })
    }

    // Clear kids store from localStorage
    this.clearStorage(STORAGE_KEYS.KIDS_STORE)

    // Reset kids store in memory (if available)
    try {
      const { useKidsStore } = await import('@/store/kids-store')
      useKidsStore.getState().reset()
    } catch (error) {
      logger.debug('Could not reset kids store', { error })
    }
  }

  /**
   * Clean up Ágora session data
   */
  private async cleanupAgoraSession(): Promise<void> {
    logger.debug('Cleaning up Ágora session')

    // End Ágora session via API if needed
    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon('/api/agora/end-session', JSON.stringify({ timestamp: Date.now() }))
      }
    } catch (error) {
      logger.warn('Failed to send Ágora session end beacon', { error })
    }

    // Clear Ágora preferences if needed (keep some for UX)
    // this.clearStorage(STORAGE_KEYS.AGORA_PREFERENCES)
  }

  /**
   * Clean up auth session data
   */
  private async cleanupAuthSession(): Promise<void> {
    logger.debug('Cleaning up auth session')

    // Sign out from Supabase
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (error) {
      logger.warn('Failed to sign out from Supabase', { error })
    }

    // Clear all session-related storage
    this.clearStorage(STORAGE_KEYS.KIDS_STORE)
    this.clearStorage(STORAGE_KEYS.LAST_ROUTE)

    // Don't clear chat store - user might want history
    // Don't clear preferences - better UX to remember
  }

  /**
   * Clear a specific storage key
   */
  private clearStorage(key: string): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(key)
      logger.debug('Cleared storage', { key })
    } catch (error) {
      logger.warn('Failed to clear storage', { key, error })
    }
  }

  /**
   * Clear ALL session-related storage (nuclear option)
   */
  clearAllSessionStorage(): void {
    logger.info('Clearing all session storage')

    Object.values(STORAGE_KEYS).forEach((key) => {
      this.clearStorage(key)
    })
  }

  // ============================================
  // Navigation Guards
  // ============================================

  /**
   * Check if user can navigate to a target
   */
  canNavigateTo(target: NavigationTarget): { allowed: boolean; reason?: string } {
    switch (target) {
      case 'landing':
      case 'login':
        // Always allowed
        return { allowed: true }

      case 'agora-dashboard':
      case 'agora-chat':
        if (!this.state.isAuthenticated) {
          return { allowed: false, reason: 'Authentication required' }
        }
        return { allowed: true }

      case 'kids-dashboard':
      case 'kids-videos':
        if (!this.state.isAuthenticated) {
          return { allowed: false, reason: 'Authentication required' }
        }
        if (!this.state.isInKidsMode) {
          return { allowed: false, reason: 'Kids mode not active' }
        }
        return { allowed: true }

      default:
        return { allowed: true }
    }
  }

  /**
   * Get redirect path based on current state
   */
  getRedirectPath(): string {
    if (!this.state.isAuthenticated) {
      return '/pt/agora/login'
    }
    if (this.state.isInKidsMode) {
      return '/pt/agora/kids'
    }
    if (this.state.isInAgora) {
      return '/pt/agora'
    }
    return '/pt'
  }

  // ============================================
  // Browser Event Handlers
  // ============================================

  /**
   * Attach cleanup handler for page unload
   */
  private attachCleanupHandler(): void {
    if (this.cleanupHandlerAttached) return

    const sendCleanupBeacon = () => {
      // Use sendBeacon for reliable cleanup - works even when page is closing
      if (this.state.isInKidsMode) {
        try {
          navigator.sendBeacon('/api/kids/end-session', JSON.stringify({ timestamp: Date.now() }))
        } catch {
          // Ignore errors during unload
        }
      }

      if (this.state.isInAgora) {
        try {
          navigator.sendBeacon('/api/agora/end-session', JSON.stringify({ timestamp: Date.now() }))
        } catch {
          // Ignore errors during unload
        }
      }
    }

    const handleBeforeUnload = () => {
      logger.debug('Page unloading, sending cleanup beacons')
      sendCleanupBeacon()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Page is being hidden (tab close, browser close, navigate away)
        // Send cleanup beacon immediately - this is our best chance
        logger.debug('Page hidden, sending cleanup beacons')
        sendCleanupBeacon()
        this.updateState({ lastActivity: Date.now() })
      }
    }

    // Handle page close/refresh
    window.addEventListener('beforeunload', handleBeforeUnload)
    // Handle tab close (more reliable than beforeunload on mobile)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    // Handle page navigation away
    window.addEventListener('pagehide', handleBeforeUnload)

    this.cleanupHandlerAttached = true
    logger.debug('Cleanup handlers attached')
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Sync state with external stores
   */
  async syncWithStores(): Promise<void> {
    logger.debug('Syncing with external stores')

    // Check Supabase auth state
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user && !this.state.isAuthenticated) {
        this.updateState({ isAuthenticated: true, userId: user.id })
      } else if (!user && this.state.isAuthenticated) {
        await this.logout()
      }
    } catch (error) {
      logger.warn('Failed to sync with Supabase', { error })
    }

    // Check kids store state
    try {
      const kidsStoreData = localStorage.getItem(STORAGE_KEYS.KIDS_STORE)
      if (kidsStoreData) {
        const parsed = JSON.parse(kidsStoreData)
        if (parsed?.state?.isKidsMode && !this.state.isInKidsMode) {
          // Kids mode was active but our state doesn't reflect it
          // This could be a page refresh scenario
          if (this.state.isAuthenticated) {
            this.updateState({ isInAgora: true, isInKidsMode: true })
          }
        }
      }
    } catch (error) {
      logger.debug('Failed to sync with kids store', { error })
    }
  }

  /**
   * Get session duration in minutes
   */
  getSessionDuration(): number {
    const now = Date.now()
    const start = this.state.lastActivity
    return Math.floor((now - start) / 60000)
  }

  /**
   * Check if session is stale (no activity for X minutes)
   */
  isSessionStale(maxInactiveMinutes: number = 30): boolean {
    return this.getSessionDuration() > maxInactiveMinutes
  }
}

// Singleton instance
export const navigationSessionService = new NavigationSessionService()

// Export types
export type { SessionState }
