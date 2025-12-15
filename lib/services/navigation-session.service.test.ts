/**
 * Navigation Session Service Tests
 *
 * Tests for centralized session management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Hoisted mocks
const { mockSignOut, mockGetUser } = vi.hoisted(() => ({
  mockSignOut: vi.fn().mockResolvedValue({}),
  mockGetUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: mockSignOut,
      getUser: mockGetUser,
    },
  }),
}))

// Mock kids store
vi.mock('@/store/kids-store', () => ({
  useKidsStore: {
    getState: () => ({
      reset: vi.fn(),
    }),
  },
}))

// Import after mocks
import {
  navigationSessionService,
  type SessionLevel,
  type NavigationTarget,
} from './navigation-session.service'

describe('NavigationSessionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset service state by calling logout
    // Note: This uses internal state, in production you'd have a reset method
    navigationSessionService['state'] = {
      isAuthenticated: false,
      isInAgora: false,
      isInKidsMode: false,
      userId: null,
      lastActivity: Date.now(),
    }

    // Note: localStorage is mocked globally in vitest.setup.ts
    localStorage.clear()

    // Mock navigator.sendBeacon
    vi.stubGlobal('navigator', {
      sendBeacon: vi.fn().mockReturnValue(true),
    })
  })

  afterEach(() => {
    // Note: Don't use vi.unstubAllGlobals() as it removes global mocks from vitest.setup.ts
    vi.resetAllMocks()
  })

  describe('getState', () => {
    it('should return current session state', () => {
      const state = navigationSessionService.getState()

      expect(state).toHaveProperty('isAuthenticated')
      expect(state).toHaveProperty('isInAgora')
      expect(state).toHaveProperty('isInKidsMode')
      expect(state).toHaveProperty('userId')
      expect(state).toHaveProperty('lastActivity')
    })

    it('should return a copy of state (not reference)', () => {
      const state1 = navigationSessionService.getState()
      const state2 = navigationSessionService.getState()

      expect(state1).not.toBe(state2)
      expect(state1).toEqual(state2)
    })
  })

  describe('subscribe', () => {
    it('should add listener and return unsubscribe function', () => {
      const listener = vi.fn()

      const unsubscribe = navigationSessionService.subscribe(listener)

      expect(typeof unsubscribe).toBe('function')
    })

    it('should notify listeners on state change', async () => {
      const listener = vi.fn()
      navigationSessionService.subscribe(listener)

      await navigationSessionService.initAuthSession('user-123')

      expect(listener).toHaveBeenCalled()
    })

    it('should stop notifying after unsubscribe', async () => {
      const listener = vi.fn()
      const unsubscribe = navigationSessionService.subscribe(listener)

      unsubscribe()

      await navigationSessionService.initAuthSession('user-456')

      // Listener should not be called after unsubscribe
      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('initAuthSession', () => {
    it('should initialize auth session with userId', async () => {
      await navigationSessionService.initAuthSession('user-789')

      const state = navigationSessionService.getState()
      expect(state.isAuthenticated).toBe(true)
      expect(state.userId).toBe('user-789')
      expect(state.isInAgora).toBe(false)
      expect(state.isInKidsMode).toBe(false)
    })
  })

  describe('enterAgora', () => {
    it('should not enter Agora without authentication', () => {
      navigationSessionService.enterAgora()

      const state = navigationSessionService.getState()
      expect(state.isInAgora).toBe(false)
    })

    it('should enter Agora when authenticated', async () => {
      await navigationSessionService.initAuthSession('user-123')

      navigationSessionService.enterAgora()

      const state = navigationSessionService.getState()
      expect(state.isInAgora).toBe(true)
    })
  })

  describe('enterKidsMode', () => {
    it('should not enter Kids mode without authentication', () => {
      navigationSessionService.enterKidsMode()

      const state = navigationSessionService.getState()
      expect(state.isInKidsMode).toBe(false)
    })

    it('should not enter Kids mode without Agora session', async () => {
      await navigationSessionService.initAuthSession('user-123')

      navigationSessionService.enterKidsMode()

      const state = navigationSessionService.getState()
      expect(state.isInKidsMode).toBe(false)
    })

    it('should enter Kids mode when in Agora', async () => {
      await navigationSessionService.initAuthSession('user-123')
      navigationSessionService.enterAgora()

      navigationSessionService.enterKidsMode()

      const state = navigationSessionService.getState()
      expect(state.isInKidsMode).toBe(true)
    })
  })

  describe('exitKidsMode', () => {
    it('should do nothing if not in Kids mode', async () => {
      const initialState = navigationSessionService.getState()

      await navigationSessionService.exitKidsMode()

      const finalState = navigationSessionService.getState()
      expect(finalState.isInKidsMode).toBe(initialState.isInKidsMode)
    })

    it('should exit Kids mode and stay in Agora', async () => {
      await navigationSessionService.initAuthSession('user-123')
      navigationSessionService.enterAgora()
      navigationSessionService.enterKidsMode()

      await navigationSessionService.exitKidsMode()

      const state = navigationSessionService.getState()
      expect(state.isInKidsMode).toBe(false)
      expect(state.isInAgora).toBe(true)
    })

    it('should send beacon when exiting Kids mode', async () => {
      await navigationSessionService.initAuthSession('user-123')
      navigationSessionService.enterAgora()
      navigationSessionService.enterKidsMode()

      await navigationSessionService.exitKidsMode()

      expect(navigator.sendBeacon).toHaveBeenCalledWith('/api/kids/end-session', expect.any(String))
    })
  })

  describe('exitAgora', () => {
    it('should do nothing if not in Agora', async () => {
      await navigationSessionService.exitAgora()

      const state = navigationSessionService.getState()
      expect(state.isInAgora).toBe(false)
    })

    it('should exit Agora and clear isInAgora', async () => {
      await navigationSessionService.initAuthSession('user-123')
      navigationSessionService.enterAgora()

      await navigationSessionService.exitAgora()

      const state = navigationSessionService.getState()
      expect(state.isInAgora).toBe(false)
      expect(state.isAuthenticated).toBe(true)
    })

    it('should also exit Kids mode if active', async () => {
      await navigationSessionService.initAuthSession('user-123')
      navigationSessionService.enterAgora()
      navigationSessionService.enterKidsMode()

      await navigationSessionService.exitAgora()

      const state = navigationSessionService.getState()
      expect(state.isInKidsMode).toBe(false)
      expect(state.isInAgora).toBe(false)
    })
  })

  describe('logout', () => {
    it('should clear all session state', async () => {
      await navigationSessionService.initAuthSession('user-123')
      navigationSessionService.enterAgora()
      navigationSessionService.enterKidsMode()

      await navigationSessionService.logout()

      const state = navigationSessionService.getState()
      expect(state.isAuthenticated).toBe(false)
      expect(state.userId).toBeNull()
      expect(state.isInAgora).toBe(false)
      expect(state.isInKidsMode).toBe(false)
    })

    it('should call Supabase signOut', async () => {
      await navigationSessionService.initAuthSession('user-123')

      await navigationSessionService.logout()

      expect(mockSignOut).toHaveBeenCalled()
    })

    it('should clear localStorage', async () => {
      localStorage.setItem('agora-kids-store', 'test')
      localStorage.setItem('agora-last-route', '/test')

      await navigationSessionService.initAuthSession('user-123')
      await navigationSessionService.logout()

      expect(localStorage.getItem('agora-kids-store')).toBeNull()
      expect(localStorage.getItem('agora-last-route')).toBeNull()
    })
  })

  describe('clearAllSessionStorage', () => {
    it('should clear all storage keys', () => {
      localStorage.setItem('agora-kids-store', 'test1')
      localStorage.setItem('cidadao-chat-store', 'test2')
      localStorage.setItem('agora-preferences', 'test3')
      localStorage.setItem('agora-last-route', 'test4')

      navigationSessionService.clearAllSessionStorage()

      expect(localStorage.getItem('agora-kids-store')).toBeNull()
      expect(localStorage.getItem('cidadao-chat-store')).toBeNull()
      expect(localStorage.getItem('agora-preferences')).toBeNull()
      expect(localStorage.getItem('agora-last-route')).toBeNull()
    })
  })

  describe('canNavigateTo', () => {
    it('should always allow navigation to landing', () => {
      const result = navigationSessionService.canNavigateTo('landing')
      expect(result.allowed).toBe(true)
    })

    it('should always allow navigation to login', () => {
      const result = navigationSessionService.canNavigateTo('login')
      expect(result.allowed).toBe(true)
    })

    it('should require auth for agora-dashboard', () => {
      const result = navigationSessionService.canNavigateTo('agora-dashboard')
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('Authentication required')
    })

    it('should allow agora-dashboard when authenticated', async () => {
      await navigationSessionService.initAuthSession('user-123')

      const result = navigationSessionService.canNavigateTo('agora-dashboard')
      expect(result.allowed).toBe(true)
    })

    it('should require kids mode for kids-dashboard', async () => {
      await navigationSessionService.initAuthSession('user-123')
      navigationSessionService.enterAgora()

      const result = navigationSessionService.canNavigateTo('kids-dashboard')
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('Kids mode not active')
    })

    it('should allow kids-dashboard when in kids mode', async () => {
      await navigationSessionService.initAuthSession('user-123')
      navigationSessionService.enterAgora()
      navigationSessionService.enterKidsMode()

      const result = navigationSessionService.canNavigateTo('kids-dashboard')
      expect(result.allowed).toBe(true)
    })

    it('should allow unknown targets', () => {
      const result = navigationSessionService.canNavigateTo('unknown' as NavigationTarget)
      expect(result.allowed).toBe(true)
    })
  })

  describe('getRedirectPath', () => {
    it('should return login path when not authenticated', () => {
      const path = navigationSessionService.getRedirectPath()
      expect(path).toBe('/pt/agora/login')
    })

    it('should return kids path when in kids mode', async () => {
      await navigationSessionService.initAuthSession('user-123')
      navigationSessionService.enterAgora()
      navigationSessionService.enterKidsMode()

      const path = navigationSessionService.getRedirectPath()
      expect(path).toBe('/pt/agora/kids')
    })

    it('should return agora path when in agora', async () => {
      await navigationSessionService.initAuthSession('user-123')
      navigationSessionService.enterAgora()

      const path = navigationSessionService.getRedirectPath()
      expect(path).toBe('/pt/agora')
    })

    it('should return home path when authenticated but not in agora', async () => {
      await navigationSessionService.initAuthSession('user-123')

      const path = navigationSessionService.getRedirectPath()
      expect(path).toBe('/pt')
    })
  })

  describe('syncWithStores', () => {
    it('should update state when Supabase has user', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'supabase-user-123' } },
        error: null,
      })

      await navigationSessionService.syncWithStores()

      const state = navigationSessionService.getState()
      expect(state.isAuthenticated).toBe(true)
      expect(state.userId).toBe('supabase-user-123')
    })

    it('should logout when Supabase has no user but state is authenticated', async () => {
      // Set up authenticated state first
      await navigationSessionService.initAuthSession('user-123')

      // Now mock no user
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      await navigationSessionService.syncWithStores()

      const state = navigationSessionService.getState()
      expect(state.isAuthenticated).toBe(false)
    })

    it('should handle Supabase errors gracefully', async () => {
      mockGetUser.mockRejectedValue(new Error('Network error'))

      // Should not throw
      await expect(navigationSessionService.syncWithStores()).resolves.not.toThrow()
    })

    it('should sync kids mode from localStorage', async () => {
      await navigationSessionService.initAuthSession('user-123')

      localStorage.setItem('agora-kids-store', JSON.stringify({ state: { isKidsMode: true } }))

      await navigationSessionService.syncWithStores()

      const state = navigationSessionService.getState()
      expect(state.isInAgora).toBe(true)
      expect(state.isInKidsMode).toBe(true)
    })
  })

  describe('getSessionDuration', () => {
    it('should return duration in minutes', async () => {
      // Set lastActivity to 5 minutes ago
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
      navigationSessionService['state'].lastActivity = fiveMinutesAgo

      const duration = navigationSessionService.getSessionDuration()

      expect(duration).toBeGreaterThanOrEqual(4)
      expect(duration).toBeLessThanOrEqual(6)
    })
  })

  describe('isSessionStale', () => {
    it('should return false for fresh session', () => {
      const isStale = navigationSessionService.isSessionStale(30)
      expect(isStale).toBe(false)
    })

    it('should return true for stale session', () => {
      // Set lastActivity to 35 minutes ago
      const thirtyFiveMinutesAgo = Date.now() - 35 * 60 * 1000
      navigationSessionService['state'].lastActivity = thirtyFiveMinutesAgo

      const isStale = navigationSessionService.isSessionStale(30)
      expect(isStale).toBe(true)
    })

    it('should use default 30 minutes timeout', () => {
      // Set lastActivity to 31 minutes ago
      const thirtyOneMinutesAgo = Date.now() - 31 * 60 * 1000
      navigationSessionService['state'].lastActivity = thirtyOneMinutesAgo

      const isStale = navigationSessionService.isSessionStale()
      expect(isStale).toBe(true)
    })
  })
})
