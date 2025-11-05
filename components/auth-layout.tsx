'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { HeaderV2 } from './header'
import { BreadcrumbsV2, BreadcrumbsV2Mobile, type BreadcrumbItemV2 } from './breadcrumbs'
import { LoadingScreen } from './loading-screen'
import { cn } from '@/lib/utils'
import { Home, MessageSquare, LayoutDashboard, FileSearch, Map } from 'lucide-react'
import type { NavigationItem } from './navigation'
import { useAuth } from '@/hooks/use-supabase-auth'
import { VLibrasWidget } from './a11y/vlibras-widget'
import { MobileNavV2 } from './mobile-nav'
import { BottomNavigation } from './mobile/bottom-navigation'
import { useMobileDetection } from '@/lib/utils/mobile-detection'
import { createLogger } from '@/lib/logger'

const logger = createLogger('AuthLayout')

interface AuthLayoutV2Props {
  children: React.ReactNode
  locale: 'pt' | 'en'
  breadcrumbs?: BreadcrumbItemV2[]
  showBreadcrumbs?: boolean
  containerClassName?: string
  contentClassName?: string
}

export function AuthLayoutV2({
  children,
  locale,
  breadcrumbs,
  showBreadcrumbs = true,
  containerClassName,
  contentClassName,
}: AuthLayoutV2Props) {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isMobile = useMobileDetection()

  // Navigation items - authenticated system is PT-BR only
  // Sistema unificado em /pt/app/* para separar área autenticada da landing pública
  const navigationItems: NavigationItem[] = [
    { name: 'Início', href: '/pt/app', icon: Home },
    { name: 'Dashboard', href: '/pt/app/dashboard', icon: LayoutDashboard },
    { name: 'Chat com IAs', href: '/pt/app/chat', icon: MessageSquare },
    { name: 'Investigações', href: '/pt/app/investigacoes', icon: FileSearch },
    { name: 'Mapa de Transparência', href: '/pt/app/mapa', icon: Map },
  ]

  // Generate breadcrumbs from pathname if not provided
  const generateBreadcrumbs = (): BreadcrumbItemV2[] => {
    if (breadcrumbs) return breadcrumbs

    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbItems: BreadcrumbItemV2[] = []

    // Skip locale segment
    const startIndex = segments[0] === locale ? 1 : 0

    // Skip home segment since it's already shown as home icon
    const skipHome = segments[startIndex] === 'home'
    const actualStartIndex = skipHome ? startIndex + 1 : startIndex

    for (let i = actualStartIndex; i < segments.length; i++) {
      const segment = segments[i]
      const path = '/' + segments.slice(0, i + 1).join('/')

      // Find matching navigation item
      const navItem = navigationItems.find((item) => item.href === path)

      breadcrumbItems.push({
        label: navItem?.name || formatSegmentLabel(segment),
        href: i === segments.length - 1 ? undefined : path,
        icon: navItem?.icon,
        current: i === segments.length - 1,
      })
    }

    return breadcrumbItems
  }

  // Format segment label (e.g., "dashboard" -> "Dashboard")
  const formatSegmentLabel = (segment: string): string => {
    return segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Check if we're waiting for OAuth session to complete via cookie
      const oauthInProgress = document.cookie.includes('oauth_in_progress=true')

      if (oauthInProgress) {
        logger.debug('OAuth in progress (cookie detected), giving session time to establish...')
        // Give the session 3 seconds to establish before redirecting
        const timer = setTimeout(() => {
          logger.debug('OAuth timeout reached')
          // Clear the OAuth cookie
          document.cookie = 'oauth_in_progress=; path=/; max-age=0'
          // If still not authenticated, redirect to login
          if (!isAuthenticated) {
            logger.info('Still not authenticated after OAuth timeout, redirecting to login')
            localStorage.setItem('redirectAfterLogin', pathname)
            router.push('/pt/login')
          }
        }, 3000)

        return () => clearTimeout(timer)
      }

      // Normal redirect to login for unauthenticated users
      logger.info('Not authenticated and no OAuth in progress, redirecting to login')
      // Save the URL the user was trying to access for redirect after login
      localStorage.setItem('redirectAfterLogin', pathname)
      // Sistema autenticado está sempre em /pt (sem /en)
      router.push('/pt/login')
    } else if (isAuthenticated) {
      // Clear OAuth cookie when successfully authenticated
      document.cookie = 'oauth_in_progress=; path=/; max-age=0'
      logger.debug('User authenticated, cleared OAuth cookie')
    }
  }, [isLoading, isAuthenticated, router, pathname])

  if (isLoading) {
    return <LoadingScreen />
  }

  const currentBreadcrumbs = generateBreadcrumbs()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 relative">
      {/* Background image for glassmorphism effect */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage: `url('/operarios.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.03,
        }}
      />

      {/* Gradient overlay */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-green-50/50 via-transparent to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20 pointer-events-none" />

      {/* Header with navigation */}
      <HeaderV2 locale={locale} user={user} navigationItems={navigationItems} onLogout={logout} />

      {/* Main content area */}
      <main className="flex-1 flex flex-col relative z-10">
        {/* Fixed spacer for header */}
        <div className="h-16" aria-hidden="true" />

        {/* Breadcrumbs section - directly attached to header */}
        {showBreadcrumbs && currentBreadcrumbs.length > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-16 z-20">
            <div className={cn('max-w-7xl mx-auto px-4 sm:px-6', containerClassName)}>
              {/* Desktop breadcrumbs */}
              <div className="hidden md:block">
                <BreadcrumbsV2
                  items={currentBreadcrumbs}
                  showHome={true}
                  homeHref={`/${locale}/home`}
                  homeLabel={locale === 'pt' ? 'Início' : 'Home'}
                />
              </div>

              {/* Mobile breadcrumbs */}
              <div className="block md:hidden">
                <BreadcrumbsV2Mobile items={currentBreadcrumbs} />
              </div>
            </div>
          </div>
        )}

        {/* Page content */}
        <div className={cn('flex-1 flex flex-col', contentClassName)}>
          <div className={cn('max-w-7xl w-full mx-auto px-4 sm:px-6 py-6', containerClassName)}>
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation - Only show in authenticated app area */}
      {isMobile ? (
        <BottomNavigation
          items={[
            {
              id: 'home',
              label: 'Início',
              path: '/pt/app/home',
              icon: Home,
            },
            {
              id: 'chat',
              label: 'Chat',
              path: '/pt/app/chat',
              icon: MessageSquare,
            },
            {
              id: 'investigations',
              label: 'Investigações',
              path: '/pt/app/investigacoes',
              icon: FileSearch,
            },
            {
              id: 'dashboard',
              label: 'Dashboard',
              path: '/pt/app/dashboard',
              icon: LayoutDashboard,
            },
            {
              id: 'map',
              label: 'Mapa',
              path: '/pt/app/mapa',
              icon: Map,
            },
          ]}
        />
      ) : (
        <MobileNavV2 />
      )}

      {/* VLibras Widget - Global for all authenticated pages (PT only) */}
      {locale === 'pt' && <VLibrasWidget locale="pt" forceOnload={true} />}
    </div>
  )
}

// Sidebar layout variant for complex applications
interface AuthLayoutV2WithSidebarProps extends AuthLayoutV2Props {
  sidebarContent?: React.ReactNode
  sidebarWidth?: 'narrow' | 'normal' | 'wide'
}

export function AuthLayoutV2WithSidebar({
  children,
  sidebarContent,
  sidebarWidth = 'normal',
  ...props
}: AuthLayoutV2WithSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const sidebarWidthClasses = {
    narrow: 'w-48',
    normal: 'w-64',
    wide: 'w-80',
  }

  return (
    <AuthLayoutV2 {...props}>
      <div className="flex h-full">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            'hidden lg:block flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700',
            sidebarWidthClasses[sidebarWidth]
          )}
        >
          {sidebarContent}
        </aside>

        {/* Mobile sidebar */}
        {sidebarContent && (
          <>
            {/* Backdrop */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
              />
            )}

            {/* Sidebar drawer */}
            <aside
              className={cn(
                'fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-900 transform transition-transform duration-300 lg:hidden',
                sidebarWidthClasses[sidebarWidth],
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              )}
            >
              {sidebarContent}
            </aside>
          </>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </AuthLayoutV2>
  )
}

// Export with both names for compatibility
export { AuthLayoutV2 as AuthLayout }
