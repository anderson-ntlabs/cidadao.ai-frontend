import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Notification, NotificationPreferences, NotificationStats, NotificationType, NotificationPriority } from '@/types/notification'

interface NotificationStore {
  // State
  notifications: Notification[]
  preferences: NotificationPreferences
  isLoading: boolean
  lastFetch: Date | null
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  addNotifications: (notifications: Notification[]) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void
  
  // Getters
  getUnreadCount: () => number
  getStats: () => NotificationStats
  getNotificationsByType: (type: NotificationType) => Notification[]
  getNotificationsByPriority: (priority: NotificationPriority) => Notification[]
  
  // API
  fetchNotifications: () => Promise<void>
  setLoading: (loading: boolean) => void
}

const defaultPreferences: NotificationPreferences = {
  enabled: true,
  sound: true,
  desktop: true,
  email: false,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  },
  types: {
    info: true,
    success: true,
    warning: true,
    error: true,
    investigation: true,
    anomaly: true,
    agent: true,
    system: true
  }
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      notifications: [],
      preferences: defaultPreferences,
      isLoading: false,
      lastFetch: null,
      
      // Actions
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          read: false
        }
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications]
        }))
        
        // Play sound if enabled
        const { preferences } = get()
        if (preferences.enabled && preferences.sound && preferences.types[notification.type]) {
          playNotificationSound()
        }
        
        // Show desktop notification if enabled
        if (preferences.enabled && preferences.desktop && preferences.types[notification.type]) {
          showDesktopNotification(newNotification)
        }
      },
      
      addNotifications: (notifications) => {
        set((state) => {
          // Filter out any notifications that already exist
          const existingIds = new Set(state.notifications.map(n => n.id))
          const newNotifications = notifications.filter(n => !existingIds.has(n.id))
          
          return {
            notifications: [...newNotifications, ...state.notifications].sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )
          }
        })
      },
      
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          )
        }))
      },
      
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true }))
        }))
      },
      
      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id)
        }))
      },
      
      clearNotifications: () => {
        set({ notifications: [] })
      },
      
      updatePreferences: (newPreferences) => {
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences }
        }))
      },
      
      // Getters
      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.read).length
      },
      
      getStats: () => {
        const notifications = get().notifications
        const stats: NotificationStats = {
          total: notifications.length,
          unread: notifications.filter((n) => !n.read).length,
          byType: {} as any,
          byPriority: {} as any
        }
        
        // Initialize counters
        const types: NotificationType[] = ['info', 'success', 'warning', 'error', 'investigation', 'anomaly', 'agent', 'system']
        const priorities: NotificationPriority[] = ['low', 'medium', 'high', 'urgent']
        
        types.forEach(type => { stats.byType[type] = 0 })
        priorities.forEach(priority => { stats.byPriority[priority] = 0 })
        
        // Count notifications
        notifications.forEach((n) => {
          stats.byType[n.type]++
          stats.byPriority[n.priority]++
        })
        
        return stats
      },
      
      getNotificationsByType: (type) => {
        return get().notifications.filter((n) => n.type === type)
      },
      
      getNotificationsByPriority: (priority) => {
        return get().notifications.filter((n) => n.priority === priority)
      },
      
      // API
      fetchNotifications: async () => {
        set({ isLoading: true })
        
        try {
          // TODO: Replace with actual API call
          // const response = await fetch('/api/notifications')
          // const data = await response.json()
          // get().addNotifications(data)
          
          // For now, generate demo notifications
          const demoNotifications = generateDemoNotifications()
          get().addNotifications(demoNotifications)
          
          set({ lastFetch: new Date() })
        } catch (error) {
          console.error('Failed to fetch notifications:', error)
        } finally {
          set({ isLoading: false })
        }
      },
      
      setLoading: (loading) => set({ isLoading: loading })
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 100), // Keep only last 100
        preferences: state.preferences
      })
    }
  )
)

// Helper functions
function playNotificationSound() {
  try {
    const audio = new Audio('/sounds/notification.mp3')
    audio.volume = 0.5
    audio.play().catch(() => {})
  } catch (error) {
    console.error('Failed to play notification sound:', error)
  }
}

async function showDesktopNotification(notification: Notification) {
  if (!('Notification' in window)) return
  
  if (Notification.permission === 'granted') {
    try {
      const desktopNotif = new Notification(notification.title, {
        body: notification.message,
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: notification.id,
        renotify: notification.priority === 'urgent'
      })
      
      desktopNotif.onclick = () => {
        window.focus()
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl
        }
      }
    } catch (error) {
      console.error('Failed to show desktop notification:', error)
    }
  } else if (Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

// Demo data generator
function generateDemoNotifications(): Notification[] {
  // Only generate demo data on client side
  if (typeof window === 'undefined') {
    return []
  }
  
  // Use current time for realistic timestamps
  const now = new Date()
  const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).substr(2)
  
  return [
    {
      id: `demo-1-${uniqueSuffix}`,
      type: 'investigation',
      priority: 'high',
      title: 'Nova Investigação Iniciada',
      message: 'Zumbi dos Palmares detectou possível anomalia em contrato público',
      timestamp: new Date(now.getTime() - 5 * 60 * 1000), // 5 min ago
      read: false,
      investigationId: 'inv-123',
      agentId: 'zumbi',
      actionUrl: '/pt/dashboard',
      actionLabel: 'Ver Detalhes'
    },
    {
      id: `demo-2-${uniqueSuffix}`,
      type: 'anomaly',
      priority: 'urgent',
      title: 'Anomalia Crítica Detectada',
      message: 'Score de anomalia 0.95 em licitação de R$ 2.5M',
      timestamp: new Date(now.getTime() - 15 * 60 * 1000), // 15 min ago
      read: false,
      anomalyScore: 0.95,
      data: { contractId: 'LC-2024-001' }
    },
    {
      id: `demo-3-${uniqueSuffix}`,
      type: 'success',
      priority: 'low',
      title: 'Análise Concluída',
      message: 'Anita Garibaldi finalizou análise de padrões mensais',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
      agentId: 'anita'
    },
    {
      id: `demo-4-${uniqueSuffix}`,
      type: 'system',
      priority: 'medium',
      title: 'Atualização do Sistema',
      message: 'Nova versão dos agentes de IA disponível',
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true
    }
  ]
}