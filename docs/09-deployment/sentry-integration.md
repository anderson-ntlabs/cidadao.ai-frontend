# Sentry Integration - Error Tracking & Performance Monitoring

Complete documentation for Sentry error tracking and performance monitoring in Cidadão.AI Frontend.

## Overview

Sentry is fully integrated into the application for production error tracking, performance monitoring, and user experience insights. Version: `@sentry/nextjs@10.17.0`

**Status**: ✅ **Production Ready**

## Architecture

### Integration Points

```
Application Layers
├── Logger Service (lib/utils/logger.ts)
│   ├── Automatically sends errors to Sentry in production
│   ├── Sends warnings as Sentry messages
│   └── Creates performance breadcrumbs
│
├── Error Boundaries (components/error-boundary.tsx)
│   ├── Catches React component errors
│   ├── Logs via logger.error() → Sentry
│   └── Provides user-friendly fallback UI
│
├── Sentry Configuration (lib/monitoring/sentry.config.ts)
│   ├── Centralized Sentry initialization
│   ├── Event filtering and sanitization
│   ├── User context management
│   └── Performance tracking utilities
│
├── Client-Side Init (components/sentry-init.tsx)
│   ├── Client component for Sentry initialization
│   └── Loaded in root layouts (PT/EN)
│
└── Next.js Integration (@sentry/nextjs)
    ├── Automatic source map upload
    ├── Release tracking
    └── Server-side error capture
```

### Data Flow

```
Error Occurs
    ↓
Error Boundary / Logger
    ↓
Environment Check (production only)
    ↓
Sentry SDK
    ↓
Event Filtering (beforeSend)
    ↓
Context Enrichment (user, breadcrumbs)
    ↓
Sentry Cloud (sentry.io)
```

## Configuration

### Environment Variables

**Required for Production**:

```bash
# .env.local (production only)
NEXT_PUBLIC_SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/your-project-id
```

**Optional** (defaults shown):

```bash
# Environment (auto-detected)
NODE_ENV=production

# Sample rates (configured in code)
SENTRY_TRACES_SAMPLE_RATE=0.1        # 10% of transactions
SENTRY_REPLAYS_SESSION_RATE=0.1       # 10% of sessions
SENTRY_REPLAYS_ON_ERROR_RATE=1.0      # 100% when errors occur
```

### Sentry Configuration

**File**: `lib/monitoring/sentry.config.ts`

```typescript
export interface SentryConfig {
  dsn?: string // Sentry project DSN
  environment: string // 'development' | 'production'
  enabled: boolean // Auto: true if DSN + production
  tracesSampleRate: number // Performance sampling (0.1 = 10%)
  replaysSessionSampleRate: number // Session replay sampling
  replaysOnErrorSampleRate: number // Error replay sampling (1.0 = 100%)
}
```

**Key Settings**:

- **Production Only**: Sentry is disabled in development to avoid noise
- **Error Filtering**: Network errors and cancelled requests are ignored
- **Privacy**: Console breadcrumbs are excluded (may contain sensitive data)
- **Performance**: 10% transaction sampling to control costs

## Usage Patterns

### 1. Logger Service (Recommended)

**File**: `lib/utils/logger.ts`

The logger service automatically integrates with Sentry in production:

```typescript
import { logger } from '@/lib/utils/logger'

// Error logging (sent to Sentry in production)
try {
  await riskyOperation()
} catch (error) {
  logger.error(error, {
    context: 'UserService',
    userId: user.id,
    operation: 'updateProfile',
  })
}

// Warning logging (sent to Sentry in production)
logger.warn('API rate limit approaching', {
  context: 'ChatService',
  remainingRequests: 10,
})

// Info/Debug (development only, not sent to Sentry)
logger.info('User logged in', { userId: user.id })
logger.debug('Cache hit', { key: cacheKey })

// Performance tracking
logger.performance('database-query', 150, {
  query: 'fetchInvestigations',
  results: 42,
})
```

**Benefits**:

- ✅ Automatic Sentry integration (no manual Sentry imports)
- ✅ Environment-aware (dev logs to console, prod to Sentry)
- ✅ Consistent logging interface
- ✅ Structured context data

### 2. Error Boundaries

**File**: `components/error-boundary.tsx`

Error Boundaries automatically log to Sentry via the logger:

```typescript
// Usage in pages
<ErrorBoundary
  onError={(error, errorInfo) => {
    logger.error('Chat page error:', { error, errorInfo })
    toast.error('Erro no Chat', 'Ocorreu um erro inesperado.')
  }}
>
  <ChatPage />
</ErrorBoundary>
```

**Current Integration** (as of commit d1f2b52):

- ✅ `/pt/app/chat/page.tsx` - Chat interface
- ✅ `/pt/app/dashboard/page.tsx` - Investigations dashboard

**Error Flow**:

1. React component throws error
2. Error Boundary catches it
3. `onError` callback fires
4. `logger.error()` sends to Sentry (production)
5. User sees fallback UI with retry option

### 3. Direct Sentry API (Advanced)

**File**: `lib/monitoring/sentry.config.ts`

For advanced cases requiring direct Sentry control:

```typescript
import { captureException, captureMessage, setUser } from '@/lib/monitoring/sentry.config'

// Capture exception with context
captureException(new Error('Payment failed'), {
  userId: user.id,
  amount: 99.9,
  paymentMethod: 'credit_card',
})

// Capture message
captureMessage('Unusual activity detected', 'warning', {
  ipAddress: req.ip,
  attempts: 5,
})

// Set user context (for all subsequent events)
setUser({
  id: user.id,
  email: user.email,
  username: user.name,
})

// Clear user context (on logout)
clearUser()

// Add breadcrumb
addBreadcrumb('User clicked checkout', 'user-action', {
  cartValue: 250.0,
  itemCount: 3,
})
```

## Features

### Error Tracking

**Automatic Capture**:

- ✅ Unhandled promise rejections
- ✅ React component errors (via Error Boundaries)
- ✅ Server-side errors (Next.js API routes, SSR)
- ✅ Client-side errors (via logger service)

**Error Filtering**:

- ❌ Network errors (user offline)
- ❌ Cancelled requests (AbortError)
- ❌ Console breadcrumbs (privacy)
- ❌ Development environment errors

**Context Enrichment**:

- User information (ID, email, username)
- Breadcrumbs (navigation, API calls, user actions)
- Custom context (operation, component, state)
- Stack traces with source maps

### Performance Monitoring

**Metrics Captured**:

- Page load times
- API response times
- Component render performance
- Database query durations

**Sampling**: 10% of transactions (configurable)

**Usage**:

```typescript
// Via logger service
logger.performance('chat-send-message', 850, {
  messageLength: 150,
  agentId: 'zumbi',
})

// Via Sentry config
trackPageLoad('/pt/app/chat')
trackPerformance('pdf-export', 'export', () => {
  // Export logic
})
```

### Session Replay

**Configuration**:

- 10% of normal sessions
- 100% of sessions with errors

**Privacy**:

- Automatically masks sensitive inputs (password, credit card)
- Excludes console breadcrumbs
- GDPR compliant

## Integration Status

### ✅ Fully Integrated

| Component        | Status    | File                                     | Integration Method   |
| ---------------- | --------- | ---------------------------------------- | -------------------- |
| Logger Service   | ✅ Active | `lib/utils/logger.ts`                    | Automatic            |
| Error Boundaries | ✅ Active | `components/error-boundary.tsx`          | Via logger           |
| Chat Page        | ✅ Active | `app/pt/app/chat/page.tsx`               | Error Boundary       |
| Dashboard        | ✅ Active | `app/pt/app/dashboard/page.tsx`          | Error Boundary       |
| Root Layouts     | ✅ Active | `app/pt/layout.tsx`, `app/en/layout.tsx` | SentryInit component |

### ⏳ Pending Integration

Recommended additions (optional):

| Component                    | Priority | Benefit                         |
| ---------------------------- | -------- | ------------------------------- |
| `/pt/app/investigacoes/[id]` | Medium   | Track investigation view errors |
| `/pt/app/perfil`             | Low      | Track profile update errors     |
| `/pt/app/configuracoes`      | Low      | Track settings errors           |
| API routes                   | Medium   | Server-side error tracking      |

## Sentry Dashboard

### Key Metrics to Monitor

**Error Tracking**:

- Error rate (errors per session)
- Most common errors
- Affected users
- Error trends over time

**Performance**:

- Average page load time
- Slowest transactions
- API endpoint performance
- Database query performance

**User Experience**:

- Session replays (errors)
- User feedback (breadcrumbs)
- Affected user count
- Geographic distribution

### Alerts (Recommended Setup)

Configure in Sentry dashboard:

1. **High Error Rate**: >5% error rate in 5 minutes
2. **New Error**: First occurrence of error
3. **Regression**: Previously resolved error reappears
4. **Performance Degradation**: P95 response time >3s
5. **User Impact**: >100 users affected

## Testing

### Manual Testing

**Development** (Sentry disabled):

```bash
# Test logger (console output only)
npm run dev
# Trigger error in UI
# Check browser console for logs
```

**Production** (Sentry enabled):

```bash
# Set DSN
export NEXT_PUBLIC_SENTRY_DSN="your-dsn"

# Build and run
npm run build
npm run start

# Trigger error
# Check Sentry dashboard for event
```

### Test Script

**File**: `scripts/testing/test-sentry.js`

```bash
node scripts/testing/test-sentry.js
```

**What it tests**:

- Sentry configuration
- Environment detection
- Error capture
- Message capture
- User context
- Breadcrumbs

## Best Practices

### ✅ DO

1. **Use Logger Service**: Prefer `logger.error()` over direct Sentry calls

   ```typescript
   logger.error(error, { context: 'ServiceName' })
   ```

2. **Add Context**: Always include relevant context

   ```typescript
   logger.error(error, {
     context: 'ChatService',
     userId: user.id,
     agentId: 'zumbi',
     operation: 'sendMessage',
   })
   ```

3. **Set User Context**: On login/logout

   ```typescript
   setUser({ id: user.id, email: user.email })
   clearUser() // on logout
   ```

4. **Filter Sensitive Data**: Never log passwords, tokens, API keys

   ```typescript
   logger.error(error, {
     email: user.email,
     // ❌ password: user.password
   })
   ```

5. **Use Error Boundaries**: Wrap critical UI sections
   ```typescript
   <ErrorBoundary onError={(error, info) => logger.error(...)}>
     <CriticalComponent />
   </ErrorBoundary>
   ```

### ❌ DON'T

1. **Don't Log in Development**: Sentry is auto-disabled, use logger
2. **Don't Log PII**: No credit cards, CPF, sensitive personal data
3. **Don't Over-Sample**: Keep traces at 10% to control costs
4. **Don't Capture Everything**: Filter network errors, cancellations
5. **Don't Forget Source Maps**: Ensure they're uploaded in build

## Troubleshooting

### Issue 1: Events Not Appearing in Sentry

**Symptoms**: Errors logged but not visible in Sentry dashboard

**Checklist**:

1. ✅ `NEXT_PUBLIC_SENTRY_DSN` is set correctly
2. ✅ Environment is `production` (not `development`)
3. ✅ Error is not filtered by `beforeSend`
4. ✅ Sentry project is active
5. ✅ Network allows connection to sentry.io

**Debug**:

```typescript
// Check config
import { getSentryConfig } from '@/lib/monitoring/sentry.config'
console.log(getSentryConfig())
// Should show enabled: true in production
```

### Issue 2: Too Many Events

**Symptoms**: Sentry quota exceeded, high costs

**Solutions**:

1. Reduce `tracesSampleRate` (currently 0.1 = 10%)
2. Add more filters to `beforeSend`
3. Implement rate limiting per error type
4. Upgrade Sentry plan

**Example Filter**:

```typescript
beforeSend(event, hint) {
  // Ignore specific errors
  if (event.exception?.values?.[0]?.type === 'ChunkLoadError') {
    return null // Don't send to Sentry
  }
  return event
}
```

### Issue 3: Missing Source Maps

**Symptoms**: Stack traces show minified code

**Solution**: Verify build process uploads source maps

```bash
# Check build output
npm run build
# Should see: "Uploading source maps to Sentry..."

# Manual upload (if needed)
npx @sentry/cli sourcemaps upload --org your-org --project your-project .next
```

### Issue 4: User Context Not Set

**Symptoms**: Events show "Anonymous User"

**Solution**: Set user context on login

```typescript
// In login callback
import { setUser } from '@/lib/monitoring/sentry.config'

await signIn()
setUser({
  id: user.id,
  email: user.email,
  username: user.name,
})
```

## Cost Optimization

### Current Configuration (Optimized)

- **Traces Sample Rate**: 10% (0.1)
- **Session Replays**: 10% normal sessions
- **Error Replays**: 100% (critical for debugging)
- **Event Filtering**: Network errors, cancellations excluded

### Estimated Monthly Usage

Based on 10,000 MAU (Monthly Active Users):

| Metric          | Volume                           | Cost Impact        |
| --------------- | -------------------------------- | ------------------ |
| Errors          | ~500-1,000/month                 | Low                |
| Transactions    | ~10,000/month                    | Low (10% sampling) |
| Session Replays | ~1,000/month                     | Low (10% sampling) |
| **Total**       | Within free tier or minimal cost | ✅ Optimized       |

### Further Optimization (If Needed)

If costs become a concern:

1. **Reduce Traces**: 0.1 → 0.05 (5% sampling)
2. **Sample by Route**: Only track critical pages
3. **Conditional Replays**: Only on specific errors
4. **Environment-Based**: Different rates for staging vs production

## Security & Privacy

### Data Protection

**Automatic Sanitization**:

- ✅ Passwords masked in form inputs
- ✅ Credit card numbers masked
- ✅ Console logs excluded from breadcrumbs
- ✅ Environment variables filtered

**Manual Sanitization**:

```typescript
// Remove sensitive data before logging
const sanitizedError = {
  ...error,
  apiKey: '[REDACTED]',
  token: '[REDACTED]',
}
logger.error(sanitizedError, context)
```

### LGPD Compliance

**User Rights**:

- Data deletion: Use `clearUser()` on account deletion
- Data access: Export events via Sentry API
- Consent: Only enabled in production with user consent

**Configuration**:

```typescript
// Respect user privacy preferences
if (userConsent.analytics) {
  setUser({ id: user.id })
} else {
  clearUser()
}
```

## Performance Impact

### Bundle Size

- **Client Bundle**: 116 kB (Sentry) + 28 kB (internal) = 144 kB
- **Impact**: ~5% of total bundle (acceptable for features provided)
- **Loading**: Lazy-loaded, non-blocking

### Runtime Performance

- **Initialization**: <10ms
- **Error Capture**: <1ms (async)
- **Breadcrumb**: <0.1ms
- **User Impact**: Negligible

## Migration & Versioning

### Current Version

- **Package**: `@sentry/nextjs@10.17.0`
- **SDK**: Sentry v8 (latest)
- **Next.js**: 15.5.6 (fully compatible)

### Breaking Changes (v7 → v8)

✅ **Already Handled**:

- `startTransaction()` deprecated → Using `addBreadcrumb()` for tracking
- Session Replay integration moved to `@sentry/browser`
- TypeScript types updated

### Upgrade Path

When upgrading Sentry:

```bash
# Check for updates
npm outdated @sentry/nextjs

# Upgrade
npm install @sentry/nextjs@latest

# Test
npm run build
npm run test
```

## Resources

### Official Documentation

- [Sentry Next.js SDK](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Error Boundaries](https://docs.sentry.io/platforms/javascript/guides/react/features/error-boundary/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)

### Internal Documentation

- [Logger Service](../06-development/logger-service.md)
- [Error Handling Strategy](../06-development/error-handling.md)
- [Bundle Analysis](../11-performance/bundle-analysis-2025-11-22.md)

### Support

- **Sentry Support**: support@sentry.io
- **Community**: https://discord.gg/sentry
- **Status**: https://status.sentry.io

---

**Last Updated**: 2025-11-22
**Sentry Version**: @sentry/nextjs@10.17.0
**Integration Status**: ✅ Production Ready
**Maintenance**: Active, regularly updated
