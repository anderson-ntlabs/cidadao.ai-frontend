# Mobile Gesture Library Documentation

**Author**: Anderson Henrique da Silva
**Location**: Minas Gerais, Brasil
**Date**: 2025-11-04 (Sprint 4 Days 3-5)

---

## Table of Contents

- [Overview](#overview)
- [Touch Feedback System](#touch-feedback-system)
- [Gesture Hooks](#gesture-hooks)
- [Haptic Feedback](#haptic-feedback)
- [Design Tokens](#design-tokens)
- [Best Practices](#best-practices)
- [Browser Support](#browser-support)
- [Examples](#examples)

---

## Overview

The Cidadão.AI mobile gesture library provides a comprehensive set of utilities, hooks, and components for implementing native-like touch interactions on web applications. Built with accessibility, performance, and user experience in mind.

### Key Features

- ✅ **WCAG AAA Compliant**: Minimum 44x44px touch targets
- ✅ **Haptic Feedback**: Native-like vibration patterns
- ✅ **Gesture Recognition**: Swipe, pan, pinch, and more
- ✅ **Performance Optimized**: Hardware-accelerated animations
- ✅ **Safe Areas**: Automatic handling of notches and home indicators
- ✅ **Customizable**: Extensive theming via Tailwind tokens

---

## Touch Feedback System

### Utility: `lib/mobile-touch.ts`

Provides standardized touch feedback classes and utilities for consistent mobile interactions.

### 1. Touch Feedback Classes

```typescript
import { touchFeedback } from '@/lib/mobile-touch'

// Available feedback types:
touchFeedback.button // Primary buttons (scale 95%)
touchFeedback.card // Cards/surfaces (scale 98%)
touchFeedback.icon // Icon buttons (scale 95%)
touchFeedback.listItem // List items (scale 99% + bg highlight)
touchFeedback.link // Text links (opacity 70%)
touchFeedback.fab // Floating action buttons (scale 97%)
touchFeedback.minimal // Only removes tap highlight
```

**Usage Example:**

```tsx
import { touchFeedback } from '@/lib/mobile-touch'

;<button className={touchFeedback.button}>Click Me</button>
```

### 2. Touch Target Sizes

Ensures WCAG AAA compliance with minimum 44x44px touch targets.

```typescript
import { tapTarget } from '@/lib/mobile-touch'

// Available sizes:
tapTarget.small // 44x44px (WCAG AAA minimum)
tapTarget.medium // 48x48px (iOS HIG recommended)
tapTarget.large // 56x56px (Material Design)
tapTarget.xlarge // 64x64px (Large FABs)
```

**Usage Example:**

```tsx
import { tapTarget, touchFeedback } from '@/lib/mobile-touch'
import { cn } from '@/lib/utils'

;<button
  className={cn(touchFeedback.button, tapTarget.medium, 'rounded-lg bg-blue-600 text-white')}
>
  Primary Action
</button>
```

### 3. Helper Functions

#### `mobileTouchClasses()`

Combines touch feedback, tap target, and custom classes:

```tsx
import { mobileTouchClasses } from '@/lib/mobile-touch'

;<button
  className={mobileTouchClasses({
    feedback: 'button',
    tapTarget: 'medium',
    custom: 'bg-green-600 text-white rounded-lg px-6',
  })}
>
  Save Changes
</button>
```

#### `withTouchFeedback()`

Add touch feedback to existing classes:

```tsx
import { withTouchFeedback } from '@/lib/mobile-touch'

;<div className={withTouchFeedback('card', 'p-4 bg-white rounded-lg')}>Card Content</div>
```

#### `withTapTarget()`

Ensure minimum touch target size:

```tsx
import { withTapTarget } from '@/lib/mobile-touch'

;<button className={withTapTarget('large', 'rounded-full bg-blue-500')}>+</button>
```

---

## Gesture Hooks

### 1. `useSwipeGesture`

Detects swipe gestures in four directions with customizable thresholds.

**Location**: `hooks/use-swipe-gesture.ts`

```typescript
import { useSwipeGesture } from '@/hooks/use-swipe-gesture'

const { isSwiping, swipeDirection, swipeDistance } = useSwipeGesture(elementRef, {
  threshold: 100,
  onSwipeLeft: () => console.log('Swiped left'),
  onSwipeRight: () => console.log('Swiped right'),
  onSwipeUp: () => console.log('Swiped up'),
  onSwipeDown: () => console.log('Swiped down'),
})
```

**Configuration:**

```typescript
interface UseSwipeGestureOptions {
  threshold?: number // Minimum distance in px (default: 50)
  onSwipeLeft?: () => void // Left swipe callback
  onSwipeRight?: () => void // Right swipe callback
  onSwipeUp?: () => void // Up swipe callback
  onSwipeDown?: () => void // Down swipe callback
}
```

**Return Values:**

```typescript
{
  isSwiping: boolean // Currently swiping
  swipeDirection: SwipeDirection // 'left' | 'right' | 'up' | 'down' | null
  swipeDistance: number // Distance swiped in px
}
```

**Example: Swipeable Card**

```tsx
function SwipeableItem() {
  const cardRef = useRef<HTMLDivElement>(null)

  const { swipeDistance, swipeDirection } = useSwipeGesture(cardRef, {
    threshold: 100,
    onSwipeLeft: () => handleDelete(),
    onSwipeRight: () => handleArchive(),
  })

  return (
    <div
      ref={cardRef}
      style={{
        transform: `translateX(${swipeDistance}px)`,
        transition: swipeDirection ? 'none' : 'transform 0.3s',
      }}
    >
      Item Content
    </div>
  )
}
```

---

## Haptic Feedback

### Hook: `useHaptic`

Provides native-like vibration feedback for touch interactions.

**Location**: `hooks/use-haptic.ts`

```typescript
import { useHaptic } from '@/hooks/use-haptic'

const { vibrate, isSupported } = useHaptic()

// Trigger haptic feedback
vibrate('medium')
```

### Feedback Types

```typescript
type HapticFeedbackType =
  | 'light' // 10ms - Subtle feedback for secondary actions
  | 'medium' // 20ms - Standard feedback for primary actions
  | 'heavy' // 30ms - Strong feedback for important actions
  | 'success' // 15ms + 10ms - Success confirmation
  | 'warning' // 25ms + 15ms - Warning/destructive actions
  | 'error' // 30ms + 20ms - Error feedback
```

### Vibration Patterns

Each feedback type has a specific vibration pattern:

```typescript
const patterns = {
  light: [10], // Single short pulse
  medium: [20], // Single medium pulse
  heavy: [30], // Single strong pulse
  success: [15, 10, 10], // Double pulse (success)
  warning: [25, 15, 15], // Double pulse (warning)
  error: [30, 20, 30], // Triple pulse (error)
}
```

### Usage Examples

#### Basic Button

```tsx
function HapticButton() {
  const { vibrate } = useHaptic()

  return (
    <button
      onClick={() => {
        vibrate('medium')
        handleAction()
      }}
      className={touchFeedback.button}
    >
      Click Me
    </button>
  )
}
```

#### Swipe Actions

```tsx
function SwipeCard() {
  const { vibrate } = useHaptic()

  const { swipeDistance } = useSwipeGesture(cardRef, {
    threshold: 100,
    onSwipeLeft: () => {
      vibrate('warning') // Destructive action
      handleDelete()
    },
    onSwipeRight: () => {
      vibrate('success') // Positive action
      handleComplete()
    },
  })

  // ...
}
```

#### Error State

```tsx
function FormSubmit() {
  const { vibrate } = useHaptic()

  const handleSubmit = async () => {
    try {
      await submitForm()
      vibrate('success')
    } catch (error) {
      vibrate('error')
      showError(error)
    }
  }

  // ...
}
```

---

## Design Tokens

### Tailwind Configuration

All mobile design tokens are available in `tailwind.config.js`:

#### Touch Targets

```javascript
// tailwind.config.js
minHeight: {
  'touch-sm': '44px',    // WCAG AAA minimum
  'touch-md': '48px',    // iOS HIG recommended
  'touch-lg': '56px',    // Material Design
  'touch-xl': '64px',    // Large FABs
}
```

**Usage:**

```tsx
<button className="min-h-touch-md px-6">Button</button>
```

#### Transition Durations

```javascript
transitionDuration: {
  'fast': '150ms',       // Immediate feedback
  'normal': '300ms',     // Standard animations
  'slow': '500ms',       // Complex animations
}
```

**Usage:**

```tsx
<div className="transition-all duration-fast">Fast Animation</div>
```

#### Transition Easing

```javascript
transitionTimingFunction: {
  'mobile-ease': 'cubic-bezier(0.4, 0, 0.2, 1)',           // Material ease
  'mobile-ease-in': 'cubic-bezier(0.4, 0, 1, 1)',          // Accelerate
  'mobile-ease-out': 'cubic-bezier(0, 0, 0.2, 1)',         // Decelerate
  'mobile-spring': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Spring effect
}
```

**Usage:**

```tsx
<div className="transition-transform ease-mobile-spring">Spring Animation</div>
```

#### Safe Area Insets

```javascript
padding: {
  'safe-top': 'env(safe-area-inset-top)',
  'safe-bottom': 'env(safe-area-inset-bottom)',
  'safe-left': 'env(safe-area-inset-left)',
  'safe-right': 'env(safe-area-inset-right)',
}
```

**Usage:**

```tsx
<div className="pb-safe-bottom">Content respects home indicator</div>
```

#### Z-Index Layers

```javascript
zIndex: {
  'mobile-nav': '40',       // Bottom navigation
  'mobile-sheet': '50',     // Action sheets / Bottom sheets
  'mobile-drawer': '50',    // Side drawers
  'mobile-modal': '60',     // Full-screen modals
  'mobile-toast': '70',     // Toast notifications
  'mobile-tooltip': '80',   // Tooltips
}
```

**Usage:**

```tsx
<div className="fixed bottom-0 z-mobile-nav">Bottom Navigation</div>
```

---

## Best Practices

### 1. Always Use Touch Targets

❌ **Bad:**

```tsx
<button className="px-2 py-1 text-xs">Too Small</button>
```

✅ **Good:**

```tsx
import { tapTarget, touchFeedback } from '@/lib/mobile-touch'

;<button className={cn(tapTarget.medium, touchFeedback.button, 'px-6 text-base')}>
  Proper Size
</button>
```

### 2. Provide Visual Feedback

❌ **Bad:**

```tsx
<button onClick={handleClick}>No Feedback</button>
```

✅ **Good:**

```tsx
import { touchFeedback } from '@/lib/mobile-touch'

;<button className={touchFeedback.button} onClick={handleClick}>
  Has Feedback
</button>
```

### 3. Use Haptic for Important Actions

❌ **Bad:**

```tsx
<button onClick={deleteAccount}>Delete Account</button>
```

✅ **Good:**

```tsx
import { useHaptic } from '@/hooks/use-haptic'

function DeleteButton() {
  const { vibrate } = useHaptic()

  return (
    <button
      onClick={() => {
        vibrate('warning') // Warn user before destructive action
        deleteAccount()
      }}
      className={cn(touchFeedback.button, 'bg-red-600 text-white')}
    >
      Delete Account
    </button>
  )
}
```

### 4. Respect Safe Areas

❌ **Bad:**

```tsx
<div className="fixed bottom-0 w-full">Navigation (covered by home indicator)</div>
```

✅ **Good:**

```tsx
import { safeArea } from '@/lib/mobile-touch'

;<div className={cn('fixed bottom-0 w-full', safeArea.bottom)}>
  Navigation (respects safe areas)
</div>
```

### 5. Use Appropriate Gestures

| Gesture         | Best Use Case     | Example                   |
| --------------- | ----------------- | ------------------------- |
| **Tap**         | Primary actions   | Buttons, links, cards     |
| **Swipe Left**  | Delete, remove    | Email list, notifications |
| **Swipe Right** | Archive, complete | Tasks, messages           |
| **Swipe Down**  | Dismiss, close    | Modals, sheets            |
| **Swipe Up**    | More details      | Bottom sheets             |
| **Pull Down**   | Refresh           | List views                |

---

## Browser Support

### Touch Events

| Browser          | Support    | Notes                 |
| ---------------- | ---------- | --------------------- |
| iOS Safari       | ✅ Full    | Native support        |
| Chrome Android   | ✅ Full    | Native support        |
| Samsung Internet | ✅ Full    | Native support        |
| Firefox Android  | ✅ Full    | Native support        |
| Desktop browsers | ⚠️ Limited | Mouse events fallback |

### Vibration API

| Browser          | Support | Notes            |
| ---------------- | ------- | ---------------- |
| Chrome Android   | ✅ Full | Native vibration |
| Firefox Android  | ✅ Full | Native vibration |
| Samsung Internet | ✅ Full | Native vibration |
| iOS Safari       | ❌ None | No vibration API |
| Desktop browsers | ❌ None | No vibration     |

**Note**: The `useHaptic` hook gracefully degrades when Vibration API is not available.

### Safe Area Insets

| Browser          | Support    | Notes          |
| ---------------- | ---------- | -------------- |
| iOS Safari       | ✅ Full    | Notch support  |
| Chrome Android   | ⚠️ Partial | Some devices   |
| Samsung Internet | ⚠️ Partial | Some devices   |
| Desktop browsers | ❌ None    | Not applicable |

---

## Examples

### Complete Swipeable List Item

```tsx
import { useRef } from 'react'
import { useSwipeGesture } from '@/hooks/use-swipe-gesture'
import { useHaptic } from '@/hooks/use-haptic'
import { touchFeedback, tapTarget } from '@/lib/mobile-touch'
import { Trash2, Archive } from 'lucide-react'
import { cn } from '@/lib/utils'

function SwipeableListItem({ item, onDelete, onArchive }) {
  const itemRef = useRef<HTMLDivElement>(null)
  const { vibrate } = useHaptic()

  const { swipeDistance, swipeDirection, isSwiping } = useSwipeGesture(itemRef, {
    threshold: 100,
    onSwipeLeft: () => {
      vibrate('warning')
      onDelete(item.id)
    },
    onSwipeRight: () => {
      vibrate('medium')
      onArchive(item.id)
    },
  })

  const revealProgress = Math.min(Math.abs(swipeDistance) / 100, 1)

  return (
    <div className="relative overflow-hidden">
      {/* Left Action Background (Archive) */}
      <div
        className="absolute inset-y-0 left-0 bg-blue-600 flex items-center px-6"
        style={{
          width: swipeDirection === 'right' ? `${Math.abs(swipeDistance)}px` : '0',
          opacity: swipeDirection === 'right' ? revealProgress : 0,
        }}
      >
        <Archive className="w-6 h-6 text-white" />
      </div>

      {/* Right Action Background (Delete) */}
      <div
        className="absolute inset-y-0 right-0 bg-red-600 flex items-center justify-end px-6"
        style={{
          width: swipeDirection === 'left' ? `${Math.abs(swipeDistance)}px` : '0',
          opacity: swipeDirection === 'left' ? revealProgress : 0,
        }}
      >
        <Trash2 className="w-6 h-6 text-white" />
      </div>

      {/* Item Content */}
      <div
        ref={itemRef}
        className={cn('bg-white dark:bg-gray-800 p-4', touchFeedback.card, tapTarget.medium)}
        style={{
          transform: isSwiping ? `translateX(${swipeDistance}px)` : 'translateX(0)',
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        <h3 className="font-semibold">{item.title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
      </div>
    </div>
  )
}
```

### Touch-Optimized Form

```tsx
import { useHaptic } from '@/hooks/use-haptic'
import { tapTarget, touchFeedback } from '@/lib/mobile-touch'
import { cn } from '@/lib/utils'

function MobileForm() {
  const { vibrate } = useHaptic()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await submitData()
      vibrate('success')
    } catch (error) {
      vibrate('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Input with touch-friendly size */}
      <input
        type="text"
        placeholder="Name"
        className={cn(
          tapTarget.medium,
          'w-full px-4 rounded-lg border',
          'focus:ring-2 focus:ring-blue-500'
        )}
      />

      {/* Textarea with touch-friendly size */}
      <textarea
        placeholder="Message"
        rows={4}
        className={cn('w-full px-4 py-3 rounded-lg border', 'focus:ring-2 focus:ring-blue-500')}
      />

      {/* Submit button with haptic feedback */}
      <button
        type="submit"
        className={cn(
          tapTarget.large,
          touchFeedback.button,
          'w-full bg-blue-600 text-white rounded-lg font-semibold'
        )}
      >
        Submit
      </button>
    </form>
  )
}
```

### Bottom Navigation with Safe Areas

```tsx
import { Home, Search, User, Settings } from 'lucide-react'
import { safeArea, tapTarget, touchFeedback } from '@/lib/mobile-touch'
import { cn } from '@/lib/utils'

function BottomNavigation() {
  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Search', href: '/search' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0',
        'bg-white dark:bg-gray-900 border-t',
        'z-mobile-nav',
        safeArea.bottom
      )}
    >
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 py-2',
                touchFeedback.icon,
                tapTarget.medium
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}
```

---

## References

- [WCAG AAA Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [iOS Human Interface Guidelines - Gestures](https://developer.apple.com/design/human-interface-guidelines/gestures)
- [Material Design - Touch Targets](https://material.io/design/usability/accessibility.html#layout-and-typography)
- [Vibration API Specification](https://www.w3.org/TR/vibration/)
- [Safe Area Insets Guide](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)

---

**Last Updated**: 2025-11-04
**Sprint**: 4 (Performance & Polish)
**Status**: ✅ Complete
