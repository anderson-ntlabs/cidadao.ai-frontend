/**
 * Mobile Chat Input
 *
 * Touch-optimized chat input with:
 * - Auto-growing textarea
 * - Virtual keyboard handling
 * - Haptic feedback
 * - Safe area inset support
 * - 56px touch target for send button
 *
 * Usage:
 * ```tsx
 * <MobileChatInput
 *   value={message}
 *   onChange={setMessage}
 *   onSend={handleSend}
 *   loading={isLoading}
 * />
 * ```
 */

'use client'

import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { useVirtualKeyboard, useKeyboardAwareInput } from '@/hooks/use-virtual-keyboard'
import { touchFeedback, tapTarget, safeArea } from '@/lib/mobile-touch'
import { useHaptic } from '@/hooks/use-haptic'

// Lazy load voice input button
const VoiceInputButton = dynamic(
  () => import('@/components/voice').then((mod) => ({ default: mod.VoiceInputButton })),
  {
    loading: () => null,
    ssr: false,
  }
)

export interface MobileChatInputProps {
  /** Current input value (controlled) */
  value?: string

  /** Change handler for controlled input */
  onChange?: (value: string) => void

  /** Send message handler */
  onSend?: (message: string) => void

  /** Loading state (sending message) */
  loading?: boolean

  /** Placeholder text */
  placeholder?: string

  /** Maximum message length */
  maxLength?: number

  /** Disabled state */
  disabled?: boolean

  /** Additional CSS classes */
  className?: string

  /** Show character count */
  showCharCount?: boolean

  /** Auto-focus on mount */
  autoFocus?: boolean

  /** Locale for internationalization */
  locale?: 'pt' | 'en'
}

export function MobileChatInput({
  value: controlledValue,
  onChange,
  onSend,
  loading = false,
  placeholder = 'Digite sua mensagem...',
  maxLength = 2000,
  disabled = false,
  className,
  showCharCount = false,
  autoFocus = false,
  locale = 'pt',
}: MobileChatInputProps) {
  // Controlled vs uncontrolled state
  const [internalValue, setInternalValue] = useState('')
  const value = controlledValue !== undefined ? controlledValue : internalValue
  const setValue = onChange || setInternalValue

  const { isOpen: keyboardOpen, height: keyboardHeight } = useVirtualKeyboard()
  const { ref: textareaRef, isFocused } = useKeyboardAwareInput<HTMLTextAreaElement>()
  const { vibrate } = useHaptic()

  // Auto-grow textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Reset height to recalculate
    textarea.style.height = 'auto'

    // Set height based on scrollHeight (max 6 lines = ~144px)
    const maxHeight = 144
    const newHeight = Math.min(textarea.scrollHeight, maxHeight)
    textarea.style.height = `${newHeight}px`
  }, [value, textareaRef])

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus, textareaRef])

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value

    // Enforce max length
    if (newValue.length <= maxLength) {
      setValue(newValue)
    }
  }

  const handleSend = () => {
    const trimmedValue = value.trim()

    if (!trimmedValue || loading || disabled) return

    // Haptic feedback on send
    vibrate('light')

    // Call onSend handler
    onSend?.(trimmedValue)

    // Clear input
    setValue('')

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const canSend = value.trim().length > 0 && !loading && !disabled

  return (
    <div
      className={cn(
        'mobile-chat-input',
        'fixed bottom-0 left-0 right-0 z-30',
        'bg-white dark:bg-gray-900',
        'border-t border-gray-200 dark:border-gray-700',
        'px-4 py-3',
        safeArea.bottom, // Safe area for home indicator
        className
      )}
      style={{
        // Offset by keyboard height when open
        transform: keyboardOpen ? `translateY(-${keyboardHeight}px)` : 'translateY(0)',
        transition: 'transform 0.2s ease-out',
      }}
    >
      <div className="flex items-end gap-2">
        {/* Voice Input Button (Speech-to-Text) */}
        <VoiceInputButton
          onTranscript={(transcript) => {
            const currentValue = value || ''
            setValue(currentValue + (currentValue ? ' ' : '') + transcript)
            vibrate('light')
          }}
          disabled={disabled || loading}
          size="icon"
          variant="secondary"
          lang={locale === 'pt' ? 'pt-BR' : 'en-US'}
          showTooltip={false}
          className={cn(tapTarget.medium)}
        />

        {/* Textarea Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || loading}
            rows={1}
            maxLength={maxLength}
            className={cn(
              'w-full resize-none',
              'px-4 py-3 pr-12', // Extra padding for char count
              'bg-gray-100 dark:bg-gray-800',
              'border border-gray-300 dark:border-gray-600',
              'rounded-2xl',
              'text-base text-gray-900 dark:text-white',
              'placeholder-gray-500 dark:placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'transition-all duration-150',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              touchFeedback.minimal,
              isFocused && 'ring-2 ring-blue-500'
            )}
            style={{
              minHeight: '48px', // Minimum touch target
              maxHeight: '144px', // ~6 lines
            }}
            aria-label="Message input"
          />

          {/* Character Count */}
          {showCharCount && value.length > maxLength * 0.8 && (
            <span
              className={cn(
                'absolute bottom-2 right-3',
                'text-xs',
                value.length >= maxLength ? 'text-red-500' : 'text-gray-400'
              )}
            >
              {value.length}/{maxLength}
            </span>
          )}
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            'flex-shrink-0',
            'bg-blue-500 text-white',
            'rounded-full',
            'flex items-center justify-center',
            'shadow-md',
            'transition-all duration-150',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            touchFeedback.button,
            tapTarget.large, // 56px touch target
            canSend && 'hover:bg-blue-600 active:scale-95'
          )}
          aria-label={locale === 'pt' ? 'Enviar mensagem' : 'Send message'}
        >
          {loading ? (
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

/**
 * Mobile Chat Suggestion Chips
 *
 * Horizontal scrollable suggestion chips for quick replies
 *
 * Usage:
 * ```tsx
 * <MobileChatSuggestions
 *   suggestions={['Como funciona?', 'Ajuda', 'Exemplos']}
 *   onSelect={handleSuggestion}
 * />
 * ```
 */
export interface MobileChatSuggestionsProps {
  /** Array of suggestion texts */
  suggestions: string[]

  /** Selection handler */
  onSelect?: (suggestion: string) => void

  /** Loading state */
  loading?: boolean

  /** Additional CSS classes */
  className?: string
}

export function MobileChatSuggestions({
  suggestions,
  onSelect,
  loading = false,
  className,
}: MobileChatSuggestionsProps) {
  const { vibrate } = useHaptic()

  const handleSelect = (suggestion: string) => {
    vibrate('light')
    onSelect?.(suggestion)
  }

  if (suggestions.length === 0 && !loading) return null

  return (
    <div
      className={cn(
        'mobile-chat-suggestions',
        'flex gap-2 overflow-x-auto',
        'px-4 py-2',
        'scrollbar-hide', // Hide scrollbar
        className
      )}
      style={{
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // IE/Edge
      }}
    >
      {loading
        ? // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
            />
          ))
        : suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelect(suggestion)}
              className={cn(
                'flex-shrink-0',
                'px-4 py-2',
                'bg-blue-50 dark:bg-blue-900/20',
                'text-blue-600 dark:text-blue-400',
                'border border-blue-200 dark:border-blue-800',
                'rounded-full',
                'text-sm font-medium whitespace-nowrap',
                'transition-all duration-150',
                tapTarget.small, // 44px minimum
                touchFeedback.button
              )}
            >
              {suggestion}
            </button>
          ))}
    </div>
  )
}

/**
 * Mobile Chat Action Bar
 *
 * Additional actions like attach file, voice input, etc.
 *
 * Usage:
 * ```tsx
 * <MobileChatActionBar
 *   onAttach={handleAttach}
 *   onVoice={handleVoice}
 * />
 * ```
 */
export interface MobileChatActionBarProps {
  /** Attach file handler */
  onAttach?: () => void

  /** Voice input handler */
  onVoice?: () => void

  /** Camera handler */
  onCamera?: () => void

  /** Additional CSS classes */
  className?: string
}

export function MobileChatActionBar({
  onAttach,
  onVoice,
  onCamera,
  className,
}: MobileChatActionBarProps) {
  const { vibrate } = useHaptic()

  const handleAction = (action: () => void) => {
    vibrate('light')
    action()
  }

  return (
    <div
      className={cn(
        'mobile-chat-action-bar',
        'flex items-center gap-2',
        'px-4 py-2',
        'bg-gray-50 dark:bg-gray-800',
        'border-t border-gray-200 dark:border-gray-700',
        className
      )}
    >
      {onAttach && (
        <button
          onClick={() => handleAction(onAttach)}
          className={cn(
            'p-2 rounded-full',
            'text-gray-600 dark:text-gray-400',
            'hover:bg-gray-200 dark:hover:bg-gray-700',
            'transition-colors',
            touchFeedback.icon,
            tapTarget.small
          )}
          aria-label="Attach file"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        </button>
      )}

      {onCamera && (
        <button
          onClick={() => handleAction(onCamera)}
          className={cn(
            'p-2 rounded-full',
            'text-gray-600 dark:text-gray-400',
            'hover:bg-gray-200 dark:hover:bg-gray-700',
            'transition-colors',
            touchFeedback.icon,
            tapTarget.small
          )}
          aria-label="Take photo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      )}

      {onVoice && (
        <button
          onClick={() => handleAction(onVoice)}
          className={cn(
            'p-2 rounded-full',
            'text-gray-600 dark:text-gray-400',
            'hover:bg-gray-200 dark:hover:bg-gray-700',
            'transition-colors',
            touchFeedback.icon,
            tapTarget.small
          )}
          aria-label="Voice input"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
