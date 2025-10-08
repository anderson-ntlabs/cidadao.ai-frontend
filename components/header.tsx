'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, LogOut, User as UserIcon, Settings } from 'lucide-react'
import { Navigation, NavigationDrawer, type NavigationItem } from './navigation'
import { Button } from './ui/button'
import { NotificationDropdown } from './ui/notification-dropdown'
import { ThemeToggle } from './theme-toggle'
import { LanguageSwitcherV2 } from './language-switcher-v2'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

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
  
  const handleLogout = async () => {
    if (onLogout) {
      await onLogout()
    } else {
      // Fallback to localStorage removal if no onLogout provided
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      toast.success(
        locale === 'pt' ? 'Até logo!' : 'See you later!',
        locale === 'pt' ? 'Logout realizado com sucesso' : 'Logged out successfully'
      )
      router.push(`/${locale}`)
    }
  }

  const userMenuItems: NavigationItem[] = [
    {
      name: locale === 'pt' ? 'Meu Perfil' : 'My Profile',
      href: `/${locale}/perfil`,
      icon: UserIcon
    },
    {
      name: locale === 'pt' ? 'Configurações' : 'Settings',
      href: `/${locale}/configuracoes`,
      icon: Settings
    }
  ]

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50",
      "bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg",
      "border-b border-gray-200/50 dark:border-gray-800/50",
      "shadow-lg",
      className
    )}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6" role="navigation">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link 
              href={isLandingPage ? `/${locale}` : `/${locale}/home`} 
              className="flex items-center gap-3 group"
              aria-label="Cidadão.AI Home"
            >
              <Image
                src="/forum-icon.png"
                alt="Greek Forum"
                width={40}
                height={40}
                className="rounded-lg shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-110"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 via-yellow-500 to-blue-600 bg-clip-text text-transparent">
                Cidadão.AI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <Navigation
                items={navigationItems}
                variant="horizontal"
                size="sm"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <LanguageSwitcherV2 />
            
            {/* Notifications - Only show if not on landing page */}
            {!isLandingPage && <NotificationDropdown locale={locale} />}
            
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu - Desktop - Only show if user exists and not on landing page */}
            {!isLandingPage && user && (
              <div className="hidden lg:flex items-center gap-2">
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="rounded-full object-cover shadow-md"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 via-yellow-500 to-blue-600 flex items-center justify-center text-white font-medium shadow-md">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="max-w-[150px] truncate">
                    {user?.name || 'Usuário'}
                  </span>
                </Button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-lg shadow-xl border border-gray-200/50 dark:border-gray-700/50 py-2">
                    <Navigation
                      items={userMenuItems}
                      variant="vertical"
                      size="sm"
                    />
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 px-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        leftIcon={<LogOut className="h-4 w-4" />}
                        onClick={handleLogout}
                      >
                        {locale === 'pt' ? 'Sair' : 'Logout'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <NavigationDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        items={navigationItems}
      >
        {/* Language and Theme section in mobile */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <div className="space-y-4">
            <LanguageSwitcherV2 variant="mobile" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {locale === 'pt' ? 'Tema' : 'Theme'}
              </span>
              <ThemeToggle />
            </div>
          </div>
        </div>
        
        {/* User section in mobile - Only show if not on landing page */}
        {!isLandingPage && user && (
          <div className="mt-6 px-6 pb-6">
          <div className="flex items-center gap-3 mb-4">
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={48}
                height={48}
                className="rounded-full object-cover shadow-md"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-brand-green-600 to-brand-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user?.email || 'email@example.com'}
              </p>
            </div>
          </div>
          
          <div className="space-y-1">
            <Navigation
              items={userMenuItems}
              variant="mobile"
              onItemClick={() => setIsMenuOpen(false)}
            />
            <Button
              variant="ghost"
              className="w-full justify-start"
              leftIcon={<LogOut className="h-5 w-5" />}
              onClick={() => {
                setIsMenuOpen(false)
                handleLogout()
              }}
            >
              {locale === 'pt' ? 'Sair' : 'Logout'}
            </Button>
          </div>
        </div>
        )}
      </NavigationDrawer>
    </header>
  )
}

// Export with both names for compatibility
export { HeaderV2 as Header }