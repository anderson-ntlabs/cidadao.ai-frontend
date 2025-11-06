# Mobile Components Library

**Author**: Anderson Henrique da Silva
**Location**: Minas Gerais, Brasil
**Last Updated**: 2025-11-04 17:30:00 -0300
**Sprint**: Mobile Optimization Sprint 4

---

## Overview

Comprehensive mobile-first component library for Cidadão.AI, providing native-like iOS/Android experiences with React and Next.js 15.

### Component Categories

1. **Offline Support** - Network status and offline indicators
2. **Gestures** - Swipe, pull-to-refresh, long-press interactions
3. **Modals** - Bottom sheets, action sheets, dialogs
4. **Feedback** - Haptic vibrations, touch responses
5. **Layout** - Safe areas, keyboard spacers, responsive utilities

### Design Principles

- ✅ **WCAG AAA Compliance** - 44px minimum touch targets
- ✅ **Platform Conventions** - iOS/Android native patterns
- ✅ **Performance First** - Passive listeners, hardware acceleration
- ✅ **Accessibility** - Screen reader support, keyboard navigation
- ✅ **Progressive Enhancement** - Works without JavaScript

---

## Components Reference

### Offline Support

#### OfflineBanner

Displays a banner when network connection is lost.

```tsx
import { OfflineBanner } from '@/components/mobile'

;<OfflineBanner />
```

**Features**:

- Auto-detects online/offline status
- Smooth slide-in/out animation (300ms)
- Dismissible with X button
- Persistent until connection restored
- ARIA live region for screen readers

**Variants**:

- `OfflineIndicator` - Minimal dot indicator (top-right corner)

---

### Gestures

#### PullToRefresh

Native-style pull-to-refresh for scrollable content.

```tsx
import { PullToRefresh } from '@/components/mobile'

;<PullToRefresh
  onRefresh={async () => {
    await refetchData()
  }}
>
  {children}
</PullToRefresh>
```

**Props**:

- `onRefresh: () => Promise<void>` - Async refresh handler
- `threshold?: number` - Pull distance to trigger (default: 80px)
- `resistance?: number` - Pull resistance curve (default: 2.5)
- `refreshingText?: string` - Loading text (default: "Atualizando...")

**Features**:

- Natural resistance curve (iOS-like)
- Haptic feedback on trigger
- Loading spinner with text
- Prevents scroll bounce
- Passive touch listeners

**Variants**:

- `SimplePullToRefresh` - Minimal version without spinner

---

#### SwipeableCard

Swipeable cards with left/right action buttons (iOS Mail-like).

```tsx
import { SwipeableCard, SwipeActions } from '@/components/mobile'

<SwipeableCard
  onSwipeLeft={() => archive()}
  onSwipeRight={() => delete()}
  leftAction={<SwipeActions.Archive />}
  rightAction={<SwipeActions.Delete />}
>
  <CardContent />
</SwipeableCard>
```

**Props**:

- `onSwipeLeft?: () => void` - Left swipe action
- `onSwipeRight?: () => void` - Right swipe action
- `leftAction?: ReactNode` - Left button content
- `rightAction?: ReactNode` - Right button content
- `threshold?: number` - Swipe distance (default: 100px)

**Features**:

- Smooth spring animations
- Haptic feedback on threshold
- Color-coded actions (archive=green, delete=red)
- Auto-reset after action
- Touch-optimized (44px height)

**Built-in Actions**:

- `SwipeActions.Archive` - Green with archive icon
- `SwipeActions.Delete` - Red with trash icon
- `SwipeActions.Flag` - Yellow with flag icon
- `SwipeActions.Pin` - Blue with pin icon

---

### Modals

#### BottomSheet

iOS-style bottom modal sheet with swipe-to-dismiss.

```tsx
import { BottomSheet } from '@/components/mobile'

;<BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} title="Filtros">
  <FilterContent />
</BottomSheet>
```

**Props**:

- `isOpen: boolean` - Open state
- `onClose: () => void` - Close callback
- `title?: string` - Sheet header
- `snapPoints?: number[]` - Snap positions [0.5, 1] (half/full)
- `initialSnap?: number` - Starting snap point

**Features**:

- Swipe-down to dismiss (100px threshold)
- Backdrop click to close
- Smooth spring animations
- Body scroll lock when open
- Safe area insets (iPhone X+)
- ARIA dialog semantics

---

#### ActionSheet

iOS-style action menu with multiple options.

```tsx
import { ActionSheet, useActionSheet } from '@/components/mobile'

const { isOpen, open, close, actions } = useActionSheet()

<ActionSheet
  isOpen={isOpen}
  onClose={close}
  title="Escolha uma ação"
  actions={[
    {
      id: 'edit',
      label: 'Editar',
      icon: <Edit />,
      onAction: () => edit()
    },
    {
      id: 'delete',
      label: 'Excluir',
      icon: <Trash />,
      variant: 'destructive',
      onAction: () => deleteItem()
    }
  ]}
/>
```

**Action Props**:

- `id: string` - Unique identifier
- `label: string` - Button text
- `icon?: ReactNode` - Leading icon
- `variant?: 'default' | 'destructive' | 'primary'` - Style variant
- `disabled?: boolean` - Disabled state
- `onAction: () => void | Promise<void>` - Click handler

**Features**:

- Swipe-down to dismiss
- Haptic feedback on tap
- Destructive actions (red)
- Loading states for async actions
- Auto-close after action
- WCAG AAA touch targets (56px)

---

### Feedback

#### HapticButton

Button with automatic haptic vibration feedback.

```tsx
import { HapticButton, HapticIconButton, HapticFAB } from '@/components/mobile'

<HapticButton
  haptic="medium"
  onClick={() => save()}
>
  Salvar
</HapticButton>

<HapticIconButton
  haptic="light"
  icon={<Heart />}
  onClick={() => like()}
/>

<HapticFAB
  haptic="heavy"
  icon={<Plus />}
  onClick={() => create()}
/>
```

**Haptic Types**:

- `light` - 10ms tap (navigation, selection)
- `medium` - 20ms tap (buttons, confirmations)
- `heavy` - 30ms tap (important actions)
- `success` - [10, 50, 10] pattern (✅ completion)
- `warning` - [20, 100, 20, 100, 20] pattern (⚠️ alerts)
- `error` - [30, 100, 30] pattern (❌ failures)

**Props**:

- `haptic?: HapticFeedbackType` - Vibration pattern
- `variant?: 'default' | 'primary' | 'secondary'` - Button style
- `size?: 'sm' | 'md' | 'lg'` - Button size (44px, 48px, 56px)
- `loading?: boolean` - Loading spinner state
- `disabled?: boolean` - Disabled state

**Features**:

- Auto-vibration on click
- No vibration when disabled/loading
- WCAG AAA sizes (min 44px)
- Touch manipulation CSS
- Active scale feedback (0.95)

---

### Layout

#### SafeAreaView

Handles iOS notch and Android gesture bar spacing.

```tsx
import { SafeAreaView, SafeAreaTop, SafeAreaBottom } from '@/components/mobile'

<SafeAreaView top bottom>
  <Header />
  <Content />
  <Footer />
</SafeAreaView>

// Or use specific areas
<SafeAreaTop>
  <Header />
</SafeAreaTop>

<SafeAreaBottom>
  <BottomNav />
</SafeAreaBottom>
```

**Props**:

- `top?: boolean` - Add padding-top (status bar)
- `bottom?: boolean` - Add padding-bottom (home indicator)
- `left?: boolean` - Add padding-left (landscape)
- `right?: boolean` - Add padding-right (landscape)
- `usePadding?: boolean` - Use padding vs margin (default: true)
- `as?: string` - HTML element type (default: 'div')

**Safe Area Values** (iOS):

- Top: 44px (status bar) or 47px (Dynamic Island)
- Bottom: 34px (home indicator on iPhone X+)
- Left/Right: 0px (portrait) or 44px (landscape)

**Features**:

- CSS `env(safe-area-inset-*)`
- Graceful degradation (0px on non-notch devices)
- Supports padding or margin
- Landscape orientation support

---

#### VirtualKeyboardSpacer

Pushes content up when iOS/Android keyboard appears.

```tsx
import { VirtualKeyboardSpacer, VirtualKeyboardSpacerSafe } from '@/components/mobile'

<form>
  <Input />
  <VirtualKeyboardSpacer />
  <Button>Submit</Button>
</form>

// With safe area (iPhone home indicator)
<VirtualKeyboardSpacerSafe />
```

**Props**:

- `minHeight?: number` - Minimum spacer height (default: 0)
- `maxHeight?: number` - Maximum spacer height (default: 500px)
- `transitionDuration?: number` - Animation speed (default: 300ms)

**Features**:

- Uses `window.visualViewport` API
- Detects keyboard height automatically
- Smooth height transitions (300ms)
- Works on iOS Safari & Chrome Android
- No layout shift (aria-hidden)

**Keyboard Detection**:

- iOS Safari: `visualViewport.height < window.innerHeight`
- Chrome Android: Same detection
- Threshold: 100px difference = keyboard visible

---

## Hooks Reference

### useActionSheet

Manages ActionSheet state and actions.

```tsx
import { useActionSheet } from '@/components/mobile'

const sheet = useActionSheet()

// Open sheet
sheet.open()

// Close sheet
sheet.close()

// Toggle sheet
sheet.toggle()

// Set actions dynamically
sheet.setActions([
  { id: '1', label: 'Action 1', onAction: () => {} },
  { id: '2', label: 'Action 2', onAction: () => {} },
])

// Check state
if (sheet.isOpen) {
  // ...
}
```

---

### useVirtualKeyboard

Detects virtual keyboard state and height.

```tsx
import { useVirtualKeyboard } from '@/components/mobile'

const { isVisible, height } = useVirtualKeyboard()

if (isVisible) {
  console.log(`Keyboard height: ${height}px`)
}
```

**Returns**:

- `isVisible: boolean` - Is keyboard visible
- `height: number` - Keyboard height in pixels

---

### useSafeAreaInsets

Gets current safe area inset values.

```tsx
import { useSafeAreaInsets } from '@/components/mobile'

const { top, bottom, left, right } = useSafeAreaInsets()

// iPhone 13 Pro: { top: 47, bottom: 34, left: 0, right: 0 }
// Android: { top: 0, bottom: 0, left: 0, right: 0 }
```

**Returns**:

- `top: number` - Top inset (status bar / Dynamic Island)
- `bottom: number` - Bottom inset (home indicator)
- `left: number` - Left inset (landscape)
- `right: number` - Right inset (landscape)

---

## Usage Examples

### Example 1: Mobile Chat with Keyboard Handling

```tsx
import { SafeAreaView, VirtualKeyboardSpacer, HapticButton } from '@/components/mobile'

export default function ChatPage() {
  return (
    <SafeAreaView top bottom className="flex flex-col h-screen">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg) => (
          <Message key={msg.id} {...msg} />
        ))}
      </div>

      {/* Input area */}
      <div className="border-t p-4">
        <Input placeholder="Digite sua mensagem..." />
        <VirtualKeyboardSpacer />
        <HapticButton haptic="medium" onClick={send}>
          Enviar
        </HapticButton>
      </div>
    </SafeAreaView>
  )
}
```

---

### Example 2: Swipeable Dashboard Cards

```tsx
import { PullToRefresh, SwipeableCard, SwipeActions, HapticButton } from '@/components/mobile'

export default function DashboardPage() {
  return (
    <PullToRefresh onRefresh={async () => await refetch()}>
      <div className="space-y-4 p-4">
        {investigations.map((inv) => (
          <SwipeableCard
            key={inv.id}
            onSwipeLeft={() => archive(inv.id)}
            onSwipeRight={() => deleteInvestigation(inv.id)}
            leftAction={<SwipeActions.Archive />}
            rightAction={<SwipeActions.Delete />}
          >
            <InvestigationCard {...inv} />
          </SwipeableCard>
        ))}
      </div>
    </PullToRefresh>
  )
}
```

---

### Example 3: Filter Bottom Sheet

```tsx
import { BottomSheet, HapticButton } from '@/components/mobile'

export default function FiltersButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <HapticButton haptic="light" onClick={() => setIsOpen(true)}>
        Filtros
      </HapticButton>

      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Filtrar investigações"
        snapPoints={[0.5, 0.9]}
        initialSnap={0.5}
      >
        <FilterForm onApply={() => setIsOpen(false)} />
      </BottomSheet>
    </>
  )
}
```

---

### Example 4: Action Sheet Menu

```tsx
import { ActionSheet, useActionSheet, HapticIconButton } from '@/components/mobile'
import { MoreVertical, Edit, Trash, Share } from 'lucide-react'

export default function InvestigationMenu({ id }: { id: string }) {
  const sheet = useActionSheet()

  useEffect(() => {
    sheet.setActions([
      {
        id: 'edit',
        label: 'Editar',
        icon: <Edit />,
        onAction: () => router.push(`/investigations/${id}/edit`),
      },
      {
        id: 'share',
        label: 'Compartilhar',
        icon: <Share />,
        variant: 'primary',
        onAction: async () => await share(id),
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: <Trash />,
        variant: 'destructive',
        onAction: () => deleteInvestigation(id),
      },
    ])
  }, [id])

  return (
    <>
      <HapticIconButton haptic="light" icon={<MoreVertical />} onClick={sheet.open} />

      <ActionSheet
        isOpen={sheet.isOpen}
        onClose={sheet.close}
        title="Ações"
        actions={sheet.actions}
      />
    </>
  )
}
```

---

## Design Tokens

### Touch Targets (WCAG AAA)

```css
/* Minimum sizes */
--touch-target-min: 44px;
--touch-target-comfortable: 48px;
--touch-target-large: 56px;

/* Spacing */
--touch-spacing-compact: 8px;
--touch-spacing-comfortable: 12px;
--touch-spacing-relaxed: 16px;
```

### Animations

```css
/* Duration */
--mobile-transition-fast: 150ms;
--mobile-transition-normal: 300ms;
--mobile-transition-slow: 500ms;

/* Easing */
--mobile-ease-out: cubic-bezier(0, 0, 0.2, 1);
--mobile-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--mobile-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Haptic Patterns

```typescript
const HAPTIC_PATTERNS = {
  light: [10],
  medium: [20],
  heavy: [30],
  success: [10, 50, 10],
  warning: [20, 100, 20, 100, 20],
  error: [30, 100, 30],
} as const
```

---

## Browser Support

| Feature                  | iOS Safari    | Chrome Android | Notes              |
| ------------------------ | ------------- | -------------- | ------------------ |
| Safe Area Insets         | 11.0+         | Not applicable | iOS only           |
| Visual Viewport API      | 13.0+         | 61+            | Keyboard detection |
| Vibration API            | Not supported | 32+            | Android only       |
| Touch Events             | 2.0+          | 18+            | Universal support  |
| Passive Listeners        | 11.3+         | 51+            | Performance        |
| `prefers-reduced-motion` | 10.3+         | 74+            | Accessibility      |

---

## Performance Considerations

### Passive Event Listeners

All touch listeners use `{ passive: true }` to prevent scroll blocking:

```tsx
element.addEventListener('touchstart', handler, { passive: true })
element.addEventListener('touchmove', handler, { passive: true })
element.addEventListener('touchend', handler, { passive: true })
```

### Hardware Acceleration

Transform-based animations use GPU acceleration:

```css
.mobile-slide {
  transform: translateX(0);
  will-change: transform;
}
```

### Debouncing

Keyboard and resize listeners are debounced to reduce CPU usage:

```typescript
const debouncedHandler = debounce(() => {
  // ...
}, 100)
```

---

## Accessibility

### Screen Reader Support

- All interactive elements have ARIA labels
- Live regions for dynamic content
- Dialog semantics for modals
- Touch target announcements

### Keyboard Navigation

- All components keyboard accessible
- Logical tab order
- Escape to close modals
- Arrow keys for lists

### Motion Preferences

All animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Testing

### Unit Tests

```bash
npm run test components/mobile
```

### E2E Tests

```bash
npm run test:mobile
```

### Visual Regression

```bash
npm run test:visual:mobile
```

---

## Contributing

When adding new mobile components:

1. ✅ Follow WCAG AAA touch targets (44px minimum)
2. ✅ Add passive touch listeners
3. ✅ Support `prefers-reduced-motion`
4. ✅ Include TypeScript types
5. ✅ Add JSDoc documentation
6. ✅ Export from `index.ts`
7. ✅ Update this README
8. ✅ Add Storybook story
9. ✅ Write E2E tests

---

## References

- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios)
- [Material Design for Mobile](https://m3.material.io/)
- [WCAG 2.1 AAA Touch Targets](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Visual Viewport API](https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API)
- [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)

---

## Changelog

- **2025-11-04**: Created comprehensive mobile component library documentation
- **2025-11-04**: Added Sprint 4 components (ActionSheet, VirtualKeyboardSpacer, SafeAreaView, HapticButton)
- **2025-11-04**: Added Sprint 1-3 components (OfflineBanner, PullToRefresh, BottomSheet, SwipeableCard)
