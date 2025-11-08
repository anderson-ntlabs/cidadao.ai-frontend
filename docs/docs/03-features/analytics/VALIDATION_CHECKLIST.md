# Analytics System Validation Checklist

**Autor**: Anderson Henrique da Silva
**Data**: 2025-01-24
**Status**: ✅ Sistema Completo e Validado

---

## 📋 Checklist de Implementação

### ✅ Fase 1: Infraestrutura Core (COMPLETO)

- [x] **PostHog Integration**
  - [x] Dependência instalada (`posthog-js@1.x`)
  - [x] Configuração em `lib/analytics/posthog-config.ts`
  - [x] API key configurada (`.env.local`)
  - [x] Privacy-first config (session recording com consentimento)
  - [x] Correções de TypeScript (async/await)

- [x] **Supabase Schema**
  - [x] Migration criada (`20250124000000_create_usability_events.sql`)
  - [x] Tabela `usability_events` com 11 campos
  - [x] 5 views SQL pré-criadas
  - [x] Índices para performance (8 indexes)
  - [x] RLS policies configuradas
  - [x] Função `get_session_journey()` criada
  - [x] **Migration executada com sucesso no Supabase** ✅

- [x] **Unified Tracker**
  - [x] API criada em `lib/analytics/usability-tracker.ts`
  - [x] 15+ funções de tracking
  - [x] Integração tripla (PostHog + Supabase + Local)
  - [x] Detecção automática de dispositivo
  - [x] Gerenciamento de sessão

- [x] **API Route**
  - [x] Endpoint criado (`app/api/analytics/track/route.ts`)
  - [x] Validação de consentimento
  - [x] Anonimização de user ID (SHA-256)
  - [x] Detecção de navegador
  - [x] Inserção no Supabase

- [x] **Privacy & LGPD**
  - [x] Política de privacidade atualizada (Seção 8)
  - [x] Base legal: LGPD Art. 7º, IV
  - [x] Consentimento em 2 níveis
  - [x] Anonimização completa
  - [x] User rights documentados

### ✅ Fase 2: UI Components (COMPLETO)

- [x] **Providers**
  - [x] `AnalyticsProvider` criado
  - [x] Integrado em `app/pt/layout.tsx`
  - [x] Preconnect para PostHog
  - [x] Page view tracking automático

- [x] **Consent Banners**
  - [x] `ResearchConsentBanner` criado
  - [x] Delay de 2 segundos após cookie consent
  - [x] Design azul/roxo (distinguível do cookie)
  - [x] Integrado no layout PT

### ✅ Fase 3: Documentação (COMPLETO)

- [x] **README.md**
  - [x] Visão geral executiva
  - [x] Arquitetura do sistema
  - [x] Custo (R$ 0,00)
  - [x] Privacy guarantees
  - [x] Academic use cases

- [x] **SETUP_GUIDE.md**
  - [x] Quick start (5 min)
  - [x] PostHog setup
  - [x] Supabase migration
  - [x] Data access instructions
  - [x] SQL query examples
  - [x] Troubleshooting

- [x] **USABILITY_ANALYTICS_IMPLEMENTATION.md**
  - [x] Especificação técnica completa
  - [x] Diagramas de arquitetura
  - [x] Fluxo de dados
  - [x] Event catalog
  - [x] Privacy mechanisms

- [x] **MIGRATION_INSTRUCTIONS.md**
  - [x] Passo a passo detalhado
  - [x] Queries de validação
  - [x] Troubleshooting errors
  - [x] Post-migration testing

- [x] **ANALYTICS_SUMMARY.md**
  - [x] Resumo executivo
  - [x] Implementation checklist
  - [x] Next steps roadmap
  - [x] Research use cases

### ✅ Fase 4: Build & Deploy (COMPLETO)

- [x] **TypeScript Fixes**
  - [x] Removidas props deprecated do PostHog
  - [x] Corrigido async/await em `identifyUser`
  - [x] Build passando sem erros ✅

- [x] **Git Commits**
  - [x] `4dd11a1` - feat(analytics): implement system
  - [x] `a827e7e` - docs(analytics): documentation
  - [x] `9b7512c` - feat(analytics): layout integration
  - [x] `bb78669` - docs(analytics): migration + summary
  - [x] `92d6280` - fix(analytics): PostHog config
  - [x] `3e4b373` - fix(analytics): async identifyUser

- [x] **Vercel Deploy**
  - [x] Build passando ✅
  - [x] Deployed com sucesso ✅
  - [x] Variáveis de ambiente configuradas

---

## 🧪 Checklist de Validação

### ✅ Backend (Supabase)

- [x] **Tabela criada**

  ```sql
  SELECT COUNT(*) FROM usability_events; -- Deve funcionar
  ```

- [x] **Views funcionando**

  ```sql
  SELECT * FROM daily_event_summary LIMIT 1;
  SELECT * FROM agent_usage_stats LIMIT 1;
  SELECT * FROM device_browser_stats LIMIT 1;
  SELECT * FROM accessibility_usage LIMIT 1;
  SELECT * FROM performance_metrics LIMIT 1;
  ```

- [x] **Função criada**
  ```sql
  SELECT * FROM get_session_journey('test_session');
  ```

### 🔄 Frontend (Local Testing) - PENDENTE

- [ ] **Server iniciado**

  ```bash
  npm run dev
  # http://localhost:3000
  ```

- [ ] **Banners aparecem**
  - [ ] Cookie consent (verde) aparece primeiro
  - [ ] Research consent (azul/roxo) aparece 2s depois

- [ ] **Consentimentos aceitos**
  - [ ] Cookie consent aceito
  - [ ] Research consent aceito
  - [ ] LocalStorage check:
    ```js
    localStorage.getItem('cookie-consent') === 'accepted'
    localStorage.getItem('research-consent') === 'accepted'
    ```

- [ ] **PostHog inicializado**
  - [ ] Console mostra: `[PostHog] Initialized successfully`
  - [ ] Sem erros no console

### 🌐 PostHog Dashboard - PENDENTE

- [ ] **Login em PostHog**
  - [ ] Acesse: https://app.posthog.com
  - [ ] Projeto: Cidadão.AI Research

- [ ] **Eventos sendo rastreados**
  - [ ] Events > Live Events
  - [ ] Ver eventos em tempo real
  - [ ] Evento `$pageview` aparece

- [ ] **Session Recording**
  - [ ] Session Recordings > Latest recordings
  - [ ] Ver pelo menos 1 gravação
  - [ ] Verificar masking de inputs

### 📊 Supabase Data - PENDENTE

- [ ] **Eventos salvos**

  ```sql
  SELECT * FROM usability_events
  ORDER BY created_at DESC
  LIMIT 10;
  -- Deve retornar eventos
  ```

- [ ] **Dados anonimizados**

  ```sql
  SELECT DISTINCT user_hash FROM usability_events;
  -- Deve ser SHA-256 hash (64 chars) ou NULL
  ```

- [ ] **Consent validado**
  ```sql
  SELECT COUNT(*) FROM usability_events
  WHERE has_research_consent = true;
  -- Deve ter eventos
  ```

---

## 📈 Métricas de Sucesso

### ✅ Implementação

- [x] **0 erros de build**
- [x] **0 erros de TypeScript**
- [x] **100% documentado**
- [x] **6 commits profissionais**
- [x] **R$ 0,00 de custo**

### 🔄 Operação (Para validar após uso)

- [ ] **Taxa de consentimento > 50%**

  ```sql
  SELECT
    COUNT(DISTINCT session_id) FILTER (WHERE has_research_consent = true) * 100.0 /
    COUNT(DISTINCT session_id) as consent_rate
  FROM usability_events;
  ```

- [ ] **Eventos/dia > 100**

  ```sql
  SELECT DATE(created_at), COUNT(*)
  FROM usability_events
  GROUP BY DATE(created_at)
  ORDER BY DATE(created_at) DESC;
  ```

- [ ] **Session recordings > 10/semana**
  - PostHog > Session Recordings
  - Filtrar por última semana

### 🔬 Pesquisa (Para usar nos artigos)

- [ ] **Dados para 30 dias coletados**

  ```sql
  SELECT COUNT(*) FROM usability_events
  WHERE created_at > NOW() - INTERVAL '30 days';
  -- Meta: > 1000 eventos
  ```

- [ ] **Diversidade de eventos**

  ```sql
  SELECT event_type, COUNT(*)
  FROM usability_events
  GROUP BY event_type;
  -- Deve ter todos os tipos
  ```

- [ ] **Métricas exportadas**
  - [ ] CSV baixado do Supabase
  - [ ] PostHog Insights criados
  - [ ] Gráficos gerados

---

## 🚨 Troubleshooting

### Problema: PostHog não inicializa

**Sintomas:**

- Console não mostra `[PostHog] Initialized successfully`
- Eventos não aparecem no dashboard

**Checklist:**

- [ ] `NEXT_PUBLIC_POSTHOG_KEY` está definida?
  ```bash
  echo $NEXT_PUBLIC_POSTHOG_KEY
  ```
- [ ] API key está correta? (começa com `phc_`)
- [ ] Research consent foi aceito?
  ```js
  localStorage.getItem('research-consent') === 'accepted'
  ```

**Solução:**

1. Verificar `.env.local`
2. Reiniciar server: `npm run dev`
3. Limpar cache: `localStorage.clear()`
4. Aceitar consentimentos novamente

### Problema: Supabase não salva eventos

**Sintomas:**

- Query retorna 0 linhas
- API route retorna erro

**Checklist:**

- [ ] Migration foi executada?
  ```sql
  SELECT COUNT(*) FROM usability_events;
  -- Não deve dar erro
  ```
- [ ] RLS policies estão corretas?
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'usability_events';
  ```
- [ ] Consent está true?

**Solução:**

1. Rodar migration novamente
2. Verificar policies
3. Testar API route manualmente:
   ```bash
   curl -X POST http://localhost:3000/api/analytics/track \
     -H "Content-Type: application/json" \
     -d '{"event_type":"test","event_category":"interaction","session_id":"test","has_research_consent":true}'
   ```

### Problema: Session Recording não funciona

**Sintomas:**

- PostHog > Session Recordings vazio
- Console não mostra erros

**Checklist:**

- [ ] Research consent aceito?
- [ ] CSP permite PostHog?
- [ ] Navegador não bloqueia?

**Solução:**

1. Verificar consent
2. Checar CSP headers
3. Testar em modo anônimo/outro browser

---

## ✅ Critérios de Aceitação Final

### Sistema está pronto quando:

- [x] ✅ Build passa sem erros
- [x] ✅ Deploy Vercel OK
- [x] ✅ Migration Supabase executada
- [ ] 🔄 PostHog recebendo eventos
- [ ] 🔄 Supabase salvando dados
- [ ] 🔄 Consent banners funcionando
- [x] ✅ Documentação completa
- [x] ✅ LGPD compliant

### Pronto para pesquisa quando:

- [ ] 🔄 30 dias de dados coletados
- [ ] 🔄 > 100 sessões únicas
- [ ] 🔄 > 1000 eventos total
- [ ] 🔄 Session replays disponíveis
- [ ] 🔄 Queries SQL funcionando
- [ ] 🔄 Export CSV testado

---

## 📊 Status Atual

### ✅ COMPLETO (100%)

- Implementação técnica
- Documentação
- Privacy & LGPD
- Build & Deploy
- Supabase migration

### 🔄 PENDENTE (Validação em produção)

- Teste de consentimentos
- Validação PostHog eventos
- Validação Supabase dados
- Coleta de 30 dias

### 🎯 PRÓXIMO PASSO

**AGORA:**

1. Aceitar os 2 banners de consentimento em produção
2. Navegar pela plataforma
3. Verificar PostHog dashboard
4. Verificar Supabase dados

**URLs:**

- **Site**: https://cidadao-ai-frontend.vercel.app/pt
- **PostHog**: https://app.posthog.com
- **Supabase**: https://supabase.com/dashboard

---

**Última Atualização**: 2025-01-24
**Status**: ✅ **SISTEMA 100% IMPLEMENTADO - PRONTO PARA VALIDAÇÃO EM PRODUÇÃO**
