'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  Activity,
  Calendar,
  Search,
  Download,
  RefreshCw,
  GraduationCap,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { useAgoraAuth } from '@/hooks/use-agora-auth'
import { useAgoraDemo } from '@/hooks/use-agora-demo'
import { userProfileService, type UserActivity } from '@/lib/services/user-profile.service'
import { logger } from '@/lib/utils/logger'
import { cn } from '@/lib/utils'
import { format, subDays } from 'date-fns'

/**
 * Agora Activities Page
 *
 * Copied from app/pt/app/atividades/page.tsx and adapted for Agora.
 * Shows activity history for learning progress, XP gains, etc.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-07
 */

// Lazy load the heavy ActivityTimeline component
const ActivityTimeline = dynamic(
  () => import('@/components/activity').then((mod) => ({ default: mod.ActivityTimeline })),
  {
    loading: () => (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
        ))}
      </div>
    ),
    ssr: false,
  }
)

// Agora-specific activity types
const activityTypes: Array<{ value: UserActivity['type']; label: string; icon: typeof Activity }> =
  [
    { value: 'chat', label: 'Conversas', icon: MessageSquare },
    { value: 'agent_interaction', label: 'Mentores', icon: GraduationCap },
    { value: 'export', label: 'Exportacoes', icon: Download },
    { value: 'settings_update', label: 'Configuracoes', icon: Calendar },
  ]

const timeRanges = [
  { value: '7d', label: 'Ultimos 7 dias', days: 7 },
  { value: '30d', label: 'Ultimos 30 dias', days: 30 },
  { value: '90d', label: 'Ultimos 90 dias', days: 90 },
  { value: 'all', label: 'Todos', days: null },
]

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">Carregando atividades...</p>
      </div>
    </div>
  )
}

function AtividadesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDemoMode = searchParams.get('demo') === 'true'

  const realAuth = useAgoraAuth()
  const demoAuth = useAgoraDemo()

  const isRealAuth = !isDemoMode && realAuth.isAuthenticated
  const user = isRealAuth ? realAuth.user : demoAuth.user
  const isAuthLoading = isDemoMode ? demoAuth.isLoading : realAuth.isLoading

  const [activities, setActivities] = useState<UserActivity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<UserActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<UserActivity['type'] | 'all'>('all')
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')

  useEffect(() => {
    if (!isDemoMode && !realAuth.isLoading && !realAuth.isAuthenticated) {
      router.replace('/pt/agora/login')
    }
  }, [isDemoMode, realAuth.isLoading, realAuth.isAuthenticated, router])

  useEffect(() => {
    if (user) {
      loadActivities()
    }
  }, [user])

  useEffect(() => {
    filterActivities()
  }, [activities, searchQuery, selectedType, selectedTimeRange])

  const loadActivities = async () => {
    if (!user) return

    try {
      setIsLoading(true)

      if (isDemoMode) {
        // Generate demo activities
        const demoActivities: UserActivity[] = [
          {
            id: '1',
            user_id: user.id,
            type: 'chat',
            title: 'Conversa com Tiradentes',
            description: 'Discutiu sobre a Inconfidencia Mineira',
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            user_id: user.id,
            type: 'agent_interaction',
            title: 'Novo badge: Curioso',
            description: 'Fez 10 perguntas aos mentores',
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: '3',
            user_id: user.id,
            type: 'chat',
            title: 'Conversa com Dandara',
            description: 'Aprendeu sobre resistencia quilombola',
            created_at: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: '4',
            user_id: user.id,
            type: 'settings_update',
            title: 'Configuracoes atualizadas',
            description: 'Alterou preferencias de acessibilidade',
            created_at: new Date(Date.now() - 259200000).toISOString(),
          },
        ]
        setActivities(demoActivities)
      } else {
        const data = await userProfileService.getActivities(user.id)
        setActivities(data)
      }
    } catch (error) {
      logger.error('Failed to load activities', { error })
    } finally {
      setIsLoading(false)
    }
  }

  const filterActivities = () => {
    let filtered = [...activities]

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter((a) => a.type === selectedType)
    }

    // Filter by time range
    const range = timeRanges.find((r) => r.value === selectedTimeRange)
    if (range && range.days) {
      const cutoffDate = subDays(new Date(), range.days)
      filtered = filtered.filter((a) => new Date(a.created_at) >= cutoffDate)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (a) => a.title.toLowerCase().includes(query) || a.description?.toLowerCase().includes(query)
      )
    }

    setFilteredActivities(filtered)
  }

  const handleExport = async () => {
    if (!user) return

    try {
      const data = JSON.stringify(filteredActivities, null, 2)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `atividades-agora-${format(new Date(), 'yyyy-MM-dd')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      if (!isDemoMode) {
        await userProfileService.logActivity(
          user.id,
          'export',
          'Exportou historico de atividades',
          `${filteredActivities.length} atividades exportadas`
        )
      }
    } catch (error) {
      logger.error('Failed to export activities', { error })
    }
  }

  const handleRefresh = () => {
    loadActivities()
  }

  if (isAuthLoading) {
    return <LoadingFallback />
  }

  // If not authenticated and not in demo mode, show login prompt instead of blank page
  if (!isDemoMode && !realAuth.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Acesso Restrito
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Faça login para ver seu histórico de atividades na Ágora.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/pt/agora/login"
              className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors"
            >
              Fazer Login
            </Link>
            <Link
              href="/pt/agora/atividades?demo=true"
              className="w-full py-3 px-6 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
            >
              Explorar em modo demo
            </Link>
          </div>
        </div>
      </div>
    )
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
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={buildUrl('/pt/agora')}
                className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Historico de Atividades
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {filteredActivities.length}{' '}
                    {filteredActivities.length === 1 ? 'atividade' : 'atividades'} encontradas
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')} />
                Atualizar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExport}
                disabled={filteredActivities.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto py-8 px-4">
        {/* Filters */}
        <div className="space-y-4 mb-8">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar atividades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Time Range */}
            <div className="flex gap-2">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setSelectedTimeRange(range.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    selectedTimeRange === range.value
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

            {/* Type Filters */}
            <button
              onClick={() => setSelectedType('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                selectedType === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              Todos
            </button>
            {activityTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1',
                  selectedType === type.value
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                <type.icon className="w-4 h-4" />
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activities Timeline */}
        <GlassCard>
          <GlassCardContent className="p-6">
            <ActivityTimeline
              activities={filteredActivities}
              isLoading={isLoading}
              emptyMessage={
                searchQuery || selectedType !== 'all'
                  ? 'Nenhuma atividade encontrada com os filtros aplicados'
                  : 'Nenhuma atividade registrada ainda. Comece a usar a Agora!'
              }
              showFullTimestamp={true}
            />
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  )
}

export default function AgoraAtividadesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AtividadesContent />
    </Suspense>
  )
}
