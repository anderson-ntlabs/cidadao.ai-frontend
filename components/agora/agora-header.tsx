/**
 * Agora Header Component
 *
 * Professional header following the design system with:
 * - Logo and branding
 * - User XP and avatar display
 * - Dropdown menu for user actions
 * - Navigation breadcrumbs
 * - Theme toggle and actions
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-06
 * Updated: 2025-12-07 - Added dropdown menu, fixed avatar and logout
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AvatarWithBadge } from '@/components/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  Calendar,
  User,
  Settings,
  ChevronDown,
  HelpCircle,
  Activity,
} from 'lucide-react'

interface AgoraHeaderProps {
  user: {
    name: string
    avatar?: string
    totalXp: number
    currentLevel: number
    currentRank: string
  }
  onLogout?: () => void
  isDemoMode?: boolean
  isKidsMode?: boolean
  kidsChildName?: string
  className?: string
}

// Navigation items for breadcrumb generation
const navItems = {
  '/pt/agora': { label: 'Dashboard', icon: Home },
  '/pt/agora/chat': { label: 'Chat com Agentes', icon: MessageSquare },
  '/pt/agora/agenda': { label: 'Agenda', icon: Calendar },
  '/pt/agora/diario': { label: 'Diário de Bordo', icon: BookOpen },
  '/pt/agora/videos': { label: 'Vídeos', icon: Video },
  '/pt/agora/leituras': { label: 'Leituras', icon: FileText },
  '/pt/agora/ranking': { label: 'Ranking', icon: Trophy },
  '/pt/agora/perfil': { label: 'Meu Perfil', icon: User },
  '/pt/agora/onboarding': { label: 'Onboarding', icon: Sparkles },
  '/pt/agora/configuracoes': { label: 'Configurações', icon: Settings },
  '/pt/agora/trilhas': { label: 'Trilhas', icon: BookOpen },
  '/pt/agora/ajuda': { label: 'Central de Ajuda', icon: HelpCircle },
  '/pt/agora/atividades': { label: 'Atividades', icon: Activity },
}

// Rank colors mapping
const rankColors: Record<string, string> = {
  novato: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  aprendiz: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  contribuidor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  mentor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  arquiteto: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

export function AgoraHeader({
  user,
  onLogout,
  isDemoMode = false,
  isKidsMode = false,
  kidsChildName,
  className,
}: AgoraHeaderProps) {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Kids mode display name
  const displayName = isKidsMode && kidsChildName ? kidsChildName : user.name

  // Generate breadcrumb from current path
  const getBreadcrumb = () => {
    const currentNav = navItems[pathname as keyof typeof navItems]
    if (!currentNav || pathname === '/pt/agora') return null

    return currentNav
  }

  const breadcrumb = getBreadcrumb()
  const rankColor = rankColors[user.currentRank] || rankColors.novato

  // Handle logout
  const handleLogout = () => {
    setIsMenuOpen(false)
    if (onLogout) {
      onLogout()
    }
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50',
        'bg-[hsl(var(--academy-card))]/80 backdrop-blur-xl',
        'border-b border-[hsl(var(--academy-border))]/50',
        'shadow-sm',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Breadcrumb */}
          <div className="flex items-center gap-4">
            <Link
              href="/pt/agora"
              className="flex items-center gap-3 group"
              aria-label="Agora Dashboard"
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
                <h1 className="font-bold academy-text group-hover:text-tarsila-verde transition-colors">
                  Ágora
                </h1>
                <p className="text-xs academy-text-muted">Cidadão.AI</p>
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
          <div className="flex items-center gap-2 sm:gap-3">
            {/* XP Display - Desktop (hidden in Kids mode) */}
            {!isKidsMode && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200/50 dark:border-yellow-700/30">
                <Sparkles className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="font-bold text-yellow-700 dark:text-yellow-400">
                  {user.totalXp.toLocaleString()} XP
                </span>
              </div>
            )}

            {/* XP Display - Mobile (compact, hidden in Kids mode) */}
            {!isKidsMode && (
              <div className="flex sm:hidden items-center gap-1 px-2 py-1 bg-yellow-100/80 dark:bg-yellow-900/30 rounded-lg">
                <Sparkles className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">
                  {user.totalXp >= 1000 ? `${(user.totalXp / 1000).toFixed(1)}k` : user.totalXp}
                </span>
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu Dropdown */}
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 pr-2 sm:pr-3 h-10 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <AvatarWithBadge
                    src={user.avatar}
                    alt={user.name}
                    fallbackInitial={user.name.charAt(0)}
                    size="sm"
                    showBadge={false}
                  />
                  {/* Mobile: Show level badge (hidden in Kids mode) */}
                  {!isKidsMode && (
                    <div className="flex sm:hidden items-center justify-center min-w-[24px] h-5 px-1 rounded bg-gray-100 dark:bg-gray-800">
                      <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">
                        {user.currentLevel}
                      </span>
                    </div>
                  )}
                  {/* Desktop: Show name and level (or just child name in Kids mode) */}
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">
                      {displayName.split(' ')[0]}
                    </span>
                    {!isKidsMode && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                        Lv.{user.currentLevel}
                      </span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                {/* User Info Header */}
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{isKidsMode ? displayName : user.name}</p>
                    {!isKidsMode && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" size="sm" className={cn('capitalize', rankColor)}>
                          {user.currentRank}
                        </Badge>
                        <span className="text-xs text-gray-500">Lv.{user.currentLevel}</span>
                      </div>
                    )}
                    {isKidsMode && <span className="text-xs text-gray-500">Área Kids</span>}
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* XP Display (mobile, hidden in Kids mode) */}
                {!isKidsMode && (
                  <div className="sm:hidden px-2 py-1.5">
                    <div className="flex items-center gap-2 px-2 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                      <Sparkles className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                        {user.totalXp.toLocaleString()} XP
                      </span>
                    </div>
                  </div>
                )}

                {!isKidsMode && <DropdownMenuSeparator className="sm:hidden" />}

                {/* Menu Items - Standard mode only */}
                {!isKidsMode && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/pt/agora/perfil"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-4 h-4" />
                        <span>Meu Perfil</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/pt/agora/ranking"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Trophy className="w-4 h-4" />
                        <span>Ranking</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/pt/agora/configuracoes"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Configurações</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <Link
                        href="/pt/agora/atividades"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Activity className="w-4 h-4" />
                        <span>Atividades</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/pt/agora/ajuda"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span>Ajuda</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                  </>
                )}

                {/* Logout/Reset */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className={cn(
                    'flex items-center gap-2 cursor-pointer',
                    isDemoMode
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {isDemoMode ? (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      <span>Resetar Demo</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>{isKidsMode ? 'Sair da Área Kids' : 'Sair'}</span>
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              — Explore a Ágora sem precisar fazer login
            </span>
          </div>
        </div>
      )}
    </header>
  )
}
