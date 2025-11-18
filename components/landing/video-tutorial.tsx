/**
 * VideoTutorial Component
 *
 * YouTube video embed placeholder for tutorial/demo video.
 * Responsive 16:9 aspect ratio with loading state.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-11-18
 */

'use client'

import { useState } from 'react'
import { PlayCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoTutorialProps {
  youtubeId?: string // YouTube video ID (e.g., "dQw4w9WgXcQ")
  title?: string
  description?: string
  className?: string
}

export function VideoTutorial({
  youtubeId,
  title = 'Tutorial: Como Usar o Cidadão.AI',
  description = 'Aprenda a investigar gastos públicos em 5 minutos',
  className,
}: VideoTutorialProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <section className={cn('py-16 bg-white dark:bg-gray-950', className)}>
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* Video Container */}
        <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            {youtubeId ? (
              // Real YouTube embed
              <>
                <iframe
                  className={cn(
                    'absolute inset-0 w-full h-full rounded-xl shadow-lg transition-opacity duration-300',
                    isLoaded ? 'opacity-100' : 'opacity-0'
                  )}
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
                  title={title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={() => setIsLoaded(true)}
                />
                {!isLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent" />
                  </div>
                )}
              </>
            ) : (
              // Placeholder/Mock
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-green-500/20 via-blue-500/20 to-purple-500/20 dark:from-green-900/30 dark:via-blue-900/30 dark:to-purple-900/30 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                <PlayCircle className="w-20 h-20 text-gray-400 dark:text-gray-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">
                  Vídeo Tutorial em Breve
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm px-4 text-center">
                  Estamos preparando um tutorial completo para você.
                  <br />
                  Por enquanto, explore o sistema diretamente!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Prefere aprender fazendo?</p>
          <a
            href="#hero"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:border-green-600 dark:hover:border-green-400 transition-all duration-300 hover:scale-105"
          >
            Acessar o Sistema
          </a>
        </div>
      </div>
    </section>
  )
}
