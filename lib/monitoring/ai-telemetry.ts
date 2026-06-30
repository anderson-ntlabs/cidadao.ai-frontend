/**
 * AI Telemetry Integration
 *
 * Custom instrumentation for monitoring LLM calls (Maritaca, Backend API).
 * Captures spans for AI operations including token usage, latency, and costs.
 *
 * Since we don't use Vercel AI SDK, this provides manual instrumentation
 * that works with our custom chat adapters.
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-08
 */

import * as Sentry from '@sentry/nextjs'

export interface AICallMetrics {
  model: string
  provider: 'maritaca' | 'backend' | 'unknown'
  operation: 'chat' | 'stream' | 'completion'
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
  latencyMs: number
  success: boolean
  error?: string
  agentId?: string
  sessionId?: string
}

/**
 * Start an AI operation span
 */
export function startAISpan(
  operation: string,
  attributes: {
    model?: string
    provider?: string
    agentId?: string
    prompt?: string
  }
) {
  return Sentry.startSpan(
    {
      name: `ai.${operation}`,
      op: 'ai.chat',
      attributes: {
        'ai.model': attributes.model || 'unknown',
        'ai.provider': attributes.provider || 'unknown',
        'ai.agent_id': attributes.agentId,
        // Don't log full prompts in production for privacy
        'ai.prompt_length': attributes.prompt?.length || 0,
      },
    },
    (span) => span
  )
}

/**
 * Track an AI call with metrics
 */
export function trackAICall(metrics: AICallMetrics): void {
  // Add breadcrumb for the AI call
  Sentry.addBreadcrumb({
    category: 'ai',
    message: `${metrics.provider}/${metrics.model} - ${metrics.operation}`,
    level: metrics.success ? 'info' : 'error',
    data: {
      model: metrics.model,
      provider: metrics.provider,
      operation: metrics.operation,
      latencyMs: metrics.latencyMs,
      inputTokens: metrics.inputTokens,
      outputTokens: metrics.outputTokens,
      totalTokens: metrics.totalTokens,
      success: metrics.success,
      agentId: metrics.agentId,
    },
  })

  // Set measurements for performance monitoring
  if (metrics.latencyMs) {
    Sentry.setMeasurement('ai.latency', metrics.latencyMs, 'millisecond')
  }
  if (metrics.totalTokens) {
    Sentry.setMeasurement('ai.tokens.total', metrics.totalTokens, 'none')
  }
  if (metrics.inputTokens) {
    Sentry.setMeasurement('ai.tokens.input', metrics.inputTokens, 'none')
  }
  if (metrics.outputTokens) {
    Sentry.setMeasurement('ai.tokens.output', metrics.outputTokens, 'none')
  }

  // Capture error if failed
  if (!metrics.success && metrics.error) {
    Sentry.captureMessage(`AI call failed: ${metrics.error}`, {
      level: 'error',
      tags: {
        'ai.model': metrics.model,
        'ai.provider': metrics.provider,
        'ai.operation': metrics.operation,
      },
      extra: {
        model: metrics.model,
        provider: metrics.provider,
        operation: metrics.operation,
        latencyMs: metrics.latencyMs,
        success: metrics.success,
        error: metrics.error,
        agentId: metrics.agentId,
        sessionId: metrics.sessionId,
      },
    })
  }
}

/**
 * Wrapper to instrument an async AI function
 */
export async function withAITelemetry<T>(
  operation: string,
  attributes: {
    model?: string
    provider?: string
    agentId?: string
    sessionId?: string
  },
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now()

  return Sentry.startSpan(
    {
      name: `ai.${operation}`,
      op: 'ai.chat',
      attributes: {
        'ai.model': attributes.model || 'unknown',
        'ai.provider': attributes.provider || 'unknown',
        'ai.agent_id': attributes.agentId,
        'ai.session_id': attributes.sessionId,
      },
    },
    async (span) => {
      try {
        const result = await fn()
        const latencyMs = Date.now() - startTime

        // Track successful call
        trackAICall({
          model: attributes.model || 'unknown',
          provider: (attributes.provider as 'maritaca' | 'backend') || 'unknown',
          operation: operation as 'chat' | 'stream' | 'completion',
          latencyMs,
          success: true,
          agentId: attributes.agentId,
          sessionId: attributes.sessionId,
        })

        span?.setStatus({ code: 1 }) // OK
        return result
      } catch (error) {
        const latencyMs = Date.now() - startTime
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        // Track failed call
        trackAICall({
          model: attributes.model || 'unknown',
          provider: (attributes.provider as 'maritaca' | 'backend') || 'unknown',
          operation: operation as 'chat' | 'stream' | 'completion',
          latencyMs,
          success: false,
          error: errorMessage,
          agentId: attributes.agentId,
          sessionId: attributes.sessionId,
        })

        span?.setStatus({ code: 2, message: errorMessage }) // ERROR
        throw error
      }
    }
  )
}

/**
 * Track token usage for cost estimation
 */
export function trackTokenUsage(
  provider: 'maritaca' | 'backend',
  model: string,
  inputTokens: number,
  outputTokens: number
): void {
  const totalTokens = inputTokens + outputTokens

  // Official Maritaca pricing in BRL per 1M tokens (https://www.maritaca.ai/en/pricing)
  const costs: Record<string, { input: number; output: number }> = {
    'sabia-4': { input: 5.0, output: 20.0 },
    'sabiazinho-4': { input: 1.0, output: 4.0 },
  }

  // Unknown models fall back to the most expensive listed model (conservative estimate)
  const modelCost = costs[model] || { input: 5.0, output: 20.0 }
  const estimatedCost =
    (inputTokens * modelCost.input + outputTokens * modelCost.output) / 1_000_000

  Sentry.setContext('ai_usage', {
    provider,
    model,
    inputTokens,
    outputTokens,
    totalTokens,
    estimatedCostBRL: estimatedCost.toFixed(6),
  })

  // Set measurements
  Sentry.setMeasurement('ai.cost.estimated', estimatedCost, 'none')
}

/**
 * Set AI agent context for the current session
 */
export function setAIAgentContext(agentId: string, agentName: string, sessionId?: string): void {
  Sentry.setContext('ai_agent', {
    agentId,
    agentName,
    sessionId,
  })

  Sentry.setTag('ai.agent', agentId)
  if (sessionId) {
    Sentry.setTag('ai.session', sessionId)
  }
}
