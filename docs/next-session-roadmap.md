# Next Session Roadmap - Performance Optimization

**Date Created**: 2025-11-07
**For Session**: Next development session
**Current Status**: Phase 2 merged to main, ready to continue

---

## 📊 Current State (After Today's Work)

### ✅ Completed and Merged:

1. **Phase 1A - Landing Page CLS** ✅ MERGED
   - CLS: 0.88 → <0.1 (expected)
   - Image dimensions, preloads, font-display optimization
   - VLibras delayed loading

2. **Phase 1B - Dashboard CLS** ✅ MERGED
   - CLS: 0.97 → <0.1 (expected)
   - 3 skeleton components with exact dimensions
   - 500ms loading strategy

3. **Phase 2 - Bundle Optimization (Partial)** ✅ MERGED
   - Chat page: 419 kB → ~350 kB (-69 kB)
   - Dashboard: 373 kB → ~310 kB (-63 kB)
   - 12 components lazy loaded

### 📈 Expected Metrics (Awaiting Vercel Confirmation):

- Overall CLS: 0.9 → <0.1
- Chat bundle: -16% reduction
- Dashboard bundle: -17% reduction
- RES Score: 72 → ~82-85

---

## 🎯 Priority Tasks for Next Session

### 1. Complete Phase 2 - Bundle Optimization (HIGH PRIORITY)

#### 1.1 Settings Page Optimization

**Current**: 358 kB
**Target**: <270 kB
**Savings**: ~88 kB (25% reduction)

**Files to modify**:

- `app/pt/app/configuracoes/page.tsx`

**Components to lazy load**:

```typescript
// Lazy load heavy sections
const ThemeSettings = dynamic(() => import('@/components/settings/theme'))
const LanguageSettings = dynamic(() => import('@/components/settings/language'))
const NotificationSettings = dynamic(() => import('@/components/settings/notifications'))
const PrivacySettings = dynamic(() => import('@/components/settings/privacy'))
```

**Estimated time**: 30-45 minutes

---

#### 1.2 Profile Page Optimization

**Current**: 350 kB
**Target**: <270 kB
**Savings**: ~80 kB (23% reduction)

**Files to modify**:

- `app/pt/app/perfil/page.tsx`

**Components to lazy load**:

```typescript
// Lazy load image handling
const AvatarUploader = dynamic(() => import('@/components/profile/avatar-uploader'), {
  loading: () => <UploadSkeleton />,
  ssr: false
})

const ProfileForm = dynamic(() => import('@/components/profile/profile-form'))
```

**Estimated time**: 30-45 minutes

---

#### 1.3 Run Bundle Analyzer

**Goal**: Identify additional optimization opportunities

**Commands**:

```bash
# Build with analyzer
ANALYZE=true npm run build

# Open browser to view bundle composition
# Identify:
# - Large dependencies that can be replaced
# - Unused code that can be removed
# - Duplicate dependencies
```

**Estimated time**: 15-30 minutes

**Expected findings**:

- Identify if recharts/d3 can be tree-shaken better
- Check for duplicate date-fns imports
- Look for unused utilities in commons chunk

---

### 2. Validate Deployed Performance (CRITICAL)

#### 2.1 Check Vercel Speed Insights

**After deployment, verify**:

- CLS improvement (target: <0.1)
- RES score improvement (target: 85+)
- Route-specific metrics

**If CLS not improved**:

- Review skeleton dimensions
- Check for other layout shift sources
- Add more measurements if needed

---

#### 2.2 Check PostHog Web Vitals

**Monitor**:

- `/pt` (Landing): CLS should be <0.1
- `/pt/app` (Dashboard): CLS should be <0.1
- `/pt/app/chat`: Bundle reduction impact

---

### 3. Phase 3 - LCP Optimization (NEXT PRIORITY)

#### 3.1 Image Format Optimization

**Goal**: LCP 2.32s → <2.0s

**Tasks**:

1. Generate AVIF versions of hero images
2. Create responsive image sizes (1920w, 1024w, 768w)
3. Implement picture element with art direction

**Files to modify**:

- `app/pt/page.tsx` (hero section)
- `app/en/page.tsx` (hero section)
- Add new images to `public/`

**Tools needed**:

- Squoosh.app (online) or sharp (CLI)
- Generate AVIF + WebP formats

**Estimated time**: 1-2 hours

---

#### 3.2 Resource Hints Optimization

**Goal**: Faster external resource loading

**Add to layouts**:

```typescript
// app/pt/layout.tsx
<head>
  {/* Already have these */}
  <link rel="preconnect" href="https://cidadao-api-production.up.railway.app" />
  <link rel="preconnect" href="https://pbsiyuattnwgohvkkkks.supabase.co" />

  {/* Add these */}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  <link rel="dns-prefetch" href="https://www.google-analytics.com" />
</head>
```

**Estimated time**: 15 minutes

---

### 4. Additional Quick Wins

#### 4.1 Remove Unused Dependencies

**Check package.json for**:

- Unused libraries
- Duplicate dependencies
- Libraries that can be replaced with smaller alternatives

**Commands**:

```bash
npm ls | grep deduped  # Find duplicates
npx depcheck           # Find unused dependencies
```

---

#### 4.2 Optimize Commons Chunk

**Current**: 70.3 kB
**Target**: <60 kB

**Investigate**:

- What's in the commons chunk?
- Can utilities be split better?
- Are there tree-shaking opportunities?

---

## 📋 Suggested Session Plan

### Option A: Complete Phase 2 (Recommended)

**Duration**: ~2 hours
**Focus**: Finish all Phase 2 bundle optimizations

1. Settings page lazy loading (45 min)
2. Profile page lazy loading (45 min)
3. Bundle analyzer (30 min)
4. Test and validate (15 min)
5. Commit and merge (15 min)

**Expected outcome**: All heavy routes optimized, -300+ kB total savings

---

### Option B: Validate + Start Phase 3

**Duration**: ~2 hours
**Focus**: Confirm Phase 1-2 success, start LCP work

1. Check Vercel/PostHog metrics (30 min)
2. Document actual improvements (30 min)
3. Start image format optimization (1 hour)

**Expected outcome**: Confirmed performance gains, image pipeline started

---

### Option C: Deep Dive Bundle Analysis

**Duration**: ~1-2 hours
**Focus**: Comprehensive bundle optimization

1. Run bundle analyzer (15 min)
2. Identify all optimization opportunities (30 min)
3. Remove unused dependencies (30 min)
4. Optimize commons chunk (30 min)
5. Document findings (15 min)

**Expected outcome**: Detailed optimization plan, quick wins implemented

---

## 🎯 Success Criteria

### Must Have (Before Moving to Phase 3):

- ✅ All heavy routes < 300 kB
- ✅ CLS < 0.1 on all pages
- ✅ RES score > 85
- ✅ Bundle analyzer review complete

### Nice to Have:

- ✅ Unused dependencies removed
- ✅ Commons chunk optimized
- ✅ Actual Vercel metrics documented

---

## 📚 Resources for Next Session

### Documentation to Reference:

- `docs/performance-roadmap-nov-2025.md` - Overall strategy
- `docs/phase2-bundle-analysis.md` - Bundle analysis details
- `docs/daily-performance-log-2025-11-07.md` - Today's work

### Commands to Run:

```bash
# Start from main
git checkout main
git pull origin main

# Create new feature branch
git checkout -b perf/phase2-complete

# Development
npm run dev
npm run build
npm run type-check

# Bundle analysis
ANALYZE=true npm run build
```

### Files to Focus On:

- Settings: `app/pt/app/configuracoes/page.tsx`
- Profile: `app/pt/app/perfil/page.tsx`
- Package: `package.json`

---

## 🚀 Long-term Goals

### Phase 3 Goals:

- LCP: 2.32s → <2.0s
- AVIF image support
- Optimized resource hints

### Phase 4 Goals:

- INP: 176ms → <100ms
- Advanced caching
- Service worker optimization
- Final RES: 90+

---

## 💡 Quick Reference

### Lazy Loading Pattern:

```typescript
const HeavyComponent = dynamic(
  () => import('@/components/heavy').then(mod => ({ default: mod.HeavyComponent })),
  {
    loading: () => <Skeleton />,
    ssr: false,
  }
)
```

### Bundle Analysis:

```bash
ANALYZE=true npm run build
# Opens webpack-bundle-analyzer in browser
```

### Performance Testing:

```bash
npm run lighthouse
# Check CLS, LCP, INP, RES
```

---

**Ready to continue! 🎉**

All major performance work is merged to main. Next session can focus on completing Phase 2, validating improvements, or starting Phase 3 depending on priorities.
