# Vercel KV Setup Guide

---

**Documento**: Guia de Configuração do Vercel KV
**Projeto**: Cidadão.AI - Frontend
**Autor**: Anderson Henrique da Silva
**Data**: 2025-10-04 12:57:34 -03 (Horário de Brasília)
**Localização**: Minas Gerais, Brasil
**Categoria**: Infrastructure Guide / Database
**Última Atualização**: 2025-10-04

---

This document provides step-by-step instructions for setting up Vercel KV (Redis) for distributed caching.

## Overview

Vercel KV is a durable Redis-compatible database designed for the Edge. It provides:

- **Global replication**: Data replicated across Vercel's edge network
- **Low latency**: Single-digit millisecond read times
- **Scalability**: Auto-scaling based on demand
- **Reliability**: Automatic failover and backup
- **Cost-effective**: Pay for what you use

## Prerequisites

- Vercel account with a project deployed
- Access to Vercel dashboard
- Project using Next.js 13+ with App Router

## Step 1: Create Vercel KV Database

### Via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Storage** tab
4. Click **Create Database**
5. Select **KV** (Redis)
6. Choose a name (e.g., `cidadao-ai-cache`)
7. Select a region close to your users:
   - `us-east-1` for Americas
   - `fra1` for Europe
   - `sin1` for Asia Pacific
8. Click **Create**

### Via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Create KV database
vercel kv create cidadao-ai-cache
```

## Step 2: Link KV to Your Project

### Automatic Linking (Recommended)

1. In Vercel Dashboard, go to **Storage** > **KV**
2. Click on your database
3. Go to **Settings** tab
4. Under **Connected Projects**, click **Connect Project**
5. Select your project
6. Environment variables are automatically added

### Manual Linking

Add these environment variables to your project:

```env
# Vercel KV Connection URLs
KV_REST_API_URL=https://your-database.kv.vercel-storage.com
KV_REST_API_TOKEN=your-token-here
KV_REST_API_READ_ONLY_TOKEN=your-readonly-token-here

# Optional: Custom configuration
KV_URL=redis://default:your-token@your-database.kv.vercel-storage.com
```

## Step 3: Install Dependencies

The `@vercel/kv` package is already included in package.json:

```bash
npm install @vercel/kv
```

## Step 4: Environment Variables

### Local Development (.env.local)

For local development, you can use a local Redis instance or Vercel KV:

```env
# Option 1: Use Vercel KV (requires credentials)
KV_REST_API_URL=https://your-database.kv.vercel-storage.com
KV_REST_API_TOKEN=your-token-here

# Option 2: Use local Redis (for testing)
# KV_REST_API_URL=http://localhost:6379
# KV_REST_API_TOKEN=local-dev-token
```

### Production (Vercel Dashboard)

1. Go to **Settings** > **Environment Variables**
2. Verify these are set (automatically added when linking):
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

## Step 5: Verify Setup

### Test Connection

Create a test endpoint to verify KV connection:

```typescript
// app/api/test-kv/route.ts
import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test write
    await kv.set('test-key', 'test-value', { ex: 60 })

    // Test read
    const value = await kv.get('test-key')

    // Test delete
    await kv.del('test-key')

    return NextResponse.json({
      status: 'success',
      value,
      message: 'KV connection working',
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
```

### Run Test

```bash
# Local development
npm run dev

# Visit http://localhost:3000/api/test-kv
curl http://localhost:3000/api/test-kv

# Expected response:
# {"status":"success","value":"test-value","message":"KV connection working"}
```

## Step 6: Monitor Usage

### Vercel Dashboard

1. Go to **Storage** > **KV**
2. Select your database
3. View metrics:
   - **Requests**: Total requests per day
   - **Storage**: Total data stored
   - **Bandwidth**: Data transfer

### Code-Based Monitoring

```typescript
import { kvCache } from '@/lib/cache/kv-cache.service'

// Get cache statistics
const stats = kvCache.getStats()
console.log('Cache hit rate:', stats.hitRate)
```

## Usage Examples

### Basic Operations

```typescript
import { kv } from '@vercel/kv'

// Set value with TTL (seconds)
await kv.set('user:123', userData, { ex: 3600 })

// Get value
const user = await kv.get('user:123')

// Delete value
await kv.del('user:123')

// Check if exists
const exists = await kv.exists('user:123')

// Increment counter
const count = await kv.incr('page:views')

// Set TTL on existing key
await kv.expire('user:123', 7200)
```

### Using KV Cache Service

```typescript
import { kvCache, TTL_STRATEGIES } from '@/lib/cache/kv-cache.service'

// Cache chat response
await kvCache.set('chat:message-hash', responseData, TTL_STRATEGIES.SHORT)

// Get cached response
const cached = await kvCache.get('chat:message-hash')

// Rate limiting
import { checkRateLimit } from '@/lib/cache/kv-cache.service'

const result = await checkRateLimit('user-ip', 60, 60)
if (!result.allowed) {
  return new Response('Rate limit exceeded', { status: 429 })
}
```

### Multi-Layer Cache

```typescript
import { multiLayerCache } from '@/lib/cache/multi-layer-cache.service'

// Set in both memory and KV
await multiLayerCache.set('key', value)

// Get (checks memory first, then KV)
const value = await multiLayerCache.get('key')

// Get statistics
const stats = multiLayerCache.getStats()
console.log('Memory hit rate:', stats.memoryHitRate)
console.log('Overall hit rate:', stats.hitRate)
```

## Cost Optimization

### Pricing (as of 2024)

- **Free Tier**:
  - 30,000 commands/day
  - 256MB storage
  - Good for development and small projects

- **Pro Tier** (starts at $1/month):
  - 100,000 commands/day
  - 512MB storage
  - Additional usage billed per command

### Best Practices

1. **Use appropriate TTLs**:

   ```typescript
   // Frequently changing data: 1-5 minutes
   await kv.set('live-data', data, { ex: 300 })

   // Stable data: 1-24 hours
   await kv.set('user-profile', profile, { ex: 86400 })
   ```

2. **Implement cache prefixes**:

   ```typescript
   const CHAT_PREFIX = 'chat:'
   const USER_PREFIX = 'user:'

   await kv.set(`${CHAT_PREFIX}${id}`, data)
   ```

3. **Use multi-layer caching**:
   - Memory for hot data (free, fast)
   - KV for distributed persistence

4. **Monitor usage**:

   ```typescript
   // Track cache hit rates
   const stats = kvCache.getStats()
   if (stats.hitRate < 0.6) {
     console.warn('Low cache hit rate, review TTL strategies')
   }
   ```

5. **Batch operations**:
   ```typescript
   // Use mget instead of multiple get calls
   const values = await kv.mget('key1', 'key2', 'key3')
   ```

## Troubleshooting

### Connection Errors

**Error**: `Error: KV_REST_API_URL is not defined`

**Solution**:

1. Verify environment variables are set
2. Restart development server
3. Check Vercel dashboard for correct values

**Error**: `Error: Unauthorized`

**Solution**:

1. Verify `KV_REST_API_TOKEN` is correct
2. Check token hasn't expired
3. Regenerate token in Vercel dashboard

### Performance Issues

**Problem**: High latency

**Solutions**:

1. Check KV database region matches your Edge Functions
2. Use multi-layer cache for frequently accessed data
3. Implement proper TTL strategies
4. Monitor cache hit rates

**Problem**: High costs

**Solutions**:

1. Review TTL strategies (longer TTLs = fewer writes)
2. Implement memory cache layer
3. Use batch operations
4. Monitor usage in Vercel dashboard

## Security

### Best Practices

1. **Never commit tokens**:

   ```bash
   # .gitignore
   .env.local
   .env*.local
   ```

2. **Use read-only tokens** for read-heavy operations:

   ```typescript
   import { createClient } from '@vercel/kv'

   const readOnlyKv = createClient({
     url: process.env.KV_REST_API_URL!,
     token: process.env.KV_REST_API_READ_ONLY_TOKEN!,
   })
   ```

3. **Sanitize cache keys**:

   ```typescript
   function sanitizeKey(key: string): string {
     return key.replace(/[^a-zA-Z0-9:-]/g, '_')
   }
   ```

4. **Implement rate limiting** to prevent abuse

## Next Steps

1. ✅ Setup complete - KV is ready to use
2. 📊 Monitor cache hit rates and optimize TTLs
3. 🚀 Deploy to production and verify edge performance
4. 💰 Monitor costs and adjust strategies

## Resources

- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Redis Commands Reference](https://redis.io/commands/)
- [Pricing Calculator](https://vercel.com/pricing/storage)
- [Best Practices Guide](https://vercel.com/docs/storage/vercel-kv/kv-best-practices)
