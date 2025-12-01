/**
 * Mobile Chat Container
 *
 * Optimized chat interface for mobile devices with:
 * - Virtual keyboard handling
 * - Safe area inset support
 * - Touch-optimized scrolling
 * - Auto-scroll to latest message
 *
 * Z-Index Scale (mobile chat):
 * - Message list: base (0)
 * - Header: z-40
 * - Scroll button: z-40
 * - Input: z-40
 * - Progress bar: z-45
 * - Modals/Sheets: z-100
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-01
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
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useVirtualKeyboard, useSafeHeight } from '@/hooks/use-virtual-keyboard'
import { touchFeedback, scrollBehavior, safeArea } from '@/lib/mobile-touch'

// Layout constants for consistent spacing
const MOBILE_LAYOUT = {
  HEADER_HEIGHT: 60,
  INPUT_HEIGHT: 70,
  BOTTOM_NAV_HEIGHT: 72,
  SAFE_AREA_BOTTOM: 20,
} as const

// Calculate total bottom padding needed
const BOTTOM_PADDING =
  MOBILE_LAYOUT.INPUT_HEIGHT + MOBILE_LAYOUT.BOTTOM_NAV_HEIGHT + MOBILE_LAYOUT.SAFE_AREA_BOTTOM

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
        data-testid="chat-messages"
        ref={messageListRef}
        className={cn(
          'message-list flex-1 overflow-y-auto overscroll-none',
          scrollBehavior.momentum,
          'px-4 pt-4'
        )}
        style={{
          // Dynamic padding based on layout constants
          paddingBottom: `${BOTTOM_PADDING}px`,
        }}
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
            'fixed right-4 z-40',
            'w-12 h-12 rounded-full',
            'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg',
            'flex items-center justify-center',
            'transition-all duration-200',
            'opacity-0 pointer-events-none', // Hidden by default
            'hover:shadow-xl active:scale-95',
            touchFeedback.button
          )}
          style={{
            // Position above input + bottom nav
            bottom: keyboardOpen
              ? `${keyboardHeight + MOBILE_LAYOUT.INPUT_HEIGHT + 20}px`
              : `${BOTTOM_PADDING}px`,
          }}
          aria-label="Rolar para o final"
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
 * Fixed header for mobile chat with agent info, user profile and actions.
 * Includes mode indicator badge and new conversation button.
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-01
 *
 * Usage:
 * ```tsx
 * <MobileChatHeader
 *   agent={currentAgent}
 *   user={currentUser}
 *   chatMode="cidadao"
 *   onBack={handleBack}
 *   onAgentClick={handleAgentSelector}
 *   onNewChat={handleNewChat}
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

  /** Current user */
  user?: {
    name?: string
    avatar?: string
  }

  /** Current chat mode */
  chatMode?: 'cidadao' | 'maritaca'

  /** Back button handler */
  onBack?: () => void

  /** Agent click handler (to open selector) */
  onAgentClick?: () => void

  /** New chat handler */
  onNewChat?: () => void

  /** Settings/menu button handler */
  onSettings?: () => void

  /** Additional CSS classes */
  className?: string
}

// Standardized avatar size for consistency
const AVATAR_SIZE = 36 // 36px = w-9 h-9

export function MobileChatHeader({
  agent,
  user,
  chatMode = 'cidadao',
  onBack,
  onAgentClick,
  onNewChat,
  onSettings,
  className,
}: MobileChatHeaderProps) {
  const isMaritacaMode = chatMode === 'maritaca'

  return (
    <header
      className={cn(
        'mobile-chat-header',
        'flex items-center gap-2',
        'px-3 py-2',
        'bg-white dark:bg-gray-900',
        'border-b border-gray-200 dark:border-gray-700',
        'sticky top-0 z-40', // Standardized z-index
        safeArea.top,
        className
      )}
    >
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className={cn(
            'p-2 rounded-full flex-shrink-0',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'transition-colors',
            touchFeedback.icon
          )}
          aria-label="Voltar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Agent Info - Clickable to open selector */}
      {agent && (
        <button
          onClick={onAgentClick}
          className={cn(
            'flex items-center gap-2 flex-1 min-w-0 p-1.5 rounded-lg',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'transition-colors text-left',
            touchFeedback.minimal
          )}
          aria-label="Selecionar agente ou modelo"
        >
          {agent.avatar && (
            <div className="relative flex-shrink-0">
              <Image
                src={agent.avatar}
                alt={agent.name}
                width={AVATAR_SIZE}
                height={AVATAR_SIZE}
                className={cn(
                  'rounded-full object-cover ring-2',
                  isMaritacaMode ? 'ring-purple-500/30' : 'ring-green-500/30'
                )}
              />
              {/* Mode indicator dot */}
              <div
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900',
                  isMaritacaMode ? 'bg-purple-500' : 'bg-green-500'
                )}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                {agent.name}
              </h2>
              {/* Mode Badge */}
              <span
                className={cn(
                  'px-1.5 py-0.5 text-[10px] font-medium rounded-full flex-shrink-0',
                  isMaritacaMode
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                )}
              >
                {isMaritacaMode ? '🦜' : '🏛️'}
              </span>
              {/* Chevron indicator */}
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            {agent.status && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{agent.status}</p>
            )}
          </div>
        </button>
      )}

      {/* New Chat Button */}
      {onNewChat && (
        <button
          onClick={onNewChat}
          className={cn(
            'p-2 rounded-full flex-shrink-0',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'transition-colors',
            touchFeedback.icon
          )}
          aria-label="Nova conversa"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* History Button */}
      {onSettings && (
        <button
          onClick={onSettings}
          className={cn(
            'p-2 rounded-full flex-shrink-0',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'transition-colors',
            touchFeedback.icon
          )}
          aria-label="Histórico de conversas"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      )}

      {/* User Profile Avatar */}
      {user && (
        <div className="flex-shrink-0">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name || 'Usuário'}
              width={32}
              height={32}
              className="rounded-full ring-2 ring-gray-200 dark:ring-gray-700 object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-xs ring-2 ring-gray-200 dark:ring-gray-700">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>
      )}
    </header>
  )
}
