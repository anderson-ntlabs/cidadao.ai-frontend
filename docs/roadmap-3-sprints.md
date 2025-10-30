# 🚀 Roadmap Completo - 3 Sprints de Desenvolvimento

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data de Criação**: 2025-01-30 18:30:00 -0300
**Última Atualização**: 2025-01-30 19:15:00 -0300
**Duração Total**: 8-12 dias úteis (ajustado)
**Objetivo**: Elevar a qualidade, UX e acessibilidade do Cidadão.AI Frontend

---

## 🎉 ATUALIZAÇÃO IMPORTANTE (2025-01-30)

**Descoberta:** O projeto JÁ TEM uma excelente base de testes!

```
✅ Vitest configurado e funcionando
✅ 1129 testes passando (56 test files)
✅ Coverage estimado: 60-70%
✅ Testing Library instalado
⚠️  Apenas 11 testes falhando (button size classes - fácil fix)
```

**Impacto no Roadmap:**
- ✅ Sprint 1 reduzido de 3-5 dias para 2-3 dias
- ✅ Foco mudou de "setup" para "expansão"
- ✅ Duração total: 10-15 dias → 8-12 dias
- ✅ Mais tempo para visualizações e UX

---

## 📊 Visão Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROADMAP 3 SPRINTS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Sprint 1 (3-5 dias)  │  Sprint 2 (5-7 dias)  │  Sprint 3 (2-3 dias) │
│  ─────────────────────┼───────────────────────┼──────────────────    │
│  🧪 Testes +          │  📊 Visualizações +   │  🎯 Onboarding +     │
│  ♿ A11y Foundations  │  ♿ A11y Charts       │  ♿ A11y Final       │
│                       │                       │                      │
└─────────────────────────────────────────────────────────────────┘
```

**Princípios:**
- ✅ Acessibilidade em TODOS os sprints (não é "extra", é core)
- ✅ Mobile-first em tudo
- ✅ Performance otimizada
- ✅ Testes para cada feature nova
- ✅ Documentação inline

---

## 🏃 SPRINT 1: Fundação Sólida (2-3 dias)

### 🎯 Objetivos
- ✅ **JÁ TEMOS**: Vitest configurado + 1129 testes passando!
- Corrigir 11 testes falhando (button size classes)
- Implementar fundações de acessibilidade
- Aumentar coverage de componentes novos

### 📊 Status Atual dos Testes

```
✅ Vitest + Testing Library: CONFIGURADO
✅ Test Files: 56 passed
✅ Tests: 1129 passed (11 failed - minor)
✅ Coverage: ~60-70% (estimado)
✅ Scripts disponíveis:
   - npm test
   - npm run test:watch
   - npm run test:coverage
   - npm run test:ui
```

### 📦 Deliverables

#### 1. Correção de Testes Existentes

**Dia 1: Fix Failing Tests (1-2h)**

**Testes falhando:**
- `__tests__/unit/components/button.test.tsx`: 11 failures
  - Problema: Size classes mudaram (h-8 → h-9, h-12 → h-14, etc)
  - Solução: Atualizar expectations nos testes

```bash
# Rodar testes e ver failures
npm run test:coverage

# Fix específico do button
npm test button.test
```

**Arquivo a corrigir:**

```typescript
// __tests__/unit/components/button.test.tsx
// Atualizar expectations para novos tamanhos:

describe('Sizes', () => {
  it('applies small size classes', () => {
    render(<Button size="sm">Small</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-9') // Era h-8
  })

  it('applies large size classes', () => {
    render(<Button size="lg">Large</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-14') // Era h-12
  })

  it('applies icon size classes', () => {
    render(<Button size="icon">🔍</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-11', 'w-11') // Era h-10 w-10
  })
})
```

**Dia 1-2: Testes para Componentes Novos**

Adicionar testes para componentes criados recentemente:
- 🆕 `components/chat/message-bubble.test.tsx`
- 🆕 `components/chat/agent-avatar.test.tsx`
- 🆕 `components/chat/smart-suggestions.test.tsx`
- 🆕 `components/a11y/vlibras-widget.test.tsx`
- 🆕 `components/a11y/accessibility-panel.test.tsx`

**Exemplo:**
```typescript
// components/chat/__tests__/message-bubble.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MessageBubble } from '../message-bubble'

describe('MessageBubble', () => {
  it('renders user message correctly', () => {
    render(
      <MessageBubble content="Hello" role="user" />
    )
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('renders assistant message with markdown', () => {
    render(
      <MessageBubble
        content="**Bold text**"
        role="assistant"
        agentName="Abaporu"
      />
    )
    expect(screen.getByText('Bold text')).toBeInTheDocument()
  })

  it('shows copy button and handles click', async () => {
    render(
      <MessageBubble content="Copy me" role="assistant" />
    )
    const copyButton = screen.getByLabelText('Copiar mensagem')
    fireEvent.click(copyButton)
    // Verify toast was shown
    expect(screen.getByText('Copiado!')).toBeInTheDocument()
  })

  it('is keyboard accessible', () => {
    render(
      <MessageBubble content="Test" role="assistant" />
    )
    const copyButton = screen.getByLabelText('Copiar mensagem')
    copyButton.focus()
    expect(copyButton).toHaveFocus()
  })
})
```

---

#### 2. Melhorias de Acessibilidade - Fase 1

**Dia 3-4: Fundações A11y**

**2.1. Keyboard Navigation Manager**

Criar sistema centralizado de navegação por teclado:

```typescript
// lib/a11y/keyboard-navigation.ts

export const KEYBOARD_SHORTCUTS = {
  // Navegação global
  OPEN_MENU: 'Alt+M',
  OPEN_SEARCH: 'Alt+S',
  OPEN_SETTINGS: 'Alt+,',
  OPEN_HELP: 'Alt+H',
  CLOSE_MODAL: 'Escape',

  // Chat
  FOCUS_INPUT: 'Alt+I',
  SEND_MESSAGE: 'Ctrl+Enter',
  NEW_CHAT: 'Alt+N',

  // Acessibilidade
  TOGGLE_A11Y_PANEL: 'Alt+A',
  INCREASE_FONT: 'Alt+=',
  DECREASE_FONT: 'Alt+-',
  TOGGLE_HIGH_CONTRAST: 'Alt+C',
  TOGGLE_SCREEN_READER: 'Alt+R',
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = `${e.altKey ? 'Alt+' : ''}${e.ctrlKey ? 'Ctrl+' : ''}${e.key}`

      // Implementar lógica de shortcuts
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])
}
```

**2.2. Focus Management**

```typescript
// components/a11y/focus-trap.tsx
'use client'

import { useEffect, useRef } from 'react'

interface FocusTrapProps {
  children: React.ReactNode
  active: boolean
  onEscape?: () => void
}

export function FocusTrap({ children, active, onEscape }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return

    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape()
      }
    }

    container.addEventListener('keydown', handleTabKey)
    container.addEventListener('keydown', handleEscape)

    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
      container.removeEventListener('keydown', handleEscape)
    }
  }, [active, onEscape])

  return (
    <div ref={containerRef} role="dialog" aria-modal="true">
      {children}
    </div>
  )
}
```

**2.3. Announce Component (Screen Reader)**

```typescript
// components/a11y/announcer.tsx
'use client'

import { useEffect, useState } from 'react'

export function LiveAnnouncer() {
  const [messages, setMessages] = useState<Array<{ id: string; text: string; priority: 'polite' | 'assertive' }>>([])

  useEffect(() => {
    const handleAnnounce = (e: CustomEvent) => {
      const { text, priority = 'polite' } = e.detail
      setMessages(prev => [...prev, { id: Date.now().toString(), text, priority }])

      // Clear after announcement
      setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== e.detail.id))
      }, 1000)
    }

    window.addEventListener('announce', handleAnnounce as EventListener)
    return () => window.removeEventListener('announce', handleAnnounce as EventListener)
  }, [])

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {messages.filter(m => m.priority === 'polite').map(m => (
          <p key={m.id}>{m.text}</p>
        ))}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {messages.filter(m => m.priority === 'assertive').map(m => (
          <p key={m.id}>{m.text}</p>
        ))}
      </div>
    </>
  )
}

// Helper function to trigger announcements
export function announce(text: string, priority: 'polite' | 'assertive' = 'polite') {
  window.dispatchEvent(new CustomEvent('announce', { detail: { text, priority } }))
}
```

**2.4. Redução de Animações**

```typescript
// hooks/use-reduced-motion.ts
'use client'

import { useEffect, useState } from 'react'

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}
```

**Uso no Tailwind CSS:**
```typescript
// Componente que respeita preferência
<div className={cn(
  "transition-all duration-300",
  prefersReducedMotion ? "motion-reduce:transition-none" : "animate-fade-in"
)}>
```

**2.5. Adicionar em Settings**

```typescript
// app/pt/app/configuracoes/page.tsx
// Adicionar nova seção:

<div className="space-y-4">
  <h3>Animações</h3>
  <Toggle
    checked={reduceAnimations}
    onChange={(checked) => {
      setReduceAnimations(checked)
      if (checked) {
        document.documentElement.classList.add('motion-reduce')
      } else {
        document.documentElement.classList.remove('motion-reduce')
      }
    }}
  >
    Reduzir animações
  </Toggle>
  <p className="text-sm text-gray-500">
    Desabilita animações e transições para reduzir distração
  </p>
</div>
```

---

### ✅ Sprint 1 - Checklist Final

**Testes:**
- [ ] Jest configurado
- [ ] 10+ componentes com testes
- [ ] Coverage >70%
- [ ] CI pipeline com testes
- [ ] Documentação de como escrever testes

**Acessibilidade:**
- [ ] Keyboard shortcuts system
- [ ] Focus trap para modals
- [ ] Live announcer para screen readers
- [ ] Redução de animações
- [ ] Settings atualizados com opções A11y

**Comandos novos:**
```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
npm run test:ci         # CI pipeline
```

**Métricas de Sucesso:**
- ✅ >70% code coverage
- ✅ 100% componentes UI com testes
- ✅ Keyboard navigation em todas as páginas
- ✅ Lighthouse Accessibility score >95

---

## 📊 SPRINT 2: Visualizações de Dados (5-7 dias)

### 🎯 Objetivos
- Criar visualizações interativas e acessíveis
- Implementar dashboard de gastos
- Export avançado de dados

### 📦 Deliverables

#### 1. Setup de Bibliotecas

**Dia 1: Instalação e Configuração**

```bash
# Visualizações
npm install recharts         # Gráficos React
npm install react-map-gl     # Mapas interativos
npm install mapbox-gl        # Mapbox
npm install d3               # D3 para custom viz

# Export avançado
npm install jspdf            # PDF generation
npm install jspdf-autotable  # Tables em PDF
npm install xlsx             # Excel export
npm install html2canvas      # Canvas para PDF
```

**Configuração TypeScript:**
```typescript
// types/charts.ts
export interface ChartData {
  name: string
  value: number
  color?: string
  metadata?: Record<string, any>
}

export interface TimeSeriesData {
  date: string
  value: number
  category?: string
}

export interface GeoData {
  state: string
  value: number
  lat: number
  lng: number
}
```

---

#### 2. Componentes de Visualização Acessíveis

**Dia 2-3: Gráficos Base**

**2.1. Expense Pie Chart (Acessível)**

```typescript
// components/visualizations/expense-pie-chart.tsx
'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { announce } from '@/components/a11y/announcer'

interface ExpensePieChartProps {
  data: ChartData[]
  title: string
}

export function ExpensePieChart({ data, title }: ExpensePieChartProps) {
  const prefersReducedMotion = useReducedMotion()
  const totalValue = data.reduce((acc, item) => acc + item.value, 0)

  const handleSliceClick = (entry: any) => {
    const percentage = ((entry.value / totalValue) * 100).toFixed(1)
    announce(
      `${entry.name}: R$ ${entry.value.toLocaleString('pt-BR')} (${percentage}%)`,
      'polite'
    )
  }

  return (
    <div className="w-full" role="img" aria-label={title}>
      {/* Tabela alternativa para screen readers */}
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Valor</th>
            <th>Percentual</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.name}>
              <td>{item.name}</td>
              <td>R$ {item.value.toLocaleString('pt-BR')}</td>
              <td>{((item.value / totalValue) * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Gráfico visual */}
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label
            onClick={handleSliceClick}
            animationDuration={prefersReducedMotion ? 0 : 800}
            tabIndex={0}
            aria-label="Gráfico de pizza interativo"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || COLORS[index % COLORS.length]}
                tabIndex={0}
                aria-label={`${entry.name}: ${entry.value}`}
              />
            ))}
          </Pie>
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'transparent' }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ paddingTop: '20px' }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legenda textual para acessibilidade */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>Use as setas do teclado para navegar entre os setores. Pressione Enter para ouvir os detalhes.</p>
      </div>
    </div>
  )
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <p className="font-semibold">{payload[0].name}</p>
      <p className="text-green-600 dark:text-green-400">
        R$ {payload[0].value.toLocaleString('pt-BR')}
      </p>
      <p className="text-sm text-gray-500">
        {((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}%
      </p>
    </div>
  )
}
```

**2.2. Timeline Chart (Gastos ao longo do tempo)**

```typescript
// components/visualizations/timeline-chart.tsx
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface TimelineChartProps {
  data: TimeSeriesData[]
  title: string
}

export function TimelineChart({ data, title }: TimelineChartProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="w-full" role="img" aria-label={title}>
      {/* Tabela alternativa para screen readers */}
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th>Data</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.date}>
              <td>{new Date(item.date).toLocaleDateString('pt-BR')}</td>
              <td>R$ {item.value.toLocaleString('pt-BR')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { month: 'short' })}
          />
          <YAxis
            tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(1)}M`}
          />
          <Tooltip content={<TimelineTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={prefersReducedMotion ? 0 : 1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function TimelineTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border">
      <p className="text-sm text-gray-500">
        {new Date(payload[0].payload.date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })}
      </p>
      <p className="font-semibold text-green-600 dark:text-green-400">
        R$ {payload[0].value.toLocaleString('pt-BR')}
      </p>
    </div>
  )
}
```

**2.3. Bar Chart (Top Contratos)**

```typescript
// components/visualizations/bar-chart.tsx
'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

export function ContractsBarChart({ data, title }: { data: ChartData[], title: string }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="w-full" role="img" aria-label={title}>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th>Fornecedor</th>
            <th>Valor Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.name}>
              <td>{item.name}</td>
              <td>R$ {item.value.toLocaleString('pt-BR')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(1)}M`}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={150}
          />
          <Tooltip content={<BarTooltip />} />
          <Bar
            dataKey="value"
            fill="#10b981"
            radius={[0, 4, 4, 0]}
            animationDuration={prefersReducedMotion ? 0 : 1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function BarTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border">
      <p className="font-semibold">{payload[0].payload.name}</p>
      <p className="text-green-600 dark:text-green-400">
        R$ {payload[0].value.toLocaleString('pt-BR')}
      </p>
      {payload[0].payload.metadata?.contractCount && (
        <p className="text-sm text-gray-500">
          {payload[0].payload.metadata.contractCount} contratos
        </p>
      )}
    </div>
  )
}
```

**2.4. Mapa Interativo (Gastos por Estado)**

```typescript
// components/visualizations/brazil-map.tsx
'use client'

import { useState } from 'react'
import Map, { Marker, Popup } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface BrazilMapProps {
  data: GeoData[]
  title: string
}

export function BrazilMap({ data, title }: BrazilMapProps) {
  const [selectedState, setSelectedState] = useState<GeoData | null>(null)

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden" role="img" aria-label={title}>
      {/* Tabela alternativa para screen readers */}
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th>Estado</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.state}>
              <td>{item.state}</td>
              <td>R$ {item.value.toLocaleString('pt-BR')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Map
        initialViewState={{
          latitude: -14.235,
          longitude: -51.9253,
          zoom: 3.5
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      >
        {data.map((state) => (
          <Marker
            key={state.state}
            latitude={state.lat}
            longitude={state.lng}
            onClick={() => setSelectedState(state)}
          >
            <button
              className="w-8 h-8 rounded-full bg-green-500 border-2 border-white shadow-lg hover:scale-110 transition-transform"
              style={{
                opacity: 0.7 + (state.value / Math.max(...data.map(d => d.value))) * 0.3
              }}
              aria-label={`${state.state}: R$ ${state.value.toLocaleString('pt-BR')}`}
            />
          </Marker>
        ))}

        {selectedState && (
          <Popup
            latitude={selectedState.lat}
            longitude={selectedState.lng}
            onClose={() => setSelectedState(null)}
            closeButton={true}
            closeOnClick={false}
          >
            <div className="p-2">
              <h3 className="font-bold">{selectedState.state}</h3>
              <p className="text-green-600">
                R$ {selectedState.value.toLocaleString('pt-BR')}
              </p>
            </div>
          </Popup>
        )}
      </Map>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>Clique nos marcadores para ver detalhes. Use Tab para navegar entre estados.</p>
      </div>
    </div>
  )
}
```

---

#### 3. Dashboard de Visualizações

**Dia 4: Página de Dashboard**

```typescript
// app/pt/app/visualizacoes/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { ExpensePieChart } from '@/components/visualizations/expense-pie-chart'
import { TimelineChart } from '@/components/visualizations/timeline-chart'
import { ContractsBarChart } from '@/components/visualizations/bar-chart'
import { BrazilMap } from '@/components/visualizations/brazil-map'
import { Button } from '@/components/ui/button'
import { Download, Share2 } from 'lucide-react'
import { exportDashboardToPDF } from '@/lib/export/pdf-export'

export default function VisualizacoesPage() {
  const [mockData, setMockData] = useState(null)

  useEffect(() => {
    // Load mock data
    setMockData(generateMockData())
  }, [])

  const handleExport = async () => {
    await exportDashboardToPDF(mockData)
  }

  if (!mockData) return <LoadingSkeleton />

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Visualizações de Gastos Públicos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Explore os dados de transparência de forma visual e interativa
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" leftIcon={<Share2 />}>
            Compartilhar
          </Button>
          <Button onClick={handleExport} leftIcon={<Download />}>
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Grid de Visualizações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gastos por Ministério */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Gastos por Ministério</h2>
          <ExpensePieChart
            data={mockData.ministries}
            title="Distribuição de gastos entre ministérios"
          />
        </div>

        {/* Timeline de Gastos */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Evolução Mensal</h2>
          <TimelineChart
            data={mockData.timeline}
            title="Gastos públicos ao longo do ano"
          />
        </div>

        {/* Top Contratos */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Maiores Contratos</h2>
          <ContractsBarChart
            data={mockData.topContracts}
            title="Top 10 contratos por valor"
          />
        </div>

        {/* Mapa do Brasil */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Gastos por Estado</h2>
          <BrazilMap
            data={mockData.states}
            title="Distribuição geográfica de gastos"
          />
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Gasto"
          value={`R$ ${mockData.total.toLocaleString('pt-BR')}`}
          change="+12%"
          positive={false}
        />
        <StatCard
          title="Contratos Ativos"
          value={mockData.activeContracts.toLocaleString('pt-BR')}
          change="+5%"
          positive={true}
        />
        <StatCard
          title="Fornecedores"
          value={mockData.suppliers.toLocaleString('pt-BR')}
          change="-2%"
          positive={true}
        />
        <StatCard
          title="Economizado"
          value={`R$ ${mockData.saved.toLocaleString('pt-BR')}`}
          change="+8%"
          positive={true}
        />
      </div>
    </div>
  )
}

function StatCard({ title, value, change, positive }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className={cn(
        "text-sm mt-1",
        positive ? "text-green-600" : "text-red-600"
      )}>
        {change}
      </p>
    </div>
  )
}

// Mock data generator
function generateMockData() {
  return {
    total: 1250000000,
    activeContracts: 1523,
    suppliers: 487,
    saved: 45000000,
    ministries: [
      { name: 'Saúde', value: 350000000, color: '#10b981' },
      { name: 'Educação', value: 280000000, color: '#3b82f6' },
      { name: 'Infraestrutura', value: 220000000, color: '#f59e0b' },
      { name: 'Defesa', value: 180000000, color: '#ef4444' },
      { name: 'Outros', value: 220000000, color: '#8b5cf6' },
    ],
    timeline: generateTimelineData(),
    topContracts: generateTopContracts(),
    states: generateStatesData(),
  }
}
```

---

#### 4. Export Avançado

**Dia 5: Sistema de Export**

```typescript
// lib/export/pdf-export.ts
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'

export async function exportDashboardToPDF(data: any) {
  const pdf = new jsPDF('p', 'mm', 'a4')

  // Header
  pdf.setFontSize(20)
  pdf.setTextColor(16, 185, 129) // Green
  pdf.text('Cidadão.AI - Relatório de Transparência', 20, 20)

  pdf.setFontSize(12)
  pdf.setTextColor(100)
  pdf.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 20, 28)

  // Stats summary
  pdf.setFontSize(14)
  pdf.setTextColor(0)
  pdf.text('Resumo Executivo', 20, 40)

  autoTable(pdf, {
    startY: 45,
    head: [['Métrica', 'Valor']],
    body: [
      ['Total Gasto', `R$ ${data.total.toLocaleString('pt-BR')}`],
      ['Contratos Ativos', data.activeContracts.toLocaleString('pt-BR')],
      ['Fornecedores', data.suppliers.toLocaleString('pt-BR')],
      ['Economizado', `R$ ${data.saved.toLocaleString('pt-BR')}`],
    ],
  })

  // Capture charts as images
  const charts = document.querySelectorAll('.recharts-wrapper')
  let yPos = (pdf as any).lastAutoTable.finalY + 15

  for (let i = 0; i < charts.length; i++) {
    const canvas = await html2canvas(charts[i] as HTMLElement)
    const imgData = canvas.toDataURL('image/png')

    if (yPos > 250) {
      pdf.addPage()
      yPos = 20
    }

    pdf.addImage(imgData, 'PNG', 20, yPos, 170, 100)
    yPos += 110
  }

  // Footer
  const pageCount = (pdf as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i)
    pdf.setFontSize(10)
    pdf.setTextColor(150)
    pdf.text(
      `Página ${i} de ${pageCount}`,
      pdf.internal.pageSize.width / 2,
      pdf.internal.pageSize.height - 10,
      { align: 'center' }
    )
  }

  // Save
  pdf.save(`cidadao-ai-relatorio-${Date.now()}.pdf`)
}

// Excel export
export function exportToExcel(data: any) {
  const XLSX = require('xlsx')

  const wb = XLSX.utils.book_new()

  // Sheet 1: Summary
  const summaryData = [
    ['Métrica', 'Valor'],
    ['Total Gasto', data.total],
    ['Contratos Ativos', data.activeContracts],
    ['Fornecedores', data.suppliers],
    ['Economizado', data.saved],
  ]
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, ws1, 'Resumo')

  // Sheet 2: Ministries
  const ministriesData = [
    ['Ministério', 'Valor'],
    ...data.ministries.map((m: any) => [m.name, m.value])
  ]
  const ws2 = XLSX.utils.aoa_to_sheet(ministriesData)
  XLSX.utils.book_append_sheet(wb, ws2, 'Ministérios')

  // Sheet 3: Timeline
  const timelineData = [
    ['Data', 'Valor'],
    ...data.timeline.map((t: any) => [t.date, t.value])
  ]
  const ws3 = XLSX.utils.aoa_to_sheet(timelineData)
  XLSX.utils.book_append_sheet(wb, ws3, 'Evolução')

  // Save
  XLSX.writeFile(wb, `cidadao-ai-dados-${Date.now()}.xlsx`)
}
```

---

#### 5. Integração com Chat

**Dia 6-7: Visualizações no Chat**

```typescript
// components/chat/visualization-message.tsx
'use client'

import { useState } from 'react'
import { ExpensePieChart } from '@/components/visualizations/expense-pie-chart'
import { TimelineChart } from '@/components/visualizations/timeline-chart'
import { Button } from '@/components/ui/button'
import { Maximize2, Download } from 'lucide-react'

interface VisualizationMessageProps {
  type: 'pie' | 'line' | 'bar' | 'map'
  data: any
  title: string
}

export function VisualizationMessage({ type, data, title }: VisualizationMessageProps) {
  const [expanded, setExpanded] = useState(false)

  const renderChart = () => {
    switch (type) {
      case 'pie':
        return <ExpensePieChart data={data} title={title} />
      case 'line':
        return <TimelineChart data={data} title={title} />
      // ... outros tipos
    }
  }

  return (
    <div className="my-4 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          📊 {title}
        </h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Maximize2 className="w-4 h-4" />}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Minimizar' : 'Expandir'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Download className="w-4 h-4" />}
          >
            Exportar
          </Button>
        </div>
      </div>

      <div className={expanded ? 'h-[600px]' : 'h-[300px]'}>
        {renderChart()}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        💡 Dica: Clique nos elementos do gráfico para mais detalhes
      </p>
    </div>
  )
}
```

**Atualizar MessageBubble para detectar visualizações:**

```typescript
// components/chat/message-bubble.tsx
// Adicionar lógica para detectar quando resposta contém dados para visualização

const detectVisualization = (content: string) => {
  // Detecta padrões como [VISUALIZATION:pie:data]
  const match = content.match(/\[VISUALIZATION:(\w+):(.+?)\]/)
  if (match) {
    return {
      type: match[1],
      dataKey: match[2]
    }
  }
  return null
}

// No render:
{visualization && (
  <VisualizationMessage
    type={visualization.type}
    data={parseVisualizationData(visualization.dataKey)}
    title="Visualização dos dados"
  />
)}
```

---

### ✅ Sprint 2 - Checklist Final

**Visualizações:**
- [ ] 4 tipos de gráficos implementados
- [ ] Todos os gráficos acessíveis (tabelas alternativas)
- [ ] Animações respeitam preferências
- [ ] Mapa interativo do Brasil
- [ ] Dashboard completo

**Export:**
- [ ] PDF com gráficos e tabelas
- [ ] Excel com múltiplas sheets
- [ ] Export de gráficos individuais
- [ ] Compartilhamento social

**Integração:**
- [ ] Visualizações no chat
- [ ] Detecção automática de dados para viz
- [ ] Expandir/minimizar gráficos
- [ ] Export inline

**Testes:**
- [ ] Testes para cada componente de visualização
- [ ] Testes de acessibilidade
- [ ] Testes de export

**Métricas de Sucesso:**
- ✅ 4+ tipos de visualizações
- ✅ 100% acessíveis (com tabelas alternativas)
- ✅ Lighthouse Performance >90
- ✅ Lighthouse Accessibility >95

---

## 🎯 SPRINT 3: Onboarding & UX Final (2-3 dias)

### 🎯 Objetivos
- Melhorar experiência de novos usuários
- Tutorial interativo
- Acessibilidade final touches

### 📦 Deliverables

#### 1. Sistema de Onboarding

**Dia 1: Tutorial Interativo**

```bash
npm install intro.js react-joyride
```

```typescript
// components/onboarding/interactive-tour.tsx
'use client'

import { useState, useEffect } from 'react'
import Joyride, { Step, CallBackProps } from 'react-joyride'
import { useRouter } from 'next/navigation'

const TOUR_STEPS: Step[] = [
  {
    target: 'body',
    content: (
      <div>
        <h2 className="text-xl font-bold mb-2">Bem-vindo ao Cidadão.AI! 👋</h2>
        <p>Vamos fazer um tour rápido pela plataforma?</p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="chat-input"]',
    content: (
      <div>
        <h3 className="font-bold mb-2">Chat com IA</h3>
        <p>Digite suas perguntas aqui. Nossos agentes especializados vão ajudar você a entender os gastos públicos.</p>
      </div>
    ),
  },
  {
    target: '[data-tour="agents"]',
    content: (
      <div>
        <h3 className="font-bold mb-2">17 Agentes Especializados</h3>
        <p>Cada agente tem expertise em uma área específica de transparência pública.</p>
      </div>
    ),
  },
  {
    target: '[data-tour="visualizations"]',
    content: (
      <div>
        <h3 className="font-bold mb-2">Visualizações Interativas</h3>
        <p>Explore os dados através de gráficos, mapas e tabelas interativas.</p>
      </div>
    ),
  },
  {
    target: '[data-tour="accessibility"]',
    content: (
      <div>
        <h3 className="font-bold mb-2">Acessibilidade</h3>
        <p>Personalize a experiência: tamanho de fonte, contraste, VLibras e muito mais.</p>
      </div>
    ),
  },
]

export function InteractiveTour() {
  const [run, setRun] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user has seen tour
    const hasSeenTour = localStorage.getItem('hasSeenTour')
    if (!hasSeenTour) {
      setTimeout(() => setRun(true), 1000)
    }
  }, [])

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data

    if (status === 'finished' || status === 'skipped') {
      localStorage.setItem('hasSeenTour', 'true')
      setRun(false)
    }
  }

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#10b981',
          zIndex: 10000,
        },
      }}
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Finalizar',
        next: 'Próximo',
        skip: 'Pular',
      }}
    />
  )
}
```

**Adicionar data-tour attributes nos componentes:**

```typescript
// app/pt/app/chat/page.tsx
<textarea
  data-tour="chat-input"
  ref={textareaRef}
  // ... rest of props
/>
```

---

#### 2. Página de Exemplos

**Dia 1-2: Casos de Uso Práticos**

```typescript
// app/pt/exemplos/page.tsx
'use client'

import { useState } from 'react'
import { MessageSquare, TrendingUp, AlertTriangle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const EXAMPLES = [
  {
    id: 'contracts',
    icon: FileText,
    title: 'Investigar Contratos Suspeitos',
    description: 'Aprenda a identificar contratos com possíveis irregularidades',
    color: 'blue',
    questions: [
      'Mostre contratos acima de R$ 1 milhão em São Paulo',
      'Existe alguma concentração de fornecedores?',
      'Quais os maiores valores por órgão?',
    ],
  },
  {
    id: 'anomalies',
    icon: AlertTriangle,
    title: 'Detectar Anomalias',
    description: 'Use IA para encontrar padrões suspeitos nos dados',
    color: 'red',
    questions: [
      'Analise anomalias em licitações federais de 2024',
      'Existe sobrepreço em algum contrato?',
      'Quais fornecedores têm comportamento atípico?',
    ],
  },
  {
    id: 'trends',
    icon: TrendingUp,
    title: 'Analisar Tendências',
    description: 'Entenda a evolução dos gastos ao longo do tempo',
    color: 'green',
    questions: [
      'Como evoluíram os gastos com saúde em 2024?',
      'Qual ministério teve maior aumento?',
      'Existe sazonalidade nos gastos?',
    ],
  },
  {
    id: 'reports',
    icon: MessageSquare,
    title: 'Gerar Relatórios',
    description: 'Crie relatórios completos para investigações',
    color: 'purple',
    questions: [
      'Gere um relatório dos gastos de educação',
      'Analise comparativamente os últimos 3 anos',
      'Inclua visualizações e recomendações',
    ],
  },
]

export default function ExemplosPage() {
  const router = useRouter()
  const [selectedExample, setSelectedExample] = useState<string | null>(null)

  const handleTryQuestion = (question: string) => {
    // Save question to localStorage
    localStorage.setItem('pendingQuestion', question)
    // Navigate to chat
    router.push('/pt/app/chat')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Exemplos Práticos</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Explore casos de uso reais e aprenda a usar o Cidadão.AI de forma eficaz
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {EXAMPLES.map((example) => (
            <div
              key={example.id}
              className={cn(
                "bg-white dark:bg-gray-800 rounded-xl p-6 cursor-pointer",
                "border-2 transition-all hover:shadow-lg",
                selectedExample === example.id
                  ? `border-${example.color}-500`
                  : "border-transparent"
              )}
              onClick={() => setSelectedExample(
                selectedExample === example.id ? null : example.id
              )}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-${example.color}-100 dark:bg-${example.color}-900/30`}>
                  <example.icon className={`w-6 h-6 text-${example.color}-600 dark:text-${example.color}-400`} />
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">{example.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {example.description}
                  </p>

                  {selectedExample === example.id && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                      <p className="text-sm font-semibold">Perguntas exemplo:</p>
                      {example.questions.map((question, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTryQuestion(question)
                          }}
                          className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm"
                        >
                          💬 {question}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video Tutorial Section */}
        <div className="mt-12 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">📹 Tutorial em Vídeo</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Assista ao tutorial completo de 5 minutos sobre como usar a plataforma
          </p>

          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
            <p className="text-white">Vídeo tutorial (em breve)</p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <p className="font-semibold">Passo a Passo</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Siga o tutorial guiado
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💡</div>
              <p className="font-semibold">Dicas Práticas</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Aprenda truques úteis
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🚀</div>
              <p className="font-semibold">Começe Rápido</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Em 5 minutos você domina
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

#### 3. FAQ Expandido

**Dia 2: Página de FAQ**

```typescript
// app/pt/faq/page.tsx
'use client'

import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const FAQ_DATA = [
  {
    category: 'Primeiros Passos',
    questions: [
      {
        q: 'Como faço minha primeira pergunta?',
        a: 'Vá até a página de Chat e digite sua pergunta no campo de texto. Nossos agentes especializados irão analisar e responder.',
      },
      {
        q: 'Preciso criar conta?',
        a: 'Sim, para salvar suas investigações e histórico. Você pode se cadastrar com Google, GitHub ou email.',
      },
      {
        q: 'Os dados são oficiais?',
        a: 'Sim, todos os dados vêm do Portal da Transparência do Governo Federal.',
      },
    ],
  },
  {
    category: 'Agentes de IA',
    questions: [
      {
        q: 'O que são os agentes?',
        a: 'São IAs especializadas em diferentes aspectos de transparência pública. Cada agente tem expertise em uma área específica.',
      },
      {
        q: 'Como escolho qual agente usar?',
        a: 'Você não precisa escolher! Nossa IA detecta automaticamente qual agente é melhor para sua pergunta.',
      },
      {
        q: 'Posso conversar com vários agentes ao mesmo tempo?',
        a: 'Sim, o Abaporu (agente mestre) coordena múltiplos agentes quando necessário.',
      },
    ],
  },
  {
    category: 'Visualizações',
    questions: [
      {
        q: 'Como exporto os gráficos?',
        a: 'Clique no botão "Exportar" em qualquer visualização para baixar em PDF, PNG ou Excel.',
      },
      {
        q: 'Posso customizar as visualizações?',
        a: 'Sim, você pode filtrar dados, mudar cores e escolher diferentes tipos de gráficos.',
      },
      {
        q: 'Os gráficos são acessíveis?',
        a: 'Sim! Todos têm tabelas alternativas para screen readers e navegação por teclado.',
      },
    ],
  },
  {
    category: 'Acessibilidade',
    questions: [
      {
        q: 'Como ativo o VLibras?',
        a: 'O VLibras está sempre disponível no canto inferior direito. Clique no ícone azul para ativar.',
      },
      {
        q: 'Como aumento o tamanho da fonte?',
        a: 'Vá em Configurações > Acessibilidade ou use Alt + = para aumentar e Alt + - para diminuir.',
      },
      {
        q: 'Posso usar só o teclado?',
        a: 'Sim! Pressione Alt + H para ver todos os atalhos disponíveis.',
      },
    ],
  },
  {
    category: 'Privacidade e Segurança',
    questions: [
      {
        q: 'Meus dados estão seguros?',
        a: 'Sim. Usamos criptografia end-to-end e seguimos a LGPD.',
      },
      {
        q: 'Vocês vendem meus dados?',
        a: 'Nunca. Seus dados são privados e não são compartilhados com terceiros.',
      },
      {
        q: 'Como deletar minha conta?',
        a: 'Vá em Configurações > Conta > Deletar Conta. Todos os seus dados serão removidos.',
      },
    ],
  },
]

export default function FAQPage() {
  const [search, setSearch] = useState('')
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const filteredFAQ = FAQ_DATA.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(search.toLowerCase()) ||
           q.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0)

  const toggleItem = (key: string) => {
    const newSet = new Set(openItems)
    if (newSet.has(key)) {
      newSet.delete(key)
    } else {
      newSet.add(key)
    }
    setOpenItems(newSet)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Perguntas Frequentes</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Encontre respostas para as dúvidas mais comuns
        </p>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar perguntas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
        </div>

        {/* FAQ Categories */}
        <div className="space-y-6">
          {filteredFAQ.map((category) => (
            <div key={category.category}>
              <h2 className="text-xl font-bold mb-4">{category.category}</h2>
              <div className="space-y-2">
                {category.questions.map((item, idx) => {
                  const key = `${category.category}-${idx}`
                  const isOpen = openItems.has(key)

                  return (
                    <div
                      key={key}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className="font-medium">{item.q}</span>
                        <ChevronDown
                          className={cn(
                            "w-5 h-5 text-gray-500 transition-transform",
                            isOpen && "rotate-180"
                          )}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-6 pb-4 text-gray-600 dark:text-gray-400 animate-in slide-in-from-top-2">
                          {item.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-12 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ainda tem dúvidas?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Entre em contato conosco ou teste diretamente no chat!
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push('/pt/app/chat')}>
              Perguntar no Chat
            </Button>
            <Button variant="outline">
              Contato
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

#### 4. Acessibilidade - Final Touches

**Dia 3: Melhorias Finais**

**4.1. Atalhos de Teclado - Modal de Ajuda**

```typescript
// components/a11y/keyboard-shortcuts-modal.tsx
'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FocusTrap } from './focus-trap'

const SHORTCUTS = [
  {
    category: 'Navegação Global',
    shortcuts: [
      { keys: ['Alt', 'M'], description: 'Abrir menu' },
      { keys: ['Alt', 'S'], description: 'Buscar' },
      { keys: ['Alt', ','], description: 'Configurações' },
      { keys: ['Alt', 'H'], description: 'Ajuda' },
      { keys: ['Esc'], description: 'Fechar modal' },
    ],
  },
  {
    category: 'Chat',
    shortcuts: [
      { keys: ['Alt', 'I'], description: 'Focar no campo de entrada' },
      { keys: ['Ctrl', 'Enter'], description: 'Enviar mensagem' },
      { keys: ['Alt', 'N'], description: 'Novo chat' },
    ],
  },
  {
    category: 'Acessibilidade',
    shortcuts: [
      { keys: ['Alt', 'A'], description: 'Painel de acessibilidade' },
      { keys: ['Alt', '='], description: 'Aumentar fonte' },
      { keys: ['Alt', '-'], description: 'Diminuir fonte' },
      { keys: ['Alt', 'C'], description: 'Alto contraste' },
      { keys: ['Alt', 'R'], description: 'Screen reader' },
    ],
  },
]

export function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'h') {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <FocusTrap active={isOpen} onEscape={() => setIsOpen(false)}>
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Atalhos de Teclado</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {SHORTCUTS.map((category) => (
              <div key={category.category}>
                <h3 className="font-bold text-lg mb-3">{category.category}</h3>
                <div className="space-y-2">
                  {category.shortcuts.map((shortcut, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {shortcut.description}
                      </span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key) => (
                          <kbd
                            key={key}
                            className="px-2 py-1 text-sm font-mono bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              💡 Dica: Pressione <kbd className="px-2 py-1 text-xs font-mono bg-white dark:bg-gray-800 rounded border">Alt + H</kbd> a qualquer momento para ver esta ajuda
            </p>
          </div>
        </div>
      </FocusTrap>
    </div>
  )
}
```

**4.2. Adicionar ao Layout**

```typescript
// app/pt/layout.tsx
import { KeyboardShortcutsModal } from '@/components/a11y/keyboard-shortcuts-modal'
import { LiveAnnouncer } from '@/components/a11y/announcer'

// No body:
<body>
  <LiveAnnouncer />
  <KeyboardShortcutsModal />
  {/* ... rest */}
</body>
```

---

### ✅ Sprint 3 - Checklist Final

**Onboarding:**
- [ ] Tutorial interativo (Joyride)
- [ ] Página de exemplos com casos reais
- [ ] FAQ expandido com busca
- [ ] Vídeo tutorial (placeholder)

**UX:**
- [ ] Welcome screen para new users
- [ ] Tooltips em elementos complexos
- [ ] Feedback visual em todas as ações
- [ ] Loading states consistentes

**Acessibilidade Final:**
- [ ] Modal de atalhos de teclado
- [ ] Live announcer funcionando
- [ ] Todos os componentes navegáveis por teclado
- [ ] Teste com screen reader completo

**Documentação:**
- [ ] README atualizado
- [ ] Guia de contribuição
- [ ] Changelog
- [ ] API docs

**Métricas de Sucesso:**
- ✅ Lighthouse Accessibility >98
- ✅ 100% navegável por teclado
- ✅ Screen reader compatible
- ✅ User satisfaction >90%

---

## 📊 MÉTRICAS E KPIs

### Performance

```
Antes (atual):
- FCP: 2.07s (Needs Improvement)
- LCP: 4.67s (Poor)
- CLS: 0.00 (Good)
- INP: 40ms (Good)

Meta Após 3 Sprints:
- FCP: <1.2s (Good)
- LCP: <2.0s (Good)
- CLS: <0.1 (Good)
- INP: <200ms (Good)
```

### Qualidade

```
Antes (Descoberta em 2025-01-30):
- Test Coverage: ~60-70% ✅ (1129 testes passando!)
- Test Files: 56 ✅
- Vitest: Configurado ✅
- Accessibility Score: ~85
- Type Coverage: ~90%

Meta Após 3 Sprints:
- Test Coverage: >80% (aumentar mais 10-20%)
- Test Files: 65+ (adicionar novos componentes)
- All Tests Passing: 100%
- Accessibility Score: >98
- Type Coverage: >95%
```

### User Engagement

```
Metas:
- New user retention: >60%
- Average session: >5 min
- Feature discovery: >80%
- NPS Score: >70
```

---

## 🎯 CRONOGRAMA RESUMIDO (ATUALIZADO)

```
Semana 1:
├─ Dias 1-2: Sprint 1 (Corrigir testes + A11y Base)
└─ Review: 100% testes passando, A11y base pronta

Semana 2:
├─ Dias 1-2: Sprint 2 Setup (Viz libs)
├─ Dias 3-7: Sprint 2 Execução
└─ Review: Dashboard completo, export funcionando

Semana 3:
├─ Dias 1-2: Sprint 3 Execução
├─ Dia 3: Polish + Bug fixes
└─ Review Final: Launch ready!
```

---

## 🚀 LAUNCH CHECKLIST

**Pre-Launch:**
- [ ] Todos os testes passando
- [ ] Coverage >70%
- [ ] Lighthouse scores >90
- [ ] No console errors
- [ ] No accessibility violations
- [ ] Performance optimized
- [ ] SEO optimized
- [ ] Analytics configured
- [ ] Error tracking configured
- [ ] Backup strategy

**Launch Day:**
- [ ] Deploy to production
- [ ] Smoke tests
- [ ] Monitor metrics
- [ ] Social media announcement
- [ ] Blog post
- [ ] Email to beta users

**Post-Launch:**
- [ ] Collect user feedback
- [ ] Monitor error rates
- [ ] Track conversion funnels
- [ ] A/B test key features
- [ ] Iterate based on data

---

## 📝 NOTAS FINAIS

### Priorização

Se o tempo ficar apertado, esta é a ordem de prioridade:

1. **Must Have** (Não pode lançar sem):
   - Testes básicos (>50% coverage)
   - A11y keyboard navigation
   - 2 visualizações (pie + line)
   - FAQ básico

2. **Should Have** (Importante mas não blocker):
   - Coverage >70%
   - 4 visualizações
   - Tutorial interativo
   - Export PDF

3. **Nice to Have** (Pode vir depois):
   - Mapa interativo
   - Vídeo tutorial
   - Export Excel avançado
   - A11y polish

### Riscos e Mitigação

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Recharts performance issues | Média | Alto | Usar virtualização, lazy loading |
| Mapbox token limits | Baixa | Médio | Fallback para mapa estático |
| Test setup complexo | Alta | Médio | Começar com testes simples |
| Time overrun | Média | Alto | Reduzir escopo do Sprint 2 |

### Success Criteria

O projeto será considerado bem-sucedido se:

✅ 70%+ dos testes passando
✅ Lighthouse Accessibility >95
✅ 3+ tipos de visualizações funcionais
✅ Tutorial completo implementado
✅ Zero critical bugs
✅ Performance <2s LCP

---

**Autor**: Anderson Henrique da Silva
**Última Atualização**: 2025-01-30
**Versão**: 1.0
**Status**: 🟢 Ready for Execution
