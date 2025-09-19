export type NotificationType = 
  | 'info' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'investigation' 
  | 'anomaly' 
  | 'agent'
  | 'system'

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Notification {
  id: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  timestamp: Date
  read: boolean
  data?: Record<string, any>
  actionUrl?: string
  actionLabel?: string
  agentId?: string
  investigationId?: string
  anomalyScore?: number
}

export interface NotificationPreferences {
  enabled: boolean
  sound: boolean
  desktop: boolean
  email: boolean
  quietHours: {
    enabled: boolean
    start: string // HH:MM
    end: string   // HH:MM
  }
  types: {
    [key in NotificationType]: boolean
  }
}

export interface NotificationStats {
  total: number
  unread: number
  byType: {
    [key in NotificationType]: number
  }
  byPriority: {
    [key in NotificationPriority]: number
  }
}