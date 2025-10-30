import { useEffect, useCallback, useRef } from 'react'
import { useBackendInvestigations } from './use-backend-investigations'
import { useNotificationStore } from '@/store/notification-store'
import type { InvestigationStatusResponse } from '@/lib/api/investigation-adapter'

/**
 * Investigation Notifications Hook
 *
 * Monitors investigations and shows toast notifications for status changes
 * Automatically tracks new investigations, completions, and failures
 *
 * @author Anderson Henrique da Silva
 * @date 2025-10-30
 */

interface UseInvestigationNotificationsOptions {
  enabled?: boolean
  pollingInterval?: number
}

export function useInvestigationNotifications(
  options: UseInvestigationNotificationsOptions = {}
) {
  const { enabled = true, pollingInterval = 5000 } = options
  const addNotification = useNotificationStore(state => state.addNotification)

  const { investigations, isLoading } = useBackendInvestigations({
    autoRefresh: enabled,
    refreshInterval: pollingInterval
  })

  // Track previous investigations state
  const prevInvestigationsRef = useRef<Map<string, InvestigationStatusResponse>>(new Map())

  const notifyStatusChange = useCallback((
    investigation: InvestigationStatusResponse,
    previousStatus?: string
  ) => {
    const invId = investigation.investigation_id.slice(0, 8)

    // New investigation
    if (!previousStatus) {
      addNotification({
        type: 'investigation',
        priority: 'medium',
        title: 'Nova Investigação',
        message: `Investigação ${invId} iniciada`,
        investigationId: investigation.investigation_id
      })
      return
    }

    // Status changed to completed
    if (investigation.status === 'completed' && previousStatus !== 'completed') {
      addNotification({
        type: 'investigation',
        priority: 'high',
        title: 'Investigação Concluída',
        message: `${investigation.anomalies_detected} anomalias detectadas em ${investigation.records_processed.toLocaleString('pt-BR')} registros`,
        investigationId: investigation.investigation_id,
        actionUrl: `/pt/app/investigacoes/${investigation.investigation_id}`,
        actionLabel: 'Ver Detalhes',
        anomalyScore: investigation.anomalies_detected
      })
      return
    }

    // Status changed to failed
    if (investigation.status === 'failed' && previousStatus !== 'failed') {
      addNotification({
        type: 'error',
        priority: 'high',
        title: 'Investigação Falhou',
        message: `Investigação ${invId} encontrou um erro durante o processamento`,
        investigationId: investigation.investigation_id
      })
      return
    }

    // Significant progress update (only for running investigations)
    if (
      investigation.status === 'running' &&
      previousStatus === 'running' &&
      investigation.progress > 0.5 &&
      investigation.progress < 0.99
    ) {
      const prevProgress = prevInvestigationsRef.current.get(investigation.investigation_id)?.progress || 0

      // Notify at 50%, 75%, 90%
      const milestones = [0.5, 0.75, 0.9]
      const currentMilestone = milestones.find(m =>
        investigation.progress >= m && prevProgress < m
      )

      if (currentMilestone) {
        addNotification({
          type: 'investigation',
          priority: 'low',
          title: 'Progresso da Investigação',
          message: `${Math.round(currentMilestone * 100)}% concluído - ${investigation.current_phase}`,
          investigationId: investigation.investigation_id
        })
      }
    }
  }, [addNotification])

  useEffect(() => {
    if (!enabled || isLoading) return

    // Create current state map
    const currentInvestigations = new Map(
      investigations.map(inv => [inv.investigation_id, inv])
    )

    // Check for changes
    investigations.forEach(investigation => {
      const previous = prevInvestigationsRef.current.get(investigation.investigation_id)

      if (!previous) {
        // New investigation
        notifyStatusChange(investigation)
      } else if (previous.status !== investigation.status) {
        // Status changed
        notifyStatusChange(investigation, previous.status)
      } else if (
        previous.status === 'running' &&
        investigation.status === 'running' &&
        Math.abs(investigation.progress - previous.progress) >= 0.25
      ) {
        // Significant progress
        notifyStatusChange(investigation, previous.status)
      }
    })

    // Update ref
    prevInvestigationsRef.current = currentInvestigations

  }, [investigations, isLoading, enabled, notifyStatusChange])

  return {
    investigations,
    isLoading
  }
}
