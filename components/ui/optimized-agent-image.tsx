/**
 * Optimized Agent Image Component
 *
 * Lazy-loaded, responsive image component with multiple formats
 * and blur placeholder for optimal performance
 */

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedAgentImageProps {
  agentId: string
  alt: string
  size?: 64 | 128 | 256 | 512
  className?: string
  priority?: boolean
  onLoad?: () => void
  fallback?: string
}

// Placeholder data (will be loaded dynamically)
const placeholders: Record<string, string> = {}

export function OptimizedAgentImage({
  agentId,
  alt,
  size = 128,
  className,
  priority = false,
  onLoad,
  fallback = '/agents/system.webp',
}: OptimizedAgentImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [placeholder, setPlaceholder] = useState<string | undefined>()

  // Load placeholder data
  useEffect(() => {
    if (!placeholders[agentId]) {
      fetch(`/agents/optimized/${agentId}-placeholder.json`)
        .then((res) => res.json())
        .then((data) => {
          placeholders[agentId] = data.placeholder
          setPlaceholder(data.placeholder)
        })
        .catch(() => {
          // Placeholder not critical, continue without it
        })
    } else {
      setPlaceholder(placeholders[agentId])
    }
  }, [agentId])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setError(true)
    setIsLoading(false)
  }

  // Use optimized images if available, fallback to original
  const imageSrc = error ? fallback : `/agents/optimized/${agentId}-${size}.webp`

  // Fallback to PNG if WebP is not supported
  const fallbackSrc = `/agents/optimized/${agentId}-${size}.webp`

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800',
        isLoading && 'animate-pulse',
        className
      )}
      style={{ width: size, height: size }}
    >
      <picture>
        {/* AVIF format (best compression) */}
        <source srcSet={`/agents/optimized/${agentId}-${size}.avif`} type="image/avif" />
        {/* WebP format (good compression, better support) */}
        <source srcSet={imageSrc} type="image/webp" />
        {/* Fallback to optimized PNG */}
        <img
          src={fallbackSrc}
          alt={alt}
          width={size}
          height={size}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={cn(
            'h-full w-full object-cover transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          style={{
            ...(placeholder && {
              backgroundImage: `url(${placeholder})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }),
          }}
        />
      </picture>

      {/* Loading skeleton */}
      {isLoading && !placeholder && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse" />
        </div>
      )}
    </div>
  )
}

/**
 * Agent Avatar with lazy loading and multiple sizes
 */
export function AgentAvatar({
  agent,
  size = 'md',
  className,
  priority = false,
}: {
  agent: { id: string; name: string; avatar?: string }
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  priority?: boolean
}) {
  const sizeMap = {
    sm: 64,
    md: 128,
    lg: 256,
    xl: 512,
  } as const

  const imageSize = sizeMap[size]

  return (
    <OptimizedAgentImage
      agentId={agent.id}
      alt={`Avatar de ${agent.name}`}
      size={imageSize}
      className={className}
      priority={priority}
    />
  )
}

/**
 * Preload critical agent images
 */
export function preloadAgentImage(agentId: string, size: 64 | 128 | 256 | 512 = 128) {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = `/agents/optimized/${agentId}-${size}.webp`
  link.type = 'image/webp'
  document.head.appendChild(link)
}
