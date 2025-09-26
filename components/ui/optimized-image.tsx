'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ImageOff } from 'lucide-react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  fallback?: React.ReactNode
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes,
  quality = 75,
  placeholder,
  blurDataURL,
  onLoad,
  fallback,
}: OptimizedImageProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  if (error && fallback) {
    return <>{fallback}</>
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-100 dark:bg-gray-800',
          className
        )}
        style={!fill ? { width, height } : undefined}
      >
        <ImageOff className="w-8 h-8 text-gray-400" />
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {loading && !priority && (
        <div
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"
          style={!fill ? { width, height } : undefined}
        />
      )}
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes || '100vw'}
          quality={quality}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          className={cn('object-cover', className)}
          onError={() => setError(true)}
          onLoad={() => {
            setLoading(false)
            onLoad?.()
          }}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width || 500}
          height={height || 300}
          quality={quality}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          className={className}
          onError={() => setError(true)}
          onLoad={() => {
            setLoading(false)
            onLoad?.()
          }}
        />
      )}
    </div>
  )
}

// Hero image with responsive sizing
interface HeroImageProps extends Omit<OptimizedImageProps, 'sizes'> {
  aspectRatio?: '16/9' | '4/3' | '1/1' | '3/2'
}

export function HeroImage({
  aspectRatio = '16/9',
  className,
  ...props
}: HeroImageProps) {
  const aspectClasses = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-4/3',
    '1/1': 'aspect-square',
    '3/2': 'aspect-[3/2]',
  }

  return (
    <div className={cn('relative w-full overflow-hidden', aspectClasses[aspectRatio], className)}>
      <OptimizedImage
        {...props}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
        priority
      />
    </div>
  )
}

// Gallery image with loading state
export function GalleryImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
      quality={85}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
    />
  )
}