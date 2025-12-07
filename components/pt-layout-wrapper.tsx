'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/header'
import { SimplifiedHeader } from '@/components/landing'
import { FooterWithSurvey } from '@/components/footer-with-survey'
import type { NavigationItem } from '@/components/navigation'

interface PTLayoutWrapperProps {
  children: React.ReactNode
  locale: 'pt' | 'en'
}

export function PTLayoutWrapper({ children, locale }: PTLayoutWrapperProps) {
  const pathname = usePathname()

  // Check if we're in an authenticated route by looking for the (authenticated) route group
  const isAuthenticatedRoute =
    pathname.includes('/app/') ||
    pathname === `/${locale}/app` ||
    pathname.includes('/dashboard') ||
    pathname.includes('/chat') ||
    pathname.includes('/investigacoes') ||
    pathname.includes('/home') ||
    pathname.includes('/perfil') ||
    pathname.includes('/settings')

  // Agora has its own layout - no main site header/footer
  const isAgoraRoute = pathname.includes('/agora')

  // Check if we're on the landing page (root locale path) or login page
  const isLandingPage = pathname === `/${locale}` || pathname === `/${locale}/`
  const isLoginPage = pathname === `/${locale}/login` || pathname === `/${locale}/login/`

  // Use simplified header for landing page AND login page
  const useSimplifiedHeader = isLandingPage || isLoginPage

  const publicNavigationItems: NavigationItem[] =
    locale === 'pt'
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

  // Ágora routes have their own standalone layout
  if (isAgoraRoute) {
    return (
      <main id="main-content" role="main" className="flex-1">
        {children}
      </main>
    )
  }

  return (
    <>
      {/* Show appropriate header based on route */}
      {!isAuthenticatedRoute &&
        (useSimplifiedHeader ? (
          // Simplified header for landing page and login page
          <SimplifiedHeader locale={locale} />
        ) : (
          // Full header for other public pages
          <Header locale={locale} user={null} navigationItems={publicNavigationItems} />
        ))}
      <main
        id="main-content"
        role="main"
        className={`flex-1 ${!isAuthenticatedRoute ? 'pt-16' : ''}`}
      >
        {children}
      </main>
      {/* Only show footer on public pages */}
      {!isAuthenticatedRoute && <FooterWithSurvey locale={locale} />}
    </>
  )
}
