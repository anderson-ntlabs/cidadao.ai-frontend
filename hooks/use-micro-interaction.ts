/**
 * Micro-interaction hook - Smooth animations for better UX
 *
 * Provides subtle, delightful animations that enhance user experience
 * without being distracting. Based on modern UX best practices.
 *
 * @see https://lawsofux.com/aesthetic-usability-effect/
 * @author Anderson Henrique da Silva
 * @date 2025-11-18
 */

import { useCallback, useEffect, useState } from 'react'

/**
 * Hook for scale animation on click/tap
 * Perfect for buttons and interactive elements
 */
export function useScalePress(initialScale = 1, pressScale = 0.95, duration = 150) {
  const [scale, setScale] = useState(initialScale)
  const [isPressed, setIsPressed] = useState(false)

  const handlePointerDown = useCallback(() => {
    setIsPressed(true)
    setScale(pressScale)
  }, [pressScale])

  const handlePointerUp = useCallback(() => {
    setIsPressed(false)
    setScale(initialScale)
  }, [initialScale])

  return {
    scale,
    isPressed,
    scaleProps: {
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerUp,
      style: {
        transform: `scale(${scale})`,
        transition: `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      },
    },
  }
}

/**
 * Hook for lift animation on hover
 * Creates subtle elevation effect
 */
export function useHoverLift(liftDistance = 4, duration = 200) {
  const [isHovered, setIsHovered] = useState(false)

  const hoverProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    style: {
      transform: isHovered ? `translateY(-${liftDistance}px)` : 'translateY(0)',
      transition: `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    },
  }

  return {
    isHovered,
    hoverProps,
  }
}

/**
 * Hook for ripple effect on click
 * Material Design-style ripple animation
 */
export function useRipple() {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])

  const addRipple = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const id = Date.now()

    setRipples((prev) => [...prev, { x, y, id }])

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id))
    }, 600)
  }, [])

  return {
    ripples,
    addRipple,
  }
}

/**
 * Hook for number count animation
 * Smoothly animates number changes
 */
export function useCountAnimation(target: number, duration = 1000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const increment = target / (duration / 16) // 60fps
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [target, duration])

  return count
}

/**
 * Hook for fade-in animation on mount
 * Useful for sequential content reveals
 */
export function useFadeIn(delay = 0) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return {
    isVisible,
    fadeProps: {
      style: {
        opacity: isVisible ? 1 : 0,
        transition: `opacity 300ms ease-out ${delay}ms`,
      },
    },
  }
}

/**
 * Hook for shake animation on error
 * Draws attention to errors without being jarring
 */
export function useShake(trigger: boolean) {
  const [isShaking, setIsShaking] = useState(false)

  useEffect(() => {
    if (trigger) {
      setIsShaking(true)
      const timer = setTimeout(() => setIsShaking(false), 500)
      return () => clearTimeout(timer)
    }
  }, [trigger])

  return {
    isShaking,
    shakeProps: {
      className: isShaking ? 'animate-shake' : '',
    },
  }
}

/**
 * Hook for pulse animation on update
 * Subtle attention grabber for new content
 */
export function usePulse(trigger: boolean, duration = 1000) {
  const [isPulsing, setIsPulsing] = useState(false)

  useEffect(() => {
    if (trigger) {
      setIsPulsing(true)
      const timer = setTimeout(() => setIsPulsing(false), duration)
      return () => clearTimeout(timer)
    }
  }, [trigger, duration])

  return {
    isPulsing,
    pulseProps: {
      className: isPulsing ? 'animate-pulse-once' : '',
    },
  }
}
