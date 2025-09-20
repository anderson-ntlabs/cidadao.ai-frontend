'use client'

import { useEffect, useRef } from 'react'

interface AnnouncerProps {
  message: string
  priority?: 'polite' | 'assertive'
  className?: string
}

export function Announcer({ 
  message, 
  priority = 'polite',
  className = '' 
}: AnnouncerProps) {
  const announcerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (announcerRef.current && message) {
      // Clear and re-set the message to ensure it's announced
      announcerRef.current.textContent = ''
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = message
        }
      }, 100)
    }
  }, [message])

  return (
    <div
      ref={announcerRef}
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className={`sr-only ${className}`}
    />
  )
}

// Hook for programmatic announcements
export function useAnnouncer() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('role', 'status')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  return { announce }
}