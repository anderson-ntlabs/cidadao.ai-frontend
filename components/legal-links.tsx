import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LegalLinksProps {
  locale?: 'pt' | 'en'
  className?: string
}

/**
 * Compact footer with the privacy, responsible AI and terms links.
 * Used by layouts that hide the full public footer (signed-in app, Agora),
 * so the policies stay one click away on every page.
 */
export function LegalLinks({ locale = 'pt', className }: LegalLinksProps): JSX.Element {
  const links =
    locale === 'pt'
      ? [
          { href: '/pt/privacy', label: 'Política de Privacidade' },
          { href: '/pt/responsible-ai', label: 'IA Responsável' },
          { href: '/pt/terms', label: 'Termos de Uso' },
        ]
      : [
          { href: '/en/privacy', label: 'Privacy Policy' },
          { href: '/en/responsible-ai', label: 'Responsible AI' },
          { href: '/en/terms', label: 'Terms of Use' },
        ]

  return (
    <footer
      className={cn(
        'relative z-10 py-4 text-center text-xs text-gray-500 dark:text-gray-400',
        className
      )}
    >
      <nav
        aria-label={locale === 'pt' ? 'Links legais' : 'Legal links'}
        className="flex flex-wrap justify-center gap-x-4 gap-y-1"
      >
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="hover:underline">
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  )
}
