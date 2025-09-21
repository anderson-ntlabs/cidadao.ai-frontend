'use client'

import '@/styles/design-system/tokens/index.css'
import { ReactNode, useEffect, useState } from 'react'
import { HeaderV2 } from '@/components/header-v2'
import { MobileNavV2 } from '@/components/mobile-nav-v2'
import { type NavigationItem } from '@/components/navigation-v2'
import { cn } from '@/lib/utils'
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
  const [user, setUser] = useState<any>(null)
  
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])
  
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
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      {/* Header - Fixed at top */}
      <HeaderV2 
        locale={locale}
        user={user}
        navigationItems={navigationItems}
      />
      
      {/* Main content - Add padding for fixed header */}
      <main className={cn(
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
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      {/* Header */}
      <HeaderV2 
        locale={locale}
        user={user}
        navigationItems={navigationItems}
      />
      
      <div className="flex pt-16">
        {/* Sidebar - Hidden on mobile */}
        <aside className={cn(
          "hidden md:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700",
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