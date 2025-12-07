/**
 * Avatar Component
 *
 * Displays user avatar with fallback to initials
 * Handles external URLs and loading states
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-07
 */

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  alt: string
  fallback?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
}

const imageSizes = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
}

export function Avatar({ src, alt, fallback, size = 'md', className }: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const showImage = src && !imageError
  const initials = fallback || alt.charAt(0).toUpperCase()

  // Check if it's an external URL that needs unoptimized
  const isExternalUrl =
    src?.startsWith('http') && !src?.includes(process.env.NEXT_PUBLIC_SUPABASE_URL || '')

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden flex-shrink-0',
        'bg-gradient-to-br from-green-500 to-blue-600',
        'flex items-center justify-center font-medium text-white',
        sizeClasses[size],
        className
      )}
    >
      {showImage ? (
        <>
          {/* Loading placeholder */}
          {!imageLoaded && (
            <span className="absolute inset-0 flex items-center justify-center">{initials}</span>
          )}
          <Image
            src={src}
            alt={alt}
            width={imageSizes[size]}
            height={imageSizes[size]}
            className={cn(
              'object-cover w-full h-full',
              imageLoaded ? 'opacity-100' : 'opacity-0',
              'transition-opacity duration-200'
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            unoptimized={isExternalUrl}
          />
        </>
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
