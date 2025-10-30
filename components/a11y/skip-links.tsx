/**
 * Skip Links Component
 *
 * Provides keyboard navigation shortcuts to main content areas.
 * These links are visually hidden but become visible when focused,
 * allowing keyboard users to quickly jump to important sections.
 *
 * WCAG 2.1 Level A requirement (2.4.1 Bypass Blocks)
 *
 * @author Anderson Henrique da Silva
 * @date 2025-01-30
 */

'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export interface SkipLink {
  /**
   * Unique identifier for the skip link
   */
  id: string
  /**
   * Display text for the link
   */
  label: string
  /**
   * Target element ID to scroll to
   */
  targetId: string
  /**
   * Optional keyboard shortcut hint
   */
  shortcut?: string
}

interface SkipLinksProps {
  /**
   * Array of skip links to render
   * @default Default links (main content, navigation, search)
   */
  links?: SkipLink[]
  /**
   * Custom className for styling
   */
  className?: string
  /**
   * Language for localized labels
   */
  locale?: 'pt' | 'en'
}

const defaultLinksMap = {
  pt: [
    {
      id: 'skip-to-main',
      label: 'Pular para conteúdo principal',
      targetId: 'main-content',
      shortcut: 'Alt + M'
    },
    {
      id: 'skip-to-nav',
      label: 'Pular para navegação',
      targetId: 'main-navigation',
      shortcut: 'Alt + N'
    },
    {
      id: 'skip-to-search',
      label: 'Pular para busca',
      targetId: 'search',
      shortcut: 'Alt + S'
    },
    {
      id: 'skip-to-footer',
      label: 'Pular para rodapé',
      targetId: 'footer',
      shortcut: 'Alt + F'
    }
  ],
  en: [
    {
      id: 'skip-to-main',
      label: 'Skip to main content',
      targetId: 'main-content',
      shortcut: 'Alt + M'
    },
    {
      id: 'skip-to-nav',
      label: 'Skip to navigation',
      targetId: 'main-navigation',
      shortcut: 'Alt + N'
    },
    {
      id: 'skip-to-search',
      label: 'Skip to search',
      targetId: 'search',
      shortcut: 'Alt + S'
    },
    {
      id: 'skip-to-footer',
      label: 'Skip to footer',
      targetId: 'footer',
      shortcut: 'Alt + F'
    }
  ]
}

/**
 * SkipLinks Component
 *
 * Renders accessible skip navigation links that appear on keyboard focus.
 * Should be the first focusable element in the document.
 *
 * @example
 * ```tsx
 * // In your root layout
 * <body>
 *   <SkipLinks locale="pt" />
 *   <Navigation id="main-navigation" />
 *   <main id="main-content">...</main>
 * </body>
 * ```
 */
export function SkipLinks({
  links,
  className,
  locale = 'pt'
}: SkipLinksProps) {
  const [mounted, setMounted] = useState(false)
  const skipLinks = links || defaultLinksMap[locale]

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSkipClick = (targetId: string) => {
    const target = document.getElementById(targetId)

    if (target) {
      // Smooth scroll to target
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })

      // Set focus to target
      // Make target focusable if it isn't already
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1')
      }

      target.focus()

      // Remove tabindex after focus (cleanup)
      target.addEventListener('blur', () => {
        target.removeAttribute('tabindex')
      }, { once: true })
    }
  }

  if (!mounted) return null

  return (
    <nav
      aria-label={locale === 'pt' ? 'Links de navegação rápida' : 'Skip navigation links'}
      className={cn('skip-links', className)}
    >
      <ul className="flex flex-col gap-1">
        {skipLinks.map((link) => (
          <li key={link.id}>
            <a
              href={`#${link.targetId}`}
              onClick={(e) => {
                e.preventDefault()
                handleSkipClick(link.targetId)
              }}
              className={cn(
                // Base styles
                'inline-block px-4 py-2 rounded-lg',
                'bg-gradient-to-r from-green-600 to-blue-600',
                'text-white font-medium text-sm',
                'transition-all duration-200',

                // Focus styles (visible when focused)
                'focus:outline-none focus:ring-4 focus:ring-green-500/50',

                // Position: Fixed at top, hidden by default
                'fixed top-2 left-2 z-[9999]',

                // Hidden until focused (skip-link pattern)
                '-translate-y-full opacity-0',
                'focus:translate-y-0 focus:opacity-100',

                // Ensure keyboard focus visibility
                'focus-visible:translate-y-0 focus-visible:opacity-100',

                // Hover styles (when visible)
                'hover:shadow-lg hover:scale-105'
              )}
            >
              <span className="flex items-center gap-2">
                {link.label}
                {link.shortcut && (
                  <kbd className="hidden sm:inline-flex px-2 py-0.5 text-xs bg-white/20 rounded">
                    {link.shortcut}
                  </kbd>
                )}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/**
 * Hook to programmatically trigger skip link functionality
 */
export function useSkipTo() {
  const skipTo = (targetId: string) => {
    const target = document.getElementById(targetId)

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })

      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1')
      }

      target.focus()

      target.addEventListener('blur', () => {
        target.removeAttribute('tabindex')
      }, { once: true })
    }
  }

  return { skipTo }
}
