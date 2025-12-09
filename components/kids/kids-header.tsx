/**
 * Kids Header Component
 *
 * Simplified, child-friendly header for Kids mode.
 * Features larger text, vibrant colors, and simplified navigation.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

'use client'

import { useKids } from '@/hooks/use-kids'
import { Button } from '@/components/ui/button'
import { Home, MessageCircle, PlayCircle, LogOut } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'

interface KidsHeaderProps {
  lang?: 'pt' | 'en'
}

export function KidsHeader({ lang = 'pt' }: KidsHeaderProps) {
  const { childName, childAvatar, disableKidsMode } = useKids()
  const router = useRouter()
  const pathname = usePathname()

  const handleExitKidsMode = async () => {
    const confirmed = window.confirm(
      lang === 'pt' ? 'Quer sair da Área Kids?' : 'Do you want to exit Kids Area?'
    )
    if (confirmed) {
      await disableKidsMode()
      router.push(`/${lang}/agora`)
    }
  }

  const navItems = [
    {
      href: `/${lang}/agora/kids`,
      icon: Home,
      label: lang === 'pt' ? 'Início' : 'Home',
    },
    {
      href: `/${lang}/agora/kids/videos`,
      icon: PlayCircle,
      label: lang === 'pt' ? 'Vídeos' : 'Videos',
    },
    {
      href: `/${lang}/agora/kids/chat`,
      icon: MessageCircle,
      label: lang === 'pt' ? 'Conversar' : 'Chat',
    },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-primary/20 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-20 items-center justify-between px-4">
        {/* Logo and Child Name */}
        <div className="flex items-center gap-3">
          <Link href={`/${lang}/agora/kids`} className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border-3 border-primary bg-kids-cream">
              <Image
                src={
                  childAvatar === 'tarsila'
                    ? '/agents/tarsila_a_musa.png'
                    : '/agents/monteiro_lobato.jpg'
                }
                alt="Avatar"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">
                {lang === 'pt' ? 'Área Kids' : 'Kids Area'}
              </span>
              <span className="text-lg font-bold text-foreground">
                {lang === 'pt' ? 'Olá, ' : 'Hi, '}
                {childName || (lang === 'pt' ? 'Amiguinho' : 'Friend')}!
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href) ? 'primary' : 'ghost'}
                  className={`
                    kids-button gap-2 text-base
                    ${isActive(item.href) ? 'bg-primary text-primary-foreground' : ''}
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Exit Button */}
        <Button
          variant="secondary"
          onClick={handleExitKidsMode}
          className="kids-button border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="h-5 w-5 mr-2" />
          <span className="hidden sm:inline">{lang === 'pt' ? 'Sair' : 'Exit'}</span>
        </Button>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden flex justify-around border-t border-border py-2 bg-card">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className={`
                  flex flex-col items-center gap-1 h-auto py-2
                  ${isActive(item.href) ? 'text-primary' : 'text-muted-foreground'}
                `}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            </Link>
          )
        })}
      </nav>
    </header>
  )
}

export default KidsHeader
