# Plano de Refatoracao Arquitetural - Agora Academy

> Revisao senior de engenharia e arquitetura de software
> Documento de planejamento tecnico para melhorias estruturais

**Autor**: Anderson Henrique da Silva
**Data de Criacao**: 2025-12-10
**Versao**: 1.0.0
**Status**: Planejamento

---

## 1. Sumario Executivo

Este documento apresenta um plano completo de refatoracao da plataforma Agora Academy, baseado em uma revisao arquitetural senior. A analise identificou problemas criticos de manutencao, seguranca e performance que requerem atencao imediata.

### 1.1 Metricas Atuais

| Metrica                       | Valor Atual     | Meta         | Status  |
| ----------------------------- | --------------- | ------------ | ------- |
| Maior arquivo (use-agora.tsx) | 1.818 linhas    | < 400 linhas | CRITICO |
| Cobertura de testes           | ~25-30%         | >= 60%       | CRITICO |
| Duplicacao de codigo          | ~1.200 linhas   | 0 linhas     | ALTO    |
| Componentes monoliticos       | 2 arquivos      | 0 arquivos   | ALTO    |
| Vulnerabilidades seguranca    | 3 identificadas | 0            | CRITICO |

### 1.2 Arquivos Criticos Identificados

```
+----------------------------------------+--------+---------------+
| Arquivo                                | Linhas | Complexidade  |
+----------------------------------------+--------+---------------+
| hooks/use-agora.tsx                    |  1.818 | CRITICA       |
| components/agora/certificate-modal.tsx |  1.579 | CRITICA       |
| hooks/use-agora-gamification.tsx       |    988 | ALTA          |
| store/kids-store.ts                    |    628 | ALTA          |
| app/pt/agora/layout.tsx                |    296 | MEDIA         |
+----------------------------------------+--------+---------------+
| TOTAL                                  |  5.309 |               |
+----------------------------------------+--------+---------------+
```

---

## 2. Problemas Identificados

### 2.1 Problemas Criticos (P0)

#### 2.1.1 God Hook - use-agora.tsx

**Localizacao**: `hooks/use-agora.tsx` (1.818 linhas)

**Problema**: Hook monolitico com 10+ responsabilidades, violando Single Responsibility Principle (SRP).

**Responsabilidades Atuais**:

```
use-agora.tsx
├── Autenticacao & gerenciamento de perfil
├── Sistema de XP & niveis
├── Badges & conquistas
├── Desafios diarios/semanais
├── Sessoes de estudo
├── Diario de aprendizado
├── Calculo de streaks
├── Fluxo de onboarding
├── Integracao GitHub
└── Consentimento LGPD
```

**Impactos**:

- Impossivel testar funcionalidades isoladamente
- Re-renders desnecessarios em toda arvore de componentes
- Alto acoplamento entre funcionalidades
- Dificuldade de manutencao e debug
- Tempo de carregamento inicial alto

**Evidencias no Codigo**:

```typescript
// Linhas 1350-1498: refreshChallenges com 150 linhas
// Linhas 1253-1309: checkAndAwardBadges executado em cada render
// Linhas 40-67: AgoraUser com 27 campos
// 30+ useCallback declarations
// 50+ linhas de dependency arrays
```

---

#### 2.1.2 Duplicacao Massiva de Codigo

**Localizacoes**:

- `hooks/use-agora.tsx` (linhas 157-330)
- `hooks/use-agora-gamification.tsx` (linhas 41-260)

**Codigo Duplicado**:
| Item | Linhas Duplicadas | Arquivos |
|------|-------------------|----------|
| BADGE_DEFINITIONS | ~260 linhas | 2 |
| GAMIFICATION constants | ~50 linhas | 2 |
| Challenge templates | ~80 linhas | 2 |
| Streak calculation | ~40 linhas | 2 |
| AgoraUser interface | ~30 linhas | 3 |
| DailyChallenge type | ~15 linhas | 3 |

**Risco**: Se criterios de badge mudam, deve-se atualizar em 2+ lugares. Divergencia silenciosa.

---

#### 2.1.3 Vulnerabilidades de Seguranca

**A. Rate Limiting Ausente no Codigo Parental**

**Localizacao**: `store/kids-store.ts:549-574`

```typescript
// VULNERAVEL - Sem rate limiting
validateParentalCode: async (code) => {
  const { data } = await supabase.rpc('validate_parental_code', {
    p_code: code.toUpperCase(),
  })
  // Pode ser chamado 1000x/segundo - brute force viavel
}
```

**Risco**: Ataque de forca bruta pode descobrir codigo parental em minutos.

**B. RLS Policies Incompletas**

**Localizacao**: Queries em `kids-store.ts` e `use-agora.tsx`

```typescript
// Filtragem apenas no cliente - inseguro
.eq('is_active', true)  // Se RLS nao enforcar, dados vazam
```

**Risco**: Dados de perfis inativos podem ser acessados.

**C. Consentimento LGPD Bypassavel**

**Localizacao**: `app/pt/agora/layout.tsx:215-218`

```typescript
// Redirect client-side - race condition possivel
if (!user.hasAcceptedLgpd || !user.hasAcceptedTerms) {
  router.replace('/pt/agora/contract')
}
```

**Risco**: Navegacao direta pode bypassar verificacao de consentimento.

---

### 2.2 Problemas de Alta Prioridade (P1)

#### 2.2.1 Componente Monolitico - Certificate Modal

**Localizacao**: `components/agora/certificate-modal.tsx` (1.579 linhas)

**Responsabilidades Misturadas**:

- Geracao de PDF com jsPDF
- Validacao de certificado
- Telemetria e tracking
- Acesso parental
- Multiplos tipos de certificado
- UI de preview

**Problema**: 50+ useState calls, JSX com 6+ niveis de aninhamento.

---

#### 2.2.2 Guard Flags como Mutex

**Localizacao**: `store/kids-store.ts:65-67`

```typescript
_isLoadingProfile: boolean
_isStartingSession: boolean
_isEndingSession: boolean
```

**Problema**: Se componente desmonta durante operacao, flags permanecem `true`. Race conditions possiveis.

---

#### 2.2.3 RPCs Hardcoded sem Fallback

**Localizacao**: `store/kids-store.ts`

```typescript
// Se RPC nao existe, falha silenciosa
supabase.rpc('create_parental_access_code', {...})
supabase.rpc('validate_parental_code', {...})
supabase.rpc('get_kids_daily_stats', {...})
```

**Problema**: Nenhum tratamento de erro para RPCs inexistentes.

---

### 2.3 Problemas de Media Prioridade (P2)

#### 2.3.1 Performance - Badge Check Excessivo

**Localizacao**: `hooks/use-agora.tsx:1253-1309`

```typescript
useEffect(() => {
  if (user && !isLoading) {
    refreshChallenges() // Inclui checkAndAwardBadges
  }
}, [user, isLoading, sessions, diaryEntries, badges])
```

**Problema**: Badge check O(n) executado a cada mudanca de sessao/diario/badges.

---

#### 2.3.2 Performance - Challenge Sync sem Debounce

**Localizacao**: `hooks/use-agora.tsx:1467-1489`

```typescript
await syncChallengeProgress(challengesToSync)
// Chamado multiplas vezes por minuto sem debouncing
```

**Problema**: Multiplas chamadas API desnecessarias, drena bateria em mobile.

---

#### 2.3.3 Layout Re-renders

**Localizacao**: `app/pt/agora/layout.tsx:285-295`

```typescript
<AgoraAuthProvider>
  <AgoraProvider>
    <AgoraLayoutContent>{children}</AgoraLayoutContent>
  </AgoraProvider>
</AgoraAuthProvider>
```

**Problema**: 2 context providers aninhados causam re-render em cascata.

---

## 3. Plano de Refatoracao

### 3.1 Fase 1: Seguranca (Dias 1-3)

**Objetivo**: Corrigir vulnerabilidades criticas de seguranca.

#### 3.1.1 Rate Limiting no Codigo Parental

**Arquivo**: `store/kids-store.ts`

**Implementacao**:

```typescript
// Nova estrutura com rate limiting
const RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 5 * 60 * 1000, // 5 minutos
  lockoutMs: 15 * 60 * 1000, // 15 minutos
}

interface RateLimitState {
  attempts: number
  firstAttemptAt: number
  lockedUntil: number | null
}

validateParentalCode: async (code: string) => {
  const state = get()
  const now = Date.now()

  // Verificar lockout
  if (state.rateLimitState?.lockedUntil && now < state.rateLimitState.lockedUntil) {
    const remainingMinutes = Math.ceil((state.rateLimitState.lockedUntil - now) / 60000)
    throw new Error(`Muitas tentativas. Tente novamente em ${remainingMinutes} minutos.`)
  }

  // Verificar rate limit
  const rateState = state.rateLimitState || { attempts: 0, firstAttemptAt: now, lockedUntil: null }

  if (now - rateState.firstAttemptAt > RATE_LIMIT.windowMs) {
    // Reset window
    rateState.attempts = 0
    rateState.firstAttemptAt = now
  }

  rateState.attempts++

  if (rateState.attempts > RATE_LIMIT.maxAttempts) {
    rateState.lockedUntil = now + RATE_LIMIT.lockoutMs
    set({ rateLimitState: rateState })
    throw new Error('Muitas tentativas. Conta bloqueada temporariamente.')
  }

  set({ rateLimitState: rateState })

  // Prosseguir com validacao
  const { data, error } = await supabase.rpc('validate_parental_code', {
    p_code: code.toUpperCase(),
  })

  if (error || !data?.is_valid) {
    return { isValid: false }
  }

  // Reset rate limit on success
  set({ rateLimitState: null })
  return data
}
```

**Estimativa**: 4 horas

---

#### 3.1.2 Auditoria de RLS Policies

**Arquivo**: Nova migration `supabase/migrations/20251210_rls_audit.sql`

**Verificacoes**:

```sql
-- Verificar policies existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename LIKE 'agora_%' OR tablename LIKE 'kids_%';

-- Adicionar policy para is_active em kids_profiles
CREATE POLICY "Kids profiles active only" ON agora_kids_profiles
  FOR SELECT
  USING (is_active = true AND parent_user_id = auth.uid());

-- Adicionar policy para soft-deleted records
CREATE POLICY "Exclude soft deleted" ON agora_profiles
  FOR ALL
  USING (deleted_at IS NULL);
```

**Estimativa**: 4 horas

---

#### 3.1.3 Consentimento LGPD no Middleware

**Arquivo**: `middleware.ts`

**Implementacao**:

```typescript
// Adicionar verificacao de consentimento no middleware
const PROTECTED_AGORA_ROUTES = ['/pt/agora/dashboard', '/pt/agora/chat', '/pt/agora/trilhas']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PROTECTED_AGORA_ROUTES.some(route => pathname.startsWith(route))) {
    const supabase = createServerClient(...)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('agora_profiles')
        .select('has_accepted_lgpd, has_accepted_terms')
        .eq('user_id', user.id)
        .single()

      if (!profile?.has_accepted_lgpd || !profile?.has_accepted_terms) {
        return NextResponse.redirect(new URL('/pt/agora/contract', request.url))
      }
    }
  }

  return NextResponse.next()
}
```

**Estimativa**: 3 horas

---

### 3.2 Fase 2: Centralizacao de Constantes (Dias 4-6)

**Objetivo**: Eliminar duplicacao de codigo, criar single source of truth.

#### 3.2.1 Estrutura de Arquivos

```
lib/agora/
├── constants/
│   ├── index.ts              # Barrel export
│   ├── badges.ts             # BADGE_DEFINITIONS unico
│   ├── challenges.ts         # Templates de desafios
│   ├── gamification.ts       # XP, levels, ranks
│   └── kids.ts               # Constantes Kids mode
├── types/
│   ├── index.ts              # Barrel export
│   ├── user.ts               # AgoraUser, AgoraProfile
│   ├── challenge.ts          # DailyChallenge, WeeklyChallenge
│   ├── badge.ts              # Badge, BadgeDefinition
│   ├── session.ts            # Session types
│   └── kids.ts               # KidsProfile, KidsSession
└── utils/
    ├── index.ts              # Barrel export
    ├── xp-calculator.ts      # Calculos de XP
    ├── streak-calculator.ts  # Calculos de streak
    └── badge-checker.ts      # Logica de verificacao de badges
```

---

#### 3.2.2 Arquivo: lib/agora/constants/badges.ts

```typescript
/**
 * Badge Definitions - Single Source of Truth
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-10
 */

import type { BadgeDefinition, BadgeTier, BadgeCategory } from '../types/badge'

export const BADGE_TIERS: Record<BadgeTier, { minXp: number; color: string }> = {
  bronze: { minXp: 0, color: '#CD7F32' },
  silver: { minXp: 500, color: '#C0C0C0' },
  gold: { minXp: 2000, color: '#FFD700' },
  platinum: { minXp: 5000, color: '#E5E4E2' },
}

export const BADGE_CATEGORIES: BadgeCategory[] = [
  'iniciante',
  'consistencia',
  'aprendizado',
  'social',
  'maestria',
]

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Tier 1 - Iniciante
  {
    id: 'pioneiro',
    name: 'Pioneiro',
    description: 'Primeiro login na Agora',
    emoji: '🚀',
    tier: 'bronze',
    category: 'iniciante',
    xpReward: 25,
    criteria: {
      type: 'login_count',
      threshold: 1,
    },
    check: (user) => user.totalSessions >= 1,
  },
  {
    id: 'curioso',
    name: 'Curioso',
    description: 'Acumulou 100 XP',
    emoji: '🔍',
    tier: 'bronze',
    category: 'iniciante',
    xpReward: 15,
    criteria: {
      type: 'xp_total',
      threshold: 100,
    },
    check: (user) => user.totalXp >= 100,
  },
  {
    id: 'primeiro-passo',
    name: 'Primeiro Passo',
    description: 'Completou primeira sessao de estudo',
    emoji: '👣',
    tier: 'bronze',
    category: 'iniciante',
    xpReward: 20,
    criteria: {
      type: 'session_count',
      threshold: 1,
    },
    check: (user) => user.totalSessions >= 1,
  },

  // Tier 2 - Consistencia
  {
    id: 'dedicado',
    name: 'Dedicado',
    description: 'Manteve streak de 3 dias',
    emoji: '🔥',
    tier: 'bronze',
    category: 'consistencia',
    xpReward: 30,
    criteria: {
      type: 'streak_days',
      threshold: 3,
    },
    check: (user) => user.currentStreak >= 3 || user.longestStreak >= 3,
  },
  {
    id: 'persistente',
    name: 'Persistente',
    description: 'Manteve streak de 7 dias',
    emoji: '💪',
    tier: 'silver',
    category: 'consistencia',
    xpReward: 50,
    criteria: {
      type: 'streak_days',
      threshold: 7,
    },
    check: (user) => user.currentStreak >= 7 || user.longestStreak >= 7,
  },
  {
    id: 'incansavel',
    name: 'Incansavel',
    description: 'Manteve streak de 30 dias',
    emoji: '🏆',
    tier: 'gold',
    category: 'consistencia',
    xpReward: 150,
    criteria: {
      type: 'streak_days',
      threshold: 30,
    },
    check: (user) => user.currentStreak >= 30 || user.longestStreak >= 30,
  },

  // Tier 3 - Aprendizado
  {
    id: 'estudioso',
    name: 'Estudioso',
    description: 'Completou 10 sessoes de estudo',
    emoji: '📚',
    tier: 'bronze',
    category: 'aprendizado',
    xpReward: 40,
    criteria: {
      type: 'session_count',
      threshold: 10,
    },
    check: (user) => user.totalSessions >= 10,
  },
  {
    id: 'maratonista',
    name: 'Maratonista',
    description: 'Estudou por 5+ horas total',
    emoji: '⏱️',
    tier: 'silver',
    category: 'aprendizado',
    xpReward: 60,
    criteria: {
      type: 'study_time_minutes',
      threshold: 300,
    },
    check: (user) => user.totalTimeMinutes >= 300,
  },
  {
    id: 'escritor',
    name: 'Escritor',
    description: 'Escreveu 5 entradas no diario',
    emoji: '✍️',
    tier: 'bronze',
    category: 'aprendizado',
    xpReward: 35,
    criteria: {
      type: 'diary_entries',
      threshold: 5,
    },
    check: (user, context) => (context?.diaryCount ?? 0) >= 5,
  },

  // Tier 4 - Social
  {
    id: 'colaborador',
    name: 'Colaborador',
    description: 'Fez fork do repositorio',
    emoji: '🤝',
    tier: 'silver',
    category: 'social',
    xpReward: 100,
    criteria: {
      type: 'github_fork',
      threshold: 1,
    },
    check: (user) => !!user.githubUsername,
  },

  // Tier 5 - Maestria
  {
    id: 'mestre',
    name: 'Mestre',
    description: 'Alcancou nivel 10',
    emoji: '🎓',
    tier: 'gold',
    category: 'maestria',
    xpReward: 200,
    criteria: {
      type: 'level',
      threshold: 10,
    },
    check: (user) => user.currentLevel >= 10,
  },
  {
    id: 'arquiteto',
    name: 'Arquiteto',
    description: 'Alcancou rank Arquiteto (5000+ XP)',
    emoji: '🏛️',
    tier: 'platinum',
    category: 'maestria',
    xpReward: 500,
    criteria: {
      type: 'rank',
      threshold: 'arquiteto',
    },
    check: (user) => user.totalXp >= 5000,
  },
]

// Helper functions
export const getBadgeById = (id: string): BadgeDefinition | undefined =>
  BADGE_DEFINITIONS.find((b) => b.id === id)

export const getBadgesByTier = (tier: BadgeTier): BadgeDefinition[] =>
  BADGE_DEFINITIONS.filter((b) => b.tier === tier)

export const getBadgesByCategory = (category: BadgeCategory): BadgeDefinition[] =>
  BADGE_DEFINITIONS.filter((b) => b.category === category)
```

**Estimativa**: 6 horas

---

#### 3.2.3 Arquivo: lib/agora/types/user.ts

```typescript
/**
 * Agora User Types - Single Source of Truth
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-10
 */

export type AgoraTrack = 'backend' | 'frontend' | 'ia' | 'devops'

export type AgoraRank = 'novato' | 'aprendiz' | 'contribuidor' | 'mentor' | 'arquiteto'

export interface AgoraUserBase {
  id: string
  name: string
  email: string
  avatar: string
}

export interface AgoraUserGamification {
  totalXp: number
  currentLevel: number
  currentRank: AgoraRank
  currentStreak: number
  longestStreak: number
  totalSessions: number
  totalTimeMinutes: number
  totalVideosCompleted: number
  lastActivityDate?: string
  lastDailyBonusDate?: string
}

export interface AgoraUserProfile {
  githubUsername?: string
  matricula?: string
  curso?: string
  periodo?: number
  tracks: AgoraTrack[]
  enrolledAt: string
}

export interface AgoraUserConsent {
  hasAcceptedLgpd: boolean
  hasAcceptedTerms: boolean
  hasAcceptedInternshipContract: boolean
}

export interface AgoraUserOnboarding {
  hasCompletedOnboarding: boolean
  onboardingStep: number
}

export interface AgoraUserPermissions {
  isSuperuser: boolean
}

// Tipo completo - composicao
export interface AgoraUser
  extends AgoraUserBase,
    AgoraUserGamification,
    AgoraUserProfile,
    AgoraUserConsent,
    AgoraUserOnboarding,
    AgoraUserPermissions {}

// Tipo parcial para contextos especificos
export type AgoraUserAuth = AgoraUserBase & AgoraUserConsent & AgoraUserPermissions

export type AgoraUserStats = AgoraUserBase & AgoraUserGamification
```

**Estimativa**: 3 horas

---

### 3.3 Fase 3: Decomposicao do God Hook (Dias 7-14)

**Objetivo**: Dividir `use-agora.tsx` em hooks focados e testaveis.

#### 3.3.1 Nova Arquitetura de Hooks

```
hooks/agora/
├── index.ts                    # Barrel export + facade hook
├── use-agora-auth.tsx          # Auth, profile loading, logout
├── use-agora-profile.tsx       # CRUD de perfil
├── use-agora-xp.tsx            # XP, levels, ranks
├── use-agora-badges.tsx        # Badge checking e awarding
├── use-agora-challenges.tsx    # Daily/Weekly challenges
├── use-agora-sessions.tsx      # Session tracking (existente, expandir)
├── use-agora-diary.tsx         # Diary entries
├── use-agora-onboarding.tsx    # Onboarding flow (existente)
└── providers/
    └── agora-provider.tsx      # Context unificado
```

---

#### 3.3.2 Arquivo: hooks/agora/use-agora-xp.tsx

```typescript
/**
 * Agora XP Hook
 *
 * Gerencia sistema de XP, niveis e ranks.
 * Responsabilidade unica: progressao de gamificacao.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-10
 */

'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { trackLevelUp, trackRankUp } from '@/lib/analytics/agora-tracker'
import { useCelebrationStore } from '@/store/celebration-store'
import { GAMIFICATION, calculateLevel, calculateRank } from '@/lib/agora/constants/gamification'
import type { AgoraUser, AgoraRank } from '@/lib/agora/types/user'

const logger = createLogger('AgoraXP')

export interface XpTransaction {
  id: string
  userId: string
  amount: number
  source: string
  description: string
  createdAt: string
}

export interface UseAgoraXpOptions {
  userId: string
  onLevelUp?: (newLevel: number) => void
  onRankUp?: (newRank: AgoraRank) => void
}

export interface UseAgoraXpReturn {
  addXp: (amount: number, source: string, description: string) => Promise<boolean>
  getXpHistory: (limit?: number) => Promise<XpTransaction[]>
  calculateXpToNextLevel: (currentXp: number) => number
  calculateProgress: (currentXp: number) => number
}

export function useAgoraXp({ userId, onLevelUp, onRankUp }: UseAgoraXpOptions): UseAgoraXpReturn {
  const supabase = createClient()
  const { queueCelebration } = useCelebrationStore()

  const addXp = useCallback(
    async (amount: number, source: string, description: string): Promise<boolean> => {
      if (!userId || amount <= 0) return false

      try {
        // Buscar perfil atual
        const { data: profile, error: profileError } = await supabase
          .from('agora_profiles')
          .select('total_xp, current_level, current_rank')
          .eq('user_id', userId)
          .single()

        if (profileError || !profile) {
          logger.error('Failed to fetch profile for XP update', profileError)
          return false
        }

        const oldLevel = profile.current_level
        const oldRank = profile.current_rank
        const newTotalXp = profile.total_xp + amount
        const newLevel = calculateLevel(newTotalXp)
        const newRank = calculateRank(newTotalXp)

        // Transacao atomica via RPC
        const { error: rpcError } = await supabase.rpc('add_xp_atomic', {
          p_user_id: userId,
          p_amount: amount,
          p_source: source,
          p_description: description,
        })

        if (rpcError) {
          logger.error('Failed to add XP via RPC', rpcError)
          return false
        }

        // Verificar level up
        if (newLevel > oldLevel) {
          logger.info(`Level up: ${oldLevel} -> ${newLevel}`)
          trackLevelUp(userId, newLevel)
          queueCelebration({
            type: 'level-up',
            data: { oldLevel, newLevel },
          })
          onLevelUp?.(newLevel)
        }

        // Verificar rank up
        if (newRank !== oldRank) {
          logger.info(`Rank up: ${oldRank} -> ${newRank}`)
          trackRankUp(userId, newRank)
          queueCelebration({
            type: 'rank-up',
            data: { oldRank, newRank },
          })
          onRankUp?.(newRank)
        }

        return true
      } catch (error) {
        logger.error('Error adding XP', error)
        return false
      }
    },
    [userId, supabase, queueCelebration, onLevelUp, onRankUp]
  )

  const getXpHistory = useCallback(
    async (limit = 50): Promise<XpTransaction[]> => {
      if (!userId) return []

      const { data, error } = await supabase
        .from('agora_xp_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        logger.error('Failed to fetch XP history', error)
        return []
      }

      return data.map((row) => ({
        id: row.id,
        userId: row.user_id,
        amount: row.amount,
        source: row.source,
        description: row.description,
        createdAt: row.created_at,
      }))
    },
    [userId, supabase]
  )

  const calculateXpToNextLevel = useCallback((currentXp: number): number => {
    const currentLevel = calculateLevel(currentXp)
    const xpForNextLevel = GAMIFICATION.XP_PER_LEVEL * (currentLevel + 1)
    return Math.max(0, xpForNextLevel - currentXp)
  }, [])

  const calculateProgress = useCallback((currentXp: number): number => {
    const currentLevel = calculateLevel(currentXp)
    const xpForCurrentLevel = GAMIFICATION.XP_PER_LEVEL * currentLevel
    const xpForNextLevel = GAMIFICATION.XP_PER_LEVEL * (currentLevel + 1)
    const progressXp = currentXp - xpForCurrentLevel
    const levelRange = xpForNextLevel - xpForCurrentLevel
    return Math.min(100, Math.round((progressXp / levelRange) * 100))
  }, [])

  return {
    addXp,
    getXpHistory,
    calculateXpToNextLevel,
    calculateProgress,
  }
}
```

**Estimativa**: 8 horas

---

#### 3.3.3 Arquivo: hooks/agora/use-agora-badges.tsx

```typescript
/**
 * Agora Badges Hook
 *
 * Gerencia verificacao e concessao de badges.
 * Responsabilidade unica: sistema de conquistas.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-10
 */

'use client'

import { useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { trackBadgeEarned } from '@/lib/analytics/agora-tracker'
import { useCelebrationStore } from '@/store/celebration-store'
import { BADGE_DEFINITIONS, getBadgeById } from '@/lib/agora/constants/badges'
import type { AgoraUser } from '@/lib/agora/types/user'
import type { BadgeDefinition } from '@/lib/agora/types/badge'

const logger = createLogger('AgoraBadges')

// Debounce badge check para evitar execucoes excessivas
const BADGE_CHECK_DEBOUNCE_MS = 5 * 60 * 1000 // 5 minutos

export interface Badge {
  id: string
  earnedAt: string
  badge: BadgeDefinition
}

export interface UseAgoraBadgesOptions {
  userId: string
  onBadgeEarned?: (badge: BadgeDefinition) => void
}

export interface UseAgoraBadgesReturn {
  checkAndAwardBadges: (user: AgoraUser, context?: BadgeCheckContext) => Promise<Badge[]>
  getUserBadges: () => Promise<Badge[]>
  getBadgeDefinitions: () => BadgeDefinition[]
  getUnlockedBadges: (earnedIds: string[]) => BadgeDefinition[]
  getLockedBadges: (earnedIds: string[]) => BadgeDefinition[]
}

export interface BadgeCheckContext {
  diaryCount?: number
  sessionsToday?: number
}

export function useAgoraBadges({
  userId,
  onBadgeEarned,
}: UseAgoraBadgesOptions): UseAgoraBadgesReturn {
  const supabase = createClient()
  const { queueCelebration } = useCelebrationStore()
  const lastCheckRef = useRef<number>(0)

  const checkAndAwardBadges = useCallback(
    async (user: AgoraUser, context?: BadgeCheckContext): Promise<Badge[]> => {
      if (!userId) return []

      // Debounce check
      const now = Date.now()
      if (now - lastCheckRef.current < BADGE_CHECK_DEBOUNCE_MS) {
        logger.debug('Badge check debounced')
        return []
      }
      lastCheckRef.current = now

      try {
        // Buscar badges ja conquistados
        const { data: existingBadges, error } = await supabase
          .from('agora_badge_awards')
          .select('badge_id')
          .eq('user_id', userId)

        if (error) {
          logger.error('Failed to fetch existing badges', error)
          return []
        }

        const earnedIds = new Set(existingBadges?.map((b) => b.badge_id) || [])
        const newBadges: Badge[] = []

        // Verificar cada badge nao conquistado
        for (const badgeDef of BADGE_DEFINITIONS) {
          if (earnedIds.has(badgeDef.id)) continue

          const isEarned = badgeDef.check(user, context)

          if (isEarned) {
            // Conceder badge via RPC atomica
            const { data, error: awardError } = await supabase.rpc('award_badge', {
              p_user_id: userId,
              p_badge_id: badgeDef.id,
              p_xp_reward: badgeDef.xpReward,
            })

            if (awardError) {
              logger.error(`Failed to award badge ${badgeDef.id}`, awardError)
              continue
            }

            const newBadge: Badge = {
              id: badgeDef.id,
              earnedAt: new Date().toISOString(),
              badge: badgeDef,
            }

            newBadges.push(newBadge)

            // Track e celebrar
            trackBadgeEarned(userId, badgeDef.id, badgeDef.name)
            queueCelebration({
              type: 'badge',
              data: { badge: badgeDef },
            })
            onBadgeEarned?.(badgeDef)

            logger.info(`Badge earned: ${badgeDef.name}`)
          }
        }

        return newBadges
      } catch (error) {
        logger.error('Error checking badges', error)
        return []
      }
    },
    [userId, supabase, queueCelebration, onBadgeEarned]
  )

  const getUserBadges = useCallback(async (): Promise<Badge[]> => {
    if (!userId) return []

    const { data, error } = await supabase
      .from('agora_badge_awards')
      .select('badge_id, earned_at')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch user badges', error)
      return []
    }

    return data
      .map((row) => {
        const badgeDef = getBadgeById(row.badge_id)
        if (!badgeDef) return null
        return {
          id: row.badge_id,
          earnedAt: row.earned_at,
          badge: badgeDef,
        }
      })
      .filter((b): b is Badge => b !== null)
  }, [userId, supabase])

  const getBadgeDefinitions = useCallback(() => BADGE_DEFINITIONS, [])

  const getUnlockedBadges = useCallback((earnedIds: string[]): BadgeDefinition[] => {
    const earnedSet = new Set(earnedIds)
    return BADGE_DEFINITIONS.filter((b) => earnedSet.has(b.id))
  }, [])

  const getLockedBadges = useCallback((earnedIds: string[]): BadgeDefinition[] => {
    const earnedSet = new Set(earnedIds)
    return BADGE_DEFINITIONS.filter((b) => !earnedSet.has(b.id))
  }, [])

  return {
    checkAndAwardBadges,
    getUserBadges,
    getBadgeDefinitions,
    getUnlockedBadges,
    getLockedBadges,
  }
}
```

**Estimativa**: 8 horas

---

#### 3.3.4 Arquivo: hooks/agora/use-agora-challenges.tsx

```typescript
/**
 * Agora Challenges Hook
 *
 * Gerencia desafios diarios e semanais.
 * Inclui debouncing para sync de progresso.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-10
 */

'use client'

import { useCallback, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { useCelebrationStore } from '@/store/celebration-store'
import {
  DAILY_CHALLENGE_TEMPLATES,
  WEEKLY_CHALLENGE_TEMPLATES,
  generateDailyChallenges,
  generateWeeklyChallenges,
} from '@/lib/agora/constants/challenges'
import type { DailyChallenge, WeeklyChallenge } from '@/lib/agora/types/challenge'

const logger = createLogger('AgoraChallenges')

// Debounce sync para evitar chamadas excessivas
const SYNC_DEBOUNCE_MS = 30 * 1000 // 30 segundos

export interface UseAgoraChallengesOptions {
  userId: string
  sessionsToday: number
  diaryEntriesToday: number
  studyMinutesToday: number
  totalXpThisWeek: number
  currentStreak: number
}

export interface UseAgoraChallengesReturn {
  dailyChallenges: DailyChallenge[]
  weeklyChallenges: WeeklyChallenge[]
  refreshChallenges: () => Promise<void>
  claimReward: (challengeId: string, type: 'daily' | 'weekly') => Promise<boolean>
  syncProgress: () => Promise<void>
}

export function useAgoraChallenges(options: UseAgoraChallengesOptions): UseAgoraChallengesReturn {
  const {
    userId,
    sessionsToday,
    diaryEntriesToday,
    studyMinutesToday,
    totalXpThisWeek,
    currentStreak,
  } = options

  const supabase = createClient()
  const { queueCelebration } = useCelebrationStore()

  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([])
  const [weeklyChallenges, setWeeklyChallenges] = useState<WeeklyChallenge[]>([])

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSyncRef = useRef<number>(0)

  // Sync com debounce
  const syncProgress = useCallback(async () => {
    if (!userId) return

    // Debounce
    const now = Date.now()
    if (now - lastSyncRef.current < SYNC_DEBOUNCE_MS) {
      // Agendar sync futuro se ainda nao agendado
      if (!syncTimeoutRef.current) {
        syncTimeoutRef.current = setTimeout(() => {
          syncTimeoutRef.current = null
          syncProgress()
        }, SYNC_DEBOUNCE_MS)
      }
      return
    }
    lastSyncRef.current = now

    try {
      // Atualizar progresso dos desafios diarios
      const updatedDaily = dailyChallenges.map((challenge) => {
        let progress = 0
        switch (challenge.type) {
          case 'session':
            progress = sessionsToday
            break
          case 'diary':
            progress = diaryEntriesToday
            break
          case 'time':
            progress = studyMinutesToday
            break
        }
        return {
          ...challenge,
          progress,
          completed: progress >= challenge.target,
        }
      })

      // Atualizar progresso dos desafios semanais
      const updatedWeekly = weeklyChallenges.map((challenge) => {
        let progress = 0
        switch (challenge.type) {
          case 'sessions':
            progress = sessionsToday // TODO: somar sessoes da semana
            break
          case 'xp':
            progress = totalXpThisWeek
            break
          case 'streak':
            progress = currentStreak
            break
        }
        return {
          ...challenge,
          progress,
          completed: progress >= challenge.target,
        }
      })

      setDailyChallenges(updatedDaily)
      setWeeklyChallenges(updatedWeekly)

      // Sync com servidor
      const challengesToSync = [
        ...updatedDaily.map((c) => ({ ...c, period: 'daily' })),
        ...updatedWeekly.map((c) => ({ ...c, period: 'weekly' })),
      ]

      await supabase.rpc('sync_challenge_progress', {
        p_user_id: userId,
        p_challenges: JSON.stringify(challengesToSync),
      })

      logger.debug('Challenge progress synced')
    } catch (error) {
      logger.error('Failed to sync challenge progress', error)
    }
  }, [
    userId,
    dailyChallenges,
    weeklyChallenges,
    sessionsToday,
    diaryEntriesToday,
    studyMinutesToday,
    totalXpThisWeek,
    currentStreak,
    supabase,
  ])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [])

  const refreshChallenges = useCallback(async () => {
    if (!userId) return

    try {
      // Buscar progresso do servidor
      const { data, error } = await supabase.rpc('get_challenge_progress', {
        p_user_id: userId,
      })

      if (error) {
        logger.error('Failed to fetch challenge progress', error)
        // Gerar desafios localmente como fallback
        setDailyChallenges(generateDailyChallenges())
        setWeeklyChallenges(generateWeeklyChallenges())
        return
      }

      if (data?.daily) {
        setDailyChallenges(data.daily)
      } else {
        setDailyChallenges(generateDailyChallenges())
      }

      if (data?.weekly) {
        setWeeklyChallenges(data.weekly)
      } else {
        setWeeklyChallenges(generateWeeklyChallenges())
      }
    } catch (error) {
      logger.error('Error refreshing challenges', error)
    }
  }, [userId, supabase])

  const claimReward = useCallback(
    async (challengeId: string, type: 'daily' | 'weekly'): Promise<boolean> => {
      if (!userId) return false

      try {
        const { data, error } = await supabase.rpc('claim_challenge_reward', {
          p_user_id: userId,
          p_challenge_id: challengeId,
          p_type: type,
        })

        if (error) {
          logger.error('Failed to claim reward', error)
          return false
        }

        if (data?.success) {
          // Atualizar estado local
          if (type === 'daily') {
            setDailyChallenges((prev) =>
              prev.map((c) => (c.id === challengeId ? { ...c, claimed: true } : c))
            )
          } else {
            setWeeklyChallenges((prev) =>
              prev.map((c) => (c.id === challengeId ? { ...c, claimed: true } : c))
            )
          }

          // Celebrar
          queueCelebration({
            type: 'challenge-complete',
            data: { xpEarned: data.xp_earned },
          })

          return true
        }

        return false
      } catch (error) {
        logger.error('Error claiming reward', error)
        return false
      }
    },
    [userId, supabase, queueCelebration]
  )

  return {
    dailyChallenges,
    weeklyChallenges,
    refreshChallenges,
    claimReward,
    syncProgress,
  }
}
```

**Estimativa**: 10 horas

---

#### 3.3.5 Arquivo: hooks/agora/index.ts (Facade)

```typescript
/**
 * Agora Hooks - Barrel Export & Facade
 *
 * Exporta todos os hooks do Agora e fornece um hook facade
 * para compatibilidade com codigo existente.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-10
 */

// Individual hooks
export { useAgoraAuth, type UseAgoraAuthReturn } from './use-agora-auth'
export { useAgoraProfile, type UseAgoraProfileReturn } from './use-agora-profile'
export { useAgoraXp, type UseAgoraXpReturn } from './use-agora-xp'
export { useAgoraBadges, type UseAgoraBadgesReturn, type Badge } from './use-agora-badges'
export { useAgoraChallenges, type UseAgoraChallengesReturn } from './use-agora-challenges'
export { useAgoraSessions, type UseAgoraSessionsReturn } from './use-agora-sessions'
export { useAgoraDiary, type UseAgoraDiaryReturn } from './use-agora-diary'
export { useAgoraOnboarding, type UseAgoraOnboardingReturn } from './use-agora-onboarding'

// Provider
export { AgoraProvider, useAgoraContext } from './providers/agora-provider'

// Types re-export
export type { AgoraUser, AgoraTrack, AgoraRank } from '@/lib/agora/types/user'
export type { DailyChallenge, WeeklyChallenge } from '@/lib/agora/types/challenge'
export type { BadgeDefinition, BadgeTier, BadgeCategory } from '@/lib/agora/types/badge'

/**
 * Facade Hook - Compatibilidade com codigo existente
 *
 * DEPRECATED: Prefira usar hooks individuais para melhor performance.
 * Este hook sera removido em versao futura.
 */
export function useAgora() {
  console.warn(
    '[DEPRECATED] useAgora() is deprecated. ' +
      'Use individual hooks (useAgoraAuth, useAgoraXp, etc.) for better performance.'
  )

  const context = useAgoraContext()
  return context
}
```

**Estimativa**: 2 horas

---

### 3.4 Fase 4: Refatoracao do Certificate Modal (Dias 15-18)

**Objetivo**: Dividir componente monolitico em sub-componentes focados.

#### 3.4.1 Nova Estrutura

```
components/agora/certificate/
├── index.ts                      # Barrel export
├── certificate-modal.tsx         # Modal wrapper (orchestrador)
├── certificate-preview.tsx       # Preview visual
├── certificate-pdf.tsx           # Geracao PDF (lazy loaded)
├── certificate-validation.tsx    # Validacao de requisitos
├── certificate-telemetry.tsx     # Checagem de telemetria
├── parental-access-form.tsx      # Formulario acesso parental
├── hooks/
│   ├── use-certificate-data.ts   # Dados do certificado
│   └── use-certificate-pdf.ts    # Logica PDF
└── types.ts                      # Types locais
```

**Estimativa**: 16 horas

---

### 3.5 Fase 5: Performance (Dias 19-22)

**Objetivo**: Otimizar performance critica.

#### 3.5.1 Debouncing Global

**Arquivo**: `lib/agora/utils/debounce.ts`

```typescript
/**
 * Debounce utilities for Agora
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-10
 */

export function createDebouncedFunction<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delayMs)
  }
}

export const DEBOUNCE_DELAYS = {
  BADGE_CHECK: 5 * 60 * 1000, // 5 minutos
  CHALLENGE_SYNC: 30 * 1000, // 30 segundos
  XP_SYNC: 10 * 1000, // 10 segundos
  SESSION_UPDATE: 60 * 1000, // 1 minuto
} as const
```

**Estimativa**: 2 horas

---

#### 3.5.2 Lazy Loading do Certificate Modal

**Arquivo**: Atualizar `components/agora/certificate/certificate-modal.tsx`

```typescript
import dynamic from 'next/dynamic'

// Lazy load do PDF generator (jsPDF e pesado)
const CertificatePDF = dynamic(
  () => import('./certificate-pdf').then(mod => mod.CertificatePDF),
  {
    loading: () => <Skeleton className="h-64 w-full" />,
    ssr: false,
  }
)
```

**Estimativa**: 2 horas

---

#### 3.5.3 Memoizacao do Layout

**Arquivo**: `app/pt/agora/layout.tsx`

```typescript
// Memoizar conteudo do layout
const MemoizedLayoutContent = memo(function LayoutContent({
  children
}: {
  children: React.ReactNode
}) {
  // ... conteudo atual
})

// Merge de providers em um unico
export default function AgoraLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AgoraLoadingFallback />}>
      <AgoraProvider> {/* Provider unico */}
        <MemoizedLayoutContent>
          {children}
        </MemoizedLayoutContent>
      </AgoraProvider>
    </Suspense>
  )
}
```

**Estimativa**: 4 horas

---

### 3.6 Fase 6: Testes (Dias 23-30)

**Objetivo**: Aumentar cobertura de testes para >= 60%.

#### 3.6.1 Testes Prioritarios

| Arquivo                                  | Tipo               | Prioridade |
| ---------------------------------------- | ------------------ | ---------- |
| `lib/agora/constants/badges.ts`          | Unit               | P0         |
| `lib/agora/utils/xp-calculator.ts`       | Unit               | P0         |
| `lib/agora/utils/streak-calculator.ts`   | Unit               | P0         |
| `hooks/agora/use-agora-xp.tsx`           | Integration        | P1         |
| `hooks/agora/use-agora-badges.tsx`       | Integration        | P1         |
| `store/kids-store.ts`                    | Unit + Integration | P1         |
| `components/agora/gamification-card.tsx` | Component          | P2         |

#### 3.6.2 Estrutura de Testes

```
__tests__/
├── unit/
│   └── agora/
│       ├── constants/
│       │   ├── badges.test.ts
│       │   ├── challenges.test.ts
│       │   └── gamification.test.ts
│       ├── utils/
│       │   ├── xp-calculator.test.ts
│       │   └── streak-calculator.test.ts
│       └── stores/
│           └── kids-store.test.ts
├── integration/
│   └── agora/
│       ├── hooks/
│       │   ├── use-agora-xp.test.tsx
│       │   ├── use-agora-badges.test.tsx
│       │   └── use-agora-challenges.test.tsx
│       └── flows/
│           ├── onboarding.test.tsx
│           └── gamification.test.tsx
└── e2e/
    └── agora/
        ├── login.spec.ts (existente)
        ├── onboarding.spec.ts (existente)
        └── gamification.spec.ts (existente)
```

**Estimativa**: 40 horas

---

## 4. Cronograma Consolidado

```
+----------------------------------------------------------------+
|                    CRONOGRAMA DE REFATORACAO                    |
+----------------------------------------------------------------+
|                                                                  |
|  Fase 1: Seguranca                    Dias 1-3    (11 horas)    |
|  ├── Rate limiting codigo parental    4h                         |
|  ├── Auditoria RLS policies           4h                         |
|  └── LGPD no middleware               3h                         |
|                                                                  |
|  Fase 2: Centralizacao               Dias 4-6    (9 horas)      |
|  ├── Estrutura lib/agora/             -                          |
|  ├── constants/badges.ts              6h                         |
|  └── types/user.ts                    3h                         |
|                                                                  |
|  Fase 3: Decomposicao Hooks          Dias 7-14   (28 horas)     |
|  ├── use-agora-xp.tsx                 8h                         |
|  ├── use-agora-badges.tsx             8h                         |
|  ├── use-agora-challenges.tsx         10h                        |
|  └── index.ts (facade)                2h                         |
|                                                                  |
|  Fase 4: Certificate Modal           Dias 15-18  (16 horas)     |
|  └── Divisao em sub-componentes       16h                        |
|                                                                  |
|  Fase 5: Performance                 Dias 19-22  (8 horas)      |
|  ├── Debouncing global                2h                         |
|  ├── Lazy loading PDF                 2h                         |
|  └── Memoizacao layout                4h                         |
|                                                                  |
|  Fase 6: Testes                      Dias 23-30  (40 horas)     |
|  └── Unit + Integration tests         40h                        |
|                                                                  |
+----------------------------------------------------------------+
|  TOTAL ESTIMADO                                   112 horas     |
+----------------------------------------------------------------+
```

---

## 5. Metricas de Sucesso

### 5.1 Criterios de Aceite

| Metrica                   | Antes  | Depois | Status |
| ------------------------- | ------ | ------ | ------ |
| Maior hook (linhas)       | 1.818  | < 400  | -      |
| Maior componente (linhas) | 1.579  | < 500  | -      |
| Codigo duplicado          | ~1.200 | 0      | -      |
| Cobertura de testes       | ~25%   | >= 60% | -      |
| Vulnerabilidades P0       | 3      | 0      | -      |
| Re-renders por navegacao  | N/A    | < 2    | -      |
| API calls/minuto (idle)   | 10+    | < 2    | -      |

### 5.2 Definition of Done

- [ ] Todos os hooks < 400 linhas
- [ ] Todos os componentes < 500 linhas
- [ ] Zero duplicacao de tipos/constantes
- [ ] Cobertura de testes >= 60%
- [ ] Zero vulnerabilidades P0
- [ ] Documentacao atualizada
- [ ] Code review aprovado
- [ ] Testes E2E passando

---

## 6. Riscos e Mitigacoes

| Risco                        | Probabilidade | Impacto | Mitigacao                            |
| ---------------------------- | ------------- | ------- | ------------------------------------ |
| Breaking changes em producao | Media         | Alto    | Feature flags, rollout gradual       |
| Regressao de funcionalidades | Media         | Alto    | Testes E2E antes de deploy           |
| Atraso no cronograma         | Alta          | Medio   | Buffer de 20% em cada fase           |
| Resistencia a mudancas       | Baixa         | Baixo   | Documentacao clara, pair programming |

---

## 7. Referencias

- [CLAUDE.md do Projeto](../../CLAUDE.md)
- [Arquitetura Geral](./visao-geral.md)
- [Sistema de Badges](../03-gamificacao/badges.md)
- [Sistema de XP](../03-gamificacao/xp-niveis.md)

---

## Historico de Revisoes

| Versao | Data       | Autor                      | Descricao       |
| ------ | ---------- | -------------------------- | --------------- |
| 1.0.0  | 2025-12-10 | Anderson Henrique da Silva | Criacao inicial |

---

**Autor**: Anderson Henrique da Silva
**Parceria**: Neural Thinker AI Engineering + IFSULDEMINAS/LabSoft
**Licenca**: MIT
