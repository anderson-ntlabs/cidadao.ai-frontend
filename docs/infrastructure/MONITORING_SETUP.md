# Monitoring & Observability Setup Guide

Complete guide for setting up comprehensive monitoring and observability for Cidadão.AI Frontend.

## Overview

The monitoring stack includes:
- **Sentry**: Error tracking and performance monitoring
- **Vercel Analytics**: Built-in analytics and Web Vitals
- **Custom Metrics**: Application-specific metrics via KV storage
- **Monitoring Dashboard**: Real-time metrics visualization

## Sentry Setup

### Step 1: Create Sentry Project

1. Go to [Sentry.io](https://sentry.io)
2. Create account or sign in
3. Click **"Create Project"**
4. Select **Next.js** as platform
5. Name: `cidadao-ai-frontend`
6. Click **"Create Project"**

### Step 2: Get DSN

After creating project:
1. Go to **Settings** → **Projects** → **cidadao-ai-frontend**
2. Go to **Client Keys (DSN)**
3. Copy the **DSN** value

### Step 3: Configure Environment Variables

Add to Vercel environment variables:

```env
# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_AUTH_TOKEN=your-auth-token (for source maps)
SENTRY_PROJECT=cidadao-ai-frontend
SENTRY_ORG=your-org-name
```

### Step 4: Initialize Sentry

Sentry is initialized automatically when DSN is configured. The configuration:

- **Environment**: Matches NODE_ENV
- **Traces Sample Rate**: 10% in production, 100% in development
- **Session Replay**: 10% of sessions, 100% of errors
- **Privacy**: All text and media masked in replays

### Step 5: Test Sentry

Create a test error:

```typescript
import { captureException } from '@/lib/monitoring/sentry.config';

try {
  throw new Error('Test error for Sentry');
} catch (error) {
  captureException(error as Error, {
    component: 'TestComponent',
    action: 'test',
  });
}
```

Check Sentry dashboard for the error.

## Vercel Analytics

### Enable Vercel Analytics

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Analytics** tab
4. Click **"Enable Analytics"**

### Web Vitals Tracking

Web Vitals are automatically tracked:
- **LCP**: Largest Contentful Paint
- **FID**: First Input Delay
- **CLS**: Cumulative Layout Shift
- **TTFB**: Time to First Byte
- **FCP**: First Contentful Paint

View in Vercel Dashboard → Analytics → Web Vitals

## Custom Metrics

### Metrics Service

The custom metrics service tracks:

- **Cache Performance**:
  - Hit rate
  - Miss rate
  - Cache size

- **API Performance**:
  - Latency (average, p95, p99)
  - Error rate
  - Request count

- **User Interactions**:
  - Page views
  - Button clicks
  - Form submissions

### Using Metrics Service

```typescript
import { metricsService } from '@/lib/monitoring/metrics.service';

// Track cache hit
metricsService.trackCacheHit('chat-responses');

// Track API latency
const startTime = Date.now();
await apiCall();
const latency = Date.now() - startTime;
metricsService.trackAPILatency('/api/chat', latency);

// Track custom metric
metricsService.trackMetric({
  name: 'feature.usage',
  value: 1,
  tags: {
    feature: 'export',
    format: 'pdf',
  },
});

// Get summary
const summary = metricsService.getSummary();
console.log('Cache hit rate:', summary.cacheHitRate);
console.log('Average latency:', summary.averageLatency);
```

### Viewing Metrics

#### API Endpoint

```bash
# Get all metrics
curl https://your-domain.vercel.app/api/metrics

# Get specific metric
curl https://your-domain.vercel.app/api/metrics?name=cache.hit
```

#### Dashboard Endpoint

```bash
# Get dashboard data
curl https://your-domain.vercel.app/api/monitoring/dashboard
```

Response includes:
- Cache statistics
- Metrics by type
- Health status
- Performance metrics

## Monitoring Dashboard

### Access Dashboard

The monitoring dashboard provides real-time insights:

```typescript
// Fetch dashboard data
const response = await fetch('/api/monitoring/dashboard');
const data = await response.json();

console.log('Health:', data.health.status);
console.log('Cache hit rate:', data.cache.multiLayer.hitRate);
console.log('Total metrics:', data.metrics.total);
```

### Dashboard Metrics

1. **Cache Performance**:
   - KV cache hits/misses
   - Multi-layer cache efficiency
   - Memory utilization

2. **Application Health**:
   - Overall status (healthy/degraded/down)
   - Uptime
   - Error rate

3. **Performance**:
   - Average latency
   - p95 latency
   - Error rate

## Alerting

### Sentry Alerts

Configure alerts in Sentry:

1. Go to **Alerts** → **Create Alert**
2. Select conditions:
   - Error count > 10 in 5 minutes
   - Issue is new
   - Issue is unresolved

3. Select actions:
   - Email notification
   - Slack notification (if configured)

### Custom Alerts (Future)

For custom metrics alerts, integrate with services like:
- **Better Uptime**: Monitor endpoints and alert on downtime
- **PagerDuty**: On-call management
- **Slack**: Real-time notifications

Example health check:

```typescript
// Check health endpoint
const health = await fetch('/api/monitoring/dashboard');
const data = await health.json();

if (data.health.status === 'down') {
  // Send alert via webhook
  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    body: JSON.stringify({
      text: `🚨 Application is DOWN! Error rate: ${data.performance.errorRate * 100}%`,
    }),
  });
}
```

## Metrics Storage

Metrics are stored in Vercel KV with automatic expiration:

- **Individual Metrics**: 24 hour TTL
- **Counters**: 24 hour TTL
- **Aggregated Data**: Calculated on demand

### Storage Optimization

To minimize costs:

1. **Sampling**: Only track 10% of traces in production
2. **TTL**: Metrics expire after 24 hours
3. **Aggregation**: Store counters instead of individual events
4. **Batching**: Batch metric sends (future improvement)

## Performance Budget

Set performance budgets to enforce standards:

### Lighthouse CI

Add to `.github/workflows/lighthouse.yml`:

```yaml
name: Lighthouse CI
on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/pt
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true
```

### Budget Configuration

Create `lighthouse-budget.json`:

```json
[
  {
    "path": "/*",
    "timings": [
      {
        "metric": "interactive",
        "budget": 3000
      },
      {
        "metric": "first-contentful-paint",
        "budget": 1500
      }
    ],
    "resourceSizes": [
      {
        "resourceType": "script",
        "budget": 300
      },
      {
        "resourceType": "total",
        "budget": 500
      }
    ]
  }
]
```

## Monitoring Best Practices

### 1. Error Tracking

```typescript
import { captureException } from '@/lib/monitoring/sentry.config';

try {
  // Risky operation
  await riskyOperation();
} catch (error) {
  // Capture with context
  captureException(error as Error, {
    component: 'MyComponent',
    user_action: 'submit_form',
    form_data: sanitizedData,
  });

  // Also track metric
  metricsService.trackError(error as Error, {
    component: 'MyComponent',
  });
}
```

### 2. Performance Tracking

```typescript
import { trackAsyncOperation } from '@/lib/monitoring/metrics.service';

// Automatically track duration and errors
const data = await trackAsyncOperation(
  async () => {
    return await fetchData();
  },
  'data.fetch',
  { source: 'api' }
);
```

### 3. User Context

```typescript
import { setUser } from '@/lib/monitoring/sentry.config';

// Set user context for Sentry
setUser({
  id: user.id,
  email: user.email,
  username: user.username,
});
```

### 4. Breadcrumbs

```typescript
import { addBreadcrumb } from '@/lib/monitoring/sentry.config';

// Add breadcrumb before risky operation
addBreadcrumb('User clicked export button', 'user.interaction', {
  format: 'pdf',
  investigation_id: investigationId,
});

try {
  await exportToPDF();
} catch (error) {
  // Error will have breadcrumb context
  captureException(error as Error);
}
```

## Monitoring Checklist

### Daily Checks

- [ ] Review Sentry errors (0 critical errors target)
- [ ] Check Vercel Analytics for traffic spikes
- [ ] Monitor cache hit rate (>60% target)
- [ ] Check API error rate (<1% target)

### Weekly Checks

- [ ] Review Web Vitals trends
- [ ] Analyze top errors in Sentry
- [ ] Review performance metrics
- [ ] Check monitoring costs

### Monthly Checks

- [ ] Performance budget review
- [ ] Update alert thresholds
- [ ] Review and archive old metrics
- [ ] Optimize monitoring costs

## Troubleshooting

### Sentry Not Capturing Errors

**Problem**: Errors not appearing in Sentry

**Solutions**:
1. Verify `NEXT_PUBLIC_SENTRY_DSN` is set
2. Check environment is 'production'
3. Verify error is not filtered by `beforeSend`
4. Check Sentry dashboard for rate limits

### High Monitoring Costs

**Problem**: Vercel KV costs too high

**Solutions**:
1. Reduce metrics TTL (24h → 12h)
2. Increase sampling rate (track less)
3. Implement metric aggregation
4. Use counters instead of individual events

### Metrics Not Updating

**Problem**: Dashboard shows stale data

**Solutions**:
1. Check `/api/metrics` endpoint is working
2. Verify KV connection
3. Check browser console for errors
4. Clear cache and refresh

## Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

## Support

For monitoring issues:
- **Sentry**: support@sentry.io
- **Vercel**: support@vercel.com
- **Project**: GitHub Issues
