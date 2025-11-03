# PLANO DE IMPLEMENTAÇÃO - CIDADÃO.AI FRONTEND

## Melhorias Baseadas em Análise de Navegação Assistida por IA

---

**Data:** 2025-10-06 17:58:22 -03
**Autor:** Anderson Henrique da Silva
**Versão:** 2.0 (Revisão Crítica)
**Status:** Draft para Aprovação
**Última Atualização:** 2025-10-06 19:45:00 -03

---

## 🔄 CHANGELOG V2.0 - REVISÃO CRÍTICA

### O que mudou da v1.0 para v2.0?

#### ✅ CORREÇÕES CRÍTICAS

1. **Status dos Componentes Corrigido**
   - ❌ v1.0: Notificações "100% COMPLETO"
   - ✅ v2.0: Notificações "90% COMPLETO" (faltam 4h de integração API)
   - ❌ v1.0: Chat History "100% COMPLETO"
   - ✅ v2.0: Chat History "80% COMPLETO" (faltam 6h de integração Supabase)

2. **Estimativas Realistas**
   - ❌ v1.0: Total 316h (~40 dias)
   - ✅ v2.0: Total 170h (~21 dias) + 28h buffer = **198h (~25 dias)**
   - Ajustes principais:
     - PWA fix: 2h → 4h
     - Agent Badge: 3h → 6h
     - Dashboard Charts: 16h → 24h
     - Modal Investigação: 8h → 20h
     - Busca Global: 12h → 24h

#### ➕ ADIÇÕES IMPORTANTES

3. **Sprint 0 Adicionado** (2-3 dias)
   - Coletar métricas baseline (4h)
   - Criar documento baseline (2h)
   - Preparar ambiente dev (4h)
   - Mapear endpoints backend (2h)

4. **Integrações Backend Detalhadas**
   - Endpoint `/api/v1/dashboard/stats` especificado
   - Endpoint `/api/v1/notifications` especificado
   - Schema Supabase `chat_sessions` definido
   - Código de integração completo fornecido

5. **Planos de Contingência**
   - Se backend atrasar: usar mocks + banner "Demo Mode"
   - Se Recharts falhar: testar Nivo ou SVG custom
   - Se modal pesado: lazy load tabs + pagination
   - Se Supabase down: fallback localStorage automático

6. **Critérios de Teste Rigorosos**
   - Testes unitários (80% coverage mínimo)
   - Testes de integração (MSW)
   - Testes E2E (Playwright) para fluxos críticos
   - Testes manuais (4 browsers + dark mode)
   - Performance benchmarks (Lighthouse > 90)
   - Core Web Vitals definidos

#### 📊 COMPARAÇÃO DE ESFORÇO

| Categoria     | v1.0    | v2.0     | Diferença |
| ------------- | ------- | -------- | --------- |
| Quick Wins    | 13h     | 18h      | +5h       |
| Core Features | 28h     | 64h      | +36h      |
| Nice to Have  | 48h     | 60h      | +12h      |
| Buffer        | 0h      | 28h      | +28h      |
| **TOTAL**     | **89h** | **170h** | **+81h**  |

**Razão:** v1.0 subestimou complexidade de integrações backend e testes

#### 🎯 IMPACTO NO TIMELINE

- ❌ v1.0: 10 semanas (otimista demais)
- ✅ v2.0: 5-6 semanas (realista com 1 dev full-time)

#### 💡 MELHORIAS DE QUALIDADE

- ✅ Honestidade brutal sobre status real
- ✅ Código completo de integração (copy-paste ready)
- ✅ Fallbacks para todos riscos principais
- ✅ Critérios de qualidade rigorosos
- ✅ Sprint 0 para baseline científico

---

## 📋 SUMÁRIO EXECUTIVO

Este documento apresenta um plano detalhado de implementação para todas as melhorias identificadas através de análise assistida por IA navegacional do sistema Cidadão.AI em produção.

### Contexto da Análise

- **Método:** Navegação assistida por IA com captura de screenshots e análise de comportamento
- **URL Analisada:** https://cidadao-ai-frontend.vercel.app/pt
- **Áreas Cobertas:** Landing page, Login, Dashboard, Chat, Investigações, Agentes
- **Total de Melhorias Identificadas:** 30 categorias principais
- **Prioridade:** Crítica a Baixa

### Avaliação Atual do Sistema

| Critério               | Nota       | Status                    |
| ---------------------- | ---------- | ------------------------- |
| Conceito e Relevância  | 10/10      | ✅ Excepcional            |
| Design Visual          | 8.5/10     | ✅ Profissional           |
| Funcionalidade Core    | 7.5/10     | ⚠️ Incompleta             |
| Experiência do Usuário | 7.0/10     | ⚠️ Com fricções           |
| Performance            | 8.0/10     | ✅ Boa                    |
| Inovação Tecnológica   | 9.5/10     | ✅ Destaque               |
| **MÉDIA GERAL**        | **8.2/10** | **BOM COM OPORTUNIDADES** |

---

## 📊 MAPEAMENTO TÉCNICO: COMPONENTES EXISTENTES VS MELHORIAS

### Componentes Já Implementados ✅

#### 1. Sistema de Notificações (90% COMPLETO)

**Arquivos:**

- `components/ui/notification-dropdown.tsx` - Dropdown funcional com polling 30s
- `components/ui/notification-item.tsx` - Item individual
- `components/ui/notification-badge.tsx` - Badge contador
- `store/notification-store.ts` - Zustand store com persistência
- `app/pt/(authenticated)/notificacoes/page.tsx` - Página dedicada

**Funcionalidades Implementadas:**

- ✅ Dropdown com últimas 5 notificações
- ✅ Badge com contador não lidas
- ✅ Polling automático 30s
- ✅ Marcar como lida (individual e em massa)
- ✅ Link para página dedicada
- ✅ Sistema de preferências completo
- ✅ Notificações desktop (Web API)
- ✅ Sons de notificação
- ✅ Categorização por tipo e prioridade

**Faltando (10%):**

- ❌ Integração com API real (4h - detalhado em Sprint 2)
  - Substituir `generateDemoNotifications()` por endpoint `/api/v1/notifications`
  - Implementar WebSocket para notificações em tempo real (opcional)
  - Testar com dados reais do backend

#### 2. Histórico de Chat (80% COMPLETO)

**Arquivos:**

- `components/chat/chat-history-sidebar.tsx` - Sidebar lateral completo
- `lib/services/chat-session.service.ts` - Serviço de gerenciamento

**Funcionalidades Implementadas:**

- ✅ Sidebar deslizante da esquerda
- ✅ Lista de conversas anteriores
- ✅ Formatação de timestamps
- ✅ Deletar conversas
- ✅ Seleção de sessão
- ✅ Skeletons loading
- ✅ Estado vazio

**Faltando (20%):**

- ❌ Integração com Supabase (6h - detalhado em Sprint 2)
  - Criar tabela `chat_sessions` no Supabase
  - Implementar CRUD operations via `chat-session.service.ts`
  - Migrar de localStorage para Supabase
  - Adicionar sincronização automática
- ❌ Exportar conversa como PDF (4h - Sprint 4)

#### 3. Componentes de UI Base (COMPLETO)

**Arquivos:**

- `components/ui/skeleton.tsx` - Skeletons para loading states
- `components/ui/tooltip.tsx` - Tooltips acessíveis
- `components/ui/modal.tsx` - Modais reutilizáveis
- `components/ui/tabs.tsx` - Sistema de tabs
- `components/ui/badge.tsx` - Badges de status
- `components/ui/glass-card.tsx` - Cards com glass morphism
- `components/ui/button.tsx` - Botões v1 e v2
- `components/ui/card.tsx` - Cards básicos

**Status:** DESIGN SYSTEM COMPLETO

#### 4. Dashboard (PARCIAL - 60%)

**Arquivos:**

- `app/pt/(authenticated)/dashboard/page-v3.tsx` - Versão atual em produção

**Implementado:**

- ✅ 4 cards estatísticos (Total Analisado, Contratos, Anomalias, Agentes)
- ✅ 2 gráficos (AreaChart e PieChart) com lazy loading
- ✅ Lista de investigações recentes
- ✅ Filtros de período (7d, 30d, 90d)
- ✅ Botões de ação (Refresh, Filtro, Exportar)
- ✅ Background com tema Operários

**Faltando (40%):**

- ❌ Gráficos não são interativos (sem tooltips detalhados)
- ❌ Exportar não funciona
- ❌ Filtros não afetam dados
- ❌ Dados são mock estáticos
- ❌ Sem drill-down em investigações
- ❌ Sem comparação de períodos
- ❌ Sem gráfico de linha temporal
- ❌ Sem indicadores de tendência

### Componentes a Criar/Melhorar ⚠️

#### 1. CRÍTICO: PWA Install Prompt

**Arquivo:** `components/install-pwa.tsx`

**Problema Atual:**

```typescript
// linha 14 - ABRE IMEDIATAMENTE
setShowInstallPrompt(true)
```

**Solução Necessária:**

```typescript
// Adicionar delay de 30s + conversão modal→banner
setTimeout(() => {
  setShowInstallPrompt(true)
}, 30000)
```

**Estimativa:** 2h

#### 2. CRÍTICO: Identificação de Agente no Chat

**Arquivo:** Novo - `components/chat/agent-badge.tsx`

**Necessário:**

- Badge flutuante mostrando qual agente está respondendo
- Avatar do agente
- Nome completo
- Especialidade
- Animação de entrada

**Código Exemplo:**

```tsx
interface AgentBadgeProps {
  agentId: string
  agentName: string
  avatar: string
  specialty: string
}

export function AgentBadge({ agentId, agentName, avatar, specialty }: AgentBadgeProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
      <OptimizedAvatar src={avatar} alt={agentName} size="md" />
      <div>
        <p className="font-semibold text-sm">{agentName}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">{specialty}</p>
      </div>
    </div>
  )
}
```

**Estimativa:** 3h

#### 3. ALTA: Modal de Detalhes da Investigação

**Arquivo:** Novo - `components/dashboard/investigation-detail-modal.tsx`

**Necessário:**

- Modal grande com tabs
- Tab "Resumo": Dados principais, status, agentes envolvidos
- Tab "Linha do Tempo": Eventos cronológicos
- Tab "Documentos": Anexos e evidências
- Tab "Análise": Insights dos agentes
- Botões de ação: Exportar, Compartilhar, Arquivar

**Estrutura:**

```tsx
interface Investigation {
  id: string
  title: string
  description: string
  status: 'pending' | 'analyzing' | 'completed' | 'archived'
  value: string
  startDate: Date
  endDate?: Date
  agents: Agent[]
  timeline: TimelineEvent[]
  documents: Document[]
  insights: Insight[]
  anomalyScore?: number
}

export function InvestigationDetailModal({
  investigation,
  isOpen,
  onClose,
}: InvestigationDetailModalProps) {
  // Implementação com Tabs UI
}
```

**Estimativa:** 8h

#### 4. ALTA: Dashboard - Gráficos Interativos

**Arquivo:** Modificar `app/pt/(authenticated)/dashboard/page-v3.tsx`

**Melhorias Necessárias:**

```tsx
// Adicionar tooltips customizados
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <GlassCard className="p-3">
        <p className="font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </GlassCard>
    )
  }
  return null
}

// Adicionar legendas interativas
const CustomLegend = ({ payload }) => {
  return (
    <div className="flex gap-4 justify-center">
      {payload.map((entry, index) => (
        <button
          key={index}
          className="flex items-center gap-2 hover:opacity-70"
          onClick={() => toggleDataKey(entry.dataKey)}
        >
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-sm">{entry.value}</span>
        </button>
      ))}
    </div>
  )
}
```

**Estimativa:** 6h

#### 5. MÉDIA: Filtros de Investigação

**Arquivo:** Novo - `components/investigacoes/investigation-filters.tsx`

**Funcionalidades:**

- Filtro por status (pendente, análise, concluída, arquivada)
- Filtro por período (data início/fim)
- Filtro por valor (range mínimo/máximo)
- Filtro por agente responsável
- Filtro por score de anomalia (0-1)
- Busca por texto livre

**Estimativa:** 8h

#### 6. MÉDIA: Busca Global

**Arquivo:** Novo - `components/header/global-search.tsx`

**Funcionalidades:**

- Input com ⌘K (Cmd+K) shortcut
- Busca em: Investigações, Agentes, Documentos, Conversas
- Resultados agrupados por categoria
- Preview de cada resultado
- Navegação por teclado (arrow keys)
- Destaque de termos encontrados
- Histórico de buscas recentes

**Estimativa:** 12h

### Análise de Completude por Área (ATUALIZADA)

| Área                    | Completo | Em Progresso              | Faltando                              | % Completo |
| ----------------------- | -------- | ------------------------- | ------------------------------------- | ---------- |
| Sistema de Notificações | 90%      | API integration (4h)      | -                                     | 90%        |
| Chat & Histórico        | 80%      | Supabase integration (6h) | Identificação agente (6h)             | 80%        |
| Dashboard               | 60%      | Gráficos básicos          | Interatividade (24h) + API (6h)       | 60%        |
| Investigações           | 40%      | Lista básica              | Filtros (10h) + modal (20h)           | 40%        |
| Busca & Navegação       | 20%      | Navegação básica          | Busca global (24h) + breadcrumbs (4h) | 20%        |
| PWA & Onboarding        | 70%      | PWA instalado             | Prompt fix (4h) + tour (8h)           | 70%        |
| Exportação & Relatórios | 10%      | -                         | Sistema completo (40h+)               | 10%        |
| **MÉDIA GERAL**         |          |                           |                                       | **54%**    |

**Nota:** Estimativas entre parênteses são horas de trabalho necessárias para completar.

### Priorização por ROI (Return on Investment) - ESTIMATIVAS REALISTAS

#### ROI ALTO (Quick Wins)

1. **PWA Install Prompt Fix** - ~~2h~~ **4h** (incluindo testes multi-browser + mobile)
2. **Agent Badge no Chat** - ~~3h~~ **6h** (integrar em v1 + v3 + testes)
3. **Tooltips em Gráficos** - **4h** (mantido)
4. **Loading States Consistentes** - **4h** (mantido)

**Total Quick Wins:** ~~13h~~ **18h (~2.2 dias)**

#### ROI MÉDIO (Core Features)

1. **Investigation Detail Modal** - ~~8h~~ **20h** (tabs + timeline + PDF + testes)
2. **Dashboard Interactive Charts** - ~~6h~~ **24h** (incluindo backend endpoint + cache)
3. **Investigation Filters** - ~~8h~~ **10h** (adicionado range slider complexo)
4. **Chat History Supabase Integration** - ~~6h~~ **6h** (mantido)
5. **Notifications API Integration** - **4h** (novo - estava omitido)

**Total Core Features:** ~~28h~~ **64h (~8 dias)**

#### ROI BAIXO (Nice to Have)

1. **Global Search** - ~~12h~~ **24h** (cmdk + indexação + performance)
2. **Custom Reports** - **20h** (mantido)
3. **Advanced Analytics** - **16h** (mantido)

**Total Nice to Have:** ~~48h~~ **60h (~7.5 dias)**

**BUFFER DE CONTINGÊNCIA:** +20% = **28h adicionais**
**TOTAL GERAL:** 18h + 64h + 60h + 28h = **170h (~21 dias úteis)**

---

## 🎯 OBJETIVOS DO PLANO

### Objetivo Principal

Elevar a experiência do usuário de **8.2/10 para 9.5+/10** através da implementação sistemática de melhorias identificadas, priorizando impacto e viabilidade.

### Objetivos Específicos

1. **Eliminar Fricções Críticas** - Corrigir problemas que impedem uso adequado
2. **Completar Funcionalidades** - Finalizar features iniciadas mas incompletas
3. **Polimento de UX** - Adicionar microinterações e feedback visual
4. **Escalar Adoção** - Preparar sistema para crescimento de usuários
5. **Inovação Contínua** - Adicionar features diferenciadas

---

## 📊 ANÁLISE DA CODEBASE ATUAL

### Estrutura de Arquivos (Resumo)

```
cidadao.ai-frontend/
├── app/
│   ├── pt/                    # Rotas em português
│   │   ├── (authenticated)/   # Rotas protegidas
│   │   │   ├── dashboard/     # ✅ Dashboard (v1, v3 via feature flag)
│   │   │   ├── chat/          # ✅ Chat (v1, v3 via feature flag)
│   │   │   ├── investigacoes/ # ⚠️ Investigações (detalhes incompletos)
│   │   │   ├── perfil/        # ✅ Perfil
│   │   │   └── notificacoes/  # ⚠️ Notificações (dropdown não funcional)
│   │   ├── login/             # ✅ Login
│   │   ├── about/             # ✅ Sobre
│   │   ├── agents/            # ✅ Agentes
│   │   └── manifesto/         # ✅ Manifesto
│   ├── en/                    # Rotas em inglês (espelho)
│   └── api/                   # API routes
│       ├── edge/chat/         # ✅ Chat edge function
│       ├── metrics/           # ✅ Métricas
│       └── test-backend/      # 🔧 Teste backend
├── components/
│   ├── ui/                    # ✅ Componentes UI base
│   │   ├── button.tsx         # ✅ Completo + testes
│   │   ├── modal.tsx          # ✅ Completo + testes
│   │   ├── card.tsx           # ✅ Completo + testes
│   │   ├── badge.tsx          # ✅ Completo + testes
│   │   ├── tabs.tsx           # ✅ Completo
│   │   └── ...                # Outros componentes
│   ├── chat/                  # ✅ Componentes de chat
│   ├── onboarding/            # ✅ Tour guiado
│   ├── install-pwa.tsx        # ⚠️ CRÍTICO: Auto-abre (invasivo)
│   └── ...
├── lib/
│   ├── api/                   # ✅ Adapters de API
│   │   ├── chat-adapter-*.ts  # ✅ Múltiplos adapters
│   │   └── auth.service.ts    # ✅ Autenticação
│   ├── services/              # Serviços
│   │   ├── smart-chat.service.ts        # ✅ Roteamento inteligente
│   │   ├── chat-cache*.service.ts       # ✅ Cache (memória + IDB)
│   │   ├── investigation.service.ts     # ⚠️ Básico
│   │   └── profile.service.ts           # ✅ Perfil
│   ├── supabase/              # ✅ Supabase client
│   └── utils/                 # ✅ Utilitários
├── store/                     # ✅ Zustand stores
│   ├── chat-store.ts          # ✅ Chat state
│   └── notification-store.ts  # ✅ Notificações
└── data/
    └── agents.ts              # ✅ 17 agentes definidos
```

### Componentes Já Implementados ✅

1. **Sistema de Design Completo**
   - Button, Card, Modal, Badge, Tabs, Input, Tooltip
   - Testes unitários: 954/1001 (95.3%)
   - Dark/Light mode
   - Responsividade

2. **Chat Multi-Adapter**
   - Backend, SSE, Fallback, Optimized
   - Smart routing com fallback automático
   - Cache em memória + IndexedDB
   - Sugestões de perguntas

3. **Autenticação**
   - OAuth (Google, GitHub)
   - Supabase integration
   - Session management

4. **PWA**
   - Service worker
   - Offline support
   - Install prompt (⚠️ invasivo)

### Componentes Incompletos ⚠️

1. **Dashboard**
   - ❌ Gráficos aparecem vazios (placeholders)
   - ❌ "Ações Rápidas" sem labels
   - ❌ Tooltips faltando nas métricas

2. **Chat**
   - ❌ Não identifica agente que respondeu
   - ❌ Sem histórico de conversas
   - ❌ Sem typing indicator

3. **Investigações**
   - ❌ Botão "Detalhes" não abre modal
   - ❌ Filtros não funcionais
   - ❌ Sem exportação

4. **Notificações**
   - ❌ Dropdown não implementado
   - ❌ Badge conta mas não lista

### Componentes Não Existentes ❌

1. Busca Global (Ctrl+K)
2. Modal de Detalhes de Investigação
3. Histórico de Chat (Sidebar)
4. Relatórios Customizáveis
5. Alertas Personalizados
6. API Pública
7. Comparador de Contratos

---

## 🔥 PRIORIZAÇÃO: MATRIZ DE IMPACTO vs ESFORÇO

### Legenda

- **Impacto:** ⭐⭐⭐ Alto | ⭐⭐ Médio | ⭐ Baixo
- **Esforço:** 🔨 Baixo (< 8h) | 🔨🔨 Médio (8-24h) | 🔨🔨🔨 Alto (> 24h)

### QUADRANTE 1: Quick Wins (Alto Impacto + Baixo Esforço) 🎯

| #            | Melhoria                                    | Impacto | Esforço | Estimativa       |
| ------------ | ------------------------------------------- | ------- | ------- | ---------------- |
| 1            | Ajustar PWA install prompt (não auto-abrir) | ⭐⭐⭐  | 🔨      | 2h               |
| 2            | Adicionar identificação de agente no chat   | ⭐⭐⭐  | 🔨      | 4h               |
| 3            | Tooltips explicativos nas métricas          | ⭐⭐    | 🔨      | 4h               |
| 4            | Loading states em botões                    | ⭐⭐    | 🔨      | 4h               |
| 5            | Skeleton screens durante carregamento       | ⭐⭐    | 🔨      | 6h               |
| 6            | Breadcrumbs em páginas internas             | ⭐⭐    | 🔨      | 4h               |
| **TOTAL Q1** |                                             |         |         | **24h (3 dias)** |

### QUADRANTE 2: Projetos Principais (Alto Impacto + Médio Esforço) 🚀

| #            | Melhoria                                     | Impacto | Esforço | Estimativa          |
| ------------ | -------------------------------------------- | ------- | ------- | ------------------- |
| 7            | Implementar gráficos do dashboard (Chart.js) | ⭐⭐⭐  | 🔨🔨    | 16h                 |
| 8            | Modal de detalhes de investigação completo   | ⭐⭐⭐  | 🔨🔨    | 16h                 |
| 9            | Sistema de notificações (dropdown funcional) | ⭐⭐⭐  | 🔨🔨    | 12h                 |
| 10           | Histórico de conversas no chat (sidebar)     | ⭐⭐⭐  | 🔨🔨    | 20h                 |
| 11           | Filtros funcionais de investigações          | ⭐⭐⭐  | 🔨🔨    | 12h                 |
| 12           | Busca global (Ctrl+K)                        | ⭐⭐    | 🔨🔨    | 16h                 |
| **TOTAL Q2** |                                              |         |         | **92h (11.5 dias)** |

### QUADRANTE 3: Investimentos (Baixo Impacto + Baixo Esforço) 💡

| #            | Melhoria                             | Impacto | Esforço | Estimativa       |
| ------------ | ------------------------------------ | ------- | ------- | ---------------- |
| 13           | FAQ (Centro de Ajuda)                | ⭐      | 🔨      | 8h               |
| 14           | Vídeo explicativo (2-3 min)          | ⭐⭐    | 🔨🔨    | 24h              |
| 15           | Melhorias de SEO (meta tags, schema) | ⭐      | 🔨      | 8h               |
| **TOTAL Q3** |                                      |         |         | **40h (5 dias)** |

### QUADRANTE 4: Baixa Prioridade (Baixo Impacto + Alto Esforço) ⏳

| #            | Melhoria                         | Impacto | Esforço | Estimativa             |
| ------------ | -------------------------------- | ------- | ------- | ---------------------- |
| 16           | API Pública com documentação     | ⭐      | 🔨🔨🔨  | 40h                    |
| 17           | Mobile Apps (iOS/Android nativo) | ⭐      | 🔨🔨🔨  | 200h+                  |
| **TOTAL Q4** |                                  |         |         | **Futuro (> 3 meses)** |

---

## 📅 ROADMAP DE IMPLEMENTAÇÃO

### SPRINT 0 (06/10 - 08/10) - BASELINE & PREPARAÇÃO 📊

**Duração:** 2-3 dias
**Objetivo:** Estabelecer métricas baseline e preparar ambiente

#### Tarefas

1. **Coletar Métricas Atuais** (4h)
   - [ ] Configurar Google Analytics 4 (se não configurado)
   - [ ] Ativar Vercel Analytics (verificar se já ativo)
   - [ ] Executar Lighthouse audit completo (Desktop + Mobile)
   - [ ] Documentar:
     - Tempo médio na plataforma
     - Taxa de rejeição
     - Páginas por sessão
     - Core Web Vitals (LCP, FID, CLS)
     - Tempo de carregamento por página

2. **Criar Documento Baseline** (2h)
   - [ ] Criar `docs/metrics/BASELINE_2025-10-06.md`
   - [ ] Registrar todas métricas atuais
   - [ ] Screenshots do Lighthouse
   - [ ] Definir metas para cada Sprint

3. **Preparar Ambiente de Desenvolvimento** (4h)
   - [ ] Criar branch `feat/sprint-1-critical-fixes`
   - [ ] Instalar dependências pendentes:
     ```bash
     npm install cmdk react-pdf @tanstack/react-query
     ```
   - [ ] Configurar variáveis de ambiente
   - [ ] Rodar testes atuais: `npm run test`
   - [ ] Verificar build: `npm run build`

4. **Backend: Mapear Endpoints Necessários** (2h)
   - [ ] Listar todos endpoints necessários para Sprints 1-2
   - [ ] Verificar quais já existem no backend
   - [ ] Criar issues no repositório backend para faltantes
   - [ ] Priorizar por Sprint

**Entrega Sprint 0:**

- ✅ Documento `BASELINE_2025-10-06.md` completo
- ✅ Ambiente de dev configurado
- ✅ Lista de endpoints backend necessários
- ✅ Todas dependências instaladas

---

### SPRINT 1 (09/10 - 23/10) - CORREÇÕES CRÍTICAS ⚡

**Objetivo:** Eliminar fricções que atrapalham uso básico do sistema

#### Semana 1 (06/10 - 13/10): Quick Wins

- [x] ~~Análise completa da codebase~~ ✅
- [ ] **#1: PWA Install Prompt não invasivo** (2h)
  - Arquivo: `components/install-pwa.tsx`
  - Mudança: Trocar modal auto-open por banner discreto bottom-right
  - Adicionar delay de 30s antes de mostrar

- [ ] **#2: Identificação de Agente no Chat** (4h)
  - Arquivos: `components/chat/*`, `app/pt/(authenticated)/chat/page-v3.tsx`
  - Adicionar avatar + nome + role do agente acima de cada resposta

- [ ] **#3: Tooltips em Métricas** (4h)
  - Arquivo: `app/pt/(authenticated)/dashboard/page-v3.tsx`
  - Adicionar componente `Tooltip` com ícone (i) em cada métrica

- [ ] **#4: Loading States** (4h)
  - Arquivo: `components/ui/button.tsx` (adicionar prop `loading`)
  - Usar em todos os botões de ação

- [ ] **#5: Skeleton Screens** (6h)
  - Usar `components/ui/skeleton.tsx` existente
  - Aplicar em: Dashboard, Chat, Investigações durante carregamento

- [ ] **#6: Breadcrumbs** (4h)
  - Usar `components/breadcrumbs.tsx` existente
  - Aplicar em todas rotas autenticadas

**Entrega Semana 1:** Sistema polido sem fricções básicas ✨

#### Semana 2 (13/10 - 20/10): Funcionalidades Core

- [ ] **#7: Gráficos do Dashboard** (16h)
  - Biblioteca: Recharts (já usada em `components/charts/`)
  - Implementar:
    - Gráfico de linha: Contratos analisados over time
    - Gráfico de barras: Anomalias por tipo
    - Mapa de calor: Distribuição por órgão
    - Gráfico de pizza: Status das investigações
  - Usar dados reais da API ou mock realista

- [ ] **#8: Modal de Detalhes de Investigação** (16h)
  - Criar: `components/investigations/investigation-detail-modal.tsx`
  - Seções:
    - Resumo executivo
    - Evidências (lista)
    - Timeline
    - Agentes envolvidos (avatares)
    - Ações recomendadas
    - Botões: Baixar PDF, Compartilhar, Favoritar

**Entrega Semana 2:** Funcionalidades core completas 🚀

**Métricas de Sucesso Sprint 1:**

- ✅ Pop-up não abre automaticamente
- ✅ 100% dos botões com loading state
- ✅ 100% das métricas com tooltip
- ✅ Gráficos renderizando com dados reais
- ✅ Botão "Detalhes" abre modal completo

---

### SPRINT 2 (20/10 - 03/11) - UX ESSENCIAL 🎨

**Objetivo:** Experiência do usuário polida e profissional

#### Semana 3 (20/10 - 27/10): Notificações + Chat

- [ ] **#9: Sistema de Notificações** (12h)
  - Arquivo: `components/ui/notification-dropdown.tsx` (já existe!)
  - Integrar com API de notificações
  - Dropdown com:
    - Lista de notificações recentes (últimas 20)
    - Marcar como lida/não lida
    - Filtros: Todas | Anomalias | Conclusões
    - Link para investigação relacionada

- [ ] **#10: Histórico de Chat** (20h)
  - Criar: `components/chat/chat-history-sidebar.tsx`
  - Persistir conversas no Supabase
  - Funcionalidades:
    - Lista de conversas (título auto-gerado)
    - Busca no histórico
    - Retomar conversa
    - Deletar conversa
    - Exportar como PDF

**Entrega Semana 3:** Notificações + Chat com histórico 📬

#### Semana 4 (27/10 - 03/11): Investigações + Busca

- [ ] **#11: Filtros de Investigações** (12h)
  - Arquivo: `app/pt/(authenticated)/investigacoes/page.tsx`
  - Implementar filtros funcionais:
    - Status (dropdown multi-select)
    - Órgão (autocomplete)
    - Valor (range slider)
    - Data (date range picker)
    - Confiança (> 90%, 70-90%, < 70%)
  - Ordenação por colunas (clicável)

- [ ] **#12: Busca Global** (16h)
  - Biblioteca: `cmdk` (Command Palette)
  - Criar: `components/search/global-search.tsx`
  - Atalho: Ctrl+K (ou Cmd+K no Mac)
  - Buscar em:
    - Investigações (título, descrição)
    - Agentes (nome, especialidade)
    - Contratos (número, órgão)
    - Páginas do sistema
  - Preview de resultados
  - Histórico de buscas

**Entrega Semana 4:** Sistema completo de busca e filtros 🔍

**Métricas de Sucesso Sprint 2:**

- ✅ Dropdown de notificações funcional
- ✅ Chat persiste conversas
- ✅ Filtros reduzem lista de investigações
- ✅ Busca global (Ctrl+K) funciona

---

### SPRINT 3 (03/11 - 17/11) - CONTEÚDO & EDUCAÇÃO 📚

**Objetivo:** Facilitar adoção e auto-serviço

#### Semana 5 (03/11 - 10/11): Centro de Ajuda

- [ ] **#13: FAQ Completo** (8h)
  - Criar: `app/pt/help/page.tsx` (nova rota)
  - Seções:
    - Começando (5 perguntas)
    - Investigações (7 perguntas)
    - Chat com IAs (5 perguntas)
    - Segurança e Privacidade (5 perguntas)
    - Técnico (5 perguntas)
  - Componente: Accordion com busca

- [ ] Melhorar página "Sobre"
  - Adicionar seção "A História do Projeto"
  - Casos de uso práticos (3 exemplos)
  - Seção "Equipe" (ou "Criador")

- [ ] Melhorar página "Agentes"
  - Estatísticas por agente (investigações, anomalias)
  - Indicador de status (ativo/inativo)
  - Última atividade
  - Filtro por categoria

**Entrega Semana 5:** Conteúdo educacional completo 📖

#### Semana 6 (10/11 - 17/11): SEO + Performance

- [ ] **#15: SEO Optimization** (8h)
  - Meta descriptions únicas por página
  - Open Graph tags (social sharing)
  - Schema.org markup (Organization, WebApplication)
  - Sitemap.xml atualizado
  - Alt texts em TODAS imagens
  - Robots.txt configurado

- [ ] Performance Optimization
  - Lazy loading de imagens (usar Next.js Image otimizado)
  - Code splitting agressivo
  - Comprimir assets (Gzip/Brotli)
  - Otimizar cache de dashboard (5min TTL)

**Entrega Semana 6:** Site otimizado para busca e performance ⚡

**Métricas de Sucesso Sprint 3:**

- ✅ FAQ com 25+ perguntas
- ✅ Lighthouse Score > 90
- ✅ Tempo de carregamento < 2s

---

### SPRINT 4 (17/11 - 15/12) - FEATURES AVANÇADAS 🚀

**Objetivo:** Diferenciais competitivos

#### Semana 7-8 (17/11 - 01/12): Relatórios

- [ ] Sistema de Relatórios Customizáveis
  - Criar: `app/pt/(authenticated)/relatorios/page.tsx`
  - Report Builder:
    - Selecionar período
    - Escolher investigações
    - Template (Executivo, Técnico, Resumido)
    - Exportar PDF/Excel
  - Templates pré-definidos:
    - Relatório Mensal
    - Top 10 Anomalias
    - Por Órgão
  - Agendamento (enviar por email semanal/mensal)

**Entrega Semana 8:** Relatórios completos 📊

#### Semana 9-10 (01/12 - 15/12): Alertas + API

- [ ] Sistema de Alertas Personalizados
  - Criar: `app/pt/(authenticated)/alertas/page.tsx`
  - Configuração:
    - Tipo (nova anomalia, valor > X, órgão específico)
    - Frequência (instantâneo, diário, semanal)
    - Canal (email, webhook)
  - Dashboard de alertas ativos

- [ ] **#16: API Pública** (40h)
  - Criar: `app/api/v1/*`
  - Endpoints:
    - GET /investigations (lista)
    - GET /investigations/:id (detalhes)
    - GET /agents (lista)
    - GET /stats (estatísticas públicas)
  - Documentação: Swagger/OpenAPI
  - Rate limiting (1000 req/dia grátis)
  - API Key authentication

**Entrega Sprint 4:** Features avançadas prontas 🎯

**Métricas de Sucesso Sprint 4:**

- ✅ Relatórios exportáveis
- ✅ Alertas funcionando
- ✅ API com 5+ endpoints documentados

---

### SPRINT 5+ (2025 Q1) - INOVAÇÃO & ESCALA 💡

**Objetivo:** Liderança de mercado

#### Features Futuras (Backlog Priorizado)

1. **IA Preditiva**
   - Score de risco em licitações
   - Previsão de anomalias
   - Recomendações proativas

2. **Colaboração Cidadã**
   - Sistema de denúncias
   - Votação de prioridades
   - Gamificação (badges, ranking)

3. **Integrações Externas**
   - TCU, CGU APIs
   - Dados abertos estaduais
   - Webhook para jornalistas

4. **Mobile Apps**
   - React Native (iOS + Android)
   - Push notifications
   - Experiência nativa

---

## 💻 DETALHAMENTO TÉCNICO DAS IMPLEMENTAÇÕES

### 🔧 #1: PWA Install Prompt (2h)

**Arquivo:** `components/install-pwa.tsx`

**Estado Atual:**

```typescript
// Problema: showInstallPrompt = true imediatamente
setShowInstallPrompt(true)
```

**Implementação:**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

export function InstallPWA() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)

      // 🔥 MUDANÇA: Não mostrar imediatamente
      // Verificar se já foi dismissed
      const dismissedTime = localStorage.getItem('pwa-install-dismissed')
      if (dismissedTime) {
        const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24)
        if (daysSinceDismissed < 7) {
          return // Não mostrar se dismissed < 7 dias atrás
        }
      }

      // 🔥 MUDANÇA: Delay de 30 segundos
      setTimeout(() => {
        setShowInstallPrompt(true)
      }, 30000) // 30s
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPrompt(false)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  if (!showInstallPrompt) return null

  return (
    // 🔥 MUDANÇA: Banner discreto bottom-right ao invés de modal centralizado
    <div className="fixed bottom-4 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border border-green-500 z-50 animate-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="bg-green-100 dark:bg-green-900 rounded-full p-2 flex-shrink-0">
            <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Instalar Cidadão.AI
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              Acesso rápido e offline
            </p>
            <button
              onClick={handleInstallClick}
              className="mt-2 inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors"
            >
              <Download className="h-3 w-3 mr-1.5" />
              Instalar
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
```

**Teste:**

1. Abrir site em modo anônimo
2. Aguardar 30 segundos
3. Verificar banner discreto bottom-right
4. Clicar "Fechar"
5. Reabrir: não deve mostrar por 7 dias

---

### 🔧 #2: Identificação de Agente no Chat (4h)

**Arquivos:**

- `components/chat/chat-message.tsx` (criar novo)
- `app/pt/(authenticated)/chat/page-v3.tsx` (modificar)

**Criar Componente:**

```typescript
// components/chat/chat-message.tsx
'use client'

import { Avatar } from '@/components/ui/optimized-avatar'
import { Badge } from '@/components/ui/badge'
import { MarkdownMessage } from '@/components/markdown-message'
import type { ChatMessage as ChatMessageType } from '@/types/chat'
import { agents } from '@/data/agents'

interface ChatMessageProps {
  message: ChatMessageType
  isLatest?: boolean
}

export function ChatMessage({ message, isLatest }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const agent = agents.find(a => a.id === message.agent_id)

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-green-600 text-white rounded-lg px-4 py-2 max-w-[80%]">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      {/* 🔥 NOVO: Avatar do agente */}
      <Avatar
        src={agent?.avatar || '/avatars/default.png'}
        alt={agent?.name || 'IA'}
        size="md"
        className="flex-shrink-0"
      />

      <div className="flex-1">
        {/* 🔥 NOVO: Nome e role do agente */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-gray-900 dark:text-white">
            {agent?.name || 'Assistente IA'}
          </span>
          <Badge variant="outline" size="sm">
            {agent?.role || 'Assistente'}
          </Badge>
        </div>

        {/* Mensagem */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3">
          <MarkdownMessage content={message.content} />
        </div>

        {/* Metadados */}
        {message.confidence && (
          <div className="mt-2 text-xs text-gray-500">
            Confiança: {(message.confidence * 100).toFixed(0)}%
          </div>
        )}
      </div>
    </div>
  )
}
```

**Teste:**

1. Enviar mensagem no chat
2. Verificar avatar e nome do agente acima da resposta
3. Verificar badge com role (ex: "Coordenador Central")

---

### 🔧 #7: Gráficos do Dashboard (16h)

**Arquivo:** `app/pt/(authenticated)/dashboard/page-v3.tsx`

**Implementação:**

```typescript
// Usar Recharts (já instalado)
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie,
  XAxis, YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

// 1. Gráfico de Linha: Contratos Analisados Over Time
const ContractsOverTimeChart = ({ data }: { data: any[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contratos Analisados</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="contracts"
              stroke="#10b981"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// 2. Gráfico de Barras: Anomalias por Tipo
const AnomaliesByTypeChart = ({ data }: { data: any[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Anomalias por Tipo</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// 3. Gráfico de Pizza: Status das Investigações
const InvestigationStatusChart = ({ data }: { data: any[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status das Investigações</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            />
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Uso no dashboard
export default function DashboardPage() {
  // Buscar dados reais ou usar mock
  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats')
      return res.json()
    }
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ContractsOverTimeChart data={statsData?.contractsOverTime || mockData} />
      <AnomaliesByTypeChart data={statsData?.anomaliesByType || mockData} />
      <InvestigationStatusChart data={statsData?.statusDistribution || mockData} />
    </div>
  )
}
```

**Mock Data (para desenvolvimento):**

```typescript
const mockContractsOverTime = [
  { month: 'Jan', contracts: 240 },
  { month: 'Fev', contracts: 389 },
  { month: 'Mar', contracts: 450 },
  { month: 'Abr', contracts: 520 },
  { month: 'Mai', contracts: 678 },
  { month: 'Jun', contracts: 847 },
]

const mockAnomaliesByType = [
  { type: 'Superfaturamento', count: 12 },
  { type: 'Direcionamento', count: 8 },
  { type: 'Fracionamento', count: 5 },
  { type: 'Favorecimento', count: 3 },
]

const mockStatusDistribution = [
  { name: 'Em Análise', value: 15 },
  { name: 'Concluída', value: 23 },
  { name: 'Crítica', value: 5 },
]
```

**Teste:**

1. Acessar dashboard
2. Verificar 3 gráficos renderizados com dados
3. Hover: tooltip funcional
4. Responsivo: mobile mostra gráficos empilhados

---

### 🔧 #8: Modal de Detalhes de Investigação (16h)

**Criar Componente:**

```typescript
// components/investigations/investigation-detail-modal.tsx
'use client'

import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/optimized-avatar'
import { Download, Share2, Star } from 'lucide-react'
import type { Investigation } from '@/types/investigation'

interface InvestigationDetailModalProps {
  investigation: Investigation
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvestigationDetailModal({
  investigation,
  open,
  onOpenChange
}: InvestigationDetailModalProps) {

  const handleDownloadPDF = () => {
    // TODO: Implementar geração de PDF
    console.log('Download PDF:', investigation.id)
  }

  const handleShare = () => {
    // Copiar link para clipboard
    navigator.clipboard.writeText(
      `${window.location.origin}/investigacoes/${investigation.id}`
    )
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          <div className="flex items-start justify-between">
            <div>
              <Badge variant={investigation.status === 'critical' ? 'destructive' : 'default'}>
                {investigation.status}
              </Badge>
              <ModalTitle className="mt-2">
                {investigation.title}
              </ModalTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span>ID: {investigation.id}</span>
                <span>•</span>
                <span>Confiança: {investigation.confidence}%</span>
                <span>•</span>
                <span>{investigation.date}</span>
              </div>
            </div>
          </div>
        </ModalHeader>

        {/* Resumo Executivo */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Resumo Executivo</h3>
          <p className="text-gray-700 dark:text-gray-300">
            {investigation.summary || investigation.description}
          </p>
        </section>

        {/* Evidências */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">
            Evidências Detectadas ({investigation.evidences?.length || 0})
          </h3>
          <div className="space-y-3">
            {investigation.evidences?.map((evidence, idx) => (
              <div key={idx} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-900 dark:text-red-100">
                      {evidence.type}
                    </h4>
                    <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                      {evidence.description}
                    </p>
                    {evidence.value && (
                      <p className="text-xs text-red-700 dark:text-red-300 mt-2">
                        Valor envolvido: {evidence.value}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Timeline</h3>
          <div className="space-y-4">
            {investigation.timeline?.map((event, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="bg-green-600 rounded-full w-3 h-3"></div>
                  {idx < investigation.timeline!.length - 1 && (
                    <div className="w-0.5 h-full bg-green-200 dark:bg-green-800"></div>
                  )}
                </div>
                <div className="pb-6">
                  <div className="text-sm text-gray-500">{event.date}</div>
                  <div className="font-medium">{event.event}</div>
                  {event.details && (
                    <div className="text-sm text-gray-600 mt-1">{event.details}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Agentes Envolvidos */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Agentes Envolvidos</h3>
          <div className="flex flex-wrap gap-3">
            {investigation.agents?.map((agent) => (
              <div key={agent.id} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full pr-4 pl-1 py-1">
                <Avatar src={agent.avatar} alt={agent.name} size="sm" />
                <div>
                  <div className="text-sm font-medium">{agent.name}</div>
                  <div className="text-xs text-gray-500">{agent.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ações Recomendadas */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Ações Recomendadas</h3>
          <ul className="space-y-2">
            {investigation.recommendations?.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Botões de Ação */}
        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={handleDownloadPDF} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Baixar PDF
          </Button>
          <Button onClick={handleShare} variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
          <Button variant="outline">
            <Star className="w-4 h-4 mr-2" />
            Favoritar
          </Button>
        </div>
      </ModalContent>
    </Modal>
  )
}
```

**Usar no componente de lista:**

```typescript
// app/pt/(authenticated)/investigacoes/page.tsx
const [selectedInvestigation, setSelectedInvestigation] = useState<Investigation | null>(null)

// No card de investigação
<Button
  onClick={() => setSelectedInvestigation(investigation)}
  variant="outline"
>
  Detalhes
</Button>

// Renderizar modal
<InvestigationDetailModal
  investigation={selectedInvestigation}
  open={!!selectedInvestigation}
  onOpenChange={(open) => !open && setSelectedInvestigation(null)}
/>
```

---

## 📊 MÉTRICAS DE SUCESSO

### KPIs por Sprint

#### Sprint 1 (Correções Críticas)

| Métrica                                  | Baseline | Meta         | Como Medir         |
| ---------------------------------------- | -------- | ------------ | ------------------ |
| Pop-up de instalação não abre automático | ❌ Abre  | ✅ Delay 30s | Teste manual       |
| Loading states em botões                 | 0%       | 100%         | Code review        |
| Tooltips em métricas                     | 0%       | 100%         | Contador no código |
| Gráficos com dados                       | 0/3      | 3/3          | Inspeção visual    |
| Modal de detalhes funciona               | ❌ Não   | ✅ Sim       | Teste funcional    |

#### Sprint 2 (UX Essencial)

| Métrica                        | Baseline | Meta     | Como Medir |
| ------------------------------ | -------- | -------- | ---------- |
| Taxa de retenção D7            | ?        | > 40%    | Analytics  |
| Tempo médio na plataforma      | ?        | > 10 min | Analytics  |
| Conversas por usuário/mês      | 1-2      | > 5      | DB query   |
| Investigações visualizadas/mês | 3-5      | > 10     | DB query   |
| NPS (Net Promoter Score)       | ?        | > 50     | Survey     |

#### Sprint 3 (Conteúdo)

| Métrica                | Baseline | Meta     | Como Medir            |
| ---------------------- | -------- | -------- | --------------------- |
| Lighthouse Score       | ~80      | > 90     | Lighthouse            |
| Tempo de carregamento  | ~3s      | < 2s     | WebPageTest           |
| Organic search traffic | 0        | +10%     | Google Search Console |
| FAQ views              | 0        | 100+/mês | Analytics             |

#### Sprint 4 (Features Avançadas)

| Métrica                | Baseline | Meta | Como Medir |
| ---------------------- | -------- | ---- | ---------- |
| Relatórios gerados/mês | 0        | 50+  | DB query   |
| Alertas configurados   | 0        | 20+  | DB query   |
| API requests/dia       | 0        | 500+ | API logs   |

---

## 👥 RECURSOS NECESSÁRIOS

### Equipe Mínima Viável

- **1 Full-Stack Developer** (React + Python) - 40h/semana
  - Responsável por todas implementações
  - Anderson Henrique (você mesmo)

### Equipe Ideal

- **2 Frontend Developers** - React/Next.js
- **1 Backend Developer** - Python/FastAPI
- **1 Designer UI/UX** - Part-time (16h/semana)
- **1 Content Creator** - Vídeos, textos (Part-time)

### Ferramentas Adicionais

- **Recharts** - ✅ Já instalado
- **cmdk** - Instalar para busca global
- **react-pdf** - Para geração de PDFs
- **Sentry** - ✅ Já configurado (monitoramento)
- **Vercel Analytics** - ✅ Já ativo

---

## 💰 ESTIMATIVAS DE ESFORÇO

### Resumo por Sprint

| Sprint    | Duração        | Horas    | Dias Úteis   | Complexidade  |
| --------- | -------------- | -------- | ------------ | ------------- |
| Sprint 1  | 2 semanas      | 64h      | 8 dias       | 🟡 Média      |
| Sprint 2  | 2 semanas      | 92h      | 11.5 dias    | 🟠 Alta       |
| Sprint 3  | 2 semanas      | 40h      | 5 dias       | 🟢 Baixa      |
| Sprint 4  | 4 semanas      | 120h     | 15 dias      | 🔴 Muito Alta |
| **TOTAL** | **10 semanas** | **316h** | **~40 dias** |               |

### Burndown Chart Projetado

```
Horas Restantes
│
316 ├─┐
    │  ─┐
    │    ─┐
252 │      ─┐ Sprint 1
    │        ─┐
    │          ─┐
160 │            ─┐ Sprint 2
    │              ─┐
    │                ─┐
120 │                  ─┐ Sprint 3
    │                    ─┐
  0 └──────────────────────┘
     S1  S2  S3  S4  S5  S6  S7  S8  S9  S10
```

---

## 🎯 CRITÉRIOS DE ACEITE

### Definição de "Pronto" (Definition of Done)

Para cada feature ser considerada completa:

✅ **Código**

- [ ] Implementado conforme especificação
- [ ] Testes unitários (se aplicável - mínimo 80% coverage em novos componentes)
- [ ] Code review aprovado (checklist abaixo)
- [ ] Sem console.errors ou warnings
- [ ] TypeScript strict mode sem erros
- [ ] ESLint passa sem erros
- [ ] Prettier formatado

✅ **Testes** (NOVO - RIGOROSO)

- [ ] **Testes Unitários** (componentes novos)

  ```bash
  npm run test -- components/[nome-componente].test.tsx
  ```

  - Props rendering correto
  - Estados internos funcionam
  - Callbacks são chamados
  - Edge cases cobertos

- [ ] **Testes de Integração** (se API call)

  ```typescript
  // Testar com MSW (Mock Service Worker)
  - API retorna sucesso
  - API retorna erro (toast exibido?)
  - API timeout (loading state correto?)
  - Retry lógica funciona
  ```

- [ ] **Testes E2E** (fluxos críticos apenas)

  ```bash
  npx playwright test [nome-do-teste]
  ```

  - Login → Dashboard → Ver investigação → Abrir modal
  - Chat → Enviar mensagem → Receber resposta → Histórico
  - Notificações → Marcar como lida → Verificar estado

- [ ] **Testes Manuais** (checklist)
  - [ ] Desktop Chrome (última versão)
  - [ ] Mobile Safari (iOS)
  - [ ] Mobile Chrome (Android)
  - [ ] Firefox (última versão)
  - [ ] Dark mode funciona em todos
  - [ ] Accessibility (testar com leitor de tela)

✅ **UI/UX**

- [ ] Responsivo (mobile 375px, tablet 768px, desktop 1920px)
- [ ] Dark mode funciona perfeitamente
- [ ] Acessibilidade (WCAG 2.1 AA)
  - [ ] Contraste mínimo 4.5:1 (texto normal)
  - [ ] Contraste mínimo 3:1 (texto grande)
  - [ ] Navegação por teclado funciona
  - [ ] Screen reader announces corretamente
  - [ ] Todos inputs têm labels
  - [ ] Botões têm aria-label quando necessário
- [ ] Loading states implementados (skeletons ou spinners)
- [ ] Tratamento de erros (toast ou inline error)
- [ ] Estados vazios (empty states com ilustração/texto)
- [ ] Animações suaves (sem jank, 60fps)

✅ **Performance**

- [ ] Lighthouse Score > 90 (Desktop)
- [ ] Lighthouse Score > 80 (Mobile)
- [ ] Core Web Vitals:
  - [ ] LCP < 2.5s (Largest Contentful Paint)
  - [ ] FID < 100ms (First Input Delay)
  - [ ] CLS < 0.1 (Cumulative Layout Shift)
- [ ] Bundle size não aumentou > 50KB
- [ ] Lazy loading implementado onde apropriado
- [ ] Imagens otimizadas (WebP/AVIF)

✅ **Documentação**

- [ ] README atualizado (se necessário)
- [ ] Comentários em código complexo (JSDoc)
- [ ] CHANGELOG.md atualizado com:
  ```markdown
  ## [Versão] - YYYY-MM-DD

  ### Added

  - Feature X com descrição

  ### Changed

  - Comportamento Y modificado

  ### Fixed

  - Bug Z corrigido
  ```
- [ ] Storybook story criada (se componente reutilizável)

✅ **Deploy**

- [ ] Build passa sem erros: `npm run build`
- [ ] Type-check passa: `npm run type-check`
- [ ] Lint passa: `npm run lint`
- [ ] Tests passam: `npm run test`
- [ ] Testado em staging/preview
- [ ] Deploy em produção
- [ ] Smoke tests passam (pós-deploy)
  - [ ] Login funciona
  - [ ] Dashboard carrega
  - [ ] Chat responde
  - [ ] Notificações aparecem

---

## 🔌 DETALHAMENTO DE INTEGRAÇÕES BACKEND

### Endpoints Necessários por Sprint

#### Sprint 1 - Gráficos Dashboard

**Endpoint:** `GET /api/v1/dashboard/stats`

**Request:**

```typescript
GET /api/v1/dashboard/stats?period=7d
Headers:
  Authorization: Bearer {token}
```

**Response:**

```typescript
interface DashboardStats {
  contractsOverTime: Array<{
    month: string
    contracts: number
  }>
  anomaliesByType: Array<{
    type: string
    count: number
  }>
  statusDistribution: Array<{
    name: string
    value: number
  }>
  summary: {
    totalAnalyzed: string
    totalContracts: number
    totalAnomalies: number
    activeAgents: string
  }
}
```

**Tempo Estimado Backend:** 6h (4h implementação + 2h testes)
**Prioridade:** ALTA
**Plano B se não entregar:** Usar mocks avançados com localStorage (dados persistem entre sessões)

---

#### Sprint 2 - Notificações

**Endpoint:** `GET /api/v1/notifications`

**Request:**

```typescript
GET /api/v1/notifications?limit=20&unread=true
Headers:
  Authorization: Bearer {token}
```

**Response:**

```typescript
interface Notification {
  id: string
  type: 'investigation' | 'anomaly' | 'success' | 'system' | 'agent'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  message: string
  timestamp: string (ISO 8601)
  read: boolean
  investigationId?: string
  agentId?: string
  anomalyScore?: number
  actionUrl?: string
  data?: Record<string, any>
}

interface NotificationsResponse {
  notifications: Notification[]
  total: number
  unread: number
}
```

**Integração Frontend:**

```typescript
// lib/services/notification.service.ts
export async function fetchNotifications(): Promise<Notification[]> {
  const response = await fetch(`${API_URL}/api/v1/notifications`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch notifications')
  }

  const data: NotificationsResponse = await response.json()
  return data.notifications
}

// store/notification-store.ts (atualizar linha 171-189)
fetchNotifications: async () => {
  set({ isLoading: true })

  try {
    const notifications = await fetchNotifications()
    get().addNotifications(notifications)
    set({ lastFetch: new Date() })
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    // Fallback para demo data se API falhar
    const demoNotifications = generateDemoNotifications()
    get().addNotifications(demoNotifications)
  } finally {
    set({ isLoading: false })
  }
}
```

**Tempo Estimado Backend:** 4h
**Prioridade:** MÉDIA
**Plano B:** Continuar com `generateDemoNotifications()` + marcar componente com banner "Demo Mode"

---

#### Sprint 2 - Chat Sessions (Supabase)

**Tabela:** `chat_sessions`

**Schema:**

```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
```

**Integração Frontend:**

```typescript
// lib/services/chat-session.service.ts
import { createClient } from '@/lib/supabase/client'

export async function getUserSessions(limit = 20): Promise<ChatSession[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function saveSession(session: ChatSession): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('chat_sessions').upsert({
    id: session.id,
    title: session.title,
    messages: session.messages,
    updated_at: new Date().toISOString(),
  })

  if (error) throw error
}
```

**Tempo Estimado:** 6h (2h schema + 4h integração)
**Prioridade:** MÉDIA
**Plano B:** Continuar com localStorage + exportar JSON para usuário fazer backup manual

---

## 🚨 RISCOS E MITIGAÇÕES

| Risco                                            | Probabilidade | Impacto | Mitigação                                            |
| ------------------------------------------------ | ------------- | ------- | ---------------------------------------------------- |
| **API do backend retornar dados inconsistentes** | Alta          | Alto    | ✅ Validação de schema com Zod + fallback para mocks |
| **Backend atrasar entrega de endpoints**         | Alta          | Alto    | ✅ **PLANO B DETALHADO ABAIXO**                      |
| **Gráficos pesados impactarem performance**      | Média         | Médio   | ✅ Lazy loading + code splitting + cache agressivo   |
| **Usuários não encontrarem novo modal**          | Baixa         | Médio   | ✅ Tooltip "Novo!" por 2 semanas + tour guiado       |
| **SEO demorar para indexar**                     | Alta          | Baixo   | ✅ Google Search Console manual submit               |
| **Sobrecarga em 1 desenvolvedor**                | Alta          | Alto    | ✅ Priorizar ruthlessly + aceitar MVP                |
| **Recharts incompatível com dark mode**          | Baixa         | Médio   | ✅ Testar em Sprint 0 + alternativa: Nivo charts     |
| **Modal muito pesado (performance)**             | Média         | Médio   | ✅ Lazy load tabs + pagination evidências            |
| **Supabase downtime**                            | Baixa         | Alto    | ✅ Fallback automático para localStorage             |

---

## 🔄 PLANOS DE CONTINGÊNCIA DETALHADOS

### Se Backend Atrasar Endpoints

#### Cenário 1: Dashboard Stats API atrasa

**Impacto:** Sprint 1 Semana 2 comprometido

**Plano B:**

```typescript
// lib/services/dashboard-mock.service.ts
export function getMockDashboardStats(): DashboardStats {
  // Gerar dados realistas baseados em padrões reais
  return {
    contractsOverTime: generateRealisticTimeSeries(),
    anomaliesByType: generateAnomalyDistribution(),
    statusDistribution: generateStatusData(),
    summary: calculateSummary()
  }
}

// Adicionar toggle no dashboard
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DASHBOARD === 'true'

// Banner de aviso
{USE_MOCK_DATA && (
  <Alert variant="warning">
    <Info className="w-4 h-4" />
    Modo demonstração - Dados ilustrativos
  </Alert>
)}
```

**Ação:**

- Continuar desenvolvimento com mocks
- Marcar componente com banner "Demo Mode"
- Preparar migração fácil (apenas trocar service layer)

---

#### Cenário 2: Notificações API atrasa

**Impacto:** Sprint 2 Semana 3 comprometido

**Plano B:**

- Manter `generateDemoNotifications()` atual
- Adicionar mais notificações demo (variedade)
- Implementar filtros e UI completa com dados mock
- Banner "Demonstração - Conectar a API real em Settings"

---

#### Cenário 3: Supabase indisponível

**Impacto:** Chat sessions não persistem

**Plano B:**

```typescript
// Fallback automático
export async function saveSession(session: ChatSession) {
  try {
    await supabaseService.save(session)
  } catch (error) {
    console.warn('Supabase unavailable, using localStorage fallback')
    localStorage.setItem(`session_${session.id}`, JSON.stringify(session))

    // Notificar usuário
    toast.warning('Conversas salvas localmente. Sincronização pendente.')
  }
}

// Sincronização automática quando reconectar
window.addEventListener('online', async () => {
  await syncPendingSessions()
})
```

---

### Se Recharts Tiver Problemas

#### Problema: Dark mode não funciona

**Plano B:**

1. Testar biblioteca alternativa: **Nivo** (https://nivo.rocks)
2. Se ambas falharem: Gráficos SVG customizados simples
3. Última opção: Tabelas interativas ao invés de gráficos

**Decisão:** Testar em Sprint 0 para evitar surpresas

---

### Se Modal Ficar Muito Pesado

#### Problema: Performance ruim com muitas evidências

**Plano B:**

```typescript
// Pagination nas evidências
const [evidencePage, setEvidencePage] = useState(1)
const EVIDENCES_PER_PAGE = 10

const visibleEvidences = investigation.evidences.slice(
  (evidencePage - 1) * EVIDENCES_PER_PAGE,
  evidencePage * EVIDENCES_PER_PAGE
)

// Lazy load tabs
const TimelineTab = dynamic(() => import('./tabs/timeline'), { ssr: false })
const DocumentsTab = dynamic(() => import('./tabs/documents'), { ssr: false })
```

---

## 📝 PRÓXIMOS PASSOS IMEDIATOS

### Esta Semana (06/10 - 13/10)

1. **Segunda 07/10**
   - [ ] Revisar e aprovar este plano
   - [ ] Criar branch `feat/sprint-1-critical-fixes`
   - [ ] Implementar #1: PWA prompt fix (2h)

2. **Terça 08/10**
   - [ ] Implementar #2: Agente no chat (4h)
   - [ ] Implementar #3: Tooltips (4h)

3. **Quarta 09/10**
   - [ ] Implementar #4: Loading states (4h)
   - [ ] Implementar #5: Skeletons (6h)

4. **Quinta 10/10**
   - [ ] Implementar #6: Breadcrumbs (4h)
   - [ ] Code review + testes

5. **Sexta 11/10**
   - [ ] Merge para main
   - [ ] Deploy para staging
   - [ ] Testes de aceitação

---

## 🎓 APRENDIZADOS E EVOLUÇÕES

### Princípios Guiadores

1. **Iterar Rápido** - Prefira MVP funcional a perfeição
2. **Dados Reais** - Sempre que possível, usar dados da API
3. **Mobile-First** - Pensar em mobile desde o início
4. **Acessibilidade** - Não é opcional, é obrigatório
5. **Performance** - Medir sempre antes e depois

### Retrospectiva Pré-Planejada

Após cada sprint, responder:

1. O que funcionou bem?
2. O que não funcionou?
3. O que devemos fazer diferente?
4. Bloqueios encontrados?
5. Aprendizados técnicos?

---

## 📚 REFERÊNCIAS

### Design System

- Shadcn UI: https://ui.shadcn.com/
- Tailwind CSS: https://tailwindcss.com/
- Recharts: https://recharts.org/

### Padrões de Código

- Next.js App Router: https://nextjs.org/docs/app
- React Server Components: https://react.dev/reference/react/use-server
- TypeScript Strict Mode: Sempre ativo

### Acessibilidade

- WCAG 2.1 AA: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Patterns: https://www.w3.org/WAI/ARIA/apg/

---

## ✅ APROVAÇÃO

**Elaborado por:** Anderson Henrique da Silva
**Data:** 2025-10-06 17:58:22 -03
**Versão:** 1.0

**Status:** 🟡 Aguardando Aprovação

---

**Assinaturas:**

---

Anderson Henrique da Silva
Desenvolvedor Full-Stack

**Data de Aprovação:** **_ / _** / \_\_\_

---

## 📎 ANEXOS

### Anexo A: Estrutura de Pastas Proposta

```
components/
├── investigations/
│   └── investigation-detail-modal.tsx  # NOVO
├── chat/
│   ├── chat-message.tsx                # NOVO
│   └── chat-history-sidebar.tsx        # NOVO
└── search/
    └── global-search.tsx               # NOVO

app/pt/(authenticated)/
├── relatorios/                         # NOVO
│   └── page.tsx
├── alertas/                            # NOVO
│   └── page.tsx
└── help/                               # NOVO
    └── page.tsx
```

### Anexo B: Dependências a Instalar

```json
{
  "dependencies": {
    "cmdk": "^0.2.0", // Command palette
    "react-pdf": "^7.5.1", // PDF generation
    "@tanstack/react-query": "^5.0.0" // Já tem?
  }
}
```

---

**FIM DO DOCUMENTO**
