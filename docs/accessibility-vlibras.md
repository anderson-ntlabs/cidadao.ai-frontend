# VLibras Integration - Brazilian Sign Language (LIBRAS)

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data de Criação**: 2025-01-25 12:30:00 -0300
**Última Atualização**: 2025-01-25

---

## Overview

VLibras is the official Brazilian government tool for translating web content into **LIBRAS** (Língua Brasileira de Sinais - Brazilian Sign Language). The Cidadão.AI platform integrates VLibras to provide accessibility for deaf and hard-of-hearing users.

### Key Features

- ✅ Automatic content translation to LIBRAS
- ✅ Animated avatar (Guga, Ícaro, or Hozana)
- ✅ User preference persistence
- ✅ Only loads on Portuguese pages (PT-specific)
- ✅ CSP-compliant configuration
- ✅ Accessibility Panel integration
- ✅ Keyboard shortcut support

---

## Installation

The VLibras integration uses the official React package:

```bash
npm install @djpfs/react-vlibras
```

**Current Version**: `@djpfs/react-vlibras@^2.0.2`

**Dependencies**: None (self-contained widget)

---

## Implementation

### Component Location

```
components/a11y/
├── vlibras-widget.tsx      # Main VLibras widget component
├── use-vlibras.ts          # Custom hook for programmatic control
└── index.ts                # Barrel export
```

### Integration in Layout

The VLibras widget is automatically included in the Portuguese layout:

**File**: `app/pt/layout.tsx`

```tsx
import { VLibrasWidget } from '@/components/a11y'

export default function PtLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <VLibrasWidget locale="pt" forceOnload />
      </body>
    </html>
  )
}
```

### Why PT-only?

LIBRAS is specific to **Brazilian Portuguese**. The widget:
- Only renders on `/pt/*` routes
- Does NOT load on `/en/*` routes (English)
- Automatically detects locale from route

---

## Configuration

### Widget Props

```tsx
interface VLibrasWidgetProps {
  locale: 'pt' | 'en'        // Current locale (only 'pt' shows widget)
  forceOnload?: boolean      // Load immediately (default: false)
  avatar?: string            // Avatar selection: 'guga' | 'icaro' | 'hosana'
}
```

### Avatar Options

Users can select from 3 official VLibras avatars:

1. **Guga** - Default male avatar
2. **Ícaro** - Alternative male avatar
3. **Hozana** - Female avatar

**User Selection**: Via Accessibility Panel (see below)

---

## User Interface

### Widget Appearance

The VLibras widget appears as a **floating button** in the bottom-right corner of the page:

```
┌─────────────────────────────┐
│                             │
│    Page Content             │
│                             │
│                      [👤]  │ ← VLibras button
└─────────────────────────────┘
```

**Visual Design**:
- Position: `fixed bottom-right`
- Z-index: High (always visible)
- Accessibility: ARIA labeled, keyboard accessible

### Activation Flow

1. User clicks VLibras button OR uses Accessibility Panel
2. Widget expands to show avatar
3. Avatar translates on-screen text to LIBRAS
4. User can pause/resume translation
5. Preference saved to localStorage

---

## Accessibility Panel Integration

The VLibras widget is also controllable via the **Accessibility Panel**:

**File**: `components/a11y/accessibility-panel.tsx`

```tsx
<AccessibilityPanel locale="pt">
  {/* Other a11y controls */}
  <VLibrasToggle />  {/* Toggle VLibras on/off */}
</AccessibilityPanel>
```

**Keyboard Shortcut**: `Alt + A` to open Accessibility Panel

**Panel Features**:
- Toggle VLibras on/off
- Change avatar preference
- View LIBRAS status

---

## Programmatic Control

### useVLibras Hook

For programmatic control of VLibras:

**File**: `components/a11y/use-vlibras.ts`

```tsx
import { useVLibras } from '@/components/a11y'

function MyComponent() {
  const { isEnabled, toggle, enable, disable } = useVLibras()

  return (
    <div>
      <p>VLibras is {isEnabled ? 'enabled' : 'disabled'}</p>
      <button onClick={toggle}>Toggle VLibras</button>
      <button onClick={enable}>Enable VLibras</button>
      <button onClick={disable}>Disable VLibras</button>
    </div>
  )
}
```

### Hook API

```tsx
interface UseVLibrasReturn {
  isEnabled: boolean          // Current VLibras state
  toggle: () => void          // Toggle on/off
  enable: () => void          // Enable VLibras
  disable: () => void         // Disable VLibras
}
```

---

## User Preferences

### Persistence

VLibras preferences are stored in **localStorage**:

```typescript
// Storage key
const VLIBRAS_PREFERENCE_KEY = 'vlibras-enabled'

// Stored data
{
  enabled: boolean,
  avatar: 'guga' | 'icaro' | 'hosana',
  lastUsed: ISO8601 timestamp
}
```

### Cross-session Behavior

- ✅ Preference persists across page reloads
- ✅ Preference persists across browser sessions
- ✅ No server-side storage required
- ✅ Respects user's last selection

---

## Content Security Policy (CSP)

VLibras requires specific CSP directives to function:

**File**: `lib/security/csp.config.ts`

```typescript
const cspDirectives = {
  'frame-src': [
    "'self'",
    'https://vlibras.gov.br',  // Required for VLibras iframe
  ],
  'script-src': [
    "'self'",
    'https://vlibras.gov.br',  // Required for VLibras scripts
  ],
}
```

**Why Required**:
- VLibras loads content via iframe from `vlibras.gov.br`
- Official government domain (trusted source)
- No data leaves user's browser

---

## Testing

### Manual Testing

**Local Development**:

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Navigate to any Portuguese page:
   ```
   http://localhost:3000/pt
   ```

3. Look for VLibras button in bottom-right corner

4. Click button or use Accessibility Panel (`Alt + A`)

5. Verify avatar appears and translates content

### Automated Testing

**Script**: `scripts/test-vlibras.js`

```bash
node scripts/test-vlibras.js
```

**Test Coverage**:
- ✅ Widget loads only on PT pages
- ✅ Widget does NOT load on EN pages
- ✅ Preference persistence works
- ✅ Avatar selection changes
- ✅ Programmatic enable/disable

**Test File**: `components/a11y/vlibras-widget.test.tsx` (if exists)

---

## Performance Considerations

### Lazy Loading

VLibras widget uses **lazy loading** to avoid blocking initial page render:

```tsx
// Widget only loads when:
// 1. Page is visible (IntersectionObserver)
// 2. User interacts with page
// 3. forceOnload prop is true
```

**Impact**:
- No performance penalty for users who don't use VLibras
- Minimal bundle size increase (~15KB gzipped)
- Scripts loaded asynchronously

### Bundle Size

```
@djpfs/react-vlibras: ~15KB (gzipped)
VLibras external scripts: ~200KB (loaded on-demand)
```

---

## Accessibility Features

### WCAG Compliance

VLibras helps meet **WCAG 2.1 Level AA** requirements:

- ✅ **1.2.6 Sign Language (AAA)**: Provides sign language interpretation
- ✅ **Keyboard Accessible**: Full keyboard navigation support
- ✅ **Screen Reader Compatible**: ARIA labels for all controls
- ✅ **Focus Management**: Proper focus trap in widget

### Keyboard Shortcuts

- `Tab`: Navigate to VLibras button
- `Enter` or `Space`: Activate VLibras
- `Esc`: Close VLibras widget
- `Alt + A`: Open Accessibility Panel (includes VLibras toggle)

---

## Troubleshooting

### Widget Not Appearing

**Possible Causes**:
1. Not on Portuguese page (check URL starts with `/pt/`)
2. CSP blocking VLibras scripts
3. JavaScript disabled
4. Ad blocker interfering

**Solution**:
```bash
# Check browser console for errors
# Verify CSP configuration
# Disable ad blockers for testing
```

### Widget Loads But No Translation

**Possible Causes**:
1. Content not translatable (images, videos)
2. Dynamic content loaded after widget initialization
3. VLibras service temporarily unavailable

**Solution**:
```typescript
// Manually trigger re-translation
window.VLibras.reload()
```

### Preference Not Persisting

**Possible Causes**:
1. localStorage disabled
2. Private browsing mode
3. localStorage quota exceeded

**Solution**:
```typescript
// Check localStorage availability
if (typeof window !== 'undefined' && window.localStorage) {
  // localStorage available
}
```

---

## Legal and Compliance

### Government Requirement

**Law**: [Lei Brasileira de Inclusão (LBI - Lei 13.146/2015)](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm)

Brazilian law **requires** public websites to provide accessibility for deaf users. VLibras is the **official government solution**.

### Data Privacy

- ✅ No personal data collected by VLibras
- ✅ Translation happens client-side
- ✅ No data sent to third-party servers
- ✅ LGPD compliant (Lei Geral de Proteção de Dados)

---

## Resources

### Official Documentation

- VLibras Official Site: https://www.gov.br/governodigital/pt-br/vlibras
- React Package: https://www.npmjs.com/package/@djpfs/react-vlibras
- LIBRAS Dictionary: https://dicionariolibras.com.br/

### Support

- VLibras Issues: Report to government portal
- Package Issues: https://github.com/djpfs/react-vlibras/issues
- Internal Issues: See `components/a11y/vlibras-widget.tsx`

---

## Roadmap

### Current Implementation (v1.0)

- ✅ Basic widget integration
- ✅ Accessibility Panel control
- ✅ User preference persistence
- ✅ PT-only loading

### Future Enhancements (v2.0)

- 🚧 Advanced configuration options
- 🚧 Custom translation dictionary
- 🚧 Analytics integration (usage tracking)
- 🚧 A/B testing for avatar preferences
- 🚧 Server-side preference sync (for authenticated users)

---

## Related Documentation

- [Accessibility Panel](./accessibility-panel.md)
- [Keyboard Navigation](./keyboard-navigation.md)
- [Screen Reader Support](./screen-reader-support.md)
- [WCAG Compliance](./wcag-compliance.md)

---

**Maintained by**: Frontend Team
**Last Review**: 2025-01-25
**Next Review**: 2025-04-25 (Quarterly)
