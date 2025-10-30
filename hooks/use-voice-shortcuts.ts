/**
 * Voice Keyboard Shortcuts Hook
 *
 * Provides keyboard shortcuts for voice control:
 * - Ctrl+Shift+S: Toggle voice on/off
 * - Ctrl+Shift+P: Pause/Resume speech
 * - Esc: Stop speech
 *
 * @author Anderson Henrique da Silva
 * @date 2025-10-30
 */

'use client'

import { useEffect } from 'react'
import { getTTSService } from '@/lib/voice/tts-service'
import { useVoiceStore } from '@/store/voice-store'

export function useVoiceShortcuts() {
  const { settings, setEnabled } = useVoiceStore()

  useEffect(() => {
    // Only set up shortcuts if TTS is supported
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return
    }

    const ttsService = getTTSService()

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+S: Toggle voice on/off
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault()
        setEnabled(!settings.enabled)
        console.log(`Voice ${!settings.enabled ? 'enabled' : 'disabled'}`)
      }

      // Ctrl+Shift+P: Pause/Resume
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        if (!settings.enabled) return

        if (ttsService.isSpeaking()) {
          if (ttsService.isPausedState()) {
            ttsService.resume()
            console.log('Voice resumed')
          } else {
            ttsService.pause()
            console.log('Voice paused')
          }
        }
      }

      // Esc: Stop speaking
      if (e.key === 'Escape') {
        if (settings.enabled && ttsService.isSpeaking()) {
          e.preventDefault()
          ttsService.stop()
          console.log('Voice stopped')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [settings.enabled, setEnabled])
}
