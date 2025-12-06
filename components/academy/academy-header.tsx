/**
 * Academy Header Component
 *
 * Professional header following the design system with:
 * - Logo and branding
 * - User XP and avatar display
 * - Navigation breadcrumbs
 * - Theme toggle and actions
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-06
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  GraduationCap,
  RotateCcw,
  LogOut,
  ChevronRight,
  Sparkles,
  Home,
  MessageSquare,
  BookOpen,
  Video,
  Trophy,
  FileText,
} from 'lucide-react'

interface AcademyHeaderProps {
  user: {
    name: string
    avatar: string
    totalXp: number
    currentLevel: number
    currentRank: string
  }
  onLogout?: () => void
  isDemoMode?: boolean
  className?: string
}

// Navigation items for breadcrumb generation
const navItems = {
  '/pt/academy': { label: 'Dashboard', icon: Home },
  '/pt/academy/chat': { label: 'Chat com Agentes', icon: MessageSquare },
  '/pt/academy/diario': { label: 'Diario de Bordo', icon: BookOpen },
  '/pt/academy/videos': { label: 'Videos', icon: Video },
  '/pt/academy/leituras': { label: 'Leituras', icon: FileText },
  '/pt/academy/ranking': { label: 'Ranking', icon: Trophy },
  '/pt/academy/onboarding': { label: 'Onboarding', icon: Sparkles },
}

// Rank colors mapping
const rankColors: Record<string, string> = {
  novato: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  aprendiz: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  contribuidor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  mentor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  arquiteto: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

export function AcademyHeader({
  user,
  onLogout,
  isDemoMode = false,
  className,
}: AcademyHeaderProps) {
  const pathname = usePathname()

  // Generate breadcrumb from current path
  const getBreadcrumb = () => {
    const currentNav = navItems[pathname as keyof typeof navItems]
    if (!currentNav || pathname === '/pt/academy') return null

    return currentNav
  }

  const breadcrumb = getBreadcrumb()
  const rankColor = rankColors[user.currentRank] || rankColors.novato

  return (
    <header
      className={cn(
        'sticky top-0 z-50',
        'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl',
        'border-b border-gray-200/50 dark:border-gray-800/50',
        'shadow-sm',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Breadcrumb */}
          <div className="flex items-center gap-4">
            <Link
              href="/pt/academy"
              className="flex items-center gap-3 group"
              aria-label="Academy Dashboard"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 via-green-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                  <Sparkles className="w-2.5 h-2.5 text-yellow-800" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  Academy
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Cidadao.AI</p>
              </div>
            </Link>

            {/* Breadcrumb */}
            {breadcrumb && (
              <div className="hidden md:flex items-center gap-2 text-sm">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100/80 dark:bg-gray-800/80 rounded-lg">
                  <breadcrumb.icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {breadcrumb.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right: User info + Actions */}
          <div className="flex items-center gap-3">
            {/* XP Display */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200/50 dark:border-yellow-700/30">
              <Sparkles className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="font-bold text-yellow-700 dark:text-yellow-400">
                {user.totalXp.toLocaleString()} XP
              </span>
            </div>

            {/* User Avatar + Info */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user.name.split(' ')[0]}
                </span>
                <Badge variant="outline" size="sm" className={cn('capitalize', rankColor)}>
                  Lv.{user.currentLevel} {user.currentRank}
                </Badge>
              </div>
              <div className="relative">
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={40}
                  height={40}
                  className="rounded-full ring-2 ring-green-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md">
                  {user.currentLevel}
                </div>
              </div>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Logout/Reset Button */}
            {onLogout && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                title={isDemoMode ? 'Resetar Demo' : 'Sair'}
              >
                {isDemoMode ? <RotateCcw className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Demo Banner - only show in demo mode */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
            <span className="animate-pulse">🎮</span>
            <span className="font-medium">Modo Demo</span>
            <span className="hidden sm:inline text-white/80">
              — Explore a Academy sem precisar fazer login
            </span>
          </div>
        </div>
      )}
    </header>
  )
}
