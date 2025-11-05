/**
 * Mobile Detection Utilities
 *
 * Provides utilities for detecting mobile devices and viewports.
 *
 * Usage:
 * ```tsx
 * const isMobile = useMobileDetection()
 * if (isMobile) {
 *   return <MobileChatContainer />
 * }
 * ```
 */

'use client'

import { useEffect, useState } from 'react'

/**
 * Breakpoint for mobile vs desktop
 * Matches Tailwind's lg breakpoint (1024px)
 */
export const MOBILE_BREAKPOINT = 1024

/**
 * Check if current viewport is mobile size
 * @returns true if viewport width < 1024px
 */
export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < MOBILE_BREAKPOINT
}

/**
 * Check if user agent indicates mobile device
 * @returns true if mobile/tablet user agent detected
 */
export function isMobileUserAgent(): boolean {
  if (typeof navigator === 'undefined') return false

  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i

  return mobileRegex.test(navigator.userAgent)
}

/**
 * Check if device is iOS
 * @returns true if iOS device (iPhone, iPad, iPod)
 */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false

  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
}

/**
 * Check if device is Android
 * @returns true if Android device
 */
export function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false

  return /Android/.test(navigator.userAgent)
}

/**
 * Check if running in standalone PWA mode
 * @returns true if installed as PWA
 */
export function isStandalonePWA(): boolean {
  if (typeof window === 'undefined') return false

  // iOS
  if ((navigator as any).standalone === true) {
    return true
  }

  // Android
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true
  }

  return false
}

/**
 * Get current device type
 * @returns 'mobile' | 'tablet' | 'desktop'
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'

  const width = window.innerWidth

  // Mobile: < 768px
  if (width < 768) {
    return 'mobile'
  }

  // Tablet: 768px - 1023px
  if (width < MOBILE_BREAKPOINT) {
    return 'tablet'
  }

  // Desktop: >= 1024px
  return 'desktop'
}

/**
 * React hook for mobile detection with responsive updates
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isMobile = useMobileDetection()
 *
 *   return (
 *     <div>
 *       {isMobile ? <MobileView /> : <DesktopView />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useMobileDetection(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // Initial state from server-side
    if (typeof window === 'undefined') return false

    // Initial state from client-side
    return isMobileViewport()
  })

  useEffect(() => {
    // Update on mount with actual viewport
    const checkMobile = () => {
      setIsMobile(isMobileViewport())
    }

    // Check immediately
    checkMobile()

    // Update on window resize
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(checkMobile, 150) // Debounce 150ms
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  return isMobile
}

/**
 * React hook for device type detection
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const deviceType = useDeviceType()
 *
 *   return (
 *     <div>
 *       Current device: {deviceType}
 *     </div>
 *   )
 * }
 * ```
 */
export function useDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>(() => {
    if (typeof window === 'undefined') return 'desktop'
    return getDeviceType()
  })

  useEffect(() => {
    const checkDeviceType = () => {
      setDeviceType(getDeviceType())
    }

    checkDeviceType()

    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(checkDeviceType, 150)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  return deviceType
}

/**
 * React hook for platform detection
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const platform = usePlatform()
 *
 *   if (platform === 'ios') {
 *     return <IOSSpecificFeature />
 *   }
 * }
 * ```
 */
export function usePlatform(): 'ios' | 'android' | 'other' {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other')

  useEffect(() => {
    if (isIOS()) {
      setPlatform('ios')
    } else if (isAndroid()) {
      setPlatform('android')
    } else {
      setPlatform('other')
    }
  }, [])

  return platform
}

/**
 * Get safe area insets from CSS environment variables
 * Useful for devices with notches, Dynamic Island, home indicators
 *
 * @returns Object with top, right, bottom, left insets in pixels
 */
export function getSafeAreaInsets(): {
  top: number
  right: number
  bottom: number
  left: number
} {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }

  const getInset = (variable: string): number => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(variable)
    return parseInt(value, 10) || 0
  }

  return {
    top: getInset('safe-area-inset-top'),
    right: getInset('safe-area-inset-right'),
    bottom: getInset('safe-area-inset-bottom'),
    left: getInset('safe-area-inset-left'),
  }
}

/**
 * Check if device supports touch events
 * @returns true if touch events are supported
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  )
}

/**
 * Check if device supports vibration API
 * @returns true if vibration is supported
 */
export function supportsVibration(): boolean {
  if (typeof navigator === 'undefined') return false

  return 'vibrate' in navigator
}
