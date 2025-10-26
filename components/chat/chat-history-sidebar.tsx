'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Trash2, ChevronLeft, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { chatSessionService } from '@/lib/services/chat-session.service'
import type { ChatSession } from '@/types/supabase'
import { ButtonV2 } from '@/components/ui/button'
import { SkeletonChatHistory } from '@/components/ui/skeleton-cards'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { logger } from '@/lib/utils/logger'

interface ChatHistorySidebarProps {
  isOpen: boolean
  onClose: () => void
  onSelectSession: (sessionId: string) => void
  currentSessionId?: string
}

export function ChatHistorySidebar({
  isOpen,
  onClose,
  onSelectSession,
  currentSessionId
}: ChatHistorySidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    setLoading(true)
    try {
      const userSessions = await chatSessionService.getUserSessions(20)
      setSessions(userSessions)
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error('Failed to load chat sessions'), {
        component: 'ChatHistorySidebar',
        action: 'loadSessions'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Tem certeza que deseja excluir esta conversa?')) {
      const success = await chatSessionService.deleteSession(sessionId)
      if (success) {
        await loadSessions()
      }
    }
  }

  const formatSessionTitle = (session: ChatSession) => {
    // Try to get first user message as title
    const firstUserMessage = session.messages?.find(m => m.role === 'user')
    if (firstUserMessage?.content) {
      return firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
    }
    return 'Nova conversa'
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Histórico de Conversas</h2>
            <ButtonV2
              variant="secondary"
              size="sm"
              onClick={onClose}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Fechar
            </ButtonV2>
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4">
              <SkeletonChatHistory count={5} />
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma conversa anterior</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "group p-3 rounded-lg cursor-pointer transition-colors",
                    "hover:bg-gray-100 dark:hover:bg-gray-800",
                    currentSessionId === session.session_id && "bg-gray-100 dark:bg-gray-800"
                  )}
                  onClick={() => onSelectSession(session.session_id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {formatSessionTitle(session)}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(session.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteSession(session.session_id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  {session.messages && session.messages.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {session.messages.length} mensagens
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}