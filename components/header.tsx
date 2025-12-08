'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Navigation, type NavigationItem } from './navigation'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

// Import modular components
import { HeaderLogo } from './header/header-logo'
import { HeaderUserMenu } from './header/header-user-menu'
import { HeaderMobileMenu } from './header/header-mobile-menu'
import { HeaderActions } from './header/header-actions'

interface HeaderV2Props {
  locale: 'pt' | 'en'
  user: any
  navigationItems: NavigationItem[]
  className?: string
  onLogout?: () => void
}

export function HeaderV2({ locale, user, navigationItems, className, onLogout }: HeaderV2Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Check if we're on landing page
  const isLandingPage = pathname === '/pt' || pathname === '/en' || pathname === '/'

  // Check if we're on any public page (not authenticated /pt/app/* or /en/app/*)
  const isPublicPage = !pathname.startsWith('/pt/app/') && !pathname.startsWith('/en/app/')

  // Check if we should show mobile menu (not in authenticated app)
  const showMobileMenu = !pathname.startsWith('/pt/app/') && !pathname.startsWith('/en/app/')

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout()
    } else {
      // Fallback to localStorage removal if no onLogout provided
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      toast.success(
        locale === 'pt' ? 'Ate logo!' : 'See you later!',
        locale === 'pt' ? 'Logout realizado com sucesso' : 'Logged out successfully'
      )
      router.push(`/${locale}`)
    }
  }

  // Determine logo href based on context
  const logoHref = isLandingPage ? `/${locale}` : `/${locale}/app`

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg',
        'border-b border-gray-200/50 dark:border-gray-800/50',
        'shadow-lg',
        className
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6" role="navigation">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <HeaderLogo href={logoHref} />

            {/* Desktop Navigation */}
            {isPublicPage ? (
              <div className="hidden lg:block">
                <Navigation items={navigationItems} variant="horizontal" size="sm" />
              </div>
            ) : (
              <div className="hidden xl:block">
                <Navigation items={navigationItems} variant="horizontal" size="sm" />
              </div>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <HeaderActions
              locale={locale}
              isPublicPage={isPublicPage}
              isLandingPage={isLandingPage}
              isMenuOpen={isMenuOpen}
              onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
              showMobileMenu={showMobileMenu}
            />

            {/* User Menu - Desktop */}
            {!isLandingPage && user && (
              <HeaderUserMenu user={user} locale={locale} onLogout={handleLogout} />
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <HeaderMobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        navigationItems={navigationItems}
        locale={locale}
        isPublicPage={isPublicPage}
        isLandingPage={isLandingPage}
        user={user}
        onLogout={handleLogout}
      />
    </header>
  )
}

// Export with both names for compatibility
export { HeaderV2 as Header }
