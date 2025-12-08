'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Check, Palette, ImageIcon, Shuffle, RotateCcw, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAgoraBackground, type BackgroundOption } from '@/hooks/use-agora-background'

/**
 * Background Selector Modal
 *
 * Allows users to customize their Academy dashboard background.
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
  const [activeTab, setActiveTab] = useState<'colors' | 'images'>('colors')
  const [isDark, setIsDark] = useState(false)

  // Detect dark mode - ONLY check the app's theme class, NOT system preference
  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkDark = () => {
      // Only check the actual class on the document, not system preference
      setIsDark(document.documentElement.classList.contains('dark'))
    }

    checkDark()

    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      observer.disconnect()
    }
  }, [])

  const {
    currentBackground,
    setBackground,
    toggleOverlay,
    setOverlayOpacity,
    overlayEnabled,
    overlayOpacity,
    randomMode,
    toggleRandomMode,
    reset,
    solidOptions,
    gradientOptions,
    imageOptions,
  } = useAgoraBackground()

  if (!isOpen) return null

  const colorOptions = [...solidOptions, ...gradientOptions]

  const renderColorOption = (bg: BackgroundOption) => {
    const isSelected = currentBackground?.id === bg.id

    return (
      <button
        key={bg.id}
        onClick={() => setBackground(bg.id)}
        className={cn(
          'relative w-16 h-16 rounded-xl overflow-hidden transition-all duration-200',
          'hover:scale-105 hover:shadow-lg',
          'focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2',
          isSelected && 'ring-2 ring-yellow-500 ring-offset-2'
        )}
        title={bg.name}
      >
        <div
          className="absolute inset-0"
          style={bg.type === 'gradient' ? { background: bg.value } : { backgroundColor: bg.value }}
        />
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Check className="w-6 h-6 text-white" />
          </div>
        )}
      </button>
    )
  }

  const renderImageOption = (bg: BackgroundOption) => {
    const isSelected = currentBackground?.id === bg.id

    return (
      <button
        key={bg.id}
        onClick={() => setBackground(bg.id)}
        className={cn(
          'relative aspect-video rounded-xl overflow-hidden transition-all duration-200',
          'hover:scale-[1.02] hover:shadow-lg',
          'focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2',
          isSelected && 'ring-2 ring-yellow-500 ring-offset-2'
        )}
        title={bg.name}
      >
        {/* SVG Background Preview */}
        <div
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700"
          style={{
            backgroundImage: `url(${bg.value})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Hover overlay with name */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
          <div className="absolute bottom-2 left-2 right-2">
            <p className="text-white text-xs font-medium truncate">{bg.name}</p>
            <p className="text-white/70 text-[10px]">{bg.artist}</p>
          </div>
        </div>
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[80vh] overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Personalizar Fundo
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Escolha seu estilo preferido
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Random Mode Toggle */}
        <div className="px-4 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={toggleRandomMode}
            className={cn(
              'w-full flex items-center justify-between p-3 rounded-xl transition-all',
              randomMode
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            )}
          >
            <div className="flex items-center gap-3">
              <Shuffle className={cn('w-5 h-5', randomMode && 'animate-pulse')} />
              <div className="text-left">
                <p className="font-medium text-sm">Modo Aleatorio</p>
                <p
                  className={cn(
                    'text-xs',
                    randomMode ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  {randomMode ? 'Um novo fundo a cada sessao' : 'Desativado - escolha manual'}
                </p>
              </div>
            </div>
            <div
              className={cn(
                'w-12 h-6 rounded-full transition-colors flex items-center p-1',
                randomMode ? 'bg-white/30' : 'bg-gray-200 dark:bg-gray-600'
              )}
            >
              <div
                className={cn(
                  'w-4 h-4 rounded-full transition-transform',
                  randomMode
                    ? 'translate-x-6 bg-white'
                    : 'translate-x-0 bg-gray-400 dark:bg-gray-400'
                )}
              />
            </div>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('colors')}
            className={cn(
              'flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors',
              activeTab === 'colors'
                ? 'text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            <Palette className="w-4 h-4" />
            Cores
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={cn(
              'flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors',
              activeTab === 'images'
                ? 'text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            <ImageIcon className="w-4 h-4" />
            Imagens TCC
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[45vh]">
          {activeTab === 'colors' ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-3">
                  Cores Solidas e Gradientes
                </h3>
                <div className="flex flex-wrap gap-3">{colorOptions.map(renderColorOption)}</div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-3">
                  Slides do TCC - Cidadao.AI
                </h3>
                <div className="grid grid-cols-2 gap-3">{imageOptions.map(renderImageOption)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Overlay Settings (for images) */}
        {currentBackground?.type === 'image' && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overlayEnabled}
                  onChange={toggleOverlay}
                  className="w-4 h-4 rounded text-yellow-500 focus:ring-yellow-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Overlay</span>
              </label>
              {overlayEnabled && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Opacidade:</span>
                  <input
                    type="range"
                    min="0.5"
                    max="0.98"
                    step="0.02"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-xs text-gray-500 w-8">
                    {Math.round(overlayOpacity * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800">
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Restaurar
          </Button>
          <span className="text-xs text-gray-400 italic">Bo Bardi + Dumont + Anderson</span>
        </div>
      </div>
    </div>
  )
}
