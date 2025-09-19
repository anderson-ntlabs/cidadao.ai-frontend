'use client'

import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Badge } from './badge'
import { 
  Bell, Info, CheckCircle, AlertCircle, AlertTriangle, 
  Search, Brain, Shield, Zap, X 
} from 'lucide-react'
import type { Notification, NotificationType } from '@/types/notification'

interface NotificationItemProps {
  notification: Notification
  onClick?: () => void
  onDismiss?: () => void
}

const typeIcons: Record<NotificationType, React.ReactNode> = {
  info: <Info className="w-5 h-5" />,
  success: <CheckCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />,
  investigation: <Search className="w-5 h-5" />,
  anomaly: <AlertTriangle className="w-5 h-5" />,
  agent: <Brain className="w-5 h-5" />,
  system: <Shield className="w-5 h-5" />
}

const typeColors: Record<NotificationType, string> = {
  info: 'text-blue-600 dark:text-blue-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400',
  investigation: 'text-purple-600 dark:text-purple-400',
  anomaly: 'text-orange-600 dark:text-orange-400',
  agent: 'text-indigo-600 dark:text-indigo-400',
  system: 'text-gray-600 dark:text-gray-400'
}

const priorityBadgeVariant = {
  low: 'secondary' as const,
  medium: 'outline' as const,
  high: 'warning' as const,
  urgent: 'destructive' as const
}

export function NotificationItem({ notification, onClick, onDismiss }: NotificationItemProps) {
  const timeAgo = formatDistanceToNow(new Date(notification.timestamp), { 
    addSuffix: true,
    locale: ptBR 
  })
  
  return (
    <div
      className={cn(
        "relative group p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer",
        !notification.read && "bg-blue-50/50 dark:bg-blue-900/10"
      )}
      onClick={onClick}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
      )}
      
      <div className="flex gap-3">
        {/* Icon */}
        <div className={cn("flex-shrink-0 mt-0.5", typeColors[notification.type])}>
          {typeIcons[notification.type]}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className={cn(
                "font-medium text-sm",
                !notification.read && "font-semibold"
              )}>
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                {notification.message}
              </p>
            </div>
            
            {/* Priority badge */}
            {notification.priority !== 'low' && (
              <Badge 
                variant={priorityBadgeVariant[notification.priority]} 
                size="sm"
              >
                {notification.priority === 'urgent' ? 'Urgente' : 
                 notification.priority === 'high' ? 'Alta' : 'Média'}
              </Badge>
            )}
          </div>
          
          {/* Metadata */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-500">
            <span>{timeAgo}</span>
            {notification.agentId && (
              <>
                <span>•</span>
                <span className="capitalize">{notification.agentId}</span>
              </>
            )}
            {notification.anomalyScore && (
              <>
                <span>•</span>
                <span>Score: {(notification.anomalyScore * 100).toFixed(0)}%</span>
              </>
            )}
          </div>
          
          {/* Action button */}
          {notification.actionUrl && notification.actionLabel && (
            <button 
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={(e) => {
                e.stopPropagation()
                window.location.href = notification.actionUrl!
              }}
            >
              {notification.actionLabel} →
            </button>
          )}
        </div>
        
        {/* Dismiss button */}
        {onDismiss && (
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            onClick={(e) => {
              e.stopPropagation()
              onDismiss()
            }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}