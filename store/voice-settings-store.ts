/**
 * Voice Settings Store
 *
 * Zustand store for managing TTS voice preferences.
 * Allows per-agent voice customization with persistence.
 *
 * Features:
 * - Default voice configuration
 * - Per-agent voice + pitch + rate settings (democratic - user choice)
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

export interface AgentVoiceConfig {
  voiceURI: string | null
  pitch: number
  rate: number
}

export interface AgentVoiceMapping {
  [agentId: string]: AgentVoiceConfig
}

export interface VoiceSettingsState {
  // Global default settings
  defaultVoice: VoiceSettings

  // Per-agent voice configurations (voice + pitch + rate per agent)
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

  // Agent-specific voice configuration
  setAgentVoice: (agentId: string, voiceURI: string | null) => void
  setAgentPitch: (agentId: string, pitch: number) => void
  setAgentRate: (agentId: string, rate: number) => void
  removeAgentVoice: (agentId: string) => void
  resetAgentVoices: () => void

  // Get voice config for agent (with fallback to default)
  getVoiceForAgent: (agentId: string) => string | null
  getPitchForAgent: (agentId: string) => number
  getRateForAgent: (agentId: string) => number
  getConfigForAgent: (agentId: string) => AgentVoiceConfig

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
          state.defaultVoice.rate = Math.max(0.5, Math.min(2, rate))
        }),

      setDefaultPitch: (pitch) =>
        set((state) => {
          state.defaultVoice.pitch = Math.max(0.5, Math.min(1.5, pitch))
        }),

      setDefaultVolume: (volume) =>
        set((state) => {
          state.defaultVoice.volume = Math.max(0, Math.min(1, volume))
        }),

      // Agent-specific voice configuration
      setAgentVoice: (agentId, voiceURI) =>
        set((state) => {
          if (!state.agentVoices[agentId]) {
            state.agentVoices[agentId] = {
              voiceURI: null,
              pitch: state.defaultVoice.pitch,
              rate: state.defaultVoice.rate,
            }
          }
          state.agentVoices[agentId].voiceURI = voiceURI
        }),

      setAgentPitch: (agentId, pitch) =>
        set((state) => {
          if (!state.agentVoices[agentId]) {
            state.agentVoices[agentId] = {
              voiceURI: null,
              pitch: state.defaultVoice.pitch,
              rate: state.defaultVoice.rate,
            }
          }
          state.agentVoices[agentId].pitch = Math.max(0.5, Math.min(1.5, pitch))
        }),

      setAgentRate: (agentId, rate) =>
        set((state) => {
          if (!state.agentVoices[agentId]) {
            state.agentVoices[agentId] = {
              voiceURI: null,
              pitch: state.defaultVoice.pitch,
              rate: state.defaultVoice.rate,
            }
          }
          state.agentVoices[agentId].rate = Math.max(0.5, Math.min(2, rate))
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
        return state.agentVoices[agentId]?.voiceURI || state.defaultVoice.voiceURI
      },

      getPitchForAgent: (agentId) => {
        const state = get()
        return state.agentVoices[agentId]?.pitch ?? state.defaultVoice.pitch
      },

      getRateForAgent: (agentId) => {
        const state = get()
        return state.agentVoices[agentId]?.rate ?? state.defaultVoice.rate
      },

      getConfigForAgent: (agentId) => {
        const state = get()
        const agentConfig = state.agentVoices[agentId]
        return {
          voiceURI: agentConfig?.voiceURI || state.defaultVoice.voiceURI,
          pitch: agentConfig?.pitch ?? state.defaultVoice.pitch,
          rate: agentConfig?.rate ?? state.defaultVoice.rate,
        }
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
