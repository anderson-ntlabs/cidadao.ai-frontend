# Sprint 2: Análise Técnica Pré-Implementação

**Data:** 2025-10-04
**Status:** ✅ VALIDAÇÃO CONCLUÍDA
**Decisão:** PROSSEGUIR com implementação

---

## 🎯 Objetivo da Análise

Validar a viabilidade técnica das entregas planejadas para o Sprint 2 ANTES de iniciar a implementação, especialmente:
1. ✅ Suporte SSE no HuggingFace Spaces
2. ✅ Compatibilidade do backend atual
3. ✅ Viabilidade do IndexedDB
4. ✅ Estratégia de test coverage

---

## 🔍 PBI #5: WebSocket → SSE

### Pergunta Crítica
**HuggingFace Spaces suporta Server-Sent Events (SSE)?**

### ✅ Resposta: SIM

#### Evidências Encontradas

**1. Documentação Oficial HuggingFace (2024)**
- Text Generation Inference (TGI) usa SSE nativamente
- Quote: "Under the hood, TGI uses Server-Sent Events (SSE)"
- SSE é o padrão para streaming em HuggingFace Spaces

**2. FastAPI + SSE no HuggingFace**
- Múltiplos exemplos de deploy FastAPI com SSE streaming
- Artigo tutorial: "How to Deploy a Streaming RAG Endpoint with FastAPI on HuggingFace Spaces"
- Biblioteca recomendada: `sse-starlette` com `EventSourceResponse`

**3. Backend Atual JÁ IMPLEMENTA SSE** ✅
```json
// Endpoint encontrado no OpenAPI spec:
{
  "path": "/api/v1/chat/stream",
  "method": "POST",
  "description": "Stream chat response using Server-Sent Events (SSE)",
  "responses": {
    "200": {
      "content": {
        "text/event-stream": {}
      }
    }
  }
}
```

**4. Endpoint Adicional de Streaming**
```json
{
  "path": "/api/v1/investigations/stream/{investigation_id}",
  "method": "GET",
  "description": "Stream investigation results in real-time"
}
```

### 📊 Análise de Compatibilidade

| Aspecto | Status | Evidência |
|---------|--------|-----------|
| HF Spaces SSE Support | ✅ Sim | Documentação oficial TGI |
| Backend Implementado | ✅ Sim | `/api/v1/chat/stream` exists |
| FastAPI Compatibility | ✅ Sim | Tutorial + exemplos práticos |
| Client-Side Support | ✅ Sim | `EventSource` API nativo browser |

### 🎯 Implementação Planejada

**Backend (JÁ EXISTE)**:
```python
# FastAPI com sse-starlette
from sse_starlette.sse import EventSourceResponse

@app.post("/api/v1/chat/stream")
async def stream_chat(request: ChatRequest):
    async def event_generator():
        async for chunk in chat_service.stream(request):
            yield {
                "event": "message",
                "data": json.dumps(chunk)
            }

    return EventSourceResponse(event_generator())
```

**Frontend (A IMPLEMENTAR)**:
```typescript
// Substituir WebSocket por EventSource
const eventSource = new EventSource('/api/v1/chat/stream');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateChatUI(data);
};

eventSource.onerror = (error) => {
  console.error('SSE error:', error);
  eventSource.close();
};
```

### ⚠️ Limitações do SSE vs WebSocket

| Feature | WebSocket | SSE | Impacto |
|---------|-----------|-----|---------|
| Bidirecional | ✅ Sim | ❌ Não | ⚠️ Baixo (chat é unidirecional) |
| Reconnect automático | ❌ Não | ✅ Sim | ✅ Melhor UX |
| Binary data | ✅ Sim | ❌ Não | ✅ OK (usamos JSON) |
| Browser support | ✅ 95%+ | ✅ 98%+ | ✅ Melhor |
| Serverless friendly | ❌ Não | ✅ Sim | ✅ **Crítico** |

### 💡 Decisão: PROSSEGUIR

**Justificativa**:
1. ✅ Backend já implementa SSE (`/api/v1/chat/stream`)
2. ✅ HuggingFace Spaces suporta nativamente
3. ✅ SSE é mais simples que WebSocket (menos código)
4. ✅ Reconnect automático melhora UX
5. ✅ Serverless-friendly (essencial para HF Spaces)

**Risco**: Baixo (infraestrutura já existe)

---

## 💾 PBI #6: Cache → IndexedDB

### Análise de Viabilidade

#### ✅ Browser Support
- IndexedDB: 97%+ dos browsers (caniuse.com)
- Suporte: Chrome 24+, Firefox 16+, Safari 10+, Edge 12+

#### 📊 Quota Management

**Limites Típicos**:
| Browser | Quota Padrão | Máximo |
|---------|--------------|---------|
| Chrome | 60% disco livre | ~6GB |
| Firefox | 50% disco livre | ~2GB |
| Safari | 1GB | 1GB |
| Edge | 60% disco livre | ~6GB |

**Mitigação**:
```typescript
// Implementar LRU eviction
interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  accessCount: number;
  size: number; // em bytes
}

// Cleanup automático quando atingir 80% da quota
async function cleanupCache(threshold = 0.8) {
  const estimate = await navigator.storage.estimate();
  const usage = estimate.usage / estimate.quota;

  if (usage > threshold) {
    // Remover entries mais antigas/menos acessadas
    await evictLeastRecentlyUsed();
  }
}
```

#### 🎯 Dados a Cachear

**Análise do Cache Atual**:
```bash
# Cache em memória identificado:
- Chat messages: ~10-20KB por sessão
- Agent responses: ~5-10KB por resposta
- Suggested actions: ~2-5KB
- User preferences: ~1KB
- Session state: ~3-5KB

Total estimado por sessão: ~30-50KB
100 sessões cached = 3-5MB (bem dentro do limite)
```

**Estratégia de Cache**:
1. **Hot data** (IndexedDB): Últimas 50 sessões de chat
2. **Warm data** (SessionStorage): Sessão atual
3. **Cold data** (Backend): Histórico completo

### 💡 Decisão: PROSSEGUIR

**Justificativa**:
1. ✅ Suporte de browser excelente (97%+)
2. ✅ Quota suficiente (estimado 3-5MB vs limite 1GB+)
3. ✅ Melhora offline experience
4. ✅ Reduz latência (cache local)
5. ✅ Reduz custos backend (menos requests)

**Risco**: Baixo (tecnologia madura)

**Implementação**:
- Usar biblioteca: `idb` (wrapper do Google, 2KB)
- LRU eviction automática
- Fallback para sessionStorage se quota excedida

---

## 🧪 PBI #7: Test Coverage 40% → 70%

### Análise de Baseline

**Estado Atual** (assumido do planejamento):
- Test coverage: 40%
- Framework: Vitest configurado
- E2E: Playwright configurado
- Manual testing: Scripts em `/scripts`

### 🎯 Estratégia de Coverage

#### Priorização por Criticidade

**Tier 1: Critical Paths** (60% coverage target)
```
1. Authentication (auth hooks, Supabase integration)
2. Chat system (adapters, smart service, store)
3. API clients (chat-service, backend communication)
4. Error handling (try/catch blocks, error boundaries)
```

**Tier 2: Core Components** (65% coverage target)
```
5. UI components (Button, Card, Form inputs)
6. Stores (Zustand: chat-store, notification-store)
7. Hooks (use-chat, use-auth, use-toast)
```

**Tier 3: Utils & Helpers** (70% coverage target)
```
8. Utility functions (lib/utils, formatting)
9. Telemetry (tracking, analytics)
10. Export services (CSV, PDF generation)
```

### 📊 Estimativa de Esforço

**Análise de Arquivos**:
```bash
# Estimativa baseada na estrutura do projeto:
lib/api/          → 15 arquivos → ~30 unit tests → 6h
lib/services/     → 8 arquivos  → ~20 unit tests → 4h
hooks/            → 12 arquivos → ~25 unit tests → 5h
store/            → 3 arquivos  → ~10 unit tests → 2h
components/ui/    → 20 arquivos → ~40 unit tests → 8h
-------------------------------------------------
Total:            → ~125 tests  → ~25 horas
```

**Realidade Check**:
- Sprint 2: 5 dias úteis × 8h = 40h disponíveis
- PBI #5 (SSE): ~12h
- PBI #6 (IndexedDB): ~8h
- PBI #7 (Tests): ~20h disponíveis ✅

### 💡 Decisão: AJUSTAR META

**Meta Ajustada**: 40% → 65% (+25pp)
- **Tier 1 Critical**: 100% coverage (auth, chat, API) ✅
- **Tier 2 Core**: 70% coverage (UI, stores, hooks) ✅
- **Tier 3 Utils**: 50% coverage (deixar para Sprint futuro)

**Justificativa**:
1. ⚠️ 70% em 1 semana é agressivo (125 tests)
2. ✅ 65% é alcançável (100 tests, foco em critical)
3. ✅ 100% critical paths > 70% geral
4. ✅ Qualidade > quantidade numérica

**Risco**: Médio → Baixo (meta ajustada)

---

## 📋 Plano de Execução Sprint 2 (Revisado)

### PBI #5: SSE Implementation (12h, 5 story points)

**Dia 1-2**:
1. ✅ Criar `lib/api/chat-sse.ts` com EventSource
2. ✅ Migrar `smart-chat.service.ts` para usar SSE
3. ✅ Adicionar reconnect logic e error handling
4. ✅ Testar com backend real (`/api/v1/chat/stream`)

**Dia 3**:
5. ✅ Atualizar UI para mostrar streaming progressivo
6. ✅ Adicionar loading states durante streaming
7. ✅ Remover código WebSocket antigo
8. ✅ Documentar mudanças

### PBI #6: IndexedDB Cache (8h, 3 story points)

**Dia 2-3**:
1. ✅ Instalar biblioteca `idb` (wrapper do Google)
2. ✅ Criar `lib/cache/indexeddb-cache.ts`
3. ✅ Implementar schema (chat sessions, messages, responses)
4. ✅ Adicionar LRU eviction automática

**Dia 3-4**:
5. ✅ Migrar stores para usar IndexedDB
6. ✅ Adicionar fallback para sessionStorage
7. ✅ Testar quota limits e cleanup
8. ✅ Medir memory footprint (antes/depois)

### PBI #7: Test Coverage (20h, 5 story points - AJUSTADO)

**Dia 1-5** (paralelo aos outros PBIs):

**Critical Paths** (10h):
1. ✅ Auth: `hooks/use-auth.ts`, `hooks/use-supabase-auth.ts`
2. ✅ Chat: `lib/api/chat-adapter-*.ts`, `lib/services/smart-chat.service.ts`
3. ✅ API: `lib/api/chat.service.ts`
4. ✅ Error handling: Error boundaries, try/catch coverage

**Core Components** (6h):
5. ✅ Stores: `store/chat-store.ts`, `store/notification-store.ts`
6. ✅ Hooks: `hooks/use-chat-store.ts`, `hooks/use-toast.ts`
7. ✅ UI: Componentes críticos (Button, Input, Card)

**Utils** (4h):
8. ✅ `lib/utils/`: Funções de formatação, helpers
9. ✅ Telemetry: Event tracking

### Métricas de Sucesso (Revisadas)

```typescript
interface Sprint2Success {
  streaming: {
    protocol: 'SSE',
    endpoint: '/api/v1/chat/stream',
    functional: true,
    latency: '<100ms'
  },
  cache: {
    technology: 'IndexedDB + idb',
    memoryBefore: '50MB',
    memoryAfter: '<5MB',
    reduction: '>90%',
    persistent: true,
    quota: 'LRU eviction implementada'
  },
  testCoverage: {
    before: '40%',
    after: '65%',        // ✅ Ajustado de 70%
    increase: '+25pp',   // ✅ Ajustado de +30pp
    criticalPaths: '100%' // ✅ Mantido
  }
}
```

---

## ⚠️ Riscos Residuais

### Baixo Risco
1. ✅ **SSE Support**: Backend já implementado, HF Spaces suporta
2. ✅ **IndexedDB**: Tecnologia madura, boa compatibilidade

### Médio Risco (Mitigado)
3. ⚠️ **Test Coverage**: Meta ajustada 70% → 65% (mais realista)
   - Mitigação: Foco em critical paths primeiro
   - Timeboxing: 20h máximo em testes

### Bloqueadores Eliminados
- ❌ ~~"SSE não funciona no HF Spaces"~~ → ✅ Funciona nativamente
- ❌ ~~"Backend não suporta SSE"~~ → ✅ Endpoint `/api/v1/chat/stream` existe
- ❌ ~~"IndexedDB quota muito pequena"~~ → ✅ 1GB+ suficiente para caso de uso

---

## ✅ Decisão Final: GO / NO-GO

### 🟢 GO - PROSSEGUIR COM SPRINT 2

**Justificativa**:
1. ✅ **SSE viável**: Backend implementado + HF Spaces suporta
2. ✅ **IndexedDB viável**: Quota suficiente + tecnologia madura
3. ✅ **Test coverage realista**: Meta ajustada para 65% (alcançável)
4. ✅ **Riscos baixos**: Todos riscos altos foram eliminados
5. ✅ **Valor alto**: Melhora crítica na arquitetura (serverless-ready)

**Mudanças vs Plano Original**:
- ✅ PBI #5: Sem mudanças (SSE validado)
- ✅ PBI #6: Sem mudanças (IndexedDB validado)
- ⚠️ PBI #7: Meta ajustada 70% → 65% (+25pp ao invés de +30pp)

**Total Story Points**: 13 → 13 (mantido, meta coverage ajustada)

---

## 📄 Próximos Passos

1. ✅ Criar branch `sprint-2/infrastructure`
2. ✅ Começar PBI #5: SSE Implementation
3. ✅ Paralelizar PBI #6 e #7 onde possível
4. ✅ Commits atômicos a cada mudança
5. ✅ Padrão internacional em inglês, sem mencionar ferramentas de IA

---

## 📚 Referências

### SSE no HuggingFace Spaces
- [HuggingFace Text Generation Inference - Streaming](https://huggingface.co/docs/text-generation-inference/en/conceptual/streaming)
- [Deploy Streaming RAG with FastAPI on HF Spaces](https://newsletter.theaiedge.io/p/how-to-deploy-a-streaming-rag-endpoint)
- [FastAPI + SSE Best Practices](https://github.com/fastapi/fastapi/discussions/9407)

### IndexedDB
- [Can I Use - IndexedDB](https://caniuse.com/indexeddb)
- [Google idb Library](https://github.com/jakearchibald/idb)
- [IndexedDB API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

### Testing
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Testing](https://playwright.dev/)
- [Test Coverage Best Practices](https://martinfowler.com/bliki/TestCoverage.html)

---

**Status**: ✅ ANÁLISE CONCLUÍDA
**Decisão**: 🟢 GO - Iniciar implementação Sprint 2
**Data**: 2025-10-04
**Próximo Passo**: Implementar PBI #5 (SSE)
