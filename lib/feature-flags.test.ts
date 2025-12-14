/**
 * Feature Flags Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Feature Flags', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  describe('featureFlags', () => {
    it('should export featureFlags object', async () => {
      const { featureFlags } = await import('./feature-flags')
      expect(featureFlags).toBeDefined()
      expect(typeof featureFlags).toBe('object')
    })

    it('should have chatV3Enabled flag', async () => {
      const { featureFlags } = await import('./feature-flags')
      expect(typeof featureFlags.chatV3Enabled).toBe('boolean')
    })

    it('should have chatWebSocketEnabled flag', async () => {
      const { featureFlags } = await import('./feature-flags')
      expect(typeof featureFlags.chatWebSocketEnabled).toBe('boolean')
    })

    it('should have chatSSEEnabled flag', async () => {
      const { featureFlags } = await import('./feature-flags')
      expect(typeof featureFlags.chatSSEEnabled).toBe('boolean')
    })

    it('should have chatRetryEnabled flag', async () => {
      const { featureFlags } = await import('./feature-flags')
      expect(typeof featureFlags.chatRetryEnabled).toBe('boolean')
    })

    it('should have chatDemoMode flag', async () => {
      const { featureFlags } = await import('./feature-flags')
      expect(typeof featureFlags.chatDemoMode).toBe('boolean')
    })

    it('should have smartChatEnabled flag', async () => {
      const { featureFlags } = await import('./feature-flags')
      expect(typeof featureFlags.smartChatEnabled).toBe('boolean')
    })

    it('should have unifiedChatEnabled flag', async () => {
      const { featureFlags } = await import('./feature-flags')
      expect(typeof featureFlags.unifiedChatEnabled).toBe('boolean')
    })

    it('should have exportPDFEnabled flag', async () => {
      const { featureFlags } = await import('./feature-flags')
      expect(typeof featureFlags.exportPDFEnabled).toBe('boolean')
    })

    it('should have advancedFiltersEnabled flag', async () => {
      const { featureFlags } = await import('./feature-flags')
      expect(typeof featureFlags.advancedFiltersEnabled).toBe('boolean')
    })

    it('should have multiAgentViewEnabled flag', async () => {
      const { featureFlags } = await import('./feature-flags')
      expect(typeof featureFlags.multiAgentViewEnabled).toBe('boolean')
    })
  })

  describe('isFeatureEnabled', () => {
    it('should return boolean for chatV3Enabled', async () => {
      const { isFeatureEnabled } = await import('./feature-flags')
      const result = isFeatureEnabled('chatV3Enabled')
      expect(typeof result).toBe('boolean')
    })

    it('should return boolean for chatWebSocketEnabled', async () => {
      const { isFeatureEnabled } = await import('./feature-flags')
      const result = isFeatureEnabled('chatWebSocketEnabled')
      expect(typeof result).toBe('boolean')
    })

    it('should return boolean for unifiedChatEnabled', async () => {
      const { isFeatureEnabled } = await import('./feature-flags')
      const result = isFeatureEnabled('unifiedChatEnabled')
      expect(typeof result).toBe('boolean')
    })

    it('should return the same value as featureFlags object', async () => {
      const { featureFlags, isFeatureEnabled } = await import('./feature-flags')
      expect(isFeatureEnabled('chatV3Enabled')).toBe(featureFlags.chatV3Enabled)
      expect(isFeatureEnabled('exportPDFEnabled')).toBe(featureFlags.exportPDFEnabled)
    })
  })

  describe('getEnabledFeatures', () => {
    it('should return an array', async () => {
      const { getEnabledFeatures } = await import('./feature-flags')
      const result = getEnabledFeatures()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should return array of strings', async () => {
      const { getEnabledFeatures } = await import('./feature-flags')
      const result = getEnabledFeatures()
      result.forEach((feature) => {
        expect(typeof feature).toBe('string')
      })
    })

    it('should only include enabled features', async () => {
      const { featureFlags, getEnabledFeatures } = await import('./feature-flags')
      const enabled = getEnabledFeatures()

      enabled.forEach((feature) => {
        expect(featureFlags[feature as keyof typeof featureFlags]).toBe(true)
      })
    })

    it('should not include disabled features', async () => {
      const { featureFlags, getEnabledFeatures } = await import('./feature-flags')
      const enabled = getEnabledFeatures()

      Object.entries(featureFlags).forEach(([flag, value]) => {
        if (!value) {
          expect(enabled).not.toContain(flag)
        }
      })
    })
  })

  describe('FeatureFlags interface', () => {
    it('should have all required properties', async () => {
      const { featureFlags } = await import('./feature-flags')

      const requiredFlags = [
        'chatV3Enabled',
        'chatWebSocketEnabled',
        'chatSSEEnabled',
        'chatRetryEnabled',
        'chatDemoMode',
        'smartChatEnabled',
        'unifiedChatEnabled',
        'exportPDFEnabled',
        'advancedFiltersEnabled',
        'multiAgentViewEnabled',
      ]

      requiredFlags.forEach((flag) => {
        expect(featureFlags).toHaveProperty(flag)
      })
    })
  })
})
