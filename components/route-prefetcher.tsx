'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

/**
 * Route Prefetcher
 *
 * Prefetches likely navigation targets based on current route.
 * Uses requestIdleCallback to avoid blocking main thread.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-16
 */

// Define prefetch rules: current route → likely next routes
const PREFETCH_RULES: Record<string, string[]> = {
  '/pt': ['/pt/login', '/pt/agora/login', '/pt/about'],
  '/en': ['/pt/login', '/en/about'],
  '/pt/login': ['/pt/app', '/pt/agora/selecao'],
  '/pt/agora/login': ['/pt/agora/selecao'],
  '/pt/agora/selecao': ['/pt/agora', '/pt/agora/kids'],
  '/pt/agora': ['/pt/agora/chat', '/pt/agora/trilhas', '/pt/agora/videos'],
  '/pt/agora/kids': ['/pt/agora/kids/dashboard', '/pt/agora/kids/videos'],
  '/pt/app': ['/pt/app/chat', '/pt/app/dashboard'],
}

export function RoutePrefetcher() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return

    // Get routes to prefetch based on current path
    const routesToPrefetch = PREFETCH_RULES[pathname] || []

    if (routesToPrefetch.length === 0) return

    // Use requestIdleCallback to prefetch during idle time
    const prefetch = () => {
      routesToPrefetch.forEach((route) => {
        router.prefetch(route)
      })
    }

    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(prefetch, { timeout: 2000 })
      return () => cancelIdleCallback(id)
    } else {
      // Fallback for Safari
      const timeout = setTimeout(prefetch, 1000)
      return () => clearTimeout(timeout)
    }
  }, [pathname, router])

  return null
}
