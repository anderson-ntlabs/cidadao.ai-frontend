'use client'

import '@/styles/design-system/tokens/index.css'
import { ReactNode, useEffect, useState } from 'react'
import { HeaderV2 } from '@/components/header-v2'
import { MobileNavV2 } from '@/components/mobile-nav-v2'
import { type NavigationItem } from '@/components/navigation-v2'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-supabase-auth'
import { 
  Home, 
  MessageSquare, 
  LayoutDashboard, 
  Bell,
  FileSearch,
  Settings,
  User
} from 'lucide-react'

interface AuthLayoutV2Props {
  children: ReactNode
  locale?: 'pt' | 'en'
  className?: string
  showMobileNav?: boolean
  contentClassName?: string
}

export function AuthLayoutV2({ 
  children, 
  locale = 'pt',
  className,
  showMobileNav = true,
  contentClassName
}: AuthLayoutV2Props) {
  const { user, logout } = useAuth()
  
  // Navigation items for header
  const navigationItems: NavigationItem[] = [
    {
      name: locale === 'pt' ? 'Início' : 'Home',
      href: `/${locale}/home`,
      icon: Home
    },
    {
      name: locale === 'pt' ? 'Chat' : 'Chat',
      href: `/${locale}/chat`,
      icon: MessageSquare
    },
    {
      name: locale === 'pt' ? 'Dashboard' : 'Dashboard',
      href: `/${locale}/dashboard`,
      icon: LayoutDashboard
    },
    {
      name: locale === 'pt' ? 'Investigações' : 'Investigations',
      href: `/${locale}/investigacoes`,
      icon: FileSearch
    }
  ]
  
  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden", className)}>
      {/* Animated gradient overlay - matching landing page */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-green-500/5 via-transparent to-blue-500/5"></div>
      </div>
      
      {/* Topography pattern - matching landing page */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '30px 30px'
      }} />
      
      {/* Header - Fixed at top with backdrop blur */}
      <HeaderV2 
        locale={locale}
        user={user}
        navigationItems={navigationItems}
        onLogout={logout}
      />
      
      {/* Main content - Add padding for fixed header */}
      <main className={cn(
        "relative z-10",
        "pt-16", // Space for fixed header
        showMobileNav && "pb-14 md:pb-0", // Space for mobile nav on mobile only
        contentClassName
      )}>
        {children}
      </main>
      
      {/* Mobile bottom navigation - Only visible on mobile */}
      {showMobileNav && <MobileNavV2 />}
    </div>
  )
}

// Layout variant with sidebar for desktop
export function AuthLayoutV2WithSidebar({ 
  children,
  sidebarContent,
  locale = 'pt',
  className
}: AuthLayoutV2Props & { sidebarContent?: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])
  
  const navigationItems: NavigationItem[] = [
    {
      name: locale === 'pt' ? 'Início' : 'Home',
      href: `/${locale}/home`,
      icon: Home
    },
    {
      name: locale === 'pt' ? 'Chat' : 'Chat',
      href: `/${locale}/chat`,
      icon: MessageSquare
    },
    {
      name: locale === 'pt' ? 'Dashboard' : 'Dashboard',
      href: `/${locale}/dashboard`,
      icon: LayoutDashboard
    }
  ]
  
  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden", className)}>
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-green-500/5 via-transparent to-blue-500/5"></div>
      </div>
      
      {/* Topography pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '30px 30px'
      }} />
      
      {/* Header */}
      <HeaderV2 
        locale={locale}
        user={user}
        navigationItems={navigationItems}
      />
      
      <div className="flex pt-16 relative z-10">
        {/* Sidebar - Hidden on mobile */}
        <aside className={cn(
          "hidden md:block w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-700/50",
          "transition-all duration-300",
          !isSidebarOpen && "md:w-16"
        )}>
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            {sidebarContent}
          </div>
        </aside>
        
        {/* Main content */}
        <main className={cn(
          "flex-1",
          "pb-14 md:pb-0" // Space for mobile nav
        )}>
          {children}
        </main>
      </div>
      
      {/* Mobile bottom navigation */}
      <MobileNavV2 />
    </div>
  )
}

// Responsive padding utility
export function ResponsivePadding({ 
  children,
  className 
}: { 
  children: ReactNode
  className?: string 
}) {
  return (
    <div className={cn(
      "px-space-4 sm:px-space-6 lg:px-space-8",
      "py-space-6 sm:py-space-8",
      className
    )}>
      {children}
    </div>
  )
}

// Responsive container utility
export function ResponsiveContainer({ 
  children,
  className,
  size = 'default'
}: { 
  children: ReactNode
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'full'
}) {
  const sizeClasses = {
    sm: 'max-w-4xl',
    default: 'max-w-6xl',
    lg: 'max-w-7xl',
    full: 'w-full'
  }
  
  return (
    <div className={cn(
      "mx-auto",
      sizeClasses[size],
      "px-space-4 sm:px-space-6",
      className
    )}>
      {children}
    </div>
  )
}