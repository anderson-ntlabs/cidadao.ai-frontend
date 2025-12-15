import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useNotificationBadge } from '../use-notification-badge'

// Mock the notification store
const mockNotifications = [
  { id: '1', read: false },
  { id: '2', read: true },
  { id: '3', read: false },
]

const mockFetchNotifications = vi.fn()
const mockGetUnreadCount = vi.fn()

vi.mock('@/store/notification-store', () => ({
  useNotificationStore: vi.fn((selector) => {
    const state = {
      notifications: mockNotifications,
      getUnreadCount: mockGetUnreadCount,
      fetchNotifications: mockFetchNotifications,
      lastFetch: null,
    }
    return selector(state)
  }),
}))

describe('useNotificationBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUnreadCount.mockReturnValue(2)
  })

  describe('unread count', () => {
    it('returns unread count from store', () => {
      mockGetUnreadCount.mockReturnValue(5)
      const { result } = renderHook(() => useNotificationBadge())
      expect(result.current.unreadCount).toBe(5)
    })

    it('returns zero when no unread', () => {
      mockGetUnreadCount.mockReturnValue(0)
      const { result } = renderHook(() => useNotificationBadge())
      expect(result.current.unreadCount).toBe(0)
    })
  })

  describe('hasUnread', () => {
    it('returns true when has unread', () => {
      mockGetUnreadCount.mockReturnValue(3)
      const { result } = renderHook(() => useNotificationBadge())
      expect(result.current.hasUnread).toBe(true)
    })

    it('returns false when no unread', () => {
      mockGetUnreadCount.mockReturnValue(0)
      const { result } = renderHook(() => useNotificationBadge())
      expect(result.current.hasUnread).toBe(false)
    })
  })

  describe('totalCount', () => {
    it('returns total notification count', () => {
      const { result } = renderHook(() => useNotificationBadge())
      expect(result.current.totalCount).toBe(3)
    })
  })

  describe('badgeText', () => {
    it('returns count as string when under 100', () => {
      mockGetUnreadCount.mockReturnValue(42)
      const { result } = renderHook(() => useNotificationBadge())
      expect(result.current.badgeText).toBe('42')
    })

    it('returns "99+" when over 99', () => {
      mockGetUnreadCount.mockReturnValue(100)
      const { result } = renderHook(() => useNotificationBadge())
      expect(result.current.badgeText).toBe('99+')
    })

    it('returns "99+" when exactly 100', () => {
      mockGetUnreadCount.mockReturnValue(100)
      const { result } = renderHook(() => useNotificationBadge())
      expect(result.current.badgeText).toBe('99+')
    })

    it('returns "0" when no unread', () => {
      mockGetUnreadCount.mockReturnValue(0)
      const { result } = renderHook(() => useNotificationBadge())
      expect(result.current.badgeText).toBe('0')
    })
  })

  describe('fetching', () => {
    it('fetches notifications on mount when never fetched', () => {
      renderHook(() => useNotificationBadge())
      expect(mockFetchNotifications).toHaveBeenCalled()
    })
  })
})
