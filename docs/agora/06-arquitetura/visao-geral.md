# Arquitetura Tecnica da Agora Academy

> Visao geral da arquitetura de software do sistema

---

## 1. Visao Geral

A Agora Academy e construida como parte do frontend do Cidadao.AI, utilizando Next.js 15 com App Router, TypeScript, e Supabase como backend.

### 1.1 Stack Tecnologico

```
+------------------------------------------------------------------+
|                      STACK AGORA ACADEMY                          |
+------------------------------------------------------------------+
|                                                                    |
|  FRONTEND                                                         |
|  ├── Next.js 15 (App Router)                                      |
|  ├── TypeScript 5.x                                               |
|  ├── Tailwind CSS 3.x                                             |
|  ├── Zustand (State Management)                                   |
|  └── Serwist (PWA)                                                |
|                                                                    |
|  BACKEND                                                          |
|  ├── Supabase (Auth, Database, Storage)                           |
|  ├── Railway (API Principal - cidadao.ai-backend)                 |
|  └── Vercel (Hosting, Edge Functions)                             |
|                                                                    |
|  INTEGRACAO                                                       |
|  ├── GitHub OAuth                                                 |
|  ├── GitHub API (verificacao de fork)                             |
|  └── Maritaca AI / Anthropic (Mentores IA)                        |
|                                                                    |
+------------------------------------------------------------------+
```

---

## 2. Arquitetura de Alto Nivel

```
                              USUARIO
                                 |
                                 v
                     +---------------------+
                     |    Next.js App      |
                     |    (Vercel Edge)    |
                     +---------------------+
                                 |
              +------------------+------------------+
              |                  |                  |
              v                  v                  v
     +---------------+  +---------------+  +---------------+
     |   Supabase    |  |   Railway     |  |   GitHub      |
     |   (Auth/DB)   |  |   (AI Chat)   |  |   (OAuth)     |
     +---------------+  +---------------+  +---------------+
```

### 2.1 Fluxo de Dados

```
1. AUTENTICACAO
   Usuario -> GitHub OAuth -> Supabase Auth -> JWT -> App

2. GAMIFICACAO
   Acao Usuario -> Hook useAgora -> Supabase RPC -> Atualizacao

3. CHAT COM MENTOR
   Mensagem -> AgoraChatStore -> Railway API (SSE) -> Resposta

4. PERSISTENCIA
   Estado Local -> Zustand Persist -> localStorage
   Estado Remoto -> Supabase Tables -> PostgreSQL
```

---

## 3. Estrutura de Diretorios

```
app/pt/agora/
├── page.tsx                    # Dashboard principal
├── layout.tsx                  # Layout com providers
├── loading.tsx                 # Loading state
├── error.tsx                   # Error boundary
├── actions.ts                  # Server Actions
├── _components/
│   └── dashboard-client.tsx    # Dashboard client component
├── login/
│   └── page.tsx                # Pagina de login
├── onboarding/
│   └── page.tsx                # Fluxo de onboarding
├── trilhas/
│   ├── page.tsx                # Lista de trilhas
│   └── [trackId]/
│       └── [moduleId]/
│           └── page.tsx        # Modulo individual
├── chat/
│   └── page.tsx                # Chat com mentores
├── diario/
│   └── page.tsx                # Diario de bordo
├── ranking/
│   └── page.tsx                # Leaderboard
├── perfil/
│   └── page.tsx                # Perfil do usuario
├── configuracoes/
│   └── page.tsx                # Configuracoes
├── videos/
│   └── page.tsx                # Catalogo de videos
├── leituras/
│   └── page.tsx                # Material de leitura
├── atividades/
│   └── page.tsx                # Atividades pendentes
├── ajuda/
│   └── page.tsx                # Central de ajuda
└── contract/
    └── page.tsx                # Contrato de estagio

components/agora/
├── agora-header.tsx            # Header principal
├── agora-sidebar.tsx           # Sidebar de navegacao
├── agora-agent-selector.tsx    # Seletor de mentores
├── agent-card.tsx              # Card de agente
├── badge-showcase.tsx          # Exibicao de badges
├── celebration-modal.tsx       # Modal de celebracao
├── gamification-card.tsx       # Card de gamificacao
├── stat-card.tsx               # Card de estatisticas
├── quick-action-card.tsx       # Acoes rapidas
├── activity-feed.tsx           # Feed de atividades
├── session-manager.tsx         # Gerenciador de sessao
├── timeline-card.tsx           # Card de timeline
├── timeline-modal.tsx          # Modal de timeline
├── lgpd-consent-modal.tsx      # Modal LGPD
├── internship-contract-modal.tsx # Modal de contrato
├── certificate-modal.tsx       # Modal de certificado
├── logout-modal.tsx            # Modal de logout
└── background-selector.tsx     # Seletor de background

hooks/
├── use-agora.tsx               # Hook principal (1736 linhas)
├── use-agora-auth.tsx          # Autenticacao OAuth
└── use-agora-demo.tsx          # Modo demo (deprecated)

store/
├── agora-chat-store.ts         # Estado do chat
└── celebration-store.ts        # Estado de celebracoes

lib/agora/
├── leaderboard.ts              # Servico de ranking
├── certificate-requirements.ts # Requisitos de certificado
└── github.ts                   # Integracao GitHub
```

---

## 4. Componentes Principais

### 4.1 Hook useAgora

O hook `useAgora` e o coracao do sistema, gerenciando todo o estado e acoes.

```typescript
// hooks/use-agora.tsx

interface AgoraContextType {
  // Estado
  user: AgoraUser | null
  isAuthenticated: boolean
  isLoading: boolean
  badges: AgoraBadge[]
  sessions: StudySession[]
  dailyChallenges: DailyChallenge[]
  weeklyChallenges: WeeklyChallenge[]

  // Acoes
  addXp: (amount, source, description) => Promise<void>
  startSession: () => Promise<void>
  endSession: (xpEarned, agentsUsed) => Promise<void>
  checkAndAwardBadges: () => Promise<void>
  claimChallenge: (id, periodStart, isWeekly) => Promise<Result>

  // Onboarding
  completeOnboarding: () => Promise<void>
  setOnboardingStep: (step) => Promise<void>

  // Auth
  logout: () => Promise<void>
}
```

### 4.2 AgoraChatStore

Store Zustand para gerenciar o chat com mentores.

```typescript
// store/agora-chat-store.ts

interface AgoraChatState {
  messages: Message[]
  selectedAgentId: string
  isLoading: boolean
  streaming: {
    isStreaming: boolean
    phase: 'thinking' | 'responding' | 'idle'
    accumulatedContent: string
  }

  // Acoes
  sendMessage: (content: string) => Promise<void>
  selectAgent: (agentId: string) => void
  clearChat: () => void
}
```

### 4.3 CelebrationStore

Store para gerenciar celebracoes (badges, level up, etc).

```typescript
// store/celebration-store.ts

interface CelebrationState {
  isOpen: boolean
  celebration: CelebrationData | null
  queue: CelebrationData[]

  // Acoes
  celebrateBadge: (name, emoji, xp) => void
  celebrateLevelUp: (level) => void
  celebrateRankUp: (rank) => void
  hideCelebration: () => void
}
```

---

## 5. Banco de Dados (Supabase)

### 5.1 Schema

```sql
-- Perfil do usuario na Agora
CREATE TABLE agora_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  full_name TEXT,
  avatar_url TEXT,
  github_username TEXT,
  matricula TEXT,
  curso TEXT,
  periodo INTEGER,

  -- Gamificacao
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_rank TEXT DEFAULT 'novato',
  badges TEXT[] DEFAULT '{}',
  tracks TEXT[] DEFAULT '{}',

  -- Streak
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  last_daily_bonus_date DATE,

  -- Estatisticas
  total_sessions INTEGER DEFAULT 0,
  total_time_minutes INTEGER DEFAULT 0,
  total_videos_completed INTEGER DEFAULT 0,

  -- Onboarding
  has_completed_onboarding BOOLEAN DEFAULT FALSE,
  has_accepted_terms BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,

  -- Admin
  is_superuser BOOLEAN DEFAULT FALSE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_rank CHECK (current_rank IN ('novato', 'aprendiz', 'contribuidor', 'mentor', 'arquiteto'))
);

-- Transacoes de XP
CREATE TABLE agora_xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  source_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessoes de estudo
CREATE TABLE agora_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  xp_earned INTEGER DEFAULT 0,
  conversations JSONB,
  status TEXT DEFAULT 'active',

  CONSTRAINT valid_status CHECK (status IN ('active', 'completed', 'abandoned'))
);

-- Entradas do diario
CREATE TABLE agora_diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  session_id UUID REFERENCES agora_sessions,
  content TEXT NOT NULL,
  mood TEXT,
  what_learned TEXT,
  what_struggled TEXT,
  next_steps TEXT,
  entry_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_mood CHECK (mood IN ('great', 'good', 'neutral', 'struggling'))
);

-- Consentimento LGPD
CREATE TABLE agora_consent (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  consent_version TEXT NOT NULL,
  tracking_consent BOOLEAN DEFAULT TRUE,
  data_processing_consent BOOLEAN DEFAULT TRUE,
  certificate_consent BOOLEAN DEFAULT TRUE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eventos do calendario
CREATE TABLE agora_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  xp_reward INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progresso de desafios
CREATE TABLE agora_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  challenge_id TEXT NOT NULL,
  challenge_type TEXT NOT NULL,
  period_start DATE NOT NULL,
  current_progress INTEGER DEFAULT 0,
  target_value INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL,
  xp_claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, challenge_id, period_start)
);
```

### 5.2 Row Level Security (RLS)

```sql
-- Usuarios so podem ver/editar seus proprios dados
ALTER TABLE agora_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON agora_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON agora_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON agora_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Aplicar a todas as tabelas...
```

### 5.3 Funcoes RPC

```sql
-- Leaderboard
CREATE OR REPLACE FUNCTION get_agora_leaderboard(
  sort_by TEXT DEFAULT 'xp',
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  total_xp INTEGER,
  current_level INTEGER,
  current_rank TEXT,
  current_streak INTEGER,
  total_time_minutes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.user_id,
    p.full_name,
    p.avatar_url,
    p.total_xp,
    p.current_level,
    p.current_rank,
    p.current_streak,
    p.total_time_minutes
  FROM agora_profiles p
  ORDER BY
    CASE WHEN sort_by = 'xp' THEN p.total_xp END DESC,
    CASE WHEN sort_by = 'time' THEN p.total_time_minutes END DESC,
    CASE WHEN sort_by = 'streak' THEN p.current_streak END DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Posicao do usuario no ranking
CREATE OR REPLACE FUNCTION get_user_rank(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  user_rank INTEGER;
BEGIN
  SELECT position INTO user_rank
  FROM (
    SELECT user_id, ROW_NUMBER() OVER (ORDER BY total_xp DESC) as position
    FROM agora_profiles
  ) ranked
  WHERE user_id = target_user_id;

  RETURN COALESCE(user_rank, 0);
END;
$$ LANGUAGE plpgsql;
```

---

## 6. Server Actions

```typescript
// app/pt/agora/actions.ts

'use server'

// Sincronizar progresso de desafios
export async function syncChallengeProgress(challenges: ChallengeInput[]) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  for (const challenge of challenges) {
    await supabase.from('agora_challenge_progress').upsert({
      user_id: user.id,
      challenge_id: challenge.challengeId,
      challenge_type: challenge.challengeType,
      period_start: calculatePeriodStart(challenge.challengeType),
      current_progress: challenge.currentProgress,
      target_value: challenge.targetValue,
      xp_reward: challenge.xpReward,
    })
  }
}

// Resgatar recompensa de desafio
export async function claimChallengeReward(challengeId: string, periodStart: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Verificar se ja foi resgatado
  const { data: progress } = await supabase
    .from('agora_challenge_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('challenge_id', challengeId)
    .eq('period_start', periodStart)
    .single()

  if (progress?.xp_claimed) {
    return { success: true, alreadyClaimed: true }
  }

  // Verificar se completou
  if (progress.current_progress < progress.target_value) {
    return { success: false, error: 'Challenge not completed' }
  }

  // Marcar como resgatado
  await supabase
    .from('agora_challenge_progress')
    .update({ xp_claimed: true, claimed_at: new Date().toISOString() })
    .eq('id', progress.id)

  // Adicionar XP
  const { data: profile } = await supabase
    .from('agora_profiles')
    .select('total_xp')
    .eq('user_id', user.id)
    .single()

  const newXp = (profile?.total_xp || 0) + progress.xp_reward

  await supabase
    .from('agora_profiles')
    .update({ total_xp: newXp })
    .eq('user_id', user.id)

  await supabase.from('agora_xp_transactions').insert({
    user_id: user.id,
    amount: progress.xp_reward,
    balance_after: newXp,
    source_type: 'challenge',
    description: `Desafio completado: ${challengeId}`,
  })

  return { success: true, xpAwarded: progress.xp_reward }
}

// Eventos do calendario
export async function getCalendarEvents() { ... }
export async function createCalendarEvent(event: CalendarEventInput) { ... }
export async function updateCalendarEvent(id: string, updates: Partial<CalendarEvent>) { ... }
export async function deleteCalendarEvent(id: string) { ... }
export async function completeCalendarEvent(id: string) { ... }
```

---

## 7. Integracao com Chat (Railway)

### 7.1 Arquitetura de Chat

```
Usuario
   |
   v
AgoraChatStore
   |
   v
PrimaryAdapter (lib/chat/adapters/primary.adapter.ts)
   |
   v
Railway API (SSE)
   |
   v
Agentes de IA (Maritaca/Anthropic)
   |
   v
Streaming Response
   |
   v
UI Update
```

### 7.2 Agentes Educacionais

```typescript
// data/agents.ts

const EDUCATIONAL_AGENTS = [
  {
    id: 'santos-dumont',
    name: 'Santos-Dumont',
    role: { pt: 'Mentor de Engenharia', en: 'Engineering Mentor' },
    description: {
      pt: 'Especialista em arquitetura de software e backend',
      en: 'Software architecture and backend specialist',
    },
    image: '/agents/santos-dumont.png',
  },
  {
    id: 'bobardi',
    name: 'Lina Bo Bardi',
    role: { pt: 'Mentora de Design', en: 'Design Mentor' },
    description: {
      pt: 'Especialista em UI/UX e acessibilidade',
      en: 'UI/UX and accessibility specialist',
    },
    image: '/agents/bobardi.png',
  },
  {
    id: 'abaporu',
    name: 'Abaporu',
    role: { pt: 'Orquestrador', en: 'Orchestrator' },
    description: {
      pt: 'Agente central que coordena os demais',
      en: 'Central agent that coordinates others',
    },
    image: '/agents/abaporu.png',
  },
]
```

---

## 8. Fluxos Principais

### 8.1 Fluxo de Autenticacao

```
1. Usuario clica "Entrar com GitHub"
2. Redirect para GitHub OAuth
3. GitHub redireciona para /auth/callback
4. Supabase processa OAuth e cria sessao
5. useAgoraAuth detecta sessao
6. Verifica se perfil existe em agora_profiles
7. Se nao existe, cria perfil inicial
8. Redireciona para dashboard ou onboarding
```

### 8.2 Fluxo de Ganho de XP

```
1. Usuario realiza acao (ex: completar sessao)
2. addXp(amount, sourceType, description) e chamado
3. Calcula novo XP, nivel e rank
4. Atualiza agora_profiles no Supabase
5. Insere registro em agora_xp_transactions
6. Verifica se subiu de nivel/rank
7. Se sim, dispara celebracao
8. Chama checkAndAwardBadges()
9. Verifica elegibilidade para cada badge
10. Persiste novos badges
11. Dispara celebracoes de badges
```

### 8.3 Fluxo de Sessao de Estudo

```
1. Usuario acessa pagina de chat
2. startSession() cria registro em agora_sessions
3. Usuario interage com mentor
4. A cada 5 mensagens, +5 XP
5. Ao sair ou inatividade (30min):
   - endSession() atualiza duracao e XP
   - Atualiza total_sessions e total_time_minutes
   - Verifica badges relacionados
```

---

## 9. Performance e Otimizacoes

### 9.1 Code Splitting

```typescript
// Componentes carregados dinamicamente
const AgoraAgentSelector = dynamic(
  () => import('@/components/agora/agora-agent-selector'),
  { loading: () => <Skeleton />, ssr: false }
)

const CelebrationModal = dynamic(
  () => import('@/components/agora/celebration-modal'),
  { ssr: false }
)
```

### 9.2 Caching

```typescript
// Zustand persist para localStorage
const useAgoraChatStore = create(
  persist(
    (set, get) => ({ ... }),
    {
      name: 'agora-chat',
      partialize: (state) => ({
        messages: state.messages.slice(-50), // Ultimas 50 mensagens
        selectedAgentId: state.selectedAgentId,
      }),
    }
  )
)
```

### 9.3 Otimizacoes de Render

```typescript
// Memoizacao de componentes pesados
const BadgeShowcase = memo(({ badges }: Props) => { ... })

// Memoizacao de valores derivados
const onboarding = useMemo(() => ({
  currentStep: user.onboardingStep,
  completedSteps: Array.from({ length: user.onboardingStep }, (_, i) => i + 1),
  ...
}), [user.onboardingStep, ...])
```

---

## 10. Monitoramento e Analytics

### 10.1 Eventos Rastreados

```typescript
// lib/analytics/agora-tracker.ts

trackDashboardView()
trackMentorChat(agentId, messageCount)
trackStudySession({ duration, activities, xpEarned })
trackBadgeEarned(badgeId, badgeName)
trackLevelUp(oldLevel, newLevel, totalXp)
trackRankUp(oldRank, newRank, level)
trackAgendaEventCreated(eventDetails)
trackAgendaEventCompleted(eventDetails)
```

### 10.2 Integracao PostHog

```typescript
// Eventos customizados para analise de funil
posthog.capture('agora_onboarding_started')
posthog.capture('agora_onboarding_step', { step: 2 })
posthog.capture('agora_onboarding_completed')
posthog.capture('agora_first_session')
posthog.capture('agora_first_badge')
```

---

## 11. Seguranca

### 11.1 Autenticacao

- OAuth 2.0 via GitHub
- JWT gerenciado pelo Supabase
- Refresh token automatico
- Session expiration handling

### 11.2 Autorizacao

- Row Level Security (RLS) em todas as tabelas
- Verificacao de user_id em Server Actions
- Sanitizacao de inputs

### 11.3 Dados Sensiveis

- Nenhum dado sensivel no localStorage
- LGPD compliance com consentimento explicito
- Opcao de exclusao de dados

---

## 12. Proximos Passos Arquiteturais

1. **Migracao para Edge Functions** - Server Actions criticos
2. **Cache Layer** - Redis para leaderboard
3. **WebSockets** - Chat em tempo real (substituir SSE)
4. **Microservices** - Separar servico de gamificacao
5. **Event Sourcing** - Auditoria completa de XP

---

**Autor**: Anderson Henrique da Silva
**Ultima atualizacao**: 2025-12-09
