/**
 * Voice Settings Store Tests
 *
 * Tests for TTS voice preferences state management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'

// Mock localStorage
const mockStorage: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key: string) => mockStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockStorage[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete mockStorage[key]
  }),
  clear: vi.fn(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key])
  }),
})

import { useVoiceSettingsStore } from './voice-settings-store'

describe('Voice Settings Store', () => {
  beforeEach(() => {
    // Reset store state
    useVoiceSettingsStore.setState({
      defaultVoice: {
        voiceURI: null,
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
      },
      agentVoices: {},
      ttsEnabled: true,
      autoPlayResponses: false,
    })
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have null default voice URI', () => {
      const state = useVoiceSettingsStore.getState()
      expect(state.defaultVoice.voiceURI).toBeNull()
    })

    it('should have default rate of 1.0', () => {
      const state = useVoiceSettingsStore.getState()
      expect(state.defaultVoice.rate).toBe(1.0)
    })

    it('should have default pitch of 1.0', () => {
      const state = useVoiceSettingsStore.getState()
      expect(state.defaultVoice.pitch).toBe(1.0)
    })

    it('should have default volume of 1.0', () => {
      const state = useVoiceSettingsStore.getState()
      expect(state.defaultVoice.volume).toBe(1.0)
    })

    it('should have empty agent voices', () => {
      const state = useVoiceSettingsStore.getState()
      expect(state.agentVoices).toEqual({})
    })

    it('should have TTS enabled by default', () => {
      const state = useVoiceSettingsStore.getState()
      expect(state.ttsEnabled).toBe(true)
    })

    it('should have auto-play disabled by default', () => {
      const state = useVoiceSettingsStore.getState()
      expect(state.autoPlayResponses).toBe(false)
    })
  })

  describe('Default Voice Settings', () => {
    it('should set default voice URI', () => {
      act(() => {
        useVoiceSettingsStore.getState().setDefaultVoice('Google US English')
      })

      expect(useVoiceSettingsStore.getState().defaultVoice.voiceURI).toBe('Google US English')
    })

    it('should set default rate', () => {
      act(() => {
        useVoiceSettingsStore.getState().setDefaultRate(1.5)
      })

      expect(useVoiceSettingsStore.getState().defaultVoice.rate).toBe(1.5)
    })

    it('should clamp rate to minimum 0.5', () => {
      act(() => {
        useVoiceSettingsStore.getState().setDefaultRate(0.1)
      })

      expect(useVoiceSettingsStore.getState().defaultVoice.rate).toBe(0.5)
    })

    it('should clamp rate to maximum 2.0', () => {
      act(() => {
        useVoiceSettingsStore.getState().setDefaultRate(3.0)
      })

      expect(useVoiceSettingsStore.getState().defaultVoice.rate).toBe(2.0)
    })

    it('should set default pitch', () => {
      act(() => {
        useVoiceSettingsStore.getState().setDefaultPitch(1.2)
      })

      expect(useVoiceSettingsStore.getState().defaultVoice.pitch).toBe(1.2)
    })

    it('should clamp pitch to minimum 0.5', () => {
      act(() => {
        useVoiceSettingsStore.getState().setDefaultPitch(0.1)
      })

      expect(useVoiceSettingsStore.getState().defaultVoice.pitch).toBe(0.5)
    })

    it('should clamp pitch to maximum 1.5', () => {
      act(() => {
        useVoiceSettingsStore.getState().setDefaultPitch(2.0)
      })

      expect(useVoiceSettingsStore.getState().defaultVoice.pitch).toBe(1.5)
    })

    it('should set default volume', () => {
      act(() => {
        useVoiceSettingsStore.getState().setDefaultVolume(0.8)
      })

      expect(useVoiceSettingsStore.getState().defaultVoice.volume).toBe(0.8)
    })

    it('should clamp volume to minimum 0', () => {
      act(() => {
        useVoiceSettingsStore.getState().setDefaultVolume(-0.5)
      })

      expect(useVoiceSettingsStore.getState().defaultVoice.volume).toBe(0)
    })

    it('should clamp volume to maximum 1', () => {
      act(() => {
        useVoiceSettingsStore.getState().setDefaultVolume(1.5)
      })

      expect(useVoiceSettingsStore.getState().defaultVoice.volume).toBe(1)
    })
  })

  describe('Agent-specific Voice Configuration', () => {
    it('should set agent voice URI', () => {
      act(() => {
        useVoiceSettingsStore.getState().setAgentVoice('abaporu', 'Google Brazilian Portuguese')
      })

      expect(useVoiceSettingsStore.getState().agentVoices.abaporu.voiceURI).toBe(
        'Google Brazilian Portuguese'
      )
    })

    it('should create agent config with defaults when setting voice', () => {
      act(() => {
        useVoiceSettingsStore.getState().setAgentVoice('zumbi', 'Custom Voice')
      })

      const agentConfig = useVoiceSettingsStore.getState().agentVoices.zumbi
      expect(agentConfig.voiceURI).toBe('Custom Voice')
      expect(agentConfig.pitch).toBe(1.0) // default
      expect(agentConfig.rate).toBe(1.0) // default
    })

    it('should set agent pitch', () => {
      act(() => {
        useVoiceSettingsStore.getState().setAgentPitch('tiradentes', 0.9)
      })

      expect(useVoiceSettingsStore.getState().agentVoices.tiradentes.pitch).toBe(0.9)
    })

    it('should clamp agent pitch to valid range', () => {
      act(() => {
        useVoiceSettingsStore.getState().setAgentPitch('anita', 3.0)
      })

      expect(useVoiceSettingsStore.getState().agentVoices.anita.pitch).toBe(1.5)
    })

    it('should set agent rate', () => {
      act(() => {
        useVoiceSettingsStore.getState().setAgentRate('senna', 1.2)
      })

      expect(useVoiceSettingsStore.getState().agentVoices.senna.rate).toBe(1.2)
    })

    it('should clamp agent rate to valid range', () => {
      act(() => {
        useVoiceSettingsStore.getState().setAgentRate('lampiao', 0.2)
      })

      expect(useVoiceSettingsStore.getState().agentVoices.lampiao.rate).toBe(0.5)
    })

    it('should remove agent voice', () => {
      // First add an agent voice
      useVoiceSettingsStore.setState({
        agentVoices: {
          abaporu: { voiceURI: 'Voice 1', pitch: 1.0, rate: 1.0 },
          zumbi: { voiceURI: 'Voice 2', pitch: 1.0, rate: 1.0 },
        },
      })

      act(() => {
        useVoiceSettingsStore.getState().removeAgentVoice('abaporu')
      })

      expect(useVoiceSettingsStore.getState().agentVoices.abaporu).toBeUndefined()
      expect(useVoiceSettingsStore.getState().agentVoices.zumbi).toBeDefined()
    })

    it('should reset all agent voices', () => {
      useVoiceSettingsStore.setState({
        agentVoices: {
          abaporu: { voiceURI: 'Voice 1', pitch: 1.0, rate: 1.0 },
          zumbi: { voiceURI: 'Voice 2', pitch: 1.1, rate: 1.2 },
          tiradentes: { voiceURI: 'Voice 3', pitch: 0.9, rate: 0.8 },
        },
      })

      act(() => {
        useVoiceSettingsStore.getState().resetAgentVoices()
      })

      expect(useVoiceSettingsStore.getState().agentVoices).toEqual({})
    })
  })

  describe('Get Voice Config for Agent', () => {
    it('should return default voice when no agent config exists', () => {
      useVoiceSettingsStore.setState({
        defaultVoice: {
          voiceURI: 'Default Voice',
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
        },
      })

      const voice = useVoiceSettingsStore.getState().getVoiceForAgent('unknown_agent')
      expect(voice).toBe('Default Voice')
    })

    it('should return agent-specific voice when configured', () => {
      useVoiceSettingsStore.setState({
        defaultVoice: {
          voiceURI: 'Default Voice',
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
        },
        agentVoices: {
          abaporu: { voiceURI: 'Abaporu Voice', pitch: 1.0, rate: 1.0 },
        },
      })

      const voice = useVoiceSettingsStore.getState().getVoiceForAgent('abaporu')
      expect(voice).toBe('Abaporu Voice')
    })

    it('should return default pitch when no agent config exists', () => {
      useVoiceSettingsStore.setState({
        defaultVoice: {
          voiceURI: null,
          rate: 1.0,
          pitch: 1.2,
          volume: 1.0,
        },
      })

      const pitch = useVoiceSettingsStore.getState().getPitchForAgent('unknown_agent')
      expect(pitch).toBe(1.2)
    })

    it('should return agent-specific pitch when configured', () => {
      useVoiceSettingsStore.setState({
        defaultVoice: {
          voiceURI: null,
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
        },
        agentVoices: {
          zumbi: { voiceURI: null, pitch: 0.8, rate: 1.0 },
        },
      })

      const pitch = useVoiceSettingsStore.getState().getPitchForAgent('zumbi')
      expect(pitch).toBe(0.8)
    })

    it('should return default rate when no agent config exists', () => {
      useVoiceSettingsStore.setState({
        defaultVoice: {
          voiceURI: null,
          rate: 1.5,
          pitch: 1.0,
          volume: 1.0,
        },
      })

      const rate = useVoiceSettingsStore.getState().getRateForAgent('unknown_agent')
      expect(rate).toBe(1.5)
    })

    it('should return agent-specific rate when configured', () => {
      useVoiceSettingsStore.setState({
        defaultVoice: {
          voiceURI: null,
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
        },
        agentVoices: {
          tiradentes: { voiceURI: null, pitch: 1.0, rate: 1.8 },
        },
      })

      const rate = useVoiceSettingsStore.getState().getRateForAgent('tiradentes')
      expect(rate).toBe(1.8)
    })

    it('should return full config for agent with fallback', () => {
      useVoiceSettingsStore.setState({
        defaultVoice: {
          voiceURI: 'Default Voice',
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
        },
        agentVoices: {
          abaporu: { voiceURI: 'Custom Voice', pitch: 1.2, rate: 1.5 },
        },
      })

      const config = useVoiceSettingsStore.getState().getConfigForAgent('abaporu')
      expect(config).toEqual({
        voiceURI: 'Custom Voice',
        pitch: 1.2,
        rate: 1.5,
      })
    })

    it('should return defaults when agent has no config', () => {
      useVoiceSettingsStore.setState({
        defaultVoice: {
          voiceURI: 'Default Voice',
          rate: 1.1,
          pitch: 0.9,
          volume: 1.0,
        },
      })

      const config = useVoiceSettingsStore.getState().getConfigForAgent('unknown')
      expect(config).toEqual({
        voiceURI: 'Default Voice',
        pitch: 0.9,
        rate: 1.1,
      })
    })
  })

  describe('TTS Toggle', () => {
    it('should set TTS enabled', () => {
      act(() => {
        useVoiceSettingsStore.getState().setTTSEnabled(false)
      })

      expect(useVoiceSettingsStore.getState().ttsEnabled).toBe(false)
    })

    it('should toggle TTS on', () => {
      useVoiceSettingsStore.setState({ ttsEnabled: false })

      act(() => {
        useVoiceSettingsStore.getState().toggleTTS()
      })

      expect(useVoiceSettingsStore.getState().ttsEnabled).toBe(true)
    })

    it('should toggle TTS off', () => {
      useVoiceSettingsStore.setState({ ttsEnabled: true })

      act(() => {
        useVoiceSettingsStore.getState().toggleTTS()
      })

      expect(useVoiceSettingsStore.getState().ttsEnabled).toBe(false)
    })
  })

  describe('Auto-play Toggle', () => {
    it('should set auto-play enabled', () => {
      act(() => {
        useVoiceSettingsStore.getState().setAutoPlayResponses(true)
      })

      expect(useVoiceSettingsStore.getState().autoPlayResponses).toBe(true)
    })

    it('should toggle auto-play on', () => {
      useVoiceSettingsStore.setState({ autoPlayResponses: false })

      act(() => {
        useVoiceSettingsStore.getState().toggleAutoPlay()
      })

      expect(useVoiceSettingsStore.getState().autoPlayResponses).toBe(true)
    })

    it('should toggle auto-play off', () => {
      useVoiceSettingsStore.setState({ autoPlayResponses: true })

      act(() => {
        useVoiceSettingsStore.getState().toggleAutoPlay()
      })

      expect(useVoiceSettingsStore.getState().autoPlayResponses).toBe(false)
    })
  })

  describe('Reset to Defaults', () => {
    it('should reset all settings to defaults', () => {
      // Set non-default values
      useVoiceSettingsStore.setState({
        defaultVoice: {
          voiceURI: 'Custom Voice',
          rate: 1.5,
          pitch: 0.8,
          volume: 0.5,
        },
        agentVoices: {
          abaporu: { voiceURI: 'Agent Voice', pitch: 1.2, rate: 1.3 },
        },
        ttsEnabled: false,
        autoPlayResponses: true,
      })

      act(() => {
        useVoiceSettingsStore.getState().resetToDefaults()
      })

      const state = useVoiceSettingsStore.getState()
      expect(state.defaultVoice.voiceURI).toBeNull()
      expect(state.defaultVoice.rate).toBe(1.0)
      expect(state.defaultVoice.pitch).toBe(1.0)
      expect(state.defaultVoice.volume).toBe(1.0)
      expect(state.agentVoices).toEqual({})
      expect(state.ttsEnabled).toBe(true)
      expect(state.autoPlayResponses).toBe(false)
    })
  })
})
