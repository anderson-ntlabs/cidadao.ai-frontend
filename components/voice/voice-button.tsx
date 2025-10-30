/**
 * Voice Button Component
 *
 * Play/Pause/Stop controls for text-to-speech
 * with visual feedback and keyboard shortcuts
 *
 * @author Anderson Henrique da Silva
 * @date 2025-10-30
 */

'use client'

import { useState, useEffect } from 'react'
import { Volume2, VolumeX, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getTTSService } from '@/lib/voice/tts-service'
import { useVoiceStore } from '@/store/voice-store'
import { cn } from '@/lib/utils'

interface VoiceButtonProps {
  text: string
  agentId?: string
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon'
  showLabel?: boolean
}

export function VoiceButton({
  text,
  agentId,
  className,
  variant = 'ghost',
  size = 'icon',
  showLabel = false
}: VoiceButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const { settings, setCurrentlySpeaking } = useVoiceStore()

  // Check if TTS is supported
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const ttsService = getTTSService()

  const handleSpeak = async () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[VoiceButton] handleSpeak called', {
        isSpeaking,
        isPaused,
        agentId,
        textLength: text.length,
        enabled: settings.enabled
      })
    }

    if (isSpeaking && !isPaused) {
      // Currently speaking -> pause
      ttsService.pause()
      setIsPaused(true)
    } else if (isPaused) {
      // Paused -> resume
      ttsService.resume()
      setIsPaused(false)
    } else {
      // Not speaking -> start
      setIsSpeaking(true)
      setCurrentlySpeaking(true, agentId)

      try {
        await ttsService.speak(text, agentId)
      } catch (error) {
        console.error('[VoiceButton] TTS error:', error)
      } finally {
        setIsSpeaking(false)
        setIsPaused(false)
        setCurrentlySpeaking(false)
      }
    }
  }

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation()
    ttsService.stop()
    setIsSpeaking(false)
    setIsPaused(false)
    setCurrentlySpeaking(false)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        ttsService.stop()
      }
    }
  }, [isSpeaking, ttsService])

  const getIcon = () => {
    if (isSpeaking && !isPaused) {
      return <Volume2 className={cn('h-4 w-4', isSpeaking && 'animate-pulse')} />
    } else if (isPaused) {
      return <Pause className="h-4 w-4" />
    } else {
      return <Play className="h-4 w-4" />
    }
  }

  const getTooltip = () => {
    if (isSpeaking && !isPaused) {
      return 'Pausar (Ctrl+Shift+P)'
    } else if (isPaused) {
      return 'Continuar (Ctrl+Shift+P)'
    } else {
      return 'Ouvir mensagem (Ctrl+Shift+S)'
    }
  }

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[VoiceButton] Render', {
      isSupported,
      enabled: settings.enabled,
      willRender: isSupported && settings.enabled,
      agentId,
      textPreview: text.substring(0, 50) + '...'
    })
  }

  // Don't render if not supported
  if (!isSupported) {
    return (
      <div className="text-xs text-red-500 p-2" title="Web Speech API não suportada">
        🔇 API não suportada
      </div>
    )
  }

  // Always show disabled state (not just in development)
  if (!settings.enabled) {
    return (
      <button
        onClick={() => {
          alert('Voz desabilitada.\n\nPara ativar:\n1. Vá em Configurações\n2. Role até "Voz e Áudio"\n3. Ative o switch "Ativar Voz"')
        }}
        className="p-2 md:p-1.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-all shadow-sm"
        title="Clique para saber como ativar a voz"
        aria-label="Voz desabilitada - clique para instruções"
      >
        <span className="text-sm">🔇</span>
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={variant}
        size={size}
        onClick={handleSpeak}
        className={cn(className)}
        aria-label={getTooltip()}
        title={getTooltip()}
      >
        {getIcon()}
        {showLabel && (
          <span className="ml-2">
            {isSpeaking ? (isPaused ? 'Pausado' : 'Falando...') : 'Ouvir'}
          </span>
        )}
      </Button>

      {isSpeaking && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleStop}
          aria-label="Parar"
          title="Parar (Esc)"
        >
          <VolumeX className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
