/**
 * Monitoring Dashboard API
 *
 * Provides monitoring data for admin dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { kvCache } from '@/lib/cache/kv-cache.service';
import { multiLayerCache } from '@/lib/cache/multi-layer-cache.service';

export const runtime = 'edge';

interface DashboardData {
  cache: {
    kv: any;
    multiLayer: any;
  };
  metrics: {
    total: number;
    byType: Record<string, number>;
  };
  health: {
    status: 'healthy' | 'degraded' | 'down';
    uptime: number;
    timestamp: string;
  };
  performance: {
    averageLatency: number;
    p95Latency: number;
    errorRate: number;
  };
}

/**
 * GET /api/monitoring/dashboard
 *
 * Get monitoring dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    // Get cache statistics
    const kvStats = kvCache.getStats();
    const multiLayerStats = multiLayerCache.getStats();

    // Get metrics counters
    const metricKeys = await kvCache.keys('metrics:counter:*');
    const metricsByType: Record<string, number> = {};
    let totalMetrics = 0;

    for (const key of metricKeys) {
      const metricName = key.replace('metrics:counter:', '');
      const count = await kvCache.get<number>(key);
      if (count !== null) {
        metricsByType[metricName] = count;
        totalMetrics += count;
      }
    }

    // Calculate performance metrics
    const apiLatencies = metricsByType['api.latency'] || 0;
    const apiErrors = metricsByType['api.error'] || 0;
    const errorRate = apiLatencies > 0 ? apiErrors / apiLatencies : 0;

    // Health status
    const isHealthy = kvStats.hitRate > 0.5 && errorRate < 0.1;
    const status = isHealthy ? 'healthy' : errorRate > 0.3 ? 'down' : 'degraded';

    const dashboardData: DashboardData = {
      cache: {
        kv: kvStats,
        multiLayer: multiLayerStats,
      },
      metrics: {
        total: totalMetrics,
        byType: metricsByType,
      },
      health: {
        status,
        uptime: process.uptime ? process.uptime() : 0,
        timestamp: new Date().toISOString(),
      },
      performance: {
        averageLatency: 0, // Would need to calculate from stored metrics
        p95Latency: 0,
        errorRate,
      },
    };

    return NextResponse.json(dashboardData, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[Monitoring Dashboard] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/monitoring/dashboard/reset
 *
 * Reset metrics (for testing)
 */
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'reset-metrics') {
      // Clear all metrics
      const keys = await kvCache.keys('metrics:*');
      for (const key of keys) {
        await kvCache.delete(key);
      }

      // Reset cache stats
      kvCache.resetStats();

      return NextResponse.json({
        success: true,
        message: 'Metrics reset successfully',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Monitoring Dashboard] Error:', error);

    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}
