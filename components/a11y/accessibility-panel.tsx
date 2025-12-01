'use client'

import { useState, useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { Settings, X, Eye, Type, Languages, Keyboard, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FontSizeControl } from './font-size-control'
import { HighContrastToggle } from './high-contrast-toggle'
import { VLibrasToggle } from './vlibras-toggle'
import { cn } from '@/lib/utils'

/**
 * Accessibility Panel Component
 *
 * Unified control panel for all accessibility features in the application.
 * Provides easy access to font size, high contrast, VLibras (LIBRAS), and
 * keyboard shortcuts information.
 *
 * Features:
 * - Floating action button (FAB) to open/close
 * - Keyboard shortcut: Alt + A
 * - Responsive design (mobile/desktop)
 * - Smooth animations
 * - Persistent state
 * - Screen reader announcements
 * - WCAG 2.1 AA compliant
 */

interface AccessibilityPanelProps {
  /**
   * Current locale
   */
  locale: 'pt' | 'en'

  /**
   * Additional CSS classes for the FAB
   */
  className?: string
}

export function AccessibilityPanel({ locale, className = '' }: AccessibilityPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const pathname = usePathname()

  // Detect if we're on a page with bottom input (chat)
  const isOnChatPage = pathname?.includes('/chat')

  const t = useMemo(
    () =>
      locale === 'pt'
        ? {
            title: 'Painel de Acessibilidade',
            open: 'Abrir painel de acessibilidade',
            close: 'Fechar painel de acessibilidade',
            fontSize: 'Tamanho da Fonte',
            fontSizeDesc: 'Ajuste o tamanho do texto para melhor leitura',
            highContrast: 'Alto Contraste',
            highContrastDesc: 'Aumenta o contraste para melhor visualização',
            vlibras: 'VLibras (LIBRAS)',
            vlibrasDesc: 'Tradução para Língua Brasileira de Sinais',
            shortcuts: 'Atalhos de Teclado',
            shortcutsDesc: 'Navegue usando o teclado',
            help: 'Guia de Acessibilidade',
            helpDesc: 'Aprenda a usar as ferramentas de acessibilidade',
            altA: 'Alt + A',
            openPanel: 'Abrir este painel',
            altH: 'Alt + H',
            toggleContrast: 'Alternar alto contraste',
            altPlus: 'Alt + +',
            increaseFontSize: 'Aumentar fonte',
            altMinus: 'Alt + -',
            decreaseFontSize: 'Diminuir fonte',
          }
        : {
            title: 'Accessibility Panel',
            open: 'Open accessibility panel',
            close: 'Close accessibility panel',
            fontSize: 'Font Size',
            fontSizeDesc: 'Adjust text size for better readability',
            highContrast: 'High Contrast',
            highContrastDesc: 'Increase contrast for better visibility',
            vlibras: 'VLibras (LIBRAS)',
            vlibrasDesc: 'Brazilian Sign Language translation',
            shortcuts: 'Keyboard Shortcuts',
            shortcutsDesc: 'Navigate using keyboard',
            help: 'Accessibility Guide',
            helpDesc: 'Learn how to use accessibility tools',
            altA: 'Alt + A',
            openPanel: 'Open this panel',
            altH: 'Alt + H',
            toggleContrast: 'Toggle high contrast',
            altPlus: 'Alt + +',
            increaseFontSize: 'Increase font size',
            altMinus: 'Alt + -',
            decreaseFontSize: 'Decrease font size',
          },
    [locale]
  )

  useEffect(() => {
    setIsMounted(true)

    // Keyboard shortcut: Alt + A
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        setIsOpen((prev) => !prev)

        // Announce to screen readers
        const announcement = document.createElement('div')
        announcement.setAttribute('role', 'status')
        announcement.setAttribute('aria-live', 'polite')
        announcement.className = 'sr-only'
        announcement.textContent = !isOpen
          ? `${t.title} ${t.open.toLowerCase()}`
          : `${t.title} ${t.close.toLowerCase()}`
        document.body.appendChild(announcement)
        setTimeout(() => document.body.removeChild(announcement), 1000)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, t])

  // Don't render on server
  if (!isMounted) {
    return null
  }

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <Button
        onClick={() => {
          if (isMinimized) {
            setIsMinimized(false)
          } else {
            setIsOpen(!isOpen)
          }
        }}
        onDoubleClick={() => setIsMinimized(!isMinimized)}
        className={cn(
          'fixed z-40 rounded-full shadow-xl',
          'bg-green-600 hover:bg-green-700 text-white',
          'transition-all duration-300',
          'hover:scale-110 focus:ring-4 focus:ring-green-300',
          // Adjust position based on context
          isOnChatPage ? 'bottom-32 right-4' : 'bottom-24 right-4',
          // Size based on minimized state
          isMinimized ? 'h-10 w-10' : 'h-14 w-14',
          className
        )}
        aria-label={isOpen ? t.close : t.open}
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
        title={isMinimized ? 'Clique para expandir' : 'Duplo clique para minimizar'}
      >
        {isOpen ? (
          <X className={isMinimized ? 'h-4 w-4' : 'h-6 w-6'} />
        ) : (
          <Settings className={isMinimized ? 'h-4 w-4' : 'h-6 w-6'} />
        )}
      </Button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div
          id="accessibility-panel"
          className={cn(
            'fixed right-4 z-40',
            'w-[90vw] max-w-md',
            'bg-white/95 dark:bg-gray-900/95',
            'backdrop-blur-lg rounded-2xl',
            'shadow-2xl border border-gray-200 dark:border-gray-700',
            'transition-all duration-300',
            'animate-in slide-in-from-bottom-5 fade-in',
            // Adjust panel position based on FAB position
            isOnChatPage ? 'bottom-48' : 'bottom-40'
          )}
          role="dialog"
          aria-label={t.title}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t.title}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label={t.close}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Font Size Control */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Type className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t.fontSize}</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.fontSizeDesc}</p>
              <FontSizeControl locale={locale} />
            </div>

            {/* High Contrast Toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {t.highContrast}
                  </h3>
                </div>
                <HighContrastToggle />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.highContrastDesc}</p>
            </div>

            {/* VLibras Toggle (Portuguese only) */}
            {locale === 'pt' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Languages className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t.vlibras}</h3>
                  </div>
                  <VLibrasToggle locale={locale} variant="switch" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.vlibrasDesc}</p>
              </div>
            )}

            {/* Keyboard Shortcuts */}
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t.shortcuts}</h3>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t.openPanel}</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 font-mono text-xs">
                    {t.altA}
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t.toggleContrast}</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 font-mono text-xs">
                    {t.altH}
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t.increaseFontSize}</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 font-mono text-xs">
                    {t.altPlus}
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t.decreaseFontSize}</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 font-mono text-xs">
                    {t.altMinus}
                  </kbd>
                </div>
              </div>
            </div>

            {/* Help Link */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium transition-colors min-h-[44px] py-2">
                <HelpCircle className="h-4 w-4" />
                {t.help}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 animate-in fade-in"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
