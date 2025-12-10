'use client'

import { LogOut, User as UserIcon, Settings } from 'lucide-react'
import { Navigation, type NavigationItem } from '../navigation'
import { Button } from '../ui/button'
import { AvatarWithBadge } from '@/components/badge'

interface HeaderUserMenuProps {
  user: {
    name?: string
    email?: string
    avatar?: string
  }
  locale: 'pt' | 'en'
  onLogout: () => void
}

export function HeaderUserMenu({ user, locale, onLogout }: HeaderUserMenuProps) {
  const userMenuItems: NavigationItem[] = [
    {
      name: locale === 'pt' ? 'Meu Perfil' : 'My Profile',
      href: `/${locale}/app/perfil`,
      icon: UserIcon,
    },
    {
      name: locale === 'pt' ? 'Configurações' : 'Settings',
      href: `/${locale}/app/configuracoes`,
      icon: Settings,
    },
  ]

  return (
    <div className="hidden lg:flex items-center gap-2">
      <div className="relative group">
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <AvatarWithBadge
            src={user?.avatar}
            alt={user?.name || 'Usuário'}
            fallbackInitial={user?.name?.charAt(0) || 'U'}
            size="sm"
            locale={locale}
          />
          <span className="max-w-[150px] truncate">{user?.name || 'Usuário'}</span>
        </Button>

        {/* Dropdown Menu */}
        <div className="absolute right-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-lg shadow-xl border border-gray-200/50 dark:border-gray-700/50 py-2">
            <Navigation items={userMenuItems} variant="vertical" size="sm" />
            <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 px-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                leftIcon={<LogOut className="h-4 w-4" />}
                onClick={onLogout}
              >
                {locale === 'pt' ? 'Sair' : 'Logout'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
