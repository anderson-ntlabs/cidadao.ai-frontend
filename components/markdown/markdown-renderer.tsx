'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // Simple markdown to HTML converter
  const renderMarkdown = (markdown: string): string => {
    let html = markdown

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-6">$1</h1>')

    // Bold and Italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    html = html.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')

    // Lists
    html = html.replace(/^\* (.+)$/gim, '<li class="ml-6 mb-2">• $1</li>')
    html = html.replace(/^\d+\. (.+)$/gim, '<li class="ml-6 mb-2 list-decimal">$1</li>')
    html = html.replace(/(<li.*<\/li>\n?)+/g, (match) => {
      const isOrdered = match.includes('list-decimal')
      const tag = isOrdered ? 'ol' : 'ul'
      return `<${tag} class="my-4">${match}</${tag}>`
    })

    // Code blocks
    html = html.replace(/```([^`]+)```/g, '<pre class="bg-muted p-4 rounded-lg my-4 overflow-x-auto"><code>$1</code></pre>')
    html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>')

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p class="mb-4">')
    html = `<p class="mb-4">${html}</p>`

    // Clean up empty paragraphs
    html = html.replace(/<p class="mb-4"><\/p>/g, '')
    html = html.replace(/<p class="mb-4">(<h[1-3])/g, '$1')
    html = html.replace(/(<\/h[1-3]>)<\/p>/g, '$1')
    html = html.replace(/<p class="mb-4">(<[uo]l)/g, '$1')
    html = html.replace(/(<\/[uo]l>)<\/p>/g, '$1')

    // Emojis in lists
    html = html.replace(/• ([\u{1F300}-\u{1F9FF}])/gu, (match, emoji) => `• <span class="mr-2">${emoji}</span>`)

    return html
  }

  return (
    <div 
      className={cn("prose prose-gray dark:prose-invert max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  )
}