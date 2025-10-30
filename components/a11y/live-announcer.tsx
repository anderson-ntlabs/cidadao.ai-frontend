/**
 * Live Announcer Component
 *
 * Provides ARIA live regions for announcing dynamic content changes
 * to screen reader users without interrupting their current focus.
 *
 * Features:
 * - Queue system for multiple announcements
 * - Priority levels (polite, assertive)
 * - Automatic cleanup of old announcements
 * - Hook-based API for easy integration
 *
 * @author Anderson Henrique da Silva
 * @date 2025-01-30
 */

'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

export type AnnouncementPriority = 'polite' | 'assertive'

export interface Announcement {
  id: string
  message: string
  priority: AnnouncementPriority
  timestamp: number
}

interface LiveAnnouncerContextType {
  announce: (message: string, priority?: AnnouncementPriority) => void
  clear: () => void
}

const LiveAnnouncerContext = createContext<LiveAnnouncerContextType | null>(null)

/**
 * Hook to access the live announcer from any component
 *
 * @example
 * ```tsx
 * const { announce } = useLiveAnnouncer()
 *
 * // Polite announcement (default)
 * announce('Data loaded successfully')
 *
 * // Assertive announcement (interrupts screen reader)
 * announce('Error: Action failed', 'assertive')
 * ```
 */
export function useLiveAnnouncer() {
  const context = useContext(LiveAnnouncerContext)

  if (!context) {
    throw new Error('useLiveAnnouncer must be used within LiveAnnouncerProvider')
  }

  return context
}

interface LiveAnnouncerProviderProps {
  children: React.ReactNode
  /**
   * Maximum number of announcements to keep in queue
   * @default 5
   */
  maxAnnouncements?: number
  /**
   * Time in ms to keep announcements before auto-cleanup
   * @default 5000
   */
  announcementLifetime?: number
}

/**
 * Provider component that manages live announcements
 *
 * Should be placed high in the component tree, typically in the root layout
 */
export function LiveAnnouncerProvider({
  children,
  maxAnnouncements = 5,
  announcementLifetime = 5000
}: LiveAnnouncerProviderProps) {
  const [politeAnnouncements, setPoliteAnnouncements] = useState<Announcement[]>([])
  const [assertiveAnnouncements, setAssertiveAnnouncements] = useState<Announcement[]>([])
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
      timeoutRefs.current.clear()
    }
  }, [])

  const announce = useCallback((message: string, priority: AnnouncementPriority = 'polite') => {
    const announcement: Announcement = {
      id: `announcement-${Date.now()}-${Math.random()}`,
      message,
      priority,
      timestamp: Date.now()
    }

    const setAnnouncements = priority === 'polite'
      ? setPoliteAnnouncements
      : setAssertiveAnnouncements

    setAnnouncements(prev => {
      // Add new announcement and keep only the last N announcements
      const updated = [...prev, announcement].slice(-maxAnnouncements)
      return updated
    })

    // Auto-cleanup after lifetime expires
    const timeout = setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== announcement.id))
      timeoutRefs.current.delete(announcement.id)
    }, announcementLifetime)

    timeoutRefs.current.set(announcement.id, timeout)
  }, [maxAnnouncements, announcementLifetime])

  const clear = useCallback(() => {
    setPoliteAnnouncements([])
    setAssertiveAnnouncements([])
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
    timeoutRefs.current.clear()
  }, [])

  return (
    <LiveAnnouncerContext.Provider value={{ announce, clear }}>
      {children}

      {/* ARIA Live Regions */}
      <div className="sr-only">
        {/* Polite: Waits for user to pause before announcing */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {politeAnnouncements.map(announcement => (
            <div key={announcement.id}>
              {announcement.message}
            </div>
          ))}
        </div>

        {/* Assertive: Interrupts screen reader immediately */}
        <div
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          {assertiveAnnouncements.map(announcement => (
            <div key={announcement.id}>
              {announcement.message}
            </div>
          ))}
        </div>
      </div>
    </LiveAnnouncerContext.Provider>
  )
}

/**
 * Convenience hook for common announcement patterns
 */
export function useAnnouncementHelpers() {
  const { announce } = useLiveAnnouncer()

  return {
    announceLoading: (entity: string) =>
      announce(`Loading ${entity}...`, 'polite'),

    announceSuccess: (action: string) =>
      announce(`${action} completed successfully`, 'polite'),

    announceError: (error: string) =>
      announce(`Error: ${error}`, 'assertive'),

    announceNavigation: (destination: string) =>
      announce(`Navigated to ${destination}`, 'polite'),

    announceCount: (count: number, entity: string) =>
      announce(`${count} ${entity}${count !== 1 ? 's' : ''} found`, 'polite'),
  }
}
