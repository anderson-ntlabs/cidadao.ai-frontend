'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const languages = [
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
] as const

export function LanguageSelector({ className }: { className?: string }) {
  const pathname = usePathname()
  const router = useRouter()

  // Detect current language from pathname
  const currentLang = pathname.startsWith('/en') ? 'en' : 'pt'
  const currentLanguage = languages.find(lang => lang.code === currentLang)

  const switchLanguage = (newLang: 'pt' | 'en') => {
    if (newLang === currentLang) return

    // Map current path to new language
    let newPath = pathname

    if (currentLang === 'pt' && newLang === 'en') {
      // PT → EN: Replace /pt with /en
      newPath = pathname.replace(/^\/pt(\/|$)/, '/en$1')

      // Map Portuguese-specific routes to English equivalents
      const routeMap: Record<string, string> = {
        '/en/agentes': '/en/agents',
        '/en/sobre': '/en/about',
        '/en/privacidade': '/en/privacy',
        '/en/termos': '/en/terms',
        '/en/ajuda': '/en/help',
      }

      for (const [ptRoute, enRoute] of Object.entries(routeMap)) {
        if (newPath.startsWith(ptRoute)) {
          newPath = newPath.replace(ptRoute, enRoute)
          break
        }
      }
    } else if (currentLang === 'en' && newLang === 'pt') {
      // EN → PT: Replace /en with /pt
      newPath = pathname.replace(/^\/en(\/|$)/, '/pt$1')

      // Map English-specific routes to Portuguese equivalents
      const routeMap: Record<string, string> = {
        '/pt/agents': '/pt/agentes',
        '/pt/about': '/pt/sobre',
        '/pt/privacy': '/pt/privacidade',
        '/pt/terms': '/pt/termos',
        '/pt/help': '/pt/ajuda',
      }

      for (const [enRoute, ptRoute] of Object.entries(routeMap)) {
        if (newPath.startsWith(enRoute)) {
          newPath = newPath.replace(enRoute, ptRoute)
          break
        }
      }
    }

    // If path is just root, ensure proper locale
    if (newPath === '/pt' || newPath === '/en' || newPath === '/') {
      newPath = `/${newLang}`
    }

    router.push(newPath)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'gap-2 text-gray-700 dark:text-gray-300',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            className
          )}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage?.flag}</span>
          <span className="hidden md:inline">{currentLanguage?.label}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => switchLanguage(lang.code)}
            className={cn(
              'cursor-pointer gap-2',
              currentLang === lang.code && 'bg-green-50 dark:bg-green-900/20'
            )}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="flex-1">{lang.label}</span>
            {currentLang === lang.code && (
              <span className="text-green-600 dark:text-green-400">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
