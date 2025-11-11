# Performance Optimization Plan - Cidadão.AI Frontend

**Author**: Anderson Henrique da Silva
**Date**: 2025-11-11
**Current RES**: 71 (Needs Improvement)
**Target RES**: 90+ (Great)

---

## 📊 Current Performance Metrics (Production - Vercel)

### Critical Issues

| Metric                              | Current | Target  | Status        |
| ----------------------------------- | ------- | ------- | ------------- |
| **Time to First Byte (TTFB)**       | 2.03s   | < 600ms | 🚨 Critical   |
| **Largest Contentful Paint (LCP)**  | 2.38s   | < 2.5s  | ⚠️ At Limit   |
| **Cumulative Layout Shift (CLS)**   | 0.9     | < 0.1   | 🚨 Critical   |
| **First Contentful Paint (FCP)**    | 2.11s   | < 1.8s  | ⚠️ Needs Work |
| **Interaction to Next Paint (INP)** | 120ms   | < 200ms | ✅ Good       |
| **First Input Delay (FID)**         | 12ms    | < 100ms | ✅ Excellent  |

### Real Experience Score by Route

| Route                 | Visits | RES | Status               |
| --------------------- | ------ | --- | -------------------- |
| `/pt` (Landing)       | 40     | 54  | ⚠️ Needs Improvement |
| `/pt/app` (Dashboard) | 19     | 69  | ⚠️ Needs Improvement |
| `/pt/login`           | 11     | 75  | ⚠️ Needs Improvement |
| `/pt/app/chat`        | 12     | 100 | ✅ Great             |
| `/pt/app/mapa`        | 4      | 100 | ✅ Great             |

**Key Insight**: Landing page and initial routes are slow. Authenticated routes are fast.

---

## 🔍 Root Cause Analysis

### 1. TTFB (2.03s) - Server Response Time

**Causes**:

- ⚠️ **Vercel Cold Starts**: Serverless functions take time to warm up
- ⚠️ **Heavy Middleware**: Security headers, CSP, auth checks
- ⚠️ **No Edge Caching**: Static pages not cached at edge
- ⚠️ **External API Calls**: Backend connectivity checks delay response

**Bundle Analysis**:

```
First Load JS: 237 kB (shared by all)
├─ chunks/commons: 72.8 kB
├─ chunks/npm.next: 158 kB (❗ Too large!)
└─ other chunks: 5.51 kB
```

**Heaviest Routes**:

- `/pt/app/chat`: 399 kB (18.9 kB page + 237 kB shared + 143 kB chunks)
- `/pt/app/atividades`: 360 kB
- `/pt/app/dashboard`: 361 kB

### 2. LCP (2.38s) - Largest Content Paint

**Causes**:

- ⚠️ **Large Initial Bundle**: 237 kB shared JS blocks rendering
- ⚠️ **No Priority Hints**: Critical resources not prioritized
- ⚠️ **Hero Images Not Optimized**: Landing page images load slowly
- ⚠️ **Fonts Block Rendering**: Custom fonts not preloaded

### 3. CLS (0.9) - Layout Shift

**Causes (CRITICAL)**:

- 🚨 **Images Without Dimensions**: `width`/`height` missing
- 🚨 **Dynamic Content Injection**: Cookie banner, modals appear suddenly
- 🚨 **Font Swap**: FOIT (Flash of Invisible Text) causes shifts
- 🚨 **Ads/Analytics Scripts**: Third-party scripts inject content

### 4. FCP (2.11s) - First Content Paint

**Causes**:

- ⚠️ **Render-Blocking Resources**: CSS/JS block paint
- ⚠️ **Heavy Middleware**: Delays HTML generation
- ⚠️ **No Progressive Rendering**: SSR waits for all data

---

## 🎯 Optimization Strategy

### Phase 1: Quick Wins (1-2 days) - Target: RES 80+

#### 1.1 Fix CLS (0.9 → < 0.1) - Highest Impact

**Actions**:

1. **Add Image Dimensions** (30 minutes)

   ```tsx
   // Before: ❌
   <img src="/hero.jpg" />

   // After: ✅
   <Image
     src="/hero.jpg"
     width={1200}
     height={630}
     priority
   />
   ```

   **Files to fix**:
   - `app/pt/page.tsx` (landing hero)
   - `app/en/page.tsx` (landing hero)
   - `components/agents/*.tsx` (agent avatars)
   - All `<img>` tags without dimensions

2. **Reserve Space for Dynamic Content** (1 hour)

   ```tsx
   // Cookie banner: reserve bottom space
   <div className="pb-20"> {/* Reserve 80px for banner */}
     <main>{children}</main>
   </div>

   // Modal: prevent layout shift
   <Modal className="fixed inset-0"> {/* Fixed positioning */}
   ```

3. **Font Display Strategy** (15 minutes)
   ```tsx
   // app/layout.tsx
   const inter = Inter({
     subsets: ['latin'],
     display: 'swap', // ✅ Prevents FOIT
     preload: true,
   })
   ```

**Expected Impact**: CLS 0.9 → 0.05 (RES +10 points)

#### 1.2 Reduce Bundle Size (237 kB → 180 kB) (3 hours)

**Actions**:

1. **Dynamic Imports for Heavy Components** (1 hour)

   ```tsx
   // Before: ❌ All loaded upfront
   import { PDFExport } from '@/lib/export-service'
   import { Charts } from '@/components/charts'

   // After: ✅ Load on demand
   const PDFExport = dynamic(() => import('@/lib/export-service'))
   const Charts = dynamic(() => import('@/components/charts'))
   ```

   **Components to lazy load**:
   - PDF export (`jspdf`, `html2canvas`) - 80 kB
   - Charts (`recharts`, `d3`) - 120 kB
   - Rich text editor (if any)

2. **Tree-Shake Lucide Icons** (30 minutes)

   ```tsx
   // Before: ❌ Imports entire lib
   import * as Icons from 'lucide-react'

   // After: ✅ Import only needed icons
   import { Menu, User, Settings } from 'lucide-react'
   ```

3. **Remove Unused Dependencies** (30 minutes)

   ```bash
   npm run analyze # Find unused packages
   npm uninstall <unused-packages>
   ```

4. **Optimize PostHog Bundle** (1 hour)
   ```tsx
   // Load PostHog only after user interaction
   useEffect(() => {
     const timer = setTimeout(() => {
       initPostHog()
     }, 3000) // Delay 3s
   }, [])
   ```

**Expected Impact**: First Load JS 237 kB → 180 kB (RES +5 points)

#### 1.3 Edge Caching for Static Pages (1 hour)

**Actions**:

1. **Enable ISR (Incremental Static Regeneration)**

   ```tsx
   // app/pt/page.tsx
   export const revalidate = 3600 // Cache for 1 hour
   ```

2. **Configure Vercel Edge Config**
   ```json
   // vercel.json
   {
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, s-maxage=3600, stale-while-revalidate=86400"
           }
         ]
       }
     ]
   }
   ```

**Expected Impact**: TTFB 2.03s → 1.2s (RES +8 points)

---

### Phase 2: Medium Term (3-5 days) - Target: RES 85+

#### 2.1 Implement Critical CSS Inlining (2 hours)

**Actions**:

1. **Extract Critical CSS** (Automatic with Next.js 15)
2. **Inline Above-the-Fold CSS**
   ```tsx
   // app/layout.tsx
   <style
     dangerouslySetInnerHTML={{
       __html: criticalCSS, // Inline critical CSS
     }}
   />
   ```

**Expected Impact**: FCP 2.11s → 1.5s (RES +3 points)

#### 2.2 Optimize Fonts (1 hour)

**Actions**:

1. **Preload Critical Fonts**

   ```tsx
   <link
     rel="preload"
     href="/fonts/inter.woff2"
     as="font"
     type="font/woff2"
     crossOrigin="anonymous"
   />
   ```

2. **Use Variable Fonts** (Smaller file size)
3. **Subset Fonts** (Only Latin characters)

**Expected Impact**: FCP 2.11s → 1.7s, CLS reduction

#### 2.3 Image Optimization (3 hours)

**Actions**:

1. **Convert Images to AVIF** (Already enabled, ensure usage)
2. **Implement Blur Placeholders**

   ```tsx
   <Image src="/hero.jpg" placeholder="blur" blurDataURL="data:image/..." />
   ```

3. **Lazy Load Below-the-Fold Images**

   ```tsx
   <Image
     src="/feature.jpg"
     loading="lazy" // ✅ Native lazy loading
   />
   ```

4. **Optimize Agent Avatars** (PNG → WebP, reduce size)

**Expected Impact**: LCP 2.38s → 2.0s (RES +2 points)

---

### Phase 3: Long Term (1-2 weeks) - Target: RES 90+

#### 3.1 Edge Functions for API Routes (2 days)

**Actions**:

1. **Migrate API Routes to Edge Runtime**

   ```tsx
   // app/api/*/route.ts
   export const runtime = 'edge' // ✅ Edge runtime
   ```

2. **Use Vercel KV for Caching**

   ```tsx
   import { kv } from '@vercel/kv'

   const cached = await kv.get('key')
   if (!cached) {
     const data = await fetchData()
     await kv.set('key', data, { ex: 3600 })
   }
   ```

**Expected Impact**: TTFB 2.03s → 800ms (RES +5 points)

#### 3.2 Implement Request Coalescing (1 day)

**Actions**:

1. **Batch API Requests**

   ```tsx
   const [user, settings, notifications] = await Promise.all([
     fetchUser(),
     fetchSettings(),
     fetchNotifications(),
   ])
   ```

2. **Use SWR for Client-Side Caching**

   ```tsx
   import useSWR from 'swr'

   const { data } = useSWR('/api/user', fetcher, {
     revalidateOnFocus: false,
     dedupingInterval: 60000, // 1 minute
   })
   ```

**Expected Impact**: Reduces waterfalls, faster page loads

#### 3.3 Service Worker Optimizations (2 days)

**Actions**:

1. **Aggressive Precaching**

   ```tsx
   // app/sw.ts
   precacheAndRoute([
     { url: '/', revision: '1' },
     { url: '/pt', revision: '1' },
     { url: '/pt/login', revision: '1' },
   ])
   ```

2. **Offline-First Strategy**
3. **Background Sync for Analytics**

**Expected Impact**: Repeat visits load instantly

#### 3.4 Database Query Optimization (3 days)

**Actions**:

1. **Implement Supabase Query Caching**
2. **Use Prepared Statements**
3. **Add Database Indexes**
4. **Pagination for Large Datasets**

**Expected Impact**: TTFB reduction for dynamic routes

---

## 📈 Expected Results Timeline

| Phase       | Duration  | Target RES | Key Improvements                     |
| ----------- | --------- | ---------- | ------------------------------------ |
| **Current** | -         | 71         | Baseline                             |
| **Phase 1** | 1-2 days  | 80+        | Fix CLS, reduce bundle, edge caching |
| **Phase 2** | 3-5 days  | 85+        | Critical CSS, fonts, images          |
| **Phase 3** | 1-2 weeks | 90+        | Edge functions, SW, database         |

---

## 🎯 Priority Actions (Start TODAY)

### Immediate (< 2 hours)

1. ✅ **Add `width`/`height` to all images** (Fix CLS)
2. ✅ **Enable font `display: swap`** (Fix FOIT)
3. ✅ **Lazy load PDF/Chart libs** (Reduce bundle)
4. ✅ **Add ISR to landing pages** (Cache at edge)

### This Week (< 1 day)

5. ✅ **Tree-shake Lucide icons**
6. ✅ **Delay PostHog initialization**
7. ✅ **Optimize agent avatar images**
8. ✅ **Add blur placeholders to hero images**

---

## 📊 Monitoring & Testing

### Tools

1. **Vercel Speed Insights** (Current: Active)
2. **Lighthouse CI** (Add to GitHub Actions)
3. **WebPageTest** (Manual testing)
4. **Chrome DevTools** (Local profiling)

### Metrics to Track

- ✅ RES (Target: 90+)
- ✅ TTFB (Target: < 600ms)
- ✅ LCP (Target: < 2.5s)
- ✅ CLS (Target: < 0.1)
- ✅ FCP (Target: < 1.8s)

### Testing Checklist

```bash
# 1. Build locally
npm run build

# 2. Analyze bundle
ANALYZE=true npm run build

# 3. Test production build
npm run start

# 4. Run Lighthouse
npm run lighthouse

# 5. Check Vercel deployment
# Visit: https://vercel.com/cidadao-ai-frontend/speed-insights
```

---

## 🚨 Known Bottlenecks

### 1. Backend API Latency

- **Issue**: Railway backend has ~500ms latency
- **Impact**: Affects `/pt/app/*` routes
- **Solution**: Cache responses, use edge functions

### 2. Supabase Cold Starts

- **Issue**: Supabase queries slow on cold start
- **Impact**: First request to auth routes
- **Solution**: Keep-alive requests, connection pooling

### 3. Third-Party Scripts

- **Issue**: PostHog, Vercel Analytics block rendering
- **Impact**: FCP, LCP
- **Solution**: Defer loading, use Web Workers

---

## 📝 Implementation Notes

### Code Review Required

Before implementing optimizations, review:

1. **Image Usage**: Inventory all images needing dimensions
2. **Component Lazy Loading**: Identify heavy components
3. **API Calls**: Map all server-side data fetching
4. **Third-Party Scripts**: Audit analytics, tracking

### Testing Strategy

1. **Local Testing**: Lighthouse on localhost:3000
2. **Preview Deployment**: Test on Vercel preview URL
3. **Production**: Monitor Vercel Speed Insights
4. **Regression**: Ensure features still work

### Rollback Plan

```bash
# If performance degrades:
git revert <commit-hash>
vercel rollback
```

---

## 🎓 Resources

- [Vercel Speed Insights Docs](https://vercel.com/docs/speed-insights)
- [Next.js Performance Optimization](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals Guide](https://web.dev/vitals/)
- [Lighthouse Performance Scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/)

---

## ✅ Success Criteria

### Definition of Done

- [ ] RES Desktop: 90+
- [ ] RES Mobile: 85+
- [ ] TTFB: < 600ms (P75)
- [ ] LCP: < 2.5s (P75)
- [ ] CLS: < 0.1 (P75)
- [ ] FCP: < 1.8s (P75)
- [ ] INP: < 200ms (P75)
- [ ] All routes: RES > 75

### Validation

```bash
# Run full test suite
npm run test
npm run test:playwright
npm run lighthouse

# Check production metrics
# Vercel Speed Insights > 7-day average
```

---

## 📅 Changelog

### 2025-11-11 - Initial Analysis

- Identified critical performance issues
- Created optimization roadmap
- Prioritized quick wins for immediate impact

### Next Review: 2025-11-14

- Measure Phase 1 improvements
- Adjust strategy based on results
