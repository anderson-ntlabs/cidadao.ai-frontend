/**
 * Tests for Academy Leaderboard Service
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Hoisted mocks
const mockRpc = vi.hoisted(() => vi.fn())
const mockFrom = vi.hoisted(() => vi.fn())
const mockSelect = vi.hoisted(() => vi.fn())
const mockEq = vi.hoisted(() => vi.fn())
const mockOrder = vi.hoisted(() => vi.fn())
const mockLimit = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    rpc: mockRpc,
    from: mockFrom,
  }),
}))

import { fetchLeaderboard, fetchUserRank, mockLeaderboard } from './leaderboard'

describe('Leaderboard Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup chained mock
    mockFrom.mockReturnValue({
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockReturnValue({
            limit: mockLimit,
          }),
        }),
      }),
    })
  })

  describe('fetchLeaderboard', () => {
    it('should fetch leaderboard using RPC when available', async () => {
      const mockData = [{ id: '1', full_name: 'Test User', total_xp: 100, rank_position: 1 }]

      mockRpc.mockResolvedValueOnce({ data: mockData, error: null })

      const result = await fetchLeaderboard('xp', 10)

      expect(mockRpc).toHaveBeenCalledWith('get_agora_leaderboard', {
        sort_by: 'xp',
        limit_count: 10,
      })
      expect(result.data).toEqual(mockData)
      expect(result.error).toBeNull()
    })

    it('should fallback to direct query when RPC fails', async () => {
      const mockFallbackData = [{ id: '1', full_name: 'Test User', total_xp: 100 }]

      mockRpc.mockResolvedValueOnce({
        data: null,
        error: { message: 'RPC not found' },
      })

      mockLimit.mockResolvedValueOnce({ data: mockFallbackData, error: null })

      const result = await fetchLeaderboard('xp', 10)

      expect(mockFrom).toHaveBeenCalledWith('agora_profiles')
      expect(result.data).toHaveLength(1)
      expect(result.data?.[0].rank_position).toBe(1)
    })

    it('should sort by time when specified', async () => {
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: { message: 'RPC not found' },
      })

      mockLimit.mockResolvedValueOnce({ data: [], error: null })

      await fetchLeaderboard('time', 10)

      expect(mockOrder).toHaveBeenCalledWith('total_time_minutes', {
        ascending: false,
      })
    })

    it('should sort by streak when specified', async () => {
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: { message: 'RPC not found' },
      })

      mockLimit.mockResolvedValueOnce({ data: [], error: null })

      await fetchLeaderboard('streak', 10)

      expect(mockOrder).toHaveBeenCalledWith('current_streak', {
        ascending: false,
      })
    })

    it('should return error on fallback failure', async () => {
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: { message: 'RPC error' },
      })

      mockLimit.mockResolvedValueOnce({
        data: null,
        error: { message: 'Query failed' },
      })

      const result = await fetchLeaderboard()

      expect(result.data).toBeNull()
      expect(result.error?.message).toBe('Query failed')
    })

    it('should handle exceptions', async () => {
      mockRpc.mockRejectedValueOnce(new Error('Network error'))

      const result = await fetchLeaderboard()

      expect(result.data).toBeNull()
      expect(result.error?.message).toBe('Network error')
    })

    it('should use default parameters', async () => {
      mockRpc.mockResolvedValueOnce({ data: [], error: null })

      await fetchLeaderboard()

      expect(mockRpc).toHaveBeenCalledWith('get_agora_leaderboard', {
        sort_by: 'xp',
        limit_count: 50,
      })
    })
  })

  describe('fetchUserRank', () => {
    it('should fetch user rank using RPC', async () => {
      mockRpc.mockResolvedValueOnce({ data: 5, error: null })

      const result = await fetchUserRank('user-123', 'xp')

      expect(mockRpc).toHaveBeenCalledWith('get_user_rank', {
        p_user_id: 'user-123',
        sort_by: 'xp',
      })
      expect(result.rank).toBe(5)
      expect(result.error).toBeNull()
    })

    it('should return error on RPC failure', async () => {
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: { message: 'User not found' },
      })

      const result = await fetchUserRank('user-123')

      expect(result.rank).toBeNull()
      expect(result.error?.message).toBe('User not found')
    })

    it('should handle exceptions', async () => {
      mockRpc.mockRejectedValueOnce(new Error('Connection failed'))

      const result = await fetchUserRank('user-123')

      expect(result.rank).toBeNull()
      expect(result.error?.message).toBe('Connection failed')
    })

    it('should use default sort by xp', async () => {
      mockRpc.mockResolvedValueOnce({ data: 1, error: null })

      await fetchUserRank('user-123')

      expect(mockRpc).toHaveBeenCalledWith('get_user_rank', {
        p_user_id: 'user-123',
        sort_by: 'xp',
      })
    })
  })

  describe('mockLeaderboard', () => {
    it('should have valid mock data', () => {
      expect(mockLeaderboard).toHaveLength(8)
    })

    it('should have required fields', () => {
      mockLeaderboard.forEach((entry) => {
        expect(entry).toHaveProperty('id')
        expect(entry).toHaveProperty('user_id')
        expect(entry).toHaveProperty('full_name')
        expect(entry).toHaveProperty('total_xp')
        expect(entry).toHaveProperty('current_level')
        expect(entry).toHaveProperty('current_rank')
        expect(entry).toHaveProperty('rank_position')
      })
    })

    it('should be sorted by XP descending', () => {
      for (let i = 1; i < mockLeaderboard.length; i++) {
        expect(mockLeaderboard[i].total_xp).toBeLessThanOrEqual(mockLeaderboard[i - 1].total_xp)
      }
    })

    it('should have sequential rank positions', () => {
      mockLeaderboard.forEach((entry, index) => {
        expect(entry.rank_position).toBe(index + 1)
      })
    })
  })
})
