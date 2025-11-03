/**
 * Chat Telemetry System
 * Sprint 1 - Épico 1.4
 *
 * Tracks chat performance, errors, and usage patterns
 */

export interface ChatMetrics {
  messagesSent: number
  messagesReceived: number
  errors: number
  averageResponseTime: number
  sessionCount: number
  retryCount: number
  demoModeUsage: number
  cacheHits: number
  intents: Record<string, number>
}

export interface ChatEvent {
  type:
    | 'message_sent'
    | 'message_received'
    | 'error'
    | 'retry'
    | 'session_start'
    | 'session_end'
    | 'cache_hit'
  timestamp: number
  sessionId?: string
  data?: any
  error?: any
  duration?: number
  intent?: string
  isDemoMode?: boolean
}

export interface MessageMetric {
  success: boolean
  adapter: string
  duration: number
  error?: string
}

class ChatTelemetry {
  private events: ChatEvent[] = []
  private metrics: ChatMetrics = {
    messagesSent: 0,
    messagesReceived: 0,
    errors: 0,
    averageResponseTime: 0,
    sessionCount: 0,
    retryCount: 0,
    demoModeUsage: 0,
    cacheHits: 0,
    intents: {},
  }
  private responseTimes: number[] = []
  private activeSessions = new Set<string>()

  /**
   * Track a chat event
   */
  track(event: ChatEvent): void {
    this.events.push({
      ...event,
      timestamp: event.timestamp || Date.now(),
    })

    this.updateMetrics(event)
    this.logEvent(event)

    // Keep only last 1000 events in memory
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000)
    }
  }

  /**
   * Record cache hit
   */
  recordCacheHit(): void {
    this.metrics.cacheHits++
    this.track({
      type: 'cache_hit',
      timestamp: Date.now(),
    })
  }

  /**
   * Record message metric
   */
  recordMessage(metric: MessageMetric): void {
    if (metric.success) {
      this.metrics.messagesReceived++
      this.responseTimes.push(metric.duration)

      // Keep only last 100 response times
      if (this.responseTimes.length > 100) {
        this.responseTimes.shift()
      }

      this.metrics.averageResponseTime =
        this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
    } else {
      this.metrics.errors++
    }

    this.track({
      type: metric.success ? 'message_received' : 'error',
      timestamp: Date.now(),
      duration: metric.duration,
      data: { adapter: metric.adapter },
      error: metric.error,
    })
  }

  /**
   * Update metrics based on event
   */
  private updateMetrics(event: ChatEvent): void {
    switch (event.type) {
      case 'message_sent':
        this.metrics.messagesSent++
        if (event.intent) {
          this.metrics.intents[event.intent] = (this.metrics.intents[event.intent] || 0) + 1
        }
        break

      case 'message_received':
        this.metrics.messagesReceived++
        if (event.duration) {
          this.responseTimes.push(event.duration)
          // Keep only last 100 response times
          if (this.responseTimes.length > 100) {
            this.responseTimes.shift()
          }
          this.metrics.averageResponseTime =
            this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
        }
        if (event.isDemoMode) {
          this.metrics.demoModeUsage++
        }
        break

      case 'error':
        this.metrics.errors++
        break

      case 'retry':
        this.metrics.retryCount++
        break

      case 'cache_hit':
        this.metrics.cacheHits++
        break

      case 'session_start':
        if (event.sessionId) {
          this.activeSessions.add(event.sessionId)
          this.metrics.sessionCount = this.activeSessions.size
        }
        break

      case 'session_end':
        if (event.sessionId) {
          this.activeSessions.delete(event.sessionId)
          this.metrics.sessionCount = this.activeSessions.size
        }
        break
    }
  }

  /**
   * Log event to console in development
   */
  private logEvent(event: ChatEvent): void {
    if (process.env.NODE_ENV === 'development') {
      const emoji = {
        message_sent: '📤',
        message_received: '📥',
        error: '❌',
        retry: '🔄',
        session_start: '🚀',
        session_end: '🏁',
        cache_hit: '💾',
      }[event.type]

      console.log(
        `${emoji} [Chat Telemetry] ${event.type}`,
        event.data || '',
        event.duration ? `(${event.duration}ms)` : ''
      )
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): ChatMetrics {
    return { ...this.metrics }
  }

  /**
   * Get recent events
   */
  getRecentEvents(limit: number = 50): ChatEvent[] {
    return this.events.slice(-limit)
  }

  /**
   * Get error rate
   */
  getErrorRate(): number {
    const total = this.metrics.messagesSent
    return total > 0 ? (this.metrics.errors / total) * 100 : 0
  }

  /**
   * Get success rate
   */
  getSuccessRate(): number {
    return 100 - this.getErrorRate()
  }

  /**
   * Generate telemetry report
   */
  generateReport(): string {
    const metrics = this.getMetrics()
    const errorRate = this.getErrorRate()
    const successRate = this.getSuccessRate()

    return `
📊 Chat Telemetry Report
========================
📤 Messages Sent: ${metrics.messagesSent}
📥 Messages Received: ${metrics.messagesReceived}
❌ Errors: ${metrics.errors} (${errorRate.toFixed(2)}%)
✅ Success Rate: ${successRate.toFixed(2)}%
⏱️ Avg Response Time: ${metrics.averageResponseTime.toFixed(0)}ms
🔄 Retries: ${metrics.retryCount}
👥 Active Sessions: ${metrics.sessionCount}
🎭 Demo Mode Usage: ${metrics.demoModeUsage}
💾 Cache Hits: ${metrics.cacheHits}

🎯 Intent Distribution:
${Object.entries(metrics.intents)
  .sort(([, a], [, b]) => b - a)
  .map(([intent, count]) => `  - ${intent}: ${count}`)
  .join('\n')}
`
  }

  /**
   * Reset telemetry data
   */
  reset(): void {
    this.events = []
    this.responseTimes = []
    this.activeSessions.clear()
    this.metrics = {
      messagesSent: 0,
      messagesReceived: 0,
      errors: 0,
      averageResponseTime: 0,
      sessionCount: 0,
      retryCount: 0,
      demoModeUsage: 0,
      cacheHits: 0,
      intents: {},
    }
  }
}

// Singleton instance
export const chatTelemetry = new ChatTelemetry()

// Helper functions for easy tracking
export function trackChatMessage(sessionId: string, message: string, intent?: string): void {
  chatTelemetry.track({
    type: 'message_sent',
    timestamp: Date.now(),
    sessionId,
    data: { message: message.substring(0, 50) + '...' },
    intent,
  })
}

export function trackChatResponse(
  sessionId: string,
  duration: number,
  isDemoMode: boolean = false
): void {
  chatTelemetry.track({
    type: 'message_received',
    timestamp: Date.now(),
    sessionId,
    duration,
    isDemoMode,
  })
}

export function trackChatError(sessionId: string, error: any): void {
  chatTelemetry.track({
    type: 'error',
    timestamp: Date.now(),
    sessionId,
    error: error.message || 'Unknown error',
    data: { status: error.response?.status },
  })
}

export function trackChatRetry(sessionId: string, attempt: number): void {
  chatTelemetry.track({
    type: 'retry',
    timestamp: Date.now(),
    sessionId,
    data: { attempt },
  })
}

export function trackSessionStart(sessionId: string): void {
  chatTelemetry.track({
    type: 'session_start',
    timestamp: Date.now(),
    sessionId,
  })
}

export function trackSessionEnd(sessionId: string): void {
  chatTelemetry.track({
    type: 'session_end',
    timestamp: Date.now(),
    sessionId,
  })
}
