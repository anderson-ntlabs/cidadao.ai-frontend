/**
 * CSS Animation Components
 *
 * Lightweight alternatives to framer-motion using CSS animations
 * for better performance and smaller bundle size
 */

'use client'

import { useState, useEffect, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FadeInProps {
  children: ReactNode
  duration?: number
  delay?: number
  className?: string
  show?: boolean
}

/**
 * Fade in animation component
 */
export function FadeIn({
  children,
  duration = 300,
  delay = 0,
  className,
  show = true,
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setIsVisible(true), delay)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [show, delay])

  return (
    <div
      className={cn('transition-all', isVisible ? 'opacity-100' : 'opacity-0', className)}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  )
}

interface SlideInProps {
  children: ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  duration?: number
  delay?: number
  className?: string
  show?: boolean
}

/**
 * Slide in animation component
 */
export function SlideIn({
  children,
  direction = 'up',
  duration = 300,
  delay = 0,
  className,
  show = true,
}: SlideInProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setIsVisible(true), delay)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [show, delay])

  const transforms = {
    up: isVisible ? 'translateY(0)' : 'translateY(20px)',
    down: isVisible ? 'translateY(0)' : 'translateY(-20px)',
    left: isVisible ? 'translateX(0)' : 'translateX(20px)',
    right: isVisible ? 'translateX(0)' : 'translateX(-20px)',
  }

  return (
    <div
      className={cn('transition-all', isVisible ? 'opacity-100' : 'opacity-0', className)}
      style={{
        transform: transforms[direction],
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  )
}

interface ScaleInProps {
  children: ReactNode
  duration?: number
  delay?: number
  className?: string
  show?: boolean
}

/**
 * Scale in animation component
 */
export function ScaleIn({
  children,
  duration = 300,
  delay = 0,
  className,
  show = true,
}: ScaleInProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setIsVisible(true), delay)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [show, delay])

  return (
    <div
      className={cn(
        'transition-all',
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  )
}

interface AnimatePresenceProps {
  children: ReactNode
  mode?: 'wait' | 'sync'
}

/**
 * Simple AnimatePresence alternative for exit animations
 */
export function AnimatePresence({ children, mode = 'sync' }: AnimatePresenceProps) {
  return <>{children}</>
}

/**
 * Pulse animation for recording indicators
 */
export function PulseAnimation({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('animate-pulse', className)}>{children}</div>
}

/**
 * Spin animation for loading states
 */
export function SpinAnimation({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('animate-spin', className)}>{children}</div>
}
