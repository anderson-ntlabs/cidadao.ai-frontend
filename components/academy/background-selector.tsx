'use client'

import { useState, useEffect } from 'react'
import { Check, Palette, Image, Sun, Moon, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  useAcademyBackground,
  BACKGROUND_OPTIONS,
  type BackgroundOption,
} from '@/hooks/use-academy-background'

/**
 * Background Selector Component
 *
 * Allows users to customize their Academy dashboard background
 * with Tarsila-inspired colors and TCC slide images.
 *
 * Design: Bo Bardi + Dumont + Anderson
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-06
 */

interface BackgroundSelectorProps {
  isOpen: boolean
  onClose: () => void
}

export function BackgroundSelector({ isOpen, onClose }: BackgroundSelectorProps) {
  // Detect dark mode
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mediaQuery.matches || document.documentElement.classList.contains('dark'))

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mediaQuery.addEventListener('change', handler)

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      mediaQuery.removeEventListener('change', handler)
      observer.disconnect()
    }
  }, [])

  const [activeTab, setActiveTab] = useState<'colors' | 'images'>('colors')

  const {
    preference,
    setLightBackground,
    setDarkBackground,
    toggleOverlay,
    setOverlayOpacity,
    resetToDefaults,
  } = useAcademyBackground()

  const currentBgId = isDark ? preference.darkBackground : preference.lightBackground
  const setBackground = isDark ? setDarkBackground : setLightBackground

  const colorOptions = BACKGROUND_OPTIONS.filter(
    (bg) => bg.type === 'solid' || bg.type === 'gradient'
  )
  const imageOptions = BACKGROUND_OPTIONS.filter((bg) => bg.type === 'image')

  if (!isOpen) return null

  const renderBackgroundOption = (bg: BackgroundOption) => {
    const isSelected = currentBgId === bg.id
    const previewStyle: React.CSSProperties =
      bg.type === 'image'
        ? {
            backgroundImage: `url(${bg.value})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }
        : bg.type === 'gradient'
          ? { background: bg.value }
          : { backgroundColor: bg.value }

    return (
      <button
        key={bg.id}
        onClick={() => setBackground(bg.id)}
        className={cn(
          'relative group rounded-xl overflow-hidden transition-all duration-200',
          'hover:ring-2 hover:ring-offset-2 hover:ring-offset-background',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          bg.type === 'image' ? 'aspect-video' : 'aspect-square',
          isSelected
            ? 'ring-2 ring-offset-2 ring-tarsila-amarelo dark:ring-yellow-400'
            : 'hover:ring-gray-300 dark:hover:ring-gray-600'
        )}
      >
        <div className="absolute inset-0" style={previewStyle} />
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/60 to-transparent',
            'opacity-0 group-hover:opacity-100 transition-opacity'
          )}
        />
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p
            className={cn(
              'text-xs font-medium truncate transition-colors',
              'text-transparent group-hover:text-white'
            )}
          >
            {bg.name}
          </p>
          {bg.artist && (
            <p className="text-[10px] text-transparent group-hover:text-white/70 truncate">
              {bg.artist}
            </p>
          )}
        </div>
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-tarsila-amarelo dark:bg-yellow-400 flex items-center justify-center">
            <Check className="w-4 h-4 text-white dark:text-gray-900" />
          </div>
        )}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-2xl max-h-[85vh] overflow-hidden',
          'rounded-2xl shadow-2xl',
          'bg-white dark:bg-gray-900',
          'border border-gray-200 dark:border-gray-800'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Personalizar Fundo
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Escolha um fundo para o modo {isDark ? 'escuro' : 'claro'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs">
              {isDark ? (
                <>
                  <Moon className="w-3 h-3" />
                  <span>Escuro</span>
                </>
              ) : (
                <>
                  <Sun className="w-3 h-3" />
                  <span>Claro</span>
                </>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('colors')}
            className={cn(
              'flex-1 py-3 text-sm font-medium transition-colors',
              activeTab === 'colors'
                ? 'text-tarsila-amarelo dark:text-yellow-400 border-b-2 border-tarsila-amarelo dark:border-yellow-400'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <Palette className="w-4 h-4" />
              Cores e Gradientes
            </div>
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={cn(
              'flex-1 py-3 text-sm font-medium transition-colors',
              activeTab === 'images'
                ? 'text-tarsila-amarelo dark:text-yellow-400 border-b-2 border-tarsila-amarelo dark:border-yellow-400'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <Image className="w-4 h-4" />
              Imagens do TCC
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {activeTab === 'colors' ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Paleta Tarsila do Amaral
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {colorOptions.map(renderBackgroundOption)}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Slides do TCC - Cidadao.AI
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {imageOptions.map(renderBackgroundOption)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Overlay Settings */}
        {BACKGROUND_OPTIONS.find((bg) => bg.id === currentBgId)?.type === 'image' && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preference.useOverlay}
                    onChange={toggleOverlay}
                    className="w-4 h-4 rounded border-gray-300 text-tarsila-amarelo focus:ring-tarsila-amarelo"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Usar overlay para legibilidade
                  </span>
                </label>
              </div>
              {preference.useOverlay && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Opacidade:</span>
                  <input
                    type="range"
                    min="0.5"
                    max="0.95"
                    step="0.05"
                    value={preference.overlayOpacity}
                    onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                    className="w-20 h-1 rounded-full bg-gray-300 dark:bg-gray-600"
                  />
                  <span className="text-xs text-gray-500 w-8">
                    {Math.round(preference.overlayOpacity * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <Button variant="ghost" size="sm" onClick={resetToDefaults}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Restaurar padrao
          </Button>
          <div className="text-xs text-gray-400 dark:text-gray-500 designer-signature">
            Design: Bo Bardi + Dumont + Anderson
          </div>
        </div>
      </div>
    </div>
  )
}
