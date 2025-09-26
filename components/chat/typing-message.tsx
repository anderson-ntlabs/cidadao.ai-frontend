'use client'

import { useTypingEffect } from '@/hooks/use-typing-effect'
import { MarkdownMessage } from '@/components/markdown-message'

interface TypingMessageProps {
  content: string
  isLatest?: boolean
  onComplete?: () => void
}

export function TypingMessage({ content, isLatest = false, onComplete }: TypingMessageProps) {
  const { displayedText, isTyping } = useTypingEffect(content, {
    speed: 20,
    onComplete
  })
  
  return (
    <div className="relative">
      <MarkdownMessage content={isLatest ? displayedText : content} />
      {isLatest && isTyping && (
        <span className="inline-block w-2 h-5 bg-gray-600 dark:bg-gray-400 animate-pulse ml-1" />
      )}
    </div>
  )
}