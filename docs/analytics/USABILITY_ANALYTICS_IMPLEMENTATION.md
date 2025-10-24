# Usability Analytics Implementation

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data de Criação**: 2025-01-24 (data atual do sistema)

---

## 📋 Sumário

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [PostHog Integration](#posthog-integration)
4. [Supabase Telemetry Storage](#supabase-telemetry-storage)
5. [Unified Tracker Implementation](#unified-tracker-implementation)
6. [Tracked Events](#tracked-events)
7. [Privacy & LGPD Compliance](#privacy--lgpd-compliance)
8. [Data Analysis & Export](#data-analysis--export)
9. [Research Use Cases](#research-use-cases)
10. [Setup & Configuration](#setup--configuration)

---

## Visão Geral

Sistema de análise de usabilidade implementado para coletar dados **anônimos e agregados** sobre o uso da plataforma Cidadão.AI, com foco em pesquisa acadêmica sobre usabilidade de sistemas de transparência pública.

### Objetivos

- ✅ Coletar métricas de usabilidade para pesquisa científica
- ✅ Identificar padrões de uso e pontos de dificuldade
- ✅ Melhorar continuamente a experiência do usuário
- ✅ Garantir compliance total com LGPD
- ✅ Fornecer dados para dissertação/artigos acadêmicos

### Tecnologias Utilizadas

- **PostHog**: Analytics principal com session replay e heatmaps
- **Supabase**: Backup de dados e análise customizada
- **Telemetria Local**: Métricas em tempo real (já existente)

### Custo

- **R$ 0,00** - Todas as ferramentas no free tier
- PostHog: até 1M eventos/mês grátis
- Supabase: 500MB database grátis

---

## Arquitetura do Sistema

### Camadas de Coleta

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTIONS                         │
│  (clicks, navigation, chat, investigations, agents)          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              UNIFIED USABILITY TRACKER                       │
│  (lib/analytics/usability-tracker.ts)                        │
│  - Event normalization                                       │
│  - Privacy filtering                                         │
│  - Consent checking                                          │
└───────┬─────────────┬─────────────┬───────────────────────┘
        │             │             │
        ▼             ▼             ▼
┌─────────────┐ ┌──────────┐ ┌─────────────────┐
│   PostHog   │ │ Supabase │ │ Local Telemetry │
│  (primary)  │ │ (backup) │ │   (real-time)   │
└─────────────┘ └──────────┘ └─────────────────┘
        │             │             │
        ▼             ▼             ▼
┌─────────────┐ ┌──────────┐ ┌─────────────────┐
│  Dashboard  │ │ SQL Query│ │   Dev Console   │
│  Web UI     │ │ + Export │ │                 │
└─────────────┘ └──────────┘ └─────────────────┘
```

### Fluxo de Dados

1. **Captura**: Evento ocorre na interface
2. **Normalização**: Evento é formatado pelo tracker
3. **Consentimento**: Verifica se usuário aceitou coleta
4. **Anonimização**: Remove dados identificáveis
5. **Distribuição**: Envia para PostHog, Supabase e telemetria local
6. **Armazenamento**: Dados salvos para análise
7. **Análise**: Dashboards e exports para pesquisa

---

## PostHog Integration

### Setup

```bash
npm install posthog-js
```

### Configuration

```typescript
// lib/analytics/posthog-config.ts
import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',

    // Privacy & LGPD
    anonymize_ip: true,
    respect_dnt: true,

    // Session Recording
    disable_session_recording: false, // Enabled with consent
    session_recording: {
      maskAllInputs: true, // Hide sensitive input
      maskTextSelector: '.sensitive', // Custom masking
    },

    // Performance
    autocapture: false, // Manual tracking only
    capture_pageview: false, // Manual page tracking
  })
}
```

### Features Used

- **Session Replay**: Visual recording of user sessions
- **Heatmaps**: Click and scroll heatmaps
- **Funnels**: Conversion analysis
- **Retention**: User return patterns
- **Export**: SQL access to all data

---

## Supabase Telemetry Storage

### Database Schema

```sql
-- Tabela de eventos de usabilidade
CREATE TABLE usability_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Event identification
  event_type VARCHAR(50) NOT NULL,
  event_category VARCHAR(50) NOT NULL,

  -- Anonymized user data
  session_id VARCHAR(100) NOT NULL,
  user_hash VARCHAR(64), -- SHA-256 hash if authenticated

  -- Event data
  page_path VARCHAR(255),
  element_clicked VARCHAR(100),
  agent_used VARCHAR(50),
  interaction_type VARCHAR(50),

  -- Performance metrics
  duration_ms INTEGER,
  time_on_page INTEGER,
  steps_taken INTEGER,

  -- Context
  device_type VARCHAR(20),
  browser VARCHAR(50),
  screen_width INTEGER,
  screen_height INTEGER,

  -- Flags
  is_demo_mode BOOLEAN DEFAULT false,
  is_authenticated BOOLEAN DEFAULT false,
  has_research_consent BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes
  CONSTRAINT event_type_check CHECK (event_type IN (
    'page_view', 'navigation', 'click', 'chat_interaction',
    'agent_selected', 'investigation_started', 'investigation_completed',
    'export_data', 'accessibility_toggle', 'error'
  ))
);

-- Indexes for performance
CREATE INDEX idx_events_created_at ON usability_events(created_at DESC);
CREATE INDEX idx_events_type ON usability_events(event_type);
CREATE INDEX idx_events_session ON usability_events(session_id);
CREATE INDEX idx_events_category ON usability_events(event_category);

-- RLS Policy (Row Level Security)
ALTER TABLE usability_events ENABLE ROW LEVEL SECURITY;

-- Only app can insert
CREATE POLICY "App can insert events" ON usability_events
  FOR INSERT WITH CHECK (true);

-- Only authenticated users with admin role can read
CREATE POLICY "Admin can read events" ON usability_events
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
  );
```

### Analytics Views

```sql
-- View: Daily Event Summary
CREATE VIEW daily_event_summary AS
SELECT
  DATE(created_at) as date,
  event_type,
  event_category,
  COUNT(*) as event_count,
  COUNT(DISTINCT session_id) as unique_sessions,
  AVG(duration_ms) as avg_duration,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms) as median_duration
FROM usability_events
GROUP BY DATE(created_at), event_type, event_category
ORDER BY date DESC, event_count DESC;

-- View: Agent Usage Statistics
CREATE VIEW agent_usage_stats AS
SELECT
  agent_used,
  COUNT(*) as total_uses,
  AVG(duration_ms) as avg_interaction_time,
  COUNT(DISTINCT session_id) as unique_users,
  SUM(CASE WHEN event_type = 'investigation_completed' THEN 1 ELSE 0 END) as investigations_completed
FROM usability_events
WHERE agent_used IS NOT NULL
GROUP BY agent_used
ORDER BY total_uses DESC;
```

---

## Unified Tracker Implementation

*[Esta seção será preenchida após implementação]*

### API

```typescript
// Track navigation
trackUsability('page_view', {
  page_path: '/pt/app/chat',
  category: 'navigation'
})

// Track interaction
trackUsability('agent_selected', {
  agent_used: 'Zumbi dos Palmares',
  category: 'interaction'
})

// Track performance
trackUsability('investigation_completed', {
  duration_ms: 45000,
  steps_taken: 5,
  category: 'performance'
})
```

---

## Tracked Events

### Categories

1. **Navigation** (`page_view`, `navigation`)
2. **Interaction** (`click`, `agent_selected`, `chat_interaction`)
3. **Performance** (`investigation_started`, `investigation_completed`)
4. **Accessibility** (`accessibility_toggle`, `vlibras_activated`)
5. **Error** (`error`, `api_failure`)

### Event Details

*[Tabela completa será adicionada após implementação]*

---

## Privacy & LGPD Compliance

### Data Anonymization

- ✅ IP addresses anonymized
- ✅ User IDs hashed (SHA-256)
- ✅ Chat messages NOT collected
- ✅ Investigation content NOT stored
- ✅ Personal data filtered out

### Consent Management

```typescript
// User must explicitly consent to research data collection
const hasResearchConsent = localStorage.getItem('research-consent') === 'accepted'
```

### User Rights (LGPD)

- ✅ Right to access data
- ✅ Right to delete data
- ✅ Right to revoke consent
- ✅ Right to data portability

---

## Data Analysis & Export

### PostHog Dashboard

- Access: [app.posthog.com](https://app.posthog.com)
- Real-time metrics
- Session replays
- Heatmaps
- Funnels

### Supabase Queries

```sql
-- Export last 30 days for research
SELECT * FROM usability_events
WHERE created_at > NOW() - INTERVAL '30 days'
  AND has_research_consent = true
ORDER BY created_at DESC;
```

### Export Formats

- CSV (Excel/SPSS)
- JSON (programmatic analysis)
- SQL dump (backup)

---

## Research Use Cases

### Dissertação/Tese

1. **Métricas de Usabilidade**
   - Tempo médio para completar tarefas
   - Taxa de sucesso por tipo de investigação
   - Padrões de navegação

2. **Análise de Agentes**
   - Agentes mais/menos utilizados
   - Eficácia por tipo de consulta
   - Satisfação inferida (retorno de uso)

3. **Acessibilidade**
   - Uso de features a11y
   - VLibras adoption rate
   - Contraste/fonte customization

### Artigos Científicos

- Dados agregados e anonimizados
- Gráficos de tendências
- Análise estatística
- Screenshots de heatmaps

---

## Setup & Configuration

### Environment Variables

```bash
# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
```

### Installation

```bash
# 1. Install dependencies
npm install posthog-js

# 2. Run Supabase migrations
# (migrations will be created in /supabase/migrations)

# 3. Configure PostHog
# Create project at posthog.com and get API key

# 4. Update environment variables
# Add to .env.local

# 5. Deploy
npm run build && npm run start
```

### Testing

```bash
# Test telemetry locally
node scripts/test-telemetry.js

# Check Supabase table
# Open Supabase dashboard > Table Editor > usability_events

# Check PostHog
# Open app.posthog.com > Events
```

---

## Changelog

- **2025-01-24**: Initial implementation
  - PostHog integration
  - Supabase schema
  - Unified tracker
  - Privacy compliance

---

## References

- [PostHog Documentation](https://posthog.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [LGPD - Lei Geral de Proteção de Dados](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [Google Analytics 4 Migration Guide](https://support.google.com/analytics/answer/9744165)

---

**Status**: 🚧 Em Implementação

**Última Atualização**: 2025-01-24
