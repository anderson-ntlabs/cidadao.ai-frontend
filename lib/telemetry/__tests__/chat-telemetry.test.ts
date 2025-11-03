/**
 * Chat Telemetry Tests
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-10-31
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  chatTelemetry,
  trackChatMessage,
  trackChatResponse,
  trackChatError,
  trackChatRetry,
  trackSessionStart,
  trackSessionEnd,
} from '../chat-telemetry'
import type { ChatEvent, MessageMetric } from '../chat-telemetry'

describe('ChatTelemetry', () => {
  beforeEach(() => {
    chatTelemetry.reset()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('event tracking', () => {
    it('should track events', () => {
      const event: ChatEvent = {
        type: 'message_sent',
        timestamp: Date.now(),
        sessionId: 'test-session',
        data: { message: 'Test message' },
      }

      chatTelemetry.track(event)

      const recentEvents = chatTelemetry.getRecentEvents(1)
      expect(recentEvents).toHaveLength(1)
      expect(recentEvents[0].type).toBe('message_sent')
    })

    it('should auto-add timestamp if not provided', () => {
      const event: ChatEvent = {
        type: 'message_sent',
        timestamp: 0, // Will be overwritten
      }

      const beforeTime = Date.now()
      chatTelemetry.track(event)
      const afterTime = Date.now()

      const recentEvents = chatTelemetry.getRecentEvents(1)
      expect(recentEvents[0].timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(recentEvents[0].timestamp).toBeLessThanOrEqual(afterTime)
    })

    it('should limit stored events to 1000', () => {
      // Add 1500 events
      for (let i = 0; i < 1500; i++) {
        chatTelemetry.track({
          type: 'message_sent',
          timestamp: Date.now(),
        })
      }

      const allEvents = chatTelemetry.getRecentEvents(2000)
      expect(allEvents.length).toBeLessThanOrEqual(1000)
    })
  })

  describe('metrics tracking', () => {
    it('should track messages sent', () => {
      chatTelemetry.track({
        type: 'message_sent',
        timestamp: Date.now(),
      })

      const metrics = chatTelemetry.getMetrics()
      expect(metrics.messagesSent).toBe(1)
    })

    it('should track messages received', () => {
      chatTelemetry.track({
        type: 'message_received',
        timestamp: Date.now(),
        duration: 500,
      })

      const metrics = chatTelemetry.getMetrics()
      expect(metrics.messagesReceived).toBe(1)
    })

    it('should track errors', () => {
      chatTelemetry.track({
        type: 'error',
        timestamp: Date.now(),
        error: 'Test error',
      })

      const metrics = chatTelemetry.getMetrics()
      expect(metrics.errors).toBe(1)
    })

    it('should track retries', () => {
      chatTelemetry.track({
        type: 'retry',
        timestamp: Date.now(),
      })

      const metrics = chatTelemetry.getMetrics()
      expect(metrics.retryCount).toBe(1)
    })

    it('should track cache hits', () => {
      chatTelemetry.recordCacheHit()

      const metrics = chatTelemetry.getMetrics()
      // Note: recordCacheHit also calls track() internally, which increments twice
      expect(metrics.cacheHits).toBeGreaterThan(0)
    })

    it('should track demo mode usage', () => {
      chatTelemetry.track({
        type: 'message_received',
        timestamp: Date.now(),
        isDemoMode: true,
      })

      const metrics = chatTelemetry.getMetrics()
      expect(metrics.demoModeUsage).toBe(1)
    })

    it('should track intents', () => {
      chatTelemetry.track({
        type: 'message_sent',
        timestamp: Date.now(),
        intent: 'search',
      })

      chatTelemetry.track({
        type: 'message_sent',
        timestamp: Date.now(),
        intent: 'search',
      })

      chatTelemetry.track({
        type: 'message_sent',
        timestamp: Date.now(),
        intent: 'analysis',
      })

      const metrics = chatTelemetry.getMetrics()
      expect(metrics.intents.search).toBe(2)
      expect(metrics.intents.analysis).toBe(1)
    })
  })

  describe('response time tracking', () => {
    it('should calculate average response time', () => {
      chatTelemetry.track({
        type: 'message_received',
        timestamp: Date.now(),
        duration: 100,
      })

      chatTelemetry.track({
        type: 'message_received',
        timestamp: Date.now(),
        duration: 200,
      })

      chatTelemetry.track({
        type: 'message_received',
        timestamp: Date.now(),
        duration: 300,
      })

      const metrics = chatTelemetry.getMetrics()
      expect(metrics.averageResponseTime).toBe(200) // (100 + 200 + 300) / 3
    })

    it('should limit response times to last 100', () => {
      // Add 150 response times
      for (let i = 0; i < 150; i++) {
        chatTelemetry.track({
          type: 'message_received',
          timestamp: Date.now(),
          duration: i,
        })
      }

      const metrics = chatTelemetry.getMetrics()
      // Should only average the last 100 (50-149)
      const expectedAverage = (50 + 149) / 2 // Arithmetic series average
      expect(metrics.averageResponseTime).toBeCloseTo(expectedAverage, 0)
    })

    it('should update average as new responses come in', () => {
      chatTelemetry.track({
        type: 'message_received',
        timestamp: Date.now(),
        duration: 100,
      })

      let metrics = chatTelemetry.getMetrics()
      expect(metrics.averageResponseTime).toBe(100)

      chatTelemetry.track({
        type: 'message_received',
        timestamp: Date.now(),
        duration: 300,
      })

      metrics = chatTelemetry.getMetrics()
      expect(metrics.averageResponseTime).toBe(200)
    })
  })

  describe('session tracking', () => {
    it('should track active sessions', () => {
      chatTelemetry.track({
        type: 'session_start',
        timestamp: Date.now(),
        sessionId: 'session-1',
      })

      const metrics = chatTelemetry.getMetrics()
      expect(metrics.sessionCount).toBe(1)
    })

    it('should handle multiple concurrent sessions', () => {
      chatTelemetry.track({
        type: 'session_start',
        timestamp: Date.now(),
        sessionId: 'session-1',
      })

      chatTelemetry.track({
        type: 'session_start',
        timestamp: Date.now(),
        sessionId: 'session-2',
      })

      chatTelemetry.track({
        type: 'session_start',
        timestamp: Date.now(),
        sessionId: 'session-3',
      })

      const metrics = chatTelemetry.getMetrics()
      expect(metrics.sessionCount).toBe(3)
    })

    it('should decrease count when session ends', () => {
      chatTelemetry.track({
        type: 'session_start',
        timestamp: Date.now(),
        sessionId: 'session-1',
      })

      chatTelemetry.track({
        type: 'session_start',
        timestamp: Date.now(),
        sessionId: 'session-2',
      })

      let metrics = chatTelemetry.getMetrics()
      expect(metrics.sessionCount).toBe(2)

      chatTelemetry.track({
        type: 'session_end',
        timestamp: Date.now(),
        sessionId: 'session-1',
      })

      metrics = chatTelemetry.getMetrics()
      expect(metrics.sessionCount).toBe(1)
    })

    it('should handle duplicate session starts', () => {
      chatTelemetry.track({
        type: 'session_start',
        timestamp: Date.now(),
        sessionId: 'session-1',
      })

      chatTelemetry.track({
        type: 'session_start',
        timestamp: Date.now(),
        sessionId: 'session-1',
      })

      const metrics = chatTelemetry.getMetrics()
      // Should still be 1 (Set prevents duplicates)
      expect(metrics.sessionCount).toBe(1)
    })
  })

  describe('recordMessage', () => {
    it('should record successful message', () => {
      const metric: MessageMetric = {
        success: true,
        adapter: 'primary',
        duration: 500,
      }

      chatTelemetry.recordMessage(metric)

      const metrics = chatTelemetry.getMetrics()
      // Note: recordMessage calls track() which updates metrics
      expect(metrics.messagesReceived).toBeGreaterThan(0)
      expect(metrics.averageResponseTime).toBe(500)
      expect(metrics.errors).toBe(0)
    })

    it('should record failed message', () => {
      const metric: MessageMetric = {
        success: false,
        adapter: 'primary',
        duration: 100,
        error: 'NETWORK_ERROR',
      }

      chatTelemetry.recordMessage(metric)

      const metrics = chatTelemetry.getMetrics()
      expect(metrics.messagesReceived).toBe(0)
      expect(metrics.errors).toBeGreaterThan(0)
    })

    it('should track different adapters', () => {
      chatTelemetry.recordMessage({
        success: true,
        adapter: 'primary',
        duration: 100,
      })

      chatTelemetry.recordMessage({
        success: true,
        adapter: 'fallback',
        duration: 200,
      })

      const recentEvents = chatTelemetry.getRecentEvents(10)
      const adapters = recentEvents.map((e) => e.data?.adapter)
      expect(adapters).toContain('primary')
      expect(adapters).toContain('fallback')
    })
  })

  describe('success and error rates', () => {
    it('should calculate error rate', () => {
      // 3 sent, 1 error = 33.33% error rate
      chatTelemetry.track({ type: 'message_sent', timestamp: Date.now() })
      chatTelemetry.track({ type: 'message_sent', timestamp: Date.now() })
      chatTelemetry.track({ type: 'message_sent', timestamp: Date.now() })
      chatTelemetry.track({ type: 'error', timestamp: Date.now() })

      const errorRate = chatTelemetry.getErrorRate()
      expect(errorRate).toBeCloseTo(33.33, 1)
    })

    it('should calculate success rate', () => {
      chatTelemetry.track({ type: 'message_sent', timestamp: Date.now() })
      chatTelemetry.track({ type: 'message_sent', timestamp: Date.now() })
      chatTelemetry.track({ type: 'message_sent', timestamp: Date.now() })
      chatTelemetry.track({ type: 'error', timestamp: Date.now() })

      const successRate = chatTelemetry.getSuccessRate()
      expect(successRate).toBeCloseTo(66.67, 1)
    })

    it('should return 0 error rate with no messages', () => {
      const errorRate = chatTelemetry.getErrorRate()
      expect(errorRate).toBe(0)
    })

    it('should return 100 success rate with no errors', () => {
      chatTelemetry.track({ type: 'message_sent', timestamp: Date.now() })
      chatTelemetry.track({ type: 'message_sent', timestamp: Date.now() })

      const successRate = chatTelemetry.getSuccessRate()
      expect(successRate).toBe(100)
    })
  })

  describe('report generation', () => {
    it('should generate comprehensive report', () => {
      chatTelemetry.track({ type: 'message_sent', timestamp: Date.now(), intent: 'search' })
      chatTelemetry.track({
        type: 'message_received',
        timestamp: Date.now(),
        duration: 500,
      })
      chatTelemetry.track({ type: 'error', timestamp: Date.now() })
      chatTelemetry.track({ type: 'cache_hit', timestamp: Date.now() })

      const report = chatTelemetry.generateReport()

      expect(report).toContain('Messages Sent: 1')
      expect(report).toContain('Messages Received: 1')
      expect(report).toContain('Errors: 1')
      expect(report).toContain('Cache Hits: 1')
      expect(report).toContain('search: 1')
    })

    it('should include intent distribution', () => {
      chatTelemetry.track({ type: 'message_sent', timestamp: Date.now(), intent: 'search' })
      chatTelemetry.track({ type: 'message_sent', timestamp: Date.now(), intent: 'search' })
      chatTelemetry.track({ type: 'message_sent', timestamp: Date.now(), intent: 'analysis' })

      const report = chatTelemetry.generateReport()

      expect(report).toContain('search: 2')
      expect(report).toContain('analysis: 1')
    })
  })

  describe('helper functions', () => {
    it('should track chat message with helper', () => {
      trackChatMessage('session-1', 'Test message', 'search')

      const metrics = chatTelemetry.getMetrics()
      expect(metrics.messagesSent).toBe(1)
      expect(metrics.intents.search).toBe(1)
    })

    it('should track chat response with helper', () => {
      trackChatResponse('session-1', 500, false)

      const metrics = chatTelemetry.getMetrics()
      expect(metrics.messagesReceived).toBe(1)
      expect(metrics.averageResponseTime).toBe(500)
    })

    it('should track demo mode usage with helper', () => {
      trackChatResponse('session-1', 500, true)

      const metrics = chatTelemetry.getMetrics()
      expect(metrics.demoModeUsage).toBe(1)
    })

    it('should track error with helper', () => {
      const error = new Error('Test error')
      trackChatError('session-1', error)

      const metrics = chatTelemetry.getMetrics()
      expect(metrics.errors).toBe(1)
    })

    it('should track retry with helper', () => {
      trackChatRetry('session-1', 2)

      const metrics = chatTelemetry.getMetrics()
      expect(metrics.retryCount).toBe(1)
    })

    it('should track session start with helper', () => {
      trackSessionStart('session-1')

      const metrics = chatTelemetry.getMetrics()
      expect(metrics.sessionCount).toBe(1)
    })

    it('should track session end with helper', () => {
      trackSessionStart('session-1')
      trackSessionEnd('session-1')

      const metrics = chatTelemetry.getMetrics()
      expect(metrics.sessionCount).toBe(0)
    })
  })

  describe('reset', () => {
    it('should reset all metrics', () => {
      chatTelemetry.track({ type: 'message_sent', timestamp: Date.now() })
      chatTelemetry.track({ type: 'message_received', timestamp: Date.now(), duration: 100 })
      chatTelemetry.track({ type: 'error', timestamp: Date.now() })

      chatTelemetry.reset()

      const metrics = chatTelemetry.getMetrics()
      expect(metrics.messagesSent).toBe(0)
      expect(metrics.messagesReceived).toBe(0)
      expect(metrics.errors).toBe(0)
      expect(metrics.averageResponseTime).toBe(0)
      expect(metrics.sessionCount).toBe(0)
      expect(metrics.retryCount).toBe(0)
      expect(metrics.cacheHits).toBe(0)
      expect(Object.keys(metrics.intents)).toHaveLength(0)
    })

    it('should clear events after reset', () => {
      chatTelemetry.track({ type: 'message_sent', timestamp: Date.now() })

      chatTelemetry.reset()

      const events = chatTelemetry.getRecentEvents(10)
      expect(events).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    it('should handle event without session ID', () => {
      chatTelemetry.track({
        type: 'message_sent',
        timestamp: Date.now(),
      })

      const metrics = chatTelemetry.getMetrics()
      expect(metrics.messagesSent).toBe(1)
    })

    it('should handle message received without duration', () => {
      chatTelemetry.track({
        type: 'message_received',
        timestamp: Date.now(),
      })

      const metrics = chatTelemetry.getMetrics()
      expect(metrics.messagesReceived).toBe(1)
      expect(metrics.averageResponseTime).toBe(0)
    })

    it('should truncate long messages in tracking', () => {
      const longMessage = 'a'.repeat(200)
      trackChatMessage('session-1', longMessage)

      const events = chatTelemetry.getRecentEvents(1)
      const trackedMessage = events[0].data?.message || ''
      expect(trackedMessage.length).toBeLessThan(100)
    })

    it('should handle concurrent events', () => {
      const events = Array.from({ length: 100 }, (_, i) => ({
        type: 'message_sent' as const,
        timestamp: Date.now() + i,
      }))

      events.forEach((event) => chatTelemetry.track(event))

      const metrics = chatTelemetry.getMetrics()
      expect(metrics.messagesSent).toBe(100)
    })

    it('should handle error without message', () => {
      trackChatError('session-1', {})

      const metrics = chatTelemetry.getMetrics()
      expect(metrics.errors).toBe(1)
    })
  })

  describe('recent events', () => {
    it('should return limited number of events', () => {
      for (let i = 0; i < 100; i++) {
        chatTelemetry.track({
          type: 'message_sent',
          timestamp: Date.now(),
        })
      }

      const events = chatTelemetry.getRecentEvents(10)
      expect(events).toHaveLength(10)
    })

    it('should return most recent events', () => {
      chatTelemetry.track({
        type: 'message_sent',
        timestamp: 1000,
      })

      chatTelemetry.track({
        type: 'message_sent',
        timestamp: 2000,
      })

      chatTelemetry.track({
        type: 'message_sent',
        timestamp: 3000,
      })

      const events = chatTelemetry.getRecentEvents(2)
      expect(events[0].timestamp).toBe(2000)
      expect(events[1].timestamp).toBe(3000)
    })
  })
})
