# Accessibility Features

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data de Criação**: 2025-11-03 10:25:00 -0300

## Overview

Cidadão.AI is built with **WCAG 2.1 Level AAA** compliance as a core requirement. We provide comprehensive accessibility features to ensure all Brazilians can access government transparency data, regardless of ability.

## Compliance Level

| Standard           | Target      | Status       |
| ------------------ | ----------- | ------------ |
| WCAG 2.1 Level A   | ✅ Required | ✅ Compliant |
| WCAG 2.1 Level AA  | ✅ Required | ✅ Compliant |
| WCAG 2.1 Level AAA | 🎯 Target   | ✅ Compliant |

## Key Features

### 1. VLibras Integration (Brazilian Sign Language)

**What**: Official Brazilian government tool for translating web content into LIBRAS (Brazilian Sign Language).

**Why**: 5+ million deaf Brazilians use LIBRAS as their primary language.

#### Implementation

```tsx
// components/a11y/vlibras-widget.tsx
import { VLibras } from '@djpfs/react-vlibras'

export function VLibrasWidget({ locale }: { locale: string }) {
  if (locale !== 'pt') return null // LIBRAS is Portuguese-specific

  return (
    <VLibras
      forceOnload
      avatar="icaro" // Avatar choices: guga, icaro, hozana
    />
  )
}
```

#### Usage

Automatically included on all Portuguese pages:

```tsx
// app/pt/layout.tsx
<VLibrasWidget locale="pt" />
```

**Location**: Bottom-right corner as a floating widget

**Activation**: Click widget → Content translates to LIBRAS

#### Testing

```bash
npm run test:vlibras
# OR
node scripts/test-vlibras.js
```

### 2. Keyboard Navigation

Complete keyboard-only navigation support.

#### Skip Links

Allow users to jump to main content areas:

```tsx
// components/a11y/skip-links.tsx
<SkipLinks locale="pt" />
```

**Default Links:**

- **Alt + M**: Skip to main content
- **Alt + N**: Skip to navigation
- **Alt + S**: Skip to search
- **Alt + F**: Skip to footer

#### Focus Management

```tsx
// Visible focus indicators
.focus-visible:ring-4
.focus-visible:ring-green-500/50

// Skip invisible elements
.sr-only
```

#### Keyboard Shortcuts

| Shortcut       | Action                   | Context        |
| -------------- | ------------------------ | -------------- |
| `Alt + A`      | Open accessibility panel | Global         |
| `Alt + H`      | Toggle high contrast     | Global         |
| `Alt + +`      | Increase font size       | Global         |
| `Alt + -`      | Decrease font size       | Global         |
| `Esc`          | Close modal/panel        | Modals         |
| `/`            | Focus search             | Chat interface |
| `Ctrl + Enter` | Send message             | Chat input     |

### 3. Screen Reader Support

#### ARIA Labels

Every interactive element has descriptive ARIA labels:

```tsx
<button aria-label="Enviar mensagem para o agente Abaporu" aria-describedby="agent-description">
  <SendIcon aria-hidden="true" />
  Enviar
</button>
```

#### Live Regions

Real-time announcements for screen readers:

```tsx
// components/a11y/live-announcer.tsx
import { useLiveAnnouncer } from '@/components/a11y'

function ChatInterface() {
  const { announce } = useLiveAnnouncer()

  const sendMessage = async () => {
    announce('Enviando mensagem...', 'polite')
    // ... send message
    announce('Resposta recebida', 'assertive')
  }
}
```

**Politeness Levels:**

- `polite`: Non-urgent (status updates)
- `assertive`: Urgent (errors, important changes)

#### Semantic HTML

```tsx
// Proper HTML5 semantics
<nav aria-label="Navegação principal">
<main id="main-content">
<article>
<aside aria-label="Filtros">
<footer>
```

### 4. Accessibility Panel

Unified control center for all accessibility features.

#### Access Methods

1. **FAB Button**: Green floating action button (bottom-right)
2. **Keyboard**: `Alt + A`
3. **Screen Reader**: "Abrir painel de acessibilidade"

#### Features

```tsx
<AccessibilityPanel locale="pt">
  {/* Font Size Control */}
  <FontSizeControl sizes={['small', 'normal', 'large', 'xlarge']} />
  {/* High Contrast Toggle */}
  <HighContrastToggle />
  {/* VLibras Toggle */}
  <VLibrasToggle /> {/* PT only */}
  {/* Keyboard Shortcuts Guide */}
  <KeyboardShortcutsGuide />
</AccessibilityPanel>
```

#### State Persistence

All settings saved in `localStorage`:

```typescript
interface A11ySettings {
  fontSize: 'small' | 'normal' | 'large' | 'xlarge'
  highContrast: boolean
  vlibrasEnabled: boolean
  reducedMotion: boolean
}
```

### 5. High Contrast Mode

Enhanced visibility for users with low vision.

#### Activation

- **Accessibility Panel**: Toggle switch
- **Keyboard**: `Alt + H`
- **URL Parameter**: `?high-contrast=true`

#### Implementation

```tsx
// Automatic detection
const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches

// Manual override
<body className={highContrast ? 'high-contrast' : ''}>
```

#### Styling

```css
.high-contrast {
  --background: #000000;
  --foreground: #ffffff;
  --primary: #ffff00;
  --border: #ffffff;

  /* Minimum contrast ratios */
  --contrast-text: 7: 1; /* AAA */
  --contrast-large-text: 4.5: 1; /* AAA */
}
```

### 6. Font Size Control

Four preset sizes for visual accessibility.

| Size   | Scale    | Use Case          |
| ------ | -------- | ----------------- |
| Small  | 0.875rem | High-res displays |
| Normal | 1rem     | Default           |
| Large  | 1.25rem  | Low vision        |
| XLarge | 1.5rem   | Severe low vision |

#### Implementation

```tsx
// Global font size control
document.documentElement.style.fontSize = `${size}rem`
```

### 7. Reduced Motion

Respects user's motion preferences.

```tsx
// Detect preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Conditional animations
{
  !prefersReducedMotion && <AnimatedComponent />
}
```

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Testing Strategy

### Manual Testing

```bash
# VLibras integration
node scripts/test-vlibras.js

# Keyboard navigation
npm run test:keyboard

# Screen reader (manual)
# - macOS: VoiceOver (Cmd + F5)
# - Windows: NVDA (free), JAWS
# - Linux: Orca
```

### Automated Testing

```typescript
// Vitest + Testing Library
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

it('should have no accessibility violations', async () => {
  const { container } = render(<ChatInterface />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### E2E Testing (Playwright)

```typescript
// __tests__/e2e/accessibility.spec.ts
test('keyboard navigation works', async ({ page }) => {
  await page.goto('/pt/chat')

  // Tab through interactive elements
  await page.keyboard.press('Tab')
  await expect(page.locator(':focus')).toHaveAttribute('role', 'button')

  // Activate skip link
  await page.keyboard.press('Alt+M')
  await expect(page.locator('#main-content')).toBeFocused()
})

test('screen reader announcements work', async ({ page }) => {
  await page.goto('/pt/chat')

  const liveRegion = page.locator('[aria-live="polite"]')
  await expect(liveRegion).toBeEmpty()

  await page.click('[data-testid="send-button"]')
  await expect(liveRegion).toContainText('Enviando mensagem')
})
```

## Lighthouse Audit

Target scores:

```bash
npm run lighthouse

# Target Scores (100 = perfect)
Accessibility: ≥95
Performance: ≥90
Best Practices: ≥95
SEO: ≥90
```

## User Personas

### 1. Maria (Blind User)

- **Tools**: NVDA screen reader
- **Needs**: ARIA labels, keyboard navigation, semantic HTML
- **Pain points**: Missing alt text, unclear focus indicators

### 2. João (Low Vision)

- **Tools**: Screen magnifier, high contrast
- **Needs**: Large text, clear focus, high contrast
- **Pain points**: Small text, low contrast UI

### 3. Ana (Deaf User)

- **Tools**: VLibras (LIBRAS translator)
- **Needs**: Visual indicators, captions, LIBRAS
- **Pain points**: Audio-only content

### 4. Carlos (Motor Impairment)

- **Tools**: Keyboard only, voice control
- **Needs**: Large click targets, keyboard shortcuts
- **Pain points**: Small buttons, complex gestures

## Common Pitfalls (Avoided)

### ❌ Bad Practices

```tsx
// Missing alt text
<img src="chart.png" />

// Non-semantic div buttons
<div onClick={handler}>Click me</div>

// Color-only indicators
<span style={{ color: 'red' }}>Error</span>

// Auto-playing audio
<audio src="alert.mp3" autoPlay />

// Time-based content without pause
<Carousel autoPlay interval={3000} />
```

### ✅ Good Practices

```tsx
// Descriptive alt text
<img src="chart.png" alt="Gráfico mostrando aumento de 15% em gastos públicos" />

// Semantic buttons
<button onClick={handler}>Click me</button>

// Multiple indicators
<span className="text-red-600">
  <ErrorIcon aria-label="Erro" />
  <span>Erro ao carregar</span>
</span>

// User-controlled audio
<audio src="alert.mp3" controls />

// Pausable carousel
<Carousel autoPlay interval={3000} showPauseButton />
```

## Configuration

### Enable/Disable Features

```typescript
// .env.local
NEXT_PUBLIC_ENABLE_VLIBRAS = true
NEXT_PUBLIC_ENABLE_HIGH_CONTRAST = true
NEXT_PUBLIC_ENABLE_FONT_CONTROL = true
```

### Customize Keyboard Shortcuts

```typescript
// lib/a11y/keyboard-shortcuts.ts
export const shortcuts = {
  openA11yPanel: 'Alt+A',
  toggleHighContrast: 'Alt+H',
  increaseFontSize: 'Alt+Plus',
  decreaseFontSize: 'Alt+Minus',
  // ... add more
}
```

## Resources

### External Tools

- **VLibras**: https://www.gov.br/governodigital/pt-br/vlibras
- **NVDA Screen Reader**: https://www.nvaccess.org/
- **axe DevTools**: https://www.deque.com/axe/devtools/
- **Lighthouse CI**: https://github.com/GoogleChrome/lighthouse-ci

### Guidelines

- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **WAI-ARIA**: https://www.w3.org/TR/wai-aria-practices/
- **eMAG (Brazil)**: https://www.gov.br/governodigital/pt-br/acessibilidade-digital/emag

### Brazilian Legislation

- **Lei Brasileira de Inclusão (LBI)** - Lei nº 13.146/2015
- **Decreto nº 5.296/2004** - Acessibilidade digital obrigatória

## Roadmap

### Planned Enhancements

- [ ] **Voice Control**: Speech-to-text input
- [ ] **Dyslexia Mode**: OpenDyslexic font option
- [ ] **Color Blind Modes**: Protanopia, Deuteranopia, Tritanopia filters
- [ ] **Reading Mode**: Distraction-free content view
- [ ] **Text-to-Speech**: Read aloud feature
- [ ] **Customizable Shortcuts**: User-defined key bindings

## Related Documentation

- [Component Library](../04-components/overview.md)
- [Testing Guide](../07-testing/overview.md)
- [VLibras Integration](./vlibras-integration.md)

## Support

For accessibility issues:

- **GitHub Issues**: Tag with `a11y` label
- **Email**: acessibilidade@cidadao.ai
- **Government Channel**: ouvidoria@gov.br
