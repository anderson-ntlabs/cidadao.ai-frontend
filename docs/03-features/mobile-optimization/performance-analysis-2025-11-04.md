# Performance Analysis - Sprint 4 Days 1-2

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data de Criação**: 2025-11-04 11:30:00 -0300

---

## Overview

This document presents the performance analysis conducted during Sprint 4 of the Mobile Optimization Roadmap. The goal is to identify performance bottlenecks and create an actionable optimization plan.

## Build Analysis Results

### Production Build Output (npm run build)

```
Route (app)                                Size     First Load JS
├ ○ /pt/app/mapa                          45.8 kB  271.8 kB (LARGEST)
├ ○ /pt/app/chat                          19.3 kB  245.3 kB
├ ○ /pt/app/dashboard                     4.21 kB  230.2 kB
├ ○ /pt/app/perfil                        4.47 kB  230.5 kB
├ ○ /pt/app/investigacoes                 3.82 kB  229.8 kB
└ ○ ... (37 other pages)

First Load JS shared by all:               226 kB
├ chunks/commons-8c37b551dd083361.js       62.5 kB
├ chunks/npm.next-b491751083eb5e63.js      158 kB (70% of shared)
└ other shared chunks (total)              5.28 kB

Middleware:                                72.1 kB
```

### Key Findings

#### 🔴 Critical Issues

1. **Page: /pt/app/mapa (45.8 kB)**
   - **Issue**: Largest individual page bundle
   - **Root Cause**: `framer-motion` library imported directly
   - **Impact**: +271.8 kB First Load JS
   - **Priority**: HIGH
   - **Solution**: Lazy load framer-motion + code split map page

2. **Page: /pt/app/chat (19.3 kB)**
   - **Issue**: Second largest page bundle
   - **Root Cause**: Multiple chat adapters loaded upfront
   - **Impact**: +245.3 kB First Load JS
   - **Priority**: MEDIUM
   - **Solution**: Dynamic imports for chat adapters

3. **Shared Bundle (226 kB)**
   - **Issue**: Large shared JavaScript bundle
   - **Root Cause**: `npm.next-b491751083eb5e63.js` at 158 kB (70%)
   - **Impact**: All pages load this bundle
   - **Priority**: MEDIUM
   - **Solution**: Analyze and split large dependencies

4. **Middleware (72.1 kB)**
   - **Issue**: Heavy middleware bundle
   - **Root Cause**: To be investigated
   - **Impact**: Runs on every request
   - **Priority**: LOW
   - **Solution**: Audit middleware dependencies

#### 🟡 Moderate Issues

5. **GeoJSON Data Loading**
   - **Issue**: `/brazil-states.json` loaded client-side
   - **Impact**: Additional network request + parsing time
   - **Priority**: LOW
   - **Solution**: Consider preloading or bundling critical data

#### 🟢 Good Practices Observed

1. **Code Splitting**: Next.js automatically splits routes
2. **Static Pages**: 42 static pages generated at build time
3. **Reasonable Page Sizes**: Most pages under 5 kB (except mapa/chat)
4. **Shared Chunks**: Common code properly extracted

## Detailed Analysis

### 1. Mapa Page (271.8 kB Total)

**File**: `app/pt/app/mapa/page.tsx`

**Dependencies Identified**:

- `framer-motion`: Animation library (~25-30 kB gzipped)
- Custom GeoJSON rendering logic
- State management for interactive map
- SVG path calculations

**Usage Analysis**:

```typescript
import { motion } from 'framer-motion' // Line 15

// Used for:
// 1. Stats cards animation (lines 338-376)
// 2. State info panel animation (lines 481-566)
// 3. Tooltip animation (lines 582-686)
```

**Optimization Opportunities**:

1. **Lazy load framer-motion**: Only load when user interacts
2. **Replace with CSS animations**: For simple fade-in effects
3. **Code split entire page**: Load map component on-demand
4. **Virtualize state list**: If showing all 27 states

**Expected Impact**:

- Lazy loading framer-motion: -25-30 kB (~10% reduction)
- CSS animations replacement: -30 kB (~11% reduction)
- Combined approach: -35 kB total (~13% reduction)

### 2. Chat Page (245.3 kB Total)

**File**: `app/pt/app/chat/page.tsx`

**Dependencies (to be analyzed)**:

- Multiple chat adapters (v1, v2, v3, simple, stable, optimized)
- Chat store (Zustand)
- Agent selection logic
- SSE streaming implementation

**Optimization Opportunities**:

1. **Dynamic adapter loading**: Load adapter only when needed
2. **Code split chat components**: Lazy load message list, input area
3. **Defer non-critical features**: Load export, search on-demand

**Expected Impact**:

- Dynamic adapters: -10-15 kB (~6% reduction)
- Component splitting: -5-8 kB (~3% reduction)
- Combined: -15-23 kB (~9% reduction)

### 3. Shared Bundle Analysis (226 kB)

**Large Chunk**: `chunks/npm.next-b491751083eb5e63.js` (158 kB)

**Suspected Dependencies** (requires webpack bundle analyzer):

- React + React DOM
- Next.js runtime
- Zustand (state management)
- Supabase client
- UI components library
- Utility libraries (date-fns, clsx, etc.)

**Optimization Opportunities**:

1. **Analyze with webpack-bundle-analyzer**: Identify largest modules
2. **Replace heavy dependencies**: Consider lighter alternatives
3. **Tree shaking audit**: Ensure unused code is eliminated
4. **Module externalization**: For rarely-used features

**Expected Impact**:

- Dependency replacement: -10-20 kB (~6-9% reduction)
- Tree shaking: -5-10 kB (~3-4% reduction)

### 4. Middleware (72.1 kB)

**Location**: Likely `middleware.ts` at project root

**Optimization Opportunities**:

1. **Audit imports**: Remove unnecessary dependencies
2. **Defer non-critical logic**: Only run on protected routes
3. **Minimize regex operations**: Optimize path matching

**Expected Impact**:

- Import optimization: -5-10 kB (~7-14% reduction)

## Lighthouse Audit Results

**Status**: ⚠️ **COMPLETED - INVALID RESULTS**

### Configuration Issue Identified

The Lighthouse audit completed but produced invalid results due to configuration problems:

**Current Configuration**:

```json
{
  "preset": "desktop", // ❌ Should be "mobile" for mobile optimization
  "throttlingMethod": "simulate",
  "screenEmulation": {
    "mobile": false, // ❌ Should be true
    "width": 1350,
    "height": 940
  }
}
```

**Invalid Results Received**:

```
Performance Score: 42% (38-42% range)
First Contentful Paint: 50.2 seconds (!!)
Time to Interactive: 53.3 seconds (!!)
SEO Score: 58%
Duplicated JavaScript: 100% failure
Forced Reflow: 100% failure
```

### Problem Analysis

These numbers are **NOT representative of real performance**:

1. **50+ second FCP**: Indicates timeout or blocking resource
   - Normal FCP should be <3s even on slow devices
   - This suggests server startup issue or infinite wait
   - Possibly authentication redirect or blocking script

2. **Desktop preset used**: Incorrect for mobile optimization analysis
   - Should use mobile device emulation (Moto G4)
   - Should use mobile network throttling (Slow 4G)
   - Current setup tests desktop experience

3. **Test URLs**: Only testing `/pt` and `/pt/login`
   - Missing critical pages: `/pt/app/mapa`, `/pt/app/chat`
   - Need to test heavy pages for real impact

### Required Configuration Changes

**File**: `lighthouserc.json`

**Changes needed**:

1. Change preset from "desktop" to "mobile"
2. Add mobile device emulation
3. Add network throttling
4. Expand test URLs to include:
   - `/pt/app/mapa` (heaviest page - 271.8 kB)
   - `/pt/app/chat` (second heaviest - 245.3 kB)
   - `/pt/app/dashboard`

**Target mobile configuration**:

```json
{
  "preset": "mobile",
  "throttling": {
    "rttMs": 150,
    "throughputKbps": 1600,
    "cpuSlowdownMultiplier": 4
  },
  "screenEmulation": {
    "mobile": true,
    "width": 360,
    "height": 640,
    "deviceScaleFactor": 2
  }
}
```

### Next Steps for Valid Lighthouse Results

1. ✅ Update `lighthouserc.json` with mobile configuration
2. ⏳ Re-run Lighthouse with correct mobile emulation
3. ⏳ Test all heavy pages (mapa, chat, dashboard)
4. ⏳ Analyze real performance bottlenecks
5. ⏳ Create evidence-based optimization plan

**Note**: Current results are **discarded** as invalid. Sprint 4 performance analysis will continue after configuration fix.

## Optimization Plan

### Priority 1: High Impact (Week 5 Days 1-2)

#### 1.1 Lazy Load Framer Motion in Mapa Page

**Implementation**:

```typescript
// Before
import { motion } from 'framer-motion'

// After
import dynamic from 'next/dynamic'

const MotionDiv = dynamic(() => import('framer-motion').then((mod) => mod.motion.div), {
  ssr: false,
})
```

**Expected Results**:

- Bundle reduction: -30 kB
- FCP improvement: -200ms
- Impact: 10-12% faster initial load

**Effort**: 2 hours
**Risk**: Low (isolated change)

#### 1.2 Replace Simple Animations with CSS

**Implementation**:
Replace framer-motion for simple fade-in effects:

```css
/* Add to globals.css */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out;
}
```

**Expected Results**:

- No JS needed for simple animations
- Better mobile performance
- Smoother 60fps animations

**Effort**: 3 hours
**Risk**: Low (progressive enhancement)

### Priority 2: Medium Impact (Week 5 Days 3-4)

#### 2.1 Dynamic Chat Adapter Loading

**Implementation**:

```typescript
// Before
import { ChatAdapterV1, ChatAdapterV2, ChatAdapterV3 } from '@/lib/api'

// After
const loadAdapter = async (version: string) => {
  switch (version) {
    case 'v1':
      return (await import('@/lib/api/chat-adapter-v1')).ChatAdapterV1
    case 'v2':
      return (await import('@/lib/api/chat-adapter-v2')).ChatAdapterV2
    // ...
  }
}
```

**Expected Results**:

- Bundle reduction: -15 kB
- Faster chat page load
- Better code organization

**Effort**: 4 hours
**Risk**: Medium (need to test all adapters)

#### 2.2 Code Split Map Page Components

**Implementation**:

```typescript
// Lazy load heavy components
const InteractiveMap = dynamic(() => import('@/components/interactive-map'), {
  loading: () => <MapSkeleton />,
  ssr: false
})
```

**Expected Results**:

- Defer heavy SVG calculations
- Show UI shell faster
- Better perceived performance

**Effort**: 3 hours
**Risk**: Low (with proper skeleton)

### Priority 3: Long-term Optimizations (Week 6+)

#### 3.1 Image Optimization Audit

- Convert PNG to AVIF/WebP
- Implement responsive images
- Add lazy loading to images
- Use Next.js Image component

#### 3.2 Bundle Analyzer Deep Dive

- Run webpack-bundle-analyzer
- Identify duplicate dependencies
- Replace heavy libraries
- Improve tree shaking

#### 3.3 Critical CSS Extraction

- Inline critical CSS for above-the-fold content
- Defer non-critical stylesheets
- Reduce CSS bundle size

## Performance Targets

### Current State (Estimated)

- Bundle Size: 271.8 kB (largest page)
- First Load: ~2-3s (4G, low-end mobile)
- Performance Score: TBD (waiting Lighthouse)

### Target State (After Sprint 4)

- Bundle Size: <230 kB (15% reduction)
- First Load: <1.8s (25-40% faster)
- Performance Score: 90+ (Lighthouse mobile)

### Success Metrics

- ✅ Mapa page: <40 kB individual bundle
- ✅ Chat page: <15 kB individual bundle
- ✅ Shared bundle: <210 kB
- ✅ LCP: <2.5s on Moto G4 slow 4G
- ✅ TBT: <200ms
- ✅ CLS: <0.1

## Next Steps

1. ✅ **Complete Lighthouse audit** (in progress)
2. **Review Lighthouse results** (when available)
3. **Implement Priority 1 optimizations** (framer-motion lazy loading)
4. **Test performance improvements** (re-run Lighthouse)
5. **Implement Priority 2 optimizations** (chat adapters)
6. **Final performance validation** (before Sprint 5)

## References

- [Next.js Performance Best Practices](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web.dev Performance](https://web.dev/performance/)
- [Framer Motion Performance](https://www.framer.com/motion/guide-reduce-bundle-size/)
- [Bundle Size Optimization](https://nextjs.org/docs/advanced-features/dynamic-import)

---

**Document Status**: Work in Progress
**Last Updated**: 2025-11-04 11:30:00 -0300
**Next Review**: After Lighthouse audit completion
