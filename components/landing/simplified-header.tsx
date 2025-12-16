/**
 * SimplifiedHeader Component
 *
 * Minimalist header for landing page with only essential elements:
 * - Logo + Brand name
 * - Language selector (PT/EN with flags)
 * - Theme toggle
 * - Login button
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-11-06
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

interface SimplifiedHeaderProps {
  locale: 'pt' | 'en'
  className?: string
}

export function SimplifiedHeader({ locale, className }: SimplifiedHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()

  const toggleLanguage = () => {
    const newLocale = locale === 'pt' ? 'en' : 'pt'
    const currentPath = pathname || `/${locale}`

    // EN version only has landing, about, agents, manifesto pages
    // For /app/* routes, stay on PT (system is PT-only)
    if (currentPath.includes('/app') || currentPath.includes('/agora')) {
      // Can't switch to EN for app/agora routes - redirect to EN landing
      if (newLocale === 'en') {
        router.push('/en')
        return
      }
    }

    // Replace only the first occurrence of the locale in the path
    const newPath = currentPath.replace(new RegExp(`^/${locale}`), `/${newLocale}`)
    router.push(newPath)
  }

  const texts = {
    pt: {
      login: 'Entrar',
      languageLabel: 'Alterar idioma para Inglês',
    },
    en: {
      login: 'Login',
      languageLabel: 'Switch language to Portuguese',
    },
  }

  const t = texts[locale]

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg',
        'border-b border-gray-200/50 dark:border-gray-800/50',
        'shadow-lg',
        className
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6" role="navigation">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Brand */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3 group"
            aria-label="Cidadão.AI Home"
          >
            <Image
              src="/forum-icon.png"
              alt="Greek Forum"
              width={40}
              height={40}
              className="rounded-lg shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-110"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 via-yellow-500 to-blue-600 bg-clip-text text-transparent">
              Cidadão.AI
            </span>
          </Link>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Language Selector - Just flags */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={t.languageLabel}
              title={t.languageLabel}
            >
              <span
                className="text-2xl"
                role="img"
                aria-label={locale === 'pt' ? 'Bandeira do Brasil' : 'US Flag'}
              >
                {locale === 'pt' ? '🇧🇷' : '🇺🇸'}
              </span>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Login Button */}
            <Link href={`/${locale}/login`}>
              <Button
                variant="primary"
                size="sm"
                className="bg-gradient-green-blue hover:shadow-lg transition-all duration-300"
              >
                {t.login}
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
