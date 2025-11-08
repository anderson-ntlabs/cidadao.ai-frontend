# Phase 2 Bundle Analysis - Code Splitting & Optimization

**Date**: 2025-11-07
**Branch**: perf/phase2-bundle-optimization
**Goal**: Reduce JavaScript bundle size and improve load times

## Current Bundle Analysis

### Shared Baseline (All Routes)

- **Total**: 234 kB (gzipped)
  - `commons-a31a76e5c42eb64d.js`: 70.3 kB
  - `npm.next-063a43d71a1c36b2.js`: 158 kB (Next.js framework)
  - Other shared chunks: 5.36 kB

### Route-Specific Sizes (First Load JS)

#### 🔴 Largest Routes (Optimization Priority)

1. **/pt/app/chat**: **419 kB** (19.8 kB route-specific)
   - Issue: Chat interface with streaming, adapters, stores
   - Opportunity: Lazy load chat components

2. **/pt/app/configuracoes**: **358 kB** (2.59 kB route-specific)
   - Issue: Settings page loading heavy dependencies
   - Opportunity: Code split form components

3. **/pt/app/atividades**: **357 kB** (2.16 kB route-specific)
   - Issue: Activity feed with infinite scroll
   - Opportunity: Virtual scrolling or pagination

4. **/pt/app/dashboard**: **373 kB** (4.21 kB route-specific)
   - Issue: Dashboard with charts and visualizations
   - Opportunity: Lazy load chart libraries

5. **/pt/app/perfil**: **350 kB** (4.47 kB route-specific)
   - Issue: Profile page with forms and image upload
   - Opportunity: Lazy load upload components

#### 🟡 Medium Routes (Secondary Priority)

6. **/pt**: **321 kB** (5.82 kB route-specific) - Landing page
7. **/pt/app/investigacoes/[id]**: **325 kB** (6.66 kB route-specific)
8. **/pt/app/investigacoes**: **322 kB** (3.82 kB route-specific)

#### 🟢 Optimized Routes (Reference)

- **/pt/login**: 293 kB (1.81 kB route-specific) ✅
- Most other routes: 234-260 kB ✅

## Optimization Opportunities

### 1. Chat Page Optimization (HIGH PRIORITY)

**Current**: 419 kB
**Target**: <300 kB
**Savings**: ~119 kB (28% reduction)

#### Issues:

- Chat interface loads immediately
- All adapters imported upfront
- Streaming components not lazy loaded
- Agent selection components always loaded

#### Solutions:

```typescript
// app/pt/app/chat/page.tsx

// Before: Static imports
import { ChatInterface } from '@/components/chat/chat-interface'
import { AgentSelector } from '@/components/chat/agent-selector'
import { StreamingMessage } from '@/components/chat/streaming-message'

// After: Dynamic imports
const ChatInterface = dynamic(() => import('@/components/chat/chat-interface'))
const AgentSelector = dynamic(() => import('@/components/chat/agent-selector'))
const StreamingMessage = dynamic(() => import('@/components/chat/streaming-message'))
```

### 2. Dashboard Charts Optimization (HIGH PRIORITY)

**Current**: 373 kB
**Target**: <280 kB
**Savings**: ~93 kB (25% reduction)

#### Issues:

- Chart libraries (recharts/d3) loaded immediately
- All chart components imported upfront
- Visualization libraries for all chart types

#### Solutions:

```typescript
// app/pt/app/dashboard/page.tsx

// Before: All charts imported
import { LineChart, BarChart, PieChart } from 'recharts'

// After: Lazy load chart library
const ChartsBundle = dynamic(() => import('@/components/charts'), {
  loading: () => <ChartSkeleton />,
  ssr: false // Charts don't need SSR
})
```

### 3. Settings Page Optimization (MEDIUM PRIORITY)

**Current**: 358 kB
**Target**: <270 kB
**Savings**: ~88 kB (25% reduction)

#### Issues:

- All form components loaded immediately
- Validation libraries imported upfront
- Theme picker, language selector always loaded

#### Solutions:

```typescript
// app/pt/app/configuracoes/page.tsx

// Lazy load heavy sections
const ThemeSettings = dynamic(() => import('@/components/settings/theme'))
const LanguageSettings = dynamic(() => import('@/components/settings/language'))
const NotificationSettings = dynamic(() => import('@/components/settings/notifications'))
```

### 4. Profile Page Optimization (MEDIUM PRIORITY)

**Current**: 350 kB
**Target**: <270 kB
**Savings**: ~80 kB (23% reduction)

#### Issues:

- Image upload/cropper library loaded immediately
- Avatar editor components always loaded
- Form validation libraries upfront

#### Solutions:

```typescript
// app/pt/app/perfil/page.tsx

// Lazy load image handling
const AvatarUploader = dynamic(() => import('@/components/profile/avatar-uploader'), {
  loading: () => <UploadSkeleton />,
  ssr: false
})
```

### 5. Commons Chunk Optimization (LOW PRIORITY)

**Current**: 70.3 kB
**Target**: <60 kB
**Savings**: ~10 kB (14% reduction)

#### Investigate:

- What's in commons chunk?
- Can we split it further?
- Are there unused utilities?

```bash
# Analyze with webpack-bundle-analyzer
ANALYZE=true npm run build
```

## Implementation Strategy

### Phase 2A: Chat & Dashboard (2-3 hours)

1. Lazy load chat components
2. Lazy load chart libraries
3. Add loading skeletons
4. Test performance impact

**Expected**:

- Chat: 419 kB → <300 kB
- Dashboard: 373 kB → <280 kB
- Combined savings: ~212 kB

### Phase 2B: Settings & Profile (1-2 hours)

1. Lazy load settings sections
2. Lazy load image uploader
3. Code split form components
4. Test performance impact

**Expected**:

- Settings: 358 kB → <270 kB
- Profile: 350 kB → <270 kB
- Combined savings: ~168 kB

### Phase 2C: Vendor Chunk Analysis (1 hour)

1. Run bundle analyzer
2. Identify large dependencies
3. Look for alternatives or tree-shaking opportunities
4. Remove unused dependencies

## Expected Overall Impact

### Before Phase 2

- Largest route: 419 kB (Chat)
- Average route: ~310 kB
- Total shared: 234 kB

### After Phase 2

- Largest route: <300 kB (all routes)
- Average route: ~270 kB
- Total shared: <230 kB (if possible)

### Performance Gains

- **Bundle Size**: -25-30% on heavy routes
- **First Load**: Faster initial page load
- **INP**: Better interaction responsiveness
- **LCP**: Improved due to less JS parsing
- **RES Score**: +5-8 points (from reduced JS)

## Next Steps

1. ✅ Create Phase 2 branch
2. ⏳ Implement chat page lazy loading
3. ⏳ Implement dashboard lazy loading
4. ⏳ Test with Lighthouse
5. ⏳ Implement settings/profile lazy loading
6. ⏳ Run bundle analyzer
7. ⏳ Commit granularly
8. ⏳ Merge to main
