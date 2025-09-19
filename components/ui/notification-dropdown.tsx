'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Bell, Settings, CheckCheck, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { NotificationBadge } from './notification-badge'
import { NotificationItem } from './notification-item'
import { useNotificationStore } from '@/store/notification-store'

interface NotificationDropdownProps {
  locale: 'pt' | 'en'
}

export function NotificationDropdown({ locale }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const {
    notifications,
    isLoading,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    fetchNotifications
  } = useNotificationStore()
  
  const unreadCount = getUnreadCount()
  const recentNotifications = notifications.slice(0, 5)
  
  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Fetch notifications on mount (client-side only)
  useEffect(() => {
    if (isMounted) {
      fetchNotifications()
    }
  }, [isMounted, fetchNotifications])
  
  // Polling for new notifications (every 30 seconds)
  useEffect(() => {
    if (!isMounted) return
    
    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [isMounted, fetchNotifications])
  
  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id)
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
    setIsOpen(false)
  }
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={locale === 'pt' ? 'Notificações' : 'Notifications'}
      >
        <Bell className="w-5 h-5" />
        {isMounted && <NotificationBadge count={unreadCount} />}
      </Button>
      
      {/* Dropdown */}
      {isOpen && (
        <div className={cn(
          "absolute right-0 mt-2 w-96 max-h-[600px] bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold">
              {locale === 'pt' ? 'Notificações' : 'Notifications'}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  <CheckCheck className="w-4 h-4" />
                  {locale === 'pt' ? 'Marcar todas como lidas' : 'Mark all as read'}
                </button>
              )}
              <Link href={`/${locale}/settings`}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : recentNotifications.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {recentNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onDismiss={() => removeNotification(notification.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">
                  {locale === 'pt' 
                    ? 'Nenhuma notificação no momento' 
                    : 'No notifications at the moment'}
                </p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-800 p-3">
              <Link 
                href={`/${locale}/notifications`}
                className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {locale === 'pt' ? 'Ver todas as notificações' : 'View all notifications'}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}