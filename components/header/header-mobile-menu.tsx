'use client'

import { LogOut, User as UserIcon, Settings } from 'lucide-react'
import { NavigationDrawer, Navigation, type NavigationItem } from '../navigation'
import { Button } from '../ui/button'
import { ThemeToggle } from '../theme-toggle'
import { LanguageSelector } from '../language-selector'
import { AvatarWithBadge } from '@/components/badge'

interface HeaderMobileMenuProps {
  isOpen: boolean
  onClose: () => void
  navigationItems: NavigationItem[]
  locale: 'pt' | 'en'
  isPublicPage: boolean
  isLandingPage: boolean
  user?: {
    name?: string
    email?: string
    avatar?: string
  }
  onLogout: () => void
}

export function HeaderMobileMenu({
  isOpen,
  onClose,
  navigationItems,
  locale,
  isPublicPage,
  isLandingPage,
  user,
  onLogout,
}: HeaderMobileMenuProps) {
  const userMenuItems: NavigationItem[] = [
    {
      name: locale === 'pt' ? 'Meu Perfil' : 'My Profile',
      href: `/${locale}/app/perfil`,
      icon: UserIcon,
    },
    {
      name: locale === 'pt' ? 'Configuracoes' : 'Settings',
      href: `/${locale}/app/configuracoes`,
      icon: Settings,
    },
  ]

  return (
    <NavigationDrawer isOpen={isOpen} onClose={onClose} items={navigationItems}>
      {/* Language and Theme section */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
        <div className="space-y-4">
          {isPublicPage && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {locale === 'pt' ? 'Idioma' : 'Language'}
              </span>
              <LanguageSelector />
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {locale === 'pt' ? 'Tema' : 'Theme'}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* User section - Only show if not on landing page */}
      {!isLandingPage && user && (
        <div className="mt-6 px-6 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <AvatarWithBadge
              src={user?.avatar}
              alt={user?.name || 'Usuario'}
              fallbackInitial={user?.name?.charAt(0) || 'U'}
              size="lg"
              locale={locale}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {user?.name || 'Usuario'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user?.email || 'email@example.com'}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <Navigation items={userMenuItems} variant="mobile" onItemClick={onClose} />
            <Button
              variant="ghost"
              className="w-full justify-start"
              leftIcon={<LogOut className="h-5 w-5" />}
              onClick={() => {
                onClose()
                onLogout()
              }}
            >
              {locale === 'pt' ? 'Sair' : 'Logout'}
            </Button>
          </div>
        </div>
      )}
    </NavigationDrawer>
  )
}
