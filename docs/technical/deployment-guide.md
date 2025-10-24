# Deployment Guide

**Author**: Anderson Henrique da Silva
**Location**: Minas Gerais, Brasil
**Created**: 2025-01-25
**Last Updated**: 2025-01-25

---

## Table of Contents

1. [Overview](#overview)
2. [Vercel Deployment](#vercel-deployment)
3. [Environment Variables](#environment-variables)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Build Configuration](#build-configuration)
6. [Security Headers](#security-headers)
7. [Performance Optimization](#performance-optimization)
8. [Monitoring & Error Tracking](#monitoring--error-tracking)
9. [Deployment Checklist](#deployment-checklist)
10. [Troubleshooting](#troubleshooting)
11. [Rollback Procedures](#rollback-procedures)

---

## Overview

Cidadão.AI frontend is deployed on **Vercel** with automated CI/CD via GitHub Actions. This guide covers the complete deployment process from development to production.

### Deployment Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    Git Repository (GitHub)                  │
│              https://github.com/user/repo                   │
└────────────────────────┬───────────────────────────────────┘
                         │
                         │ push to main/develop
                         ▼
┌────────────────────────────────────────────────────────────┐
│                  GitHub Actions CI/CD                       │
│                                                             │
│  1. Code Quality (ESLint)                                   │
│  2. Build (Next.js production build)                        │
│  3. Tests (Vitest + coverage)                               │
│  4. E2E Tests (Playwright)                                  │
│  5. Lighthouse CI (performance budgets)                     │
└────────────────────────┬───────────────────────────────────┘
                         │
                         │ on success
                         ▼
┌────────────────────────────────────────────────────────────┐
│                    Vercel Deployment                        │
│                                                             │
│  1. Install dependencies (npm ci)                           │
│  2. Build application (npm run build)                       │
│  3. Deploy to serverless (auto-scaling)                     │
│  4. Generate preview URL (PRs)                              │
│  5. Promote to production (main branch)                     │
└────────────────────────┬───────────────────────────────────┘
                         │
                         │ deployed
                         ▼
┌────────────────────────────────────────────────────────────┐
│                Production Environment                       │
│      https://cidadao-ai-frontend.vercel.app                 │
│                                                             │
│  • CDN edge caching (global)                                │
│  • Automatic HTTPS (SSL)                                    │
│  • Security headers (CSP, HSTS, etc.)                       │
│  • Analytics (Web Vitals)                                   │
│  • Error tracking (Sentry)                                  │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

- **Hosting**: Vercel (serverless)
- **Framework**: Next.js 15.1.0 (App Router)
- **Node Version**: 20.x LTS
- **Package Manager**: npm 10.x
- **CI/CD**: GitHub Actions
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics (optional)
- **Database**: Supabase (PostgreSQL + Auth)
- **Cache**: Vercel KV (Redis)

---

## Vercel Deployment

### Initial Setup

**1. Connect Repository to Vercel**

```bash
# Option 1: Vercel CLI
npm install -g vercel
vercel login
vercel link

# Option 2: Vercel Dashboard
# 1. Go to https://vercel.com/dashboard
# 2. Click "New Project"
# 3. Import Git Repository
# 4. Select GitHub repository
# 5. Configure settings (see below)
```

**2. Project Configuration**

In Vercel dashboard, configure:

```yaml
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
Node.js Version: 20.x
```

**3. Environment Variables**

Add in Vercel dashboard → Settings → Environment Variables:

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Production | ✅ Yes | Backend API URL (Railway) |
| `NEXT_PUBLIC_SUPABASE_URL` | Production | ✅ Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production | ✅ Yes | Supabase anonymous key |
| `NEXT_PUBLIC_GA_ID` | Production | ❌ No | Google Analytics tracking ID |
| `NEXT_PUBLIC_ENABLE_VLIBRAS` | Production | ❌ No | Enable VLibras widget (true/false) |
| `NODE_ENV` | Production | Auto | Set to 'production' automatically |

### vercel.json Configuration

Current production configuration:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",

  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  },

  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-DNS-Prefetch-Control",
          "value": "on"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    },
    {
      "source": "/_next/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*).webp",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],

  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ],

  "cleanUrls": true,
  "trailingSlash": false
}
```

**Key Configuration Points**:

1. **maxDuration: 10** - API routes have 10s timeout (Vercel hobby limit)
2. **Security headers** - Applied to all routes
3. **Cache headers** - 1 year for static assets (immutable)
4. **cleanUrls** - Remove .html extensions
5. **trailingSlash: false** - No trailing slashes in URLs

### Deployment Workflows

**1. Production Deployment (main branch)**

```bash
# Automatic deployment on push to main
git checkout main
git pull origin main
git merge develop
git push origin main

# Vercel automatically:
# 1. Detects push to main
# 2. Runs build
# 3. Deploys to production
# 4. Updates cidadao-ai-frontend.vercel.app
```

**2. Preview Deployment (PRs)**

```bash
# Create pull request
git checkout -b feature/new-feature
git push origin feature/new-feature

# On GitHub, create PR to main
# Vercel automatically:
# 1. Detects new PR
# 2. Creates preview deployment
# 3. Comments on PR with preview URL
# 4. Updates preview on each push
```

**3. Manual Deployment (Vercel CLI)**

```bash
# Development deployment
vercel

# Production deployment
vercel --prod

# With specific environment
vercel --env production

# Deployment with alias
vercel --prod --alias cidadao.ai
```

### Domain Configuration

**1. Add Custom Domain (Vercel Dashboard)**

```
Settings → Domains → Add Domain
- Primary: cidadao.ai
- Redirects: www.cidadao.ai → cidadao.ai
```

**2. DNS Configuration**

Add these records at your DNS provider:

```
Type    Name    Value                           TTL
A       @       76.76.21.21                     Auto
CNAME   www     cname.vercel-dns.com           Auto
TXT     @       verification-code-from-vercel   Auto
```

**3. SSL Certificate**

Vercel automatically provisions SSL certificates via Let's Encrypt.

---

## Environment Variables

### Variable Types

1. **Public variables** (`NEXT_PUBLIC_*`) - Exposed to browser
2. **Private variables** - Server-side only
3. **System variables** - Vercel-managed (NODE_ENV, VERCEL_URL)

### Required Variables

#### Production Environment

```bash
# Backend API
NEXT_PUBLIC_API_URL=https://cidadao-api-production.up.railway.app

# Supabase Authentication
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional Features
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ENABLE_VLIBRAS=true

# Automatic (Vercel-managed)
NODE_ENV=production
VERCEL=1
VERCEL_ENV=production
VERCEL_URL=cidadao-ai-frontend.vercel.app
```

#### Development Environment (.env.local)

```bash
# Backend API (local or staging)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Supabase (development project)
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key

# Development Features
DISABLE_PWA=true
NODE_ENV=development
NEXT_PUBLIC_ENABLE_VLIBRAS=false
```

### Security Best Practices

✅ **DO**:
- Store secrets in Vercel dashboard (encrypted)
- Use different keys for development/production
- Rotate API keys regularly
- Use `NEXT_PUBLIC_*` only for truly public data
- Add `.env.local` to `.gitignore`

❌ **DON'T**:
- Commit `.env` files to Git
- Share API keys in public channels
- Use production keys in development
- Hardcode sensitive data in code

### Managing Secrets

**1. Add Secret via Vercel CLI**

```bash
# Add production secret
vercel secrets add next_public_api_url "https://api.example.com"

# Link secret to environment variable
vercel env add NEXT_PUBLIC_API_URL production
# Select: Use existing Vercel Secret
```

**2. Add Secret via Dashboard**

```
Settings → Environment Variables
→ Add New → Variable
→ Name: NEXT_PUBLIC_API_URL
→ Value: https://api.example.com
→ Environment: Production
→ Save
```

**3. Update Secret**

```bash
# Remove old secret
vercel secrets rm next_public_api_url

# Add new secret
vercel secrets add next_public_api_url "new-value"

# Redeploy to apply
vercel --prod
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

**File**: `.github/workflows/ci.yml`

```yaml
name: CI - Build & Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    name: Code Quality Checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  build:
    name: Production Build
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: .next/
          retention-days: 7

  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/
          retention-days: 30
```

### E2E Tests Workflow

**File**: `.github/workflows/e2e-tests.yml`

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  e2e:
    name: Playwright E2E Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### Lighthouse CI Workflow

**File**: `.github/workflows/lighthouse.yml`

```yaml
name: Lighthouse CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    name: Performance Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm install -g @lhci/cli@0.15.x
      - run: lhci autorun
```

### GitHub Secrets Configuration

Add these secrets in repository settings:

```
Settings → Secrets and variables → Actions → New repository secret
```

| Secret Name | Value | Used By |
|-------------|-------|---------|
| `NEXT_PUBLIC_API_URL` | Railway backend URL | Build workflow |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Build workflow |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Build workflow |

---

## Build Configuration

### next.config.mjs

Production build configuration:

```javascript
import withSerwistInit from '@serwist/next'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Temporary build overrides (Sprint 1 - remove later)
  typescript: {
    ignoreBuildErrors: true, // Test stories have type mismatches
  },
  eslint: {
    ignoreDuringBuilds: true, // Speed up builds
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'cidadao-api-production.up.railway.app',
      },
    ],
  },

  // Webpack optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          minSize: 20000,
          cacheGroups: {
            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                )[1]
                return `npm.${packageName.replace('@', '')}`
              },
              priority: 30,
            },
            charts: {
              name: 'charts',
              test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
              priority: 25,
            },
            animations: {
              name: 'animations',
              test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
              priority: 25,
            },
          },
        },
      }
    }
    return config
  },
}

export default withBundleAnalyzer(withSerwist(nextConfig))
```

### Build Scripts

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "analyze": "ANALYZE=true npm run build",
    "analyze:server": "ANALYZE=true BUNDLE_ANALYZE=server npm run build",
    "analyze:browser": "ANALYZE=true BUNDLE_ANALYZE=browser npm run build"
  }
}
```

### Build Output Analysis

**Analyze bundle size before deployment**:

```bash
# Analyze client and server bundles
npm run analyze

# Server bundle only
npm run analyze:server

# Browser bundle only
npm run analyze:browser
```

**Expected output**:

```
Route (app)                                Size     First Load JS
┌ ○ /                                      5.2 kB          120 kB
├ ○ /_not-found                            871 B          115 kB
├ ƒ /api/telemetry                         0 B                0 B
├ ○ /en                                    5.18 kB         120 kB
├ ○ /en/agents                             13.9 kB         129 kB
├ ○ /pt                                    5.19 kB         120 kB
├ ○ /pt/(authenticated)/chat               85.7 kB         263 kB
├ ○ /pt/(authenticated)/dashboard          35.2 kB         212 kB
└ ○ /pt/agents                             13.9 kB         129 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand

First Load JS shared by all: 114 kB
  ├ chunks/framework-xxx.js                42.1 kB
  ├ chunks/npm.react-xxx.js                31.5 kB
  └ other shared chunks (total)            40.4 kB
```

**Performance Budgets** (from lighthouserc.js):

```javascript
'resource-summary:script:size': ['error', { maxNumericValue: 250000 }],  // 250KB
'resource-summary:stylesheet:size': ['error', { maxNumericValue: 50000 }], // 50KB
'resource-summary:document:size': ['error', { maxNumericValue: 50000 }],   // 50KB
'resource-summary:total:size': ['error', { maxNumericValue: 1000000 }],    // 1MB
```

---

## Security Headers

### HTTP Security Headers

All headers configured in `vercel.json` and `middleware.ts`:

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self)'
  )

  // Content Security Policy
  response.headers.set('Content-Security-Policy', cspHeader)

  return response
}
```

### Content Security Policy (CSP)

**Production CSP** (`lib/security/csp.config.ts`):

```typescript
export const productionCSP: CSPDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-eval'",      // Required for Next.js
    "'unsafe-inline'",    // Required for VLibras
    'https://vlibras.gov.br',
    'https://*.vlibras.gov.br',
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'",
    'https://fonts.googleapis.com',
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:',
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https:',
  ],
  'connect-src': [
    "'self'",
    'https://cidadao-api-production.up.railway.app',
    'https://*.supabase.co',
  ],
  'frame-src': [
    "'self'",
    'https://open.spotify.com',
    'https://vlibras.gov.br',
  ],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
}
```

### Security Checklist

Before deploying to production:

- [ ] CSP configured for all external resources
- [ ] HSTS header enabled with preload
- [ ] X-Frame-Options set to SAMEORIGIN
- [ ] X-Content-Type-Options set to nosniff
- [ ] Referrer-Policy configured
- [ ] Permissions-Policy restricts dangerous features
- [ ] All secrets moved to environment variables
- [ ] No API keys in client-side code
- [ ] Rate limiting configured for API routes
- [ ] Input sanitization enabled (DOMPurify)
- [ ] CORS configured correctly

---

## Performance Optimization

### Vercel Edge Network

Vercel automatically distributes your app to edge locations globally:

```
Regions:
- North America: IAD (US East), SFO (US West)
- Europe: AMS (Netherlands), FRA (Germany), LHR (UK)
- Asia: HKG (Hong Kong), SIN (Singapore), NRT (Japan)
- South America: GRU (Brazil)
- Oceania: SYD (Australia)
```

### Caching Strategy

**1. Static Assets** (1 year cache):

```
/_next/static/*     Cache-Control: public, max-age=31536000, immutable
/static/*           Cache-Control: public, max-age=31536000, immutable
/*.webp             Cache-Control: public, max-age=31536000, immutable
```

**2. Dynamic Pages** (no cache):

```
/*                  Cache-Control: private, no-cache, no-store, max-age=0
```

**3. API Routes** (custom cache):

```typescript
// app/api/route.ts
export async function GET() {
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  })
}
```

### Image Optimization

Next.js automatically optimizes images:

```typescript
// next.config.mjs
images: {
  formats: ['image/avif', 'image/webp'],
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**.supabase.co',
    },
  ],
}
```

**Usage**:

```tsx
import Image from 'next/image'

<Image
  src="/hero.png"
  alt="Hero image"
  width={1200}
  height={600}
  priority // For above-the-fold images
  quality={90}
/>
```

### Code Splitting

**Automatic** (Next.js):
- Route-based splitting (each page = separate bundle)
- Dynamic imports for heavy components

**Manual** (next/dynamic):

```tsx
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/charts/heavy-chart'), {
  loading: () => <Skeleton />,
  ssr: false,
})
```

### Performance Budgets

Enforced via Lighthouse CI:

```javascript
// lighthouserc.js
assertions: {
  'categories:performance': ['error', { minScore: 0.90 }],
  'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
  'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
  'total-blocking-time': ['error', { maxNumericValue: 300 }],
}
```

---

## Monitoring & Error Tracking

### Sentry Error Tracking

**Setup** (`sentry.client.config.ts`):

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
})
```

**Error Reporting**:

```typescript
// Automatic error capture
try {
  await fetchData()
} catch (error) {
  Sentry.captureException(error)
  throw error
}

// Custom error context
Sentry.setContext('user', {
  id: user.id,
  email: user.email,
})
```

### Vercel Analytics

**Enable in Vercel Dashboard**:

```
Settings → Analytics → Enable Web Analytics
```

**Metrics tracked**:
- Core Web Vitals (LCP, FID, CLS)
- Page load time
- Time to First Byte (TTFB)
- Unique visitors
- Top pages

### Custom Logging

**Production logging**:

```typescript
// lib/utils/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify({ level: 'info', message, ...data }))
    }
  },

  error: (message: string, error?: Error) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.message,
      stack: error?.stack,
    }))

    Sentry.captureException(error)
  },

  performance: (metric: string, duration: number) => {
    console.log(JSON.stringify({
      level: 'performance',
      metric,
      duration,
    }))
  },
}
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (`npm run test`)
- [ ] Build successful (`npm run build`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Lighthouse CI passing (performance ≥90%)
- [ ] Environment variables configured in Vercel
- [ ] Supabase migrations applied
- [ ] Database backups created
- [ ] Sentry DSN configured
- [ ] Google Analytics ID set (if using)

### Security Checks

- [ ] All secrets in environment variables (not code)
- [ ] CSP headers configured
- [ ] Rate limiting enabled
- [ ] Input sanitization active
- [ ] CORS configured correctly
- [ ] API keys rotated (if needed)
- [ ] No console.logs with sensitive data

### Performance Checks

- [ ] Bundle size within budget (250KB JS)
- [ ] Images optimized (AVIF/WebP)
- [ ] Critical CSS inlined
- [ ] Fonts preloaded
- [ ] Code split appropriately
- [ ] Cache headers configured

### Deployment Steps

**1. Merge to main**:

```bash
git checkout develop
git pull origin develop
npm run test
npm run build
git checkout main
git merge develop
git push origin main
```

**2. Monitor deployment**:

```bash
# Watch Vercel deployment
vercel --prod --confirm

# Check deployment status
vercel ls

# View logs
vercel logs cidadao-ai-frontend --prod
```

**3. Verify deployment**:

- [ ] Visit production URL
- [ ] Test critical user flows
- [ ] Check error tracking (Sentry)
- [ ] Monitor performance (Vercel Analytics)
- [ ] Verify all environment variables loaded

### Post-Deployment

- [ ] Smoke tests on production
- [ ] Monitor error rates (Sentry dashboard)
- [ ] Check performance metrics (Vercel Analytics)
- [ ] Verify database connections
- [ ] Test authentication flows
- [ ] Confirm API integrations working
- [ ] Update deployment documentation
- [ ] Notify team of successful deployment

---

## Troubleshooting

### Common Issues

#### 1. Build Fails on Vercel

**Symptom**:
```
Error: Build failed with exit code 1
```

**Solutions**:

```bash
# 1. Check build locally
npm run build

# 2. Check environment variables
vercel env ls

# 3. Check Node version matches (20.x)
node --version

# 4. Clear Vercel cache
vercel --prod --force

# 5. Check build logs in Vercel dashboard
```

#### 2. Environment Variables Not Loading

**Symptom**:
```
Error: process.env.NEXT_PUBLIC_API_URL is undefined
```

**Solutions**:

```bash
# 1. Verify variable exists in Vercel
vercel env ls

# 2. Check variable name (case-sensitive)
NEXT_PUBLIC_API_URL vs next_public_api_url

# 3. Redeploy to apply new variables
vercel --prod

# 4. Check variable is marked for production environment
```

#### 3. 404 on Production (Route Works Locally)

**Symptom**:
```
404 - This page could not be found
```

**Solutions**:

```bash
# 1. Check file naming (case-sensitive)
/pt/Chat → /pt/chat

# 2. Verify dynamic routes
[slug] → must have generateStaticParams

# 3. Check redirects in vercel.json
{
  "redirects": [
    {
      "source": "/old-route",
      "destination": "/new-route",
      "permanent": true
    }
  ]
}

# 4. Clear CDN cache
vercel --prod --force
```

#### 4. Slow Build Times

**Symptom**:
```
Build taking >5 minutes
```

**Solutions**:

```bash
# 1. Enable caching in vercel.json
{
  "functions": {
    "app/**/*.ts": {
      "maxDuration": 10
    }
  }
}

# 2. Use npm ci instead of npm install
vercel env add ENABLE_EXPERIMENTAL_COREPACK 1

# 3. Optimize dependencies
npm prune --production

# 4. Check for unnecessary files in build
# Add to .vercelignore:
# .git
# .next
# node_modules
# *.test.ts
# *.spec.ts
```

#### 5. CSP Blocking Resources

**Symptom**:
```
Refused to load script from 'https://example.com' because it violates CSP
```

**Solutions**:

```typescript
// lib/security/csp.config.ts
export const productionCSP = {
  'script-src': [
    "'self'",
    'https://example.com', // Add allowed domain
  ],
}

// Or use nonce for inline scripts
<script nonce={nonce}>
  // Your code
</script>
```

---

## Rollback Procedures

### Quick Rollback (Vercel Dashboard)

**1. Via Dashboard**:

```
Deployments → Find previous successful deployment → ••• → Promote to Production
```

**2. Via CLI**:

```bash
# List recent deployments
vercel ls

# Promote specific deployment to production
vercel promote <deployment-url>
```

### Git Rollback

**1. Revert last commit**:

```bash
git revert HEAD
git push origin main
# Vercel automatically deploys reverted version
```

**2. Rollback to specific commit**:

```bash
git reset --hard <commit-hash>
git push origin main --force
# Vercel deploys specific commit
```

### Database Rollback

**1. Revert Supabase migration**:

```bash
# In Supabase dashboard
SQL Editor → Run migration rollback script

# Or use Supabase CLI
supabase db reset --db-url $DATABASE_URL
```

**2. Restore from backup**:

```bash
# Supabase automatic daily backups
# Restore via dashboard: Database → Backups → Restore
```

### Emergency Procedures

**1. Take site offline (maintenance mode)**:

Create `public/maintenance.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Maintenance</title>
</head>
<body>
  <h1>Site under maintenance</h1>
  <p>We'll be back soon!</p>
</body>
</html>
```

Add rewrite in `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/maintenance.html"
    }
  ]
}
```

**2. Disable feature flags**:

```bash
# Update environment variable
vercel env rm NEXT_PUBLIC_ENABLE_FEATURE
vercel --prod
```

---

## Summary

### Deployment Flow

```
1. Code → GitHub (push to main)
2. GitHub Actions → Run CI/CD (lint, test, build)
3. Vercel → Deploy to edge (automatic on CI success)
4. Monitor → Check Sentry + Analytics
5. Verify → Test critical flows
```

### Key Commands

```bash
# Deploy
vercel --prod

# Check status
vercel ls

# View logs
vercel logs --prod

# Rollback
vercel promote <deployment-url>
```

### Important URLs

- **Production**: https://cidadao-ai-frontend.vercel.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Sentry**: https://sentry.io/organizations/your-org
- **Supabase**: https://app.supabase.com/project/your-project

---

**Document Status**: ✅ Complete
**Coverage**: Comprehensive - Complete deployment process documented
**Last Review**: 2025-01-25
**Next Review**: 2025-04-25
