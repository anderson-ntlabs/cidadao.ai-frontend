/**
 * Unified Monitoring Module
 *
 * Centralized exports for all monitoring, metrics, and observability tools.
 *
 * Usage:
 * ```ts
 * import { metricsService, captureException, trackAsyncOperation } from '@/lib/monitoring'
 * ```
 *
 * @module lib/monitoring
 */

// Sentry error tracking
export {
  getSentryConfig,
  initSentry,
  captureException,
  captureMessage,
  setUser,
  clearUser,
  addBreadcrumb,
  trackPerformance,
  trackPageLoad,
  type SentryConfig,
} from './sentry.config'

// Metrics service
export {
  metricsService,
  trackAsyncOperation,
  type Metric,
  type MetricsSummary,
} from './metrics.service'

// AI agent telemetry
export {
  startAISpan,
  trackAICall,
  withAITelemetry,
  trackTokenUsage,
  setAIAgentContext,
  type AICallMetrics,
} from './ai-telemetry'

/**
 * Monitoring Quick Reference
 *
 * | Task                    | Function/Service               | Notes                         |
 * |-------------------------|--------------------------------|-------------------------------|
 * | Track error             | captureException(error)        | Auto-reports to Sentry        |
 * | Log message             | captureMessage(msg, level)     | info/warning/error levels     |
 * | Track API latency       | metricsService.trackAPILatency()| endpoint + ms                |
 * | Track cache hit/miss    | metricsService.trackCacheHit() | Per-cache tracking            |
 * | Track page view         | metricsService.trackPageView() | Path tracking                 |
 * | Track async operation   | trackAsyncOperation()          | Auto duration + error         |
 * | Track AI call           | trackAICall(metrics)           | Agent performance             |
 * | Wrap AI operation       | withAITelemetry(fn)            | Auto metrics collection       |
 * | Track token usage       | trackTokenUsage()              | LLM token metrics             |
 * | Set agent context       | setAIAgentContext()            | Sets Sentry tags              |
 * | Get metrics summary     | metricsService.getSummary()    | Aggregate stats               |
 *
 * Environment Variables:
 * - NEXT_PUBLIC_SENTRY_DSN: Sentry DSN (enables error tracking)
 * - NODE_ENV: production enables metric sending
 */
