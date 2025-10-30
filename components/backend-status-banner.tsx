'use client'

import { AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useBackendHealth } from '@/hooks/use-backend-health'

/**
 * Backend Status Banner
 *
 * Shows a banner when backend is unavailable or degraded
 * Automatically hides when backend is healthy
 *
 * @author Anderson Henrique da Silva
 * @date 2025-10-30
 */

export function BackendStatusBanner() {
  const health = useBackendHealth({ checkInterval: 30000 })

  // Don't show banner if backend is healthy
  if (health.status === 'healthy') {
    return null
  }

  const statusConfig = {
    checking: {
      icon: Loader2,
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
      iconColor: 'text-blue-600 dark:text-blue-400',
      title: 'Verificando conexão...',
      message: 'Conectando ao backend',
      animate: true
    },
    degraded: {
      icon: AlertTriangle,
      color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      title: 'Modo Limitado',
      message: 'Backend operando com limitações. Algumas funcionalidades podem estar indisponíveis.',
      animate: false
    },
    unavailable: {
      icon: XCircle,
      color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
      iconColor: 'text-red-600 dark:text-red-400',
      title: 'Backend Indisponível',
      message: 'Não foi possível conectar ao backend. Operando em modo demonstração com dados de exemplo.',
      animate: false
    },
    healthy: {
      icon: CheckCircle,
      color: '',
      iconColor: '',
      title: '',
      message: '',
      animate: false
    }
  }

  const config = statusConfig[health.status]
  const Icon = config.icon

  return (
    <div
      className={`w-full border-b-2 ${config.color} px-4 py-3 transition-all duration-300`}
      role="alert"
      aria-live="polite"
    >
      <div className="container mx-auto flex items-center gap-3">
        <Icon
          className={`w-5 h-5 ${config.iconColor} flex-shrink-0 ${
            config.animate ? 'animate-spin' : ''
          }`}
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{config.title}</p>
          <p className="text-xs mt-0.5 opacity-90">{config.message}</p>
        </div>

        {health.lastCheck && health.status === 'unavailable' && (
          <div className="text-xs opacity-70 hidden sm:block">
            Última verificação: {health.lastCheck.toLocaleTimeString('pt-BR')}
          </div>
        )}

        {health.error && health.status === 'unavailable' && (
          <div className="text-xs font-mono opacity-70 hidden md:block max-w-xs truncate">
            {health.error}
          </div>
        )}
      </div>
    </div>
  )
}
