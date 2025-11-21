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

import type { BrowserInfo } from './types'

/**
 * Check if the browser supports Web Speech API (SpeechRecognition)
 *
 * Browser Support (2025):
 * - ✅ Chrome/Chromium: Full support
 * - ✅ Edge: Full support
 * - ❌ Firefox: No support
 * - ❌ Safari: No support
 * - ❌ Opera, Brave, Vivaldi: No support
 *
 * @returns {boolean} True if SpeechRecognition is supported
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') {
    return false // Server-side rendering
  }

  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
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

  const messages = {
    pt: {
      title: '🎤 Entrada de voz não disponível',
      message: `Seu navegador (${browserName}) não suporta entrada de voz.`,
      recommendation: 'Por favor, use Google Chrome ou Microsoft Edge para usar este recurso.',
      alternative: 'Você pode continuar digitando sua mensagem normalmente.',
    },
    en: {
      title: '🎤 Voice input not available',
      message: `Your browser (${browserName}) does not support voice input.`,
      recommendation: 'Please use Google Chrome or Microsoft Edge to use this feature.',
      alternative: 'You can continue typing your message normally.',
    },
  }

  return `${messages[lang].title}\n\n${messages[lang].message}\n${messages[lang].recommendation}\n\n${messages[lang].alternative}`
}

/**
 * Log browser compatibility information to console
 * Useful for debugging
 */
export function logBrowserCompatibility(): void {
  if (typeof window === 'undefined') {
    return
  }

  const info = getBrowserInfo()

  console.group('🎤 Voice Input Browser Compatibility')
  console.log('Browser:', info.name, info.version)
  console.log('Mobile:', info.isMobile ? 'Yes' : 'No')
  console.log(
    'Speech Recognition:',
    info.supportsSpeechRecognition ? '✅ Supported' : '❌ Not Supported'
  )

  if (info.supportsSpeechRecognition) {
    console.log('API:', getSpeechRecognition() ? 'Available' : 'Not Available')
  } else {
    console.log('💡 Recommendation: Use Chrome or Edge for voice input')
  }

  console.groupEnd()
}
