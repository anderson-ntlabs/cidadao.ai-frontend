# Component API Reference - Cidadão.AI Frontend

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data de Criação**: 2025-01-25 18:30:00 -0300
**Última Atualização**: 2025-01-25

---

## Overview

This document provides comprehensive API documentation for all custom components in the Cidadão.AI frontend. Components are organized by category, with detailed prop interfaces, usage examples, and implementation notes.

### Component Categories

- **a11y/** - Accessibility components (WCAG 2.1 AA compliant)
- **charts/** - Data visualization with Recharts
- **dev/** - Development and debugging tools
- **hints/** - Adaptive context-aware user hints
- **markdown/** - Secure markdown rendering
- **tour/** - Interactive onboarding tours
- **onboarding/** - User onboarding flows
- **ui/** - Reusable UI primitives (shadcn/ui based)

---

## Accessibility Components (`components/a11y/`)

### AccessibilityPanel

**File**: `components/a11y/accessibility-panel.tsx`

**Purpose**: Unified control panel for all accessibility features

**Features**:

- Floating Action Button (FAB) with keyboard shortcut (`Alt + A`)
- Font size control (4 sizes: small, normal, large, xlarge)
- High contrast toggle
- VLibras (LIBRAS) toggle (Portuguese only)
- Keyboard shortcuts reference
- Responsive design (mobile/desktop)
- Screen reader announcements
- WCAG 2.1 AA compliant

**Props**:

```typescript
interface AccessibilityPanelProps {
  /**
   * Current locale (determines language and VLibras availability)
   */
  locale: 'pt' | 'en'

  /**
   * Additional CSS classes for the FAB
   */
  className?: string
}
```

**Usage**:

```tsx
import { AccessibilityPanel } from '@/components/a11y'

function Layout({ locale }: { locale: 'pt' | 'en' }) {
  return (
    <>
      {/* Your content */}
      <AccessibilityPanel locale={locale} />
    </>
  )
}
```

**Keyboard Shortcuts**:

- `Alt + A`: Open/close accessibility panel
- `Alt + H`: Toggle high contrast
- `Alt + +`: Increase font size
- `Alt + -`: Decrease font size

**Accessibility**:

- `role="dialog"` for panel
- `aria-label` and `aria-expanded` on FAB
- Live regions for screen reader announcements
- Keyboard focus management
- Visual focus indicators (4px ring)

---

### FontSizeControl

**File**: `components/a11y/font-size-control.tsx`

**Purpose**: Font size adjustment control with 4 preset sizes

**Features**:

- 4 size options: small (14px), normal (16px), large (18px), xlarge (20px)
- LocalStorage persistence
- CSS variable-based implementation (`--font-size-base`)
- Smooth transitions
- Visual feedback

**Props**:

```typescript
interface FontSizeControlProps {
  locale: 'pt' | 'en'
}
```

**Usage**:

```tsx
import { FontSizeControl } from '@/components/a11y'
;<FontSizeControl locale="pt" />
```

**Implementation**:

```typescript
// Sets CSS variable on document root
document.documentElement.style.setProperty('--font-size-base', '18px')

// Persisted to localStorage
localStorage.setItem('cidadao-font-size', 'large')
```

---

### HighContrastToggle

**File**: `components/a11y/high-contrast-toggle.tsx`

**Purpose**: Toggle high contrast mode for better visibility

**Features**:

- Switch UI component
- Dark/light mode compatible
- LocalStorage persistence
- CSS class-based (`high-contrast`)
- WCAG AAA contrast ratios in high contrast mode

**Props**: None (standalone component)

**Usage**:

```tsx
import { HighContrastToggle } from '@/components/a11y'
;<HighContrastToggle />
```

**Implementation**:

```typescript
// Adds class to document
document.documentElement.classList.add('high-contrast')

// Persisted to localStorage
localStorage.setItem('cidadao-high-contrast', 'enabled')
```

**CSS Variables** (when enabled):

```css
.high-contrast {
  --contrast-bg: #000;
  --contrast-fg: #fff;
  --contrast-border: #fff;
}
```

---

### VLibrasWidget

**File**: `components/a11y/vlibras-widget.tsx`

**Purpose**: Brazilian Sign Language (LIBRAS) translation widget

**Features**:

- Official VLibras integration (`@djpfs/react-vlibras@^2.0.2`)
- 3 avatar options: Guga, Ícaro, Hozana
- User preference persistence
- PT-only loading (Brazilian Portuguese specific)
- Bottom-right corner positioning
- Programmatic control via hook

**Props**:

```typescript
interface VLibrasWidgetProps {
  locale: 'pt' | 'en'
  forceOnload?: boolean
  avatar?: 'guga' | 'icaro' | 'hosana'
}
```

**Usage**:

```tsx
import { VLibrasWidget } from '@/components/a11y'

// Basic usage (renders only on PT pages)
<VLibrasWidget locale="pt" forceOnload />

// With custom avatar
<VLibrasWidget locale="pt" avatar="icaro" />
```

**Programmatic Control**:

```tsx
import { useVLibras } from '@/components/a11y'

function MyComponent() {
  const { isEnabled, toggle, enable, disable } = useVLibras()

  return <button onClick={toggle}>{isEnabled ? 'Desativar' : 'Ativar'} LIBRAS</button>
}
```

**See Also**: [VLibras Integration Guide](../accessibility-vlibras.md)

---

### VLibrasToggle

**File**: `components/a11y/vlibras-toggle.tsx`

**Purpose**: Toggle button/switch for VLibras widget

**Props**:

```typescript
interface VLibrasToggleProps {
  locale: 'pt' | 'en'
  variant?: 'switch' | 'button'
}
```

**Usage**:

```tsx
import { VLibrasToggle } from '@/components/a11y'

// Switch variant (for panels)
<VLibrasToggle locale="pt" variant="switch" />

// Button variant (for toolbars)
<VLibrasToggle locale="pt" variant="button" />
```

---

## Chart Components (`components/charts/`)

All chart components use [Recharts](https://recharts.org/) with custom styling for dark mode compatibility.

### LineChart

**File**: `components/charts/line-chart.tsx`

**Purpose**: Line chart for time series and trend data

**Props**:

```typescript
interface LineChartProps {
  data: Array<Record<string, any>>

  lines: Array<{
    dataKey: string // Key in data object
    name: string // Display name
    color: string // Line color (hex)
    strokeDasharray?: string // e.g., "5 5" for dashed
  }>

  xAxisKey: string
  xAxisType?: 'date' | 'category'
  yAxisFormatter?: (value: any) => string

  height?: number
  showGrid?: boolean
  showLegend?: boolean
  className?: string
}
```

**Usage**:

```tsx
import { LineChart } from '@/components/charts'

const data = [
  { date: '2025-01-01', contratos: 45, licitacoes: 23 },
  { date: '2025-01-02', contratos: 52, licitacoes: 31 },
  { date: '2025-01-03', contratos: 48, licitacoes: 28 },
]

<LineChart
  data={data}
  lines={[
    { dataKey: 'contratos', name: 'Contratos', color: '#3b82f6' },
    { dataKey: 'licitacoes', name: 'Licitações', color: '#10b981' }
  ]}
  xAxisKey="date"
  xAxisType="date"
  yAxisFormatter={(value) => value.toLocaleString('pt-BR')}
  height={400}
  showGrid
  showLegend
/>
```

**Features**:

- Responsive (ResponsiveContainer)
- Custom tooltip with dark mode support
- Date formatting with `date-fns` and `ptBR` locale
- Grid customization
- Legend positioning

---

### BarChart

**File**: `components/charts/bar-chart.tsx`

**Purpose**: Bar chart for categorical data comparison

**Props**:

```typescript
interface BarChartProps {
  data: Array<Record<string, any>>

  bars: Array<{
    dataKey: string
    name: string
    color: string
  }>

  xAxisKey: string
  yAxisFormatter?: (value: any) => string
  layout?: 'horizontal' | 'vertical'

  height?: number
  showGrid?: boolean
  showLegend?: boolean
  className?: string
}
```

**Usage**:

```tsx
import { BarChart } from '@/components/charts'

const data = [
  { orgao: 'Educação', gastos: 15000000 },
  { orgao: 'Saúde', gastos: 23000000 },
  { orgao: 'Segurança', gastos: 18000000 },
]

<BarChart
  data={data}
  bars={[
    { dataKey: 'gastos', name: 'Gastos', color: '#ef4444' }
  ]}
  xAxisKey="orgao"
  yAxisFormatter={(value) =>
    `R$ ${(value / 1000000).toFixed(1)}M`
  }
  height={300}
/>
```

---

### PieChart

**File**: `components/charts/pie-chart.tsx`

**Purpose**: Pie/donut chart for proportion visualization

**Props**:

```typescript
interface PieChartProps {
  data: Array<{
    name: string
    value: number
    color?: string
  }>

  innerRadius?: number // 0 for pie, >0 for donut
  outerRadius?: number

  showLabels?: boolean
  showLegend?: boolean
  centerLabel?: string // For donut charts

  height?: number
  className?: string
}
```

**Usage**:

```tsx
import { PieChart } from '@/components/charts'

const data = [
  { name: 'Concluídas', value: 45, color: '#10b981' },
  { name: 'Em Andamento', value: 23, color: '#3b82f6' },
  { name: 'Pendentes', value: 12, color: '#f59e0b' },
]

// Donut chart
<PieChart
  data={data}
  innerRadius={60}
  outerRadius={100}
  centerLabel="Total: 80"
  showLegend
  height={300}
/>

// Pie chart
<PieChart
  data={data}
  innerRadius={0}
  showLabels
  height={300}
/>
```

---

### AreaChart

**File**: `components/charts/area-chart.tsx`

**Purpose**: Area chart for cumulative trends

**Props**: Similar to `LineChart` with additional:

```typescript
interface AreaChartProps extends LineChartProps {
  fillOpacity?: number // 0-1 (default: 0.3)
  stackedAreas?: boolean
}
```

**Usage**:

```tsx
import { AreaChart } from '@/components/charts'
;<AreaChart
  data={data}
  lines={[
    { dataKey: 'receita', name: 'Receita', color: '#10b981' },
    { dataKey: 'despesa', name: 'Despesa', color: '#ef4444' },
  ]}
  xAxisKey="mes"
  fillOpacity={0.2}
  height={350}
/>
```

---

## Development Components (`components/dev/`)

### TelemetryPanel

**File**: `components/dev/telemetry-panel.tsx`

**Purpose**: Real-time telemetry dashboard (development only)

**Features**:

- Live metrics updates (1s interval)
- Chat telemetry statistics
- Success/error rate visualization
- Response time tracking
- Demo mode usage counter
- Reset telemetry button
- Only renders in `NODE_ENV=development`

**Props**:

```typescript
interface TelemetryPanelProps {
  onClose?: () => void
}
```

**Usage**:

```tsx
import { TelemetryPanel } from '@/components/dev'

// In _app.tsx or layout
{
  process.env.NODE_ENV === 'development' && <TelemetryPanel />
}
```

**Metrics Displayed**:

- Messages Sent
- Messages Received
- Success Rate (color-coded: green >95%, yellow >80%, red <80%)
- Average Response Time
- Errors / Retries
- Demo Mode Usage
- Active Sessions
- Intent Distribution

**Keyboard Shortcut**: `Ctrl + Shift + T` to toggle (planned)

---

### WebVitalsMonitor

**File**: `components/dev/web-vitals-monitor.tsx`

**Purpose**: Real-time Web Vitals monitoring (development only)

**Features**:

- Tracks LCP, FID, CLS, TTFB
- Visual indicators (good/needs-improvement/poor)
- Historical data (last 10 readings)
- Performance budgets
- Only renders in development

**Usage**:

```tsx
import { WebVitalsMonitor } from '@/components/dev'

{
  process.env.NODE_ENV === 'development' && <WebVitalsMonitor />
}
```

**Thresholds** (Google's Core Web Vitals):

- **LCP** (Largest Contentful Paint): <2.5s good, <4s needs improvement, >4s poor
- **FID** (First Input Delay): <100ms good, <300ms needs improvement, >300ms poor
- **CLS** (Cumulative Layout Shift): <0.1 good, <0.25 needs improvement, >0.25 poor
- **TTFB** (Time to First Byte): <800ms good, <1800ms needs improvement, >1800ms poor

---

## Adaptive Hints System (`components/hints/`)

### AdaptiveHintsProvider

**File**: `components/hints/adaptive-hints-provider.tsx`

**Purpose**: Context provider for adaptive, context-aware user hints

**Features**:

- Page-specific hints
- User behavior tracking
- Automatic hint dismissal
- Priority-based display (critical, high, medium, low)
- Delayed appearance (configurable)
- Mobile/desktop detection
- Contrast ratio checking
- Error tracking

**Props**:

```typescript
interface AdaptiveHintsProviderProps {
  children: React.ReactNode
}
```

**Usage**:

```tsx
import { AdaptiveHintsProvider, useAdaptiveHints } from '@/components/hints'

// In app layout
function RootLayout({ children }: { children: React.ReactNode }) {
  return <AdaptiveHintsProvider>{children}</AdaptiveHintsProvider>
}

// In any child component
function MyComponent() {
  const { currentHints, dismissHint, reportError } = useAdaptiveHints()

  return (
    <div>
      {/* Component content */}
      {currentHints.length > 0 && <div>You have {currentHints.length} hints</div>}
    </div>
  )
}
```

**Hint Structure**:

```typescript
interface Hint {
  key: string // Unique identifier
  priority: 'critical' | 'high' | 'medium' | 'low'
  trigger: string[] // Page triggers (e.g., ['chat', 'home'])
  showAfter: number // Delay in ms
  dismissible: boolean
  content: {
    title?: string
    description?: string
    examples?: string[]
    note?: string
    suggestions?: string[]
    action?: string
    onClick?: () => void
    actions?: Array<{ label: string; action: string }>
  }
}
```

**Example Hints**:

```typescript
// Low contrast hint
{
  key: 'low-contrast-warning',
  priority: 'high',
  trigger: ['*'],
  showAfter: 3000,
  dismissible: true,
  content: {
    title: 'Contraste Baixo Detectado',
    description: 'O contraste atual pode dificultar a leitura',
    suggestions: [
      'Ative o modo de alto contraste (Alt + H)',
      'Aumente o tamanho da fonte (Alt + +)'
    ]
  }
}
```

**Hook Helpers**:

```typescript
import { useReportUXIssue } from '@/components/hints'

const { reportMissingElement, reportInteractionError, reportContrastIssue } = useReportUXIssue()

// Report missing UI element
reportMissingElement('submit-button')

// Report interaction failure
reportInteractionError('form-submit')

// Report low contrast
reportContrastIssue('navbar', 2.8)
```

---

## Markdown Rendering (`components/markdown/`)

### MarkdownRenderer

**File**: `components/markdown/markdown-renderer.tsx`

**Purpose**: Secure markdown to HTML renderer with XSS protection

**Features**:

- Simple markdown parser (no external parser dependency)
- DOMPurify sanitization
- Supports: headers, bold, italic, lists, links, code blocks
- Tailwind CSS styling
- Dark mode compatible
- Emoji support in lists

**Props**:

```typescript
interface MarkdownRendererProps {
  content: string
  className?: string
}
```

**Usage**:

```tsx
import { MarkdownRenderer } from '@/components/markdown'

const markdown = `
# Resultados da Investigação

## Resumo

Foram detectadas **3 anomalias** nos contratos:

* Desvio de preço de 250%
* Concentração em fornecedor único
* Similaridade suspeita entre propostas

\`\`\`
Total de contratos analisados: 145
Anomalias encontradas: 3 (2.1%)
\`\`\`

[Ver relatório completo](/investigacoes/123)
`

<MarkdownRenderer content={markdown} />
```

**Supported Markdown**:

- Headers: `#`, `##`, `###`
- Bold: `**text**`
- Italic: `*text*`
- Bold+Italic: `***text***`
- Lists: `*` (unordered), `1.` (ordered)
- Links: `[text](url)`
- Inline code: `` `code` ``
- Code blocks: ` ```code``` `

**Security**:

- DOMPurify sanitization (prevents XSS attacks)
- Allowed tags: h1-h6, p, br, strong, em, ul, ol, li, a, code, pre, span
- Allowed attributes: href, class, target, rel
- No data attributes allowed
- No script tags
- No style tags

**Styling**:

- Uses Tailwind's `prose` classes
- Dark mode: `prose-invert`
- Responsive typography
- Custom class overrides allowed

---

## Tour Components (`components/tour/`)

### InteractiveTour

**File**: `components/tour/interactive-tour.tsx`

**Purpose**: Interactive product tour with step-by-step guidance

**Features**:

- Auto-start on first visit
- Quick mode (5 essential steps)
- Complete mode (15+ steps with details)
- Floating restart button
- Progress tracking
- Completion persistence (localStorage)
- Toast notifications
- Keyboard navigation

**Props**:

```typescript
interface InteractiveTourProps {
  autoStart?: boolean // Default: true
  mode?: 'quick' | 'complete' // Default: 'quick'
  showFloatingButton?: boolean // Default: true
}
```

**Usage**:

```tsx
import { InteractiveTour } from '@/components/tour'

// Basic usage (auto-start on first visit)
<InteractiveTour />

// Complete mode without auto-start
<InteractiveTour autoStart={false} mode="complete" />

// Without floating restart button
<InteractiveTour showFloatingButton={false} />
```

**Tour Modes**:

**Quick Mode** (5 steps, ~2 minutes):

1. Welcome to Cidadão.AI
2. Chat with AI agents
3. Accessibility features
4. Investigations dashboard
5. Getting started

**Complete Mode** (15 steps, ~8 minutes):

1. Platform overview
2. Multi-agent system explanation
3. Chat interface deep dive
4. Intent detection demo
5. Agent selection visualization
6. Investigation creation
7. Data visualization
8. Accessibility panel tour
9. VLibras (LIBRAS) demo
10. Keyboard shortcuts
11. Profile customization
12. Notifications center
13. Settings overview
14. Help resources
15. Ready to explore!

**Programmatic Control**:

```tsx
import { useTour } from '@/hooks/use-tour'

function MyComponent() {
  const { startTour, skipTour, restartTour, hasSeenTour } = useTour({ autoStart: false })

  return (
    <div>
      {!hasSeenTour() && <button onClick={() => startTour('quick')}>Iniciar Tour Rápido</button>}

      <button onClick={() => startTour('complete')}>Ver Tour Completo</button>
    </div>
  )
}
```

**Events**:

```typescript
{
  onComplete: () => {
    console.log('Tour completed!')
    // Track in analytics
  },
  onSkip: () => {
    console.log('Tour skipped')
  }
}
```

---

### TourControls

**File**: `components/tour/tour-controls.tsx`

**Purpose**: Navigation controls for interactive tour

**Features**:

- Step counter (e.g., "3/15")
- Step title and description
- Next/Previous buttons
- Skip tour button
- Restart option
- Keyboard shortcuts (Arrow keys, Escape)
- Progress indicator

**Props**:

```typescript
interface TourControlsProps {
  currentStep: number
  totalSteps: number
  stepTitle?: string
  stepDescription?: string
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
  onRestart: () => void
  isFirstStep: boolean
  isLastStep: boolean
  mode: 'quick' | 'complete'
}
```

**Usage**: Typically used internally by `InteractiveTour`, but can be used standalone:

```tsx
import { TourControls } from '@/components/tour'
;<TourControls
  currentStep={3}
  totalSteps={15}
  stepTitle="Chat com Agentes IA"
  stepDescription="Converse naturalmente com nossos agentes especializados"
  onNext={() => setStep(4)}
  onPrev={() => setStep(2)}
  onSkip={handleSkip}
  onRestart={handleRestart}
  isFirstStep={false}
  isLastStep={false}
  mode="complete"
/>
```

---

### TourTrigger

**File**: `components/tour/interactive-tour.tsx`

**Purpose**: Wrapper component to trigger tour from UI elements

**Props**:

```typescript
interface TourTriggerProps {
  children: React.ReactNode
  mode?: 'quick' | 'complete'
}
```

**Usage**:

```tsx
import { TourTrigger } from '@/components/tour'
;<TourTrigger mode="complete">
  <button className="...">Fazer Tour Completo</button>
</TourTrigger>
```

---

## Onboarding Components (`components/onboarding/`)

### OnboardingFlow

**File**: `components/onboarding/onboarding-flow.tsx`

**Purpose**: Multi-step onboarding wizard for new users

**Features**:

- 4-step flow: Welcome → Profile → Preferences → Complete
- Progress indicator
- Skip option
- Form validation
- Profile setup (name, avatar, interests)
- Preferences (notifications, language, accessibility)
- Completion persistence

**Props**:

```typescript
interface OnboardingFlowProps {
  onComplete?: () => void
  onSkip?: () => void
}
```

**Usage**:

```tsx
import { OnboardingFlow } from '@/components/onboarding'
;<OnboardingFlow
  onComplete={() => {
    router.push('/pt/home')
  }}
  onSkip={() => {
    router.push('/pt/chat')
  }}
/>
```

**Onboarding Steps**:

1. **Welcome**
   - Platform introduction
   - Key features overview
   - "Get Started" CTA

2. **Profile Setup**
   - Display name
   - Avatar selection (6 options)
   - Areas of interest (checkboxes)

3. **Preferences**
   - Notification settings
   - Language preference
   - Accessibility features
   - Email digest frequency

4. **Complete**
   - Summary of selections
   - Quick links to start
   - "Start Exploring" button

---

## UI Primitives (`components/ui/`)

The `ui/` directory contains reusable primitives based on [shadcn/ui](https://ui.shadcn.com/). These are low-level building blocks used throughout the application.

**Common Components**:

- `button.tsx` - Button variants (default, destructive, outline, ghost, link)
- `card.tsx` - Card container with header, content, footer
- `input.tsx` - Text input with validation states
- `label.tsx` - Form label
- `select.tsx` - Dropdown select
- `textarea.tsx` - Multi-line text input
- `tooltip.tsx` - Hover tooltip
- `dialog.tsx` - Modal dialog
- `dropdown-menu.tsx` - Dropdown menu
- `tabs.tsx` - Tab navigation
- `badge.tsx` - Status badge
- `skeleton.tsx` - Loading skeleton
- `toast.tsx` - Toast notifications

**See Also**: [shadcn/ui Documentation](https://ui.shadcn.com/docs)

---

## Component Development Guidelines

### Creating New Components

**1. File Structure**:

```
components/
└── [category]/
    ├── component-name.tsx       # Main component
    ├── component-name.test.tsx  # Unit tests
    ├── index.ts                 # Re-export
    └── lazy.tsx                 # Lazy-loaded version (optional)
```

**2. Component Template**:

```tsx
'use client'

import React from 'react'
import { cn } from '@/lib/utils'

/**
 * ComponentName
 *
 * [Brief description of component purpose]
 *
 * Features:
 * - [Feature 1]
 * - [Feature 2]
 * - [Feature 3]
 */

interface ComponentNameProps {
  /**
   * [Prop description]
   */
  propName: PropType

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Child elements
   */
  children?: React.ReactNode
}

export function ComponentName({ propName, className, children }: ComponentNameProps) {
  return <div className={cn('base-classes', className)}>{children}</div>
}
```

**3. Export in index.ts**:

```typescript
export * from './component-name'
```

**4. Lazy Loading** (for heavy components):

```tsx
// lazy.tsx
import dynamic from 'next/dynamic'

export const ComponentNameLazy = dynamic(
  () => import('./component-name').then((mod) => mod.ComponentName),
  {
    loading: () => <ComponentNameSkeleton />,
    ssr: false,
  }
)
```

### Accessibility Checklist

When creating components, ensure:

- ✅ Semantic HTML elements
- ✅ ARIA labels and roles
- ✅ Keyboard navigation
- ✅ Focus indicators (visible)
- ✅ Color contrast (WCAG AA minimum)
- ✅ Screen reader announcements (live regions)
- ✅ Form labels properly associated
- ✅ Error messages descriptive
- ✅ Touch targets ≥44px (mobile)

### Testing Components

**Unit Tests** (Vitest):

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ComponentName } from './component-name'

describe('ComponentName', () => {
  it('renders children', () => {
    render(<ComponentName>Test</ComponentName>)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<ComponentName className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
```

**Accessibility Tests** (jest-axe):

```tsx
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

it('should not have accessibility violations', async () => {
  const { container } = render(<ComponentName />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

---

## Storybook Integration

All components should have corresponding Storybook stories for visual development and documentation.

**Story Template**:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { ComponentName } from './component-name'

const meta: Meta<typeof ComponentName> = {
  title: 'Components/Category/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ComponentName>

export const Default: Story = {
  args: {
    propName: 'value',
  },
}

export const WithChildren: Story = {
  args: {
    children: 'Example content',
  },
}

export const CustomStyling: Story = {
  args: {
    className: 'bg-red-500 text-white',
    children: 'Custom',
  },
}
```

**Run Storybook**:

```bash
npm run storybook
```

Navigate to [http://localhost:6006](http://localhost:6006)

---

## Performance Optimization

### Lazy Loading

For components that are:

- Heavy (large bundle size)
- Below the fold
- Conditionally rendered

Use dynamic imports:

```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/heavy-component'), {
  loading: () => <Skeleton />,
  ssr: false, // Disable SSR if client-only
})
```

### Memoization

For expensive re-renders:

```tsx
import { memo } from 'react'

export const ExpensiveComponent = memo(
  ({ data }: Props) => {
    // Expensive calculations here
    return <div>{/* ... */}</div>
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return prevProps.data.id === nextProps.data.id
  }
)
```

### Code Splitting

Category-level code splitting:

```tsx
// components/charts/lazy.tsx
export const LineChartLazy = dynamic(() => import('./line-chart').then((m) => m.LineChart))
export const BarChartLazy = dynamic(() => import('./bar-chart').then((m) => m.BarChart))
export const PieChartLazy = dynamic(() => import('./pie-chart').then((m) => m.PieChart))
```

---

## Related Documentation

- [Component Development Guide](../guides/COMPONENT-DEVELOPMENT.md) - Development patterns
- [Design System v2](../design/design-system-v2.md) - Design tokens and guidelines
- [Accessibility Documentation](../accessibility-vlibras.md) - VLibras and a11y features
- [Testing Strategy](../guides/TESTING.md) - Component testing approaches
- [Storybook Documentation](./storybook.md) - Visual development guide

---

**Maintained by**: Frontend Team
**Last Review**: 2025-01-25
**Next Review**: 2025-04-25 (Quarterly)
