/**
 * Chat Input Area Component
 *
 * Renders the input area with textarea, voice buttons, and send button.
 * Used by desktop layout - mobile has its own MobileChatInput.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-11
 */

'use client'

import { useRef, useLayoutEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StreamingStatus } from '@/components/chat/streaming-status'
import type { StreamingState } from '@/store/chat-store'

// Voice components with proper error handling to prevent lazy loading crashes
const VoiceRecorderFallback = () => null
const VoiceRecorder = dynamic(
  () =>
    import('@/components/voice/voice-recorder')
      .then((mod) => {
        if (!mod.VoiceRecorder) {
          console.warn('VoiceRecorder not found, using fallback')
          return { default: VoiceRecorderFallback }
        }
        return { default: mod.VoiceRecorder }
      })
      .catch((err) => {
        console.error('Failed to load VoiceRecorder:', err)
        return { default: VoiceRecorderFallback }
      }),
  { loading: () => null, ssr: false }
)

const VoiceInputButtonFallback = () => null
const VoiceInputButton = dynamic(
  () =>
    import('@/components/voice/voice-input-button')
      .then((mod) => {
        if (!mod.VoiceInputButton) {
          console.warn('VoiceInputButton not found, using fallback')
          return { default: VoiceInputButtonFallback }
        }
        return { default: mod.VoiceInputButton }
      })
      .catch((err) => {
        console.error('Failed to load VoiceInputButton:', err)
        return { default: VoiceInputButtonFallback }
      }),
  { loading: () => null, ssr: false }
)

export interface ChatInputAreaProps {
  inputMessage: string
  setInputMessage: (value: string) => void
  onSendMessage: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  isLoading: boolean
  canSendMessage: boolean
  streaming: StreamingState
  sendingProgress: number
  textareaRef?: React.RefObject<HTMLTextAreaElement>
}

export function ChatInputArea({
  inputMessage,
  setInputMessage,
  onSendMessage,
  onKeyDown,
  isLoading,
  canSendMessage,
  streaming,
  sendingProgress,
  textareaRef: externalRef,
}: ChatInputAreaProps) {
  const internalRef = useRef<HTMLTextAreaElement>(null)
  const textareaRef = externalRef || internalRef

  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [textareaRef])

  useLayoutEffect(() => {
    adjustTextareaHeight()
  }, [inputMessage, adjustTextareaHeight])

  return (
    <div className="flex-shrink-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 shadow-lg">
      {/* Progress Bar */}
      {sendingProgress > 0 && sendingProgress < 100 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full bg-gradient-green-blue transition-all duration-300 ease-out"
            style={{ width: `${sendingProgress}%` }}
            role="progressbar"
            aria-valuenow={sendingProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Enviando mensagem"
          />
        </div>
      )}
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-5">
        <div className="flex gap-2 sm:gap-3 items-end">
          {/* Voice Recorder (Audio Recording) */}
          <VoiceRecorder
            onTranscript={(transcript) => {
              setInputMessage(transcript)
              if (textareaRef.current) {
                textareaRef.current.focus()
              }
            }}
            disabled={!canSendMessage}
            size="md"
            variant="default"
          />

          {/* Voice Input (Speech-to-Text) */}
          <VoiceInputButton
            onTranscript={(transcript) => {
              setInputMessage(inputMessage + ' ' + transcript)
              if (textareaRef.current) {
                textareaRef.current.focus()
              }
            }}
            onInterimTranscript={() => {
              // Interim results are handled silently
            }}
            disabled={!canSendMessage}
            size="md"
            variant="secondary"
            lang="pt-BR"
            showTooltip={true}
            tooltipContent="Clique e fale (Speech-to-Text)"
          />

          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Digite ou fale sua pergunta..."
            className="flex-1 resize-none rounded-2xl px-4 py-3 sm:py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 dark:focus:border-green-500 transition-all text-base min-h-[52px] shadow-sm hover:shadow-md"
            rows={1}
            disabled={!canSendMessage}
          />
          <Button
            onClick={onSendMessage}
            disabled={!canSendMessage || !inputMessage.trim()}
            loading={isLoading}
            className="px-5 sm:px-6 py-3 sm:py-4 h-auto rounded-2xl shadow-md hover:shadow-lg transition-all"
            leftIcon={<Send className="w-4 h-4 sm:w-5 sm:h-5" />}
          >
            <span className="hidden sm:inline">Enviar</span>
          </Button>
        </div>

        {/* Streaming Status Indicator */}
        {streaming.isStreaming && (
          <div className="mt-3">
            <StreamingStatus streaming={streaming} />
          </div>
        )}

        {isLoading && !streaming.isStreaming && (
          <div className="flex items-center gap-2 mt-3 text-sm text-gray-600 dark:text-gray-400 animate-in fade-in duration-300">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Processando sua mensagem...</span>
          </div>
        )}
      </div>
    </div>
  )
}
