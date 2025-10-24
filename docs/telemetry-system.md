# Telemetry System - Performance & Usage Tracking

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data de Criação**: 2025-01-25 14:00:00 -0300
**Última Atualização**: 2025-01-25

---

## Overview

The Cidadão.AI telemetry system provides comprehensive tracking of application performance, user interactions, and cost metrics. The system is designed for **privacy-first** data collection with no PII (Personally Identifiable Information) collection.

### Key Features

- ✅ Chat performance monitoring (response times, errors, retries)
- ✅ Cost metrics tracking (API usage, model costs, cache savings)
- ✅ Web Vitals monitoring (LCP, FID, CLS, TTFB)
- ✅ Intent classification tracking
- ✅ Cache hit rate analysis
- ✅ Privacy-compliant (no PII)

---

## Architecture

### Component Structure

```
lib/telemetry/
├── chat-telemetry.ts          # Chat-specific telemetry
├── cost-metrics.ts             # Cost tracking and analysis
└── cost-metrics.test.ts        # Unit tests

app/api/web-vitals/
└── route.ts                    # Web Vitals endpoint
```

### Data Flow

```
User Action → Telemetry Event → In-Memory Buffer → API Endpoint → Analytics Service
                                        ↓
                                   Local Console (dev)
```

---

## Chat Telemetry

### Implementation

**File**: `lib/telemetry/chat-telemetry.ts`

```typescript
import { chatTelemetry } from '@/lib/telemetry/chat-telemetry'

// Track message sent
chatTelemetry.track({
  type: 'message_sent',
  sessionId: 'session_123',
  intent: 'investigate',
  isDemoMode: false,
})

// Track message received with response time
chatTelemetry.track({
  type: 'message_received',
  sessionId: 'session_123',
  duration: 1250, // milliseconds
  isDemoMode: false,
})

// Track error
chatTelemetry.track({
  type: 'error',
  sessionId: 'session_123',
  error: new Error('Backend timeout'),
})
```

### Event Types

```typescript
type ChatEventType =
  | 'message_sent'      // User sends message
  | 'message_received'  // Response received from backend
  | 'error'             // Request failed
  | 'retry'             // Automatic retry triggered
  | 'session_start'     // New chat session created
  | 'session_end'       // Chat session closed
```

### Metrics Tracked

| Metric | Description | Calculation |
|--------|-------------|-------------|
| `messagesSent` | Total messages sent by users | Counter |
| `messagesReceived` | Total responses received | Counter |
| `errors` | Failed requests count | Counter |
| `averageResponseTime` | Mean response time (ms) | Rolling average (last 100) |
| `sessionCount` | Unique chat sessions | Set cardinality |
| `retryCount` | Automatic retries triggered | Counter |
| `demoModeUsage` | Requests in demo mode | Counter |
| `intents` | Intent distribution | Map<intent, count> |

### Intent Classification Tracking

```typescript
// Automatically tracked from chat requests
chatTelemetry.track({
  type: 'message_sent',
  intent: 'investigate', // investigate, analyze, report, conversation, etc.
})

// Get intent distribution
const metrics = chatTelemetry.getMetrics()
console.log(metrics.intents)
// Output: { investigate: 45, analyze: 23, conversation: 12 }
```

### Memory Management

- **Event Buffer**: Last 1000 events kept in memory
- **Response Times**: Last 100 response times for average calculation
- **Automatic Pruning**: Older events automatically discarded
- **No Persistent Storage**: All data in-memory (resets on reload)

---

## Cost Metrics

### Implementation

**File**: `lib/telemetry/cost-metrics.ts`

```typescript
import { costMetricsService } from '@/lib/telemetry/cost-metrics'

// Record a chat request
costMetricsService.record({
  model_used: 'sabiazinho-3',
  tokens_used: 250,
  response_time: 1500,
  from_cache: false,
  success: true,
  endpoint: '/api/v1/chat/message',
  message_length: 120,
})

// Get cost report for last 24 hours
const report = costMetricsService.getReport(24)
console.log(`Total cost: $${report.estimatedCost.toFixed(4)}`)
console.log(`Cache savings: $${report.costSavings.toFixed(4)}`)
console.log(`Cache hit rate: ${(report.cacheHitRate * 100).toFixed(1)}%`)
```

### Model Pricing

| Model | Cost per 1M tokens | Use Case |
|-------|-------------------|----------|
| `sabiazinho-3` | $0.20 | Fast responses, economic mode |
| `sabia-3` | $0.60 | Complex analysis, quality mode |
| `mixed` | $0.40 (avg) | Automatic selection |
| `fallback` | $0.00 | Local offline fallback |

### Cost Report

```typescript
interface CostReport {
  totalRequests: number        // Total API calls
  cachedRequests: number       // Requests served from cache
  modelUsage: {                // Distribution by model
    'sabiazinho-3': number,
    'sabia-3': number,
  }
  totalTokens: number          // Total tokens consumed
  estimatedCost: number        // Total cost in USD
  avgResponseTime: number      // Average latency (ms)
  errorRate: number            // Percentage of failed requests
  cacheHitRate: number         // Cache effectiveness (0-1)
  costSavings: number          // Savings from cache (USD)
  periodStart: Date            // Report period start
  periodEnd: Date              // Report period end
}
```

### Cost Optimization Insights

The cost metrics service automatically calculates:

1. **Cache ROI**: How much money caching saves
   ```typescript
   costSavings = cachedRequests × avgCostPerRequest
   ```

2. **Model Efficiency**: Compare cost vs quality
   ```typescript
   costPerSuccessfulRequest = totalCost / successfulRequests
   ```

3. **Error Impact**: Cost of failed requests
   ```typescript
   wastedCost = failedRequests × avgCostPerRequest
   ```

### Token Estimation

When token count unavailable, service estimates based on message length:

```typescript
avgTokensPerMessage = {
  request: 50,   // ~40-60 tokens per user message
  response: 200, // ~150-250 tokens per AI response
}

estimatedTokens = messageLength × 0.4 // Rough approximation
```

---

## Web Vitals Tracking

### Core Web Vitals

The platform tracks Google's Core Web Vitals for performance monitoring:

| Metric | Description | Good Threshold |
|--------|-------------|----------------|
| **LCP** | Largest Contentful Paint | < 2.5s |
| **FID** | First Input Delay | < 100ms |
| **CLS** | Cumulative Layout Shift | < 0.1 |
| **TTFB** | Time to First Byte | < 800ms |

### Implementation

**File**: `app/api/web-vitals/route.ts`

```typescript
// Automatically called from Next.js built-in Web Vitals reporting
export function reportWebVitals(metric: NextWebVitalsMetric) {
  const body = {
    name: metric.name,        // 'LCP', 'FID', 'CLS', etc.
    value: metric.value,      // Numeric value
    rating: metric.rating,    // 'good', 'needs-improvement', 'poor'
    delta: metric.delta,      // Change from previous measurement
    url: window.location.href,
  }

  // Send to API
  fetch('/api/web-vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
```

### Analytics Integration

**Development**:
- Logs to browser console
- No external service calls

**Production**:
- Can send to Google Analytics 4 (if `NEXT_PUBLIC_GA_ID` set)
- Can send to Vercel Analytics
- Can send to custom backend endpoint

**Example GA4 Integration**:

```typescript
if (process.env.NEXT_PUBLIC_GA_ID) {
  const ga4Event = {
    client_id: 'web-vitals',
    events: [{
      name: 'web_vitals',
      params: {
        metric_name: body.name,
        metric_value: body.value,
        metric_rating: body.rating,
        metric_delta: body.delta,
        page_url: body.url,
      }
    }]
  }

  await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${GA_ID}`, {
    method: 'POST',
    body: JSON.stringify(ga4Event)
  })
}
```

---

## Privacy & Compliance

### Data Collection Policy

**What We Track**:
- ✅ Performance metrics (response times, error rates)
- ✅ Usage patterns (feature usage, intent distribution)
- ✅ Technical data (model used, cache hit rate)
- ✅ Web Vitals (LCP, FID, CLS, TTFB)

**What We DON'T Track**:
- ❌ User messages content
- ❌ Personal information (name, email, IP)
- ❌ Authentication tokens
- ❌ Sensitive investigation data
- ❌ Location data

### LGPD Compliance

**Lei Geral de Proteção de Dados (Brazilian Privacy Law)**:

- ✅ No PII collection
- ✅ Anonymous session IDs only
- ✅ No cross-device tracking
- ✅ Data minimization principle
- ✅ Transparent data usage
- ✅ No data sharing with third parties

### Data Retention

| Data Type | Retention | Storage |
|-----------|-----------|---------|
| Chat telemetry | Session only | In-memory |
| Cost metrics | Session only | In-memory |
| Web Vitals | 90 days | Analytics service |
| Error logs | 30 days | Sentry |

**Note**: All telemetry data is **ephemeral** (lost on page reload). Production systems may implement persistent storage with appropriate retention policies.

---

## Testing

### Manual Testing

**Script**: `scripts/test-telemetry.js`

```bash
node scripts/test-telemetry.js
```

**Tests**:
1. Event tracking works
2. Metrics update correctly
3. Cost calculations accurate
4. Web Vitals endpoint responds
5. No PII leakage

### Unit Tests

**File**: `lib/telemetry/cost-metrics.test.ts`

```bash
npm test lib/telemetry/cost-metrics.test.ts
```

**Coverage**:
- Cost estimation accuracy
- Cache savings calculation
- Model usage distribution
- Error rate calculation
- Report generation

---

## Usage Examples

### Track Complete Chat Flow

```typescript
import { chatTelemetry } from '@/lib/telemetry/chat-telemetry'
import { costMetricsService } from '@/lib/telemetry/cost-metrics'

async function sendChatMessage(message: string) {
  const sessionId = getCurrentSessionId()
  const startTime = Date.now()

  // Track message sent
  chatTelemetry.track({
    type: 'message_sent',
    sessionId,
    intent: detectIntent(message),
  })

  try {
    // Send to backend
    const response = await chatAPI.send(message)
    const duration = Date.now() - startTime

    // Track success
    chatTelemetry.track({
      type: 'message_received',
      sessionId,
      duration,
      isDemoMode: response.isDemo,
    })

    // Track cost
    costMetricsService.record({
      model_used: response.model,
      tokens_used: response.tokens,
      response_time: duration,
      from_cache: response.fromCache,
      success: true,
      message_length: message.length,
    })

    return response
  } catch (error) {
    // Track error
    chatTelemetry.track({
      type: 'error',
      sessionId,
      error,
    })

    costMetricsService.record({
      success: false,
      error: error.message,
    })

    throw error
  }
}
```

### Generate Daily Cost Report

```typescript
import { costMetricsService } from '@/lib/telemetry/cost-metrics'

function generateDailyCostReport() {
  const report = costMetricsService.getReport(24) // Last 24 hours

  console.log('=== Daily Cost Report ===')
  console.log(`Period: ${report.periodStart} - ${report.periodEnd}`)
  console.log(`Total Requests: ${report.totalRequests}`)
  console.log(`Cached Requests: ${report.cachedRequests}`)
  console.log(`Cache Hit Rate: ${(report.cacheHitRate * 100).toFixed(1)}%`)
  console.log()
  console.log('Model Usage:')
  Object.entries(report.modelUsage).forEach(([model, count]) => {
    console.log(`  ${model}: ${count} requests`)
  })
  console.log()
  console.log(`Total Tokens: ${report.totalTokens.toLocaleString()}`)
  console.log(`Estimated Cost: $${report.estimatedCost.toFixed(4)}`)
  console.log(`Cost Savings (cache): $${report.costSavings.toFixed(4)}`)
  console.log(`Average Response Time: ${report.avgResponseTime.toFixed(0)}ms`)
  console.log(`Error Rate: ${(report.errorRate * 100).toFixed(2)}%`)
  console.log('========================')
}
```

### Monitor Performance in Real-Time

```typescript
import { chatTelemetry } from '@/lib/telemetry/chat-telemetry'

// Get current metrics
const metrics = chatTelemetry.getMetrics()

if (metrics.averageResponseTime > 3000) {
  console.warn('⚠️  High latency detected:', metrics.averageResponseTime, 'ms')
}

if (metrics.errors / metrics.messagesSent > 0.05) {
  console.error('🔴 Error rate above 5%:',
    (metrics.errors / metrics.messagesSent * 100).toFixed(1), '%')
}

if (metrics.retryCount > 10) {
  console.warn('⚠️  High retry count:', metrics.retryCount)
}
```

---

## Integration with Monitoring

### Sentry Integration

Telemetry errors are automatically sent to Sentry:

```typescript
import * as Sentry from '@sentry/nextjs'

chatTelemetry.track({
  type: 'error',
  error: error,
})

// Also send to Sentry for alerting
Sentry.captureException(error, {
  tags: {
    feature: 'chat',
    sessionId: sessionId,
  },
  extra: {
    metrics: chatTelemetry.getMetrics(),
  },
})
```

### Grafana Dashboard (Future)

Planned integration with Grafana for visualization:

- Real-time response time graphs
- Cost trends over time
- Model usage distribution
- Cache effectiveness charts
- Error rate monitoring

---

## Configuration

### Environment Variables

```bash
# Optional: Google Analytics 4 Measurement ID
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Optional: Custom analytics endpoint
NEXT_PUBLIC_ANALYTICS_URL=https://analytics.example.com/collect
```

### Telemetry Toggle (Future)

Planned: Allow users to opt-out of telemetry:

```typescript
// User settings
const telemetryEnabled = getUserPreference('telemetry_enabled')

if (telemetryEnabled) {
  chatTelemetry.track({ /* ... */ })
}
```

---

## Troubleshooting

### Telemetry Not Working

**Symptoms**: No metrics appearing in logs

**Checks**:
1. Verify imports are correct
2. Check browser console for errors
3. Ensure `process.env.NODE_ENV` is set
4. Verify Web Vitals endpoint is accessible

**Debug**:
```typescript
// Enable verbose logging
chatTelemetry.track({
  type: 'message_sent',
  sessionId: 'debug',
})

console.log('Current metrics:', chatTelemetry.getMetrics())
```

### Cost Estimates Incorrect

**Symptoms**: Cost report shows unexpected values

**Checks**:
1. Verify model pricing in `cost-metrics.ts`
2. Check token estimation logic
3. Ensure `from_cache` flag set correctly
4. Review `success` flag on failed requests

**Debug**:
```typescript
const report = costMetricsService.getReport(24)
console.log('Raw metrics:', costMetricsService.getMetrics())
console.log('Report:', report)
```

### Web Vitals Not Sending

**Symptoms**: No Web Vitals in analytics

**Checks**:
1. Verify `/api/web-vitals` endpoint exists
2. Check network tab for POST requests
3. Ensure GA_ID is set (if using GA4)
4. Check CSP allows analytics domain

---

## Roadmap

### Phase 1 (Current)
- ✅ Chat telemetry tracking
- ✅ Cost metrics calculation
- ✅ Web Vitals endpoint
- ✅ In-memory storage

### Phase 2 (Next Sprint)
- 🚧 Persistent storage (database)
- 🚧 Real-time dashboard
- 🚧 User opt-out mechanism
- 🚧 Advanced cost analysis

### Phase 3 (Future)
- 🚧 Grafana integration
- 🚧 Automated alerts
- 🚧 Predictive cost modeling
- 🚧 A/B testing framework

---

## Related Documentation

- [Architecture Guide](./guides/ARCHITECTURE.md)
- [Chat System](./technical/integration/FRONTEND_CHAT_INTEGRATION.md)
- [Sentry Setup](./infrastructure/SENTRY_SETUP_COMPLETE.md)
- [Web Vitals Optimization](./optimization/OPTIMIZATION-REPORT.md)

---

**Maintained by**: Frontend Team
**Last Review**: 2025-01-25
**Next Review**: 2025-04-25 (Quarterly)
