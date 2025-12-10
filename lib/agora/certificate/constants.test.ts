/**
 * Certificate Constants Tests
 *
 * Tests for certificate module constants.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-10
 */

import { describe, it, expect } from 'vitest'
import {
  STORAGE_KEYS,
  VIDEO_DURATIONS,
  REQUIRED_CONTENT_IDS,
  PDF_COLORS,
  PDF_STYLES,
  UI_COLOR_CLASSES,
} from './constants'

describe('Certificate Constants', () => {
  describe('STORAGE_KEYS', () => {
    it('should have video progress key', () => {
      expect(STORAGE_KEYS.VIDEO_PROGRESS).toBe('agora_demo_video_progress')
    })

    it('should have reading progress key', () => {
      expect(STORAGE_KEYS.READING_PROGRESS).toBe('agora_demo_reading_progress')
    })
  })

  describe('VIDEO_DURATIONS', () => {
    it('should have 3 required videos', () => {
      expect(VIDEO_DURATIONS.REQUIRED).toHaveLength(3)
    })

    it('should have 15 total videos', () => {
      expect(VIDEO_DURATIONS.ALL).toHaveLength(15)
    })

    it('should have required videos in seconds', () => {
      // First video: 12 min = 720s
      expect(VIDEO_DURATIONS.REQUIRED[0]).toBe(720)
      // Second video: 35 min = 2100s
      expect(VIDEO_DURATIONS.REQUIRED[1]).toBe(2100)
      // Third video: 120 min = 7200s
      expect(VIDEO_DURATIONS.REQUIRED[2]).toBe(7200)
    })
  })

  describe('REQUIRED_CONTENT_IDS', () => {
    it('should have 3 required video IDs', () => {
      expect(REQUIRED_CONTENT_IDS.VIDEOS).toEqual(['1', '2', '3'])
    })

    it('should have 2 required reading IDs', () => {
      expect(REQUIRED_CONTENT_IDS.READINGS).toEqual(['1', '2'])
    })
  })

  describe('PDF_COLORS', () => {
    it('should have RGB tuples with 3 values each', () => {
      expect(PDF_COLORS.GREEN_800).toHaveLength(3)
      expect(PDF_COLORS.BLUE_500).toHaveLength(3)
      expect(PDF_COLORS.WHITE).toHaveLength(3)
    })

    it('should have valid RGB values (0-255)', () => {
      Object.values(PDF_COLORS).forEach((color) => {
        color.forEach((value) => {
          expect(value).toBeGreaterThanOrEqual(0)
          expect(value).toBeLessThanOrEqual(255)
        })
      })
    })

    it('should have white as [255, 255, 255]', () => {
      expect(PDF_COLORS.WHITE).toEqual([255, 255, 255])
    })
  })

  describe('PDF_STYLES', () => {
    it('should have positive margin', () => {
      expect(PDF_STYLES.MARGIN).toBeGreaterThan(0)
    })

    it('should have font sizes in ascending order', () => {
      expect(PDF_STYLES.FONT_SIZE.TINY).toBeLessThan(PDF_STYLES.FONT_SIZE.SMALL)
      expect(PDF_STYLES.FONT_SIZE.SMALL).toBeLessThan(PDF_STYLES.FONT_SIZE.BODY)
      expect(PDF_STYLES.FONT_SIZE.BODY).toBeLessThan(PDF_STYLES.FONT_SIZE.TITLE)
      expect(PDF_STYLES.FONT_SIZE.TITLE).toBeLessThan(PDF_STYLES.FONT_SIZE.HUGE)
    })

    it('should have line widths in ascending order', () => {
      expect(PDF_STYLES.LINE_WIDTH.THIN).toBeLessThan(PDF_STYLES.LINE_WIDTH.NORMAL)
      expect(PDF_STYLES.LINE_WIDTH.NORMAL).toBeLessThan(PDF_STYLES.LINE_WIDTH.THICK)
      expect(PDF_STYLES.LINE_WIDTH.THICK).toBeLessThan(PDF_STYLES.LINE_WIDTH.BORDER)
    })
  })

  describe('UI_COLOR_CLASSES', () => {
    it('should have Tailwind classes for each color', () => {
      expect(UI_COLOR_CLASSES.green).toBe('bg-green-500')
      expect(UI_COLOR_CLASSES.blue).toBe('bg-blue-500')
      expect(UI_COLOR_CLASSES.purple).toBe('bg-purple-500')
      expect(UI_COLOR_CLASSES.orange).toBe('bg-orange-500')
      expect(UI_COLOR_CLASSES.pink).toBe('bg-pink-500')
    })

    it('should have valid Tailwind class format', () => {
      Object.values(UI_COLOR_CLASSES).forEach((className) => {
        expect(className).toMatch(/^bg-\w+-\d+$/)
      })
    })
  })
})
