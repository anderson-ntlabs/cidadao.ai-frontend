'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { HeaderV2 } from './header'
import { BreadcrumbsV2, BreadcrumbsV2Mobile, type BreadcrumbItemV2 } from './breadcrumbs'
import { LoadingScreen } from './loading-screen'
import { cn } from '@/lib/utils'
import { Home, MessageSquare, LayoutDashboard, Bell } from 'lucide-react'
import type { NavigationItem } from './navigation'
import { useAuth } from '@/hooks/use-supabase-auth'

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
  contentClassName
}: AuthLayoutV2Props) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  
  // Navigation items based on locale
  const navigationItems: NavigationItem[] = locale === 'pt' 
    ? [
        { name: 'Início', href: '/pt/home', icon: Home },
        { name: 'Chat com IAs', href: '/pt/chat', icon: MessageSquare },
        { name: 'Dashboard', href: '/pt/dashboard', icon: LayoutDashboard },
        { name: 'Notificações', href: '/pt/notifications', icon: Bell, badge: 3 },
      ]
    : [
        { name: 'Home', href: '/en/home', icon: Home },
        { name: 'AI Chat', href: '/en/chat', icon: MessageSquare },
        { name: 'Dashboard', href: '/en/dashboard', icon: LayoutDashboard },
        { name: 'Notifications', href: '/en/notifications', icon: Bell, badge: 3 },
      ]
  
  // Generate breadcrumbs from pathname if not provided
  const generateBreadcrumbs = (): BreadcrumbItemV2[] => {
    if (breadcrumbs) return breadcrumbs
    
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbItems: BreadcrumbItemV2[] = []
    
    // Skip locale segment
    const startIndex = segments[0] === locale ? 1 : 0
    
    for (let i = startIndex; i < segments.length; i++) {
      const segment = segments[i]
      const path = '/' + segments.slice(0, i + 1).join('/')
      
      // Find matching navigation item
      const navItem = navigationItems.find(item => item.href === path)
      
      breadcrumbItems.push({
        label: navItem?.name || formatSegmentLabel(segment),
        href: i === segments.length - 1 ? undefined : path,
        icon: navItem?.icon,
        current: i === segments.length - 1
      })
    }
    
    return breadcrumbItems
  }
  
  // Format segment label (e.g., "dashboard" -> "Dashboard")
  const formatSegmentLabel = (segment: string): string => {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Save the URL the user was trying to access
      localStorage.setItem('redirectAfterLogin', pathname)
      router.push(`/${locale}/login`)
    }
  }, [isLoading, isAuthenticated, router, locale, pathname])
  
  if (isLoading) {
    return <LoadingScreen />
  }
  
  const currentBreadcrumbs = generateBreadcrumbs()
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header with navigation */}
      <HeaderV2 
        locale={locale} 
        user={user} 
        navigationItems={navigationItems}
      />
      
      {/* Main content area */}
      <main className="pt-16 flex-1 flex flex-col">
        {/* Breadcrumbs section */}
        {showBreadcrumbs && currentBreadcrumbs.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className={cn("max-w-7xl mx-auto px-4 sm:px-6", containerClassName)}>
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
        <div className={cn(
          "flex-1 flex flex-col",
          contentClassName
        )}>
          <div className={cn(
            "max-w-7xl w-full mx-auto px-4 sm:px-6 py-6",
            containerClassName
          )}>
            {children}
          </div>
        </div>
      </main>
      
      {/* Footer space for mobile navigation if needed */}
      <div className="h-16 md:hidden" aria-hidden="true" />
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
    wide: 'w-80'
  }
  
  return (
    <AuthLayoutV2 {...props}>
      <div className="flex h-full">
        {/* Desktop sidebar */}
        <aside className={cn(
          "hidden lg:block flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700",
          sidebarWidthClasses[sidebarWidth]
        )}>
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
            <aside className={cn(
              "fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-900 transform transition-transform duration-300 lg:hidden",
              sidebarWidthClasses[sidebarWidth],
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
              {sidebarContent}
            </aside>
          </>
        )}
        
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </AuthLayoutV2>
  )
}

// Export with both names for compatibility
export { AuthLayoutV2 as AuthLayout }