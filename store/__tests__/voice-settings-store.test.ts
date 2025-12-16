/**
 * Tests for voice-settings-store
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useVoiceSettingsStore } from '../voice-settings-store'

describe('useVoiceSettingsStore', () => {
  let localStorageMock: Record<string, string>

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock = {}

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => localStorageMock[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          localStorageMock[key] = value
        }),
        removeItem: vi.fn((key: string) => {
          delete localStorageMock[key]
        }),
      },
      writable: true,
    })

    // Reset store to defaults
    const { result } = renderHook(() => useVoiceSettingsStore())
    act(() => {
      result.current.resetToDefaults()
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('has default voice settings', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      expect(result.current.defaultVoice).toEqual({
        voiceURI: null,
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
      })
    })

    it('has empty agentVoices by default', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      expect(result.current.agentVoices).toEqual({})
    })

    it('has ttsEnabled true by default', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      expect(result.current.ttsEnabled).toBe(true)
    })

    it('has autoPlayResponses false by default', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      expect(result.current.autoPlayResponses).toBe(false)
    })
  })

  describe('Default Voice Settings', () => {
    it('sets default voice', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setDefaultVoice('Microsoft David')
      })

      expect(result.current.defaultVoice.voiceURI).toBe('Microsoft David')
    })

    it('sets default rate', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setDefaultRate(1.5)
      })

      expect(result.current.defaultVoice.rate).toBe(1.5)
    })

    it('clamps default rate to minimum 0.5', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setDefaultRate(0.1)
      })

      expect(result.current.defaultVoice.rate).toBe(0.5)
    })

    it('clamps default rate to maximum 2', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setDefaultRate(3)
      })

      expect(result.current.defaultVoice.rate).toBe(2)
    })

    it('sets default pitch', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setDefaultPitch(1.2)
      })

      expect(result.current.defaultVoice.pitch).toBe(1.2)
    })

    it('clamps default pitch to minimum 0.5', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setDefaultPitch(0.1)
      })

      expect(result.current.defaultVoice.pitch).toBe(0.5)
    })

    it('clamps default pitch to maximum 1.5', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setDefaultPitch(2)
      })

      expect(result.current.defaultVoice.pitch).toBe(1.5)
    })

    it('sets default volume', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setDefaultVolume(0.8)
      })

      expect(result.current.defaultVoice.volume).toBe(0.8)
    })

    it('clamps default volume to minimum 0', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setDefaultVolume(-1)
      })

      expect(result.current.defaultVoice.volume).toBe(0)
    })

    it('clamps default volume to maximum 1', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setDefaultVolume(2)
      })

      expect(result.current.defaultVoice.volume).toBe(1)
    })
  })

  describe('Agent-Specific Voice Configuration', () => {
    it('sets agent voice', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setAgentVoice('zumbi', 'Google Portuguese')
      })

      expect(result.current.agentVoices.zumbi.voiceURI).toBe('Google Portuguese')
    })

    it('creates agent config with defaults when setting voice', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setAgentVoice('zumbi', 'Google Portuguese')
      })

      expect(result.current.agentVoices.zumbi.pitch).toBe(1.0)
      expect(result.current.agentVoices.zumbi.rate).toBe(1.0)
    })

    it('sets agent pitch', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setAgentPitch('anita', 1.3)
      })

      expect(result.current.agentVoices.anita.pitch).toBe(1.3)
    })

    it('clamps agent pitch to minimum 0.5', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setAgentPitch('anita', 0.1)
      })

      expect(result.current.agentVoices.anita.pitch).toBe(0.5)
    })

    it('clamps agent pitch to maximum 1.5', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setAgentPitch('anita', 2)
      })

      expect(result.current.agentVoices.anita.pitch).toBe(1.5)
    })

    it('sets agent rate', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setAgentRate('tiradentes', 1.5)
      })

      expect(result.current.agentVoices.tiradentes.rate).toBe(1.5)
    })

    it('clamps agent rate to minimum 0.5', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setAgentRate('tiradentes', 0.1)
      })

      expect(result.current.agentVoices.tiradentes.rate).toBe(0.5)
    })

    it('clamps agent rate to maximum 2', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setAgentRate('tiradentes', 3)
      })

      expect(result.current.agentVoices.tiradentes.rate).toBe(2)
    })

    it('removes agent voice', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setAgentVoice('zumbi', 'Google Portuguese')
      })

      expect(result.current.agentVoices.zumbi).toBeDefined()

      act(() => {
        result.current.removeAgentVoice('zumbi')
      })

      expect(result.current.agentVoices.zumbi).toBeUndefined()
    })

    it('resets all agent voices', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setAgentVoice('zumbi', 'Voice 1')
        result.current.setAgentVoice('anita', 'Voice 2')
        result.current.setAgentVoice('tiradentes', 'Voice 3')
      })

      expect(Object.keys(result.current.agentVoices)).toHaveLength(3)

      act(() => {
        result.current.resetAgentVoices()
      })

      expect(result.current.agentVoices).toEqual({})
    })
  })

  describe('Get Voice For Agent', () => {
    it('returns agent voice when set', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setAgentVoice('zumbi', 'Google Portuguese')
      })

      expect(result.current.getVoiceForAgent('zumbi')).toBe('Google Portuguese')
    })

    it('returns default voice when agent voice not set', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setDefaultVoice('Microsoft David')
      })

      expect(result.current.getVoiceForAgent('nonexistent')).toBe('Microsoft David')
    })

    it('returns null when no voice is set', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      expect(result.current.getVoiceForAgent('nonexistent')).toBeNull()
    })
  })

  describe('Get Pitch For Agent', () => {
    it('returns agent pitch when set', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setAgentPitch('anita', 1.3)
      })

      expect(result.current.getPitchForAgent('anita')).toBe(1.3)
    })

    it('returns default pitch when agent pitch not set', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setDefaultPitch(1.2)
      })

      expect(result.current.getPitchForAgent('nonexistent')).toBe(1.2)
    })
  })

  describe('Get Rate For Agent', () => {
    it('returns agent rate when set', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setAgentRate('tiradentes', 1.5)
      })

      expect(result.current.getRateForAgent('tiradentes')).toBe(1.5)
    })

    it('returns default rate when agent rate not set', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setDefaultRate(1.8)
      })

      expect(result.current.getRateForAgent('nonexistent')).toBe(1.8)
    })
  })

  describe('Get Config For Agent', () => {
    it('returns agent config when all settings are set', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setAgentVoice('zumbi', 'Google Portuguese')
        result.current.setAgentPitch('zumbi', 1.2)
        result.current.setAgentRate('zumbi', 1.5)
      })

      const config = result.current.getConfigForAgent('zumbi')

      expect(config).toEqual({
        voiceURI: 'Google Portuguese',
        pitch: 1.2,
        rate: 1.5,
      })
    })

    it('returns default config for nonexistent agent', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setDefaultVoice('Microsoft David')
        result.current.setDefaultPitch(1.1)
        result.current.setDefaultRate(0.9)
      })

      const config = result.current.getConfigForAgent('nonexistent')

      expect(config).toEqual({
        voiceURI: 'Microsoft David',
        pitch: 1.1,
        rate: 0.9,
      })
    })

    it('returns mixed config (some agent, some default)', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setDefaultVoice('Microsoft David')
        result.current.setDefaultPitch(1.1)
        result.current.setDefaultRate(0.9)
        result.current.setAgentPitch('zumbi', 1.3)
      })

      const config = result.current.getConfigForAgent('zumbi')

      // Voice should fallback to default (agent voice not set)
      expect(config.voiceURI).toBe('Microsoft David')
      // Pitch should use agent setting
      expect(config.pitch).toBe(1.3)
      // Rate should fallback to default (agent rate not set)
      expect(config.rate).toBe(0.9)
    })
  })

  describe('TTS Toggle', () => {
    it('sets TTS enabled', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setTTSEnabled(false)
      })

      expect(result.current.ttsEnabled).toBe(false)
    })

    it('toggles TTS', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      expect(result.current.ttsEnabled).toBe(true)

      act(() => {
        result.current.toggleTTS()
      })

      expect(result.current.ttsEnabled).toBe(false)

      act(() => {
        result.current.toggleTTS()
      })

      expect(result.current.ttsEnabled).toBe(true)
    })
  })

  describe('Auto-Play Toggle', () => {
    it('sets auto-play responses', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      act(() => {
        result.current.setAutoPlayResponses(true)
      })

      expect(result.current.autoPlayResponses).toBe(true)
    })

    it('toggles auto-play', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      expect(result.current.autoPlayResponses).toBe(false)

      act(() => {
        result.current.toggleAutoPlay()
      })

      expect(result.current.autoPlayResponses).toBe(true)

      act(() => {
        result.current.toggleAutoPlay()
      })

      expect(result.current.autoPlayResponses).toBe(false)
    })
  })

  describe('Reset To Defaults', () => {
    it('resets all settings to defaults', () => {
      const { result } = renderHook(() => useVoiceSettingsStore())

      // Set various custom settings
      act(() => {
        result.current.setDefaultVoice('Custom Voice')
        result.current.setDefaultRate(1.5)
        result.current.setDefaultPitch(1.2)
        result.current.setDefaultVolume(0.8)
        result.current.setAgentVoice('zumbi', 'Agent Voice')
        result.current.setTTSEnabled(false)
        result.current.setAutoPlayResponses(true)
      })

      // Verify settings were changed
      expect(result.current.defaultVoice.voiceURI).toBe('Custom Voice')
      expect(result.current.defaultVoice.rate).toBe(1.5)
      expect(result.current.agentVoices.zumbi).toBeDefined()
      expect(result.current.ttsEnabled).toBe(false)
      expect(result.current.autoPlayResponses).toBe(true)

      // Reset to defaults
      act(() => {
        result.current.resetToDefaults()
      })

      // Verify defaults are restored
      expect(result.current.defaultVoice.voiceURI).toBeNull()
      expect(result.current.defaultVoice.rate).toBe(1.0)
      expect(result.current.defaultVoice.pitch).toBe(1.0)
      expect(result.current.defaultVoice.volume).toBe(1.0)
      expect(result.current.agentVoices).toEqual({})
      expect(result.current.ttsEnabled).toBe(true)
      expect(result.current.autoPlayResponses).toBe(false)
    })
  })
})
