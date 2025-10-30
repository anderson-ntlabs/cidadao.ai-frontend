/**
 * Voice Store
 *
 * Global state management for voice settings and preferences
 * using Zustand with localStorage persistence
 *
 * @author Anderson Henrique da Silva
 * @date 2025-10-30
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface VoiceSettings {
  enabled: boolean
  autoSpeak: boolean        // Auto-speak agent responses
  volume: number            // 0.0 - 1.0
  rate: number              // 0.5 - 2.0
  pitch: number             // 0.5 - 2.0
  preferredVoice?: string   // Voice name preference
}

interface VoiceState {
  settings: VoiceSettings
  currentlySpeaking: boolean
  currentAgent: string | null

  // Actions
  setEnabled: (enabled: boolean) => void
  setAutoSpeak: (autoSpeak: boolean) => void
  setVolume: (volume: number) => void
  setRate: (rate: number) => void
  setPitch: (pitch: number) => void
  setPreferredVoice: (voice: string) => void
  setCurrentlySpeaking: (speaking: boolean, agent?: string | null) => void
  resetSettings: () => void
}

const defaultSettings: VoiceSettings = {
  enabled: false,  // Disabled by default (opt-in)
  autoSpeak: false,
  volume: 1.0,
  rate: 1.0,
  pitch: 1.0,
  preferredVoice: undefined
}

export const useVoiceStore = create<VoiceState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      currentlySpeaking: false,
      currentAgent: null,

      setEnabled: (enabled) =>
        set((state) => ({
          settings: { ...state.settings, enabled }
        })),

      setAutoSpeak: (autoSpeak) =>
        set((state) => ({
          settings: { ...state.settings, autoSpeak }
        })),

      setVolume: (volume) =>
        set((state) => ({
          settings: { ...state.settings, volume }
        })),

      setRate: (rate) =>
        set((state) => ({
          settings: { ...state.settings, rate }
        })),

      setPitch: (pitch) =>
        set((state) => ({
          settings: { ...state.settings, pitch }
        })),

      setPreferredVoice: (preferredVoice) =>
        set((state) => ({
          settings: { ...state.settings, preferredVoice }
        })),

      setCurrentlySpeaking: (speaking, agent = null) =>
        set({ currentlySpeaking: speaking, currentAgent: agent }),

      resetSettings: () =>
        set({ settings: defaultSettings })
    }),
    {
      name: 'cidadao-voice-settings',
      version: 1
    }
  )
)
