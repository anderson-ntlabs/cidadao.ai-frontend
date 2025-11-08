# Phase 1B CLS Analysis - Dashboard

**Date**: 2025-11-07  
**Target**: /pt/app (Dashboard Home)  
**Current CLS**: 0.97 (PostHog)  
**Target CLS**: <0.1

## CLS Sources Identified

### 1. Quick Stats Cards (Lines 155-181)

**Impact**: HIGH  
**Current**: No skeleton, cards pop in after data loads  
**Issue**: Grid layout shifts when 4 cards render  
**Solution**: Skeleton with exact GlassCard dimensions

```typescript
// Current: No loading state
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
  {quickStats.map((stat, index) => (
    <GlassCard key={index} className="p-6">
      // Content pops in suddenly
    </GlassCard>
  ))}
</div>

// Target: Reserved space with skeleton
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
  {isLoading ? (
    <QuickStatsSkeleton count={4} />
  ) : (
    // Real cards
  )}
</div>
```

### 2. Navigation Cards (Lines 184-294)

**Impact**: MEDIUM  
**Current**: No skeleton, large cards shift layout  
**Issue**: Grid (md:grid-cols-2) causes significant shift  
**Solution**: Skeleton matching GlassCard with exact padding

```typescript
// Need skeleton with:
// - GlassCard wrapper
// - p-6 padding
// - Icon space (p-3 rounded-xl)
// - Title (text-xl)
// - Description (mb-4)
// - Footer stats
```

### 3. Recent Activity Feed (Lines 297-364)

**Impact**: HIGH  
**Current**: Activity items render without height reservation  
**Issue**: 4 activity items, each ~80px, = 320px shift  
**Solution**: Skeleton list with 4 items, exact dimensions

```typescript
// Current: Immediate render
<GlassCard>
  <GlassCardContent className="p-0">
    <div className="divide-y">
      {activities.map(...)} // Pops in
    </div>
  </GlassCardContent>
</GlassCard>

// Target: Reserved list
{isLoading ? (
  <ActivityFeedSkeleton items={4} />
) : (
  // Real activity
)}
```

### 4. Quick Actions Card (Lines 367-396)

**Impact**: LOW  
**Current**: Static buttons, no loading state  
**Note**: Less critical, buttons are small  
**Solution**: Can skip or add simple skeleton

## Component Strategy

### New Skeleton Components Needed

1. **QuickStatsSkeleton** (`components/dashboard/quick-stats-skeleton.tsx`)
   - Props: `count` (default 4)
   - Matches GlassCard p-6
   - Height: ~112px (measured from real card)
   - Grid layout: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4

2. **NavigationCardSkeleton** (`components/dashboard/navigation-card-skeleton.tsx`)
   - Matches GlassCard with p-6 content
   - Height: ~200px (icon + title + desc + footer)
   - Grid: md:grid-cols-2

3. **ActivityFeedSkeleton** (`components/dashboard/activity-feed-skeleton.tsx`)
   - Wraps in GlassCard
   - 4 items with divide-y
   - Each item: px-6 py-4, ~80px height
   - Total: ~320px + card padding

### Dashboard Loading Flow

```typescript
export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate data fetch
    setTimeout(() => setIsLoading(false), 500)
  }, [])

  return (
    <div>
      {/* Stats */}
      {isLoading ? <QuickStatsSkeleton /> : <QuickStats />}

      {/* Navigation */}
      {isLoading ? <NavigationCardSkeleton /> : <NavigationCards />}

      {/* Activity */}
      {isLoading ? <ActivityFeedSkeleton /> : <ActivityFeed />}
    </div>
  )
}
```

## Measurements

### GlassCard Dimensions

- Base padding: `p-6` = 24px
- GlassCard default: rounded-xl, backdrop-blur
- Border: 1px border-gray-200/20

### Quick Stats Card

```
p-6 (24px padding)
├─ Icon row (mb-2): ~32px
├─ Value (text-2xl mb-1): ~40px
└─ Label (text-sm): ~20px
Total content: ~92px
With padding: ~140px (p-6 top+bottom = 48px)
```

### Navigation Card

```
p-6 (24px padding)
├─ Icon row (mb-4): ~56px (p-3 icon box)
├─ Title (text-xl mb-2): ~32px
├─ Description (mb-4): ~48px (2 lines)
└─ Footer stats: ~24px
Total content: ~160px
With padding: ~208px
```

### Activity Item

```
px-6 py-4 (24px + 16px)
├─ Icon: w-5 h-5 (20px)
├─ Title + desc: ~48px
Total: ~80px per item
```

## Implementation Order

1. ✅ Analysis documented
2. ✅ Create QuickStatsSkeleton (commit: 3a33711)
3. ✅ Create NavigationCardSkeleton (commit: 34b1c61)
4. ✅ Create ActivityFeedSkeleton (commit: 4d86d08)
5. ✅ Create barrel export (commit: 173178e)
6. ✅ Update HomePage to use skeletons (commit: e5f4970)
7. ⏳ Test CLS reduction (next)
8. ⏳ Commit and push branch

## Expected CLS Reduction

**Before**: 0.97  
**After Quick Stats**: ~0.75 (-22%)  
**After Navigation**: ~0.50 (-25%)  
**After Activity**: ~0.15 (-35%)  
**After All**: <0.1 (-90%)

Total layout shift prevented: ~700px of sudden content
