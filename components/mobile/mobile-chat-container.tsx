/**
 * Mobile Chat Container
 *
 * Optimized chat interface for mobile devices with:
 * - Virtual keyboard handling
 * - Safe area inset support
 * - Touch-optimized scrolling
 * - Auto-scroll to latest message
 *
 * Usage:
 * ```tsx
 * <MobileChatContainer>
 *   <ChatMessages messages={messages} />
 *   <MobileChatInput onSend={handleSend} />
 * </MobileChatContainer>
 * ```
 */

'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useVirtualKeyboard, useSafeHeight } from '@/hooks/use-virtual-keyboard'
import { touchFeedback, scrollBehavior, safeArea } from '@/lib/mobile-touch'

export interface MobileChatContainerProps {
  /** Chat messages and input components */
  children: ReactNode

  /** Additional CSS classes */
  className?: string

  /** Auto-scroll to bottom when new messages arrive */
  autoScroll?: boolean

  /** Show scroll-to-bottom button when scrolled up */
  showScrollButton?: boolean
}

export function MobileChatContainer({
  children,
  className,
  autoScroll = true,
  showScrollButton = true,
}: MobileChatContainerProps) {
  const { isOpen: keyboardOpen, height: keyboardHeight } = useVirtualKeyboard()
  const messageListRef = useRef<HTMLDivElement>(null)
  const scrollButtonRef = useRef<HTMLButtonElement>(null)
  const autoScrollRef = useRef(autoScroll)

  // Update auto-scroll ref when prop changes
  useEffect(() => {
    autoScrollRef.current = autoScroll
  }, [autoScroll])

  // Calculate safe height accounting for keyboard
  const containerHeight = useSafeHeight('100dvh', keyboardOpen, keyboardHeight)

  // Auto-scroll to bottom when messages change or keyboard opens
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const container = messageListRef.current
    if (!container) return

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    })
  }

  // Check if user is scrolled to bottom
  const isScrolledToBottom = (): boolean => {
    const container = messageListRef.current
    if (!container) return true

    const threshold = 100 // pixels from bottom
    const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight

    return scrollBottom < threshold
  }

  // Handle scroll events to show/hide scroll button
  useEffect(() => {
    const container = messageListRef.current
    if (!container || !showScrollButton) return

    const handleScroll = () => {
      const button = scrollButtonRef.current
      if (!button) return

      const atBottom = isScrolledToBottom()

      // Show button when not at bottom
      button.style.opacity = atBottom ? '0' : '1'
      button.style.pointerEvents = atBottom ? 'none' : 'auto'
    }

    container.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [showScrollButton])

  // Auto-scroll when keyboard opens (if was at bottom)
  useEffect(() => {
    if (keyboardOpen && isScrolledToBottom()) {
      // Delay to allow keyboard animation
      setTimeout(() => scrollToBottom('smooth'), 100)
    }
  }, [keyboardOpen])

  // Expose scrollToBottom to parent via ref forwarding (future enhancement)
  // For now, children can trigger scroll via new message additions

  return (
    <div
      className={cn(
        'mobile-chat-container relative flex flex-col',
        'bg-white dark:bg-gray-900',
        safeArea.top, // Safe area for notch
        className
      )}
      style={{
        height: containerHeight,
      }}
    >
      {/* Message List Area */}
      <div
        ref={messageListRef}
        className={cn(
          'message-list flex-1 overflow-y-auto overscroll-none',
          scrollBehavior.momentum,
          'px-4 py-4'
        )}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {children}
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          ref={scrollButtonRef}
          onClick={() => scrollToBottom('smooth')}
          className={cn(
            'fixed bottom-20 right-4 z-10',
            'w-12 h-12 rounded-full',
            'bg-blue-500 text-white shadow-lg',
            'flex items-center justify-center',
            'transition-opacity duration-200',
            'opacity-0 pointer-events-none', // Hidden by default
            touchFeedback.button,
            safeArea.bottom // Adjust for home indicator
          )}
          style={{
            // Additional bottom offset when keyboard is open
            bottom: keyboardOpen ? `${keyboardHeight + 80}px` : '80px',
          }}
          aria-label="Scroll to bottom"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

/**
 * Mobile Chat Message List
 *
 * Optimized message list with virtualization support (future)
 *
 * Usage:
 * ```tsx
 * <MobileChatMessageList messages={messages}>
 *   {(message) => <MessageBubble message={message} />}
 * </MobileChatMessageList>
 * ```
 */
export interface MobileChatMessageListProps {
  /** Array of messages to display */
  messages: any[]

  /** Render function for each message */
  children: (message: any, index: number) => ReactNode

  /** Loading state */
  loading?: boolean

  /** Empty state component */
  emptyState?: ReactNode

  /** Additional CSS classes */
  className?: string
}

export function MobileChatMessageList({
  messages,
  children,
  loading = false,
  emptyState,
  className,
}: MobileChatMessageListProps) {
  const listRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    if (messages.length > 0) {
      const list = listRef.current
      if (!list) return

      // Scroll to bottom with smooth animation
      setTimeout(() => {
        list.scrollTo({
          top: list.scrollHeight,
          behavior: 'smooth',
        })
      }, 100)
    }
  }, [messages.length])

  return (
    <div ref={listRef} className={cn('mobile-chat-message-list space-y-4', className)}>
      {/* Empty State */}
      {messages.length === 0 && !loading && emptyState}

      {/* Messages */}
      {messages.map((message, index) => (
        <div key={message.id || index}>{children(message, index)}</div>
      ))}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}
    </div>
  )
}

/**
 * Mobile Chat Header
 *
 * Fixed header for mobile chat with agent info and actions
 *
 * Usage:
 * ```tsx
 * <MobileChatHeader
 *   agent={currentAgent}
 *   onBack={handleBack}
 *   onSettings={handleSettings}
 * />
 * ```
 */
export interface MobileChatHeaderProps {
  /** Current agent */
  agent?: {
    name: string
    avatar?: string
    status?: string
  }

  /** Back button handler */
  onBack?: () => void

  /** Settings/menu button handler */
  onSettings?: () => void

  /** Additional CSS classes */
  className?: string
}

export function MobileChatHeader({ agent, onBack, onSettings, className }: MobileChatHeaderProps) {
  return (
    <header
      className={cn(
        'mobile-chat-header',
        'flex items-center gap-3',
        'px-4 py-3',
        'bg-white dark:bg-gray-900',
        'border-b border-gray-200 dark:border-gray-700',
        'sticky top-0 z-20',
        safeArea.top,
        className
      )}
    >
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className={cn(
            'p-2 rounded-full',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'transition-colors',
            touchFeedback.icon
          )}
          aria-label="Go back"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Agent Info */}
      {agent && (
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {agent.avatar && (
            <img src={agent.avatar} alt={agent.name} className="w-10 h-10 rounded-full" />
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 dark:text-white truncate">{agent.name}</h2>
            {agent.status && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{agent.status}</p>
            )}
          </div>
        </div>
      )}

      {/* Settings Button */}
      {onSettings && (
        <button
          onClick={onSettings}
          className={cn(
            'p-2 rounded-full',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'transition-colors',
            touchFeedback.icon
          )}
          aria-label="Settings"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
      )}
    </header>
  )
}
