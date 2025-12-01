'use client'

import { useState, useEffect } from 'react'
import { logger } from '@/lib/utils/logger'
import { getSecureApiUrl } from '@/lib/utils/ensure-https'

/**
 * Backend Health Check Hook
 *
 * Monitors backend availability and provides real-time status
 *
 * @author Anderson Henrique da Silva
 * @date 2025-10-30
 */

export type BackendStatus = 'healthy' | 'degraded' | 'unavailable' | 'checking'

export interface BackendHealthState {
  status: BackendStatus
  isAvailable: boolean
  lastCheck: Date | null
  error: string | null
  responseTime: number | null
}

interface UseBackendHealthOptions {
  checkInterval?: number // ms between checks (default: 30000 = 30s)
  timeout?: number // request timeout (default: 5000 = 5s)
  enabled?: boolean // enable/disable checks (default: true)
}

export function useBackendHealth(options: UseBackendHealthOptions = {}) {
  const { checkInterval = 30000, timeout = 5000, enabled = true } = options

  const [health, setHealth] = useState<BackendHealthState>({
    status: 'checking',
    isAvailable: false,
    lastCheck: null,
    error: null,
    responseTime: null,
  })

  useEffect(() => {
    if (!enabled) {
      return
    }

    const checkHealth = async () => {
      const startTime = Date.now()

      try {
        logger.debug('Backend Health: Starting health check')

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        // Try multiple endpoints in order of importance
        // Use trailing slash to avoid 307 redirect that causes Mixed Content
        const endpoints = [
          '/health/', // Backend health endpoint (returns 200)
          '/', // Root endpoint (returns 200)
          '/api/v1/investigations/', // Investigations endpoint (might return 401)
        ]

        let lastError: Error | null = null
        let succeeded = false

        for (const endpoint of endpoints) {
          try {
            // Always use HTTPS to prevent Mixed Content errors
            const apiUrl = getSecureApiUrl()

            const response = await fetch(`${apiUrl}${endpoint}`, {
              method: 'GET',
              signal: controller.signal,
              headers: {
                Accept: 'application/json',
              },
            })

            clearTimeout(timeoutId)
            const responseTime = Date.now() - startTime

            // Consider 2xx and 401/403 as "available" (403 means backend is up, just auth issue)
            if (response.ok || response.status === 401 || response.status === 403) {
              succeeded = true

              setHealth({
                status: response.ok ? 'healthy' : 'degraded',
                isAvailable: true,
                lastCheck: new Date(),
                error: null,
                responseTime,
              })

              logger.debug('Backend Health: Check succeeded', {
                endpoint,
                status: response.status,
                responseTime,
              })

              break
            } else {
              lastError = new Error(`HTTP ${response.status}`)
            }
          } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err))
          }
        }

        if (!succeeded && lastError) {
          throw lastError
        }
      } catch (error: any) {
        const responseTime = Date.now() - startTime
        const errorMessage =
          error.name === 'AbortError' ? 'Request timeout' : error.message || 'Unknown error'

        logger.error(error instanceof Error ? error : new Error(String(error)), {
          context: 'Backend Health Check',
        })

        setHealth({
          status: 'unavailable',
          isAvailable: false,
          lastCheck: new Date(),
          error: errorMessage,
          responseTime,
        })
      }
    }

    // Initial check
    checkHealth()

    // Periodic checks
    const intervalId = setInterval(checkHealth, checkInterval)

    return () => {
      clearInterval(intervalId)
    }
  }, [checkInterval, timeout, enabled])

  return health
}

/**
 * Hook to check if backend is currently available
 * Simplified version that just returns boolean
 */
export function useIsBackendAvailable(options: UseBackendHealthOptions = {}): boolean {
  const health = useBackendHealth(options)
  return health.isAvailable
}
