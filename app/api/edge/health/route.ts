/**
 * Edge Health Check API
 *
 * Ultra-fast health check endpoint using Edge Runtime
 * with Vercel KV caching for backend status
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-11-11
 */

import { NextResponse } from 'next/server'
import { getOrSet } from '@/lib/cache/kv-cache'

// Use Edge Runtime for instant response
export const runtime = 'edge'

// Cache for 30 seconds
const CACHE_TTL = 30

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down'
  timestamp: string
  services: {
    frontend: boolean
    backend: boolean
    database: boolean
  }
}

async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2000) // 2s timeout

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/health`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Cidadao.AI-Frontend/Health-Check' },
    })

    clearTimeout(timeout)
    return response.ok
  } catch {
    return false
  }
}

export async function GET(): Promise<
  NextResponse<HealthStatus | { status: string; timestamp: string; error: string }>
> {
  try {
    // Use KV cache to reduce backend health check frequency
    const backendStatus = await getOrSet('health:backend', checkBackendHealth, { ttl: CACHE_TTL })

    const health: HealthStatus = {
      status: backendStatus ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        frontend: true, // Always true if this endpoint responds
        backend: backendStatus,
        database: backendStatus, // Assume DB is up if backend is up
      },
    }

    return NextResponse.json(health, {
      status: health.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    })
  } catch {
    return NextResponse.json(
      {
        status: 'down',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 500 }
    )
  }
}
