# Auth System Fixes Plan

**Data**: 2025-12-10
**Autor**: Anderson Henrique da Silva
**Status**: Pendente Aprovacao

---

## Resumo dos Problemas

Identificados **12 problemas criticos** no sistema de autenticacao que causam:

- Redirects para paginas erradas apos login
- Agora "carregando eternamente" ate reload
- Inconsistencia entre fluxos App e Agora
- Race conditions entre providers

---

## Arquitetura Proposta

### Antes (Atual)

```
┌─────────────────────────────────────────────────┐
│                  4 Auth Systems                 │
├─────────────────────────────────────────────────┤
│ use-supabase-auth.tsx  → /pt/app/*             │
│ use-agora-auth.tsx     → /pt/agora/* (layer 1) │
│ use-agora.tsx          → /pt/agora/* (layer 2) │
│ auth.service.ts        → Global singleton      │
└─────────────────────────────────────────────────┘
         ↓ Race conditions, duplicated queries
```

### Depois (Proposto)

```
┌─────────────────────────────────────────────────┐
│            Unified Auth Layer                   │
├─────────────────────────────────────────────────┤
│              auth.service.ts                    │
│          (Single source of truth)               │
│                     ↓                           │
│ ┌─────────────┐ ┌─────────────────────────────┐│
│ │ use-auth.ts │ │ use-agora.tsx (profile only)││
│ │ (wrapper)   │ │ (gamification, sessions)    ││
│ └─────────────┘ └─────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

---

## Correcoes Detalhadas

### Fase 1: Unificar Auth Service (Prioridade Alta)

#### 1.1 Melhorar auth.service.ts

- Adicionar metodo `waitForInit()` que retorna Promise
- Adicionar estado `isReady` que indica quando init completou
- Adicionar evento `onReady` para subscribers
- Cache de sessao para evitar queries duplicadas

```typescript
// lib/services/auth.service.ts
class AuthService {
  private initPromise: Promise<void> | null = null
  private isInitialized = false

  async waitForInit(): Promise<AuthUser | null> {
    if (this.initPromise) {
      await this.initPromise
    }
    return this.currentUser
  }
}
```

#### 1.2 Criar novo hook unificado

- Substituir `use-supabase-auth.tsx` por wrapper em `auth.service.ts`
- Remover duplicacao de codigo
- Manter interface compativel

```typescript
// hooks/use-auth.ts (novo)
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    authService.waitForInit().then(user => {
      setUser(user)
      setIsLoading(false)
    })

    return authService.subscribe((event, user) => {
      setUser(user)
    })
  }, [])

  return { user, isLoading, ... }
}
```

---

### Fase 2: Corrigir Redirects (Prioridade Alta)

#### 2.1 Auth Callback Route

- Usar `next` param de forma consistente
- Adicionar fallback inteligente baseado em origem

```typescript
// app/auth/callback/route.ts
const next = searchParams.get('next')
const origin = request.headers.get('referer')

let redirectPath = '/pt/app' // default
if (next) {
  redirectPath = next
} else if (origin?.includes('/agora')) {
  redirectPath = '/pt/agora'
}
```

#### 2.2 Limpar localStorage redirectAfterLogin

- Nunca salvar landing pages (`/`, `/pt`, `/en`)
- Validar URL antes de redirecionar

```typescript
const INVALID_REDIRECT_PATHS = ['/', '/pt', '/en', '/pt/login', '/en/login']

function saveRedirectUrl(url: string) {
  if (!INVALID_REDIRECT_PATHS.includes(url)) {
    localStorage.setItem('redirectAfterLogin', url)
  }
}
```

---

### Fase 3: Otimizar Loading da Agora (Prioridade Alta)

#### 3.1 Consolidar AgoraAuthProvider + AgoraProvider

- AgoraAuthProvider: SOMENTE auth (user, isAuthenticated)
- AgoraProvider: SOMENTE dados de gamificacao (XP, badges)
- Separar concerns para carregamento paralelo

#### 3.2 Lazy load de dados

- Auth: Carregar imediatamente
- Profile: Carregar em paralelo
- XP/Sessions/Badges: Carregar apos render inicial

```typescript
// use-agora.tsx
useEffect(() => {
  // Auth ja esta no AgoraAuthProvider
  // Aqui so carregamos dados adicionais
  if (authUser) {
    loadProfile() // Paralelo 1
    loadXpHistory() // Paralelo 2
    loadBadges() // Paralelo 3
  }
}, [authUser])
```

#### 3.3 Skeleton Loading

- Mostrar UI imediatamente com skeletons
- Preencher dados conforme carregam
- Remover loading screen bloqueante

---

### Fase 4: Middleware Auth (Prioridade Media)

#### 4.1 Adicionar verificacao de auth no middleware

```typescript
// middleware.ts
const protectedPaths = ['/pt/app', '/pt/agora']
const authPaths = ['/pt/login', '/pt/agora/login']

if (isProtectedPath && !session) {
  return NextResponse.redirect('/pt/login')
}

if (isAuthPath && session) {
  return NextResponse.redirect('/pt/app')
}
```

---

### Fase 5: Cleanup (Prioridade Baixa)

- Remover `use-supabase-auth.tsx` (substituido por `use-auth.ts`)
- Deprecar metodos duplicados
- Atualizar documentacao CLAUDE.md

---

## Ordem de Implementacao

| #   | Tarefa                      | Arquivos       | Impacto                     |
| --- | --------------------------- | -------------- | --------------------------- |
| 1   | Melhorar auth.service.ts    | 1 arquivo      | Base para tudo              |
| 2   | Criar use-auth.ts unificado | 1 arquivo novo | Substitui use-supabase-auth |
| 3   | Corrigir auth callback      | 1 arquivo      | Redirects corretos          |
| 4   | Otimizar AgoraProvider      | 2 arquivos     | Loading rapido              |
| 5   | Corrigir login pages        | 2 arquivos     | UX consistente              |
| 6   | Adicionar middleware auth   | 1 arquivo      | Protecao server-side        |
| 7   | Cleanup e testes            | Varios         | Estabilidade                |

---

## Metricas de Sucesso

| Metrica                  | Antes     | Depois     |
| ------------------------ | --------- | ---------- |
| Tempo login -> dashboard | 3-8s      | < 1s       |
| Redirects incorretos     | ~30%      | 0%         |
| Reloads necessarios      | Frequente | Nunca      |
| Race conditions          | Comum     | Eliminadas |

---

## Riscos

1. **Quebrando changes**: Hooks atuais sao usados em muitos lugares
   - Mitigacao: Manter interfaces compativeis

2. **Regressoes**: Fluxo de auth e critico
   - Mitigacao: Testes E2E antes/depois

3. **Cookies/Session**: Mudancas podem invalidar sessoes existentes
   - Mitigacao: Testar em staging primeiro
