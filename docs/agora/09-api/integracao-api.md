# APIs e Integrações

> Documentação técnica das APIs e integrações da Ágora Academy

---

## 1. Visão Geral

A Ágora Academy integra-se com diversos serviços para fornecer uma experiência completa de aprendizagem. Esta documentação descreve as APIs utilizadas, padrões de integração e configurações necessárias.

### 1.1 Arquitetura de Integrações

```
+------------------------------------------------------------------+
|                    ECOSSISTEMA DE INTEGRAÇÕES                     |
+------------------------------------------------------------------+
|                                                                    |
|  FRONTEND (Next.js)                                               |
|       |                                                            |
|       +-----> Supabase (Auth, Database, Storage)                  |
|       |                                                            |
|       +-----> Backend Cidadão.AI (FastAPI)                        |
|       |           |                                                |
|       |           +-----> Maritaca AI (LLM)                       |
|       |           +-----> Anthropic (Backup LLM)                  |
|       |                                                            |
|       +-----> GitHub API (PRs, Issues)                            |
|       |                                                            |
|       +-----> PostHog (Analytics)                                 |
|       |                                                            |
|       +-----> VLibras (Acessibilidade)                            |
|                                                                    |
+------------------------------------------------------------------+
```

---

## 2. Supabase

### 2.1 Configuração

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 2.2 Tabelas da Ágora

| Tabela                   | Descrição                             |
| ------------------------ | ------------------------------------- |
| `agora_profiles`         | Perfil do estudante (XP, nível, rank) |
| `agora_xp_transactions`  | Histórico de transações de XP         |
| `agora_sessions`         | Sessões de estudo                     |
| `agora_diary_entries`    | Entradas do diário de aprendizagem    |
| `agora_track_progress`   | Progresso nas trilhas                 |
| `agora_module_progress`  | Progresso nos módulos                 |
| `agora_quiz_submissions` | Submissões de quizzes                 |
| `agora_certificates`     | Certificados emitidos                 |

### 2.3 Políticas de Segurança (RLS)

```sql
-- Política: usuário só acessa próprios dados
CREATE POLICY "Users can view own profile"
  ON agora_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON agora_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: transações de XP são imutáveis
CREATE POLICY "Users can view own transactions"
  ON agora_xp_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Inserção apenas via função do servidor
CREATE POLICY "Server can insert transactions"
  ON agora_xp_transactions FOR INSERT
  WITH CHECK (true);  -- Controlado via service_role
```

### 2.4 Funções do Banco

```sql
-- Função: adicionar XP com atualização atômica
CREATE OR REPLACE FUNCTION add_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT,
  p_description TEXT
) RETURNS agora_profiles AS $$
DECLARE
  v_profile agora_profiles;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_new_rank TEXT;
BEGIN
  -- Atualizar perfil
  UPDATE agora_profiles
  SET
    total_xp = total_xp + p_amount,
    current_level = FLOOR((total_xp + p_amount) / 100) + 1,
    current_rank = CASE
      WHEN (total_xp + p_amount) >= 5000 THEN 'arquiteto'
      WHEN (total_xp + p_amount) >= 2000 THEN 'mentor'
      WHEN (total_xp + p_amount) >= 500 THEN 'contribuidor'
      WHEN (total_xp + p_amount) >= 100 THEN 'aprendiz'
      ELSE 'novato'
    END,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING * INTO v_profile;

  -- Registrar transação
  INSERT INTO agora_xp_transactions (user_id, amount, balance_after, source_type, description)
  VALUES (p_user_id, p_amount, v_profile.total_xp, p_source, p_description);

  RETURN v_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 3. Backend Cidadão.AI

### 3.1 Endpoints do Chat

| Método | Endpoint                    | Descrição                     |
| ------ | --------------------------- | ----------------------------- |
| POST   | `/api/v1/chat/stream`       | Enviar mensagem com streaming |
| GET    | `/api/v1/agents`            | Listar agentes disponíveis    |
| GET    | `/api/v1/agents/{agent_id}` | Detalhes de um agente         |
| GET    | `/api/v1/health`            | Health check do serviço       |

### 3.2 Adaptadores de Chat

```typescript
// lib/chat/adapters/primary.adapter.ts
export class PrimaryAdapter implements IChatAdapter {
  async sendMessage(message: string, agentId: string): Promise<ChatResponse> {
    const response = await fetch(`${API_URL}/api/v1/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        agent_id: agentId,
        session_id: this.sessionId,
      }),
    })

    if (!response.ok) {
      throw new ChatError(`Backend error: ${response.status}`)
    }

    return this.parseStreamingResponse(response)
  }
}

// lib/chat/adapters/fallback.adapter.ts
export class FallbackAdapter implements IChatAdapter {
  async sendMessage(message: string): Promise<ChatResponse> {
    // Direto para Maritaca AI quando backend está indisponível
    const response = await fetch('https://chat.maritaca.ai/api/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MARITACA_API_KEY}`,
      },
      body: JSON.stringify({
        model: this.selectedModel,
        messages: [{ role: 'user', content: message }],
        stream: true,
      }),
    })

    return this.parseStreamingResponse(response)
  }
}
```

### 3.3 Serviço de Chat

```typescript
// lib/chat/chat.service.ts
export class ChatService {
  private primaryAdapter: PrimaryAdapter
  private fallbackAdapter: FallbackAdapter
  private cache: ChatCache

  async sendMessage(
    message: string,
    agentId: string,
    options?: ChatOptions
  ): Promise<ChatResponse> {
    // Verificar cache
    const cached = this.cache.get(message, agentId)
    if (cached) return cached

    // Verificar modo Maritaca direto
    const maritacaMode = localStorage.getItem('maritaca_selected_model')
    if (maritacaMode) {
      return this.fallbackAdapter.sendMessage(message)
    }

    // Tentar backend principal com fallback
    try {
      const response = await this.primaryAdapter.sendMessage(message, agentId)
      this.cache.set(message, agentId, response)
      return response
    } catch (error) {
      logger.warn('Primary adapter failed, using fallback', { error })
      return this.fallbackAdapter.sendMessage(message)
    }
  }
}
```

---

## 4. GitHub API

### 4.1 Integração Proposta

| Funcionalidade         | Endpoint GitHub                                            |
| ---------------------- | ---------------------------------------------------------- |
| Listar issues boas     | `GET /repos/{owner}/{repo}/issues?labels=good-first-issue` |
| Criar PR               | `POST /repos/{owner}/{repo}/pulls`                         |
| Verificar status de PR | `GET /repos/{owner}/{repo}/pulls/{pr_number}`              |
| Listar contribuições   | `GET /repos/{owner}/{repo}/contributors`                   |

### 4.2 Autenticação OAuth

```typescript
// lib/github/oauth.ts (proposta)
export async function authenticateGitHub() {
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      scopes: 'repo read:user',
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  return data
}
```

### 4.3 Webhooks (Proposta)

```typescript
// app/api/webhooks/github/route.ts
export async function POST(request: Request) {
  const payload = await request.json()
  const event = request.headers.get('X-GitHub-Event')

  switch (event) {
    case 'pull_request':
      if (payload.action === 'closed' && payload.pull_request.merged) {
        await handlePRMerged(payload.pull_request)
      }
      break

    case 'pull_request_review':
      if (payload.action === 'submitted') {
        await handleReviewSubmitted(payload.review)
      }
      break
  }

  return Response.json({ received: true })
}

async function handlePRMerged(pr: any) {
  const userId = await getUserFromGitHub(pr.user.login)
  if (userId) {
    await addXp(userId, 100, 'pr_merged', `PR #${pr.number} merged`)
    await checkBadges(userId, 'pr_merged')
  }
}
```

---

## 5. Analytics (PostHog)

### 5.1 Configuração

```typescript
// lib/analytics/posthog.ts
import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: 'https://app.posthog.com',
      capture_pageview: false, // Controlamos manualmente
      persistence: 'localStorage',
    })
  }
}
```

### 5.2 Eventos da Ágora

| Evento                   | Propriedades                          |
| ------------------------ | ------------------------------------- |
| `agora_session_started`  | `duration_expected`, `track_id`       |
| `agora_session_ended`    | `duration_actual`, `xp_earned`        |
| `agora_xp_earned`        | `amount`, `source`, `total_xp`        |
| `agora_badge_earned`     | `badge_id`, `badge_name`              |
| `agora_level_up`         | `old_level`, `new_level`              |
| `agora_rank_up`          | `old_rank`, `new_rank`                |
| `agora_module_completed` | `module_id`, `track_id`, `time_spent` |
| `agora_quiz_submitted`   | `quiz_id`, `score`, `attempts`        |

### 5.3 Tracker da Ágora

```typescript
// lib/analytics/agora-tracker.ts
export function trackXpEarned(amount: number, source: string, totalXp: number) {
  posthog.capture('agora_xp_earned', {
    amount,
    source,
    total_xp: totalXp,
    timestamp: new Date().toISOString(),
  })
}

export function trackBadgeEarned(badgeId: string, badgeName: string) {
  posthog.capture('agora_badge_earned', {
    badge_id: badgeId,
    badge_name: badgeName,
    timestamp: new Date().toISOString(),
  })
}

export function trackModuleCompleted(moduleId: string, trackId: string, timeSpentMinutes: number) {
  posthog.capture('agora_module_completed', {
    module_id: moduleId,
    track_id: trackId,
    time_spent_minutes: timeSpentMinutes,
    timestamp: new Date().toISOString(),
  })
}
```

---

## 6. VLibras

### 6.1 Integração

```typescript
// hooks/use-vlibras.ts
export function useVLibras() {
  const [isEnabled, setIsEnabled] = useState(false)
  const pathname = usePathname()
  const locale = pathname.startsWith('/pt') ? 'pt' : 'en'

  useEffect(() => {
    const stored = localStorage.getItem('vlibras_enabled')
    setIsEnabled(stored === 'true')
  }, [])

  const toggle = () => {
    const newValue = !isEnabled
    setIsEnabled(newValue)
    localStorage.setItem('vlibras_enabled', String(newValue))

    if (newValue) {
      loadVLibrasWidget()
    } else {
      unloadVLibrasWidget()
    }
  }

  return { isEnabled, toggle, locale }
}
```

### 6.2 Carregamento Lazy

```typescript
// components/a11y/vlibras-lazy.tsx
export function VLibrasWidget() {
  const { isEnabled, locale } = useVLibras()

  useEffect(() => {
    if (!isEnabled || locale !== 'pt') return

    // Carregar script apenas quando necessário
    const script = document.createElement('script')
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js'
    script.async = true
    script.onload = () => {
      new (window as any).VLibras.Widget('https://vlibras.gov.br/app')
    }
    document.body.appendChild(script)

    return () => {
      script.remove()
      // Limpar widget
      document.querySelector('[vw]')?.remove()
    }
  }, [isEnabled, locale])

  return null
}
```

---

## 7. Autenticação

### 7.1 Fluxo OAuth

```
Usuário clica "Entrar"
        |
        v
Redireciona para Supabase Auth
        |
        v
Supabase redireciona para Google/GitHub
        |
        v
Usuário autoriza
        |
        v
Callback em /auth/callback
        |
        v
Cria sessão e perfil Ágora
        |
        v
Redireciona para /pt/agora/dashboard
```

### 7.2 Callback Handler

```typescript
// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/pt/agora/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Criar perfil Ágora se não existir
      await ensureAgoraProfile(supabase)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/pt/login?error=auth_failed`)
}
```

### 7.3 Middleware de Sessão

```typescript
// lib/supabase/middleware.ts
export async function updateSession(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session if needed
  await supabase.auth.getUser()

  return supabaseResponse
}
```

---

## 8. Rate Limiting

### 8.1 Configuração

```typescript
// lib/security/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

export const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
})

export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier)

  return {
    success,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
    },
  }
}
```

### 8.2 Limites por Endpoint

| Endpoint          | Limite  | Janela |
| ----------------- | ------- | ------ |
| `/api/chat`       | 10 req  | 10 seg |
| `/api/xp`         | 30 req  | 1 min  |
| `/api/auth/*`     | 5 req   | 1 min  |
| `/api/webhooks/*` | 100 req | 1 min  |

---

## 9. Variáveis de Ambiente

### 9.1 Obrigatórias

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend Cidadão.AI
NEXT_PUBLIC_API_URL=https://cidadao-api-production.up.railway.app
```

### 9.2 Opcionais

```bash
# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
NEXT_PUBLIC_GA_ID=G-XXXXX

# Acessibilidade
NEXT_PUBLIC_ENABLE_VLIBRAS=true

# PWA
DISABLE_PWA=false

# Cache
KV_URL=your-vercel-kv-url
```

### 9.3 Ambiente de Desenvolvimento

```bash
# .env.local (não commitar)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
DISABLE_PWA=true
NEXT_PUBLIC_ENABLE_VLIBRAS=false
```

---

## 10. Monitoramento e Logs

### 10.1 Logger Estruturado

```typescript
// lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
})

// Uso
logger.info({ userId, xpAmount }, 'XP added')
logger.error({ error, context }, 'Failed to process request')
```

### 10.2 Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    backend: await checkBackend(),
    cache: await checkCache(),
  }

  const healthy = Object.values(checks).every((c) => c.status === 'ok')

  return Response.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  )
}
```

---

## 11. Referências

- Supabase. (2024). Supabase Documentation. https://supabase.com/docs
- Vercel. (2024). Next.js Documentation. https://nextjs.org/docs
- PostHog. (2024). PostHog Documentation. https://posthog.com/docs
- GitHub. (2024). GitHub REST API. https://docs.github.com/en/rest

---

**Autor**: Anderson Henrique da Silva
**Última atualização**: 2025-12-09
**Código fonte**: `lib/chat/`, `lib/supabase/`, `lib/analytics/`
