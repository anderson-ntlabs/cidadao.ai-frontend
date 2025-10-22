'use client'

import { useMemo } from 'react'
import DOMPurify from 'dompurify'

interface MarkdownMessageProps {
  content: string
  className?: string
}

export function MarkdownMessage({ content, className = '' }: MarkdownMessageProps) {
  // Processar markdown simples
  const processMarkdown = (text: string) => {
    if (!text) return ''

    return text
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Quebras de linha
      .replace(/\n/g, '<br />')
      // Emojis já funcionam nativamente
  }

  // Sanitize HTML to prevent XSS attacks
  const sanitizedHtml = useMemo(() => {
    const html = processMarkdown(content)

    const sanitizeConfig = {
      ALLOWED_TAGS: ['strong', 'br', 'span'],
      ALLOWED_ATTR: ['class'],
      ALLOW_DATA_ATTR: false,
    }

    return DOMPurify.sanitize(html, sanitizeConfig)
  }, [content])

  return (
    <div
      className={`prose prose-sm max-w-none dark:prose-invert ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}