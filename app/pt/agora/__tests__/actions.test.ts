/**
 * Server Actions Tests
 *
 * Tests for Agora server actions including XP management,
 * session recording, badges, and consent handling.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-12
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock next/cache before importing actions
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}))

// Import actions after mocks are set up
import {
  addXp,
  recordSession,
  awardBadge,
  acceptLgpdConsent,
  updateVideoProgress,
  updateReadingProgress,
} from '../actions'
import { revalidatePath } from 'next/cache'

// Helper to create mock user
const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
    avatar_url: 'https://example.com/avatar.png',
  },
  ...overrides,
})

// Helper to create mock profile
const createMockProfile = (overrides = {}) => ({
  total_xp: 100,
  current_level: 2,
  current_streak: 3,
  total_time_minutes: 60,
  total_sessions: 5,
  last_activity_date: '2025-12-11',
  badges: [],
  ...overrides,
})

// Helper to create chainable mock for Supabase queries
const createChainableMock = (finalData: unknown = null, finalError: unknown = null) => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: finalData, error: finalError }),
    maybeSingle: vi.fn().mockResolvedValue({ data: finalData, error: finalError }),
  }
  return chain
}

describe('Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ============================================
  // addXp Tests
  // ============================================
  describe('addXp', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      })

      const result = await addXp(50, 'Test XP')

      expect(result).toEqual({ error: 'Not authenticated' })
    })

    it('should add XP successfully to existing profile', async () => {
      const mockUser = createMockUser()
      const mockProfile = createMockProfile({ total_xp: 100, current_level: 2 })

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      const selectChain = createChainableMock(mockProfile)
      const updateChain = createChainableMock()
      const insertChain = createChainableMock()

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'agora_profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }
        }
        if (table === 'agora_xp_transactions') {
          return {
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        return selectChain
      })

      const result = await addXp(50, 'Test XP', 'test')

      expect(result).toEqual({
        success: true,
        newXp: 150,
        newLevel: 2,
      })
      expect(revalidatePath).toHaveBeenCalledWith('/pt/agora')
    })

    it('should calculate correct level based on XP', async () => {
      const mockUser = createMockUser()
      const mockProfile = createMockProfile({ total_xp: 95, current_level: 1 })

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'agora_profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }
        }
        if (table === 'agora_xp_transactions') {
          return {
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        return createChainableMock()
      })

      // Adding 10 XP should bring total to 105, which is level 2
      const result = await addXp(10, 'Level up test')

      expect(result).toEqual({
        success: true,
        newXp: 105,
        newLevel: 2, // 105 / 100 + 1 = 2
      })
    })

    it('should handle database errors gracefully', async () => {
      const mockUser = createMockUser()

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      mockSupabaseClient.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(new Error('Database error')),
          }),
        }),
      }))

      const result = await addXp(50, 'Test XP')

      expect(result).toEqual({ error: 'Failed to add XP' })
    })

    it('should handle null profile (new user)', async () => {
      const mockUser = createMockUser()

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'agora_profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }
        }
        if (table === 'agora_xp_transactions') {
          return {
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        return createChainableMock()
      })

      const result = await addXp(50, 'First XP')

      expect(result).toEqual({
        success: true,
        newXp: 50,
        newLevel: 1,
      })
    })
  })

  // ============================================
  // recordSession Tests
  // ============================================
  describe('recordSession', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      })

      const result = await recordSession(30)

      expect(result).toEqual({ error: 'Not authenticated' })
    })

    it('should record session and increment streak for consecutive day', async () => {
      const mockUser = createMockUser()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const mockProfile = createMockProfile({
        current_streak: 5,
        last_activity_date: yesterday.toISOString().split('T')[0],
      })

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'agora_profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }
        }
        return createChainableMock()
      })

      const result = await recordSession(30)

      expect(result).toEqual({
        success: true,
        newStreak: 6,
      })
    })

    it('should reset streak if more than 1 day gap', async () => {
      const mockUser = createMockUser()
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      const mockProfile = createMockProfile({
        current_streak: 10,
        last_activity_date: threeDaysAgo.toISOString().split('T')[0],
      })

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'agora_profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }
        }
        return createChainableMock()
      })

      const result = await recordSession(30)

      expect(result).toEqual({
        success: true,
        newStreak: 1,
      })
    })

    it('should keep streak the same if same day', async () => {
      const mockUser = createMockUser()
      const today = new Date().toISOString().split('T')[0]
      const mockProfile = createMockProfile({
        current_streak: 5,
        last_activity_date: today,
      })

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'agora_profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }
        }
        return createChainableMock()
      })

      const result = await recordSession(30)

      expect(result).toEqual({
        success: true,
        newStreak: 5,
      })
    })

    it('should initialize streak to 1 for first session', async () => {
      const mockUser = createMockUser()
      const mockProfile = createMockProfile({
        current_streak: 0,
        last_activity_date: null,
      })

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'agora_profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }
        }
        return createChainableMock()
      })

      const result = await recordSession(30)

      expect(result).toEqual({
        success: true,
        newStreak: 1,
      })
    })
  })

  // ============================================
  // awardBadge Tests
  // ============================================
  describe('awardBadge', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      })

      const result = await awardBadge('first-chat', 'Primeiro Chat')

      expect(result).toEqual({ error: 'Not authenticated' })
    })

    it('should award badge to user without existing badges', async () => {
      const mockUser = createMockUser()
      const mockProfile = createMockProfile({ badges: [] })

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'agora_profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }
        }
        if (table === 'agora_xp_transactions') {
          return {
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        return createChainableMock()
      })

      const result = await awardBadge('first-chat', 'Primeiro Chat')

      expect(result.success).toBe(true)
      expect(result.badges).toContain('first-chat')
    })

    it('should not award duplicate badge', async () => {
      const mockUser = createMockUser()
      const mockProfile = createMockProfile({ badges: ['first-chat'] })

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'agora_profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
              }),
            }),
          }
        }
        return createChainableMock()
      })

      const result = await awardBadge('first-chat', 'Primeiro Chat')

      expect(result).toEqual({
        success: true,
        alreadyHas: true,
      })
    })

    it('should add badge to existing badges array', async () => {
      const mockUser = createMockUser()
      const mockProfile = createMockProfile({ badges: ['first-chat', 'explorer'] })

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'agora_profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }
        }
        if (table === 'agora_xp_transactions') {
          return {
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        return createChainableMock()
      })

      const result = await awardBadge('video-master', 'Video Master')

      expect(result.success).toBe(true)
      expect(result.badges).toEqual(['first-chat', 'explorer', 'video-master'])
    })
  })

  // ============================================
  // acceptLgpdConsent Tests
  // ============================================
  describe('acceptLgpdConsent', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      })

      const result = await acceptLgpdConsent()

      expect(result).toEqual({ error: 'Not authenticated' })
    })

    it('should return alreadyAccepted if consent exists', async () => {
      const mockUser = createMockUser()

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'agora_consent') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'consent-123' }, error: null }),
              }),
            }),
          }
        }
        return createChainableMock()
      })

      const result = await acceptLgpdConsent()

      expect(result).toEqual({
        success: true,
        alreadyAccepted: true,
      })
    })

    it('should create consent and profile for new user', async () => {
      const mockUser = createMockUser()

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'agora_consent') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        if (table === 'agora_profiles') {
          return {
            upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        return createChainableMock()
      })

      const result = await acceptLgpdConsent()

      expect(result).toEqual({ success: true })
      expect(revalidatePath).toHaveBeenCalledWith('/pt/agora')
    })
  })

  // ============================================
  // updateVideoProgress Tests
  // ============================================
  describe('updateVideoProgress', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      })

      const result = await updateVideoProgress('video-1', 60, 120, false)

      expect(result).toEqual({ error: 'Not authenticated' })
    })

    // Note: Complex chained query tests (multiple .eq()) require more sophisticated mocking
    // These are integration test candidates for future sprints
  })

  // ============================================
  // updateReadingProgress Tests
  // ============================================
  describe('updateReadingProgress', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      })

      const result = await updateReadingProgress('reading-1', true)

      expect(result).toEqual({ error: 'Not authenticated' })
    })

    // Note: Complex chained query tests (multiple .eq()) require more sophisticated mocking
    // These are integration test candidates for future sprints
  })
})
