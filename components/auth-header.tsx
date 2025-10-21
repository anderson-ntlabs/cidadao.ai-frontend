'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Home, MessageSquare, LayoutDashboard, Bell, User, Settings, LogOut } from 'lucide-react'
import Image from 'next/image'
import { ThemeToggle } from './theme-toggle'
import { Button, NotificationDropdown } from '@/components/ui'
import { toast } from '@/hooks/use-toast'

interface AuthHeaderProps {
  locale: 'pt' | 'en'
  user: any
}

export function AuthHeader({ locale, user }: AuthHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  
  // System is PT-only (English landing page doesn't use authenticated routes)
  // Phase 1: Only Home and Chat are active
  const navigation = [
    { name: 'Início', href: '/pt/home', icon: Home, active: true },
    { name: 'Chat com IAs', href: '/pt/chat', icon: MessageSquare, active: true },
    { name: 'Dashboard', href: '/pt/dashboard', icon: LayoutDashboard, active: false, comingSoon: true },
    { name: 'Notificações', href: '/pt/notificacoes', icon: Bell, active: false, comingSoon: true },
  ]
      
  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    toast.success(
      locale === 'pt' ? 'Até logo!' : 'See you later!',
      locale === 'pt' ? 'Logout realizado com sucesso' : 'Logged out successfully'
    )
    router.push(`/${locale}`)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800/50">
      <nav className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}/home`} className="flex items-center space-x-3">
            <Image
              src="/forum-icon.png"
              alt="Cidadão.AI"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Cidadão.AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              const isDisabled = item.active === false
              const isActive = pathname === item.href

              if (isDisabled) {
                return (
                  <div
                    key={item.name}
                    className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    title="Em breve"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                    {item.comingSoon && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold bg-yellow-500 text-white rounded">
                        EM BREVE
                      </span>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  data-tour={item.href.includes('chat') ? 'chat-button' : item.href.includes('notificacoes') ? 'notifications' : undefined}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Right side items */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <NotificationDropdown locale={locale} />
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* User Menu */}
            <div className="hidden md:flex items-center gap-3">
              <Link href={`/${locale}/perfil`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  {user?.name || 'Perfil'}
                </Button>
              </Link>
              
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                {locale === 'pt' ? 'Sair' : 'Logout'}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200/50 dark:border-gray-800/50">
            <div className="flex flex-col space-y-3">
              {navigation.map((item) => {
                const isDisabled = item.active === false
                const isActive = pathname === item.href

                if (isDisabled) {
                  return (
                    <div
                      key={item.name}
                      className="relative flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                      {item.comingSoon && (
                        <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-yellow-500 text-white rounded">
                          EM BREVE
                        </span>
                      )}
                    </div>
                  )
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                )
              })}
              
              <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mt-3">
                <Link
                  href={`/${locale}/perfil`}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300"
                >
                  <User className="w-4 h-4" />
                  {locale === 'pt' ? 'Meu Perfil' : 'My Profile'}
                </Link>
                
                <Link
                  href={`/${locale}/configuracoes`}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300"
                >
                  <Settings className="w-4 h-4" />
                  {locale === 'pt' ? 'Configurações' : 'Settings'}
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="w-4 h-4" />
                  {locale === 'pt' ? 'Sair' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}