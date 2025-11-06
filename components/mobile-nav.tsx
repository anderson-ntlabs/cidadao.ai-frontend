'use client'

import '@/styles/design-system/tokens/index.css'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  MessageSquare,
  LayoutDashboard,
  Bell,
  Menu,
  FileSearch,
  User as UserIcon,
  Settings,
  LogOut,
  ChevronUp,
  type LucideIcon,
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useNotificationStore } from '@/store/notification-store'
import { useAuth } from '@/hooks/use-supabase-auth'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import { useHaptic } from '@/hooks/use-haptic'

interface MobileNavItem {
  name: string
  href: string
  icon: LucideIcon
  badge?: number | string
}

// Mobile navigation items - optimized for thumb reach
// Main features limited to 4 for better UX, 5th is menu
const mobileNavItems: MobileNavItem[] = [
  {
    name: 'Início',
    href: '/pt/app',
    icon: Home,
  },
  {
    name: 'Chat',
    href: '/pt/app/chat',
    icon: MessageSquare,
  },
  {
    name: 'Dashboard',
    href: '/pt/app/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Investig.',
    href: '/pt/app/investigacoes',
    icon: FileSearch,
  },
]

export function MobileNavV2() {
  const pathname = usePathname()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { getUnreadCount } = useNotificationStore()
  const { user, logout } = useAuth()
  const menuRef = useRef<HTMLDivElement>(null)
  const { vibrate } = useHaptic()

  // Update notification badge
  const unreadCount = getUnreadCount()

  // Auto-hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past threshold
        setIsVisible(false)
        setIsMenuOpen(false) // Close menu when scrolling
      } else {
        // Scrolling up
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const handleLogout = async () => {
    await logout()
    toast.success('Até logo!', 'Logout realizado com sucesso')
    router.push('/pt')
  }

  const isActive = (href: string) => {
    if (href === '/pt/app') return pathname === href || pathname === '/pt/app'
    return pathname.startsWith(href)
  }

  // Update notification badge
  const items = mobileNavItems.map((item) =>
    item.href === '/pt/app/notificacoes'
      ? { ...item, badge: unreadCount > 0 ? unreadCount : undefined }
      : item
  )

  return (
    <>
      {/* User Menu Popup - appears above bottom nav */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className={cn(
            'fixed bottom-16 right-4 z-50 md:hidden',
            'bg-white dark:bg-gray-900 rounded-2xl shadow-2xl',
            'border border-gray-200 dark:border-gray-800',
            'w-64 p-2',
            'animate-in slide-in-from-bottom-5'
          )}
        >
          {/* User Info */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || 'email@exemplo.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/pt/app/notificacoes"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium">Notificações</span>
              {unreadCount > 0 && (
                <span className="ml-auto bg-brand-red-600 text-white text-xs rounded-full px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </Link>

            <Link
              href="/pt/app/mapa"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <FileSearch className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium">Mapa Transparência</span>
            </Link>

            <Link
              href="/pt/app/perfil"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium">Meu Perfil</span>
            </Link>

            <Link
              href="/pt/app/configuracoes"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium">Configurações</span>
            </Link>

            <button
              onClick={() => {
                vibrate('medium')
                setIsMenuOpen(false)
                handleLogout()
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-red-600 dark:text-red-400"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">Sair</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile bottom navigation */}
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900',
          'border-t border-gray-200 dark:border-gray-800',
          'transition-transform duration-300 ease-in-out',
          'md:hidden', // Only show on mobile
          isVisible ? 'translate-y-0' : 'translate-y-full'
        )}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around">
          {items.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => vibrate('light')}
                className={cn(
                  'flex flex-col items-center justify-center',
                  'relative py-2 px-3 min-w-[64px] min-h-[56px]',
                  'transition-all duration-200',
                  'tap-highlight-transparent',
                  active
                    ? 'text-brand-green-600 dark:text-brand-green-400'
                    : 'text-gray-600 dark:text-gray-400'
                )}
                aria-current={active ? 'page' : undefined}
                aria-label={item.name}
              >
                <div className="relative">
                  <Icon
                    className={cn('h-6 w-6 transition-all duration-200', active && 'scale-110')}
                    aria-hidden="true"
                  />

                  {/* Badge */}
                  {item.badge !== undefined && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-brand-red-600 text-white text-xs font-medium">
                      {typeof item.badge === 'number' && item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>

                <span
                  className={cn(
                    'text-xs mt-1 font-medium',
                    'transition-all duration-200',
                    active && 'font-semibold'
                  )}
                >
                  {item.name}
                </span>

                {/* Active indicator */}
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-brand-green-600 dark:bg-brand-green-400 rounded-full pointer-events-none" />
                )}
              </Link>
            )
          })}

          {/* User/Menu button */}
          <button
            className={cn(
              'flex flex-col items-center justify-center',
              'relative py-2 px-3 min-w-[64px] min-h-[56px]',
              'transition-all duration-200',
              'tap-highlight-transparent',
              isMenuOpen
                ? 'text-brand-green-600 dark:text-brand-green-400'
                : 'text-gray-600 dark:text-gray-400'
            )}
            aria-label="Menu do usuário"
            onClick={() => {
              vibrate('light')
              setIsMenuOpen(!isMenuOpen)
            }}
          >
            <div className="relative">
              {isMenuOpen ? (
                <ChevronUp className="h-6 w-6 transition-all duration-200" />
              ) : (
                <Menu className="h-6 w-6 transition-all duration-200" />
              )}

              {/* Notification badge on menu */}
              {unreadCount > 0 && !isMenuOpen && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-brand-red-600 text-white text-xs font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>

            <span
              className={cn(
                'text-xs mt-1 font-medium',
                'transition-all duration-200',
                isMenuOpen && 'font-semibold'
              )}
            >
              Menu
            </span>

            {/* Active indicator */}
            {isMenuOpen && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-brand-green-600 dark:bg-brand-green-400 rounded-full pointer-events-none" />
            )}
          </button>
        </div>
      </nav>

      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-14 md:hidden" aria-hidden="true" />
    </>
  )
}

// Mobile navigation drawer for additional items
export function MobileNavDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()

  // Additional menu items not in bottom nav
  const drawerItems: MobileNavItem[] = [
    {
      name: 'Perfil',
      href: '/pt/app/perfil',
      icon: Home, // Replace with User icon when available
    },
    {
      name: 'Configurações',
      href: '/pt/app/configuracoes',
      icon: Home, // Replace with Settings icon when available
    },
  ]

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-72 bg-white dark:bg-gray-900',
          'transform transition-transform duration-300 ease-in-out md:hidden',
          'shadow-2xl',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-space-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Menu</h2>
            <button
              onClick={onClose}
              className="p-space-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 overflow-y-auto py-space-4">
            <div className="px-space-2 space-y-space-1">
              {drawerItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-space-3 px-space-4 py-space-3',
                      'rounded-lg transition-all duration-200',
                      'text-base font-medium',
                      active
                        ? 'bg-gray-100 dark:bg-gray-800 text-brand-green-600 dark:text-brand-green-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Footer with user info */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-space-4">
            <div className="flex items-center gap-space-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Usuário</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">usuario@exemplo.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Hook for managing mobile navigation state
export function useMobileNav() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const openDrawer = () => setIsDrawerOpen(true)
  const closeDrawer = () => setIsDrawerOpen(false)
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev)

  return {
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
  }
}

// CSS utility for removing tap highlight on mobile
const styles = `
  .tap-highlight-transparent {
    -webkit-tap-highlight-color: transparent;
  }
`

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}

import { X } from 'lucide-react'
