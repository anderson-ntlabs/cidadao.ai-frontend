/**
 * Message Bubble Component - Clean Design
 *
 * User messages: colored bubble
 * Agent messages: plain text with typing animation
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-25
 */

'use client'

import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { Copy, Share2, Download, ThumbsUp, ThumbsDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { VoicePlayer } from '@/components/voice'

// Lazy load ReactMarkdown for better initial performance
const ReactMarkdown = lazy(() => import('react-markdown'))

export interface MessageBubbleProps {
  content: string
  role: 'user' | 'assistant'
  agentName?: string
  agentRole?: string
  agentId?: string
  isLatest?: boolean
  isLoading?: boolean
  isStreaming?: boolean
  onComplete?: () => void
  metadata?: Record<string, any>
}

// Typing cursor component
function TypingCursor() {
  return <span className="inline-block w-0.5 h-5 bg-green-500 animate-pulse ml-0.5 align-middle" />
}

export function MessageBubble({
  content,
  role,
  agentName,
  agentRole,
  agentId,
  isLatest = false,
  isLoading = false,
  isStreaming = false,
  onComplete,
  metadata,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const [showCursor, setShowCursor] = useState(false)
  const prevContentRef = useRef(content)
  const contentRef = useRef<HTMLDivElement>(null)

  // Show cursor when content is changing (streaming)
  useEffect(() => {
    if (role === 'assistant' && content !== prevContentRef.current) {
      setShowCursor(true)
      prevContentRef.current = content

      // Hide cursor after content stops changing
      const timeout = setTimeout(() => {
        setShowCursor(false)
        onComplete?.()
      }, 500)

      return () => clearTimeout(timeout)
    }
  }, [content, role, onComplete])

  // Show cursor while streaming
  useEffect(() => {
    if (isStreaming || (isLatest && isLoading)) {
      setShowCursor(true)
    }
  }, [isStreaming, isLatest, isLoading])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      toast.success('Copiado!', 'Mensagem copiada para a area de transferencia')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Erro', 'Nao foi possivel copiar a mensagem')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cidadao.AI',
          text: content,
        })
      } catch {
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

  // User message - with bubble
  if (role === 'user') {
    return (
      <div className="group relative">
        <div className="rounded-2xl px-4 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-md">
          <p className="whitespace-pre-wrap text-sm">{content}</p>
        </div>

        {/* Quick Actions */}
        <div
          className={cn(
            'absolute -bottom-6 right-0 flex items-center gap-1 transition-all duration-200',
            'opacity-0 translate-y-1 pointer-events-none',
            'group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto'
          )}
        >
          <button
            onClick={handleCopy}
            className="p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all shadow-sm"
            title="Copiar"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>
    )
  }

  // Assistant message - clean text, no bubble
  return (
    <div className="group relative">
      {/* Agent Info Header */}
      {agentName && (
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {agentName}
          </span>
          {agentRole && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{agentRole}</span>
          )}
          {metadata?.model && (
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded font-medium',
                metadata.model === 'sabia-3'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              )}
            >
              {metadata.model === 'sabia-3' ? 'Sabia-3' : 'Sabiazinho-3'}
            </span>
          )}
        </div>
      )}

      {/* Message Content - Plain text, no bubble */}
      <div ref={contentRef} className="text-gray-800 dark:text-gray-200">
        {content ? (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-p:leading-relaxed">
            <Suspense
              fallback={
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
                </div>
              }
            >
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0 text-gray-800 dark:text-gray-200 leading-relaxed">
                      {children}
                      {showCursor && <TypingCursor />}
                    </p>
                  ),
                  code: ({ inline, children, ...props }: any) =>
                    inline ? (
                      <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono text-pink-600 dark:text-pink-400">
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto my-2">
                        <code {...props}>{children}</code>
                      </pre>
                    ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-1 my-2 text-gray-800 dark:text-gray-200">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-1 my-2 text-gray-800 dark:text-gray-200">
                      {children}
                    </ol>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-gray-900 dark:text-gray-100">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => <em className="italic">{children}</em>,
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 dark:text-green-400 hover:underline"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </Suspense>
          </div>
        ) : (
          // Empty content - show typing indicator
          <div className="flex items-center gap-1 text-gray-500">
            <span
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            />
            <span
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <span
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        )}
      </div>

      {/* Quick Actions - Show on hover */}
      {content && !isLoading && (
        <div
          className={cn(
            'flex items-center gap-1 mt-3 transition-all duration-200',
            'opacity-0 group-hover:opacity-100'
          )}
        >
          {/* Voice Player */}
          <VoicePlayer
            text={content}
            agentId={agentId}
            agentName={agentName}
            size="sm"
            variant="default"
          />

          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />

          <button
            onClick={handleCopy}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-all"
            title="Copiar"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleShare}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-all"
            title="Compartilhar"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleExport}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-all"
            title="Exportar"
          >
            <Download className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />

          <button
            onClick={() => handleFeedback(true)}
            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-all"
            title="Util"
          >
            <ThumbsUp className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleFeedback(false)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
            title="Nao util"
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Confidence Badge */}
      {metadata?.confidence && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500',
                metadata.confidence >= 0.9
                  ? 'bg-green-500'
                  : metadata.confidence >= 0.7
                    ? 'bg-yellow-500'
                    : 'bg-orange-500'
              )}
              style={{ width: `${metadata.confidence * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">
            {Math.round(metadata.confidence * 100)}% confianca
          </span>
        </div>
      )}
    </div>
  )
}
