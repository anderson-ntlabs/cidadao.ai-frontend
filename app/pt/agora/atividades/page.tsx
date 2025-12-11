'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  Activity,
  Calendar,
  Search,
  Download,
  RefreshCw,
  GraduationCap,
  MessageSquare,
} from 'lucide-react'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { PageHeader, PageLoading, PageContainer } from '@/components/agora'
import { Button } from '@/components/ui/button'
import { useAgora } from '@/hooks/use-agora'
import { userProfileService, type UserActivity } from '@/lib/services/user-profile.service'
import { logger } from '@/lib/utils/logger'
import { cn } from '@/lib/utils'
import { format, subDays } from 'date-fns'

/**
 * Agora Activities Page
 *
 * Real auth only - no demo mode.
 *
 * Author: Anderson Henrique da Silva
 * Updated: 2025-12-11 - Standardized layout with PageHeader/PageContainer
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

// Activity types
const activityTypes: Array<{ value: UserActivity['type']; label: string; icon: typeof Activity }> =
  [
    { value: 'chat', label: 'Conversas', icon: MessageSquare },
    { value: 'agent_interaction', label: 'Mentores', icon: GraduationCap },
    { value: 'export', label: 'Exportações', icon: Download },
    { value: 'settings_update', label: 'Configurações', icon: Calendar },
  ]

const timeRanges = [
  { value: '7d', label: 'Últimos 7 dias', days: 7 },
  { value: '30d', label: 'Últimos 30 dias', days: 30 },
  { value: '90d', label: 'Últimos 90 dias', days: 90 },
  { value: 'all', label: 'Todos', days: null },
]

function LoadingFallback() {
  return <PageLoading text="Carregando atividades..." />
}

function AtividadesContent() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAgora()

  const [activities, setActivities] = useState<UserActivity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<UserActivity[]>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<UserActivity['type'] | 'all'>('all')
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/pt/agora/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Load activities
  useEffect(() => {
    if (user) {
      loadActivities()
    }
  }, [user])

  // Filter activities
  useEffect(() => {
    filterActivities()
  }, [activities, searchQuery, selectedType, selectedTimeRange])

  const loadActivities = async () => {
    if (!user) return

    try {
      setIsLoadingActivities(true)
      const data = await userProfileService.getActivities(user.id)
      setActivities(data)
    } catch (error) {
      logger.error('Failed to load activities', { error })
    } finally {
      setIsLoadingActivities(false)
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

      await userProfileService.logActivity(
        user.id,
        'export',
        'Exportou histórico de atividades',
        `${filteredActivities.length} atividades exportadas`
      )
    } catch (error) {
      logger.error('Failed to export activities', { error })
    }
  }

  const handleRefresh = () => {
    loadActivities()
  }

  if (isLoading) {
    return <LoadingFallback />
  }

  if (!isAuthenticated || !user) {
    return <PageLoading text="Redirecionando para login..." />
  }

  return (
    <PageContainer background="operarios" maxWidth="5xl" padding="none">
      {/* Page Header */}
      <PageHeader
        backUrl="/pt/agora"
        title="Historico de Atividades"
        subtitle={`${filteredActivities.length} ${filteredActivities.length === 1 ? 'atividade' : 'atividades'} encontradas`}
        icon={Activity}
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoadingActivities}
            >
              <RefreshCw className={cn('w-4 h-4 mr-2', isLoadingActivities && 'animate-spin')} />
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
        }
      />

      <div className="py-6 px-4">
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
              isLoading={isLoadingActivities}
              emptyMessage={
                searchQuery || selectedType !== 'all'
                  ? 'Nenhuma atividade encontrada com os filtros aplicados'
                  : 'Nenhuma atividade registrada ainda. Comece a usar a Ágora!'
              }
              showFullTimestamp={true}
            />
          </GlassCardContent>
        </GlassCard>
      </div>
    </PageContainer>
  )
}

export default function AgoraAtividadesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AtividadesContent />
    </Suspense>
  )
}
