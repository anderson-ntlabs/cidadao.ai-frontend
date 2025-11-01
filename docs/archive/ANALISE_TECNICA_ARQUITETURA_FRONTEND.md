# RELATÓRIO DE ANÁLISE TÉCNICA: ARQUITETURA FRONTEND CIDADÃO.AI

**Autor:** Anderson Henrique da Silva
**Data:** 04 de outubro de 2025 às 11:31 BRT
**Localização:** Minas Gerais, Brasil
**Versão do Documento:** 1.0
**Status:** Análise Completa

---

## SUMÁRIO EXECUTIVO

Este relatório apresenta uma análise técnica profunda da arquitetura frontend do projeto Cidadão.AI, uma plataforma Progressive Web Application (PWA) desenvolvida em Next.js 15 com sistema multi-agente de inteligência artificial para democratização do acesso a dados públicos brasileiros.

### Métricas Gerais

- **Linhas de Código:** ~15.000 LOC
- **Arquivos TypeScript/React:** 182
- **Componentes UI:** 90+
- **Test Files:** 138
- **Agentes IA:** 17 (8 operacionais, 9 estruturados)
- **Chat Adapters:** 6 (identificado over-engineering)
- **Test Coverage:** 40% (meta: 80%)
- **Bundle Size:** ~400KB (não otimizado)

---

## 1. VISÃO GERAL DA ARQUITETURA

### 1.1 Stack Tecnológico

#### Core Framework

```typescript
- Next.js 15.1.0 (App Router)
- React 18.3.1
- TypeScript 5+ (strict mode)
- Node.js (runtime)
```

#### State Management & Data

```typescript
- Zustand 5.0.8 (global state)
- Supabase 2.58.0 (auth + database)
- Axios 1.12.2 (HTTP client)
- @supabase/ssr 0.7.0 (server-side auth)
```

#### Styling & UI

```typescript
- Tailwind CSS 3.4.17
- Class Variance Authority 0.7.1
- Framer Motion 12.23.16 (animations)
- Lucide React 0.543.0 (icons)
```

#### Testing & Quality

```typescript
- Vitest 3.2.4 (unit tests)
- Playwright 1.55.0 (E2E)
- @testing-library/react 16.3.0
- @vitest/coverage-v8 3.2.4
```

#### PWA & Performance

```typescript
- @ducanh2912/next-pwa 10.2.9
- web-vitals 4.2.4
- Service Workers (offline support)
```

### 1.2 Estrutura de Diretórios

```
cidadao.ai-frontend/
├── app/                          # Next.js 15 App Router
│   ├── layout.tsx                # Root layout
│   ├── pt/                       # Portuguese routes (default)
│   │   ├── layout.tsx            # PT layout + Operários background
│   │   ├── (authenticated)/      # Protected routes
│   │   │   ├── chat/             # AI chat interface
│   │   │   ├── dashboard/        # Analytics dashboard
│   │   │   ├── investigacoes/    # Investigations view
│   │   │   ├── perfil/           # User profile
│   │   │   └── layout.tsx        # Auth wrapper
│   │   ├── login/                # Supabase OAuth login
│   │   ├── about/                # Public pages
│   │   └── agents/               # Agent gallery
│   └── en/                       # English routes (mirror)
│
├── components/                   # React components
│   ├── ui/                       # Base design system (40+ components)
│   ├── chat/                     # Chat-specific components
│   ├── charts/                   # ApexCharts + Recharts wrappers
│   ├── tour/                     # Driver.js guided tours
│   ├── a11y/                     # Accessibility helpers
│   └── [features]/               # Feature components
│
├── lib/                          # Core libraries
│   ├── api/                      # API clients & chat adapters (6)
│   ├── services/                 # Business logic services
│   ├── supabase/                 # Supabase SSR clients
│   ├── telemetry/                # Analytics & metrics
│   ├── security/                 # Sanitization & validation
│   └── websocket/                # WS client (disabled)
│
├── store/                        # Zustand stores
│   ├── chat-store.ts             # Chat state + actions
│   └── notification-store.ts     # Toast notifications
│
├── hooks/                        # Custom React hooks (15+)
│   ├── use-supabase-auth.tsx     # Auth context & hooks
│   ├── use-chat.ts               # Chat logic
│   └── [others].ts               # Utility hooks
│
├── types/                        # TypeScript definitions
│   ├── chat.ts                   # Chat system types
│   ├── agent.ts                  # Agent definitions
│   └── [others].ts               # Domain types
│
├── data/                         # Static data
│   ├── agents.ts                 # 17 Brazilian agents
│   └── help-center.ts            # Help content
│
├── scripts/                      # Utility scripts (42)
│   ├── test-*.js                 # Integration tests
│   └── [utilities].js            # Build/dev tools
│
├── tests/                        # Test suites
│   ├── e2e/                      # Playwright E2E tests
│   └── utils/                    # Test utilities
│
├── public/                       # Static assets
│   ├── agents/                   # Agent avatars
│   ├── icons/                    # PWA icons
│   ├── operarios.png             # Background (Tarsila)
│   └── manifest.json             # PWA manifest
│
└── [config files]                # TypeScript, Tailwind, etc.
```

---

## 2. SISTEMAS PRINCIPAIS

### 2.1 Sistema de Autenticação (Supabase OAuth)

#### Implementação

- **Status:** ✅ Produção (Funcional)
- **Providers:** Google OAuth, GitHub OAuth, Email/Password
- **Arquitetura:** SSR (Server-Side Rendering) com cookie-based sessions

#### Fluxo OAuth Completo

```typescript
// hooks/use-supabase-auth.tsx
1. User clicks "Login with Google"
   ↓
2. supabase.auth.signInWithOAuth({
     provider: 'google',
     redirectTo: '/auth/callback?next=/pt/home'
   })
   ↓
3. Redirect to Google OAuth consent screen
   ↓
4. Google callback → /auth/callback
   ↓
5. Middleware (lib/supabase/middleware.ts) refreshes session
   ↓
6. onAuthStateChange() listener detects user
   ↓
7. setUser(convertSupabaseUser(session.user))
   ↓
8. Toast notification: "Bem-vindo, {name}!"
   ↓
9. router.push(redirectUrl || '/pt/home')
```

#### Features Implementadas

- ✅ Multi-provider OAuth (Google, GitHub)
- ✅ Email/Password authentication
- ✅ Session refresh automático
- ✅ User metadata parsing (name, avatar, role)
- ✅ Avatar fallback (UI Avatars API)
- ✅ Protected routes (middleware redirect)
- ✅ Error handling (/auth/error)
- ✅ Loading states
- ✅ Toast feedback
- ✅ Redirect preservation (localStorage)

#### Componentes Principais

```typescript
// app/pt/login/page-supabase.tsx
- Supabase Auth UI component
- ThemeSupa customizado (brand colors)
- Localização PT-BR completa
- View toggle (sign_in ↔ sign_up)
- Social buttons styled

// hooks/use-supabase-auth.tsx
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email, password) => Promise<void>
  loginWithProvider: (provider) => Promise<void>
  signup: (email, password, name) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}
```

### 2.2 Sistema de Chat Multi-Adapter

#### Arquitetura de Adapters

**Status:** ⚠️ Over-Engineering Identificado

```typescript
// lib/services/smart-chat.service.ts
private endpoints: ChatEndpoint[] = [
  {
    url: '/api/v1/chat/stable',
    adapter: sendBackendMessage,
    model: 'sabiazinho-3',
    costLevel: 1,
    priority: 1
  },
  {
    url: '/api/v1/chat/optimized',
    adapter: sendOptimizedMessage,
    model: 'sabiazinho-3',
    costLevel: 1,
    priority: 2
  },
  {
    url: '/api/v1/chat/emergency',
    adapter: sendEmergencyMessage,
    model: 'sabiazinho-3',
    costLevel: 1,
    priority: 3
  },
  {
    url: '/api/v1/chat/message',
    adapter: sendChatMessageV3,
    model: 'legacy',
    costLevel: 0,
    priority: 4
  },
  // + v2, v1 ainda no código (não utilizados)
]
```

#### Problema Identificado

- ❌ **6 adapters** sem métricas de justificativa
- ❌ Complexidade de manutenção desnecessária
- ❌ Falta telemetria de taxa de falha por adapter
- ❌ Versões antigas (v1, v2) no codebase sem uso

#### Smart Chat Service - Features

```typescript
class SmartChatService {
  // Análise de complexidade da mensagem
  analyzeComplexity(message: string): 'simple' | 'moderate' | 'complex' {
    const complexKeywords = ['analise', 'investigue', 'compare', 'tendência']

    if (message.length > 200) return 'complex'
    if (hasComplexKeyword) return 'complex'
    if (hasModerateKeyword) return 'moderate'
    return 'simple'
  }

  // Seleção de endpoint por preferência
  selectEndpoints(
    message,
    options: {
      preferredModel?: 'auto' | 'economic' | 'quality' | 'stable'
    }
  ): ChatEndpoint[]

  // Tentativa com timeout e fallback
  async tryEndpoint(endpoint, request, timeout = 30000)

  // Fallback local quando todos falham
  createFallbackResponse(request, error): ChatResponse
}
```

#### Modelos e Custos

```typescript
const costs = {
  'sabiazinho-3': 0.001, // R$ por 1k tokens (economic)
  'sabia-3': 0.003, // R$ por 1k tokens (quality)
  mixed: 0.002, // R$ por 1k tokens (auto)
}
```

#### Estratégias de Seleção

- **Economic:** Ordena por custo (cheapest first)
- **Quality:** Ordena por custo (most expensive = highest quality)
- **Stable:** Prioriza endpoint `/stable`
- **Auto:** Usa priority field (default)

### 2.3 Sistema de Cache Inteligente

#### Implementação Atual

**Status:** ⚠️ Risco de Memory Leak Identificado

```typescript
// lib/services/chat-cache.service.ts
class ChatCacheService {
  private cache = new Map<string, CachedResponse>()
  private readonly maxCacheSize = 1000 // ⚠️ Muito alto para browser
  private readonly defaultTTL = 3600000 // 1 hour

  // TTL dinâmico por tipo
  private readonly ttlByType = {
    greeting: 86400000, // 24 hours
    help: 3600000, // 1 hour
    factual: 86400000, // 24 hours (confidence > 0.95)
    analysis: 600000, // 10 minutes
    default: 1800000, // 30 minutes
  }
}
```

#### Estimativa de Memória

```
Mensagem média: ~2KB (response + metadata)
1000 entradas × 2KB = 2MB base

Pior caso (respostas grandes com charts):
1000 × 50KB = 50MB RAM

🔴 Em dispositivo mobile (2GB RAM total):
   50MB = 2.5% da RAM total!
```

#### Features Implementadas

- ✅ LRU eviction (Least Recently Used)
- ✅ TTL dinâmico por tipo de mensagem
- ✅ Confidence threshold (só cacheia se > 0.8)
- ✅ Message normalization (remove pontuação, artigos)
- ✅ Cache statistics (hits, size, model distribution)
- ❌ Sem persistência (perde tudo no reload)
- ❌ Alto consumo de memória

#### Normalização de Mensagens

```typescript
private normalizeMessage(message: string): string {
  return message
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"]/g, '')              // Remove pontuação
    .replace(/\s+/g, ' ')                    // Normaliza espaços
    .replace(/\b(eu|me|meu|minha)\b/g, '')   // Remove pronomes
    .replace(/\b(o|a|os|as|um|uma)\b/g, '')  // Remove artigos
    .trim();
}
```

### 2.4 State Management (Zustand)

#### Chat Store

```typescript
// store/chat-store.ts
interface ChatStore {
  // State
  messages: ChatMessage[]
  session: ChatSession | null
  connectionStatus: ChatConnectionStatus
  isTyping: boolean
  agentTyping: boolean
  activeAgents: AgentInfo[]
  suggestedActions: QuickAction[]
  currentInvestigation: Investigation | null
  error: string | null
  isLoading: boolean
  ws: ChatWebSocket | null // ⚠️ Disabled (backend não suporta)

  // Actions (17 total)
  initializeChat: (sessionId?) => Promise<void>
  sendMessage: (content, useWebSocket?) => Promise<void>
  sendStreamingMessage: (content) => void
  loadChatHistory: (sessionId) => Promise<void>
  loadMoreMessages: (cursor, direction) => Promise<void>
  clearChat: () => Promise<void>
  connectWebSocket: () => void // ⚠️ Disabled
  disconnectWebSocket: () => void
  // ... 9 more actions
}
```

#### Features

- ✅ DevTools integration (Redux DevTools)
- ✅ LocalStorage persistence
- ✅ Supabase integration (message history)
- ⚠️ WebSocket infrastructure (disabled - backend issue)
- ✅ Investigation tracking

#### WebSocket - Problema Arquitetural

```typescript
// WebSocket não suporta em HuggingFace Spaces
connectWebSocket: () => {
  console.log('WebSocket connection skipped - not supported by backend')
  set({ connectionStatus: 'disconnected' })
  return

  /* Disabled until backend supports WebSocket
     Infraestrutura completa implementada mas não utilizável
  */
}
```

---

## 3. DESIGN SYSTEM & UI/UX

### 3.1 Identidade Visual Brasileira

#### Inspiração Cultural

- **Tema Base:** Tarsila do Amaral (Modernismo Brasileiro)
- **Background:** Pintura "Operários" (1933)
- **Cores:** Paleta inspirada em obras brasileiras

```typescript
// tailwind.config.js
colors: {
  brand: {
    green: {
      500: '#10b981',  // Primary (transparência)
      600: '#059669',
      700: '#047857',
    },
    blue: {
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
    yellow: {
      500: '#f59e0b',
      600: '#d97706',
    },
    purple: {
      600: '#9333ea',
    },
    red: {
      600: '#dc2626',
    }
  }
}
```

#### Glass Morphism Design

```css
/* Efeito característico do projeto */
.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### 3.2 Sistema de Componentes

#### Button Component (CVA Pattern)

```typescript
// components/ui/button.tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-semibold transition-all',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:shadow-xl',
        secondary: 'border-2 border-gray-300 bg-white/90 backdrop-blur-sm',
        ghost: 'text-gray-700 hover:bg-gray-100/50',
        destructive: 'bg-gradient-to-r from-red-600 to-red-700',
        success: 'bg-gradient-to-r from-green-600 to-green-700',
        warning: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
        xl: 'h-14 px-8 py-4 text-xl',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}
```

#### Componentes Principais

```
components/ui/
├── button.tsx              # Button com variants + loading
├── card.tsx                # Glass morphism cards
├── glass-card.tsx          # Enhanced glass effects
├── input.tsx               # Form inputs
├── modal.tsx               # Modals/dialogs
├── tooltip.tsx             # Tooltips
├── badge.tsx               # Status badges
├── skeleton.tsx            # Loading skeletons
├── progress.tsx            # Progress bars
└── [35+ more components]
```

### 3.3 Acessibilidade (A11Y)

#### Features Implementadas

```typescript
// components/a11y/
;-SkipLinks - // Navegação por teclado
  Announcer - // Screen reader announcements
  HighContrastToggle - // Alto contraste
  FormField - // Form accessibility
  KeyboardNavigation // Atalhos de teclado
```

#### ARIA Implementation

```typescript
// components/ui/button.tsx
<button
  aria-busy={loading}
  aria-disabled={disabled || loading}
  aria-label={ariaLabel}
>
```

#### Contrast Checking

```typescript
// hooks/use-contrast-check.ts
export function useContrastCheck(foreground: string, background: string) {
  // WCAG AA compliance (4.5:1 for normal text)
  const ratio = calculateContrastRatio(foreground, background)
  return {
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7,
    ratio,
  }
}
```

---

## 4. PROGRESSIVE WEB APP (PWA)

### 4.1 Configuração

```javascript
// next.config.js
const withPWA = withPWAInit.default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',

  buildExcludes: [/middleware-manifest\.json$/],

  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
})
```

### 4.2 Manifest

```json
// public/manifest.json
{
  "name": "Cidadão.AI - Transparência Pública",
  "short_name": "Cidadão.AI",
  "theme_color": "#10b981",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/pt",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### 4.3 Service Worker Strategy

- **NetworkFirst:** Tenta rede primeiro, fallback para cache
- **MaxEntries:** 200 entries máximo
- **Offline Support:** Cache de assets críticos
- **Auto-reload:** Reconexão automática

---

## 5. SISTEMA DE AGENTES IA

### 5.1 Agentes Brasileiros (17 total)

```typescript
// data/agents.ts
export const agents: Agent[] = [
  // OPERACIONAIS (8) - Backend implementado
  {
    id: 'abaporu',
    name: 'Abaporu',
    role: { pt: 'Coordenador Central', en: 'Central Coordinator' },
    description: {
      pt: 'Inspirado na obra de Tarsila do Amaral, orquestra todas operações',
      en: 'Inspired by Tarsila do Amaral, orchestrates all operations',
    },
    image: 'abaporu.png',
    wikipedia: 'https://pt.wikipedia.org/wiki/Abaporu',
  },
  {
    id: 'zumbi',
    name: 'Zumbi dos Palmares',
    role: { pt: 'Guardião da Transparência', en: 'Transparency Guardian' },
    // ...
  },
  {
    id: 'anita',
    name: 'Anita Garibaldi',
    role: { pt: 'Analista de Anomalias', en: 'Anomaly Analyst' },
    // ...
  },
  {
    id: 'tiradentes',
    name: 'Tiradentes',
    role: { pt: 'Repórter de Irregularidades', en: 'Irregularities Reporter' },
    // ...
  },
  {
    id: 'senna',
    name: 'Ayrton Senna',
    role: { pt: 'Otimizador de Performance', en: 'Performance Optimizer' },
    // ...
  },
  {
    id: 'nana',
    name: 'Nanã Buruku',
    role: { pt: 'Guardiã da Memória', en: 'Memory Guardian' },
    // ...
  },
  {
    id: 'bonifacio',
    name: 'José Bonifácio',
    role: { pt: 'Patriarca da Integridade', en: 'Integrity Patriarch' },
    // ...
  },
  {
    id: 'machado',
    name: 'Machado de Assis',
    role: { pt: 'Cronista de Relatórios', en: 'Reports Chronicler' },
    // ...
  },

  // ESTRUTURADOS (9) - Aguardando implementação backend
  { id: 'dandara', name: 'Dandara' /* ... */ },
  { id: 'lampiao', name: 'Lampião' /* ... */ },
  { id: 'ceuci', name: 'Ceuci' /* ... */ },
  { id: 'niemeyer', name: 'Oscar Niemeyer' /* ... */ },
  { id: 'obaluaie', name: 'Obaluaiê' /* ... */ },
  { id: 'drummond', name: 'Carlos Drummond' /* ... */ },
  { id: 'quiteria', name: 'Maria Quitéria' /* ... */ },
  { id: 'oxossi', name: 'Oxóssi' /* ... */ },
  { id: 'deodoro', name: 'Marechal Deodoro' /* ... */ },
]
```

### 5.2 Características dos Agentes

- **Identidade Cultural:** Baseados em figuras históricas brasileiras
- **Bilíngue:** Suporte PT/EN
- **Especialização:** Cada agente tem role específico
- **Wikipedia Links:** Contexto educacional
- **Avatares Customizados:** Em `/public/agents/`

---

## 6. PERFORMANCE & OTIMIZAÇÃO

### 6.1 Bundle Size Analysis

#### Estado Atual (Não Otimizado)

```json
// package.json - Dependências pesadas
{
  "apexcharts": "^5.3.5", // ~500KB ⚠️
  "react-apexcharts": "^1.7.0", // ~100KB ⚠️
  "recharts": "^3.2.1", // ~200KB
  // Total charts: ~800KB (DOIS LIBS!) ❌

  "framer-motion": "^12.23.16", // ~100KB
  "driver.js": "^1.3.6", // ~50KB
  "html2canvas": "^1.4.1", // ~80KB
  "jspdf": "^3.0.3" // ~150KB
}
```

#### Estimativa Total

```
Initial Bundle (não medido): ~400KB
Com charts carregados: ~1.2MB
```

#### Problemas Identificados

- ❌ **Dois libraries de charts** (ApexCharts + Recharts)
- ❌ **Sem lazy loading** em componentes pesados
- ❌ **Bundle não analisado** (falta Lighthouse audit)
- ❌ **Tree-shaking** não otimizado

### 6.2 Code Splitting Strategy

#### Webpack Configuration

```javascript
// next.config.js
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.optimization = {
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          framework: {
            name: 'framework',
            test: /react|react-dom|scheduler/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test: /node_modules/,
            name: (module) => `npm.${packageName}`,
            priority: 30,
          },
          charts: {
            name: 'charts',
            test: /recharts|apexcharts/,
            priority: 25,
          },
          animations: {
            name: 'animations',
            test: /framer-motion/,
            priority: 25,
          },
        },
      },
    }
  }
}
```

#### Dynamic Imports Implementados

```typescript
// components/charts/lazy.tsx
export const LineChart = dynamic(() => import('./line-chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
});
```

### 6.3 Security Headers

```javascript
// next.config.js
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
      {
        key: 'Content-Security-Policy',
        value: `
          default-src 'self';
          script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com;
          style-src 'self' 'unsafe-inline';
          img-src 'self' blob: data: https:;
          font-src 'self' data:;
          connect-src 'self' https://cidadao-api-production.up.railway.app https://*.supabase.co;
        `
      },
    ],
  }]
}
```

---

## 7. TESTING INFRASTRUCTURE

### 7.1 Configuração de Testes

#### Vitest (Unit/Integration)

```typescript
// vitest.config.mts
export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 70, // Target (atual: ~40%)
      functions: 70,
      branches: 65,
      statements: 70,
    },
  },
})
```

#### Playwright (E2E)

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
  },
})
```

### 7.2 Test Coverage Status

#### Métricas Atuais

```
Test Files: 138
Estimated Coverage: 40%
Target Coverage: 80%
Gap: -40 percentage points
```

#### Análise dos Testes Existentes

- ✅ **UI Components:** Testes básicos (render, props)
- ⚠️ **Business Logic:** Coverage parcial
- ❌ **Integration Tests:** Faltam testes críticos
- ❌ **E2E Tests:** Poucos cenários cobertos

#### Critical Paths Sem Cobertura

1. **OAuth Flow Completo**
   - Google redirect
   - Callback handling
   - Error scenarios
   - Session refresh

2. **Chat Adapter Switching**
   - Failover logic
   - Timeout handling
   - Fallback response

3. **Cache Scenarios**
   - LRU eviction
   - TTL expiration
   - Memory limits

### 7.3 Scripts de Teste Manual

```
scripts/
├── test-chat-adapters.js          # Test all adapters
├── test-smart-chat.js              # Test smart routing
├── test-cache.js                   # Test cache logic
├── test-backend.js                 # Backend connectivity
├── test-telemetry.js               # Telemetry tracking
├── monitor-backend.js              # Performance monitoring
├── stress-test.js                  # Load testing
└── [35+ more test scripts]
```

**Problema:** Testes manuais não contribuem para coverage metrics

---

## 8. API INTEGRATION & BACKEND CONNECTIVITY

### 8.1 API Client Configuration

```typescript
// lib/api/client.ts
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30s
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
})
```

### 8.2 Request Interceptor

```typescript
apiClient.interceptors.request.use((config) => {
  // Add Bearer token
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Add API key
  const apiKey = process.env.NEXT_PUBLIC_API_KEY
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey
  }

  return config
})
```

### 8.3 Response Interceptor (Auto Token Refresh)

```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const originalRequest = error.config

      if (!originalRequest._retry) {
        originalRequest._retry = true

        // Refresh token
        const { authService } = await import('./auth.service')
        await authService.refreshToken()

        // Retry with new token
        const newToken = localStorage.getItem('access_token')
        originalRequest.headers.Authorization = `Bearer ${newToken}`

        return apiClient.request(originalRequest)
      }
    }

    return Promise.reject(error)
  }
)
```

### 8.4 Error Handling

```typescript
export async function apiRequest<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.request<T>(config)
    return {
      data: response.data,
      success: true,
    }
  } catch (error: any) {
    return {
      error: {
        message: error.message || 'An error occurred',
        status: error.status,
        code: error.code,
        detail: error.response?.data?.detail,
      },
      success: false,
    }
  }
}
```

---

## 9. ANÁLISE CRÍTICA & PROBLEMAS IDENTIFICADOS

### 9.1 Over-Engineering: Chat Adapters

#### Problema

```typescript
// 6 ADAPTERS sem justificativa de métricas
chat - adapter - backend.ts // #1 Primary
chat - adapter - optimized - maritaca.ts // #2 Optimized
chat - adapter - emergency.ts // #3 Emergency
chat - adapter - v3.ts // #4 Legacy
chat - adapter - v2.ts // #5 Enhanced (não usado)
chat - adapter.ts // #6 Original (não usado)
```

#### Evidências

- ❌ Sem telemetria de taxa de falha por adapter
- ❌ Versões antigas (v1, v2) no codebase sem uso
- ❌ Complexidade de manutenção desnecessária
- ❌ Todos usam mesmo modelo (sabiazinho-3)

#### Recomendação

```typescript
// CONSOLIDAR PARA 3 ADAPTERS
private endpoints: ChatEndpoint[] = [
  {
    name: 'Primary',
    url: '/api/v1/chat/stable',
    adapter: sendMaritacaStable,
    priority: 1,
    healthCheck: true
  },
  {
    name: 'Fallback',
    url: '/api/v1/chat/optimized',
    adapter: sendMaritacaOptimized,
    priority: 2,
  },
  {
    name: 'Emergency',
    url: '/api/v1/chat/emergency',
    adapter: sendLocalFallback,
    priority: 3,
    offline: true
  }
]
```

### 9.2 Memory Leak: Cache Service

#### Problema

```typescript
// lib/services/chat-cache.service.ts
private readonly maxCacheSize = 1000;  // ⚠️ MUITO ALTO

// Estimativa de memória:
// Pior caso: 1000 × 50KB = 50MB RAM
// Em mobile (2GB): 2.5% da RAM total!
```

#### Evidências

- ❌ Cache em memória sem limite real
- ❌ Mensagens grandes (com charts) não controladas
- ❌ Sem persistência (perde tudo no reload)
- ❌ Não testado em dispositivos low-end

#### Recomendação: IndexedDB Migration

```typescript
class IndexedCacheService {
  // Two-tier caching
  private memoryCache = new Map<string, any>() // 100 entries (hot)
  private db: IDBPDatabase // Unlimited (cold)

  async get(message: string) {
    // 1. Check memory (fast)
    if (this.memoryCache.has(key)) return cached

    // 2. Check IndexedDB (slower, no RAM)
    const cached = await this.db.get('chat-responses', key)

    // 3. Promote to memory if hot
    this.promoteToMemory(key, cached)
  }

  async set(message: string, response: any) {
    // Always persist to IndexedDB
    await this.db.put('chat-responses', entry)

    // Conditionally add to memory
    if (this.shouldCacheInMemory(response)) {
      this.promoteToMemory(key, entry)
    }
  }
}
```

**Benefícios:**

- ✅ 2MB max RAM (vs 50MB)
- ✅ Cache persistente (sobrevive reload)
- ✅ Automatic cleanup (quota management)
- ✅ Hot/cold data separation

### 9.3 WebSocket Architecture Error

#### Problema

```typescript
// Infraestrutura completa mas DISABLED
connectWebSocket: () => {
  console.log('WebSocket connection skipped - not supported by backend')
  set({ connectionStatus: 'disconnected' })
  return
}

// TODO: HuggingFace Spaces NÃO SUPORTA WebSocket
```

#### Evidências

- ❌ WebSocket não funciona em HF Spaces
- ❌ Código completo mas inutilizável
- ❌ Complexidade desnecessária mantida
- ✅ SSE (Server-Sent Events) funcionaria nativamente

#### Recomendação: Server-Sent Events

```typescript
// lib/api/chat-sse.ts
export function sendMessageSSE(
  message: string,
  onChunk: (chunk: string) => void,
  onComplete: (response: ChatResponse) => void,
  onError: (error: Error) => void
) {
  const eventSource = new EventSource(
    `${API_BASE_URL}/api/v1/chat/stream?message=${encodeURIComponent(message)}`
  )

  let accumulated = ''

  eventSource.addEventListener('chunk', (e) => {
    const chunk = JSON.parse(e.data).content
    accumulated += chunk
    onChunk(chunk)
  })

  eventSource.addEventListener('complete', (e) => {
    eventSource.close()
    onComplete(JSON.parse(e.data))
  })

  eventSource.addEventListener('error', (e) => {
    eventSource.close()
    onError(new Error('SSE failed'))
  })

  return eventSource
}
```

**Vantagens SSE vs WebSocket:**

- ✅ Funciona no HuggingFace Spaces
- ✅ Auto-reconnect nativo
- ✅ Mais simples (sem handshake)
- ✅ Menos overhead
- ✅ Built-in Last-Event-ID
- ⚠️ Unidirecional (OK para chat)

### 9.4 Bundle Size - Dois Libraries de Charts

#### Problema

```json
{
  "apexcharts": "^5.3.5", // 500KB
  "react-apexcharts": "^1.7.0", // 100KB
  "recharts": "^3.2.1" // 200KB
  // Total: ~800KB para charts! ❌
}
```

#### Uso Real

```bash
$ grep -r "apexcharts" . --include="*.tsx"
./app/pt/(authenticated)/dashboard/page-v3.tsx

# Apenas 1 arquivo usa ApexCharts!
```

#### Recomendação

```typescript
// DELETE ApexCharts completely
npm uninstall apexcharts react-apexcharts

// Rewrite page-v3.tsx usando Recharts
// Recharts: tree-shakeable, menor bundle, API similar

// components/charts/line-chart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function CustomLineChart({ data }) {
  return (
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="value" stroke="#10b981" />
    </LineChart>
  );
}
```

**Economia de Bundle:**

- Antes: 800KB (ApexCharts + Recharts)
- Depois: 200KB (apenas Recharts)
- **Redução: 75% (-600KB)**

### 9.5 Test Coverage Inadequado

#### Problema

```
Test Files: 138
Coverage: ~40%
Target: 80% (mínimo para TCC PhD)
Gap: -40 percentage points
```

#### Análise

- ✅ UI Components: Testes básicos existem
- ⚠️ Business Logic: Coverage parcial
- ❌ Critical Paths: Sem testes
  - OAuth flow completo
  - Chat adapter failover
  - Cache eviction scenarios
  - Error boundaries

#### Testes Críticos Faltando

```typescript
// 1. OAuth Flow
describe('OAuth Complete Flow', () => {
  it('should handle Google redirect → callback → user set')
  it('should handle OAuth errors gracefully')
  it('should refresh expired sessions automatically')
})

// 2. Chat Adapter Switching
describe('Smart Chat Failover', () => {
  it('should try adapters in priority order')
  it('should fallback to local when all fail')
  it('should respect timeout per adapter')
  it('should track telemetry for each attempt')
})

// 3. Cache Edge Cases
describe('Chat Cache Memory Management', () => {
  it('should evict oldest when cache full (LRU)')
  it('should not cache low confidence responses')
  it('should respect TTL by message type')
  it('should normalize messages correctly')
})
```

#### Recomendação

```typescript
// vitest.config.mts - Enforce coverage
export default defineConfig({
  test: {
    coverage: {
      lines: 70, // Fail build if below
      functions: 70,
      branches: 65,
      statements: 70,

      // Fail CI if thresholds not met
      thresholdAutoUpdate: false,
    },
  },
})
```

**Prioridade de Implementação:**

1. **Auth Flow** (crítico - segurança)
2. **Chat Adapter Logic** (core feature)
3. **Cache Management** (performance)
4. **Error Boundaries** (UX)

---

## 10. OPORTUNIDADES DE OTIMIZAÇÃO

### 10.1 Edge Computing (Vercel Edge Functions)

#### Proposta

```typescript
// app/api/chat/edge/route.ts
export const config = {
  runtime: 'edge', // Runs on Vercel Edge Network
}

export async function POST(request: NextRequest) {
  const { message, session_id } = await request.json()

  // 1. Pre-processing no Edge (~10ms latency)
  const complexity = analyzeComplexityEdge(message)
  const intent = detectIntentEdge(message)

  // 2. Smart routing baseado em geo
  const region = request.geo?.country
  const endpoint = selectEndpointByRegion(region, complexity)

  // 3. Call backend com contexto enriquecido
  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: 'POST',
    body: JSON.stringify({
      message,
      session_id,
      context: {
        complexity,
        intent,
        region,
        edge_processed: true,
      },
    }),
  })

  return response
}
```

#### Benefícios

- ✅ **Latência reduzida** (~10ms edge processing)
- ✅ **Geographic routing** (user → nearest edge node)
- ✅ **Pre-processing offload** (backend recebe contexto pronto)
- ✅ **Escalabilidade global** (Vercel CDN)

### 10.2 Distributed Cache (Vercel KV)

#### Proposta

```typescript
// Edge cache para respostas comuns
import { kv } from '@vercel/kv'

export async function POST(request: NextRequest) {
  const { message } = await request.json()

  // Check global distributed cache
  const cacheKey = `chat:${hashMessage(message)}`
  const cached = await kv.get(cacheKey)

  if (cached) {
    return new Response(
      JSON.stringify({
        ...cached,
        metadata: {
          from_edge_cache: true,
          cached_at: cached.timestamp,
          edge_region: request.geo?.region,
        },
      })
    )
  }

  // Cache miss → call backend
  const response = await callBackend(message)

  // Cache globally if high confidence
  if (response.confidence > 0.9) {
    await kv.setex(cacheKey, 3600, {
      ...response,
      timestamp: Date.now(),
    })
  }

  return new Response(JSON.stringify(response))
}
```

#### Benefícios

- ✅ **Cache global** (shared entre todas requests)
- ✅ **Redis-like performance** (<1ms reads)
- ✅ **Geographic distribution** (cache próximo ao user)
- ✅ **TTL automático** (3600s = 1 hour)

### 10.3 AI-Driven Performance

#### Proposta: ML Adapter Selection

```typescript
// lib/services/ml-adapter-selector.ts
class MLAdapterSelector {
  private model: TensorFlowModel
  private telemetryData: AdapterMetrics[]

  constructor(telemetryData: AdapterMetrics[]) {
    this.telemetryData = telemetryData
    this.model = this.trainModel()
  }

  // Treina modelo baseado em telemetria histórica
  private trainModel() {
    const features = this.telemetryData.map((metric) => [
      metric.messageComplexity, // 0-1
      metric.messageLength, // normalized
      metric.timeOfDay, // 0-23
      metric.userRegion, // encoded
    ])

    const labels = this.telemetryData.map(
      (metric) => metric.bestAdapter // adapter que teve melhor performance
    )

    return tf
      .sequential({
        layers: [
          tf.layers.dense({ units: 32, activation: 'relu', inputShape: [4] }),
          tf.layers.dense({ units: 16, activation: 'relu' }),
          tf.layers.dense({ units: 3, activation: 'softmax' }), // 3 adapters
        ],
      })
      .fit(features, labels)
  }

  // Prediz melhor adapter para nova mensagem
  predictBestAdapter(message: string, context: RequestContext): string {
    const features = this.extractFeatures(message, context)
    const prediction = this.model.predict(features)

    // Retorna adapter com maior probabilidade
    const adapterIndex = prediction.argMax().dataSync()[0]
    return ['primary', 'fallback', 'emergency'][adapterIndex]
  }
}
```

#### Uso no Smart Chat

```typescript
// lib/services/smart-chat.service.ts
export class SmartChatService {
  private mlSelector: MLAdapterSelector

  async sendMessage(message: string, options: SmartChatOptions) {
    // 1. ML prediz melhor adapter
    const suggestedAdapter = this.mlSelector.predictBestAdapter(message, {
      complexity: this.analyzeComplexity(message),
      timeOfDay: new Date().getHours(),
      userRegion: getUserRegion(),
    })

    // 2. Tenta adapter sugerido primeiro
    const endpoints = this.reorderByMLSuggestion(suggestedAdapter)

    // 3. Fallback normal se ML falhar
    return this.tryEndpoints(endpoints)
  }
}
```

#### Benefícios

- ✅ **Self-optimizing system** (aprende com uso)
- ✅ **Reduz latência** (adapter certo na primeira tentativa)
- ✅ **Reduz custos** (menos fallbacks = menos requests)
- ✅ **Diferencial acadêmico** (TCC PhD)

---

## 11. ROADMAP DE MELHORIAS

### 11.1 Sprint 1 - Quick Wins (1 semana)

#### Objetivos

- Consolidar chat adapters: 6 → 3
- Remover ApexCharts, migrar para Recharts
- Implementar dynamic imports agressivos
- Bundle analysis com Lighthouse

#### Tarefas

```bash
# 1. Consolidar adapters
- DELETE: chat-adapter-v1.ts, chat-adapter-v2.ts
- KEEP: backend, optimized, emergency
- UPDATE: smart-chat.service.ts (3 endpoints)
- ADD: Telemetry tracking por adapter

# 2. Bundle optimization
npm uninstall apexcharts react-apexcharts
- REWRITE: dashboard/page-v3.tsx usando Recharts
- ADD: Dynamic imports para todos charts
- RUN: npm run analyze

# 3. Lazy loading
- UPDATE: components/charts/lazy.tsx
- UPDATE: app/pt/(authenticated)/*/page.tsx
- ADD: Suspense boundaries
```

#### KPIs

- ✅ Adapters: 6 → 3 (-50%)
- ✅ Bundle size: 400KB → ~200KB (-50%)
- ✅ Chart library: 800KB → 200KB (-75%)

### 11.2 Sprint 2 - Infrastructure (1 semana)

#### Objetivos

- Substituir WebSocket por SSE
- Migrar cache para IndexedDB
- Expandir test coverage: 40% → 70%

#### Tarefas

```bash
# 1. SSE Implementation
- CREATE: lib/api/chat-sse.ts
- CREATE: hooks/use-sse-chat.ts
- UPDATE: components/chat/chat-interface.tsx
- DELETE: lib/websocket/* (obsoleto)

# 2. IndexedDB Cache
- CREATE: lib/services/indexed-cache.service.ts
- UPDATE: lib/services/smart-chat.service.ts
- ADD: Cleanup job (weekly)
- TEST: Memory usage em devices

# 3. Test Coverage
- ADD: tests/auth/oauth-flow.test.ts
- ADD: tests/chat/adapter-failover.test.ts
- ADD: tests/cache/lru-eviction.test.ts
- ADD: tests/integration/end-to-end.spec.ts
- RUN: npm run test:coverage
```

#### KPIs

- ✅ SSE: Streaming funcional no HF Spaces
- ✅ Cache RAM: 50MB → 2MB (-96%)
- ✅ Test coverage: 40% → 70% (+30pp)

### 11.3 Sprint 3 - Edge Optimization (1 semana)

#### Objetivos

- Implementar Vercel Edge Functions
- Distributed cache com Vercel KV
- Performance audit completo

#### Tarefas

```bash
# 1. Edge Functions
- CREATE: app/api/chat/edge/route.ts
- ADD: Complexity analysis no edge
- ADD: Geographic routing
- TEST: Latency benchmarks

# 2. Vercel KV Cache
npm install @vercel/kv
- UPDATE: edge/route.ts (cache layer)
- CONFIG: Vercel dashboard (KV store)
- TEST: Cache hit rates

# 3. Performance Audit
- RUN: Lighthouse CI
- ANALYZE: Core Web Vitals
- FIX: Performance bottlenecks
- DOCUMENT: Performance report
```

#### KPIs

- ✅ Edge latency: <10ms pre-processing
- ✅ Cache global: Hit rate >60%
- ✅ Lighthouse Score: >90

### 11.4 Sprint 4 - ML & Advanced Features (2 semanas)

#### Objetivos

- ML adapter selection
- Advanced analytics
- A/B testing infrastructure

#### Tarefas

```bash
# 1. ML Adapter Selector
npm install @tensorflow/tfjs
- CREATE: lib/ml/adapter-selector.ts
- TRAIN: Model com telemetry histórica
- INTEGRATE: smart-chat.service.ts
- MONITOR: Prediction accuracy

# 2. Analytics Dashboard
- CREATE: components/analytics/ml-insights.tsx
- ADD: Adapter performance charts
- ADD: Cost optimization metrics
- ADD: User behavior patterns

# 3. A/B Testing
- CREATE: lib/ab-testing/experiment-manager.ts
- ADD: Feature flags system
- INTEGRATE: Analytics tracking
- DOCUMENT: Experiment results
```

#### KPIs

- ✅ ML accuracy: >85% adapter prediction
- ✅ Cost reduction: ~20% (menos fallbacks)
- ✅ A/B experiments: 3+ running

---

## 12. CONCLUSÕES & RECOMENDAÇÕES

### 12.1 Pontos Fortes Identificados

1. **Arquitetura Moderna & Escalável**
   - Next.js 15 App Router bem estruturado
   - TypeScript strict mode em toda codebase
   - Separation of Concerns clara

2. **Autenticação Robusta**
   - Supabase OAuth 100% funcional
   - Multi-provider (Google, GitHub, Email/Password)
   - Session management com SSR

3. **Design System Único**
   - Identidade cultural brasileira forte
   - Glass morphism consistente
   - Acessibilidade (A11Y) bem implementada

4. **PWA Production-Ready**
   - Service Workers configurados
   - Offline support
   - Manifest completo

5. **Multi-Agent System**
   - 17 agentes com identidades culturais
   - 8 operacionais, 9 estruturados
   - Bilíngue (PT/EN)

### 12.2 Problemas Críticos a Resolver

1. **Over-Engineering: Chat Adapters**
   - **Impacto:** Alto (manutenção + complexidade)
   - **Prioridade:** 🔴 Crítica
   - **Ação:** Consolidar 6 → 3 adapters
   - **Prazo:** Sprint 1 (1 semana)

2. **Memory Leak: Cache Service**
   - **Impacto:** Alto (mobile performance)
   - **Prioridade:** 🔴 Crítica
   - **Ação:** Migrar para IndexedDB
   - **Prazo:** Sprint 2 (2 semanas)

3. **WebSocket Architecture Error**
   - **Impacto:** Médio (código morto)
   - **Prioridade:** 🟡 Importante
   - **Ação:** Substituir por SSE
   - **Prazo:** Sprint 2 (2 semanas)

4. **Bundle Size: Dois Libs Charts**
   - **Impacto:** Alto (performance)
   - **Prioridade:** 🔴 Crítica
   - **Ação:** Remover ApexCharts
   - **Prazo:** Sprint 1 (1 semana)

5. **Test Coverage: 40% → 80%**
   - **Impacto:** Crítico (TCC PhD)
   - **Prioridade:** 🔴 Crítica
   - **Ação:** Expandir testes críticos
   - **Prazo:** Sprint 2 (2 semanas)

### 12.3 Oportunidades de Diferenciação

1. **Edge Computing**
   - Pre-processing em Vercel Edge (~10ms latency)
   - Geographic routing automático
   - Distributed cache global

2. **AI-Driven Performance**
   - ML adapter selection
   - Self-optimizing system
   - Cost optimization automático

3. **Advanced Analytics**
   - Telemetria completa
   - Performance insights
   - User behavior patterns

### 12.4 Métricas de Sucesso

#### Curto Prazo (1 mês)

```
✅ Chat adapters: 6 → 3
✅ Bundle size: 400KB → 200KB (-50%)
✅ Cache RAM: 50MB → 2MB (-96%)
✅ Test coverage: 40% → 70% (+30pp)
✅ SSE streaming: Funcional no HF Spaces
```

#### Médio Prazo (3 meses)

```
✅ Edge functions: Live em produção
✅ Vercel KV cache: Hit rate >60%
✅ Lighthouse score: >90
✅ ML adapter: Accuracy >85%
✅ Cost reduction: ~20%
```

#### Longo Prazo (6 meses)

```
✅ Test coverage: >80%
✅ 9 agentes restantes: Operacionais
✅ A/B testing: Infrastructure completa
✅ Performance: Top 10% Web Vitals
✅ Publicação acadêmica: TCC defendido
```

### 12.5 Recomendações Finais

#### Para o TCC/PhD

1. **Foco em Qualidade:** Priorizar test coverage >80%
2. **Métricas Robustas:** Documentar todas otimizações com dados
3. **Diferenciação:** Implementar ML adapter selection (único)
4. **Documentação:** Manter este relatório atualizado

#### Para Produção

1. **Performance First:** Bundle optimization imediata
2. **Memory Management:** IndexedDB migration prioritária
3. **Monitoring:** Telemetria completa desde dia 1
4. **Scalability:** Edge functions para crescimento global

#### Para Equipe

1. **Code Review:** Enforce test coverage em PRs
2. **Performance Budget:** 200KB bundle limit
3. **Accessibility:** WCAG AA compliance obrigatório
4. **Security:** Headers + sanitization rigorosos

---

## 13. ANEXOS

### 13.1 Comandos Úteis

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Production build
npm run start                  # Start production server
npm run lint                   # ESLint check
npm run type-check             # TypeScript validation

# Testing
npm run test                   # Run Vitest unit tests
npm run test:coverage          # Coverage report
npm run test:playwright        # E2E tests
npm run test:design-system     # Design system tests

# Storybook
npm run storybook              # Component development
npm run build-storybook        # Static Storybook build

# Analysis
npm run analyze                # Bundle analysis
node scripts/analyze-bundle.js # Custom bundle analyzer
```

### 13.2 Variáveis de Ambiente

```bash
# Backend API
NEXT_PUBLIC_API_URL=https://cidadao-api-production.up.railway.app

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Optional
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX          # Google Analytics
NEXT_PUBLIC_FEATURE_WEBSOCKET=false     # WebSocket toggle
NEXT_PUBLIC_API_KEY=xxx                 # Backend API key
DISABLE_PWA=true                        # PWA toggle (dev)
```

### 13.3 Estrutura de Tipos Principais

```typescript
// types/chat.ts
interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  agent_id?: string
  agent_name?: string
  timestamp: string
  metadata?: Record<string, any>
}

interface ChatResponse {
  session_id: string
  agent_id: string
  agent_name: string
  message: string
  confidence: number
  suggested_actions?: string[]
  metadata: Record<string, any>
}

interface AgentInfo {
  id: string
  name: string
  role: string
  type: 'master' | 'investigator' | 'analyst' | 'reporter'
  description: string
  specialty: string
  capabilities?: string[]
  status: 'available' | 'busy' | 'offline'
}
```

### 13.4 Referências Técnicas

#### Documentação

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Zustand](https://docs.pmnd.rs/zustand)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Playwright](https://playwright.dev/docs/intro)
- [Vitest](https://vitest.dev/guide/)

#### Repositórios

- **GitHub:** anderson-ufrj/cidadao.ai-frontend
- **Deployment:** Vercel (em configuração)
- **Backend:** HuggingFace Spaces

#### Ferramentas

- **Bundle Analyzer:** Webpack Bundle Analyzer
- **Lighthouse:** Chrome DevTools
- **Coverage:** Vitest + v8
- **E2E:** Playwright

---

## 14. ASSINATURAS & APROVAÇÕES

**Autor do Relatório:**
Anderson Henrique da Silva
Engenheiro de Software, PhD Candidate
Minas Gerais, Brasil

**Data de Emissão:**
04 de outubro de 2025

**Versão:**
1.0 (Análise Completa)

**Próxima Revisão:**
Após Sprint 1 (1 semana)

---

**FIM DO RELATÓRIO**

---

_Este documento é confidencial e destinado exclusivamente para uso interno do projeto Cidadão.AI. A reprodução ou distribuição não autorizada é proibida._
