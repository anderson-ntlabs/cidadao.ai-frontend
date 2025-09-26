'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Menu, X, LogOut, User as UserIcon, Settings } from 'lucide-react'
import { NavigationV2, NavigationV2Drawer, type NavigationItem } from './navigation-v2'
import { ButtonV2 } from './ui/button-v2'
import { NotificationDropdown } from './ui/notification-dropdown'
import { ThemeToggle } from './theme-toggle'
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
      href: `/${locale}/settings`,
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
              href={`/${locale}/home`} 
              className="flex items-center gap-3 group"
              aria-label="Cidadão.AI Home"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-110">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 via-yellow-500 to-blue-600 bg-clip-text text-transparent">
                Cidadão.AI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <NavigationV2 
                items={navigationItems}
                variant="horizontal"
                size="sm"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <NotificationDropdown locale={locale} />
            
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="relative group">
                <ButtonV2
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
                </ButtonV2>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-lg shadow-xl border border-gray-200/50 dark:border-gray-700/50 py-2">
                    <NavigationV2
                      items={userMenuItems}
                      variant="vertical"
                      size="sm"
                    />
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 px-2">
                      <ButtonV2
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        leftIcon={<LogOut className="h-4 w-4" />}
                        onClick={handleLogout}
                      >
                        {locale === 'pt' ? 'Sair' : 'Logout'}
                      </ButtonV2>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <ButtonV2
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </ButtonV2>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <NavigationV2Drawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        items={navigationItems}
      >
        {/* User section in mobile */}
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
            <NavigationV2
              items={userMenuItems}
              variant="mobile"
              onItemClick={() => setIsMenuOpen(false)}
            />
            <ButtonV2
              variant="ghost"
              className="w-full justify-start"
              leftIcon={<LogOut className="h-5 w-5" />}
              onClick={() => {
                setIsMenuOpen(false)
                handleLogout()
              }}
            >
              {locale === 'pt' ? 'Sair' : 'Logout'}
            </ButtonV2>
          </div>
        </div>
      </NavigationV2Drawer>
    </header>
  )
}