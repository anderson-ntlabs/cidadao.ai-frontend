import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdaptiveHintSystem, type PageContext, type UserProfile } from './adaptive-hints'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('AdaptiveHintSystem', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('constructor', () => {
    it('should initialize with default user profile', () => {
      const system = new AdaptiveHintSystem()
      const metrics = system.getHintMetrics()

      expect(metrics.userLevel).toBe('new')
    })

    it('should accept custom user profile', () => {
      const customProfile: Partial<UserProfile> = {
        experience: 'advanced',
        preferences: {
          hintsEnabled: false,
          hintLevel: 'minimal'
        }
      }

      const system = new AdaptiveHintSystem(customProfile)
      const metrics = system.getHintMetrics()

      expect(metrics.userLevel).toBe('advanced')
    })

    it('should load shown hints from localStorage', () => {
      localStorage.setItem('adaptive-hints-shown', JSON.stringify(['hint1', 'hint2']))

      const system = new AdaptiveHintSystem()
      const metrics = system.getHintMetrics()

      expect(metrics.shown).toBe(2)
    })

    it('should throw on corrupted localStorage', () => {
      localStorage.setItem('adaptive-hints-shown', 'invalid json')

      // Constructor will throw because source doesn't have try-catch
      expect(() => new AdaptiveHintSystem()).toThrow()
    })
  })

  describe('getRelevantHints', () => {
    it('should return empty array when hints disabled', () => {
      const system = new AdaptiveHintSystem({
        preferences: { hintsEnabled: false, hintLevel: 'standard' }
      })

      const context: PageContext = { page: 'chat' }
      const hints = system.getRelevantHints(context)

      expect(hints).toEqual([])
    })

    it('should show chat start hint for new users', () => {
      const system = new AdaptiveHintSystem({
        experience: 'new',
        interactions: { messagessSent: 0, documentsUploaded: 0, hintsDissmissed: 0, errorsEncountered: 0 }
      })

      const context: PageContext = { page: 'chat', hasMessages: false }
      const hints = system.getRelevantHints(context)

      expect(hints.length).toBeGreaterThan(0)
      expect(hints[0].key).toBe('chat-start')
      expect(hints[0].priority).toBe('critical')
    })

    it('should not show chat start hint again after shown', () => {
      const system = new AdaptiveHintSystem()

      const context: PageContext = { page: 'chat', hasMessages: false }

      // First time - should show
      let hints = system.getRelevantHints(context)
      expect(hints.some(h => h.key === 'chat-start')).toBe(true)

      // Mark as shown
      system.markHintShown('chat-start')

      // Second time - should not show
      hints = system.getRelevantHints(context)
      expect(hints.some(h => h.key === 'chat-start')).toBe(false)
    })

    it('should show keyboard hint when send button not found', () => {
      const system = new AdaptiveHintSystem()

      const context: PageContext = {
        page: 'chat',
        errors: ['send-button-not-found']
      }

      const hints = system.getRelevantHints(context)

      const keyboardHint = hints.find(h => h.key === 'send-keyboard')
      expect(keyboardHint).toBeDefined()
      expect(keyboardHint?.priority).toBe('critical')
      expect(keyboardHint?.showAfter).toBe(0)
    })

    it('should show help hint when multiple errors occur', () => {
      const system = new AdaptiveHintSystem()

      const context: PageContext = {
        page: 'chat',
        errors: ['error1', 'error2', 'error3']
      }

      const hints = system.getRelevantHints(context)

      const helpHint = hints.find(h => h.key === 'need-help')
      expect(helpHint).toBeDefined()
      expect(helpHint?.priority).toBe('high')
    })

    it('should show contrast hint for low contrast ratio', () => {
      const system = new AdaptiveHintSystem()

      const context: PageContext = {
        page: 'chat',
        contrastRatio: 3.0 // Below WCAG 4.5:1
      }

      const hints = system.getRelevantHints(context)

      const contrastHint = hints.find(h => h.key === 'contrast-fix')
      expect(contrastHint).toBeDefined()
      expect(contrastHint?.priority).toBe('high')
      expect(contrastHint?.content.description).toContain('3.00:1')
    })

    it('should not show contrast hint for acceptable ratio', () => {
      const system = new AdaptiveHintSystem()

      const context: PageContext = {
        page: 'chat',
        contrastRatio: 7.0 // Above WCAG 4.5:1
      }

      const hints = system.getRelevantHints(context)

      expect(hints.some(h => h.key === 'contrast-fix')).toBe(false)
    })

    it('should show mobile touch target hint', () => {
      // Need 'detailed' level to see medium priority hints
      const system = new AdaptiveHintSystem({
        preferences: { hintsEnabled: true, hintLevel: 'detailed' }
      })

      const context: PageContext = {
        page: 'chat',
        isMobile: true,
        touchTargetSize: 30 // Below 44px minimum
      }

      const hints = system.getRelevantHints(context)

      const touchHint = hints.find(h => h.key === 'mobile-targets')
      expect(touchHint).toBeDefined()
      expect(touchHint?.priority).toBe('medium')
    })

    it('should show mobile orientation hint for new users', () => {
      // Need 'detailed' level to see low priority hints
      const system = new AdaptiveHintSystem({
        experience: 'new',
        preferences: { hintsEnabled: true, hintLevel: 'detailed' }
      })

      const context: PageContext = {
        page: 'chat',
        isMobile: true
      }

      const hints = system.getRelevantHints(context)

      const orientationHint = hints.find(h => h.key === 'mobile-orientation')
      expect(orientationHint).toBeDefined()
      expect(orientationHint?.priority).toBe('low')
      expect(orientationHint?.showAfter).toBe(10000)
    })

    it('should show navigation hint on non-home pages', () => {
      // Need 'detailed' level to see low priority hints
      const system = new AdaptiveHintSystem({
        preferences: { hintsEnabled: true, hintLevel: 'detailed' }
      })

      const context: PageContext = { page: 'settings' }
      const hints = system.getRelevantHints(context)

      const navHint = hints.find(h => h.key === 'navigation')
      expect(navHint).toBeDefined()
    })

    it('should not show navigation hint on home page', () => {
      const system = new AdaptiveHintSystem()

      const context: PageContext = { page: 'home' }
      const hints = system.getRelevantHints(context)

      expect(hints.some(h => h.key === 'navigation')).toBe(false)
    })
  })

  describe('prioritizeHints', () => {
    it('should sort hints by priority', () => {
      const system = new AdaptiveHintSystem()

      const context: PageContext = {
        page: 'chat',
        errors: ['error1', 'error2', 'error3'], // Creates 'high' priority hint
        contrastRatio: 3.0 // Creates 'high' priority hint
      }

      const hints = system.getRelevantHints(context)

      // Critical hints should come first
      const priorities = hints.map(h => h.priority)
      expect(priorities[0]).toBe('critical')
    })

    it('should filter to critical only for minimal level', () => {
      const system = new AdaptiveHintSystem({
        preferences: { hintsEnabled: true, hintLevel: 'minimal' }
      })

      const context: PageContext = {
        page: 'chat',
        errors: ['send-button-not-found'], // Critical
        contrastRatio: 3.0 // High priority
      }

      const hints = system.getRelevantHints(context)

      // Only critical hints
      expect(hints.every(h => h.priority === 'critical')).toBe(true)
    })

    it('should filter to critical and high for standard level', () => {
      const system = new AdaptiveHintSystem({
        preferences: { hintsEnabled: true, hintLevel: 'standard' }
      })

      const context: PageContext = {
        page: 'chat',
        errors: ['send-button-not-found'], // Critical
        contrastRatio: 3.0, // High
        isMobile: true,
        touchTargetSize: 30 // Medium
      }

      const hints = system.getRelevantHints(context)

      // No medium or low priority hints
      expect(hints.every(h =>
        h.priority === 'critical' || h.priority === 'high'
      )).toBe(true)
    })

    it('should show all hints for detailed level', () => {
      const system = new AdaptiveHintSystem({
        preferences: { hintsEnabled: true, hintLevel: 'detailed' },
        experience: 'new'
      })

      const context: PageContext = {
        page: 'chat',
        errors: ['send-button-not-found'], // Critical
        contrastRatio: 3.0, // High
        isMobile: true,
        touchTargetSize: 30 // Medium
      }

      const hints = system.getRelevantHints(context)

      // Can include medium and low priority
      expect(hints.length).toBeGreaterThan(0)
    })

    it('should limit to maximum 3 hints', () => {
      const system = new AdaptiveHintSystem({
        preferences: { hintLevel: 'detailed' },
        experience: 'new'
      })

      const context: PageContext = {
        page: 'chat',
        hasMessages: false,
        errors: ['error1', 'error2', 'error3'],
        contrastRatio: 3.0,
        isMobile: true,
        touchTargetSize: 30
      }

      const hints = system.getRelevantHints(context)

      expect(hints.length).toBeLessThanOrEqual(3)
    })
  })

  describe('markHintShown', () => {
    it('should add hint to shown set', () => {
      const system = new AdaptiveHintSystem()

      system.markHintShown('test-hint')

      const metrics = system.getHintMetrics()
      expect(metrics.shown).toBe(1)
    })

    it('should persist to localStorage', () => {
      const system = new AdaptiveHintSystem()

      system.markHintShown('hint1')
      system.markHintShown('hint2')

      const stored = localStorage.getItem('adaptive-hints-shown')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed).toContain('hint1')
      expect(parsed).toContain('hint2')
    })
  })

  describe('dismissHint', () => {
    it('should mark hint as shown', () => {
      const system = new AdaptiveHintSystem()

      system.dismissHint('test-hint')

      const metrics = system.getHintMetrics()
      expect(metrics.shown).toBe(1)
    })

    it('should increment dismissed counter', () => {
      const system = new AdaptiveHintSystem()

      system.dismissHint('hint1')
      system.dismissHint('hint2')

      const metrics = system.getHintMetrics()
      expect(metrics.dismissed).toBe(2)
    })

    it('should reduce hint level after 5 dismissals', () => {
      const system = new AdaptiveHintSystem({
        preferences: { hintsEnabled: true, hintLevel: 'detailed' }
      })

      // Dismiss 6 hints
      for (let i = 0; i < 6; i++) {
        system.dismissHint(`hint-${i}`)
      }

      const context: PageContext = {
        page: 'chat',
        isMobile: true,
        touchTargetSize: 30 // Medium priority
      }

      const hints = system.getRelevantHints(context)

      // Should only show critical hints now
      expect(hints.every(h => h.priority === 'critical')).toBe(true)
    })
  })

  describe('updateUserProfile', () => {
    it('should update profile fields', () => {
      const system = new AdaptiveHintSystem()

      system.updateUserProfile({
        preferences: { hintsEnabled: false, hintLevel: 'minimal' }
      })

      const context: PageContext = { page: 'chat' }
      const hints = system.getRelevantHints(context)

      expect(hints).toEqual([])
    })

    it('should upgrade to intermediate after 6 interactions', () => {
      const system = new AdaptiveHintSystem({ experience: 'new' })

      system.updateUserProfile({
        interactions: {
          messagessSent: 4,
          documentsUploaded: 2,
          hintsDissmissed: 0,
          errorsEncountered: 0
        }
      })

      const metrics = system.getHintMetrics()
      expect(metrics.userLevel).toBe('intermediate')
    })

    it('should upgrade to advanced after 21 interactions', () => {
      const system = new AdaptiveHintSystem({ experience: 'new' })

      system.updateUserProfile({
        interactions: {
          messagessSent: 15,
          documentsUploaded: 6,
          hintsDissmissed: 0,
          errorsEncountered: 0
        }
      })

      const metrics = system.getHintMetrics()
      expect(metrics.userLevel).toBe('advanced')
    })

    it('should keep new status with few interactions', () => {
      const system = new AdaptiveHintSystem({ experience: 'new' })

      system.updateUserProfile({
        interactions: {
          messagessSent: 2,
          documentsUploaded: 1,
          hintsDissmissed: 0,
          errorsEncountered: 0
        }
      })

      const metrics = system.getHintMetrics()
      expect(metrics.userLevel).toBe('new')
    })
  })

  describe('getHintMetrics', () => {
    it('should return correct metrics', () => {
      const system = new AdaptiveHintSystem()

      system.markHintShown('hint1')
      system.markHintShown('hint2')
      system.dismissHint('hint3')

      const metrics = system.getHintMetrics()

      expect(metrics.shown).toBe(3)
      expect(metrics.dismissed).toBe(1)
      expect(metrics.userLevel).toBe('new')
      expect(metrics.effectiveness).toBeGreaterThanOrEqual(0)
    })

    it('should calculate effectiveness correctly', () => {
      const system = new AdaptiveHintSystem({
        interactions: {
          messagessSent: 10,
          documentsUploaded: 0,
          hintsDissmissed: 2,
          errorsEncountered: 1
        }
      })

      // Show 10 hints, dismiss 2
      for (let i = 0; i < 10; i++) {
        system.markHintShown(`hint-${i}`)
      }

      const metrics = system.getHintMetrics()

      // Effectiveness should be positive (low dismiss rate, low error rate)
      expect(metrics.effectiveness).toBeGreaterThan(0)
      expect(metrics.effectiveness).toBeLessThanOrEqual(100)
    })

    it('should return zero effectiveness when no hints shown', () => {
      const system = new AdaptiveHintSystem()

      const metrics = system.getHintMetrics()

      expect(metrics.effectiveness).toBe(0)
    })
  })

  describe('hint content generators', () => {
    it('should generate chat start hint content', () => {
      const system = new AdaptiveHintSystem()

      const context: PageContext = { page: 'chat', hasMessages: false }
      const hints = system.getRelevantHints(context)

      const chatHint = hints.find(h => h.key === 'chat-start')
      expect(chatHint?.content.title).toContain('ajudar')
      expect(chatHint?.content.examples).toBeDefined()
      expect(chatHint?.content.examples?.length).toBeGreaterThan(0)
    })

    it('should generate keyboard hint content', () => {
      const system = new AdaptiveHintSystem()

      const context: PageContext = {
        page: 'chat',
        errors: ['send-button-not-found']
      }
      const hints = system.getRelevantHints(context)

      const keyboardHint = hints.find(h => h.key === 'send-keyboard')
      expect(keyboardHint?.content.description).toContain('Enter')
      expect(keyboardHint?.content.note).toContain('Shift+Enter')
    })

    it('should generate contrast hint with ratio', () => {
      const system = new AdaptiveHintSystem()

      const context: PageContext = {
        page: 'chat',
        contrastRatio: 3.5
      }
      const hints = system.getRelevantHints(context)

      const contrastHint = hints.find(h => h.key === 'contrast-fix')
      expect(contrastHint?.content.description).toContain('3.50')
      expect(contrastHint?.content.onClick).toBeDefined()
    })

    it('should generate mobile touch hint with suggestions', () => {
      // Need 'detailed' level to see medium priority hints
      const system = new AdaptiveHintSystem({
        preferences: { hintsEnabled: true, hintLevel: 'detailed' }
      })

      const context: PageContext = {
        page: 'chat',
        isMobile: true,
        touchTargetSize: 30
      }
      const hints = system.getRelevantHints(context)

      const touchHint = hints.find(h => h.key === 'mobile-targets')
      expect(touchHint?.content.suggestions).toBeDefined()
      expect(touchHint?.content.suggestions?.length).toBeGreaterThan(0)
    })

    it('should generate help hint with actions', () => {
      const system = new AdaptiveHintSystem()

      const context: PageContext = {
        page: 'chat',
        errors: ['e1', 'e2', 'e3']
      }
      const hints = system.getRelevantHints(context)

      const helpHint = hints.find(h => h.key === 'need-help')
      expect(helpHint?.content.actions).toBeDefined()
      expect(helpHint?.content.actions?.length).toBe(2)
      expect(helpHint?.content.actions?.[0].action).toBe('start-tour')
    })
  })
})
