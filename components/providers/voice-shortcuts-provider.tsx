/**
 * Voice Shortcuts Provider
 *
 * Provides keyboard shortcuts for voice control globally
 *
 * @author Anderson Henrique da Silva
 * @date 2025-10-30
 */

'use client'

import { useVoiceShortcuts } from '@/hooks/use-voice-shortcuts'

export function VoiceShortcutsProvider({ children }: { children: React.ReactNode }) {
  useVoiceShortcuts()
  return <>{children}</>
}
