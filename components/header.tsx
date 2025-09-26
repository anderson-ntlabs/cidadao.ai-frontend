'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LogIn, LogOut, User } from 'lucide-react'
import Image from 'next/image'
import { ThemeToggle } from './theme-toggle'
import { Button, NotificationDropdown } from '@/components/ui'
import { useAuth } from '@/hooks/use-supabase-auth'

interface HeaderProps {
  locale: 'pt' | 'en'
}

export function Header({ locale }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuth()
  
  // Check if we're on landing page
  const isLandingPage = pathname === '/pt' || pathname === '/en'
  
  // Function to get the current page path without locale
  const getLocalizedPath = (targetLocale: 'pt' | 'en') => {
    // Remove current locale from pathname
    const pathWithoutLocale = pathname.replace(/^\/(pt|en)/, '')
    // If it's the home page or empty, return just the locale
    if (!pathWithoutLocale || pathWithoutLocale === '/') {
      return `/${targetLocale}`
    }
    // Otherwise, return the locale + current path
    return `/${targetLocale}${pathWithoutLocale}`
  }
  
  const publicNavigation = locale === 'pt' 
    ? [
        { name: 'Início', href: '/pt' },
        { name: 'Agentes', href: '/pt/agents' },
        { name: 'Sobre', href: '/pt/about' },
        { name: 'Manifesto', href: '/pt/manifesto' },
        { name: 'Sistema', href: '/pt/system' },
      ]
    : [
        { name: 'Home', href: '/en' },
        { name: 'Agents', href: '/en/agents' },
        { name: 'About', href: '/en/about' },
        { name: 'Manifesto', href: '/en/manifesto' },
        { name: 'System', href: '/en/system' },
      ]

  const authenticatedNavigation = locale === 'pt'
    ? [
        { name: 'Home', href: '/pt/home' },
        { name: 'Chat', href: '/pt/chat' },
        { name: 'Investigações', href: '/pt/investigacoes' },
        { name: 'Dashboard', href: '/pt/dashboard' },
      ]
    : [] // No authenticated navigation in English

  // Always show public navigation on landing page
  const navigation = isLandingPage ? publicNavigation : (isAuthenticated ? authenticatedNavigation : publicNavigation)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      const currentIndex = navigation.findIndex(item => item.href === pathname)
      let newIndex = currentIndex

      if (e.key === 'ArrowLeft') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : navigation.length - 1
      } else if (e.key === 'ArrowRight') {
        newIndex = currentIndex < navigation.length - 1 ? currentIndex + 1 : 0
      }

      const link = document.querySelector(`[href="${navigation[newIndex].href}"]`) as HTMLElement
      link?.focus()
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800/50">
      <nav id="main-navigation" role="navigation" aria-label="Main navigation" className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-3">
            <Image
              src="/forum-icon.png"
              alt="Greek Forum"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Cidadão.AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-green-600 ${
                  pathname === item.href 
                    ? 'text-green-600' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Language Switcher Desktop */}
            <div className="flex gap-2 ml-6 pl-6 border-l border-gray-300 dark:border-gray-700">
              <Link
                href={getLocalizedPath('pt')}
                className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                  locale === 'pt' 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                PT
              </Link>
              <Link
                href={getLocalizedPath('en')}
                className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                  locale === 'en' 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                EN
              </Link>
              
              {/* Notifications */}
              <div className="ml-2">
                <NotificationDropdown locale={locale} />
              </div>
              
              {/* Theme Toggle */}
              <div className="ml-2">
                <ThemeToggle />
              </div>
            </div>
            
            {/* Auth Button Desktop */}
            {isAuthenticated && !isLandingPage ? (
              <div className="ml-4 flex items-center gap-3">
                {/* User Menu */}
                <Link
                  href={`/${locale}/perfil`}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  <User size={20} />
                  <span className="hidden lg:inline">{user?.name || user?.email}</span>
                </Link>
                
                {/* Logout Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={logout}
                  className="flex items-center gap-2"
                >
                  <LogOut size={16} />
                  <span>
                    {locale === 'pt' ? 'Sair' : 'Logout'}
                  </span>
                </Button>
              </div>
            ) : !isLandingPage ? (
              <Link
                href="/pt/login"
                className="ml-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-shadow"
              >
                <LogIn size={18} />
                <span>
                  {locale === 'pt' ? 'Entrar' : 'Login'}
                </span>
              </Link>
            ) : null}
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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200/50 dark:border-gray-800/50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
            <div className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                    pathname === item.href 
                      ? 'bg-green-50 text-green-600 dark:bg-green-900/20' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Language and Theme Switcher Mobile */}
              <div className="px-3 pt-3 mt-3 border-t border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Link
                      href={getLocalizedPath('pt')}
                      onClick={() => setIsMenuOpen(false)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        locale === 'pt' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      Português
                    </Link>
                    <Link
                      href={getLocalizedPath('en')}
                      onClick={() => setIsMenuOpen(false)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        locale === 'en' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      English
                    </Link>
                  </div>
                  
                  {/* Theme Toggle Mobile */}
                  <ThemeToggle />
                </div>
              </div>
              
              {/* Auth Section Mobile */}
              <div className="px-3 mt-3 space-y-3">
                {isAuthenticated && !isLandingPage ? (
                  <>
                    {/* User Profile Link */}
                    <Link
                      href={`/${locale}/perfil`}
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <User size={20} />
                      <span>{user?.name || user?.email}</span>
                    </Link>
                    
                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        setIsMenuOpen(false)
                        logout()
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      <LogOut size={20} />
                      {locale === 'pt' ? 'Sair' : 'Logout'}
                    </button>
                  </>
                ) : !isLandingPage ? (
                  <Link
                    href="/pt/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
                  >
                    <LogIn size={20} />
                    {locale === 'pt' ? 'Entrar' : 'Login'}
                  </Link>
                ) : null}</div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}