'use client'

import { usePathname } from 'next/navigation'
import { AuthProvider } from '@/hooks/use-supabase-auth'
import { useMemo } from 'react'

/**
 * Conditional Auth Provider
 *
 * Performance optimization: Only loads AuthProvider for routes that need authentication.
 * This prevents unnecessary Supabase getUser() calls on public pages like /pt, /about, etc.
 *
 * Routes requiring auth:
 * - /pt/app/* - Main authenticated app
 * - /pt/agora/* - Agora academy (needs auth for progress tracking)
 * - /en/app/*, /en/agora/* - English versions
 *
 * Public routes (skip AuthProvider):
 * - /pt, /en - Landing pages
 * - /pt/about, /pt/agents, /pt/manifesto, etc.
 * - /pt/login, /en/login - Login pages (auth checked separately)
 */
function ConditionalAuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const needsAuth = useMemo(() => {
    if (!pathname) return false

    // Routes that need authentication
    const authRoutes = ['/app', '/agora']

    return authRoutes.some((route) => pathname.includes(route) && !pathname.includes('/login'))
  }, [pathname])

  // Skip AuthProvider for public routes - saves ~300-500ms TTFB
  if (!needsAuth) {
    return <>{children}</>
  }

  return <AuthProvider>{children}</AuthProvider>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <ConditionalAuthProvider>{children}</ConditionalAuthProvider>
}
