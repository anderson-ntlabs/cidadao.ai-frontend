/**
 * Voice Player Component
 *
 * Provides text-to-speech playback for chat messages.
 * Each message can be played using the agent's unique Chirp3-HD voice.
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-01-30
 */

'use client'

import { useState, useEffect } from 'react'
import { Volume2, VolumeX, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { voiceManager } from '@/lib/services/voice-manager.service'
import { toast } from '@/hooks/use-toast'

export interface VoicePlayerProps {
  text: string
  agentId?: string
  agentName?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'minimal' | 'badge'
  autoPlay?: boolean
}

export function VoicePlayer({
  text,
  agentId,
  agentName,
  className,
  size = 'md',
  variant = 'default',
  autoPlay = false,
}: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Auto-play on mount (if enabled)
  useEffect(() => {
    if (autoPlay && text && !hasError) {
      handlePlay()
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePlay = async () => {
    if (!text || text.trim().length === 0) {
      toast.error('Erro', 'Nenhum texto para reproduzir')
      return
    }

    try {
      setIsLoading(true)
      setHasError(false)

      // Synthesize and play
      await voiceManager.synthesizeAndPlay(text, agentId)

      setIsPlaying(true)
    } catch (error) {
      console.error('Voice playback error:', error)
      setHasError(true)
      toast.error('Erro de Áudio', 'Não foi possível reproduzir o áudio')
    } finally {
      setIsLoading(false)
      setIsPlaying(false)
    }
  }

  const handleStop = () => {
    voiceManager.stop()
    setIsPlaying(false)
  }

  const handleToggle = () => {
    if (isPlaying) {
      handleStop()
    } else {
      handlePlay()
    }
  }

  // Size classes
  const sizeClasses = {
    sm: 'w-6 h-6 p-1',
    md: 'w-8 h-8 p-1.5',
    lg: 'w-10 h-10 p-2',
  }

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  // Variant styles
  const variantClasses = {
    default:
      'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm',
    minimal:
      'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
    badge:
      'bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 shadow-md',
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading || !text}
      className={cn(
        'rounded-lg transition-all duration-200',
        'flex items-center justify-center',
        'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        'touch-manipulation',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      title={
        isPlaying
          ? 'Parar áudio'
          : agentName
          ? `Ouvir resposta de ${agentName}`
          : 'Ouvir mensagem'
      }
      aria-label={
        isPlaying
          ? 'Parar reprodução de áudio'
          : 'Reproduzir mensagem em áudio'
      }
    >
      {isLoading ? (
        <Loader2
          className={cn(
            'animate-spin',
            iconSizeClasses[size],
            variant === 'badge' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
          )}
        />
      ) : isPlaying ? (
        <VolumeX
          className={cn(
            iconSizeClasses[size],
            variant === 'badge' ? 'text-white' : 'text-green-600 dark:text-green-400'
          )}
        />
      ) : (
        <Volume2
          className={cn(
            iconSizeClasses[size],
            variant === 'badge'
              ? 'text-white'
              : hasError
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-600 dark:text-gray-400'
          )}
        />
      )}
    </button>
  )
}
