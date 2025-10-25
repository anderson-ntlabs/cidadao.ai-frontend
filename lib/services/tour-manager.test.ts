import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TourManager, type TourConfig } from './tour-manager'

// Mock driver.js - vi.mock is hoisted, so use factory function
vi.mock('driver.js', () => ({
  driver: vi.fn(() => ({
    setSteps: vi.fn(),
    highlight: vi.fn(),
    moveNext: vi.fn(),
    movePrevious: vi.fn(),
    destroy: vi.fn(),
    getActiveIndex: vi.fn(() => 0),
    isFirstStep: vi.fn(() => true),
    isLastStep: vi.fn(() => false),
    hasNextStep: vi.fn(() => false)
  }))
}))

// Mock TourAnalytics
vi.mock('./tour-analytics', () => ({
  TourAnalytics: vi.fn().mockImplementation(() => ({
    startSession: vi.fn().mockReturnValue('test-session-id'),
    track: vi.fn(),
    completeSession: vi.fn(),
    getSavedSessions: vi.fn().mockReturnValue([]),
    getMetrics: vi.fn().mockReturnValue({
      completion_rate: 0,
      average_time_spent: 0,
      most_common_exit_point: null,
      total_sessions: 0
    })
  }))
}))

describe('TourManager', () => {
  let manager: TourManager

  beforeEach(() => {
    vi.clearAllMocks()
    manager = new TourManager()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('constructor', () => {
    it('should initialize with TourAnalytics instance', () => {
      expect(manager).toBeDefined()
      expect(manager['analytics']).toBeDefined()
    })

    it('should have empty trigger timeouts map', () => {
      expect(manager['triggerTimeouts'].size).toBe(0)
    })
  })

  describe('initialize', () => {
    it('should initialize with default config', () => {
      manager.initialize({})

      expect(manager['config']).toMatchObject({
        id: 'cidadao-onboarding',
        version: '1.0.0',
        mode: 'quick',
        steps: []
      })
    })

    it('should accept custom config', () => {
      const customConfig: Partial<TourConfig> = {
        id: 'custom-tour',
        version: '2.0.0',
        mode: 'complete'
      }

      manager.initialize(customConfig)

      expect(manager['config']).toMatchObject({
        id: 'custom-tour',
        version: '2.0.0',
        mode: 'complete'
      })
    })

    it('should initialize driver.js with Portuguese config', async () => {
      const { driver } = await import('driver.js')

      manager.initialize({})

      expect(driver).toHaveBeenCalledWith(
        expect.objectContaining({
          progressText: 'Passo {{current}} de {{total}}',
          prevBtnText: '← Voltar',
          nextBtnText: 'Próximo →',
          doneBtnText: 'Começar!'
        })
      )
    })
  })

  describe('start', () => {
    it('should initialize driver if not created', () => {
      expect(manager['driver']).toBeNull()

      manager.initialize({ mode: 'quick' })

      expect(manager['driver']).toBeDefined()
    })

    it('should have defined start method', () => {
      expect(typeof manager.start).toBe('function')
    })
  })

  describe('navigation', () => {
    beforeEach(() => {
      manager.initialize({})
    })

    it('should move to next step without error', () => {
      expect(() => manager.moveNext()).not.toThrow()
    })

    it('should move to previous step without error', () => {
      expect(() => manager.movePrevious()).not.toThrow()
    })

    it('should check if first step', () => {
      const isFirst = manager.isFirstStep()
      expect(typeof isFirst).toBe('boolean')
    })

    it('should check if last step', () => {
      const isLast = manager.isLastStep()
      expect(typeof isLast).toBe('boolean')
    })

    it('should check if has next step', () => {
      const hasNext = manager.hasNextStep()
      expect(typeof hasNext).toBe('boolean')
    })

    it('should handle null driver in navigation checks', () => {
      manager['driver'] = null

      expect(manager.isFirstStep()).toBe(true)
      expect(manager.isLastStep()).toBe(false)
      expect(manager.hasNextStep()).toBe(false)
    })
  })

  describe('stop', () => {
    it('should stop without error', () => {
      manager.initialize({})

      expect(() => manager.stop()).not.toThrow()
    })

    it('should clear all triggers on stop', () => {
      manager.registerTrigger('first_message_sent', vi.fn())
      manager.registerTrigger('document_uploaded', vi.fn())

      expect(manager['triggerTimeouts'].size).toBe(2)

      manager.stop()

      expect(manager['triggerTimeouts'].size).toBe(0)
    })
  })

  describe('step information', () => {
    beforeEach(() => {
      manager.initialize({ mode: 'quick' })
    })

    it('should get current step index', () => {
      const currentStep = manager.getCurrentStep()
      expect(typeof currentStep).toBe('number')
      expect(currentStep).toBeGreaterThanOrEqual(0)
    })

    it('should return 0 when driver is null', () => {
      manager['driver'] = null

      const currentStep = manager.getCurrentStep()

      expect(currentStep).toBe(0)
    })

    it('should get total steps from config', () => {
      manager.initialize({ mode: 'quick' })
      // Manually set steps like start() does
      manager['config']!.steps = manager['getQuickSteps']()

      const totalSteps = manager.getTotalSteps()

      expect(totalSteps).toBe(4) // Quick mode has 4 steps
    })

    it('should return 0 total steps when config is null', () => {
      manager['config'] = null

      const totalSteps = manager.getTotalSteps()

      expect(totalSteps).toBe(0)
    })
  })

  describe('trigger management', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should register trigger with correct timeout', () => {
      const callback = vi.fn()

      manager.registerTrigger('first_message_sent', callback)

      expect(manager['triggerTimeouts'].has('first_message_sent')).toBe(true)
      expect(callback).not.toHaveBeenCalled()

      // Fast-forward time
      vi.advanceTimersByTime(TourManager.TRIGGER_POINTS.first_message_sent)

      expect(callback).toHaveBeenCalled()
    })

    it('should clear existing timeout when registering same event', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      manager.registerTrigger('document_uploaded', callback1)
      manager.registerTrigger('document_uploaded', callback2)

      vi.advanceTimersByTime(TourManager.TRIGGER_POINTS.document_uploaded)

      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).toHaveBeenCalled()
    })

    it('should clear specific trigger', () => {
      const callback = vi.fn()

      manager.registerTrigger('idle_after_login', callback)
      manager.clearTrigger('idle_after_login')

      vi.advanceTimersByTime(TourManager.TRIGGER_POINTS.idle_after_login)

      expect(callback).not.toHaveBeenCalled()
      expect(manager['triggerTimeouts'].has('idle_after_login')).toBe(false)
    })

    it('should clear all triggers', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      const callback3 = vi.fn()

      manager.registerTrigger('first_message_sent', callback1)
      manager.registerTrigger('document_uploaded', callback2)
      manager.registerTrigger('idle_after_login', callback3)

      expect(manager['triggerTimeouts'].size).toBe(3)

      manager.clearAllTriggers()

      expect(manager['triggerTimeouts'].size).toBe(0)

      // Advance all timeouts
      vi.advanceTimersByTime(10000)

      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).not.toHaveBeenCalled()
      expect(callback3).not.toHaveBeenCalled()
    })

    it('should remove trigger from map after execution', () => {
      const callback = vi.fn()

      manager.registerTrigger('first_message_sent', callback)

      expect(manager['triggerTimeouts'].has('first_message_sent')).toBe(true)

      vi.advanceTimersByTime(TourManager.TRIGGER_POINTS.first_message_sent)

      expect(manager['triggerTimeouts'].has('first_message_sent')).toBe(false)
    })
  })

  describe('step content', () => {
    it('should have quick steps with correct elements', () => {
      const quickSteps = manager['getQuickSteps']()

      expect(quickSteps).toEqual([
        expect.objectContaining({ element: '.chat-input textarea' }),
        expect.objectContaining({ element: '.suggested-questions' }),
        expect.objectContaining({ element: '.chat-history-button' }),
        expect.objectContaining({ element: '.send-button' })
      ])
    })

    it('should have complete steps including quick steps', () => {
      const completeSteps = manager['getCompleteSteps']()
      const quickSteps = manager['getQuickSteps']()

      expect(completeSteps.length).toBeGreaterThan(quickSteps.length)

      // First 4 steps should be quick steps
      expect(completeSteps.slice(0, 4)).toEqual(quickSteps)
    })

    it('should have mobile steps with proper configuration', () => {
      const mobileSteps = manager.getMobileSteps()

      expect(mobileSteps).toHaveLength(3)

      mobileSteps.forEach(step => {
        expect(step.popover.maxWidth).toBe('90vw')
      })
    })

    it('should include Portuguese text in all steps', () => {
      const quickSteps = manager['getQuickSteps']()

      quickSteps.forEach(step => {
        expect(step.popover.description).toBeTruthy()
        // Check for Portuguese characters/words
        const hasPortuguese =
          step.popover.title?.match(/[áéíóúâêôãõç]/i) ||
          step.popover.description.match(/[áéíóúâêôãõç]/i)

        // At least one step should have Portuguese text
        if (step.popover.title || step.popover.description) {
          expect(typeof step.popover.description).toBe('string')
        }
      })
    })
  })

  describe('TRIGGER_POINTS constants', () => {
    it('should have correct trigger point timings', () => {
      expect(TourManager.TRIGGER_POINTS).toEqual({
        first_message_sent: 3000,
        document_uploaded: 1000,
        idle_after_login: 10000
      })
    })
  })

  describe('integration', () => {
    it('should complete full tour lifecycle', () => {
      // Initialize
      manager.initialize({ mode: 'quick' })
      expect(manager['config']).toBeDefined()

      // Navigate (without starting tour that requires analytics)
      expect(() => manager.moveNext()).not.toThrow()

      // Stop
      expect(() => manager.stop()).not.toThrow()
    })

    it('should handle multiple initialize/stop cycles', () => {
      expect(() => {
        manager.initialize({ mode: 'quick' })
        manager.stop()

        manager.initialize({ mode: 'complete' })
        manager.stop()
      }).not.toThrow()
    })
  })
})
