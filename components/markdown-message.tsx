'use client'

interface MarkdownMessageProps {
  content: string
  className?: string
}

export function MarkdownMessage({ content, className = '' }: MarkdownMessageProps) {
  // Processar markdown simples
  const processMarkdown = (text: string) => {
    return text
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Quebras de linha
      .replace(/\n/g, '<br />')
      // Emojis já funcionam nativamente
  }
  
  return (
    <div 
      className={`prose prose-sm max-w-none dark:prose-invert ${className}`}
      dangerouslySetInnerHTML={{ __html: processMarkdown(content) }}
    />
  )
}