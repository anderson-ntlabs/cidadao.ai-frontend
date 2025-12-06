/**
 * Academy Sidebar Component
 *
 * Navigation sidebar following the design system with:
 * - Navigation links with icons
 * - Active state indicators
 * - Mobile-responsive behavior
 * - Quick stats summary
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-06
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  MessageSquare,
  Video,
  Trophy,
  FileText,
  GraduationCap,
  Flame,
  Clock,
  Target,
  Calendar,
  Compass,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  badge?: string | number
}

interface AcademySidebarProps {
  user: {
    currentStreak: number
    totalTimeMinutes: number
    totalSessions: number
  }
  className?: string
}

const navItems: NavItem[] = [
  { href: '/pt/academy', label: 'Dashboard', icon: Home },
  { href: '/pt/academy/trilhas', label: 'Trilhas', icon: Compass },
  { href: '/pt/academy/chat', label: 'Chat com Mentor', icon: MessageSquare },
  { href: '/pt/academy/agenda', label: 'Agenda', icon: Calendar },
  { href: '/pt/academy/videos', label: 'Videos', icon: Video },
  { href: '/pt/academy/leituras', label: 'Leituras', icon: FileText },
  { href: '/pt/academy/ranking', label: 'Ranking', icon: Trophy },
  { href: '/pt/academy/perfil', label: 'Meu Perfil', icon: GraduationCap },
]

export function AcademySidebar({ user, className }: AcademySidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/pt/academy') {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  return (
    <aside
      className={cn(
        'w-64 flex-shrink-0',
        'bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl',
        'border-r border-gray-200/50 dark:border-gray-800/50',
        'hidden lg:flex flex-col',
        className
      )}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50">
        <Link href="/pt/academy" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 via-green-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">Academy</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Cidadão.AI</p>
          </div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-2 rounded-xl bg-orange-50 dark:bg-orange-900/20">
            <Flame className="w-4 h-4 text-orange-500 mb-1" />
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {user.currentStreak}
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">dias</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20">
            <Clock className="w-4 h-4 text-blue-500 mb-1" />
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {Math.floor(user.totalTimeMinutes / 60)}h
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">estudo</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-purple-50 dark:bg-purple-900/20">
            <Target className="w-4 h-4 text-purple-500 mb-1" />
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {user.totalSessions}
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">sessões</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-3">
          Menu
        </p>
        {navItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl',
                'transition-all duration-200',
                'group relative overflow-hidden',
                active
                  ? 'bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent text-green-700 dark:text-green-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              {/* Active indicator */}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-green-500 to-blue-500 rounded-r-full" />
              )}

              <Icon
                className={cn(
                  'w-5 h-5 transition-transform duration-200',
                  active ? 'text-green-600 dark:text-green-400' : 'group-hover:scale-110'
                )}
              />
              <span className="flex-1">{item.label}</span>

              {item.badge && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200/50 dark:border-green-700/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Certificado</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Disponível ao concluir</p>
            </div>
          </div>
          <Link
            href="/pt/academy"
            className="block w-full text-center py-2 px-4 rounded-lg bg-white/80 dark:bg-gray-800/80 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            Ver progresso
          </Link>
        </div>
      </div>
    </aside>
  )
}
