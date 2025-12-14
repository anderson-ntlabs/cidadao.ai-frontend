/**
 * User Profile Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Hoisted mocks
const {
  mockFrom,
  mockSelect,
  mockInsert,
  mockUpsert,
  mockUpdate,
  mockDelete,
  mockEq,
  mockSingle,
  mockOrder,
  mockLimit,
  mockRange,
  mockGte,
  mockLte,
  mockLt,
  mockStorage,
  mockAuth,
} = vi.hoisted(() => {
  const mockSingle = vi.fn()
  const mockOrder = vi.fn()
  const mockLimit = vi.fn()
  const mockRange = vi.fn()
  const mockGte = vi.fn()
  const mockLte = vi.fn()
  const mockLt = vi.fn()
  const mockEq = vi.fn()
  const mockSelect = vi.fn()
  const mockInsert = vi.fn()
  const mockUpsert = vi.fn()
  const mockUpdate = vi.fn()
  const mockDelete = vi.fn()

  return {
    mockSingle,
    mockOrder,
    mockLimit,
    mockRange,
    mockGte,
    mockLte,
    mockLt,
    mockEq,
    mockSelect,
    mockInsert,
    mockUpsert,
    mockUpdate,
    mockDelete,
    mockFrom: vi.fn(),
    mockStorage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/avatar.jpg' } })),
      })),
    },
    mockAuth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { created_at: '2025-01-01' } } }),
    },
  }
})

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
    storage: mockStorage,
    auth: mockAuth,
  }),
}))

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('UserProfileService', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default chain setup
    mockEq.mockReturnValue({
      eq: mockEq,
      single: mockSingle,
      order: mockOrder,
      limit: mockLimit,
      gte: mockGte,
      lte: mockLte,
      lt: mockLt,
    })
    mockOrder.mockReturnValue({ limit: mockLimit, ascending: false })
    mockLimit.mockReturnValue({ single: mockSingle })
    mockGte.mockReturnValue({ lte: mockLte, eq: mockEq })
    mockLte.mockReturnValue({ limit: mockLimit, eq: mockEq })
    mockLt.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq, single: mockSingle })
    mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) })
    mockUpsert.mockReturnValue({ select: () => ({ single: mockSingle }) })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockDelete.mockReturnValue({ eq: mockEq })
    mockSingle.mockResolvedValue({ data: null, error: null })
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      upsert: mockUpsert,
      update: mockUpdate,
      delete: mockDelete,
    })
  })

  describe('getProfile', () => {
    it('should return profile when found', async () => {
      const mockProfile = { id: 'user-123', full_name: 'Test User' }
      mockSingle.mockResolvedValue({ data: mockProfile, error: null })

      const { userProfileService } = await import('./user-profile.service')
      const profile = await userProfileService.getProfile('user-123')

      expect(profile).toEqual(mockProfile)
    })

    it('should return null when not found (PGRST116)', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })

      const { userProfileService } = await import('./user-profile.service')
      const profile = await userProfileService.getProfile('user-123')

      expect(profile).toBeNull()
    })

    it('should throw on other errors', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { code: 'OTHER', message: 'Error' } })

      const { userProfileService } = await import('./user-profile.service')
      await expect(userProfileService.getProfile('user-123')).rejects.toThrow()
    })
  })

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const mockUpdated = { id: 'user-123', full_name: 'Updated Name' }
      mockSingle.mockResolvedValue({ data: mockUpdated, error: null })

      const { userProfileService } = await import('./user-profile.service')
      const profile = await userProfileService.updateProfile('user-123', {
        full_name: 'Updated Name',
      })

      expect(profile).toEqual(mockUpdated)
    })

    it('should throw on error', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Error' } })

      const { userProfileService } = await import('./user-profile.service')
      await expect(userProfileService.updateProfile('user-123', {})).rejects.toThrow()
    })
  })

  describe('getPreferences', () => {
    it('should return preferences when found', async () => {
      const mockPrefs = { theme: 'dark', language: 'en' }
      mockSingle.mockResolvedValue({ data: mockPrefs, error: null })

      const { userProfileService } = await import('./user-profile.service')
      const prefs = await userProfileService.getPreferences('user-123')

      expect(prefs).toEqual(mockPrefs)
    })

    it('should return defaults when not found (PGRST116)', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })

      const { userProfileService } = await import('./user-profile.service')
      const prefs = await userProfileService.getPreferences('user-123')

      expect(prefs.theme).toBe('system')
      expect(prefs.language).toBe('pt')
    })

    it('should return defaults on error', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { code: 'OTHER', message: 'Error' } })

      const { userProfileService } = await import('./user-profile.service')
      const prefs = await userProfileService.getPreferences('user-123')

      expect(prefs.theme).toBe('system')
    })
  })

  describe('updatePreferences', () => {
    it('should update preferences successfully', async () => {
      const mockPrefs = { theme: 'dark' }
      mockSingle.mockResolvedValue({ data: mockPrefs, error: null })

      const { userProfileService } = await import('./user-profile.service')
      const prefs = await userProfileService.updatePreferences('user-123', { theme: 'dark' })

      expect(prefs).toEqual(mockPrefs)
    })
  })

  describe('getStats', () => {
    it('should return user statistics', async () => {
      mockSelect.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: 5, error: null }),
      })

      const { userProfileService } = await import('./user-profile.service')
      const stats = await userProfileService.getStats('user-123')

      expect(stats).toHaveProperty('total_sessions')
      expect(stats).toHaveProperty('total_messages')
      expect(stats).toHaveProperty('total_investigations')
      expect(stats).toHaveProperty('member_since')
    })

    it('should return zeros on error', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('DB Error')
      })

      const { userProfileService } = await import('./user-profile.service')
      const stats = await userProfileService.getStats('user-123')

      expect(stats.total_sessions).toBe(0)
      expect(stats.total_messages).toBe(0)
    })
  })

  describe('deleteAccount', () => {
    it('should soft delete account', async () => {
      mockSingle.mockResolvedValue({ data: {}, error: null })

      const { userProfileService } = await import('./user-profile.service')
      await userProfileService.deleteAccount('user-123')

      expect(mockUpsert).toHaveBeenCalled()
    })
  })

  describe('logActivity', () => {
    it('should log activity successfully', async () => {
      const mockActivity = { id: '1', type: 'chat', title: 'Test' }
      mockSingle.mockResolvedValue({ data: mockActivity, error: null })

      const { userProfileService } = await import('./user-profile.service')
      const activity = await userProfileService.logActivity('user-123', 'chat', 'Test')

      expect(activity).toEqual(mockActivity)
    })

    it('should return mock activity when table not found', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })

      const { userProfileService } = await import('./user-profile.service')
      const activity = await userProfileService.logActivity('user-123', 'chat', 'Test')

      expect(activity).toHaveProperty('type', 'chat')
      expect(activity).toHaveProperty('title', 'Test')
    })
  })

  describe('getActivities', () => {
    it('should return activities', async () => {
      const mockActivities = [{ id: '1', type: 'chat' }]
      mockOrder.mockReturnValue({
        eq: mockEq,
        limit: mockLimit,
        gte: mockGte,
        lte: mockLte,
        range: mockRange,
      })
      mockEq.mockResolvedValue({ data: mockActivities, error: null })

      const { userProfileService } = await import('./user-profile.service')
      const activities = await userProfileService.getActivities('user-123')

      expect(Array.isArray(activities)).toBe(true)
    })

    it('should return empty array when table not found', async () => {
      mockOrder.mockReturnValue({ eq: mockEq })
      mockEq.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })

      const { userProfileService } = await import('./user-profile.service')
      const activities = await userProfileService.getActivities('user-123')

      expect(activities).toEqual([])
    })
  })

  describe('getRecentActivities', () => {
    it('should call getActivities with limit', async () => {
      mockOrder.mockReturnValue({ eq: mockEq, limit: mockLimit })
      mockEq.mockResolvedValue({ data: [], error: null })

      const { userProfileService } = await import('./user-profile.service')
      const activities = await userProfileService.getRecentActivities('user-123', 10)

      expect(Array.isArray(activities)).toBe(true)
    })
  })

  describe('getActivityStats', () => {
    it('should return activity counts', async () => {
      mockOrder.mockReturnValue({ eq: mockEq })
      mockEq.mockResolvedValue({
        data: [{ type: 'chat' }, { type: 'chat' }, { type: 'investigation' }],
        error: null,
      })

      const { userProfileService } = await import('./user-profile.service')
      const stats = await userProfileService.getActivityStats('user-123')

      expect(stats).toHaveProperty('chat')
      expect(stats).toHaveProperty('investigation')
    })
  })

  describe('cleanupOldActivities', () => {
    it('should delete old activities', async () => {
      mockLt.mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: [{ id: '1' }], error: null }),
      })

      const { userProfileService } = await import('./user-profile.service')
      const count = await userProfileService.cleanupOldActivities('user-123', 90)

      expect(count).toBe(1)
    })

    it('should return 0 on error', async () => {
      mockLt.mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: null, error: { message: 'Error' } }),
      })

      const { userProfileService } = await import('./user-profile.service')
      const count = await userProfileService.cleanupOldActivities('user-123')

      expect(count).toBe(0)
    })
  })

  describe('singleton export', () => {
    it('should export userProfileService singleton', async () => {
      const { userProfileService } = await import('./user-profile.service')
      expect(userProfileService).toBeDefined()
    })
  })
})
