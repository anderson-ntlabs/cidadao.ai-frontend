/**
 * Blur Data Tests
 */

import { describe, it, expect } from 'vitest'
import { blurDataUrls, getBlurDataUrl, shimmerDataUrl } from './blur-data'

describe('Blur Data', () => {
  describe('blurDataUrls', () => {
    it('should have blur data for operarios.png', () => {
      expect(blurDataUrls['operarios.png']).toBeDefined()
      expect(blurDataUrls['operarios.png']).toMatch(/^data:image\/png;base64,/)
    })

    it('should have blur data for Tarsila Antropofagia', () => {
      expect(blurDataUrls['images/Tarsila_Antropofagia.jpg']).toBeDefined()
      expect(blurDataUrls['images/Tarsila_Antropofagia.jpg']).toMatch(/^data:image\/jpeg;base64,/)
    })

    it('should have default blur data for agents', () => {
      expect(blurDataUrls['agents/default']).toBeDefined()
      expect(blurDataUrls['agents/default']).toMatch(/^data:image\/png;base64,/)
    })

    it('should have valid base64 encoded data', () => {
      Object.values(blurDataUrls).forEach((url) => {
        expect(url).toMatch(/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/)
      })
    })
  })

  describe('getBlurDataUrl', () => {
    it('should return blur URL for operarios.png', () => {
      const url = getBlurDataUrl('operarios.png')
      expect(url).toBe(blurDataUrls['operarios.png'])
    })

    it('should return blur URL for Tarsila image', () => {
      const url = getBlurDataUrl('images/Tarsila_Antropofagia.jpg')
      expect(url).toBe(blurDataUrls['images/Tarsila_Antropofagia.jpg'])
    })

    it('should return blur URL for agents default', () => {
      const url = getBlurDataUrl('agents/default')
      expect(url).toBe(blurDataUrls['agents/default'])
    })

    it('should return undefined for unknown path', () => {
      const url = getBlurDataUrl('unknown/path.jpg')
      expect(url).toBeUndefined()
    })

    it('should return undefined for empty path', () => {
      const url = getBlurDataUrl('')
      expect(url).toBeUndefined()
    })

    it('should handle path with different casing', () => {
      // The function is case-sensitive
      const url = getBlurDataUrl('Operarios.png')
      expect(url).toBeUndefined()
    })
  })

  describe('shimmerDataUrl', () => {
    it('should be defined', () => {
      expect(shimmerDataUrl).toBeDefined()
    })

    it('should be a valid base64 SVG data URL', () => {
      expect(shimmerDataUrl).toMatch(/^data:image\/svg\+xml;base64,[A-Za-z0-9+/=]+$/)
    })

    it('should be a non-empty string', () => {
      expect(shimmerDataUrl.length).toBeGreaterThan(50)
    })
  })
})
