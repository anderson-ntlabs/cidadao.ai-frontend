/**
 * Cost metrics and monitoring for chat API usage
 * Tracks model usage and provides cost estimates
 */

export interface ChatMetric {
  timestamp: number;
  model_used: string;
  tokens_used?: number;
  response_time: number;
  from_cache: boolean;
  success: boolean;
  error?: string;
  endpoint?: string;
  message_length?: number;
}

export interface CostReport {
  totalRequests: number;
  cachedRequests: number;
  modelUsage: Record<string, number>;
  totalTokens: number;
  estimatedCost: number;
  avgResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
  costSavings: number;
  periodStart: Date;
  periodEnd: Date;
}

export class CostMetricsService {
  private metrics: ChatMetric[] = [];
  private readonly maxMetrics = 10000;
  
  // Cost per 1000 tokens (in USD)
  private readonly modelCosts = {
    'sabiazinho-3': 0.0002,  // $0.20 per million tokens
    'sabia-3': 0.0006,       // $0.60 per million tokens
    'mixed': 0.0004,         // Average
    'fallback': 0,           // Local fallback
  };
  
  // Average tokens per message (estimated)
  private readonly avgTokensPerMessage = {
    request: 50,
    response: 200,
  };

  /**
   * Record a metric
   */
  record(metric: Partial<ChatMetric>): void {
    const fullMetric: ChatMetric = {
      timestamp: Date.now(),
      model_used: metric.model_used || 'unknown',
      tokens_used: metric.tokens_used || this.estimateTokens(metric.message_length),
      response_time: metric.response_time || 0,
      from_cache: metric.from_cache || false,
      success: metric.success !== false,
      error: metric.error,
      endpoint: metric.endpoint,
      message_length: metric.message_length,
    };
    
    this.metrics.push(fullMetric);
    
    // Limit array size
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
    
    // Log significant events
    if (!fullMetric.success) {
      console.warn('[CostMetrics] Request failed:', fullMetric.error);
    }
    
    if (fullMetric.from_cache) {
      console.log('[CostMetrics] Cache hit - saved API call');
    }
  }

  /**
   * Get cost report for a time period
   */
  getReport(hours: number = 24): CostReport {
    const now = Date.now();
    const periodStart = now - (hours * 60 * 60 * 1000);
    
    // Filter metrics for the period
    const periodMetrics = this.metrics.filter(m => m.timestamp >= periodStart);
    
    if (periodMetrics.length === 0) {
      return this.createEmptyReport(new Date(periodStart), new Date(now));
    }
    
    // Calculate statistics
    const totalRequests = periodMetrics.length;
    const cachedRequests = periodMetrics.filter(m => m.from_cache).length;
    const successfulRequests = periodMetrics.filter(m => m.success).length;
    
    // Model usage
    const modelUsage: Record<string, number> = {};
    let totalTokens = 0;
    let totalResponseTime = 0;
    
    periodMetrics.forEach(metric => {
      const model = metric.model_used;
      modelUsage[model] = (modelUsage[model] || 0) + 1;
      totalTokens += metric.tokens_used || 0;
      totalResponseTime += metric.response_time;
    });
    
    // Calculate costs
    const estimatedCost = this.calculateTotalCost(periodMetrics);
    const costSavings = this.calculateSavings(cachedRequests, modelUsage);
    
    return {
      totalRequests,
      cachedRequests,
      modelUsage,
      totalTokens,
      estimatedCost,
      avgResponseTime: totalRequests > 0 ? totalResponseTime / totalRequests : 0,
      errorRate: totalRequests > 0 ? ((totalRequests - successfulRequests) / totalRequests) * 100 : 0,
      cacheHitRate: totalRequests > 0 ? (cachedRequests / totalRequests) * 100 : 0,
      costSavings,
      periodStart: new Date(periodStart),
      periodEnd: new Date(now),
    };
  }

  /**
   * Get real-time metrics
   */
  getRealTimeMetrics() {
    const last5Minutes = Date.now() - (5 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp >= last5Minutes);
    
    const byModel: Record<string, number> = {};
    const byEndpoint: Record<string, number> = {};
    let totalCost = 0;
    
    recentMetrics.forEach(metric => {
      byModel[metric.model_used] = (byModel[metric.model_used] || 0) + 1;
      if (metric.endpoint) {
        byEndpoint[metric.endpoint] = (byEndpoint[metric.endpoint] || 0) + 1;
      }
      totalCost += this.calculateMetricCost(metric);
    });
    
    return {
      requestsLast5Min: recentMetrics.length,
      costLast5Min: totalCost,
      requestsPerMinute: recentMetrics.length / 5,
      modelDistribution: byModel,
      endpointDistribution: byEndpoint,
      cacheHitRate: this.calculateRecentCacheHitRate(recentMetrics),
    };
  }

  /**
   * Get cost breakdown by model
   */
  getCostBreakdown(hours: number = 24): Record<string, number> {
    const report = this.getReport(hours);
    const breakdown: Record<string, number> = {};
    
    Object.entries(report.modelUsage).forEach(([model, count]) => {
      const avgTokensPerRequest = this.avgTokensPerMessage.request + this.avgTokensPerMessage.response;
      const totalTokens = count * avgTokensPerRequest;
      const cost = (totalTokens / 1000) * (this.modelCosts[model as keyof typeof this.modelCosts] || 0);
      breakdown[model] = cost;
    });
    
    return breakdown;
  }

  /**
   * Estimate tokens from message length
   */
  private estimateTokens(messageLength?: number): number {
    if (!messageLength) {
      return this.avgTokensPerMessage.request + this.avgTokensPerMessage.response;
    }
    
    // Rough estimate: 1 token ≈ 4 characters
    const estimatedRequestTokens = Math.ceil(messageLength / 4);
    const estimatedResponseTokens = this.avgTokensPerMessage.response;
    
    return estimatedRequestTokens + estimatedResponseTokens;
  }

  /**
   * Calculate total cost for metrics
   */
  private calculateTotalCost(metrics: ChatMetric[]): number {
    return metrics.reduce((total, metric) => {
      return total + this.calculateMetricCost(metric);
    }, 0);
  }

  /**
   * Calculate cost for a single metric
   */
  private calculateMetricCost(metric: ChatMetric): number {
    if (metric.from_cache) return 0;
    
    const model = metric.model_used;
    const costPerThousand = this.modelCosts[model as keyof typeof this.modelCosts] || 0;
    const tokens = metric.tokens_used || this.estimateTokens();
    
    return (tokens / 1000) * costPerThousand;
  }

  /**
   * Calculate cost savings from cache
   */
  private calculateSavings(cachedRequests: number, modelUsage: Record<string, number>): number {
    if (cachedRequests === 0) return 0;
    
    // Calculate average cost per request based on model distribution
    let totalCost = 0;
    let totalRequests = 0;
    
    Object.entries(modelUsage).forEach(([model, count]) => {
      const costPerRequest = this.calculateMetricCost({
        timestamp: 0,
        model_used: model,
        response_time: 0,
        from_cache: false,
        success: true,
      });
      totalCost += costPerRequest * count;
      totalRequests += count;
    });
    
    const avgCostPerRequest = totalRequests > 0 ? totalCost / totalRequests : 0;
    
    // Savings = cached requests * average cost per request
    return cachedRequests * avgCostPerRequest;
  }

  /**
   * Calculate recent cache hit rate
   */
  private calculateRecentCacheHitRate(metrics: ChatMetric[]): number {
    if (metrics.length === 0) return 0;
    const cached = metrics.filter(m => m.from_cache).length;
    return (cached / metrics.length) * 100;
  }

  /**
   * Create empty report
   */
  private createEmptyReport(periodStart: Date, periodEnd: Date): CostReport {
    return {
      totalRequests: 0,
      cachedRequests: 0,
      modelUsage: {},
      totalTokens: 0,
      estimatedCost: 0,
      avgResponseTime: 0,
      errorRate: 0,
      cacheHitRate: 0,
      costSavings: 0,
      periodStart,
      periodEnd,
    };
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    const report = this.getReport(24);
    const breakdown = this.getCostBreakdown(24);
    
    return JSON.stringify({
      report,
      breakdown,
      metrics: this.metrics.slice(-100), // Last 100 for detail
    }, null, 2);
  }
}

// Singleton instance
export const costMetrics = new CostMetricsService();