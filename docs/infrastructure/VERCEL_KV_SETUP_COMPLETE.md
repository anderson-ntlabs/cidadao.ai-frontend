# 🗄️ Vercel KV Setup - Guia Completo

**Data:** 06 de outubro de 2025
**Autor:** Anderson Henrique da Silva
**Status:** Pronto para configuração

---

## 📋 Resumo

Vercel KV (Redis) para cache distribuído. Implementação já está completa no código, apenas requer provisionar o database na Vercel.

---

## ✅ O QUE JÁ ESTÁ IMPLEMENTADO

### 1. Biblioteca Instalada
```json
// package.json
"@vercel/kv": "^3.0.0"
```

### 2. Serviços Implementados

**Multi-Layer Cache:**
```typescript
// lib/cache/multi-layer-cache.service.ts
✅ L1: Memory Cache (in-memory)
✅ L2: IndexedDB (browser persistent)
✅ L3: Vercel KV (distributed Redis)
```

**KV Service:**
```typescript
// lib/cache/kv-cache.service.ts
✅ get<T>(key: string)
✅ set<T>(key: string, value: T, ttl?: number)
✅ delete(key: string)
✅ clear() - Clear all keys
```

**Métricas:**
```typescript
// lib/monitoring/metrics.service.ts
✅ trackCacheHit()
✅ trackCacheMiss()
✅ getCacheMetrics()
```

---

## 🚀 SETUP PASSO A PASSO

### Passo 1: Provisionar Vercel KV (5 minutos)

1. **Acessar Vercel Dashboard:**
   ```
   https://vercel.com/dashboard
   ```

2. **Ir para Storage:**
   - No menu lateral: **Storage** tab
   - Ou: https://vercel.com/dashboard/stores

3. **Create Database:**
   - Clique em **"Create Database"**
   - Selecione **"KV"** (Redis)

4. **Configurar Database:**
   ```
   Database Name: cidadao-ai-kv-production
   Region: iad1 (US East - Washington DC)

   Pricing: Free tier
   - 30,000 commands/month
   - 256 MB storage
   - Suficiente para começar!
   ```

5. **Create:**
   - Clique em "Create"
   - Aguarde ~30 segundos para provisionar

### Passo 2: Link ao Projeto (2 minutos)

1. **Connect to Project:**
   - Após criar, clique em "Connect to Project"
   - Selecione: **cidadao-ai-frontend**
   - Environment: **Production** (apenas Production!)

2. **Confirm:**
   - Vercel automaticamente adiciona as env vars:
     ```
     KV_REST_API_URL
     KV_REST_API_TOKEN
     KV_REST_API_READ_ONLY_TOKEN
     ```

3. **Verificar Variáveis:**
   - Vá em Settings → Environment Variables
   - Confirme que as 3 variáveis foram adicionadas
   - Scope deve ser "Production"

### Passo 3: Redeploy (2 minutos)

1. **Trigger Deploy:**
   - Deployments → Último deployment
   - Clique nos 3 pontinhos (...)
   - "Redeploy"

2. **Aguardar:**
   - Build ~2-3 minutos
   - Verifique "Ready"

---

## ✅ VALIDAÇÃO

### Teste 1: Verificar Conexão

```bash
# Após redeploy, verificar logs
vercel logs [deployment-url] --since 5m

# Procurar por:
✅ "[KV] Connected successfully"
❌ "[KV] Connection failed"
```

### Teste 2: Dashboard KV

1. **Acessar KV Dashboard:**
   ```
   Vercel Dashboard → Storage → cidadao-ai-kv-production
   ```

2. **Verificar Métricas:**
   - Commands: Deve começar a subir
   - Storage: Deve mostrar uso
   - Keys: Deve mostrar chaves criadas

### Teste 3: Cache na Aplicação

```javascript
// No browser console (produção):

// 1. Fazer request que usa cache
fetch('/api/agents')

// 2. Fazer de novo (deve vir do cache)
fetch('/api/agents')

// 3. Verificar no Network tab:
// - Primeira request: tempo normal
// - Segunda request: <100ms (vindo do cache!)
```

---

## 📊 O QUE SERÁ CACHED

### Dados Automáticos

**Chat Responses:**
```typescript
Key: chat:message:[hash]
TTL: 5 minutos
Uso: Respostas repetidas
```

**Agent Suggestions:**
```typescript
Key: suggestions:[context]
TTL: 1 hora
Uso: Sugestões de perguntas
```

**Investigation Data:**
```typescript
Key: investigation:[id]
TTL: 24 horas
Uso: Dados de investigações
```

**API Responses:**
```typescript
Key: api:[endpoint]:[params]
TTL: Variável (5m - 24h)
Uso: Respostas do backend
```

---

## 🎯 ARQUITETURA DO CACHE

### Multi-Layer Strategy

```
User Request
     ↓
[L1: Memory Cache]  ← 0ms latency, ephemeral
     ↓ (miss)
[L2: IndexedDB]     ← 5ms latency, browser persistent
     ↓ (miss)
[L3: Vercel KV]     ← 50ms latency, distributed
     ↓ (miss)
[Backend API]       ← 300ms+ latency
     ↓
Cache & Return
```

### Benefícios

1. **L1 (Memory):**
   - ⚡ Ultra-rápido (0ms)
   - 🔄 Dentro da sessão

2. **L2 (IndexedDB):**
   - 💾 Persistente no browser
   - 🌐 Funciona offline
   - 📱 Específico do dispositivo

3. **L3 (Vercel KV):**
   - 🌍 Compartilhado entre usuários
   - 🚀 Edge network (baixa latência)
   - 💪 Scalable

---

## 📈 MÉTRICAS ESPERADAS

### Performance Gains

**Sem Cache:**
```
API Response Time: 300-500ms
Database Queries: Múltiplas por request
Server Load: Alto
```

**Com KV Cache:**
```
Cache Hit Response: 20-50ms (10x mais rápido!)
Hit Rate Target: >60%
Server Load: -70%
```

### Free Tier Limits

```
Commands: 30,000/mês
Storage: 256 MB
Connections: Unlimited

Estimativa de uso:
- 1,000 usuários/dia
- 10 requests/usuário
- 10,000 commands/dia
- ~20,000-25,000 commands/mês

✅ Dentro do free tier!
```

---

## 🔧 CONFIGURAÇÃO AVANÇADA

### Cache TTLs (já configurado no código)

```typescript
// lib/cache/cache-config.ts

export const CACHE_TTL = {
  SHORT: 5 * 60,        // 5 minutos - queries dinâmicas
  MEDIUM: 60 * 60,      // 1 hora - dados semi-estáticos
  LONG: 24 * 60 * 60,   // 24 horas - dados estáticos
  WEEK: 7 * 24 * 60 * 60, // 1 semana - configs
};
```

### Cache Invalidation

```typescript
// Manual invalidation (se necessário)

// Via API:
DELETE /api/cache/clear?pattern=investigation:*

// Via código:
await kvCache.delete('investigation:123');
await kvCache.clear(); // Clear all (use com cuidado!)
```

---

## 🎛️ MONITORING

### Dashboard Metrics

**Vercel KV Dashboard mostra:**
- ✅ Command rate (req/s)
- ✅ Storage usage (MB)
- ✅ Connection count
- ✅ Error rate

### Custom Metrics API

```typescript
// GET /api/monitoring/dashboard

{
  cache: {
    hitRate: 0.65,      // 65% hit rate
    missRate: 0.35,
    totalHits: 1250,
    totalMisses: 450,
    avgLatency: 45      // ms
  }
}
```

### Alertas Recomendados

```
❌ Hit rate < 40%
   → Revisar estratégia de cache

❌ Latency > 100ms
   → Verificar região do KV

❌ Error rate > 1%
   → Investigar connection issues
```

---

## 🔧 TROUBLESHOOTING

### KV Connection Failed

```bash
Erro: Cannot connect to Vercel KV

Causas:
1. ❌ Env vars não configuradas
2. ❌ Vars estão em "Preview" não "Production"
3. ❌ Database não linkado ao projeto
4. ❌ Região incompatível

Solução:
✅ Verificar KV_REST_API_URL existe
✅ Verificar KV_REST_API_TOKEN existe
✅ Re-link database ao projeto
✅ Redeploy
```

### Cache Hit Rate Baixo (<40%)

```bash
Possíveis causas:
1. TTL muito curto
2. Keys não sendo reutilizadas
3. Cache warming não acontecendo

Solução:
✅ Aumentar TTLs
✅ Revisar key generation
✅ Pré-popular cache de dados comuns
```

### Storage Full (256 MB)

```bash
Solução curto prazo:
✅ Reduzir TTLs
✅ Limpar keys antigas manualmente
✅ Implementar LRU eviction

Solução longo prazo:
✅ Upgrade para Paid tier
✅ 1 GB storage ($15/mês)
```

---

## 💰 PRICING

### Free Tier (Current)
```
Price: $0/mês
Commands: 30,000/mês
Storage: 256 MB
Support: Community

✅ Suficiente para MVP e primeiros 500 usuários
```

### Pro Tier (Future)
```
Price: $15/mês
Commands: 1,000,000/mês
Storage: 1 GB
Support: Email

✅ Upgrade quando atingir ~3,000 usuários ativos/dia
```

### Enterprise
```
Price: Custom
Commands: Unlimited
Storage: Custom
Support: 24/7

✅ Apenas para scale massivo (100k+ usuários)
```

---

## 🎉 BENEFÍCIOS ESPERADOS

### Performance
- ⚡ 10x faster response times
- 📉 70% reduction em backend load
- 🚀 Melhor UX (loading mais rápido)

### Cost Optimization
- 💰 Menos requests ao backend (economia HuggingFace)
- 📉 Menos database queries
- ⚡ Edge caching (geograficamente distribuído)

### Scalability
- 📈 Suporta mais usuários simultâneos
- 🌍 Global distribution
- 💪 Auto-scaling do Redis

---

## 📚 RECURSOS

### Documentação
- [Vercel KV Docs](https://vercel.com/docs/storage/vercel-kv)
- [Redis Commands](https://redis.io/commands/)
- [Best Practices](https://vercel.com/docs/storage/vercel-kv/kv-best-practices)

### Dashboards
- KV Dashboard: https://vercel.com/dashboard/stores
- Metrics API: /api/monitoring/dashboard
- Vercel Analytics: https://vercel.com/analytics

---

## ✅ CHECKLIST DE CONCLUSÃO

- [ ] Vercel KV database criado
- [ ] Nome: cidadao-ai-kv-production
- [ ] Region: iad1 (US East)
- [ ] Linked ao projeto cidadao-ai-frontend
- [ ] Env vars adicionadas automaticamente:
  - [ ] KV_REST_API_URL
  - [ ] KV_REST_API_TOKEN
  - [ ] KV_REST_API_READ_ONLY_TOKEN
- [ ] Scope: Production
- [ ] Redeploy realizado
- [ ] Logs mostram conexão bem-sucedida
- [ ] Dashboard KV mostra commands
- [ ] Cache hit rate >50%

**Quando todos marcados:** 🎉 VERCEL KV 100% OPERACIONAL!

---

**Documentado em:** 06/10/2025 13:50 -03
**Última atualização:** Aguardando setup
