/**
 * Bottom Navigation Component
 *
 * Mobile-optimized navigation bar for authenticated pages.
 *
 * Features:
 * - Fixed bottom position with safe area support
 * - Touch targets >= 56px (WCAG AAA)
 * - Active state indication
 * - Haptic feedback on tap
 * - Badge indicators for notifications
 * - Smooth animations
 *
 * Usage:
 * ```tsx
 * <BottomNavigation
 *   items={navItems}
 *   currentPath="/pt/app/home"
 *   onNavigate={(path) => router.push(path)}
 * />
 * ```
 */

'use client'

import { useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useHaptic } from '@/hooks/use-haptic'
import { touchFeedback, tapTarget, safeArea } from '@/lib/mobile-touch'
import { Home, MessageSquare, Search, Bell, User, type LucideIcon } from 'lucide-react'

export interface BottomNavItem {
  /** Unique identifier */
  id: string

  /** Display label */
  label: string

  /** Navigation path */
  path: string

  /** Icon component */
  icon: LucideIcon

  /** Badge count (for notifications) */
  badge?: number

  /** Whether this item is active (auto-detected if not provided) */
  active?: boolean
}

export interface BottomNavigationProps {
  /** Navigation items */
  items?: BottomNavItem[]

  /** Current pathname (auto-detected if not provided) */
  currentPath?: string

  /** Navigation handler */
  onNavigate?: (path: string) => void

  /** Additional CSS classes */
  className?: string

  /** Show labels under icons */
  showLabels?: boolean
}

// Default navigation items
const defaultItems: BottomNavItem[] = [
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
    icon: Search,
  },
  {
    id: 'notifications',
    label: 'Notificações',
    path: '/pt/app/notificacoes',
    icon: Bell,
    badge: 0, // Will be updated from store
  },
  {
    id: 'profile',
    label: 'Perfil',
    path: '/pt/app/perfil',
    icon: User,
  },
]

export function BottomNavigation({
  items = defaultItems,
  currentPath: providedPath,
  onNavigate,
  className,
  showLabels = true,
}: BottomNavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { vibrate } = useHaptic()

  // Use provided path or current pathname
  const currentPath = providedPath || pathname

  const handleNavigate = useCallback(
    (item: BottomNavItem) => {
      // Haptic feedback
      vibrate('light')

      // Custom handler or default router.push
      if (onNavigate) {
        onNavigate(item.path)
      } else {
        router.push(item.path)
      }
    },
    [onNavigate, router, vibrate]
  )

  return (
    <nav
      className={cn(
        'bottom-navigation',
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-white dark:bg-gray-900',
        'border-t border-gray-200 dark:border-gray-800',
        'shadow-lg',
        safeArea.bottom, // Safe area for home indicator
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-2">
        {items.map((item) => {
          const isActive = item.active !== undefined ? item.active : currentPath === item.path
          const Icon = item.icon
          const hasBadge = item.badge !== undefined && item.badge > 0

          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item)}
              className={cn(
                'flex flex-col items-center justify-center gap-1',
                'relative',
                'py-2 px-3',
                'transition-all duration-200',
                touchFeedback.minimal,
                tapTarget.large, // 56px minimum
                isActive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Icon with badge */}
              <div className="relative">
                <Icon
                  className={cn(
                    'w-6 h-6 transition-transform duration-200',
                    isActive && 'scale-110'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />

                {/* Badge indicator */}
                {hasBadge && (
                  <span
                    className={cn(
                      'absolute -top-1 -right-1',
                      'min-w-[18px] h-[18px] px-1',
                      'flex items-center justify-center',
                      'bg-red-500 text-white',
                      'text-xs font-semibold',
                      'rounded-full',
                      'ring-2 ring-white dark:ring-gray-900',
                      'animate-in zoom-in duration-200'
                    )}
                    aria-label={`${item.badge ?? 0} notifications`}
                  >
                    {(item.badge ?? 0) > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              {showLabels && (
                <span
                  className={cn(
                    'text-xs font-medium transition-all duration-200',
                    isActive && 'font-semibold'
                  )}
                >
                  {item.label}
                </span>
              )}

              {/* Active indicator */}
              {isActive && (
                <div
                  className={cn(
                    'absolute bottom-0 left-1/2 -translate-x-1/2',
                    'w-12 h-1',
                    'bg-green-600 dark:bg-green-400',
                    'rounded-t-full',
                    'animate-in slide-in-from-bottom duration-200'
                  )}
                  aria-hidden="true"
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

/**
 * Compact Bottom Navigation (icons only)
 *
 * More space-efficient version for smaller screens
 *
 * Usage:
 * ```tsx
 * <CompactBottomNavigation />
 * ```
 */
export function CompactBottomNavigation(props: Omit<BottomNavigationProps, 'showLabels'>) {
  return <BottomNavigation {...props} showLabels={false} />
}
