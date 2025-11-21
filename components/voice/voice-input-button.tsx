/**
 * Voice Input Button Component
 *
 * Button component for activating speech-to-text input
 * with visual feedback and browser compatibility handling.
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-11-21
 */

'use client'

import { useEffect, useState } from 'react'
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useVoiceInput } from '@/hooks/use-voice-input'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import type { SpeechRecognitionError } from '@/lib/speech/types'

/**
 * Voice Input Button Props
 */
interface VoiceInputButtonProps {
  /** Called when transcript is ready */
  onTranscript?: (transcript: string) => void
  /** Called with interim results */
  onInterimTranscript?: (transcript: string) => void
  /** Language code (default: pt-BR) */
  lang?: string
  /** Show transcript inline */
  showTranscript?: boolean
  /** Custom class name */
  className?: string
  /** Button size */
  size?: 'sm' | 'default' | 'lg' | 'icon'
  /** Button variant */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  /** Disabled state */
  disabled?: boolean
  /** Show tooltip */
  showTooltip?: boolean
  /** Custom tooltip content */
  tooltipContent?: string
  /** Auto-stop timeout (ms) */
  autoStopTimeout?: number
  /** Continuous mode */
  continuous?: boolean
}

/**
 * Voice Input Button Component
 *
 * @example
 * ```tsx
 * <VoiceInputButton
 *   onTranscript={(text) => console.log(text)}
 *   showTranscript
 * />
 * ```
 */
export function VoiceInputButton({
  onTranscript,
  onInterimTranscript,
  lang = 'pt-BR',
  showTranscript = false,
  className,
  size = 'icon',
  variant = 'outline',
  disabled = false,
  showTooltip = true,
  tooltipContent,
  autoStopTimeout = 3000,
  continuous = false,
}: VoiceInputButtonProps) {
  const [mounted, setMounted] = useState(false)
  const [showError, setShowError] = useState(false)

  const {
    transcript,
    interimTranscript,
    state,
    isListening,
    isSupported,
    browserInfo,
    start,
    stop,
    error,
  } = useVoiceInput({
    lang,
    continuous,
    autoStopTimeout,
    interimResults: true,
    onTranscript: (text) => {
      onTranscript?.(text)
    },
    onInterimTranscript: (text) => {
      onInterimTranscript?.(text)
    },
    onError: (err: SpeechRecognitionError) => {
      console.error('Voice input error:', err)
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
    },
  })

  // Check if mounted (client-side)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Server-side render placeholder
    return (
      <Button size={size} variant={variant} className={className} disabled>
        <Mic className="h-4 w-4" />
      </Button>
    )
  }

  // Check browser support
  if (!isSupported) {
    const message =
      lang === 'pt-BR'
        ? `Seu navegador (${browserInfo.name}) não suporta entrada de voz. Use Chrome ou Edge.`
        : `Your browser (${browserInfo.name}) doesn't support voice input. Use Chrome or Edge.`

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size={size} variant={variant} className={cn('relative', className)} disabled>
              <MicOff className="h-4 w-4 opacity-50" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="max-w-xs">
              <p className="font-semibold mb-1">
                {lang === 'pt-BR'
                  ? '🎤 Entrada de voz não disponível'
                  : '🎤 Voice input not available'}
              </p>
              <p className="text-sm">{message}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Determine button state
  const isProcessing = state === 'processing'
  const hasError = state === 'error' || showError

  // Handle click
  const handleClick = async () => {
    if (disabled) return

    if (isListening) {
      stop()
    } else {
      await start()
    }
  }

  // Tooltip content
  const getTooltipContent = () => {
    if (tooltipContent) return tooltipContent

    if (isListening) {
      return lang === 'pt-BR' ? 'Clique para parar' : 'Click to stop'
    }

    if (hasError && error) {
      return error.message
    }

    return lang === 'pt-BR' ? 'Clique para falar' : 'Click to speak'
  }

  // Button content
  const buttonContent = (
    <Button
      size={size}
      variant={variant}
      className={cn(
        'relative transition-all',
        isListening && 'ring-2 ring-primary ring-offset-2',
        hasError && 'ring-2 ring-destructive ring-offset-2',
        className
      )}
      onClick={handleClick}
      disabled={disabled || isProcessing}
    >
      {/* Icon */}
      <AnimatePresence mode="wait">
        {isProcessing ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </motion.div>
        ) : hasError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <AlertCircle className="h-4 w-4 text-destructive" />
          </motion.div>
        ) : isListening ? (
          <motion.div
            key="listening"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <Mic className="h-4 w-4" />
              {/* Animated pulse */}
              <motion.div
                className="absolute inset-0 rounded-full bg-primary"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Mic className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual feedback for listening state */}
      {isListening && (
        <motion.div
          className="absolute inset-0 rounded-md pointer-events-none"
          animate={{
            backgroundColor: [
              'rgba(59, 130, 246, 0)',
              'rgba(59, 130, 246, 0.1)',
              'rgba(59, 130, 246, 0)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </Button>
  )

  // Wrap with tooltip if enabled
  const button = showTooltip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    buttonContent
  )

  // Return with optional transcript display
  if (showTranscript && (transcript || interimTranscript)) {
    return (
      <div className="flex flex-col gap-2">
        {button}
        <div className="px-3 py-2 bg-muted rounded-md text-sm">
          <span className="text-muted-foreground">{transcript}</span>
          {interimTranscript && (
            <span className="text-foreground ml-1 animate-pulse">{interimTranscript}</span>
          )}
        </div>
      </div>
    )
  }

  return button
}

/**
 * Voice Input Indicator Component
 *
 * Shows visual feedback when voice input is active
 */
export function VoiceInputIndicator({ isListening }: { isListening: boolean }) {
  if (!isListening) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground rounded-full shadow-lg">
        <div className="flex gap-1">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-primary-foreground rounded-full"
              animate={{
                height: [8, 20, 8],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        <span className="text-sm font-medium">Ouvindo...</span>
      </div>
    </motion.div>
  )
}

/**
 * Voice Input Card Component
 *
 * Card with voice input button and transcript display
 */
export function VoiceInputCard({
  onSubmit,
  className,
  lang = 'pt-BR',
}: {
  onSubmit?: (transcript: string) => void
  className?: string
  lang?: string
}) {
  const [localTranscript, setLocalTranscript] = useState('')

  const handleTranscript = (text: string) => {
    setLocalTranscript((prev) => prev + text)
  }

  const handleSubmit = () => {
    if (localTranscript.trim()) {
      onSubmit?.(localTranscript.trim())
      setLocalTranscript('')
    }
  }

  const handleClear = () => {
    setLocalTranscript('')
  }

  return (
    <div className={cn('p-4 border rounded-lg space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          {lang === 'pt-BR' ? 'Entrada de Voz' : 'Voice Input'}
        </h3>
        <VoiceInputButton onTranscript={handleTranscript} lang={lang} size="sm" />
      </div>

      {localTranscript && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-3"
        >
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm">{localTranscript}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="default" onClick={handleSubmit} className="flex-1">
              {lang === 'pt-BR' ? 'Enviar' : 'Send'}
            </Button>
            <Button size="sm" variant="outline" onClick={handleClear}>
              {lang === 'pt-BR' ? 'Limpar' : 'Clear'}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
