/**
 * Voice Player Component
 *
 * Provides text-to-speech playback for chat messages.
 * Uses Web Speech API (free) instead of paid backend service.
 *
 * Features:
 * - Per-agent voice customization
 * - User preference persistence via Zustand store
 * - No API costs (100% browser-based)
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-01
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Volume2, VolumeX, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { webSpeechTTS } from '@/lib/speech/web-speech-tts.service'
import { useVoiceSettingsStore } from '@/store/voice-settings-store'
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
  const [isSupported, setIsSupported] = useState(true)

  const { defaultVoice, getConfigForAgent, ttsEnabled } = useVoiceSettingsStore()

  // Check if Web Speech API is supported
  useEffect(() => {
    setIsSupported(webSpeechTTS.isSupported())
  }, [])

  // Auto-play on mount (if enabled)
  useEffect(() => {
    if (autoPlay && text && !hasError && ttsEnabled && isSupported) {
      handlePlay()
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update playing state when speech ends
  useEffect(() => {
    const checkSpeaking = setInterval(() => {
      if (isPlaying && !webSpeechTTS.isSpeaking()) {
        setIsPlaying(false)
      }
    }, 100)

    return () => clearInterval(checkSpeaking)
  }, [isPlaying])

  const handlePlay = useCallback(async () => {
    if (!text || text.trim().length === 0) {
      toast.error('Erro', 'Nenhum texto para reproduzir')
      return
    }

    if (!isSupported) {
      toast.error('Não suportado', 'Seu navegador não suporta Text-to-Speech')
      return
    }

    if (!ttsEnabled) {
      toast.info('TTS Desativado', 'Ative a leitura de respostas nas configurações')
      return
    }

    try {
      setIsLoading(true)
      setHasError(false)

      // Get voice config for this agent (or default)
      const config = agentId ? getConfigForAgent(agentId) : null
      const voiceURI = config?.voiceURI || defaultVoice.voiceURI
      const rate = config?.rate ?? defaultVoice.rate
      const pitch = config?.pitch ?? defaultVoice.pitch

      setIsPlaying(true)
      setIsLoading(false)

      // Speak using Web Speech API with agent-specific settings
      await webSpeechTTS.speak(text, voiceURI || undefined, {
        rate,
        pitch,
        volume: defaultVoice.volume,
      })

      setIsPlaying(false)
    } catch (error) {
      console.error('Voice playback error:', error)
      setHasError(true)
      setIsPlaying(false)
      toast.error('Erro de Áudio', 'Não foi possível reproduzir o áudio.')
    } finally {
      setIsLoading(false)
    }
  }, [text, isSupported, ttsEnabled, agentId, getConfigForAgent, defaultVoice])

  const handleStop = useCallback(() => {
    webSpeechTTS.stop()
    setIsPlaying(false)
  }, [])

  const handleToggle = useCallback(() => {
    if (isPlaying) {
      handleStop()
    } else {
      handlePlay()
    }
  }, [isPlaying, handleStop, handlePlay])

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
    minimal: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
    badge:
      'bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 shadow-md',
  }

  // Don't render if TTS is not supported
  if (!isSupported) {
    return null
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading || !text || !ttsEnabled}
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
        !ttsEnabled
          ? 'TTS desativado - ative nas configurações'
          : isPlaying
            ? 'Parar áudio'
            : agentName
              ? `Ouvir resposta de ${agentName}`
              : 'Ouvir mensagem'
      }
      aria-label={isPlaying ? 'Parar reprodução de áudio' : 'Reproduzir mensagem em áudio'}
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
                : !ttsEnabled
                  ? 'text-gray-400 dark:text-gray-500'
                  : 'text-gray-600 dark:text-gray-400'
          )}
        />
      )}
    </button>
  )
}
