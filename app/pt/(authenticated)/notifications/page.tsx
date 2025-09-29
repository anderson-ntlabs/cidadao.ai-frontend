'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Bell, Filter, Settings, CheckCheck, Trash2, 
  AlertCircle, Info, CheckCircle, AlertTriangle,
  Search, Brain, Shield, Loader2, ArrowLeft
} from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { NotificationItem } from '@/components/ui/notification-item'
import { LoadingScreen } from '@/components/loading-screen'
import { useNotificationStore } from '@/store/notification-store'
import type { NotificationType, NotificationPriority } from '@/types/notification'

export default function NotificationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all')
  const [selectedPriority, setSelectedPriority] = useState<NotificationPriority | 'all'>('all')
  
  const {
    notifications,
    isLoading,
    getStats,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
    fetchNotifications
  } = useNotificationStore()
  
  const stats = getStats()
  
  // Get user data
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])
  
  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (selectedType !== 'all' && notification.type !== selectedType) return false
    if (selectedPriority !== 'all' && notification.priority !== selectedPriority) return false
    return true
  })
  
  
  const typeConfig = {
    all: { label: 'Todas', icon: Bell, color: 'text-gray-600' },
    info: { label: 'Informação', icon: Info, color: 'text-blue-600' },
    success: { label: 'Sucesso', icon: CheckCircle, color: 'text-green-600' },
    warning: { label: 'Aviso', icon: AlertTriangle, color: 'text-yellow-600' },
    error: { label: 'Erro', icon: AlertCircle, color: 'text-red-600' },
    investigation: { label: 'Investigação', icon: Search, color: 'text-purple-600' },
    anomaly: { label: 'Anomalia', icon: AlertTriangle, color: 'text-orange-600' },
    agent: { label: 'Agente', icon: Brain, color: 'text-indigo-600' },
    system: { label: 'Sistema', icon: Shield, color: 'text-gray-600' }
  }
  
  return (
    <>
      <LoadingScreen />
      
      {/* Header */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Central de Notificações
            </h1>
            
            <div className="flex items-center gap-3">
              {stats.unread > 0 && (
                <Button variant="secondary" onClick={markAllAsRead}>
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Marcar todas como lidas
                </Button>
              )}
              
              {notifications.length > 0 && (
                <Button variant="ghost" onClick={clearNotifications}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar todas
                </Button>
              )}
              
              <Link href="/pt/settings#notifications">
                <Button variant="secondary">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Não lidas</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
                </div>
                <div className="relative">
                  <Bell className="w-8 h-8 text-blue-400" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Alta prioridade</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.byPriority.high + stats.byPriority.urgent}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Anomalias</p>
                  <p className="text-2xl font-bold text-red-600">{stats.byType.anomaly}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters */}
        <div className="mb-6">
          <Tabs defaultValue="all" onValueChange={(value) => setSelectedType(value as any)}>
            <TabsList className="w-full justify-start flex-wrap h-auto p-1">
              {Object.entries(typeConfig).map(([key, config]) => (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <config.icon className={`w-4 h-4 mr-2 ${config.color}`} />
                  {config.label}
                  {key !== 'all' && stats.byType[key as NotificationType] > 0 && (
                    <Badge size="sm" className="ml-2" variant="secondary">
                      {stats.byType[key as NotificationType]}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        {/* Notifications List */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => {
                      markAsRead(notification.id)
                      if (notification.actionUrl) {
                        router.push(notification.actionUrl)
                      }
                    }}
                    onDismiss={() => removeNotification(notification.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Nenhuma notificação
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {selectedType !== 'all' 
                    ? `Não há notificações do tipo "${typeConfig[selectedType].label}"`
                    : 'Você está em dia com tudo!'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}