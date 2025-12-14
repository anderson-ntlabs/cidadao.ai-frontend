/**
 * Tests for Learning Tracks Content Data
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect } from 'vitest'
import {
  VIDEO_STYLE_LABELS,
  XP_CONSTANTS,
  calculateDiaryXp,
  ALL_TRACKS,
  getTrackContent,
  getTotalCertificateHours,
  BACKEND_TRACK,
  FRONTEND_TRACK,
  IA_TRACK,
  DEVOPS_TRACK,
  INTRODUCAO_TRACK,
  type VideoStyle,
  type TrackContent,
  type TrackModule,
} from './tracks-content'

describe('Learning Tracks Content', () => {
  describe('VIDEO_STYLE_LABELS', () => {
    it('should have three video styles', () => {
      expect(Object.keys(VIDEO_STYLE_LABELS)).toHaveLength(3)
    })

    it('should have academic style', () => {
      expect(VIDEO_STYLE_LABELS.academic).toBeDefined()
      expect(VIDEO_STYLE_LABELS.academic.label).toBe('Acadêmico')
      expect(VIDEO_STYLE_LABELS.academic.icon).toBe('🎓')
    })

    it('should have didactic style', () => {
      expect(VIDEO_STYLE_LABELS.didactic).toBeDefined()
      expect(VIDEO_STYLE_LABELS.didactic.label).toBe('Didático')
      expect(VIDEO_STYLE_LABELS.didactic.icon).toBe('📚')
    })

    it('should have practical style', () => {
      expect(VIDEO_STYLE_LABELS.practical).toBeDefined()
      expect(VIDEO_STYLE_LABELS.practical.label).toBe('Prático')
      expect(VIDEO_STYLE_LABELS.practical.icon).toBe('🚀')
    })

    it('should have description for each style', () => {
      Object.values(VIDEO_STYLE_LABELS).forEach((style) => {
        expect(style.description.length).toBeGreaterThan(0)
      })
    })
  })

  describe('XP_CONSTANTS', () => {
    it('should have DIARY_XP_PER_WORD', () => {
      expect(XP_CONSTANTS.DIARY_XP_PER_WORD).toBe(0.5)
    })

    it('should have DIARY_MIN_WORDS', () => {
      expect(XP_CONSTANTS.DIARY_MIN_WORDS).toBe(20)
    })

    it('should have DIARY_MAX_XP', () => {
      expect(XP_CONSTANTS.DIARY_MAX_XP).toBe(100)
    })

    it('should have CHAT_XP_PER_MESSAGE', () => {
      expect(XP_CONSTANTS.CHAT_XP_PER_MESSAGE).toBe(15)
    })

    it('should have CHAT_MAX_XP_PER_MODULE', () => {
      expect(XP_CONSTANTS.CHAT_MAX_XP_PER_MODULE).toBe(75)
    })

    it('should have VIDEO_COMPLETE_XP', () => {
      expect(XP_CONSTANTS.VIDEO_COMPLETE_XP).toBe(50)
    })

    it('should have EXERCISE_CORRECT_XP', () => {
      expect(XP_CONSTANTS.EXERCISE_CORRECT_XP).toBe(30)
    })

    it('should have MODULE_COMPLETE_BONUS', () => {
      expect(XP_CONSTANTS.MODULE_COMPLETE_BONUS).toBe(25)
    })

    it('should have all positive values', () => {
      Object.values(XP_CONSTANTS).forEach((value) => {
        expect(value).toBeGreaterThan(0)
      })
    })
  })

  describe('calculateDiaryXp', () => {
    it('should return 0 for empty text', () => {
      expect(calculateDiaryXp('')).toBe(0)
    })

    it('should return 0 for whitespace only', () => {
      expect(calculateDiaryXp('   \n\t   ')).toBe(0)
    })

    it('should return 0 for text below minimum words', () => {
      const shortText = 'word '.repeat(19).trim() // 19 words
      expect(calculateDiaryXp(shortText)).toBe(0)
    })

    it('should return XP for text at minimum words', () => {
      const minText = 'word '.repeat(20).trim() // 20 words
      const expectedXp = Math.floor(20 * XP_CONSTANTS.DIARY_XP_PER_WORD)
      expect(calculateDiaryXp(minText)).toBe(expectedXp)
    })

    it('should return XP for text above minimum words', () => {
      const text = 'word '.repeat(50).trim() // 50 words
      const expectedXp = Math.floor(50 * XP_CONSTANTS.DIARY_XP_PER_WORD)
      expect(calculateDiaryXp(text)).toBe(expectedXp)
    })

    it('should cap XP at maximum', () => {
      const longText = 'word '.repeat(500).trim() // 500 words
      expect(calculateDiaryXp(longText)).toBe(XP_CONSTANTS.DIARY_MAX_XP)
    })

    it('should handle multi-line text', () => {
      const multiLineText = 'word\nword\nword\n'.repeat(10).trim() // 30 words
      const expectedXp = Math.floor(30 * XP_CONSTANTS.DIARY_XP_PER_WORD)
      expect(calculateDiaryXp(multiLineText)).toBe(expectedXp)
    })

    it('should handle text with extra whitespace', () => {
      const spaceyText = 'word   word    word '.repeat(10).trim() // 30 words
      const expectedXp = Math.floor(30 * XP_CONSTANTS.DIARY_XP_PER_WORD)
      expect(calculateDiaryXp(spaceyText)).toBe(expectedXp)
    })
  })

  describe('Individual Track Contents', () => {
    describe('INTRODUCAO_TRACK', () => {
      it('should have correct id', () => {
        expect(INTRODUCAO_TRACK.id).toBe('introducao')
      })

      it('should have correct name', () => {
        expect(INTRODUCAO_TRACK.name).toBe('Introdução')
      })

      it('should have abaporu as mentor', () => {
        expect(INTRODUCAO_TRACK.mentor.id).toBe('abaporu')
        expect(INTRODUCAO_TRACK.mentor.name).toBe('Abaporu')
      })

      it('should have 6 modules', () => {
        expect(INTRODUCAO_TRACK.modules).toHaveLength(6)
      })

      it('should have totalXp of 500', () => {
        expect(INTRODUCAO_TRACK.totalXp).toBe(500)
      })

      it('should have certificateHours of 2', () => {
        expect(INTRODUCAO_TRACK.certificateHours).toBe(2)
      })
    })

    describe('BACKEND_TRACK', () => {
      it('should have correct id', () => {
        expect(BACKEND_TRACK.id).toBe('backend')
      })

      it('should have correct name', () => {
        expect(BACKEND_TRACK.name).toBe('Backend')
      })

      it('should have santos-dumont as mentor', () => {
        expect(BACKEND_TRACK.mentor.id).toBe('santos-dumont')
        expect(BACKEND_TRACK.mentor.name).toBe('Santos-Dumont')
      })

      it('should have 6 modules', () => {
        expect(BACKEND_TRACK.modules).toHaveLength(6)
      })

      it('should have totalXp of 2000', () => {
        expect(BACKEND_TRACK.totalXp).toBe(2000)
      })

      it('should have certificateHours of 12', () => {
        expect(BACKEND_TRACK.certificateHours).toBe(12)
      })
    })

    describe('FRONTEND_TRACK', () => {
      it('should have correct id', () => {
        expect(FRONTEND_TRACK.id).toBe('frontend')
      })

      it('should have correct name', () => {
        expect(FRONTEND_TRACK.name).toBe('Frontend')
      })

      it('should have bobardi as mentor', () => {
        expect(FRONTEND_TRACK.mentor.id).toBe('bobardi')
        expect(FRONTEND_TRACK.mentor.name).toBe('Lina Bo Bardi')
      })

      it('should have 6 modules', () => {
        expect(FRONTEND_TRACK.modules).toHaveLength(6)
      })

      it('should have totalXp of 2000', () => {
        expect(FRONTEND_TRACK.totalXp).toBe(2000)
      })

      it('should have certificateHours of 12', () => {
        expect(FRONTEND_TRACK.certificateHours).toBe(12)
      })
    })

    describe('IA_TRACK', () => {
      it('should have correct id', () => {
        expect(IA_TRACK.id).toBe('ia')
      })

      it('should have correct name', () => {
        expect(IA_TRACK.name).toBe('IA/ML')
      })

      it('should have santos-dumont as mentor', () => {
        expect(IA_TRACK.mentor.id).toBe('santos-dumont')
        expect(IA_TRACK.mentor.name).toBe('Santos-Dumont')
      })

      it('should have 6 modules', () => {
        expect(IA_TRACK.modules).toHaveLength(6)
      })

      it('should have totalXp of 2500', () => {
        expect(IA_TRACK.totalXp).toBe(2500)
      })

      it('should have certificateHours of 14', () => {
        expect(IA_TRACK.certificateHours).toBe(14)
      })
    })

    describe('DEVOPS_TRACK', () => {
      it('should have correct id', () => {
        expect(DEVOPS_TRACK.id).toBe('devops')
      })

      it('should have correct name', () => {
        expect(DEVOPS_TRACK.name).toBe('DevOps')
      })

      it('should have santos-dumont as mentor', () => {
        expect(DEVOPS_TRACK.mentor.id).toBe('santos-dumont')
        expect(DEVOPS_TRACK.mentor.name).toBe('Santos-Dumont')
      })

      it('should have 6 modules', () => {
        expect(DEVOPS_TRACK.modules).toHaveLength(6)
      })

      it('should have totalXp of 2000', () => {
        expect(DEVOPS_TRACK.totalXp).toBe(2000)
      })

      it('should have certificateHours of 12', () => {
        expect(DEVOPS_TRACK.certificateHours).toBe(12)
      })
    })
  })

  describe('ALL_TRACKS', () => {
    it('should have 5 tracks', () => {
      expect(Object.keys(ALL_TRACKS)).toHaveLength(5)
    })

    it('should include all track IDs', () => {
      expect(ALL_TRACKS).toHaveProperty('introducao')
      expect(ALL_TRACKS).toHaveProperty('backend')
      expect(ALL_TRACKS).toHaveProperty('frontend')
      expect(ALL_TRACKS).toHaveProperty('ia')
      expect(ALL_TRACKS).toHaveProperty('devops')
    })

    it('should have valid track content structure', () => {
      Object.values(ALL_TRACKS).forEach((track) => {
        expect(track).toHaveProperty('id')
        expect(track).toHaveProperty('name')
        expect(track).toHaveProperty('mentor')
        expect(track).toHaveProperty('modules')
        expect(track).toHaveProperty('totalXp')
        expect(track).toHaveProperty('certificateHours')
      })
    })

    it('should have mentor with required properties', () => {
      Object.values(ALL_TRACKS).forEach((track) => {
        expect(track.mentor).toHaveProperty('id')
        expect(track.mentor).toHaveProperty('name')
        expect(track.mentor).toHaveProperty('greeting')
        expect(track.mentor).toHaveProperty('videoIntro')
        expect(track.mentor).toHaveProperty('diaryEncouragement')
        expect(track.mentor).toHaveProperty('chatInvitation')
      })
    })

    it('should have non-empty mentor greeting', () => {
      Object.values(ALL_TRACKS).forEach((track) => {
        expect(track.mentor.greeting.length).toBeGreaterThan(0)
      })
    })

    it('should have positive totalXp', () => {
      Object.values(ALL_TRACKS).forEach((track) => {
        expect(track.totalXp).toBeGreaterThan(0)
      })
    })

    it('should have positive certificateHours', () => {
      Object.values(ALL_TRACKS).forEach((track) => {
        expect(track.certificateHours).toBeGreaterThan(0)
      })
    })
  })

  describe('Track Modules', () => {
    it('should have required properties for each module', () => {
      Object.values(ALL_TRACKS).forEach((track) => {
        track.modules.forEach((module) => {
          expect(module).toHaveProperty('id')
          expect(module).toHaveProperty('title')
          expect(module).toHaveProperty('description')
          expect(module).toHaveProperty('objectives')
          expect(module).toHaveProperty('videos')
          expect(module).toHaveProperty('xpReward')
          expect(module).toHaveProperty('diaryPrompt')
          expect(module).toHaveProperty('chatPrompt')
        })
      })
    })

    it('should have sequential module IDs', () => {
      Object.values(ALL_TRACKS).forEach((track) => {
        track.modules.forEach((module, index) => {
          expect(module.id).toBe(index + 1)
        })
      })
    })

    it('should have non-empty objectives', () => {
      Object.values(ALL_TRACKS).forEach((track) => {
        track.modules.forEach((module) => {
          expect(module.objectives.length).toBeGreaterThan(0)
        })
      })
    })

    it('should have non-empty videos', () => {
      Object.values(ALL_TRACKS).forEach((track) => {
        track.modules.forEach((module) => {
          expect(module.videos.length).toBeGreaterThan(0)
        })
      })
    })

    it('should have positive xpReward', () => {
      Object.values(ALL_TRACKS).forEach((track) => {
        track.modules.forEach((module) => {
          expect(module.xpReward).toBeGreaterThan(0)
        })
      })
    })
  })

  describe('Track Videos', () => {
    it('should have valid video styles', () => {
      const validStyles: VideoStyle[] = ['academic', 'didactic', 'practical']

      Object.values(ALL_TRACKS).forEach((track) => {
        track.modules.forEach((module) => {
          module.videos.forEach((video) => {
            expect(validStyles).toContain(video.style)
          })
        })
      })
    })

    it('should have required video properties', () => {
      Object.values(ALL_TRACKS).forEach((track) => {
        track.modules.forEach((module) => {
          module.videos.forEach((video) => {
            expect(video).toHaveProperty('style')
            expect(video).toHaveProperty('title')
            expect(video).toHaveProperty('channel')
            expect(video).toHaveProperty('channelUrl')
            expect(video).toHaveProperty('videoId')
            expect(video).toHaveProperty('duration')
            expect(video).toHaveProperty('description')
          })
        })
      })
    })

    it('should have non-empty video titles', () => {
      Object.values(ALL_TRACKS).forEach((track) => {
        track.modules.forEach((module) => {
          module.videos.forEach((video) => {
            expect(video.title.length).toBeGreaterThan(0)
          })
        })
      })
    })

    it('should have valid channel URLs', () => {
      Object.values(ALL_TRACKS).forEach((track) => {
        track.modules.forEach((module) => {
          module.videos.forEach((video) => {
            expect(video.channelUrl).toMatch(/^https:\/\/www\.youtube\.com\//)
          })
        })
      })
    })

    it('should have non-empty video IDs', () => {
      Object.values(ALL_TRACKS).forEach((track) => {
        track.modules.forEach((module) => {
          module.videos.forEach((video) => {
            expect(video.videoId.length).toBeGreaterThan(0)
          })
        })
      })
    })

    it('should have duration with min suffix', () => {
      Object.values(ALL_TRACKS).forEach((track) => {
        track.modules.forEach((module) => {
          module.videos.forEach((video) => {
            expect(video.duration).toMatch(/\d+min/)
          })
        })
      })
    })
  })

  describe('Track Exercises', () => {
    it('should have valid exercise types when present', () => {
      const validTypes = ['quiz', 'coding', 'reflection']

      Object.values(ALL_TRACKS).forEach((track) => {
        track.modules.forEach((module) => {
          if (module.exercise) {
            expect(validTypes).toContain(module.exercise.type)
          }
        })
      })
    })

    it('should have question for exercises', () => {
      Object.values(ALL_TRACKS).forEach((track) => {
        track.modules.forEach((module) => {
          if (module.exercise) {
            expect(module.exercise.question.length).toBeGreaterThan(0)
          }
        })
      })
    })

    it('should have options for quiz exercises', () => {
      Object.values(ALL_TRACKS).forEach((track) => {
        track.modules.forEach((module) => {
          if (module.exercise && module.exercise.type === 'quiz') {
            expect(module.exercise.options).toBeDefined()
            expect(module.exercise.options!.length).toBeGreaterThan(1)
          }
        })
      })
    })

    it('should have correctAnswer for quiz exercises', () => {
      Object.values(ALL_TRACKS).forEach((track) => {
        track.modules.forEach((module) => {
          if (module.exercise && module.exercise.type === 'quiz') {
            expect(module.exercise.correctAnswer).toBeDefined()
            expect(module.exercise.correctAnswer).toBeGreaterThanOrEqual(0)
          }
        })
      })
    })

    it('should have minWords for reflection exercises', () => {
      Object.values(ALL_TRACKS).forEach((track) => {
        track.modules.forEach((module) => {
          if (module.exercise && module.exercise.type === 'reflection') {
            expect(module.exercise.minWords).toBeDefined()
            expect(module.exercise.minWords).toBeGreaterThan(0)
          }
        })
      })
    })
  })

  describe('getTrackContent', () => {
    it('should return track for valid ID', () => {
      const track = getTrackContent('backend')
      expect(track).toBeDefined()
      expect(track?.id).toBe('backend')
    })

    it('should return undefined for invalid ID', () => {
      const track = getTrackContent('invalid-track')
      expect(track).toBeUndefined()
    })

    it('should return correct track for all known IDs', () => {
      Object.keys(ALL_TRACKS).forEach((trackId) => {
        const track = getTrackContent(trackId)
        expect(track).toBeDefined()
        expect(track?.id).toBe(trackId)
      })
    })

    it('should return introducao track', () => {
      const track = getTrackContent('introducao')
      expect(track?.name).toBe('Introdução')
    })

    it('should return frontend track', () => {
      const track = getTrackContent('frontend')
      expect(track?.name).toBe('Frontend')
    })

    it('should return ia track', () => {
      const track = getTrackContent('ia')
      expect(track?.name).toBe('IA/ML')
    })

    it('should return devops track', () => {
      const track = getTrackContent('devops')
      expect(track?.name).toBe('DevOps')
    })
  })

  describe('getTotalCertificateHours', () => {
    it('should return total hours for all tracks', () => {
      const totalHours = getTotalCertificateHours()
      expect(totalHours).toBeGreaterThan(0)
    })

    it('should calculate sum correctly', () => {
      const expectedTotal = Object.values(ALL_TRACKS).reduce(
        (sum, track) => sum + track.certificateHours,
        0
      )
      expect(getTotalCertificateHours()).toBe(expectedTotal)
    })

    it('should equal 52 hours (2+12+12+14+12)', () => {
      // introducao: 2, backend: 12, frontend: 12, ia: 14, devops: 12
      expect(getTotalCertificateHours()).toBe(52)
    })
  })
})
