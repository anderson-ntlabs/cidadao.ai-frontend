/**
 * Browser Detection Utility for Web Speech API
 *
 * Detects browser compatibility with SpeechRecognition API
 * and provides information about the current browser.
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-11-19
 */

import { createLogger } from '@/lib/logger'
import type { BrowserInfo } from './types'

const logger = createLogger('BrowserDetection')

/**
 * Check if the browser supports Web Speech API (SpeechRecognition)
 *
 * Browser Support (2025):
 * - ✅ Chrome/Chromium (Desktop & Android): Full support
 * - ✅ Edge (Desktop & Mobile): Full support
 * - ✅ Safari (iOS 14.5+ & macOS 14.1+): Full support with webkitSpeechRecognition
 * - ⚠️ Firefox: Limited support (behind flag)
 * - ⚠️ Opera, Brave, Vivaldi: Chromium-based, usually works
 *
 * Mobile Notes:
 * - iOS Safari requires user gesture to start recognition
 * - Android Chrome works well, may need microphone permission
 * - PWA context may have different permission handling
 *
 * @returns {boolean} True if SpeechRecognition is supported
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') {
    return false // Server-side rendering
  }

  // Check for both standard and webkit-prefixed API
  const hasAPI = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

  // Additional check for iOS Safari which may have the API but not work in certain contexts
  if (hasAPI && isIOSSafari()) {
    // iOS Safari supports from 14.5+, check if we can create an instance
    try {
      const SpeechRecognition = getSpeechRecognition()
      if (SpeechRecognition) {
        // Try to instantiate to verify it's actually available
        const test = new SpeechRecognition()
        test.abort()
        return true
      }
    } catch {
      // If instantiation fails, API is not truly supported
      return false
    }
  }

  return hasAPI
}

/**
 * Check if running on iOS Safari
 */
export function isIOSSafari(): boolean {
  if (typeof window === 'undefined') return false

  const ua = navigator.userAgent
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua)

  return isIOS && isSafari
}

/**
 * Check if running on Android Chrome
 */
export function isAndroidChrome(): boolean {
  if (typeof window === 'undefined') return false

  const ua = navigator.userAgent
  return /Android/.test(ua) && /Chrome/.test(ua)
}

/**
 * Get the SpeechRecognition constructor
 * Handles vendor prefixes (webkit for Chrome)
 *
 * @returns {any | null} SpeechRecognition constructor or null
 */
export function getSpeechRecognition(): any | null {
  if (typeof window === 'undefined') {
    return null
  }

  // Standard API
  if ('SpeechRecognition' in window) {
    return window.SpeechRecognition
  }

  // Webkit prefix (Chrome/Edge)
  if ('webkitSpeechRecognition' in window) {
    return (window as any).webkitSpeechRecognition
  }

  return null
}

/**
 * Detect the current browser name
 *
 * @returns {string} Browser name (Chrome, Edge, Firefox, Safari, Opera, Unknown)
 */
export function getBrowserName(): string {
  if (typeof window === 'undefined') {
    return 'Unknown'
  }

  const userAgent = navigator.userAgent

  // Edge (Chromium-based)
  if (userAgent.includes('Edg')) {
    return 'Edge'
  }

  // Chrome
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    return 'Chrome'
  }

  // Firefox
  if (userAgent.includes('Firefox')) {
    return 'Firefox'
  }

  // Safari
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return 'Safari'
  }

  // Opera
  if (userAgent.includes('OPR') || userAgent.includes('Opera')) {
    return 'Opera'
  }

  // Brave (harder to detect, uses Chrome user agent)
  if ((navigator as any).brave?.isBrave) {
    return 'Brave'
  }

  return 'Unknown'
}

/**
 * Get browser version
 *
 * @returns {string} Browser version or 'Unknown'
 */
export function getBrowserVersion(): string {
  if (typeof window === 'undefined') {
    return 'Unknown'
  }

  const userAgent = navigator.userAgent
  const browserName = getBrowserName()

  let versionMatch: RegExpMatchArray | null = null

  switch (browserName) {
    case 'Chrome':
      versionMatch = userAgent.match(/Chrome\/(\d+\.\d+)/)
      break
    case 'Edge':
      versionMatch = userAgent.match(/Edg\/(\d+\.\d+)/)
      break
    case 'Firefox':
      versionMatch = userAgent.match(/Firefox\/(\d+\.\d+)/)
      break
    case 'Safari':
      versionMatch = userAgent.match(/Version\/(\d+\.\d+)/)
      break
    case 'Opera':
      versionMatch = userAgent.match(/OPR\/(\d+\.\d+)/)
      break
  }

  return versionMatch ? versionMatch[1] : 'Unknown'
}

/**
 * Check if the browser is mobile
 *
 * @returns {boolean} True if mobile browser
 */
export function isMobileBrowser(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * Get comprehensive browser information
 *
 * @returns {BrowserInfo} Browser information object
 */
export function getBrowserInfo(): BrowserInfo {
  return {
    name: getBrowserName(),
    version: getBrowserVersion(),
    isMobile: isMobileBrowser(),
    supportsSpeechRecognition: isSpeechRecognitionSupported(),
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
  }
}

/**
 * Get recommended browser message for unsupported browsers
 *
 * @param {string} lang - Language code ('pt' or 'en')
 * @returns {string} Recommendation message
 */
export function getUnsupportedBrowserMessage(lang: 'pt' | 'en' = 'pt'): string {
  const browserName = getBrowserName()
  const isMobile = isMobileBrowser()

  const messages = {
    pt: {
      title: '🎤 Entrada de voz não disponível',
      message: `Seu navegador (${browserName}) não suporta entrada de voz.`,
      recommendation: isMobile
        ? 'Por favor, use Chrome (Android) ou Safari (iOS 14.5+) para usar este recurso.'
        : 'Por favor, use Google Chrome, Microsoft Edge ou Safari para usar este recurso.',
      alternative: 'Você pode continuar digitando sua mensagem normalmente.',
    },
    en: {
      title: '🎤 Voice input not available',
      message: `Your browser (${browserName}) does not support voice input.`,
      recommendation: isMobile
        ? 'Please use Chrome (Android) or Safari (iOS 14.5+) to use this feature.'
        : 'Please use Google Chrome, Microsoft Edge, or Safari to use this feature.',
      alternative: 'You can continue typing your message normally.',
    },
  }

  return `${messages[lang].title}\n\n${messages[lang].message}\n${messages[lang].recommendation}\n\n${messages[lang].alternative}`
}

/**
 * Log browser compatibility information
 * Useful for debugging
 */
export function logBrowserCompatibility(): void {
  if (typeof window === 'undefined') {
    return
  }

  const info = getBrowserInfo()
  const iosSafari = isIOSSafari()
  const androidChrome = isAndroidChrome()

  logger.debug('Voice Input Browser Compatibility', {
    browser: `${info.name} ${info.version}`,
    mobile: info.isMobile,
    iosSafari,
    androidChrome,
    speechRecognition: info.supportsSpeechRecognition,
    api: info.supportsSpeechRecognition
      ? getSpeechRecognition()
        ? 'Available'
        : 'Not Available'
      : 'N/A',
    recommendation: !info.supportsSpeechRecognition
      ? info.isMobile
        ? 'Use Chrome (Android) or Safari iOS 14.5+ for voice input'
        : 'Use Chrome, Edge or Safari for voice input'
      : undefined,
  })
}

/**
 * Check if microphone permission can be requested
 * Useful for mobile browsers that require user gesture
 */
export async function checkMicrophonePermission(): Promise<
  'granted' | 'denied' | 'prompt' | 'unsupported'
> {
  if (typeof window === 'undefined') return 'unsupported'

  // Check if permissions API is available
  if ('permissions' in navigator) {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      return result.state as 'granted' | 'denied' | 'prompt'
    } catch {
      // Permissions API doesn't support microphone query in some browsers
    }
  }

  // Fallback: check if getUserMedia is available
  if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
    return 'prompt'
  }

  return 'unsupported'
}

/**
 * Request microphone permission explicitly
 * Useful for mobile browsers that need a user gesture
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    // Stop all tracks immediately - we just needed to trigger permission
    stream.getTracks().forEach((track) => track.stop())
    return true
  } catch (error) {
    logger.warn('Microphone permission denied or unavailable', { error })
    return false
  }
}
