/**
 * Metrics API Endpoint
 *
 * Receives and processes application metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { kvCache } from '@/lib/cache/kv-cache.service'

export const runtime = 'edge'

interface Metric {
  name: string
  value: number
  tags?: Record<string, string>
  timestamp?: number
}

/**
 * POST /api/metrics
 *
 * Receive and store metrics
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<{ success: boolean; metric: string } | { error: string }>> {
  try {
    const metric = (await request.json()) as Metric

    // Validate metric
    if (!metric.name || typeof metric.value !== 'number') {
      return NextResponse.json({ error: 'Invalid metric format' }, { status: 400 })
    }

    // Add timestamp if not provided
    if (!metric.timestamp) {
      metric.timestamp = Date.now()
    }

    // Store metric in KV (expire after 24 hours)
    const key = `metrics:${metric.name}:${metric.timestamp}`
    await kvCache.set(key, metric, 86400) // 24 hours TTL

    // Increment counter for this metric type
    const counterKey = `metrics:counter:${metric.name}`
    await kvCache.increment(counterKey, 86400)

    return NextResponse.json({ success: true, metric: metric.name }, { status: 200 })
  } catch (error) {
    console.error('[Metrics API] Error:', error)

    return NextResponse.json({ error: 'Failed to process metric' }, { status: 500 })
  }
}

/**
 * GET /api/metrics
 *
 * Retrieve metrics summary
 */
export async function GET(
  request: NextRequest
): Promise<
  NextResponse<
    | { metric: string; count: number }
    | { metrics: Record<string, number>; total: number }
    | { error: string }
  >
> {
  try {
    const { searchParams } = new URL(request.url)
    const metricName = searchParams.get('name')

    if (metricName) {
      // Get specific metric counter
      const counterKey = `metrics:counter:${metricName}`
      const count = await kvCache.get<number>(counterKey)

      return NextResponse.json({
        metric: metricName,
        count: count || 0,
      })
    }

    // Get all metric counters
    const keys = await kvCache.keys('metrics:counter:*')
    const counters: Record<string, number> = {}

    for (const key of keys) {
      const metricName = key.replace('metrics:counter:', '')
      const count = await kvCache.get<number>(key)
      if (count !== null) {
        counters[metricName] = count
      }
    }

    return NextResponse.json({
      metrics: counters,
      total: Object.values(counters).reduce((a, b) => a + b, 0),
    })
  } catch (error) {
    console.error('[Metrics API] Error:', error)

    return NextResponse.json({ error: 'Failed to retrieve metrics' }, { status: 500 })
  }
}
