'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Activity, Filter, Calendar, Search, Download, RefreshCw } from 'lucide-react'
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-supabase-auth'
import {
  userProfileService,
  type UserActivity,
  type ActivityFilters,
} from '@/lib/services/user-profile.service'
import { logger } from '@/lib/utils/logger'
import { cn } from '@/lib/utils'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

/**
 * Página de Atividades
 *
 * Histórico completo de atividades do usuário com filtros e busca
 */

const activityTypes: Array<{ value: UserActivity['type']; label: string }> = [
  { value: 'chat', label: 'Conversas' },
  { value: 'investigation', label: 'Investigações' },
  { value: 'agent_interaction', label: 'Agentes IA' },
  { value: 'export', label: 'Exportações' },
  { value: 'settings_update', label: 'Configurações' },
]

const timeRanges = [
  { value: '7d', label: 'Últimos 7 dias', days: 7 },
  { value: '30d', label: 'Últimos 30 dias', days: 30 },
  { value: '90d', label: 'Últimos 90 dias', days: 90 },
  { value: 'all', label: 'Todos', days: null },
]

export default function AtividadesPage() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<UserActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<UserActivity['type'] | 'all'>('all')
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [showFilters, setShowFilters] = useState(false)

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
      const data = await userProfileService.getActivities(user.id)
      setActivities(data)
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
      a.download = `atividades-${format(new Date(), 'yyyy-MM-dd')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Log export activity
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

  if (!user) {
    return null
  }

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

      <div className="relative z-10 max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Activity className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Histórico de Atividades
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {filteredActivities.length}{' '}
                  {filteredActivities.length === 1 ? 'atividade' : 'atividades'} encontradas
                </p>
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

          {/* Filters */}
          <div className="space-y-4">
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
                        ? 'bg-purple-600 text-white'
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
                    ? 'bg-purple-600 text-white'
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
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    selectedType === type.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
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
                  : 'Nenhuma atividade registrada ainda'
              }
              showFullTimestamp={true}
            />
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  )
}
