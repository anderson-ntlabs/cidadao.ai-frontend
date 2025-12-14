/**
 * Tests for Kids Certificate Requirements
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect } from 'vitest'
import {
  KIDS_CERTIFICATE_LEVELS,
  calculateKidsLevel,
  formatKidsTime,
  getEncouragementMessage,
  type KidsTelemetryData,
} from './kids-certificate-requirements'

describe('Kids Certificate Requirements', () => {
  describe('KIDS_CERTIFICATE_LEVELS', () => {
    it('should have 3 levels', () => {
      expect(KIDS_CERTIFICATE_LEVELS).toHaveLength(3)
    })

    it('should have explorer as first level', () => {
      expect(KIDS_CERTIFICATE_LEVELS[0].id).toBe('explorer')
      expect(KIDS_CERTIFICATE_LEVELS[0].version).toBe('v1.0')
    })

    it('should have creator as second level', () => {
      expect(KIDS_CERTIFICATE_LEVELS[1].id).toBe('creator')
      expect(KIDS_CERTIFICATE_LEVELS[1].version).toBe('v2.0')
    })

    it('should have master as third level', () => {
      expect(KIDS_CERTIFICATE_LEVELS[2].id).toBe('master')
      expect(KIDS_CERTIFICATE_LEVELS[2].version).toBe('v3.0')
    })

    it('should have progressive requirements', () => {
      const explorerVideos = KIDS_CERTIFICATE_LEVELS[0].requirements.videosWatched
      const creatorVideos = KIDS_CERTIFICATE_LEVELS[1].requirements.videosWatched
      const masterVideos = KIDS_CERTIFICATE_LEVELS[2].requirements.videosWatched

      expect(explorerVideos).toBeLessThan(creatorVideos)
      expect(creatorVideos).toBeLessThan(masterVideos)
    })
  })

  describe('calculateKidsLevel', () => {
    it('should return no level for new user', () => {
      const telemetry: KidsTelemetryData = {
        videosWatched: 0,
        totalVideos: 15,
        totalVideoWatchTimeSeconds: 0,
        mentorConversations: 0,
        daysActive: 0,
        totalTimeMinutes: 0,
        totalSessions: 0,
        favoriteAgent: null,
      }

      const result = calculateKidsLevel(telemetry)

      expect(result.currentLevel).toBeNull()
      expect(result.nextLevel?.id).toBe('explorer')
    })

    it('should return explorer level when requirements met', () => {
      const telemetry: KidsTelemetryData = {
        videosWatched: 3,
        totalVideos: 15,
        totalVideoWatchTimeSeconds: 600,
        mentorConversations: 5,
        daysActive: 3,
        totalTimeMinutes: 30,
        totalSessions: 5,
        favoriteAgent: 'lobato',
      }

      const result = calculateKidsLevel(telemetry)

      expect(result.currentLevel?.id).toBe('explorer')
      expect(result.nextLevel?.id).toBe('creator')
    })

    it('should return creator level when requirements met', () => {
      const telemetry: KidsTelemetryData = {
        videosWatched: 8,
        totalVideos: 15,
        totalVideoWatchTimeSeconds: 2400,
        mentorConversations: 15,
        daysActive: 7,
        totalTimeMinutes: 90,
        totalSessions: 10,
        favoriteAgent: 'tarsila',
      }

      const result = calculateKidsLevel(telemetry)

      expect(result.currentLevel?.id).toBe('creator')
      expect(result.nextLevel?.id).toBe('master')
    })

    it('should return master level when all requirements met', () => {
      const telemetry: KidsTelemetryData = {
        videosWatched: 15,
        totalVideos: 15,
        totalVideoWatchTimeSeconds: 10800,
        mentorConversations: 30,
        daysActive: 14,
        totalTimeMinutes: 180,
        totalSessions: 20,
        favoriteAgent: 'lobato',
      }

      const result = calculateKidsLevel(telemetry)

      expect(result.currentLevel?.id).toBe('master')
      expect(result.nextLevel).toBeNull()
      expect(result.progress).toBe(100)
    })

    it('should calculate partial progress correctly', () => {
      const telemetry: KidsTelemetryData = {
        videosWatched: 1,
        totalVideos: 15,
        totalVideoWatchTimeSeconds: 300,
        mentorConversations: 2,
        daysActive: 1,
        totalTimeMinutes: 15,
        totalSessions: 2,
        favoriteAgent: null,
      }

      const result = calculateKidsLevel(telemetry)

      expect(result.progress).toBeGreaterThan(0)
      expect(result.progress).toBeLessThan(100)
    })

    it('should generate milestones', () => {
      const telemetry: KidsTelemetryData = {
        videosWatched: 1,
        totalVideos: 15,
        totalVideoWatchTimeSeconds: 300,
        mentorConversations: 1,
        daysActive: 1,
        totalTimeMinutes: 10,
        totalSessions: 1,
        favoriteAgent: null,
      }

      const result = calculateKidsLevel(telemetry)

      expect(result.milestones).toBeDefined()
      expect(result.milestones.length).toBeGreaterThan(0)
    })

    it('should mark completed milestones', () => {
      const telemetry: KidsTelemetryData = {
        videosWatched: 3,
        totalVideos: 15,
        totalVideoWatchTimeSeconds: 600,
        mentorConversations: 5,
        daysActive: 3,
        totalTimeMinutes: 30,
        totalSessions: 5,
        favoriteAgent: 'lobato',
      }

      const result = calculateKidsLevel(telemetry)
      const firstVideoMilestone = result.milestones.find((m) => m.id === 'first_video')
      const explorerMilestone = result.milestones.find((m) => m.id === 'explorer_badge')

      expect(firstVideoMilestone?.isCompleted).toBe(true)
      expect(explorerMilestone?.isCompleted).toBe(true)
    })
  })

  describe('formatKidsTime', () => {
    it('should format minutes under 60', () => {
      expect(formatKidsTime(30)).toBe('30 minutinhos')
    })

    it('should format exactly 1 hour', () => {
      expect(formatKidsTime(60)).toBe('1 horinha')
    })

    it('should format multiple hours', () => {
      expect(formatKidsTime(120)).toBe('2 horinhas')
    })

    it('should format hours and minutes', () => {
      expect(formatKidsTime(90)).toBe('1h 30min')
    })

    it('should format 0 minutes', () => {
      expect(formatKidsTime(0)).toBe('0 minutinhos')
    })
  })

  describe('getEncouragementMessage', () => {
    it('should return starting message for low progress without level', () => {
      const message = getEncouragementMessage(10, null)

      expect(message).toContain('começando')
    })

    it('should return good progress message for medium progress without level', () => {
      const message = getEncouragementMessage(40, null)

      expect(message).toContain('aprendeu')
    })

    it('should return almost there message for high progress without level', () => {
      const message = getEncouragementMessage(70, null)

      expect(message).toContain('Quase')
    })

    it('should return almost done message for very high progress without level', () => {
      const message = getEncouragementMessage(90, null)

      expect(message).toContain('pouquinho')
    })

    it('should return explorer message for explorer level', () => {
      const explorerLevel = KIDS_CERTIFICATE_LEVELS[0]
      const message = getEncouragementMessage(100, explorerLevel)

      expect(message).toContain('Explorador')
    })

    it('should return creator message for creator level', () => {
      const creatorLevel = KIDS_CERTIFICATE_LEVELS[1]
      const message = getEncouragementMessage(100, creatorLevel)

      expect(message).toContain('Criador')
    })

    it('should return master message for master level', () => {
      const masterLevel = KIDS_CERTIFICATE_LEVELS[2]
      const message = getEncouragementMessage(100, masterLevel)

      expect(message).toContain('MESTRE')
    })
  })
})
