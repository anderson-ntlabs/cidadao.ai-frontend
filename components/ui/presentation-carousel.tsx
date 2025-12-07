'use client'

/**
 * Presentation Carousel Component
 *
 * A beautiful, accessible carousel for presentations using Embla Carousel.
 * Features:
 * - Smooth transitions
 * - Keyboard navigation
 * - Touch/swipe support
 * - Progress indicators
 * - Optional autoplay
 * - Agent narration support
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-07
 */

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2, Minimize2 } from 'lucide-react'

export interface Slide {
  id: number
  src: string
  alt: string
  title?: string
  narration?: string // Agent narration for this slide
}

interface PresentationCarouselProps {
  slides: Slide[]
  autoplay?: boolean
  autoplayDelay?: number
  showNarration?: boolean
  agentName?: string
  agentImage?: string
  onSlideChange?: (index: number) => void
  className?: string
}

export function PresentationCarousel({
  slides,
  autoplay = false,
  autoplayDelay = 5000,
  showNarration = true,
  agentName = 'Santos-Dumont',
  agentImage = '/agents/santos-dumont.png',
  onSlideChange,
  className,
}: PresentationCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoplay)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Autoplay plugin
  const autoplayPlugin = Autoplay({
    delay: autoplayDelay,
    stopOnInteraction: true,
    stopOnMouseEnter: true,
  })

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: false,
      align: 'center',
      skipSnaps: false,
    },
    isPlaying ? [autoplayPlugin] : []
  )

  // Update selected index when slide changes
  const onSelect = useCallback(() => {
    if (!emblaApi) return
    const index = emblaApi.selectedScrollSnap()
    setSelectedIndex(index)
    onSlideChange?.(index)
  }, [emblaApi, onSlideChange])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    onSelect()
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  // Navigation functions
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') scrollPrev()
      if (e.key === 'ArrowRight') scrollNext()
      if (e.key === ' ') {
        e.preventDefault()
        setIsPlaying((prev) => !prev)
      }
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [scrollPrev, scrollNext, isFullscreen])

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev)
  }

  // Current slide
  const currentSlide = slides[selectedIndex]

  return (
    <div
      className={cn(
        'relative',
        isFullscreen && 'fixed inset-0 z-50 bg-black flex flex-col items-center justify-center',
        className
      )}
    >
      {/* Main Carousel */}
      <div
        className={cn(
          'overflow-hidden rounded-xl bg-gray-900',
          isFullscreen ? 'w-full h-full max-w-7xl max-h-[80vh]' : 'w-full'
        )}
        ref={emblaRef}
      >
        <div className="flex">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="flex-[0_0_100%] min-w-0 relative"
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} de ${slides.length}: ${slide.alt}`}
            >
              <div className={cn('relative', isFullscreen ? 'h-[70vh]' : 'aspect-video')}>
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  className="object-contain"
                  priority={index === 0}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        disabled={selectedIndex === 0}
        className={cn(
          'absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full',
          'bg-white/90 dark:bg-gray-800/90 shadow-lg',
          'flex items-center justify-center',
          'hover:bg-white dark:hover:bg-gray-700 transition-colors',
          'disabled:opacity-30 disabled:cursor-not-allowed',
          isFullscreen && 'left-4 w-14 h-14'
        )}
        aria-label="Slide anterior"
      >
        <ChevronLeft className={cn('w-6 h-6', isFullscreen && 'w-8 h-8')} />
      </button>

      <button
        onClick={scrollNext}
        disabled={selectedIndex === slides.length - 1}
        className={cn(
          'absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full',
          'bg-white/90 dark:bg-gray-800/90 shadow-lg',
          'flex items-center justify-center',
          'hover:bg-white dark:hover:bg-gray-700 transition-colors',
          'disabled:opacity-30 disabled:cursor-not-allowed',
          isFullscreen && 'right-4 w-14 h-14'
        )}
        aria-label="Proximo slide"
      >
        <ChevronRight className={cn('w-6 h-6', isFullscreen && 'w-8 h-8')} />
      </button>

      {/* Controls Bar */}
      <div
        className={cn(
          'flex items-center justify-between gap-4 mt-4 px-2',
          isFullscreen && 'absolute bottom-4 left-0 right-0 px-8'
        )}
      >
        {/* Progress Dots */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center flex-1">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-all',
                selectedIndex === index
                  ? 'bg-green-500 w-6'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
              )}
              aria-label={`Ir para slide ${index + 1}`}
              aria-current={selectedIndex === index ? 'true' : 'false'}
            />
          ))}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          {/* Slide Counter */}
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {selectedIndex + 1} / {slides.length}
          </span>

          {/* Play/Pause */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPlaying((prev) => !prev)}
            className="w-9 h-9 p-0"
            aria-label={isPlaying ? 'Pausar apresentacao' : 'Iniciar apresentacao automatica'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>

          {/* Fullscreen */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="w-9 h-9 p-0"
            aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Agent Narration */}
      {showNarration && currentSlide?.narration && (
        <div
          className={cn(
            'mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800',
            isFullscreen && 'absolute bottom-20 left-8 right-8 max-w-3xl mx-auto'
          )}
        >
          <div className="flex items-start gap-3">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
              <Image src={agentImage} alt={agentName} fill className="object-cover" />
            </div>
            <div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium uppercase tracking-wide">
                {agentName} comenta:
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                {currentSlide.narration}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Close Button */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-colors"
          aria-label="Fechar tela cheia"
        >
          <Minimize2 className="w-5 h-5" />
        </button>
      )}

      {/* Keyboard hints */}
      {!isFullscreen && (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3">
          Use as setas do teclado para navegar • Espaco para play/pause • F para tela cheia
        </p>
      )}
    </div>
  )
}
