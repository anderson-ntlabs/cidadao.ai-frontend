/**
 * Enhanced Message Bubble Component
 *
 * Mind-blowing chat message with actions, formatting, and animations
 *
 * @author Anderson Henrique da Silva
 * @date 2025-01-30
 */

'use client'

import { useState } from 'react'
import { Copy, Share2, Download, ThumbsUp, ThumbsDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TypingMessage } from './typing-message'
import { toast } from '@/hooks/use-toast'
import ReactMarkdown from 'react-markdown'

export interface MessageBubbleProps {
  content: string
  role: 'user' | 'assistant'
  agentName?: string
  agentRole?: string
  agentColor?: string
  isLatest?: boolean
  isLoading?: boolean
  onComplete?: () => void
  metadata?: Record<string, any>
}

export function MessageBubble({
  content,
  role,
  agentName,
  agentRole,
  agentColor = 'green',
  isLatest = false,
  isLoading = false,
  onComplete,
  metadata
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      toast.success('Copiado!', 'Mensagem copiada para área de transferência')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Erro', 'Não foi possível copiar a mensagem')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cidadão.AI',
          text: content
        })
      } catch (error) {
        // User cancelled or error
      }
    } else {
      handleCopy()
    }
  }

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mensagem-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Exportado!', 'Mensagem exportada com sucesso')
  }

  const handleFeedback = (positive: boolean) => {
    toast.info(
      positive ? 'Obrigado!' : 'Feedback registrado',
      positive ? 'Seu feedback ajuda a melhorar' : 'Vamos trabalhar para melhorar'
    )
  }

  return (
    <div
      className="group relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Agent Info (only for assistant) */}
      {role === 'assistant' && agentName && (
        <div className="mb-1 px-1 flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {agentName}
          </span>
          {agentRole && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              • {agentRole}
            </span>
          )}
          {metadata?.model && (
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded",
              metadata.model === 'sabia-3'
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
            )}>
              {metadata.model === 'sabia-3' ? 'Sabiá-3' : 'Sabiazinho-3'}
            </span>
          )}
        </div>
      )}

      {/* Message Content */}
      <div
        className={cn(
          "rounded-2xl px-4 py-3 transition-all duration-300",
          "shadow-md hover:shadow-lg",
          role === 'user'
            ? "bg-gradient-to-r from-green-500 to-blue-600 text-white"
            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        )}
      >
        {role === 'assistant' ? (
          isLatest && isLoading ? (
            <TypingMessage
              content={content}
              isLatest={isLatest}
              onComplete={onComplete}
            />
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0 text-gray-700 dark:text-gray-300">
                      {children}
                    </p>
                  ),
                  code: ({ inline, children, ...props }: any) => (
                    inline ? (
                      <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-pink-600 dark:text-pink-400">
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto">
                        <code {...props}>{children}</code>
                      </pre>
                    )
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
                      {children}
                    </ol>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-gray-900 dark:text-gray-100">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-gray-700 dark:text-gray-300">
                      {children}
                    </em>
                  )
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )
        ) : (
          <p className="whitespace-pre-wrap text-sm text-white">
            {content}
          </p>
        )}
      </div>

      {/* Quick Actions - Show on hover */}
      {!isLoading && (
        <div
          className={cn(
            "absolute -bottom-6 flex items-center gap-1 transition-all duration-200",
            role === 'user' ? 'right-0' : 'left-0',
            showActions ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'
          )}
        >
          <button
            onClick={handleCopy}
            className="p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            title="Copiar mensagem"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          <button
            onClick={handleShare}
            className="p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            title="Compartilhar"
          >
            <Share2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
          </button>

          <button
            onClick={handleExport}
            className="p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            title="Exportar"
          >
            <Download className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
          </button>

          {role === 'assistant' && (
            <>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-0.5" />
              <button
                onClick={() => handleFeedback(true)}
                className="p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors shadow-sm group/thumb"
                title="Útil"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400 group-hover/thumb:text-green-600" />
              </button>
              <button
                onClick={() => handleFeedback(false)}
                className="p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm group/thumb"
                title="Não útil"
              >
                <ThumbsDown className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400 group-hover/thumb:text-red-600" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Confidence Badge (for assistant messages with confidence) */}
      {role === 'assistant' && metadata?.confidence && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500",
                metadata.confidence >= 0.9 ? "bg-green-500" :
                metadata.confidence >= 0.7 ? "bg-yellow-500" : "bg-orange-500"
              )}
              style={{ width: `${metadata.confidence * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {Math.round(metadata.confidence * 100)}% confiança
          </span>
        </div>
      )}
    </div>
  )
}
