# Sprint 5: Mobile Features Implementation - Planning

**Author**: Anderson Henrique da Silva
**Location**: Minas Gerais, Brasil
**Date**: 2025-11-05
**Sprint Duration**: 6 days
**Status**: 🚀 Starting

---

## Executive Summary

Sprint 5 focuses on implementing the mobile features validated by the 660 device tests from Sprint 4. Goal is to increase pass rate from **12% to 77%** (506/660 tests passing).

### Sprint 4 Results Recap

- **Baseline Established**: 79/660 tests passing (12%)
- **Infrastructure Working**: PWA manifest, service worker, navigation drawer basics
- **Implementation Needed**: Mobile chat UI (132 tests), bottom navigation (165 tests), mobile menu trigger (143 tests)

### Sprint 5 Goals

**Primary Goal**: Implement critical mobile features to achieve 77% test pass rate

**Success Criteria**:

- ✅ Mobile chat UI fully functional (132 tests passing)
- ✅ Bottom navigation integrated (165 tests passing)
- ✅ Mobile menu trigger working (143 tests passing)
- ✅ Virtual keyboard handling implemented
- ✅ 506/660 tests passing (77% pass rate)

---

## Priority Breakdown

### P0 - Critical (Days 1-4)

#### 1. Mobile Chat UI Implementation (Days 1-2.5)

**Current Status**: 0/132 tests passing (0%)
**Target**: 132/132 tests passing (100%)
**Effort**: 2.5 days

**Failing Tests**:

- Display chat interface correctly on mobile
- Handle virtual keyboard appearance
- Send message on mobile
- Touch scroll in chat
- Select agent on mobile
- Tap on suggestion chips
- Show loading state while generating response
- Handle long messages correctly
- Maintain scroll position when keyboard appears
- Adapt to landscape orientation
- Accessible form controls
- Keyboard navigation

**Implementation Plan**:

1. **Create Mobile Chat Container** (0.5 days)
   - Detect mobile viewport
   - Apply mobile-specific layout
   - Safe area inset support
   - Virtual keyboard detection

2. **Implement Input Area** (0.5 days)
   - Fixed position input (bottom)
   - Virtual keyboard handling
   - Auto-grow textarea
   - Touch-optimized send button (56px)
   - Haptic feedback on send

3. **Message List Optimization** (0.5 days)
   - Touch-optimized scrolling
   - Momentum scrolling support
   - Scroll to latest message
   - Long message handling
   - Loading states

4. **Agent Selection Mobile UI** (0.5 days)
   - Mobile-friendly agent selector
   - Touch targets (44px minimum)
   - Smooth animations

5. **Suggestion Chips Mobile** (0.25 days)
   - Touch-optimized chips
   - Horizontal scroll
   - Tap feedback

6. **Testing & Refinement** (0.25 days)
   - Run mobile chat tests
   - Fix any issues
   - Validate all 132 scenarios

**Files to Create/Modify**:

- `components/mobile/mobile-chat-container.tsx` (new)
- `components/mobile/mobile-chat-input.tsx` (new)
- `hooks/use-virtual-keyboard.ts` (new)
- `app/pt/(authenticated)/chat/page.tsx` (modify for mobile detection)

---

#### 2. Virtual Keyboard Handling (Day 3)

**Current Status**: Not implemented
**Target**: Robust keyboard handling across iOS/Android
**Effort**: 1 day

**Issues to Solve**:

1. **iOS Safari**: Fixed position elements jump when keyboard opens
2. **Android Chrome**: Address bar auto-hide changes viewport
3. **Scroll Position**: Input stays visible when keyboard appears
4. **Resize Events**: Detect keyboard open/close

**Implementation Plan**:

1. **Create useVirtualKeyboard Hook** (0.5 days)

   ```typescript
   export function useVirtualKeyboard() {
     const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
     const [keyboardHeight, setKeyboardHeight] = useState(0)

     // visualViewport API for iOS
     // window resize events for Android
     // Return: { isKeyboardOpen, keyboardHeight, scrollToInput }
   }
   ```

2. **Implement Scroll Management** (0.25 days)
   - Scroll input into view when keyboard opens
   - Maintain scroll position
   - Handle iOS quirks (100dvh)

3. **Testing** (0.25 days)
   - Test on all 11 devices
   - Verify input always visible
   - Check scroll behavior

**Files to Create**:

- `hooks/use-virtual-keyboard.ts`
- `lib/utils/keyboard-detection.ts`

---

#### 3. Bottom Navigation Integration (Day 4)

**Current Status**: 15/165 tests passing (9%)
**Target**: 165/165 tests passing (100%)
**Effort**: 1 day

**Failing Tests**:

- Bottom nav display on authenticated pages
- Proper touch targets (56px)
- Active state indication
- Rapid tap handling
- Smooth page transitions
- Swipe gestures
- Badge indicators
- Landscape support

**Implementation Plan**:

1. **Create Bottom Nav Component** (0.25 days)
   - Already exists at `components/mobile/bottom-navigation.tsx`
   - Need to integrate into layout

2. **Integrate into Authenticated Layout** (0.25 days)

   ```tsx
   // app/pt/(authenticated)/layout.tsx
   <BottomNavigation items={navItems} currentPath={pathname} onNavigate={handleNavigate} />
   ```

3. **Add Route Detection** (0.25 days)
   - Detect current page
   - Highlight active tab
   - Badge indicators from notifications

4. **Mobile Detection Logic** (0.25 days)
   - Show bottom nav only on mobile
   - Hide on desktop (use sidebar)
   - Responsive breakpoint: 1024px

**Files to Modify**:

- `app/pt/(authenticated)/layout.tsx`
- `components/mobile/bottom-navigation.tsx` (if needed)

---

#### 4. Mobile Menu Trigger (Day 5)

**Current Status**: 13/143 tests passing (9%)
**Target**: 143/143 tests passing (100%)
**Effort**: 0.5 days

**Failing Tests**:

- Menu button visibility on public pages
- Open menu on tap
- Navigate via menu
- Lock body scroll when menu open
- Menu on all public pages

**Implementation Plan**:

1. **Add Hamburger Button to Public Layout** (0.25 days)

   ```tsx
   // app/pt/layout.tsx (public pages)
   <MobileMenuButton onClick={openDrawer} />
   ```

2. **Connect to Existing NavigationDrawer** (0.25 days)
   - Already working from Sprint 4 Day 3 fix
   - Just needs trigger button on mobile
   - Body scroll lock already implemented

**Files to Modify**:

- `app/pt/layout.tsx`
- `components/mobile-menu-button.tsx` (new, simple component)

---

### P1 - Important (Day 6)

#### 5. Swipe Gestures Enhancement

**Current Status**: Hooks ready, not integrated
**Target**: Working pull-to-refresh, swipeable cards
**Effort**: 0.5 days

**Implementation**:

- Integrate useSwipeGesture into lists
- Add pull-to-refresh to dashboard
- Swipeable investigation cards

---

#### 6. Testing & Validation (Day 6)

**Effort**: 0.5 days

**Activities**:

1. Run full test suite (660 tests)
2. Verify pass rate >= 77%
3. Fix any regressions
4. Document results

---

## Technical Implementation Details

### Mobile Detection Strategy

```typescript
// lib/utils/mobile-detection.ts
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 1024
}

export function isMobileUserAgent(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice())
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}
```

### Virtual Keyboard Detection

```typescript
// hooks/use-virtual-keyboard.ts
export function useVirtualKeyboard() {
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    // iOS: visualViewport API
    if ('visualViewport' in window) {
      const viewport = window.visualViewport!

      const handleResize = () => {
        const height = window.innerHeight - viewport.height
        setKeyboardHeight(height)
        setKeyboardVisible(height > 100) // Threshold for keyboard
      }

      viewport.addEventListener('resize', handleResize)
      return () => viewport.removeEventListener('resize', handleResize)
    }

    // Android: window resize
    const handleResize = () => {
      const currentHeight = window.innerHeight
      const diff = initialHeight - currentHeight
      setKeyboardHeight(diff)
      setKeyboardVisible(diff > 100)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return { keyboardVisible, keyboardHeight }
}
```

### Mobile Chat Layout

```tsx
// components/mobile/mobile-chat-container.tsx
export function MobileChatContainer({ children }: Props) {
  const { keyboardVisible, keyboardHeight } = useVirtualKeyboard()
  const [messageListHeight, setMessageListHeight] = useState('100dvh')

  useEffect(() => {
    if (keyboardVisible) {
      // Adjust message list height to accommodate keyboard
      const height = `calc(100dvh - ${keyboardHeight}px - 60px)` // 60px for input
      setMessageListHeight(height)
    } else {
      setMessageListHeight('calc(100dvh - 60px)')
    }
  }, [keyboardVisible, keyboardHeight])

  return (
    <div className="mobile-chat-container h-screen flex flex-col">
      <div className="message-list flex-1 overflow-y-auto" style={{ height: messageListHeight }}>
        {children}
      </div>

      <MobileChatInput
        className="fixed bottom-0 left-0 right-0"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      />
    </div>
  )
}
```

---

## Expected Test Results

### Before Sprint 5

```
Total Tests: 660
Passed: 79 (12%)
Failed: 569 (86%)
Skipped: 12 (2%)
```

### After Sprint 5 (Target)

```
Total Tests: 660
Passed: 506 (77%)
Failed: 142 (21%)
Skipped: 12 (2%)

By Category:
- Mobile Chat: 132/132 (100%) ✅
- Mobile Menu: 143/143 (100%) ✅
- Mobile Navigation: 165/165 (100%) ✅
- PWA Features: 66/110 (60%) ⚠️ (Sprint 6)
```

---

## Risk Assessment

### High Risk

1. **Virtual Keyboard Handling Complexity**
   - **Risk**: iOS/Android differences hard to handle
   - **Mitigation**: Use proven visualViewport API, extensive testing
   - **Contingency**: Simplify to basic input focus behavior

2. **Test Failures Not Covered by Implementation**
   - **Risk**: Tests expect features we haven't thought of
   - **Mitigation**: Read all 660 test cases carefully
   - **Contingency**: Adjust scope, document deferred features

### Medium Risk

1. **Mobile Detection Edge Cases**
   - **Risk**: Tablets might be detected incorrectly
   - **Mitigation**: Use both viewport size and user agent
   - **Contingency**: Add manual toggle in settings

2. **Performance on Low-End Devices**
   - **Risk**: Animations might be janky on older phones
   - **Mitigation**: Use hardware-accelerated transforms
   - **Contingency**: Reduce motion for older devices

### Low Risk

1. **Browser Compatibility**
   - **Risk**: Old browsers might not support visualViewport
   - **Mitigation**: Feature detection + fallback
   - **Contingency**: Basic functionality without advanced features

---

## Success Metrics

### Quantitative Metrics

- ✅ **Test Pass Rate**: >= 77% (506/660 tests)
- ✅ **Mobile Chat**: 100% of 132 tests passing
- ✅ **Bottom Nav**: 100% of 165 tests passing
- ✅ **Mobile Menu**: 100% of 143 tests passing
- ✅ **Lighthouse Mobile Score**: >= 90
- ✅ **Bundle Size**: No regression (maintain 347 kB)

### Qualitative Metrics

- ✅ **User Experience**: Smooth, native-feeling interactions
- ✅ **Keyboard Handling**: Input always visible, no jumping
- ✅ **Touch Targets**: All >= 44px (WCAG AAA)
- ✅ **Performance**: 60fps animations
- ✅ **Accessibility**: All ARIA labels, keyboard navigation

---

## Daily Schedule

### Day 1-2: Mobile Chat UI

- Morning: Create mobile chat container + input component
- Afternoon: Implement message list optimization
- Evening: Agent selection + suggestion chips mobile UI

### Day 3: Virtual Keyboard Handling

- Morning: Create useVirtualKeyboard hook
- Afternoon: Implement scroll management
- Evening: Test across all 11 devices

### Day 4: Bottom Navigation Integration

- Morning: Integrate bottom nav into authenticated layout
- Afternoon: Add route detection + active states
- Evening: Test navigation flow

### Day 5: Mobile Menu Trigger

- Morning: Add hamburger button to public pages
- Afternoon: Connect to existing drawer, test
- Evening: Verify all menu tests passing

### Day 6: Swipe Gestures + Testing

- Morning: Integrate swipe gestures
- Afternoon: Run full test suite (660 tests)
- Evening: Fix issues, validate >= 77% pass rate

---

## Deliverables

### Code

1. **New Components** (4):
   - `components/mobile/mobile-chat-container.tsx`
   - `components/mobile/mobile-chat-input.tsx`
   - `components/mobile-menu-button.tsx`
   - `hooks/use-virtual-keyboard.ts`

2. **Modified Components** (3):
   - `app/pt/(authenticated)/layout.tsx` - Bottom nav integration
   - `app/pt/layout.tsx` - Mobile menu button
   - `app/pt/(authenticated)/chat/page.tsx` - Mobile chat detection

3. **Utilities** (2):
   - `lib/utils/mobile-detection.ts`
   - `lib/utils/keyboard-detection.ts`

### Documentation

1. **Sprint 5 Summary** - Complete implementation details
2. **Mobile Chat Guide** - Usage and best practices
3. **Virtual Keyboard Handling Guide** - Platform differences
4. **Test Results Report** - Before/after comparison

### Testing

- 660 tests executed across 11 devices
- > = 77% pass rate achieved
- Regression testing passed
- Performance benchmarks met

---

## Next Sprint Preview: Sprint 6

**Focus**: PWA Enhancements + Advanced Features

**Goals**:

- Complete PWA features (49 failing tests)
- Implement offline functionality
- Add install prompt
- Swipe gesture enhancements
- Performance optimization
- **Target Pass Rate**: 90%+ (594/660 tests)

---

**Status**: 🚀 Sprint 5 Starting
**Date**: 2025-11-05
**Expected Completion**: 2025-11-11 (6 days)
**Target Pass Rate**: 77% (506/660 tests passing)
