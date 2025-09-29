'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface LanguageSwitcherV2Props {
  className?: string
  variant?: 'default' | 'mobile'
}

export function LanguageSwitcherV2({ className, variant = 'default' }: LanguageSwitcherV2Props) {
  const pathname = usePathname()
  const currentLang = pathname.startsWith('/en') ? 'en' : 'pt'
  
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
  
  if (variant === 'mobile') {
    return (
      <div className={cn("flex gap-2", className)}>
        <Link
          href={getLocalizedPath('pt')}
          className={cn(
            "flex-1 px-3 py-2 rounded text-sm font-medium text-center transition-colors",
            currentLang === 'pt' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          )}
        >
          Português
        </Link>
        <Link
          href={getLocalizedPath('en')}
          className={cn(
            "flex-1 px-3 py-2 rounded text-sm font-medium text-center transition-colors",
            currentLang === 'en' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          )}
        >
          English
        </Link>
      </div>
    )
  }
  
  return (
    <div className={cn("flex gap-2", className)}>
      <Link
        href={getLocalizedPath('pt')}
        className={cn(
          "px-2 py-1 rounded text-sm font-medium transition-colors",
          currentLang === 'pt' 
            ? 'bg-green-600 text-white' 
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
        )}
      >
        PT
      </Link>
      <Link
        href={getLocalizedPath('en')}
        className={cn(
          "px-2 py-1 rounded text-sm font-medium transition-colors",
          currentLang === 'en' 
            ? 'bg-green-600 text-white' 
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
        )}
      >
        EN
      </Link>
    </div>
  )
}

// Export with both names for compatibility
export { LanguageSwitcherV2 as LanguageSwitcher }