/**
 * Badge Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Hoisted mocks
const { mockFrom, mockSelect, mockInsert, mockEq, mockOrder, mockSingle, mockHead } = vi.hoisted(
  () => {
    const mockOrder = vi.fn()
    const mockHead = vi.fn()
    const mockSingle = vi.fn()
    const mockEq = vi.fn()
    const mockSelect = vi.fn()
    const mockInsert = vi.fn()

    return {
      mockOrder,
      mockHead,
      mockSingle,
      mockEq,
      mockSelect,
      mockInsert,
      mockFrom: vi.fn(),
    }
  }
)

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
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

// Mock badges data
vi.mock('@/data/badges', () => ({
  BADGES: {
    colaborador: { id: 'colaborador', icon: '🤝', color: '#10b981' },
    pioneiro: { id: 'pioneiro', icon: '🚀', color: '#8b5cf6' },
    especialista: { id: 'especialista', icon: '🧠', color: '#f59e0b' },
    guardiao: { id: 'guardiao', icon: '🛡️', color: '#3b82f6' },
    japaguri: { id: 'japaguri', icon: '🍜', color: '#ef4444' },
  },
  getBadgeInfo: vi.fn((type: string) => ({
    id: type,
    icon: '🏅',
    color: '#000',
  })),
  getBadgeName: vi.fn((type: string, locale: string) => `${type}_${locale}`),
  getBadgeDescription: vi.fn((type: string, locale: string) => `desc_${type}_${locale}`),
}))

describe('BadgeService', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default chain setup
    mockEq.mockReturnValue({ eq: mockEq, order: mockOrder, single: mockSingle })
    mockSelect.mockReturnValue({ eq: mockEq, count: 'exact' })
    mockOrder.mockResolvedValue({ data: [], error: null })
    mockSingle.mockResolvedValue({ data: null, error: null })
    mockInsert.mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
    })
  })

  describe('getUserBadges', () => {
    it('should return user badges', async () => {
      const mockBadges = [
        { id: '1', badge_type: 'colaborador', earned_at: '2025-01-01' },
        { id: '2', badge_type: 'pioneiro', earned_at: '2025-01-02' },
      ]
      mockOrder.mockResolvedValue({ data: mockBadges, error: null })

      const { badgeService } = await import('./badge.service')
      const badges = await badgeService.getUserBadges('user-123')

      expect(badges).toEqual(mockBadges)
      expect(mockFrom).toHaveBeenCalledWith('user_badges')
    })

    it('should return empty array on error', async () => {
      mockOrder.mockResolvedValue({ data: null, error: { message: 'Error' } })

      const { badgeService } = await import('./badge.service')
      const badges = await badgeService.getUserBadges('user-123')

      expect(badges).toEqual([])
    })

    it('should return empty array on null data', async () => {
      mockOrder.mockResolvedValue({ data: null, error: null })

      const { badgeService } = await import('./badge.service')
      const badges = await badgeService.getUserBadges('user-123')

      expect(badges).toEqual([])
    })
  })

  describe('hasBadge', () => {
    it('should return true when user has badge', async () => {
      mockSingle.mockResolvedValue({ data: { id: '1' }, error: null })

      const { badgeService } = await import('./badge.service')
      const result = await badgeService.hasBadge('user-123', 'colaborador')

      expect(result).toBe(true)
    })

    it('should return false when badge not found (PGRST116)', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })

      const { badgeService } = await import('./badge.service')
      const result = await badgeService.hasBadge('user-123', 'colaborador')

      expect(result).toBe(false)
    })

    it('should return false on other errors', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { code: 'OTHER', message: 'Error' } })

      const { badgeService } = await import('./badge.service')
      const result = await badgeService.hasBadge('user-123', 'colaborador')

      expect(result).toBe(false)
    })
  })

  describe('awardBadge', () => {
    it('should return false if user already has badge', async () => {
      // hasBadge returns true
      mockSingle.mockResolvedValue({ data: { id: '1' }, error: null })

      const { badgeService } = await import('./badge.service')
      const result = await badgeService.awardBadge('user-123', 'colaborador')

      expect(result).toBe(false)
    })

    it('should award badge successfully', async () => {
      // hasBadge returns false
      mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      mockInsert.mockResolvedValue({ error: null })

      const { badgeService } = await import('./badge.service')
      const result = await badgeService.awardBadge(
        'user-123',
        'colaborador',
        'system',
        'source-123'
      )

      expect(result).toBe(true)
      expect(mockInsert).toHaveBeenCalled()
    })

    it('should return false on unique constraint violation', async () => {
      // hasBadge returns false
      mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      mockInsert.mockResolvedValue({ error: { code: '23505' } })

      const { badgeService } = await import('./badge.service')
      const result = await badgeService.awardBadge('user-123', 'colaborador')

      expect(result).toBe(false)
    })

    it('should return false on insert error', async () => {
      // hasBadge returns false
      mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      mockInsert.mockResolvedValue({ error: { code: 'OTHER', message: 'Error' } })

      const { badgeService } = await import('./badge.service')
      const result = await badgeService.awardBadge('user-123', 'colaborador')

      expect(result).toBe(false)
    })
  })

  describe('getBadgeDisplayInfo', () => {
    it('should return badge info with localized name and description', async () => {
      const { badgeService } = await import('./badge.service')
      const info = badgeService.getBadgeDisplayInfo('colaborador', 'pt')

      expect(info).toHaveProperty('name')
      expect(info).toHaveProperty('description')
      expect(info.name).toContain('colaborador')
      expect(info.description).toContain('colaborador')
    })

    it('should use default locale pt', async () => {
      const { badgeService } = await import('./badge.service')
      const info = badgeService.getBadgeDisplayInfo('colaborador')

      expect(info.name).toContain('pt')
    })
  })

  describe('getAllBadgeTypes', () => {
    it('should return all badge types with display info', async () => {
      const { badgeService } = await import('./badge.service')
      const types = badgeService.getAllBadgeTypes('en')

      expect(types.length).toBeGreaterThan(0)
      types.forEach((type) => {
        expect(type).toHaveProperty('name')
        expect(type).toHaveProperty('description')
      })
    })
  })

  describe('getBadgeCount', () => {
    it('should return badge count', async () => {
      mockSelect.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: 42, error: null }),
      })

      const { badgeService } = await import('./badge.service')
      const count = await badgeService.getBadgeCount('colaborador')

      expect(count).toBe(42)
    })

    it('should return 0 on error', async () => {
      mockSelect.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: null, error: { message: 'Error' } }),
      })

      const { badgeService } = await import('./badge.service')
      const count = await badgeService.getBadgeCount('colaborador')

      expect(count).toBe(0)
    })
  })

  describe('getBadgeStats', () => {
    it('should return stats for all badge types', async () => {
      mockSelect.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: 10, error: null }),
      })

      const { badgeService } = await import('./badge.service')
      const stats = await badgeService.getBadgeStats()

      expect(stats).toHaveProperty('colaborador')
      expect(stats).toHaveProperty('pioneiro')
      expect(stats).toHaveProperty('especialista')
      expect(stats).toHaveProperty('guardiao')
      expect(stats).toHaveProperty('japaguri')
    })

    it('should return zeros on error', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('DB Error')
      })

      const { badgeService } = await import('./badge.service')
      const stats = await badgeService.getBadgeStats()

      expect(stats.colaborador).toBe(0)
      expect(stats.pioneiro).toBe(0)
    })
  })

  describe('singleton export', () => {
    it('should export badgeService singleton', async () => {
      const { badgeService } = await import('./badge.service')
      expect(badgeService).toBeDefined()
    })
  })
})
