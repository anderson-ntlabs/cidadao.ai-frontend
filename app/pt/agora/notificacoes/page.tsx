'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Bell,
  Settings,
  CheckCheck,
  Trash2,
  AlertCircle,
  Info,
  AlertTriangle,
  GraduationCap,
  Trophy,
  Sparkles,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NotificationItem } from '@/components/ui/notification-item'
import { useNotificationStore } from '@/store/notification-store'
import { useAgoraAuth } from '@/hooks/use-agora-auth'
import { useAgoraDemo } from '@/hooks/use-agora-demo'
import type { NotificationType } from '@/types/notification'

/**
 * Agora Notifications Page
 *
 * Copied from app/pt/app/notificacoes/page.tsx and adapted for Agora.
 * Shows notifications related to learning progress, XP, achievements.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-07
 */

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">Carregando notificacoes...</p>
      </div>
    </div>
  )
}

function NotificacoesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDemoMode = searchParams.get('demo') === 'true'

  const realAuth = useAgoraAuth()
  const demoAuth = useAgoraDemo()

  const isRealAuth = !isDemoMode && realAuth.isAuthenticated
  const _user = isRealAuth ? realAuth.user : demoAuth.user // Reserved for future user-specific notifications
  const isLoading = isDemoMode ? demoAuth.isLoading : realAuth.isLoading

  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all')

  const {
    notifications,
    isLoading: notificationsLoading,
    getStats,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
  } = useNotificationStore()

  const stats = getStats()

  useEffect(() => {
    if (!isDemoMode && !realAuth.isLoading && !realAuth.isAuthenticated) {
      router.replace('/pt/agora/login')
    }
  }, [isDemoMode, realAuth.isLoading, realAuth.isAuthenticated, router])

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    if (selectedType !== 'all' && notification.type !== selectedType) return false
    return true
  })

  // Agora-specific notification types
  const typeConfig = {
    all: { label: 'Todas', icon: Bell, color: 'text-gray-600' },
    info: { label: 'Informacao', icon: Info, color: 'text-blue-600' },
    success: { label: 'Conquista', icon: Trophy, color: 'text-green-600' },
    warning: { label: 'Aviso', icon: AlertTriangle, color: 'text-yellow-600' },
    error: { label: 'Erro', icon: AlertCircle, color: 'text-red-600' },
    agent: { label: 'Mentores', icon: GraduationCap, color: 'text-purple-600' },
    system: { label: 'Sistema', icon: Sparkles, color: 'text-indigo-600' },
  }

  if (isLoading) {
    return <LoadingFallback />
  }

  if (!isDemoMode && !realAuth.isAuthenticated) {
    return <LoadingFallback />
  }

  const buildUrl = (path: string) => `${path}${isDemoMode ? '?demo=true' : ''}`

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('/operarios.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.03,
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-green-50/50 via-transparent to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20" />

      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={buildUrl('/pt/agora')}
                className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h1 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                    Notificacoes
                  </h1>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Acompanhe seu progresso na Agora
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {stats.unread > 0 && (
                <Button variant="secondary" size="sm" onClick={markAllAsRead}>
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Marcar todas como lidas
                </Button>
              )}

              {notifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearNotifications}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              )}

              <Link href={buildUrl('/pt/agora/configuracoes')}>
                <Button variant="secondary" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <GlassCard>
            <GlassCardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard>
            <GlassCardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Nao lidas</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
                </div>
                <div className="relative">
                  <Bell className="w-8 h-8 text-blue-400" />
                  {stats.unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard>
            <GlassCardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Conquistas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.byType.success || 0}</p>
                </div>
                <Trophy className="w-8 h-8 text-green-400" />
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard>
            <GlassCardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mentores</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.byType.agent || 0}</p>
                </div>
                <GraduationCap className="w-8 h-8 text-purple-400" />
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Tabs defaultValue="all" onValueChange={(value) => setSelectedType(value as any)}>
            <TabsList className="w-full justify-start flex-wrap h-auto p-1 bg-white/50 dark:bg-gray-800/50">
              {Object.entries(typeConfig).map(([key, config]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <config.icon className={`w-4 h-4 mr-2 ${config.color}`} />
                  {config.label}
                  {key !== 'all' && (stats.byType[key as NotificationType] || 0) > 0 && (
                    <Badge size="sm" className="ml-2" variant="secondary">
                      {stats.byType[key as NotificationType] || 0}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Notifications List */}
        <GlassCard>
          <GlassCardContent className="p-0">
            {notificationsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
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
                <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Nenhuma notificacao
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {selectedType !== 'all'
                    ? `Nao ha notificacoes do tipo "${typeConfig[selectedType as keyof typeof typeConfig]?.label || selectedType}"`
                    : 'Voce esta em dia com tudo!'}
                </p>
              </div>
            )}
          </GlassCardContent>
        </GlassCard>
      </main>
    </div>
  )
}

export default function AgoraNotificacoesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NotificacoesContent />
    </Suspense>
  )
}
