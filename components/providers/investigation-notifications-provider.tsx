'use client'

import { useInvestigationNotifications } from '@/hooks/use-investigation-notifications'

/**
 * Investigation Notifications Provider
 *
 * Global provider that monitors investigations and shows notifications
 * Mount this in the root layout to enable notifications app-wide
 *
 * @author Anderson Henrique da Silva
 * @date 2025-10-30
 */

interface InvestigationNotificationsProviderProps {
  children: React.ReactNode
  enabled?: boolean
}

export function InvestigationNotificationsProvider({
  children,
  enabled = true
}: InvestigationNotificationsProviderProps) {
  // This hook runs in background and shows notifications
  useInvestigationNotifications({ enabled })

  return <>{children}</>
}
