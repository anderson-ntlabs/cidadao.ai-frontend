# Sprint 6: Design System Stabilization + P0 Fixes

**Author**: Anderson Henrique da Silva
**Location**: Minas Gerais, Brasil
**Date**: 2025-12-08
**Sprint Duration**: 6 dias
**Status**: Planning

---

## Executive Summary

Este sprint combina **itens P0 criticos** do Agora Academy com **melhorias de Design System** para garantir consistencia visual e UX em toda a plataforma.

### Objetivos do Sprint

1. **Estabilizar Agora Academy** - Error boundaries, UI challenges, logout, GitHub fork
2. **Consolidar Design System** - Remover duplicatas, padronizar componentes
3. **Melhorar UX** - Skeletons, feedback visual, consistencia

### Metricas de Sucesso

| Metrica                  | Atual  | Target |
| ------------------------ | ------ | ------ |
| Componentes duplicados   | 3      | 0      |
| Componentes exportados   | ~30    | 45+    |
| Score de consistencia    | 7.5/10 | 9/10   |
| Error boundaries         | 0      | 4+     |
| Lighthouse Accessibility | ~95    | 100    |

---

## FASE 1: P0 - ESTABILIZACAO AGORA (Dias 1-2)

> Itens criticos que bloqueiam o beta

### 1.1 Error Boundaries (4h)

**Problema**: Paginas crasham sem feedback visual
**Impacto**: Usuario ve tela branca ao inves de mensagem amigavel

**Arquivos a criar**:

```
app/pt/agora/error.tsx                    # Global para Agora
app/pt/agora/trilhas/[trackId]/error.tsx  # Trilhas especifico
app/pt/agora/chat/error.tsx               # Chat especifico
app/pt/agora/videos/error.tsx             # Videos especifico
```

**Implementacao**:

```tsx
// app/pt/agora/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function AgoraError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log para analytics (Sentry/PostHog)
    console.error('Agora Error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ops! Algo deu errado</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Encontramos um problema ao carregar esta pagina. Tente novamente ou volte para o inicio.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
          <Button href="/pt/agora/dashboard" variant="secondary">
            <Home className="w-4 h-4 mr-2" />
            Voltar ao inicio
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <summary className="cursor-pointer text-sm font-medium">
              Detalhes tecnicos (dev only)
            </summary>
            <pre className="mt-2 text-xs overflow-auto">
              {error.message}
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
```

**Criterio de Aceite**:

- [ ] Error boundary global funciona
- [ ] Paginas especificas tem error boundaries
- [ ] UI amigavel com opcao de retry
- [ ] Logs enviados para analytics

---

### 1.2 UI de Challenges Completa (8h)

**Problema**: Backend de challenges existe, UI incompleta
**Impacto**: Usuario nao consegue ver progresso nem resgatar rewards

**Arquivo**: `components/agora/gamification-card.tsx`

**Tarefas**:

- [ ] Redesenhar card de challenges no dashboard
- [ ] Adicionar progress bars animadas
- [ ] Implementar botao "Resgatar" para rewards
- [ ] Conectar `claimChallengeReward()` action
- [ ] Adicionar feedback visual de claim (confetti)
- [ ] Mostrar timer de reset (daily/weekly)
- [ ] Adicionar tooltips explicativos

**UI Proposta**:

```
+------------------------------------------+
|  DESAFIOS DIARIOS              Resetam em 14h |
+------------------------------------------+
|                                          |
|  [*] Completar 1 video        [====--] 1/1  RESGATAR |
|  [ ] Estudar 30 minutos       [==----] 15/30 min    |
|  [ ] Ganhar 100 XP            [===---] 75/100       |
|                                          |
+------------------------------------------+
|  DESAFIOS SEMANAIS            Resetam em 3d |
+------------------------------------------+
|                                          |
|  [ ] Completar 1 trilha       [------] 0/1  |
|  [ ] Manter streak de 5 dias  [===---] 3/5  |
|                                          |
+------------------------------------------+
```

**Criterio de Aceite**:

- [ ] Challenges exibidos com progresso visual
- [ ] Timer mostra tempo ate reset
- [ ] Botao resgatar funciona
- [ ] Confetti ao resgatar
- [ ] Dados reais do Supabase

---

### 1.3 Logout/Session Management (4h)

**Problema**: Sem confirmacao de logout, sem timeout
**Impacto**: Usuario pode perder dados, sessao nunca expira

**Tarefas**:

- [ ] Criar modal de confirmacao de logout
- [ ] Implementar timeout de inatividade (30min)
- [ ] Mostrar warning 5min antes do timeout
- [ ] Salvar sessao atual antes de logout
- [ ] Limpar dados sensiveis no logout

**Arquivos**:

```
components/agora/logout-confirmation-modal.tsx  # Novo
hooks/use-session-timeout.ts                    # Novo
hooks/use-agora.tsx                             # Modificar
```

**Implementacao Session Timeout**:

```typescript
// hooks/use-session-timeout.ts
export function useSessionTimeout(timeoutMinutes = 30, warningMinutes = 5) {
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const lastActivityRef = useRef(Date.now())

  useEffect(() => {
    const resetTimer = () => {
      lastActivityRef.current = Date.now()
      setShowWarning(false)
    }

    // Track activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach((e) => window.addEventListener(e, resetTimer))

    // Check timeout
    const interval = setInterval(() => {
      const elapsed = (Date.now() - lastActivityRef.current) / 1000 / 60
      const remaining = timeoutMinutes - elapsed

      if (remaining <= 0) {
        // Logout
        handleLogout()
      } else if (remaining <= warningMinutes) {
        setShowWarning(true)
        setTimeLeft(Math.ceil(remaining * 60))
      }
    }, 1000)

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer))
      clearInterval(interval)
    }
  }, [timeoutMinutes, warningMinutes])

  return { showWarning, timeLeft, extendSession: () => setShowWarning(false) }
}
```

**Criterio de Aceite**:

- [ ] Modal de confirmacao ao clicar logout
- [ ] Warning aparece 5min antes do timeout
- [ ] Sessao salva antes de logout
- [ ] Dados sensiveis limpos

---

### 1.4 GitHub Fork Verificacao Real (4h)

**Problema**: Verificacao mockada (sempre sucesso)
**Impacto**: Sistema nao valida se usuario fez fork real

**Arquivo**: `lib/agora/github.ts` (novo)

**Implementacao**:

```typescript
// lib/agora/github.ts
const REPO_OWNER = 'anderson-ufrj'
const REPO_NAME = 'cidadao.ai-frontend'

export async function verifyGitHubFork(username: string): Promise<{
  verified: boolean
  error?: string
  forkUrl?: string
}> {
  try {
    // 1. Check if user exists
    const userRes = await fetch(`https://api.github.com/users/${username}`)
    if (!userRes.ok) {
      return { verified: false, error: 'Usuario GitHub nao encontrado' }
    }

    // 2. Check user's repos for fork
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`)
    const repos = await reposRes.json()

    // 3. Find fork of our repo
    const fork = repos.find(
      (repo: any) => repo.fork && repo.source?.full_name === `${REPO_OWNER}/${REPO_NAME}`
    )

    if (fork) {
      return {
        verified: true,
        forkUrl: fork.html_url,
      }
    }

    // 4. Alternative: Check if they forked via API
    const forkCheckRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/forks`
    )
    const forks = await forkCheckRes.json()
    const userFork = forks.find((f: any) => f.owner.login.toLowerCase() === username.toLowerCase())

    if (userFork) {
      return { verified: true, forkUrl: userFork.html_url }
    }

    return {
      verified: false,
      error: 'Fork nao encontrado. Certifique-se de fazer fork publico.',
    }
  } catch (error) {
    console.error('GitHub API error:', error)
    return {
      verified: false,
      error: 'Erro ao verificar GitHub. Tente novamente mais tarde.',
    }
  }
}
```

**Criterio de Aceite**:

- [ ] Verifica fork real via GitHub API
- [ ] Trata rate limiting graciosamente
- [ ] Mensagens de erro claras
- [ ] Fallback se API indisponivel

---

## FASE 2: DESIGN SYSTEM - CONSOLIDACAO (Dias 3-4)

> Remover duplicatas e padronizar componentes

### 2.1 Consolidar Tooltips (2h)

**Problema**: 3 implementacoes diferentes

- `tooltip.tsx` (Framer Motion)
- `tooltip-new.tsx`
- `tooltip-css.tsx`

**Solucao**: Manter apenas `tooltip.tsx`, remover outros

**Tarefas**:

- [ ] Auditar uso de cada tooltip no codebase
- [ ] Migrar usos de tooltip-new e tooltip-css
- [ ] Remover arquivos duplicados
- [ ] Atualizar exports

---

### 2.2 Unificar StatCard (3h)

**Problema**: 2 implementacoes diferentes

- `components/ui/stat-card.tsx` (simples)
- `components/agora/stat-card.tsx` (completo)

**Solucao**: Criar versao unificada com todos os recursos

**Nova API**:

```tsx
<StatCard
  // Comum
  title="XP Total"
  value={1250}
  icon={Star}

  // Opcional - Progress
  progress={75}
  progressColor="green"

  // Opcional - Trend
  trend={{ value: 12, direction: 'up' }}

  // Opcional - Variants
  variant="elevated" | "glass" | "gradient"
  size="sm" | "md" | "lg"
/>
```

---

### 2.3 Exportar Componentes Faltantes (1h)

**Problema**: Componentes existem mas nao estao exportados

**Arquivo**: `components/ui/index.ts`

**Adicionar exports**:

```typescript
// Adicionar ao index.ts
export * from './select'
export * from './label'
export * from './separator'
export * from './slider'
export * from './switch'
```

---

### 2.4 Criar Componentes de Formulario Faltantes (4h)

**Componentes a criar**:

#### Checkbox

```tsx
// components/ui/checkbox.tsx
export interface CheckboxProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
  disabled?: boolean
  error?: boolean
  size?: 'sm' | 'md' | 'lg'
}
```

#### Radio

```tsx
// components/ui/radio.tsx
export interface RadioProps {
  value: string
  checked?: boolean
  onChange?: (value: string) => void
  label?: string
  disabled?: boolean
}

export interface RadioGroupProps {
  value?: string
  onChange?: (value: string) => void
  children: React.ReactNode
  orientation?: 'horizontal' | 'vertical'
}
```

#### TextArea

```tsx
// components/ui/textarea.tsx
export interface TextAreaProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  rows?: number
  maxLength?: number
  showCount?: boolean
  error?: boolean
  helperText?: string
}
```

---

### 2.5 Conectar Design Tokens ao Tailwind (2h)

**Problema**: CSS variables definidas mas nao usadas

**Arquivo**: `tailwind.config.ts`

**Adicionar**:

```typescript
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        // Conectar CSS variables
        cidadao: {
          green: {
            50: 'var(--cidadao-green-50)',
            100: 'var(--cidadao-green-100)',
            // ... ate 900
            600: 'var(--cidadao-green-600)',
          },
          blue: {
            // Similar
          },
        },
        // Semantic tokens
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
      },
      // Typography
      fontSize: {
        'heading-1': ['var(--text-heading-1)', { lineHeight: 'var(--leading-heading-1)' }],
        'heading-2': ['var(--text-heading-2)', { lineHeight: 'var(--leading-heading-2)' }],
        'heading-3': ['var(--text-heading-3)', { lineHeight: 'var(--leading-heading-3)' }],
        body: ['var(--text-body)', { lineHeight: 'var(--leading-body)' }],
        label: ['var(--text-label)', { lineHeight: 'var(--leading-label)' }],
      },
    },
  },
}
```

---

## FASE 3: UX IMPROVEMENTS (Dias 5-6)

> Melhorar experiencia do usuario

### 3.1 Skeleton Loaders (4h)

**Criar componente reutilizavel**:

```tsx
// components/ui/skeleton.tsx
export function Skeleton({
  className,
  variant = 'rectangular'
}: {
  className?: string
  variant?: 'rectangular' | 'circular' | 'text'
}) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-700',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'rounded h-4',
        variant === 'rectangular' && 'rounded-lg',
        className
      )}
    />
  )
}

// Skeleton compositions
export function CardSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-4">
        <Skeleton className="h-6 w-3/4" variant="text" />
        <Skeleton className="h-4 w-1/2" variant="text" />
        <Skeleton className="h-32 w-full" />
      </CardContent>
    </Card>
  )
}

export function StatCardSkeleton() { ... }
export function TableRowSkeleton() { ... }
export function AvatarSkeleton() { ... }
```

**Implementar em**:

- [ ] Dashboard Agora
- [ ] Trilhas
- [ ] Videos
- [ ] Ranking
- [ ] Perfil

---

### 3.2 Empty States Padronizados (2h)

**Criar componentes para estados vazios**:

```tsx
// components/ui/empty-state.tsx (ja existe, melhorar)
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  variant = 'default', // 'default' | 'error' | 'search' | 'filter'
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center mb-4',
          variant === 'default' && 'bg-gray-100 dark:bg-gray-800',
          variant === 'error' && 'bg-red-100 dark:bg-red-900/20',
          variant === 'search' && 'bg-blue-100 dark:bg-blue-900/20'
        )}
      >
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-sm mb-6">{description}</p>
      {action}
    </div>
  )
}
```

---

### 3.3 Loading States Consistentes (2h)

**Criar loading spinner padrao**:

```tsx
// components/ui/loading.tsx
export function Loading({ size = 'md', text, fullScreen = false }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-200 border-t-green-600',
          size === 'sm' && 'w-5 h-5',
          size === 'md' && 'w-8 h-8',
          size === 'lg' && 'w-12 h-12'
        )}
      />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return content
}
```

---

### 3.4 Feedback Visual Melhorado (2h)

**Toast com icones e cores consistentes**:

```tsx
// Melhorar sistema de toast existente
const toastVariants = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-800',
  },
  error: {
    icon: XCircle,
    className: 'bg-red-50 border-red-200 text-red-800',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-800',
  },
}
```

---

## CRONOGRAMA

```
DIA 1 (Domingo 08/12)
├── 1.1 Error Boundaries (4h)
└── Inicio 1.2 UI Challenges

DIA 2 (Segunda 09/12)
├── 1.2 UI Challenges (conclusao)
└── 1.3 Logout/Session Management (4h)

DIA 3 (Terca 10/12)
├── 1.4 GitHub Fork Verificacao (4h)
├── 2.1 Consolidar Tooltips (2h)
└── 2.2 Unificar StatCard (inicio)

DIA 4 (Quarta 11/12)
├── 2.2 Unificar StatCard (conclusao)
├── 2.3 Exportar Componentes (1h)
├── 2.4 Criar Checkbox/Radio/TextArea (4h)
└── 2.5 Conectar Design Tokens (2h)

DIA 5 (Quinta 12/12)
├── 3.1 Skeleton Loaders (4h)
├── 3.2 Empty States (2h)
└── 3.3 Loading States (2h)

DIA 6 (Sexta 13/12)
├── 3.4 Feedback Visual (2h)
├── Testes E2E
├── Documentacao
└── Code Review / Fixes
```

---

## CHECKLIST DE ENTREGA

### P0 - Estabilizacao

- [ ] Error boundaries em todas paginas Agora
- [ ] UI de challenges completa e funcional
- [ ] Logout com confirmacao e timeout
- [ ] GitHub fork verificacao real

### Design System

- [ ] Apenas 1 tooltip (outros removidos)
- [ ] StatCard unificado
- [ ] Todos componentes UI exportados
- [ ] Checkbox, Radio, TextArea criados
- [ ] Design tokens conectados ao Tailwind

### UX

- [ ] Skeletons em todas paginas principais
- [ ] Empty states padronizados
- [ ] Loading states consistentes
- [ ] Toasts com visual melhorado

### Qualidade

- [ ] Zero erros TypeScript
- [ ] Testes E2E passando
- [ ] Lighthouse Accessibility 100
- [ ] Dark mode funcionando em tudo

---

## ARQUIVOS MODIFICADOS/CRIADOS

### Novos Arquivos (12)

```
app/pt/agora/error.tsx
app/pt/agora/trilhas/[trackId]/error.tsx
app/pt/agora/chat/error.tsx
app/pt/agora/videos/error.tsx
components/agora/logout-confirmation-modal.tsx
components/ui/checkbox.tsx
components/ui/radio.tsx
components/ui/textarea.tsx
components/ui/skeleton.tsx
components/ui/loading.tsx
hooks/use-session-timeout.ts
lib/agora/github.ts
```

### Arquivos Modificados (8)

```
components/agora/gamification-card.tsx
components/agora/stat-card.tsx (unificar)
components/ui/stat-card.tsx (deprecar)
components/ui/index.ts (exports)
components/ui/empty-state.tsx
hooks/use-agora.tsx
tailwind.config.ts
store/notification-store.ts
```

### Arquivos Removidos (2)

```
components/ui/tooltip-new.tsx
components/ui/tooltip-css.tsx
```

---

## RISCOS E MITIGACOES

| Risco                        | Probabilidade | Impacto | Mitigacao                                                 |
| ---------------------------- | ------------- | ------- | --------------------------------------------------------- |
| GitHub API rate limit        | Media         | Medio   | Cache de verificacoes, fallback gracioso                  |
| Breaking changes no StatCard | Alta          | Baixo   | Manter backward compatibility                             |
| Tempo insuficiente           | Media         | Medio   | Priorizar P0, deixar UX para proximo sprint se necessario |

---

## METRICAS DE SUCESSO

### Quantitativas

- [ ] 0 componentes duplicados
- [ ] 45+ componentes exportados
- [ ] 100% Lighthouse Accessibility
- [ ] 0 erros de TypeScript
- [ ] Cobertura de testes > 60%

### Qualitativas

- [ ] UX consistente em todas as paginas
- [ ] Feedback visual claro em todas acoes
- [ ] Nenhuma tela branca (error boundaries)
- [ ] Loading states em todas operacoes async

---

**Proxima Revisao**: Apos Dia 3
**Sprint Review**: Dia 6
