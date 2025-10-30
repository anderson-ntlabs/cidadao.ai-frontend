/**
 * Voice Recorder Component
 *
 * Enables speech-to-text input for chat messages.
 * Records audio and transcribes using Google Cloud Speech-to-Text.
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-01-30
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { voiceManager } from '@/lib/services/voice-manager.service'
import { toast } from '@/hooks/use-toast'

export interface VoiceRecorderProps {
  onTranscript: (text: string) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary'
  disabled?: boolean
}

export function VoiceRecorder({
  onTranscript,
  className,
  size = 'md',
  variant = 'default',
  disabled = false,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Check microphone permission on mount
  useEffect(() => {
    checkMicrophonePermission()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (mediaRecorderRef.current && isRecording) {
        stopRecording()
      }
    }
  }, [isRecording])

  const checkMicrophonePermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      setHasPermission(result.state === 'granted')

      result.addEventListener('change', () => {
        setHasPermission(result.state === 'granted')
      })
    } catch (error) {
      // Permissions API not supported, try to access microphone directly
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((track) => track.stop())
        setHasPermission(true)
      } catch (error) {
        setHasPermission(false)
      }
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })

      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach((track) => track.stop())

        // Convert to MP3 if possible (or send webm)
        await handleTranscription(audioBlob)
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      toast.info('Gravando', 'Fale sua mensagem...')
    } catch (error) {
      console.error('Failed to start recording:', error)
      toast.error('Erro', 'Não foi possível acessar o microfone')
      setHasPermission(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const handleTranscription = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true)

      // Transcribe audio
      const result = await voiceManager.transcribe(audioBlob, 'pt-BR')

      if (result.transcript && result.transcript.trim().length > 0) {
        onTranscript(result.transcript)
        toast.success(
          'Transcrição Completa',
          `Confiança: ${Math.round(result.confidence * 100)}%`
        )
      } else {
        toast.warning('Nenhuma Fala Detectada', 'Tente novamente')
      }
    } catch (error) {
      console.error('Transcription error:', error)
      toast.error('Erro na Transcrição', 'Não foi possível processar o áudio')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleToggle = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  // Format recording time (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-2.5',
  }

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  // Variant styles
  const variantClasses = {
    default:
      'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700',
    primary:
      'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700 shadow-md',
  }

  const isDisabled = disabled || hasPermission === false || isProcessing

  return (
    <div className="relative inline-block">
      <button
        onClick={handleToggle}
        disabled={isDisabled}
        className={cn(
          'rounded-full transition-all duration-200',
          'flex items-center justify-center',
          'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
          'touch-manipulation',
          sizeClasses[size],
          variantClasses[variant],
          isRecording && 'animate-pulse ring-2 ring-red-500 ring-offset-2',
          className
        )}
        title={
          hasPermission === false
            ? 'Permissão do microfone negada'
            : isRecording
            ? 'Parar gravação'
            : 'Gravar mensagem de voz'
        }
        aria-label={
          isRecording
            ? 'Parar gravação de áudio'
            : 'Iniciar gravação de áudio'
        }
      >
        {isProcessing ? (
          <Loader2
            className={cn(
              'animate-spin',
              iconSizeClasses[size],
              variant === 'primary' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
            )}
          />
        ) : isRecording ? (
          <MicOff
            className={cn(
              iconSizeClasses[size],
              variant === 'primary' ? 'text-white' : 'text-red-600 dark:text-red-400'
            )}
          />
        ) : (
          <Mic
            className={cn(
              iconSizeClasses[size],
              variant === 'primary'
                ? 'text-white'
                : hasPermission === false
                ? 'text-gray-400'
                : 'text-gray-600 dark:text-gray-400'
            )}
          />
        )}
      </button>

      {/* Recording timer */}
      {isRecording && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className="bg-red-500 text-white text-xs font-mono px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            {formatTime(recordingTime)}
          </div>
        </div>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
            Processando...
          </div>
        </div>
      )}
    </div>
  )
}
