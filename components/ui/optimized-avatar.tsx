'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { User } from 'lucide-react'

interface OptimizedAvatarProps {
  src?: string | null
  alt: string
  size?: number
  className?: string
  fallbackName?: string
  priority?: boolean
}

export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className,
  fallbackName,
  priority = false,
}: OptimizedAvatarProps) {
  const [error, setError] = useState(false)

  // Generate fallback URL
  const fallbackUrl = fallbackName
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=16a34a&color=fff&size=${size * 2}`
    : null

  // Use fallback if no src or error
  const imageUrl = (!src || error) && fallbackUrl ? fallbackUrl : src

  // Show icon fallback if no image URL
  if (!imageUrl) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full',
          className
        )}
        style={{ width: size, height: size }}
      >
        <User className="w-1/2 h-1/2 text-gray-500 dark:text-gray-400" />
      </div>
    )
  }

  return (
    <div
      className={cn('relative overflow-hidden rounded-full', className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={imageUrl}
        alt={alt}
        width={size}
        height={size}
        className="object-cover"
        onError={() => setError(true)}
        priority={priority}
        unoptimized={imageUrl.includes('ui-avatars.com')} // Don't optimize UI avatars
      />
    </div>
  )
}

// Avatar group component
interface AvatarGroupProps {
  avatars: Array<{
    src?: string | null
    alt: string
    name?: string
  }>
  size?: number
  max?: number
  className?: string
}

export function AvatarGroup({ avatars, size = 32, max = 5, className }: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max)
  const remainingCount = avatars.length - max

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visibleAvatars.map((avatar, index) => (
        <OptimizedAvatar
          key={index}
          src={avatar.src}
          alt={avatar.alt}
          fallbackName={avatar.name}
          size={size}
          className="ring-2 ring-white dark:ring-gray-900"
        />
      ))}
      {remainingCount > 0 && (
        <div
          className="flex items-center justify-center bg-gray-300 dark:bg-gray-600 rounded-full ring-2 ring-white dark:ring-gray-900 text-xs font-medium"
          style={{ width: size, height: size }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}