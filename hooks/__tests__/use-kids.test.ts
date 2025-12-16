/**
 * Tests for useKids, useRequireKidsMode, and useParentalAccess hooks
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useKids, useRequireKidsMode, useParentalAccess } from '../use-kids'

// Mock store functions using vi.hoisted
const {
  mockStoreEnableKidsMode,
  mockStoreDisableKidsMode,
  mockLoadKidsProfile,
  mockUpdateChildAvatar,
  mockStartKidsSession,
  mockEndKidsSession,
  mockTrackVideoWatched,
  mockTrackAgentInteraction,
  mockGenerateParentalCode,
  mockValidateParentalCode,
  mockGetDailyStats,
} = vi.hoisted(() => ({
  mockStoreEnableKidsMode: vi.fn(() => Promise.resolve(true)),
  mockStoreDisableKidsMode: vi.fn(() => Promise.resolve(true)),
  mockLoadKidsProfile: vi.fn(() => Promise.resolve()),
  mockUpdateChildAvatar: vi.fn(() => Promise.resolve(true)),
  mockStartKidsSession: vi.fn(() => Promise.resolve()),
  mockEndKidsSession: vi.fn(() => Promise.resolve()),
  mockTrackVideoWatched: vi.fn(),
  mockTrackAgentInteraction: vi.fn(),
  mockGenerateParentalCode: vi.fn(() => Promise.resolve('ABC123')),
  mockValidateParentalCode: vi.fn(() => Promise.resolve({ isValid: true, childName: 'Maria' })),
  mockGetDailyStats: vi.fn(() => Promise.resolve({ videosWatched: 5, timeSpent: 30 })),
}))

// Mock store state
const mockKidsStoreState = vi.hoisted(() => ({
  isKidsMode: false,
  kidsProfile: null,
  currentSession: null,
  isLoading: false,
  error: null,
}))

vi.mock('@/store/kids-store', () => ({
  useKidsStore: () => ({
    ...mockKidsStoreState,
    enableKidsMode: mockStoreEnableKidsMode,
    disableKidsMode: mockStoreDisableKidsMode,
    loadKidsProfile: mockLoadKidsProfile,
    updateChildAvatar: mockUpdateChildAvatar,
    startKidsSession: mockStartKidsSession,
    endKidsSession: mockEndKidsSession,
    trackVideoWatched: mockTrackVideoWatched,
    trackAgentInteraction: mockTrackAgentInteraction,
    generateParentalCode: mockGenerateParentalCode,
    validateParentalCode: mockValidateParentalCode,
    getDailyStats: mockGetDailyStats,
  }),
}))

// Mock useAgora
const mockUser = vi.hoisted(() => ({ current: null as { id: string } | null }))

vi.mock('@/hooks/use-agora', () => ({
  useAgora: () => ({
    user: mockUser.current,
  }),
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

describe('useKids', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockUser.current = { id: 'user-123' }
    mockKidsStoreState.isKidsMode = false
    mockKidsStoreState.kidsProfile = null
    mockKidsStoreState.currentSession = null
    mockKidsStoreState.isLoading = false
    mockKidsStoreState.error = null
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Initial State', () => {
    it('returns initial state correctly', () => {
      const { result } = renderHook(() => useKids())

      expect(result.current.isKidsMode).toBe(false)
      expect(result.current.kidsProfile).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.isSessionActive).toBe(false)
    })

    it('returns null for parent info when no profile', () => {
      const { result } = renderHook(() => useKids())

      expect(result.current.parentName).toBeNull()
      expect(result.current.parentEmail).toBeNull()
    })

    it('returns null for child info when no profile', () => {
      const { result } = renderHook(() => useKids())

      expect(result.current.childName).toBeNull()
      expect(result.current.childAvatar).toBeNull()
    })
  })

  describe('With Kids Profile', () => {
    beforeEach(() => {
      mockKidsStoreState.kidsProfile = {
        id: 'profile-123',
        userId: 'user-123',
        parentName: 'João',
        parentEmail: 'joao@email.com',
        childName: 'Maria',
        childAvatar: 'panda',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockKidsStoreState.isKidsMode = true
    })

    it('returns profile data', () => {
      const { result } = renderHook(() => useKids())

      expect(result.current.parentName).toBe('João')
      expect(result.current.parentEmail).toBe('joao@email.com')
      expect(result.current.childName).toBe('Maria')
      expect(result.current.childAvatar).toBe('panda')
    })

    it('returns isKidsMode as true', () => {
      const { result } = renderHook(() => useKids())

      expect(result.current.isKidsMode).toBe(true)
    })
  })

  describe('Profile Loading', () => {
    it('loads profile when user is present', () => {
      renderHook(() => useKids())

      expect(mockLoadKidsProfile).toHaveBeenCalledWith('user-123')
    })

    it('does not load profile when no user', () => {
      mockUser.current = null

      renderHook(() => useKids())

      expect(mockLoadKidsProfile).not.toHaveBeenCalled()
    })

    it('does not reload profile for same user', () => {
      const { rerender } = renderHook(() => useKids())

      rerender()
      rerender()

      // Should only be called once
      expect(mockLoadKidsProfile).toHaveBeenCalledTimes(1)
    })
  })

  describe('Enable Kids Mode', () => {
    it('enables kids mode successfully', async () => {
      const { result } = renderHook(() => useKids())

      const success = await act(async () => {
        return result.current.enableKidsMode('João', 'joao@email.com', 'Maria', 'panda')
      })

      expect(success).toBe(true)
      expect(mockStoreEnableKidsMode).toHaveBeenCalledWith(
        'user-123',
        'João',
        'joao@email.com',
        'Maria',
        'panda',
        undefined
      )
    })

    it('enables kids mode with contract ID', async () => {
      const { result } = renderHook(() => useKids())

      await act(async () => {
        return result.current.enableKidsMode(
          'João',
          'joao@email.com',
          'Maria',
          'panda',
          'contract-123'
        )
      })

      expect(mockStoreEnableKidsMode).toHaveBeenCalledWith(
        'user-123',
        'João',
        'joao@email.com',
        'Maria',
        'panda',
        'contract-123'
      )
    })

    it('uses default avatar when not provided', async () => {
      const { result } = renderHook(() => useKids())

      await act(async () => {
        return result.current.enableKidsMode('João', 'joao@email.com', 'Maria')
      })

      expect(mockStoreEnableKidsMode).toHaveBeenCalledWith(
        'user-123',
        'João',
        'joao@email.com',
        'Maria',
        'monica',
        undefined
      )
    })

    it('returns false when no user', async () => {
      mockUser.current = null
      const { result } = renderHook(() => useKids())

      const success = await act(async () => {
        return result.current.enableKidsMode('João', 'joao@email.com', 'Maria')
      })

      expect(success).toBe(false)
      expect(mockStoreEnableKidsMode).not.toHaveBeenCalled()
    })
  })

  describe('Disable Kids Mode', () => {
    it('disables kids mode successfully', async () => {
      const { result } = renderHook(() => useKids())

      const success = await act(async () => {
        return result.current.disableKidsMode()
      })

      expect(success).toBe(true)
      expect(mockStoreDisableKidsMode).toHaveBeenCalledWith('user-123')
    })

    it('returns false when no user', async () => {
      mockUser.current = null
      const { result } = renderHook(() => useKids())

      const success = await act(async () => {
        return result.current.disableKidsMode()
      })

      expect(success).toBe(false)
      expect(mockStoreDisableKidsMode).not.toHaveBeenCalled()
    })
  })

  describe('Session Management', () => {
    it('indicates session is active when currentSession exists', () => {
      mockKidsStoreState.currentSession = { id: 'session-123', startedAt: new Date().toISOString() }

      const { result } = renderHook(() => useKids())

      expect(result.current.isSessionActive).toBe(true)
    })

    it('provides startSession function', () => {
      const { result } = renderHook(() => useKids())

      expect(result.current.startSession).toBe(mockStartKidsSession)
    })

    it('provides endSession function', () => {
      const { result } = renderHook(() => useKids())

      expect(result.current.endSession).toBe(mockEndKidsSession)
    })
  })

  describe('Tracking Functions', () => {
    it('provides trackVideo function', () => {
      const { result } = renderHook(() => useKids())

      expect(result.current.trackVideo).toBe(mockTrackVideoWatched)
    })

    it('provides trackAgent function', () => {
      const { result } = renderHook(() => useKids())

      expect(result.current.trackAgent).toBe(mockTrackAgentInteraction)
    })
  })

  describe('Generate Access Code', () => {
    it('generates access code successfully', async () => {
      const { result } = renderHook(() => useKids())

      const code = await act(async () => {
        return result.current.generateAccessCode()
      })

      expect(code).toBe('ABC123')
      expect(mockGenerateParentalCode).toHaveBeenCalledWith('user-123')
    })

    it('returns null when no user', async () => {
      mockUser.current = null
      const { result } = renderHook(() => useKids())

      const code = await act(async () => {
        return result.current.generateAccessCode()
      })

      expect(code).toBeNull()
      expect(mockGenerateParentalCode).not.toHaveBeenCalled()
    })
  })

  describe('Validate Access Code', () => {
    it('validates access code successfully', async () => {
      const { result } = renderHook(() => useKids())

      const validation = await act(async () => {
        return result.current.validateAccessCode('ABC123')
      })

      expect(validation).toEqual({ isValid: true, childName: 'Maria' })
      expect(mockValidateParentalCode).toHaveBeenCalledWith('ABC123')
    })

    it('handles invalid code', async () => {
      mockValidateParentalCode.mockImplementationOnce(() => Promise.resolve({ isValid: false }))
      const { result } = renderHook(() => useKids())

      const validation = await act(async () => {
        return result.current.validateAccessCode('INVALID')
      })

      expect(validation?.isValid).toBe(false)
      expect(validation?.childName).toBeUndefined()
    })
  })

  describe('Stats Functions', () => {
    beforeEach(() => {
      mockKidsStoreState.kidsProfile = {
        id: 'profile-123',
        userId: 'user-123',
        parentName: 'João',
        parentEmail: 'joao@email.com',
        childName: 'Maria',
        childAvatar: 'panda',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    })

    it('gets today stats', async () => {
      const { result } = renderHook(() => useKids())

      const stats = await act(async () => {
        return result.current.getTodayStats()
      })

      expect(stats).toEqual({ videosWatched: 5, timeSpent: 30 })
      expect(mockGetDailyStats).toHaveBeenCalledWith('profile-123')
    })

    it('returns null for today stats when no profile', async () => {
      mockKidsStoreState.kidsProfile = null
      const { result } = renderHook(() => useKids())

      const stats = await act(async () => {
        return result.current.getTodayStats()
      })

      expect(stats).toBeNull()
      expect(mockGetDailyStats).not.toHaveBeenCalled()
    })

    it('gets stats for specific date', async () => {
      const { result } = renderHook(() => useKids())
      const testDate = new Date('2025-12-15')

      const stats = await act(async () => {
        return result.current.getStatsForDate(testDate)
      })

      expect(stats).toEqual({ videosWatched: 5, timeSpent: 30 })
      expect(mockGetDailyStats).toHaveBeenCalledWith('profile-123', testDate)
    })

    it('returns null for date stats when no profile', async () => {
      mockKidsStoreState.kidsProfile = null
      const { result } = renderHook(() => useKids())
      const testDate = new Date('2025-12-15')

      const stats = await act(async () => {
        return result.current.getStatsForDate(testDate)
      })

      expect(stats).toBeNull()
    })
  })

  describe('Update Avatar', () => {
    it('provides updateAvatar function', () => {
      const { result } = renderHook(() => useKids())

      expect(result.current.updateAvatar).toBe(mockUpdateChildAvatar)
    })
  })
})

describe('useRequireKidsMode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser.current = { id: 'user-123' }
    mockKidsStoreState.isKidsMode = false
    mockKidsStoreState.kidsProfile = null
    mockKidsStoreState.isLoading = false
  })

  it('returns isReady false when loading', () => {
    mockKidsStoreState.isLoading = true

    const { result } = renderHook(() => useRequireKidsMode())

    expect(result.current.isReady).toBe(false)
    expect(result.current.isLoading).toBe(true)
  })

  it('returns isReady false when not in kids mode', () => {
    mockKidsStoreState.isKidsMode = false
    mockKidsStoreState.kidsProfile = {
      id: 'profile-123',
      userId: 'user-123',
      parentName: 'João',
      parentEmail: 'joao@email.com',
      childName: 'Maria',
      childAvatar: 'panda',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const { result } = renderHook(() => useRequireKidsMode())

    expect(result.current.isReady).toBe(false)
    expect(result.current.isKidsMode).toBe(false)
  })

  it('returns isReady false when no profile', () => {
    mockKidsStoreState.isKidsMode = true
    mockKidsStoreState.kidsProfile = null

    const { result } = renderHook(() => useRequireKidsMode())

    expect(result.current.isReady).toBe(false)
  })

  it('returns isReady true when all conditions met', () => {
    mockKidsStoreState.isKidsMode = true
    mockKidsStoreState.kidsProfile = {
      id: 'profile-123',
      userId: 'user-123',
      parentName: 'João',
      parentEmail: 'joao@email.com',
      childName: 'Maria',
      childAvatar: 'panda',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockKidsStoreState.isLoading = false

    const { result } = renderHook(() => useRequireKidsMode())

    expect(result.current.isReady).toBe(true)
    expect(result.current.isKidsMode).toBe(true)
    expect(result.current.kidsProfile).not.toBeNull()
  })
})

describe('useParentalAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser.current = { id: 'user-123' }
  })

  it('verifies and gets access with valid code', async () => {
    mockValidateParentalCode.mockImplementationOnce(() =>
      Promise.resolve({ isValid: true, childName: 'Maria' })
    )

    const { result } = renderHook(() => useParentalAccess())

    const accessResult = await act(async () => {
      return result.current.verifyAndGetAccess('ABC123')
    })

    expect(accessResult).toEqual({ success: true, childName: 'Maria' })
  })

  it('returns error with invalid code', async () => {
    mockValidateParentalCode.mockImplementationOnce(() => Promise.resolve({ isValid: false }))

    const { result } = renderHook(() => useParentalAccess())

    const accessResult = await act(async () => {
      return result.current.verifyAndGetAccess('INVALID')
    })

    expect(accessResult).toEqual({
      success: false,
      error: 'Código inválido ou expirado',
    })
  })

  it('provides verifyAndGetAccess function', () => {
    const { result } = renderHook(() => useParentalAccess())

    expect(typeof result.current.verifyAndGetAccess).toBe('function')
  })
})
