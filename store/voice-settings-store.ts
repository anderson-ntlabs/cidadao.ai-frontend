/**
 * Voice Settings Store
 *
 * Zustand store for managing TTS voice preferences.
 * Allows per-agent voice customization with persistence.
 *
 * Features:
 * - Default voice configuration
 * - Per-agent voice mapping (democratic - user choice)
 * - Rate, pitch, and volume settings
 * - localStorage persistence
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-01
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export interface VoiceSettings {
  voiceURI: string | null
  rate: number
  pitch: number
  volume: number
}

export interface AgentVoiceMapping {
  [agentId: string]: string // agentId -> voiceURI
}

export interface VoiceSettingsState {
  // Global default settings
  defaultVoice: VoiceSettings

  // Per-agent voice mappings (user can assign any voice to any agent)
  agentVoices: AgentVoiceMapping

  // TTS enabled/disabled
  ttsEnabled: boolean

  // Auto-play responses
  autoPlayResponses: boolean
}

export interface VoiceSettingsActions {
  // Default voice settings
  setDefaultVoice: (voiceURI: string | null) => void
  setDefaultRate: (rate: number) => void
  setDefaultPitch: (pitch: number) => void
  setDefaultVolume: (volume: number) => void

  // Agent-specific voice
  setAgentVoice: (agentId: string, voiceURI: string) => void
  removeAgentVoice: (agentId: string) => void
  resetAgentVoices: () => void

  // Get voice for agent (with fallback to default)
  getVoiceForAgent: (agentId: string) => string | null

  // TTS toggle
  setTTSEnabled: (enabled: boolean) => void
  toggleTTS: () => void

  // Auto-play toggle
  setAutoPlayResponses: (enabled: boolean) => void
  toggleAutoPlay: () => void

  // Reset all settings
  resetToDefaults: () => void
}

const DEFAULT_STATE: VoiceSettingsState = {
  defaultVoice: {
    voiceURI: null, // Will be auto-detected on first use
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  },
  agentVoices: {},
  ttsEnabled: true,
  autoPlayResponses: false,
}

export const useVoiceSettingsStore = create<VoiceSettingsState & VoiceSettingsActions>()(
  persist(
    immer((set, get) => ({
      ...DEFAULT_STATE,

      // Default voice settings
      setDefaultVoice: (voiceURI) =>
        set((state) => {
          state.defaultVoice.voiceURI = voiceURI
        }),

      setDefaultRate: (rate) =>
        set((state) => {
          state.defaultVoice.rate = Math.max(0.1, Math.min(10, rate))
        }),

      setDefaultPitch: (pitch) =>
        set((state) => {
          state.defaultVoice.pitch = Math.max(0, Math.min(2, pitch))
        }),

      setDefaultVolume: (volume) =>
        set((state) => {
          state.defaultVoice.volume = Math.max(0, Math.min(1, volume))
        }),

      // Agent-specific voice
      setAgentVoice: (agentId, voiceURI) =>
        set((state) => {
          state.agentVoices[agentId] = voiceURI
        }),

      removeAgentVoice: (agentId) =>
        set((state) => {
          delete state.agentVoices[agentId]
        }),

      resetAgentVoices: () =>
        set((state) => {
          state.agentVoices = {}
        }),

      // Get voice for agent (with fallback to default)
      getVoiceForAgent: (agentId) => {
        const state = get()
        return state.agentVoices[agentId] || state.defaultVoice.voiceURI
      },

      // TTS toggle
      setTTSEnabled: (enabled) =>
        set((state) => {
          state.ttsEnabled = enabled
        }),

      toggleTTS: () =>
        set((state) => {
          state.ttsEnabled = !state.ttsEnabled
        }),

      // Auto-play toggle
      setAutoPlayResponses: (enabled) =>
        set((state) => {
          state.autoPlayResponses = enabled
        }),

      toggleAutoPlay: () =>
        set((state) => {
          state.autoPlayResponses = !state.autoPlayResponses
        }),

      // Reset all settings
      resetToDefaults: () =>
        set((state) => {
          Object.assign(state, DEFAULT_STATE)
        }),
    })),
    {
      name: 'cidadao-voice-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        defaultVoice: state.defaultVoice,
        agentVoices: state.agentVoices,
        ttsEnabled: state.ttsEnabled,
        autoPlayResponses: state.autoPlayResponses,
      }),
    }
  )
)
