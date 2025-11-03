# SPRINT 1: QUICK WINS - OTIMIZAÇÕES DE ALTO IMPACTO

**Sprint Duration:** 1 semana (5 dias úteis)
**Sprint Period:** 07/10/2025 - 11/10/2025
**Team:** 2 Engenheiros PhD (full-time)
**Sprint Goal:** Otimizar bundle size, consolidar adapters e preparar base para sprints seguintes

---

## 📋 ÍNDICE

1. [Objetivos & Justificativa](#objetivos--justificativa)
2. [Product Backlog Items](#product-backlog-items)
3. [Detalhamento Técnico](#detalhamento-técnico)
4. [Implementação Passo-a-Passo](#implementação-passo-a-passo)
5. [Testing Strategy](#testing-strategy)
6. [Definition of Done](#definition-of-done)
7. [Riscos & Mitigação](#riscos--mitigação)
8. [Métricas de Sucesso](#métricas-de-sucesso)
9. [Checklist de Entrega](#checklist-de-entrega)

---

## OBJETIVOS & JUSTIFICATIVA

### Objetivo Principal

Realizar otimizações de **baixo esforço e alto impacto** que reduzem bundle size em 50%, simplificam a arquitetura de chat adapters e preparam a base para os sprints de infraestrutura e edge computing.

### Justificativa (Why Now?)

#### Problema 1: Bundle Size Excessivo (~400KB)

```
Estado Atual:
- Initial bundle: ~400KB
- Com charts loaded: ~1.2MB
- First Contentful Paint: >2s
- Time to Interactive: >4s

Impacto no Usuário:
- Mobile 3G: 8s de carregamento inicial
- Bounce rate alto em conexões lentas
- Penalização no Google PageSpeed
```

#### Problema 2: Over-Engineering nos Adapters

```typescript
// 6 ADAPTERS ativos sem justificativa
lib/api/
├── chat-adapter-backend.ts        // #1 Primary
├── chat-adapter-optimized-maritaca.ts  // #2 Optimized
├── chat-adapter-emergency.ts      // #3 Emergency
├── chat-adapter-v3.ts            // #4 Legacy
├── chat-adapter-v2.ts            // #5 Enhanced (não usado)
└── chat-adapter.ts               // #6 Original (não usado)

Problemas:
- Sem telemetria de taxa de falha
- Duplicação de lógica
- Manutenção complexa
- Confusão para novos desenvolvedores
```

#### Problema 3: Dois Libraries de Charts

```json
{
  "apexcharts": "^5.3.5",        // 500KB
  "react-apexcharts": "^1.7.0",  // 100KB
  "recharts": "^3.2.1",          // 200KB
}

Uso Real:
- ApexCharts: 1 arquivo (dashboard/page-v3.tsx)
- Recharts: 0 arquivos atualmente
- Total desperdiçado: 800KB
```

### Valor de Negócio

**Impacto Imediato:**

- ✅ **UX:** Carregamento 2x mais rápido
- ✅ **SEO:** Lighthouse score +20 pontos
- ✅ **Conversão:** Bounce rate -15% estimado
- ✅ **Custos:** CDN bandwidth -40%

**Impacto de Longo Prazo:**

- ✅ **Manutenção:** Codebase 30% menor
- ✅ **Onboarding:** Desenvolvedores entendem mais rápido
- ✅ **Escalabilidade:** Base sólida para edge computing

---

## PRODUCT BACKLOG ITEMS

### PBI #1: Consolidar Chat Adapters (6 → 3)

**Story Points:** 5
**Priority:** P0 (Crítico)
**Assignee:** Engenheiro #1

**User Story:**

> Como desenvolvedor, quero ter apenas 3 chat adapters bem definidos (Primary, Fallback, Emergency) para facilitar manutenção e debugging.

**Acceptance Criteria:**

- [ ] Apenas 3 adapters ativos no código
- [ ] Todos adapters com telemetria completa
- [ ] Fallback logic testado end-to-end
- [ ] Documentação atualizada
- [ ] Zero breaking changes na API pública

**Technical Tasks:**

1. Criar `chat-adapter-primary.ts` consolidando backend + optimized
2. Manter `chat-adapter-fallback.ts` (renomear emergency)
3. Criar `chat-adapter-local.ts` para offline support
4. Deletar v1, v2, v3 do repositório
5. Atualizar `smart-chat.service.ts` para 3 endpoints
6. Adicionar telemetria em cada adapter
7. Escrever integration tests

---

### PBI #2: Remover ApexCharts e Migrar para Recharts

**Story Points:** 8
**Priority:** P0 (Crítico)
**Assignee:** Engenheiro #2

**User Story:**

> Como usuário, quero que a aplicação carregue 600KB mais rápido removendo a biblioteca ApexCharts duplicada.

**Acceptance Criteria:**

- [ ] ApexCharts e react-apexcharts removidos do package.json
- [ ] Todos charts funcionando com Recharts
- [ ] Visual regression tests passando
- [ ] Bundle size reduzido em 600KB+
- [ ] Storybook atualizado com novos charts

**Technical Tasks:**

1. Audit de uso: `grep -r "apexcharts" .`
2. Instalar Recharts (se não estiver)
3. Rewrite `dashboard/page-v3.tsx` com Recharts
4. Criar componentes reutilizáveis em `components/charts/`
   - `line-chart.tsx`
   - `bar-chart.tsx`
   - `area-chart.tsx`
   - `pie-chart.tsx`
5. Visual regression testing (screenshots antes/depois)
6. Remover ApexCharts: `npm uninstall apexcharts react-apexcharts`
7. Atualizar Storybook stories

---

### PBI #3: Implementar Dynamic Imports para Componentes Pesados

**Story Points:** 5
**Priority:** P1 (Alto)
**Assignee:** Engenheiro #1

**User Story:**

> Como usuário em mobile 3G, quero carregar apenas o código essencial inicialmente, deixando componentes pesados para lazy loading.

**Acceptance Criteria:**

- [ ] Todos charts com dynamic import
- [ ] Skeletons de loading criados
- [ ] Investigações com dynamic import
- [ ] Export modal com dynamic import
- [ ] Build time reduzido em 20%+

**Technical Tasks:**

1. Criar `components/charts/lazy.tsx` com dynamic exports
2. Criar `components/skeletons/chart-skeleton.tsx`
3. Atualizar imports em páginas:
   - `dashboard/page.tsx`
   - `investigacoes/page.tsx`
   - `chat/page.tsx`
4. Configurar Suspense boundaries
5. Testar lazy loading em DevTools (Network throttling)
6. Documentar padrão de lazy loading

---

### PBI #4: Bundle Analysis e Documentação

**Story Points:** 3
**Priority:** P1 (Alto)
**Assignee:** Engenheiro #2

**User Story:**

> Como tech lead, quero um relatório detalhado de bundle size antes/depois para validar otimizações e estabelecer budget.

**Acceptance Criteria:**

- [ ] Webpack Bundle Analyzer configurado
- [ ] Relatório antes/depois gerado
- [ ] Performance budget estabelecido
- [ ] Lighthouse CI configurado
- [ ] Documentação em `docs/technical/performance/`

**Technical Tasks:**

1. Instalar `@next/bundle-analyzer`
2. Configurar no `next.config.js`
3. Gerar relatório baseline (antes das mudanças)
4. Gerar relatório final (depois das mudanças)
5. Criar `docs/technical/performance/BUNDLE_ANALYSIS.md`
6. Configurar Lighthouse CI no GitHub Actions
7. Estabelecer performance budget:
   ```javascript
   module.exports = {
     budgets: [
       {
         path: '/_app',
         maxSize: '250KB',
       },
       {
         path: '/charts',
         maxSize: '150KB',
       },
     ],
   }
   ```

---

### PBI #5: Cleanup de Código Morto

**Story Points:** 2
**Priority:** P2 (Médio)
**Assignee:** Engenheiro #1

**User Story:**

> Como desenvolvedor, quero remover código não utilizado para facilitar navegação e reduzir bundle.

**Acceptance Criteria:**

- [ ] Arquivos `-demo.tsx` movidos para Storybook ou deletados
- [ ] Versões antigas de componentes removidas
- [ ] ESLint configurado para detectar imports não usados
- [ ] Tree-shaking validado

**Technical Tasks:**

1. Identificar arquivos não utilizados:
   ```bash
   npx unimported
   ```
2. Deletar arquivos identificados:
   - `*-demo.tsx`
   - `*-v1.tsx` (se houver v3)
   - `*-old.tsx`
3. Configurar ESLint plugin:
   ```javascript
   {
     "plugins": ["unused-imports"],
     "rules": {
       "unused-imports/no-unused-imports": "error"
     }
   }
   ```
4. Verificar tree-shaking:
   ```bash
   npm run build -- --profile
   ```

---

## DETALHAMENTO TÉCNICO

### Task 1.1: Consolidar Chat Adapters

#### Arquitetura Proposta

**ANTES (6 adapters):**

```typescript
// Complexidade desnecessária
smart-chat.service.ts
├── sendBackendMessage (backend)
├── sendOptimizedMessage (optimized)
├── sendEmergencyMessage (emergency)
├── sendChatMessageV3 (legacy)
├── sendChatMessageV2 (old)
└── sendChatMessage (oldest)
```

**DEPOIS (3 adapters):**

```typescript
// Arquitetura limpa
smart-chat.service.ts
├── PrimaryAdapter (Maritaca Stable)
├── FallbackAdapter (Maritaca Optimized)
└── LocalAdapter (Offline/Emergency)
```

#### Implementação Detalhada

**Arquivo 1: `lib/api/adapters/primary.adapter.ts`**

```typescript
/**
 * Primary Chat Adapter - Maritaca Stable Endpoint
 *
 * This is the main adapter used for 95% of requests.
 * Uses the /api/v1/chat/stable endpoint with Sabiazinho-3 model.
 *
 * @priority 1
 * @model sabiazinho-3
 * @costLevel 1 (R$ 0.001 per 1k tokens)
 */

import { api } from '../client'
import type { ChatRequest, ChatResponse } from '@/types/chat'
import { trackChatMessage, trackChatResponse, trackChatError } from '@/lib/telemetry/chat-telemetry'

export interface PrimaryAdapterConfig {
  timeout: number
  retries: number
  healthCheckInterval: number
}

export class PrimaryAdapter {
  private config: PrimaryAdapterConfig
  private healthStatus: 'healthy' | 'degraded' | 'down' = 'healthy'
  private lastHealthCheck: number = 0

  constructor(config: Partial<PrimaryAdapterConfig> = {}) {
    this.config = {
      timeout: config.timeout || 30000,
      retries: config.retries || 1,
      healthCheckInterval: config.healthCheckInterval || 60000,
    }
  }

  /**
   * Send message to primary endpoint
   */
  async send(request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now()

    try {
      // Health check (cached for 1 minute)
      await this.ensureHealthy()

      // Track message
      trackChatMessage(request.session_id || 'unknown', request.message, 'primary')

      // Call API
      const response = await api.post<any>(
        '/api/v1/chat/stable',
        {
          message: request.message,
          session_id: request.session_id || `primary_${Date.now()}`,
          context: request.context,
        },
        {
          timeout: this.config.timeout,
        }
      )

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Primary adapter failed')
      }

      // Convert to standard format
      const chatResponse: ChatResponse = {
        session_id: response.data.session_id,
        agent_id: response.data.agent_id || 'assistant',
        agent_name: response.data.agent_name || 'Assistente',
        message: response.data.message || response.data.response || '',
        confidence: response.data.confidence || 0.9,
        suggested_actions: response.data.suggested_actions || [],
        metadata: {
          ...response.data.metadata,
          adapter: 'primary',
          endpoint: '/api/v1/chat/stable',
          model: 'sabiazinho-3',
          latency: Date.now() - startTime,
        },
      }

      // Track success
      trackChatResponse(request.session_id || 'unknown', Date.now() - startTime, false)

      return chatResponse
    } catch (error: any) {
      const duration = Date.now() - startTime

      // Update health status
      this.healthStatus = 'degraded'

      // Track error
      trackChatError(request.session_id || 'unknown', error)

      // Re-throw for fallback handling
      throw new Error(`Primary adapter error: ${error.message}`)
    }
  }

  /**
   * Check if adapter is healthy (cached check)
   */
  private async ensureHealthy(): Promise<void> {
    const now = Date.now()

    // Use cached health status if recent
    if (now - this.lastHealthCheck < this.config.healthCheckInterval) {
      if (this.healthStatus === 'down') {
        throw new Error('Primary adapter is down (cached status)')
      }
      return
    }

    // Perform actual health check
    try {
      const response = await api.get('/health', {
        timeout: 5000,
      })

      this.healthStatus = response.success ? 'healthy' : 'degraded'
      this.lastHealthCheck = now
    } catch (error) {
      this.healthStatus = 'down'
      this.lastHealthCheck = now
      throw new Error('Primary adapter health check failed')
    }
  }

  /**
   * Get current health status
   */
  getHealthStatus(): 'healthy' | 'degraded' | 'down' {
    return this.healthStatus
  }

  /**
   * Get adapter metrics
   */
  getMetrics() {
    return {
      name: 'primary',
      endpoint: '/api/v1/chat/stable',
      model: 'sabiazinho-3',
      health: this.healthStatus,
      lastHealthCheck: this.lastHealthCheck,
      config: this.config,
    }
  }
}

// Singleton instance
export const primaryAdapter = new PrimaryAdapter()
```

**Arquivo 2: `lib/api/adapters/fallback.adapter.ts`**

```typescript
/**
 * Fallback Chat Adapter - Maritaca Optimized Endpoint
 *
 * Used when primary adapter fails or is degraded.
 * Slightly more expensive but more reliable.
 *
 * @priority 2
 * @model sabiazinho-3
 * @costLevel 1.2 (R$ 0.0012 per 1k tokens)
 */

import { api } from '../client'
import type { ChatRequest, ChatResponse } from '@/types/chat'
import { trackChatMessage, trackChatResponse, trackChatError } from '@/lib/telemetry/chat-telemetry'

export class FallbackAdapter {
  private usageCount: number = 0
  private lastUsed: number = 0

  async send(request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now()

    try {
      this.usageCount++
      this.lastUsed = Date.now()

      console.warn('[Fallback Adapter] Primary failed, using fallback endpoint')

      trackChatMessage(request.session_id || 'unknown', request.message, 'fallback')

      const response = await api.post<any>(
        '/api/v1/chat/optimized',
        {
          message: request.message,
          session_id: request.session_id || `fallback_${Date.now()}`,
          context: {
            ...request.context,
            fallback_triggered: true,
            primary_failed: true,
          },
        },
        {
          timeout: 35000, // Slightly longer timeout
        }
      )

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Fallback adapter failed')
      }

      const chatResponse: ChatResponse = {
        session_id: response.data.session_id,
        agent_id: response.data.agent_id || 'assistant',
        agent_name: response.data.agent_name || 'Assistente',
        message: response.data.message || response.data.response || '',
        confidence: response.data.confidence || 0.85,
        suggested_actions: response.data.suggested_actions || [],
        metadata: {
          ...response.data.metadata,
          adapter: 'fallback',
          endpoint: '/api/v1/chat/optimized',
          model: 'sabiazinho-3',
          latency: Date.now() - startTime,
          fallback_used: true,
        },
      }

      trackChatResponse(request.session_id || 'unknown', Date.now() - startTime, true)

      return chatResponse
    } catch (error: any) {
      trackChatError(request.session_id || 'unknown', error)
      throw new Error(`Fallback adapter error: ${error.message}`)
    }
  }

  getMetrics() {
    return {
      name: 'fallback',
      endpoint: '/api/v1/chat/optimized',
      model: 'sabiazinho-3',
      usageCount: this.usageCount,
      lastUsed: this.lastUsed,
    }
  }
}

export const fallbackAdapter = new FallbackAdapter()
```

**Arquivo 3: `lib/api/adapters/local.adapter.ts`**

```typescript
/**
 * Local Chat Adapter - Offline/Emergency Mode
 *
 * Used when all backend adapters fail.
 * Provides basic responses using client-side logic.
 * No backend calls, works completely offline.
 *
 * @priority 3 (last resort)
 * @model local-rules
 * @costLevel 0 (free)
 */

import type { ChatRequest, ChatResponse } from '@/types/chat'

interface LocalResponse {
  pattern: RegExp
  response: string
  confidence: number
}

export class LocalAdapter {
  private responses: LocalResponse[] = [
    {
      pattern: /^(olá|oi|bom dia|boa tarde|boa noite|hey|hello)/i,
      response:
        'Olá! No momento estou com dificuldades de conexão com o servidor, mas estou aqui para ajudar assim que o serviço for restabelecido. Por favor, tente novamente em alguns instantes.',
      confidence: 0.3,
    },
    {
      pattern: /(ajud|help|como funciona|o que é)/i,
      response:
        'O Cidadão.AI é um sistema de transparência pública que utiliza inteligência artificial para analisar dados governamentais. No momento estamos offline, mas você pode:\n\n- Verificar sua conexão com a internet\n- Recarregar a página\n- Tentar novamente em alguns minutos\n\nNossos 17 agentes especializados estarão disponíveis assim que a conexão for restabelecida.',
      confidence: 0.4,
    },
    {
      pattern: /(investig|analis|dados|transpar|corrup)/i,
      response:
        'Entendo que você quer realizar uma investigação ou análise de dados. Infelizmente, no momento não consigo acessar nossos servidores para processar sua solicitação. Por favor, aguarde a reconexão.',
      confidence: 0.2,
    },
  ]

  async send(request: ChatRequest): Promise<ChatResponse> {
    console.error('[Local Adapter] ALL BACKEND ADAPTERS FAILED - Using local fallback')

    // Try to match message pattern
    const lowerMessage = request.message.toLowerCase()
    const match = this.responses.find((r) => r.pattern.test(lowerMessage))

    const response = match || {
      response:
        'Desculpe, estou temporariamente indisponível. Por favor, verifique sua conexão e tente novamente em alguns instantes.',
      confidence: 0.1,
    }

    return {
      session_id: request.session_id || `local_${Date.now()}`,
      agent_id: 'system',
      agent_name: 'Sistema Local',
      message: response.response,
      confidence: response.confidence,
      suggested_actions: [
        'Verificar conexão com internet',
        'Recarregar página',
        'Tentar novamente em 1 minuto',
      ],
      metadata: {
        adapter: 'local',
        endpoint: 'client-side',
        model: 'local-rules',
        offline: true,
        fallback: true,
        warning: 'Backend services unavailable',
      },
    }
  }

  getMetrics() {
    return {
      name: 'local',
      endpoint: 'client-side',
      model: 'local-rules',
      patterns: this.responses.length,
    }
  }
}

export const localAdapter = new LocalAdapter()
```

**Arquivo 4: `lib/services/smart-chat.service.ts` (atualizado)**

```typescript
/**
 * Smart Chat Service - Intelligent Adapter Selection
 *
 * Automatically selects the best adapter based on:
 * - Adapter health status
 * - Historical performance
 * - User preferences
 * - Message complexity
 */

import { primaryAdapter } from '@/lib/api/adapters/primary.adapter'
import { fallbackAdapter } from '@/lib/api/adapters/fallback.adapter'
import { localAdapter } from '@/lib/api/adapters/local.adapter'
import type { ChatRequest, ChatResponse } from '@/types/chat'
import { chatTelemetry } from '@/lib/telemetry/chat-telemetry'

export type ModelPreference = 'auto' | 'economic' | 'quality' | 'stable'

export interface SmartChatOptions {
  preferredModel?: ModelPreference
  maxRetries?: number
  timeout?: number
  skipHealthCheck?: boolean
}

export class SmartChatService {
  /**
   * Send message with intelligent adapter selection
   */
  async sendMessage(message: string, options: SmartChatOptions = {}): Promise<ChatResponse> {
    const sessionId = `smart_${Date.now()}`
    const request: ChatRequest = {
      message,
      session_id: sessionId,
      context: {
        model_preference: options.preferredModel || 'auto',
      },
    }

    console.log('[SmartChat] Starting request with adapter cascade')
    console.log('[SmartChat] Primary health:', primaryAdapter.getHealthStatus())

    // Try Primary Adapter
    if (!options.skipHealthCheck || primaryAdapter.getHealthStatus() !== 'down') {
      try {
        console.log('[SmartChat] Trying Primary Adapter...')
        const response = await primaryAdapter.send(request)
        console.log('[SmartChat] ✅ Primary Adapter succeeded')
        return response
      } catch (error) {
        console.warn('[SmartChat] ❌ Primary Adapter failed:', error)
      }
    }

    // Try Fallback Adapter
    try {
      console.log('[SmartChat] Trying Fallback Adapter...')
      const response = await fallbackAdapter.send(request)
      console.log('[SmartChat] ✅ Fallback Adapter succeeded')
      return response
    } catch (error) {
      console.error('[SmartChat] ❌ Fallback Adapter failed:', error)
    }

    // Use Local Adapter (last resort)
    console.error('[SmartChat] All backend adapters failed, using Local Adapter')
    const response = await localAdapter.send(request)
    console.log('[SmartChat] ✅ Local Adapter responded (offline mode)')

    return response
  }

  /**
   * Get metrics from all adapters
   */
  getAdapterMetrics() {
    return {
      primary: primaryAdapter.getMetrics(),
      fallback: fallbackAdapter.getMetrics(),
      local: localAdapter.getMetrics(),
    }
  }

  /**
   * Analyze message complexity (for future ML integration)
   */
  analyzeComplexity(message: string): 'simple' | 'moderate' | 'complex' {
    const complexKeywords = [
      'analise',
      'investigue',
      'compare',
      'tendência',
      'padrão',
      'anomalia',
      'detalhe',
      'relatório',
    ]

    const lowerMessage = message.toLowerCase()

    if (message.length > 200) return 'complex'
    if (complexKeywords.some((kw) => lowerMessage.includes(kw))) return 'complex'
    if (message.length < 20) return 'simple'

    return 'moderate'
  }
}

// Singleton instance
export const smartChatService = new SmartChatService()
```

#### Migration Checklist

**Phase 1: Create New Adapters (Day 1)**

- [ ] Criar `lib/api/adapters/` directory
- [ ] Implementar `primary.adapter.ts`
- [ ] Implementar `fallback.adapter.ts`
- [ ] Implementar `local.adapter.ts`
- [ ] Criar testes unitários para cada adapter
- [ ] Testar localmente

**Phase 2: Update Smart Chat Service (Day 2)**

- [ ] Atualizar `smart-chat.service.ts`
- [ ] Remover referências aos adapters antigos
- [ ] Adicionar telemetria
- [ ] Integration tests

**Phase 3: Delete Old Adapters (Day 2)**

- [ ] `git rm lib/api/chat-adapter-v1.ts`
- [ ] `git rm lib/api/chat-adapter-v2.ts`
- [ ] `git rm lib/api/chat-adapter-v3.ts`
- [ ] `git rm lib/api/chat-adapter.ts`
- [ ] Verificar que nada quebrou: `npm run build`

**Phase 4: Documentation & Deployment (Day 3)**

- [ ] Atualizar `README.md`
- [ ] Documentar arquitetura em `docs/technical/`
- [ ] Deploy em staging
- [ ] Smoke tests
- [ ] Deploy em produção

---

### Task 1.2: Migrar ApexCharts para Recharts

#### Análise de Uso Atual

```bash
# Descobrir onde ApexCharts é usado
$ grep -r "apexcharts" . --include="*.tsx" --include="*.ts"

# Resultado:
./app/pt/(authenticated)/dashboard/page-v3.tsx:import ApexCharts from 'react-apexcharts'
```

**Apenas 1 arquivo!** Isso facilita muito a migração.

#### Componentes Recharts a Criar

**Estrutura proposta:**

```
components/charts/
├── line-chart.tsx          # Gráfico de linha (time series)
├── bar-chart.tsx           # Gráfico de barras (comparações)
├── area-chart.tsx          # Área (volumes, tendências)
├── pie-chart.tsx           # Pizza (distribuições)
├── composed-chart.tsx      # Combinado (linha + barra)
├── chart-container.tsx     # Wrapper comum (título, loading, etc)
├── chart-skeleton.tsx      # Loading state
├── lazy.tsx                # Dynamic imports
└── index.ts                # Exports
```

#### Implementação: Line Chart

**Arquivo: `components/charts/line-chart.tsx`**

````typescript
/**
 * LineChart Component - Recharts Implementation
 *
 * Replacement for ApexCharts line chart.
 * Lighter, tree-shakeable, better TypeScript support.
 *
 * @example
 * ```tsx
 * <LineChart
 *   data={data}
 *   xKey="date"
 *   yKeys={["value", "target"]}
 *   colors={["#10b981", "#3b82f6"]}
 * />
 * ```
 */

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { ChartContainer } from './chart-container';

export interface LineChartProps {
  data: any[];
  xKey: string;
  yKeys: string[];
  colors?: string[];
  title?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  formatYAxis?: (value: number) => string;
  formatTooltip?: (value: number) => string;
  loading?: boolean;
  error?: string;
}

export function LineChart({
  data,
  xKey,
  yKeys,
  colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
  title,
  height = 300,
  showLegend = true,
  showGrid = true,
  formatYAxis,
  formatTooltip,
  loading,
  error,
}: LineChartProps) {
  if (loading) {
    return <ChartContainer title={title} height={height} loading />;
  }

  if (error) {
    return <ChartContainer title={title} height={height} error={error} />;
  }

  if (!data || data.length === 0) {
    return (
      <ChartContainer title={title} height={height} error="Sem dados para exibir" />
    );
  }

  return (
    <ChartContainer title={title} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          )}

          <XAxis
            dataKey={xKey}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />

          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={formatYAxis}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            formatter={formatTooltip}
          />

          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />
          )}

          {yKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              animationDuration={300}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
````

**Arquivo: `components/charts/chart-container.tsx`**

```typescript
/**
 * ChartContainer - Wrapper comum para todos charts
 *
 * Fornece:
 * - Título consistente
 * - Loading state
 * - Error state
 * - Empty state
 * - Glassmorphism styling
 */

import { ChartSkeleton } from './chart-skeleton';

interface ChartContainerProps {
  title?: string;
  height: number;
  loading?: boolean;
  error?: string;
  children?: React.ReactNode;
}

export function ChartContainer({
  title,
  height,
  loading,
  error,
  children,
}: ChartContainerProps) {
  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
      )}

      <div style={{ height: `${height}px` }}>
        {loading && <ChartSkeleton />}

        {error && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg
              className="w-12 h-12 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && children}
      </div>
    </div>
  );
}
```

**Arquivo: `components/charts/chart-skeleton.tsx`**

```typescript
/**
 * ChartSkeleton - Loading placeholder
 */

export function ChartSkeleton() {
  return (
    <div className="animate-pulse h-full flex flex-col">
      {/* Axes */}
      <div className="flex-1 flex items-end gap-2">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-t"
            style={{ height: `${Math.random() * 60 + 20}%` }}
          />
        ))}
      </div>

      {/* X-axis labels */}
      <div className="flex gap-2 mt-2">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded"
          />
        ))}
      </div>
    </div>
  );
}
```

#### Migration Steps

**Step 1: Install Dependencies**

```bash
# Recharts já está instalado (verificar)
npm list recharts

# Se não estiver:
npm install recharts
```

**Step 2: Create Recharts Components**

```bash
# Criar estrutura
mkdir -p components/charts
cd components/charts

# Criar arquivos
touch line-chart.tsx
touch bar-chart.tsx
touch area-chart.tsx
touch pie-chart.tsx
touch chart-container.tsx
touch chart-skeleton.tsx
touch lazy.tsx
touch index.ts
```

**Step 3: Migrate dashboard/page-v3.tsx**

**ANTES (ApexCharts):**

```typescript
// app/pt/(authenticated)/dashboard/page-v3.tsx
import ApexCharts from 'react-apexcharts';

const chartOptions = {
  chart: { type: 'line' },
  series: [{
    name: 'Gastos',
    data: [30, 40, 35, 50, 49, 60, 70]
  }],
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
  }
};

<ApexCharts
  options={chartOptions}
  series={chartOptions.series}
  type="line"
  height={300}
/>
```

**DEPOIS (Recharts):**

```typescript
// app/pt/(authenticated)/dashboard/page-v3.tsx
import { LineChart } from '@/components/charts';

const chartData = [
  { month: 'Jan', gastos: 30 },
  { month: 'Feb', gastos: 40 },
  { month: 'Mar', gastos: 35 },
  { month: 'Apr', gastos: 50 },
  { month: 'May', gastos: 49 },
  { month: 'Jun', gastos: 60 },
  { month: 'Jul', gastos: 70 },
];

<LineChart
  data={chartData}
  xKey="month"
  yKeys={['gastos']}
  title="Evolução de Gastos Públicos"
  height={300}
  formatYAxis={(value) => `R$ ${value}M`}
  formatTooltip={(value) => `R$ ${value} milhões`}
/>
```

**Step 4: Visual Regression Testing**

```bash
# Capturar screenshot ANTES
npm run storybook
# Screenshot manual ou Playwright

# Fazer migração
# ...

# Capturar screenshot DEPOIS
# Screenshot manual ou Playwright

# Comparar visualmente
```

**Step 5: Remove ApexCharts**

```bash
npm uninstall apexcharts react-apexcharts

# Verificar que nada quebrou
npm run build
npm run lint
npm run type-check
```

---

### Task 1.3: Dynamic Imports

#### Implementação: Lazy Loading para Charts

**Arquivo: `components/charts/lazy.tsx`**

```typescript
/**
 * Lazy-loaded chart components
 *
 * Reduces initial bundle size by loading charts only when needed.
 * Each chart component is ~20KB, so lazy loading can save 80KB+ on initial load.
 */

import dynamic from 'next/dynamic';
import { ChartSkeleton } from './chart-skeleton';

export const LineChart = dynamic(
  () => import('./line-chart').then(mod => ({ default: mod.LineChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false, // Charts don't need SSR
  }
);

export const BarChart = dynamic(
  () => import('./bar-chart').then(mod => ({ default: mod.BarChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const AreaChart = dynamic(
  () => import('./area-chart').then(mod => ({ default: mod.AreaChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const PieChart = dynamic(
  () => import('./pie-chart').then(mod => ({ default: mod.PieChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);
```

**Uso:**

```typescript
// app/pt/(authenticated)/dashboard/page.tsx
import { LineChart, BarChart } from '@/components/charts/lazy';

export default function DashboardPage() {
  return (
    <div>
      <Suspense fallback={<ChartSkeleton />}>
        <LineChart data={data} xKey="date" yKeys={["value"]} />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <BarChart data={data} xKey="category" yKeys={["count"]} />
      </Suspense>
    </div>
  );
}
```

#### Other Heavy Components

**Export Modal:**

```typescript
// components/export/lazy.tsx
import dynamic from 'next/dynamic';

export const ExportModal = dynamic(
  () => import('./export-modal'),
  {
    loading: () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full" />
        </div>
      </div>
    ),
    ssr: false,
  }
);
```

**Uso:**

```typescript
// app/pt/(authenticated)/investigacoes/page.tsx
import { ExportModal } from '@/components/export/lazy';

export default function InvestigationsPage() {
  const [showExport, setShowExport] = useState(false);

  return (
    <>
      <button onClick={() => setShowExport(true)}>
        Exportar
      </button>

      {showExport && (
        <ExportModal onClose={() => setShowExport(false)} />
      )}
    </>
  );
}
```

---

### Task 1.4: Bundle Analysis

#### Setup Webpack Bundle Analyzer

**Install:**

```bash
npm install --save-dev @next/bundle-analyzer
```

**Configure `next.config.js`:**

```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const withPWA = withPWAInit.default({
  /* ... */
})

module.exports = withBundleAnalyzer(withPWA(nextConfig))
```

**Usage:**

```bash
# Generate bundle analysis
ANALYZE=true npm run build

# Opens browser with interactive treemap
# File: .next/analyze/client.html
```

#### Performance Budget

**Create `performance-budget.json`:**

```json
{
  "budgets": [
    {
      "path": "/_app",
      "maxSize": "250KB",
      "warningSize": "200KB"
    },
    {
      "path": "/(pt|en)/chat",
      "maxSize": "300KB",
      "warningSize": "250KB"
    },
    {
      "path": "/(pt|en)/dashboard",
      "maxSize": "400KB",
      "warningSize": "350KB"
    },
    {
      "path": "/charts/*.js",
      "maxSize": "150KB",
      "warningSize": "120KB"
    }
  ],
  "lighthouse": {
    "performance": 90,
    "accessibility": 95,
    "best-practices": 90,
    "seo": 95
  }
}
```

#### Lighthouse CI Configuration

**Create `.lighthouserc.js`:**

```javascript
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start',
      url: [
        'http://localhost:3000/pt',
        'http://localhost:3000/pt/chat',
        'http://localhost:3000/pt/dashboard',
      ],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.95 }],

        // Bundle size assertions
        'total-byte-weight': ['error', { maxNumericValue: 512000 }], // 500KB
        'dom-size': ['warn', { maxNumericValue: 1500 }],

        // Performance metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
```

**GitHub Action `.github/workflows/lighthouse.yml`:**

```yaml
name: Lighthouse CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

---

## TESTING STRATEGY

### Unit Tests

**Test 1: Primary Adapter**

```typescript
// lib/api/adapters/primary.adapter.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PrimaryAdapter } from './primary.adapter'
import { api } from '../client'

vi.mock('../client')

describe('PrimaryAdapter', () => {
  let adapter: PrimaryAdapter

  beforeEach(() => {
    adapter = new PrimaryAdapter()
    vi.clearAllMocks()
  })

  it('should send message successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        session_id: 'test_session',
        agent_id: 'abaporu',
        agent_name: 'Abaporu',
        message: 'Olá! Como posso ajudar?',
        confidence: 0.95,
      },
    }

    vi.mocked(api.post).mockResolvedValue(mockResponse)

    const response = await adapter.send({
      message: 'Olá',
      session_id: 'test_session',
    })

    expect(response.message).toBe('Olá! Como posso ajudar?')
    expect(response.agent_id).toBe('abaporu')
    expect(response.metadata.adapter).toBe('primary')
  })

  it('should throw error when API fails', async () => {
    vi.mocked(api.post).mockResolvedValue({
      success: false,
      error: { message: 'API Error' },
    })

    await expect(adapter.send({ message: 'test' })).rejects.toThrow('Primary adapter failed')
  })

  it('should update health status on failure', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('Network error'))

    try {
      await adapter.send({ message: 'test' })
    } catch (error) {
      // Expected
    }

    expect(adapter.getHealthStatus()).toBe('degraded')
  })
})
```

**Test 2: Smart Chat Service Cascade**

```typescript
// lib/services/smart-chat.service.test.ts
import { describe, it, expect, vi } from 'vitest'
import { SmartChatService } from './smart-chat.service'
import { primaryAdapter } from '@/lib/api/adapters/primary.adapter'
import { fallbackAdapter } from '@/lib/api/adapters/fallback.adapter'
import { localAdapter } from '@/lib/api/adapters/local.adapter'

vi.mock('@/lib/api/adapters/primary.adapter')
vi.mock('@/lib/api/adapters/fallback.adapter')
vi.mock('@/lib/api/adapters/local.adapter')

describe('SmartChatService - Adapter Cascade', () => {
  it('should use primary adapter when available', async () => {
    const mockResponse = {
      session_id: 'test',
      agent_id: 'abaporu',
      agent_name: 'Abaporu',
      message: 'Response from primary',
      confidence: 0.9,
      metadata: { adapter: 'primary' },
    }

    vi.mocked(primaryAdapter.send).mockResolvedValue(mockResponse)

    const service = new SmartChatService()
    const response = await service.sendMessage('test')

    expect(response.metadata.adapter).toBe('primary')
    expect(primaryAdapter.send).toHaveBeenCalledTimes(1)
    expect(fallbackAdapter.send).not.toHaveBeenCalled()
  })

  it('should fallback when primary fails', async () => {
    vi.mocked(primaryAdapter.send).mockRejectedValue(new Error('Primary failed'))

    const mockFallbackResponse = {
      session_id: 'test',
      agent_id: 'abaporu',
      agent_name: 'Abaporu',
      message: 'Response from fallback',
      confidence: 0.85,
      metadata: { adapter: 'fallback' },
    }

    vi.mocked(fallbackAdapter.send).mockResolvedValue(mockFallbackResponse)

    const service = new SmartChatService()
    const response = await service.sendMessage('test')

    expect(response.metadata.adapter).toBe('fallback')
    expect(primaryAdapter.send).toHaveBeenCalledTimes(1)
    expect(fallbackAdapter.send).toHaveBeenCalledTimes(1)
  })

  it('should use local adapter when all fail', async () => {
    vi.mocked(primaryAdapter.send).mockRejectedValue(new Error('Primary failed'))
    vi.mocked(fallbackAdapter.send).mockRejectedValue(new Error('Fallback failed'))

    const mockLocalResponse = {
      session_id: 'test',
      agent_id: 'system',
      agent_name: 'Sistema Local',
      message: 'Offline response',
      confidence: 0.3,
      metadata: { adapter: 'local', offline: true },
    }

    vi.mocked(localAdapter.send).mockResolvedValue(mockLocalResponse)

    const service = new SmartChatService()
    const response = await service.sendMessage('test')

    expect(response.metadata.adapter).toBe('local')
    expect(response.metadata.offline).toBe(true)
    expect(localAdapter.send).toHaveBeenCalledTimes(1)
  })
})
```

### Integration Tests

**Test: Full Chat Flow**

```typescript
// tests/integration/chat-adapter-cascade.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Chat Adapter Cascade', () => {
  test('should handle primary adapter success', async ({ page }) => {
    await page.goto('/pt/chat')

    // Send message
    await page.fill('textarea[placeholder*="mensagem"]', 'Olá')
    await page.click('button[type="submit"]')

    // Wait for response
    await page.waitForSelector('[data-testid="assistant-message"]', {
      timeout: 10000,
    })

    // Verify response
    const response = await page.textContent('[data-testid="assistant-message"]')
    expect(response).toBeTruthy()
    expect(response!.length).toBeGreaterThan(0)

    // Check adapter used (via DevTools console or metadata)
    const metadata = await page.evaluate(() => {
      // @ts-ignore
      return window.__CHAT_METADATA__
    })

    expect(metadata?.adapter).toBe('primary')
  })

  test('should fallback when primary is slow', async ({ page }) => {
    // Mock slow primary adapter
    await page.route('**/api/v1/chat/stable', (route) => {
      setTimeout(() => route.abort(), 35000) // Timeout after 35s
    })

    await page.goto('/pt/chat')

    await page.fill('textarea', 'Test fallback')
    await page.click('button[type="submit"]')

    // Should receive response from fallback
    await page.waitForSelector('[data-testid="assistant-message"]', {
      timeout: 40000,
    })

    const metadata = await page.evaluate(() => {
      // @ts-ignore
      return window.__CHAT_METADATA__
    })

    expect(['fallback', 'local']).toContain(metadata?.adapter)
  })
})
```

### Visual Regression Tests

**Using Playwright Snapshots:**

```typescript
// tests/visual/charts.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Charts Visual Regression', () => {
  test('line chart matches baseline', async ({ page }) => {
    await page.goto('/pt/dashboard')

    // Wait for chart to render
    await page.waitForSelector('[data-testid="line-chart"]')
    await page.waitForTimeout(500) // Animation complete

    // Take screenshot
    const chart = await page.locator('[data-testid="line-chart"]')
    await expect(chart).toHaveScreenshot('line-chart.png')
  })

  test('bar chart matches baseline', async ({ page }) => {
    await page.goto('/pt/dashboard')

    await page.waitForSelector('[data-testid="bar-chart"]')
    await page.waitForTimeout(500)

    const chart = await page.locator('[data-testid="bar-chart"]')
    await expect(chart).toHaveScreenshot('bar-chart.png')
  })
})
```

**Generate Baselines:**

```bash
# First run - generate baselines
npm run test:playwright -- --update-snapshots

# Subsequent runs - compare
npm run test:playwright
```

---

## DEFINITION OF DONE

### Sprint 1 DoD Checklist

#### Task 1.1: Consolidar Adapters

- [ ] 3 adapters implementados (primary, fallback, local)
- [ ] Código antigo deletado (v1, v2, v3)
- [ ] Unit tests com 100% coverage dos adapters
- [ ] Integration test do cascade funcionando
- [ ] Telemetria implementada
- [ ] Documentação atualizada
- [ ] Zero breaking changes (backwards compatible)
- [ ] Code review approved
- [ ] Merged to develop

#### Task 1.2: Migrar Charts

- [ ] ApexCharts removido do package.json
- [ ] Todos charts migrando para Recharts
- [ ] Visual regression tests passando
- [ ] Storybook stories atualizadas
- [ ] Bundle size reduzido em 600KB+
- [ ] Lighthouse score mantido ou melhorado
- [ ] Documentação de componentes
- [ ] Code review approved
- [ ] Merged to develop

#### Task 1.3: Dynamic Imports

- [ ] Lazy loading implementado para charts
- [ ] Lazy loading para export modal
- [ ] Skeletons criados para loading states
- [ ] Build time reduzido
- [ ] Initial bundle < 250KB
- [ ] Suspense boundaries testadas
- [ ] Code review approved
- [ ] Merged to develop

#### Task 1.4: Bundle Analysis

- [ ] Webpack Bundle Analyzer configurado
- [ ] Relatório baseline gerado
- [ ] Relatório final gerado
- [ ] Performance budget definido
- [ ] Lighthouse CI configurado
- [ ] GitHub Action funcionando
- [ ] Documentação criada
- [ ] Code review approved
- [ ] Merged to develop

### General DoD (All Tasks)

- [ ] TypeScript strict mode compliant
- [ ] ESLint passing (zero warnings)
- [ ] Prettier formatted
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No console.error in production
- [ ] Accessibility tested (keyboard, screen reader)
- [ ] Mobile tested (iOS + Android)
- [ ] Performance validated (Lighthouse >90)

---

## RISCOS & MITIGAÇÃO

### Risco 1: Breaking Changes ao Deletar Adapters

**Probabilidade:** 20% (Baixo)
**Impacto:** Médio

**Mitigação:**

1. Manter interface pública idêntica
2. Feature flag para rollback rápido
3. Canary deployment (10% users primeiro)
4. Monitoring de error rate
5. Rollback plan documentado

**Rollback Plan:**

```bash
# Se error rate > 5% nos primeiros 30min:
1. git revert <commit-hash>
2. Deploy to production
3. Post-mortem meeting
```

### Risco 2: Performance Regression com Recharts

**Probabilidade:** 15% (Baixo)
**Impacto:** Baixo

**Mitigação:**

1. Benchmark antes/depois
2. Lighthouse CI bloqueando deploy se score < 85
3. Visual regression tests
4. Real user monitoring (RUM)

**Performance Budget:**

```javascript
// Se Lighthouse score cair > 5 pontos:
- Review chart implementation
- Consider virtualization para large datasets
- Profile com React DevTools
```

### Risco 3: Bundle Analysis False Positives

**Probabilidade:** 25% (Baixo)
**Impacto:** Baixo

**Mitigação:**

1. Executar análise 3 vezes (average)
2. Comparar com production baseline
3. Manual validation de tamanhos
4. Usar `source-map-explorer` como segunda opinião

---

## MÉTRICAS DE SUCESSO

### Quantitativas

| Métrica                | Baseline | Target | Stretch Goal |
| ---------------------- | -------- | ------ | ------------ |
| Bundle Size            | 400KB    | 200KB  | 150KB        |
| Chart Library          | 800KB    | 200KB  | 200KB        |
| Adapters Count         | 6        | 3      | 3            |
| Build Time             | 45s      | 36s    | 30s          |
| Lighthouse Score       | 75       | 90     | 95           |
| First Contentful Paint | 2.5s     | 1.5s   | 1.0s         |
| Time to Interactive    | 4.2s     | 2.5s   | 2.0s         |

### Qualitativas

- [ ] **Developer Experience:** Tempo de onboarding reduzido (feedback de novo dev)
- [ ] **Code Maintainability:** Cyclomatic complexity reduzida
- [ ] **Documentation Quality:** README compreensível para júnior
- [ ] **User Perception:** Carregamento percebido como "rápido"

### Telemetria

**Métricas a Monitorar (Post-Deploy):**

```typescript
// Analytics events
{
  'adapter_used': 'primary' | 'fallback' | 'local',
  'adapter_latency_ms': number,
  'fallback_triggered': boolean,
  'bundle_load_time_ms': number,
  'chart_render_time_ms': number,
}
```

**Alertas:**

- ⚠️ Fallback rate > 10% → Investigate primary health
- ⚠️ Local adapter used > 1% → Backend issues
- ⚠️ Bundle load time > 3s → Review optimizations

---

## CHECKLIST DE ENTREGA

### Day 1 (Segunda-feira)

- [ ] Sprint planning meeting (2h)
- [ ] Setup development environment
- [ ] Create feature branches
- [ ] PBI #1: Implementar primary adapter
- [ ] PBI #2: Criar componentes Recharts base
- [ ] Daily standup

### Day 2 (Terça-feira)

- [ ] Daily standup
- [ ] PBI #1: Implementar fallback + local adapters
- [ ] PBI #1: Atualizar smart-chat.service
- [ ] PBI #2: Migrar dashboard para Recharts
- [ ] PBI #3: Implementar lazy loading para charts

### Day 3 (Quarta-feira)

- [ ] Daily standup
- [ ] PBI #1: Deletar adapters antigos
- [ ] PBI #1: Unit + integration tests
- [ ] PBI #2: Visual regression tests
- [ ] PBI #4: Configurar Bundle Analyzer
- [ ] PBI #5: Cleanup de código morto

### Day 4 (Quinta-feira)

- [ ] Daily standup
- [ ] PBI #4: Gerar relatórios bundle
- [ ] PBI #4: Configurar Lighthouse CI
- [ ] Code review de todos PRs
- [ ] Documentation updates
- [ ] Testing completo (manual + automated)

### Day 5 (Sexta-feira)

- [ ] Daily standup
- [ ] Fix de issues do code review
- [ ] Merge all PRs to develop
- [ ] Deploy to staging
- [ ] Smoke tests
- [ ] Sprint review presentation (1h)
- [ ] Sprint retrospective (45min)
- [ ] Deploy to production
- [ ] Monitoring & celebrations 🎉

---

## DOCUMENTAÇÃO ADICIONAL

### Referências Técnicas

- [Next.js Bundle Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/bundle-analyzer)
- [Recharts Documentation](https://recharts.org/)
- [Dynamic Import Best Practices](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### Templates

- [PR Template for Sprint 1](./templates/pr-template-sprint-1.md)
- [Bug Report Template](./templates/bug-report.md)
- [Code Review Checklist](./templates/code-review-checklist.md)

### Arquivos Relacionados

- [Análise Técnica Completa](../../reports/ANALISE_TECNICA_ARQUITETURA_FRONTEND.md)
- [Sprint Planning Overview](../SPRINT_PLANNING_OVERVIEW.md)

---

## CHANGELOG

### v1.0 - 04/10/2025

- ✅ Documentação inicial completa
- ✅ Todos PBIs detalhados
- ✅ Testing strategy definida
- ✅ Riscos identificados e mitigados
- ✅ DoD estabelecido

---

## CONTATO & SUPORTE

**Sprint Master:**
Anderson Henrique da Silva
anderson.ufrj@gmail.com

**Horário de Trabalho:**
Segunda a Sexta, 9h às 18h (GMT-3)

**Canais de Comunicação:**

- Discord: #sprint-1-quick-wins
- GitHub: Issues tagged `sprint-1`
- Email: Para assuntos urgentes

---

**STATUS:** 📋 Ready to Start
**PRÓXIMA AÇÃO:** Sprint Kickoff Meeting - 07/10/2025 09:00 BRT
**DURAÇÃO ESTIMADA:** 5 dias úteis

---

_Esta documentação será atualizada daily durante o sprint para refletir progresso e aprendizados._
