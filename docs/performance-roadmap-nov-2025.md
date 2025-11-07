# Performance Optimization Roadmap - November 2025

**Author**: Anderson Henrique da Silva  
**Date**: 2025-11-07  
**Current RES**: 72 (Needs Improvement)  
**Target RES**: 90+ (Great)

---

## 📊 Current State Analysis

### Real Experience Score: 72/100 ⚠️

**Critical Metrics**:

- ✅ FID: 30ms (Good - <100ms)
- ✅ TTFB: 1.39s (Good - <0.8s for optimal, acceptable for dynamic)
- ⚠️ FCP: 1.89s (Needs Improvement - target <1.8s)
- ⚠️ LCP: 2.32s (Borderline - target <2.5s, ideal <2.0s)
- ⚠️ INP: 176ms (Needs Improvement - target <200ms)
- ❌ **CLS: 0.9 (CRITICAL - target <0.1, currently 9x over limit)**

### Performance by Route

| Route                 | RES | Visits | Priority  | Issue                    |
| --------------------- | --- | ------ | --------- | ------------------------ |
| `/pt` (Landing)       | 55  | 20     | 🔴 HIGH   | CLS killing score        |
| `/pt/app` (Dashboard) | 83  | 8      | 🟡 MEDIUM | Close to target          |
| `/pt/login`           | 100 | 6      | ✅ GOOD   | Reference implementation |

### Root Cause Identification

**Primary Issue**: Cumulative Layout Shift (CLS) = 0.9

- **Impact**: Single biggest factor pulling RES down
- **Location**: Landing page (`/pt`) - RES 55
- **Magnitude**: 9x above acceptable threshold

**Secondary Issues**:

- FCP slightly high (1.89s vs 1.8s target)
- LCP could be improved (2.32s → 2.0s)
- INP borderline (176ms vs 200ms limit)

---

## 🎯 Surgical Roadmap - 4 Phases

### Phase 1: Emergency CLS Fix (Landing Page) 🚨

**Duration**: 2-3 hours  
**Impact**: RES 55 → 75-80 (+20-25 points)  
**Priority**: CRITICAL

#### Root Causes of CLS on Landing Page

1. **Images without dimensions** (Primary cause)
   - Hero section background
   - Agent avatars in grid
   - Logo/icons
   - Tarsila do Amaral artwork

2. **Dynamic content injection** (Secondary cause)
   - Modals rendering after page load
   - VLibras widget (if enabled)
   - Analytics scripts

3. **Web fonts loading** (Tertiary cause)
   - Font swapping causing reflow
   - Icon fonts loading

#### Surgical Fixes

##### 1.1 Reserve Image Spaces (45 min)

```typescript
// app/pt/page.tsx - Hero Section
<Image
  src="/hero-background.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority // Above the fold
  placeholder="blur"
  blurDataURL="data:image/..." // Low-quality placeholder
  className="..."
/>

// Agent Grid
<Image
  src={agent.avatar}
  alt={agent.name}
  width={400}
  height={400}
  loading="lazy" // Below the fold
  className="aspect-square" // Prevent reflow
/>
```

**Files to modify**:

- `app/pt/page.tsx` (hero section)
- `app/en/page.tsx` (hero section)
- `components/landing/content-card.tsx` (agent images)
- `components/agents/agent-card.tsx` (avatar images)

##### 1.2 Preload Critical Assets (30 min)

```typescript
// app/pt/layout.tsx
export default function PTLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt">
      <head>
        {/* Preload critical images */}
        <link rel="preload" as="image" href="/hero-background.jpg" />
        <link rel="preload" as="image" href="/logo.png" />

        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

**Files to modify**:

- `app/pt/layout.tsx`
- `app/en/layout.tsx`

##### 1.3 Font Display Optimization (20 min)

```css
/* globals.css */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2');
  font-display: swap; /* Prevent invisible text, accept reflow */
  /* OR */
  font-display: optional; /* Prevent reflow, accept fallback font */
}
```

**Recommendation**: Use `font-display: optional` for landing page (prevents CLS).

**Files to modify**:

- `app/globals.css`

##### 1.4 Skeleton Screens for Dynamic Content (45 min)

```typescript
// components/landing/content-card.tsx
export function ContentCard({ title, description, image }: Props) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div className="relative aspect-video">
      {/* Skeleton */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-lg" />
      )}

      {/* Actual Image */}
      <Image
        src={image}
        alt={title}
        fill
        className={cn(
          "object-cover rounded-lg transition-opacity",
          imageLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoadingComplete={() => setImageLoaded(true)}
      />
    </div>
  )
}
```

**Files to create/modify**:

- `components/landing/skeleton-card.tsx` (new)
- `components/landing/content-card.tsx` (modify)

##### 1.5 Lazy Load VLibras (15 min)

```typescript
// components/a11y/vlibras-lazy.tsx
// Already implemented - verify it's actually lazy loading

// Ensure VLibras loads AFTER page is interactive
useEffect(() => {
  if (typeof window !== 'undefined' && enabled) {
    // Delay VLibras initialization to avoid CLS
    const timer = setTimeout(() => {
      loadVLibras()
    }, 2000) // Load after 2s

    return () => clearTimeout(timer)
  }
}, [enabled])
```

**Files to verify/modify**:

- `components/a11y/vlibras-lazy.tsx`

#### Phase 1 Validation

```bash
# Run Lighthouse locally
npm run lighthouse

# Check CLS specifically
# Target: CLS < 0.1 (currently 0.9)

# Deploy to preview
git checkout -b perf/phase1-cls-fix
# ... make changes ...
git commit -m "perf(landing): fix CLS with image dimensions and skeletons"
git push origin perf/phase1-cls-fix

# Wait for Vercel preview deploy
# Check Speed Insights on preview URL
```

**Expected Results**:

- CLS: 0.9 → 0.05-0.1 (90-95% improvement)
- Landing RES: 55 → 75-80
- Overall RES: 72 → 78-82

---

### Phase 2: LCP Optimization (Image Loading) 🖼️

**Duration**: 2-3 hours  
**Impact**: RES 78-82 → 85-88 (+5-7 points)  
**Priority**: HIGH

#### Goal: LCP 2.32s → <2.0s

##### 2.1 Optimize Hero Image (60 min)

```typescript
// Generate optimized hero images
// 1. Convert to AVIF/WebP
// 2. Create responsive sizes
// 3. Implement art direction

// app/pt/page.tsx
<picture>
  {/* Modern formats for modern browsers */}
  <source
    srcSet="/hero-desktop.avif 1920w, /hero-tablet.avif 1024w, /hero-mobile.avif 768w"
    type="image/avif"
    sizes="100vw"
  />
  <source
    srcSet="/hero-desktop.webp 1920w, /hero-tablet.webp 1024w, /hero-mobile.webp 768w"
    type="image/webp"
    sizes="100vw"
  />

  {/* Fallback */}
  <Image
    src="/hero-desktop.jpg"
    alt="Hero"
    width={1920}
    height={1080}
    priority
    quality={85}
    className="..."
  />
</picture>
```

**Tasks**:

1. Generate AVIF versions of hero image (use Squoosh.app or sharp)
2. Create responsive sizes (1920w, 1024w, 768w)
3. Update Image component to use picture element

**Files to modify**:

- `app/pt/page.tsx`
- `app/en/page.tsx`
- Add new images to `public/`

##### 2.2 Preconnect to External Domains (15 min)

```typescript
// app/pt/layout.tsx
<head>
  {/* Preconnect to Supabase for faster auth */}
  <link rel="preconnect" href="https://your-project.supabase.co" />
  <link rel="dns-prefetch" href="https://your-project.supabase.co" />

  {/* Preconnect to backend API */}
  <link rel="preconnect" href="https://cidadao-api-production.up.railway.app" />
  <link rel="dns-prefetch" href="https://cidadao-api-production.up.railway.app" />

  {/* Analytics */}
  <link rel="preconnect" href="https://www.googletagmanager.com" />
</head>
```

**Files to modify**:

- `app/pt/layout.tsx`
- `app/en/layout.tsx`

##### 2.3 Code Splitting for Below-the-Fold Content (45 min)

```typescript
// app/pt/page.tsx
import dynamic from 'next/dynamic'

// Lazy load sections below the fold
const AboutModal = dynamic(() => import('@/components/landing/about-modal'), {
  loading: () => <div className="h-screen bg-muted animate-pulse" />
})

const AgentsModal = dynamic(() => import('@/components/landing/agents-modal'), {
  loading: () => <div className="h-screen bg-muted animate-pulse" />
})

const ManifestoModal = dynamic(() => import('@/components/landing/manifesto-modal'))

// Only load when modal is opened
const [isAboutOpen, setIsAboutOpen] = useState(false)

{isAboutOpen && <AboutModal open={isAboutOpen} onClose={() => setIsAboutOpen(false)} />}
```

**Files to modify**:

- `app/pt/page.tsx`
- `app/en/page.tsx`

##### 2.4 Implement Resource Hints (30 min)

```typescript
// next.config.mjs
const nextConfig = {
  // Enable experimental optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Compress responses
  compress: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    minimumCacheTTL: 60,
  },
}
```

**Files to modify**:

- `next.config.mjs`

#### Phase 2 Validation

```bash
# Run Lighthouse
npm run lighthouse

# Check LCP
# Target: LCP < 2.0s (currently 2.32s)

# Deploy to preview
git commit -m "perf(landing): optimize LCP with image optimization and code splitting"
```

**Expected Results**:

- LCP: 2.32s → 1.8-2.0s
- FCP: 1.89s → 1.5-1.7s (side effect)
- Overall RES: 78-82 → 85-88

---

### Phase 3: JavaScript Optimization (Interactivity) ⚡

**Duration**: 2-3 hours  
**Impact**: RES 85-88 → 90-92 (+5-7 points)  
**Priority**: MEDIUM

#### Goal: INP 176ms → <100ms, reduce Total Blocking Time

##### 3.1 Defer Non-Critical Scripts (30 min)

```typescript
// app/pt/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function PTLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt">
      <body>
        {children}

        {/* Defer analytics to after interactive */}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      </body>
    </html>
  )
}
```

**Files to modify**:

- `app/pt/layout.tsx`
- `app/en/layout.tsx`
- Move all `<Script>` tags to bottom of body

##### 3.2 Optimize Bundle Size (60 min)

```bash
# Analyze current bundle
ANALYZE=true npm run build

# Identify large dependencies
# Target: Reduce main bundle by 20-30%
```

**Actions**:

1. Replace `date-fns` with lighter alternatives (if used)
2. Tree-shake unused Radix UI components
3. Split vendor chunks more aggressively

```typescript
// next.config.mjs
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Aggressive code splitting
          default: false,
          vendors: false,

          // Framework
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
            priority: 40,
            enforce: true,
          },

          // UI components
          ui: {
            name: 'ui',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
            priority: 30,
          },

          // Charts (only load when needed)
          charts: {
            name: 'charts',
            chunks: 'async',
            test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
            priority: 25,
          },

          // PDF export (lazy load)
          pdf: {
            name: 'pdf',
            chunks: 'async',
            test: /[\\/]node_modules[\\/](jspdf|html2canvas)[\\/]/,
            priority: 20,
          },

          // Common vendor code
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 10,
          },
        },
      }
    }

    return config
  },
}
```

**Files to modify**:

- `next.config.mjs`

##### 3.3 Implement Progressive Hydration (45 min)

```typescript
// components/landing/agent-grid.tsx
'use client'

import { useEffect, useState } from 'react'

export function AgentGrid({ agents }: Props) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Defer hydration until after initial render
    const timer = setTimeout(() => setIsHydrated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (!isHydrated) {
    // Server-side rendered static content
    return <AgentGridStatic agents={agents} />
  }

  // Fully interactive version
  return <AgentGridInteractive agents={agents} />
}
```

**Files to create/modify**:

- `components/landing/agent-grid.tsx`
- `components/landing/agent-grid-static.tsx` (new)

##### 3.4 Reduce Main Thread Work (45 min)

```typescript
// Move heavy computations to Web Workers
// lib/workers/data-processor.worker.ts
self.addEventListener('message', (event) => {
  const { data } = event

  // Process data off main thread
  const result = processHeavyData(data)

  self.postMessage(result)
})

// Usage in component
const worker = useMemo(
  () => new Worker(new URL('@/lib/workers/data-processor.worker.ts', import.meta.url)),
  []
)

worker.postMessage(data)
worker.onmessage = (event) => {
  setProcessedData(event.data)
}
```

**Files to create**:

- `lib/workers/data-processor.worker.ts` (if heavy data processing exists)

#### Phase 3 Validation

```bash
# Run Lighthouse
npm run lighthouse

# Check INP and Total Blocking Time
# Target: INP < 100ms (currently 176ms)

git commit -m "perf(js): optimize JavaScript bundle and interactivity"
```

**Expected Results**:

- INP: 176ms → 80-100ms
- Total Blocking Time: Reduced by 30-40%
- Overall RES: 85-88 → 90-92

---

### Phase 4: Advanced Optimizations (Polish) 🚀

**Duration**: 3-4 hours  
**Impact**: RES 90-92 → 95+ (+5-8 points)  
**Priority**: LOW (Optional - for exceeding targets)

#### Goal: Achieve RES > 95 (Excellent)

##### 4.1 Implement Server Components Strategy (90 min)

```typescript
// app/pt/page.tsx - Convert to Server Component where possible
export default async function LandingPage() {
  // Fetch data on server (no client-side fetch)
  const agents = await getAgents() // Server-side only

  return (
    <main>
      {/* Server-rendered static content */}
      <HeroSection />

      {/* Client components only where needed */}
      <AgentsGrid agents={agents} />

      {/* Server component for SEO-critical content */}
      <AboutSection />
    </main>
  )
}
```

**Strategy**:

- Keep static content as Server Components
- Only use Client Components for interactivity
- Reduce hydration overhead

**Files to modify**:

- `app/pt/page.tsx`
- `app/en/page.tsx`
- Various landing page components

##### 4.2 Implement Edge Caching (60 min)

```typescript
// app/pt/page.tsx
export const revalidate = 3600 // Revalidate every hour

// Or use ISR for specific routes
export async function generateStaticParams() {
  return [{ locale: 'pt' }, { locale: 'en' }]
}
```

**Files to modify**:

- `app/pt/page.tsx`
- `app/en/page.tsx`

##### 4.3 Optimize Critical CSS (45 min)

```bash
# Extract critical CSS for above-the-fold content
npm install critical --save-dev

# Generate critical CSS during build
npx critical app/pt/page.html --base public --inline --css public/styles.css
```

**Files to create**:

- `scripts/generate-critical-css.js`

##### 4.4 Implement Partial Prerendering (PPR) (45 min)

```typescript
// next.config.mjs
const nextConfig = {
  experimental: {
    ppr: true, // Partial Prerendering
  },
}

// app/pt/page.tsx
import { Suspense } from 'react'

export default function LandingPage() {
  return (
    <main>
      {/* Prerendered static shell */}
      <HeroSection />

      {/* Dynamic content with streaming */}
      <Suspense fallback={<AgentGridSkeleton />}>
        <AgentsGrid />
      </Suspense>
    </main>
  )
}
```

**Files to modify**:

- `next.config.mjs`
- `app/pt/page.tsx`
- `app/en/page.tsx`

#### Phase 4 Validation

```bash
# Final Lighthouse audit
npm run lighthouse

# Target: RES > 95

git commit -m "perf(advanced): implement server components and edge caching"
```

**Expected Results**:

- All Core Web Vitals in "Good" range
- Overall RES: 90-92 → 95+
- Lighthouse Performance Score: >95

---

## 📊 Success Metrics

### Phase-by-Phase Targets

| Phase        | Duration | CLS   | LCP   | RES   | Status        |
| ------------ | -------- | ----- | ----- | ----- | ------------- |
| **Baseline** | -        | 0.9   | 2.32s | 72    | Current       |
| **Phase 1**  | 2-3h     | <0.1  | 2.32s | 78-82 | 🎯 Critical   |
| **Phase 2**  | 2-3h     | <0.1  | <2.0s | 85-88 | 🎯 Important  |
| **Phase 3**  | 2-3h     | <0.1  | <2.0s | 90-92 | 🎯 Target     |
| **Phase 4**  | 3-4h     | <0.05 | <1.8s | 95+   | ⭐ Excellence |

### Final Target Metrics

```
✅ FCP: <1.5s (currently 1.89s)
✅ LCP: <2.0s (currently 2.32s)
✅ CLS: <0.1 (currently 0.9) ⚠️ CRITICAL
✅ INP: <100ms (currently 176ms)
✅ TTFB: <1.0s (currently 1.39s)
✅ RES: >90 (currently 72)
```

---

## 🔄 Continuous Monitoring

### After Each Phase

1. **Deploy to preview branch**
2. **Wait for Vercel Speed Insights data** (24-48h)
3. **Run Lighthouse CI**
4. **Compare metrics**
5. **Iterate if needed**

### Tools

```bash
# Local Lighthouse
npm run lighthouse

# Vercel Speed Insights
# Check dashboard after deploy

# WebPageTest (external validation)
# https://www.webpagetest.org

# Chrome DevTools Performance
# Record user interaction, analyze timeline
```

---

## 🎯 Execution Strategy

### Recommended Approach: Sequential Phases

**Week 1**: Phase 1 (CLS Fix)

- Monday-Tuesday: Implementation
- Wednesday: Deploy + Monitor
- Thursday-Friday: Iterate based on data

**Week 2**: Phase 2 (LCP Optimization)

- Monday-Tuesday: Implementation
- Wednesday: Deploy + Monitor
- Thursday-Friday: Iterate

**Week 3**: Phase 3 (JS Optimization)

- Monday-Tuesday: Implementation
- Wednesday: Deploy + Monitor
- Thursday-Friday: Validate RES >90

**Week 4** (Optional): Phase 4 (Advanced)

- Only if target RES >90 achieved
- Focus on excellence (RES >95)

### Alternative: Parallel Execution

If multiple developers available:

- **Dev 1**: Phase 1 (CLS)
- **Dev 2**: Phase 2 (LCP)
- Merge sequentially after validation

---

## 🚨 Risks & Mitigations

### Risk 1: CLS Fix Causes New Issues

**Mitigation**: Test thoroughly on multiple devices/browsers before deploy

### Risk 2: Bundle Size Increases

**Mitigation**: Monitor bundle size during Phase 3, rollback if >10% increase

### Risk 3: Breaking Changes

**Mitigation**:

- Use feature flags
- Deploy to preview first
- A/B test with 10% traffic

### Risk 4: Over-Optimization

**Mitigation**: Stop at Phase 3 if RES >90 achieved, Phase 4 is optional

---

## ✅ Definition of Done

### Phase 1 Complete When:

- [ ] CLS < 0.1 on all routes
- [ ] Landing page RES > 75
- [ ] No visual regression bugs
- [ ] Tests pass

### Phase 2 Complete When:

- [ ] LCP < 2.0s on all routes
- [ ] Overall RES > 85
- [ ] Image optimization verified
- [ ] Tests pass

### Phase 3 Complete When:

- [ ] INP < 100ms
- [ ] Overall RES > 90 ✅ TARGET ACHIEVED
- [ ] Bundle size not increased >10%
- [ ] Tests pass

### Phase 4 Complete When:

- [ ] RES > 95
- [ ] All Core Web Vitals "Good"
- [ ] Lighthouse Performance > 95
- [ ] Tests pass

---

## 📝 Notes

- **Priority**: Phase 1 is CRITICAL - CLS is 9x over limit
- **Quick Win**: `/pt/login` already has RES 100 - use as reference
- **Data Source**: Vercel Speed Insights (46 data points, Brazil traffic)
- **Next Review**: After Phase 1 completion (~3-5 days for data)

---

**Status**: Roadmap created, ready for execution  
**Next Step**: Start Phase 1 - Emergency CLS Fix
