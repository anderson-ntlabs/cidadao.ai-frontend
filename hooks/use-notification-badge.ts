'use client'

import { useEffect } from 'react'
import { useNotificationStore } from '@/store/notification-store'

/**
 * Hook to get real-time notification badge count
 *
 * This hook connects to the notification store and returns
 * the actual unread count instead of hardcoded values.
 *
 * @example
 * ```tsx
 * const { unreadCount, hasUnread } = useNotificationBadge()
 * ```
 */
export function useNotificationBadge() {
  const notifications = useNotificationStore((state) => state.notifications)
  const getUnreadCount = useNotificationStore((state) => state.getUnreadCount)
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications)
  const lastFetch = useNotificationStore((state) => state.lastFetch)

  // Fetch notifications on mount if not already fetched
  useEffect(() => {
    // Only fetch if we haven't fetched in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const shouldFetch = !lastFetch || new Date(lastFetch) < fiveMinutesAgo

    if (shouldFetch) {
      fetchNotifications()
    }
  }, [fetchNotifications, lastFetch])

  const unreadCount = getUnreadCount()

  return {
    /** Number of unread notifications */
    unreadCount,
    /** Whether there are any unread notifications */
    hasUnread: unreadCount > 0,
    /** Total number of notifications */
    totalCount: notifications.length,
    /** Display text for badge (shows "99+" if over 99) */
    badgeText: unreadCount > 99 ? '99+' : unreadCount.toString(),
  }
}
