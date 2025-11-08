# Analytics Setup Guide

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data**: 2025-01-24

---

## 🚀 Quick Start (5 minutos)

### 1. Criar Conta PostHog (Grátis)

1. Acesse [https://app.posthog.com/signup](https://app.posthog.com/signup)
2. Crie conta com Google/GitHub/Email
3. Crie um novo projeto: "Cidadão.AI Research"
4. Copie o **Project API Key** (começa com `phc_`)

### 2. Configurar Environment Variables

```bash
# Em .env.local
NEXT_PUBLIC_POSTHOG_KEY=phc_seu_api_key_aqui
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 3. Executar Migration Supabase

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto Cidadão.AI
3. Vá em **SQL Editor**
4. Cole o conteúdo de `supabase/migrations/20250124000000_create_usability_events.sql`
5. Clique em **Run**

### 4. Integrar no Layout Principal

Adicione o `AnalyticsProvider` no layout root:

```tsx
// app/layout.tsx
import { AnalyticsProvider } from '@/components/providers/analytics-provider'
import { ResearchConsentBanner } from '@/components/research-consent-banner'

export default function RootLayout({ children }: { children: React.Node }) {
  return (
    <html>
      <body>
        <AnalyticsProvider>
          {children}
          <ResearchConsentBanner locale="pt" />
        </AnalyticsProvider>
      </body>
    </html>
  )
}
```

### 5. Testar

```bash
npm run dev
```

Abra `http://localhost:3000/pt` e:

1. Aceite cookies
2. Aceite consentimento de pesquisa
3. Navegue pela plataforma
4. Verifique PostHog Dashboard: Events devem aparecer

---

## 📊 Acessando os Dados

### PostHog Dashboard

**URL**: https://app.posthog.com

**O que você vê:**

- **Events**: Lista de todos os eventos capturados
- **Session Recordings**: Vídeos das sessões dos usuários (🔥 MUITO ÚTIL!)
- **Insights**: Gráficos e análises customizadas
- **Dashboards**: Painéis com métricas agregadas

**Eventos Rastreados:**

- `page_view` - Visualização de página
- `agent_selected` - Seleção de agente
- `chat_interaction` - Interação no chat
- `investigation_started` - Início de investigação
- `investigation_completed` - Conclusão de investigação
- `accessibility_toggle` - Uso de features de acessibilidade

### Supabase Analytics

**URL**: https://supabase.com/dashboard

**Como consultar:**

1. Vá em **SQL Editor**
2. Use as views pré-criadas:

```sql
-- Resumo diário
SELECT * FROM daily_event_summary
WHERE date > CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC;

-- Agentes mais usados
SELECT * FROM agent_usage_stats
ORDER BY total_uses DESC;

-- Dispositivos e navegadores
SELECT * FROM device_browser_stats;

-- Uso de acessibilidade
SELECT * FROM accessibility_usage
WHERE date > CURRENT_DATE - INTERVAL '30 days';

-- Performance geral
SELECT * FROM performance_metrics;
```

**Exportar para Excel/SPSS:**

```sql
-- Exportar últimos 30 dias
SELECT
  event_type,
  event_category,
  created_at,
  device_type,
  browser,
  agent_used,
  duration_ms,
  steps_taken,
  is_authenticated
FROM usability_events
WHERE created_at > CURRENT_DATE - INTERVAL '30 days'
  AND has_research_consent = true
ORDER BY created_at DESC;
```

Clique em **Download CSV** no Supabase.

---

## 🔬 Casos de Uso para Pesquisa

### 1. Análise de Usabilidade

**Pergunta**: Quanto tempo usuários levam para completar uma investigação?

**PostHog Query:**

```javascript
// Insights > New Insight > Trends
Event: investigation_completed
Property: duration_ms
Aggregation: Average
```

**Resultado**: Gráfico mostrando tempo médio ao longo do tempo.

### 2. Agentes Mais Eficazes

**Pergunta**: Quais agentes têm maior taxa de conclusão?

**Supabase Query:**

```sql
SELECT
  agent_used,
  COUNT(*) FILTER (WHERE event_type = 'investigation_started') as started,
  COUNT(*) FILTER (WHERE event_type = 'investigation_completed') as completed,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE event_type = 'investigation_completed') /
    NULLIF(COUNT(*) FILTER (WHERE event_type = 'investigation_started'), 0),
    2
  ) as completion_rate
FROM usability_events
WHERE agent_used IS NOT NULL
GROUP BY agent_used
ORDER BY completion_rate DESC;
```

### 3. Análise de Acessibilidade

**Pergunta**: Quantos usuários utilizam VLibras?

**Supabase Query:**

```sql
SELECT
  COUNT(DISTINCT session_id) as users_with_vlibras,
  COUNT(*) as total_activations,
  AVG(time_on_page) as avg_time_with_vlibras
FROM usability_events
WHERE interaction_type = 'vlibras'
  AND event_category = 'accessibility';
```

### 4. Session Replay para UX Research

**PostHog > Session Recordings:**

1. Filtre por evento: `investigation_completed`
2. Assista sessões que completaram investigações
3. Identifique padrões de navegação
4. Encontre pontos de fricção

**💡 SUPER ÚTIL:** Você VÊ exatamente onde usuários têm dificuldade!

---

## 📈 Métricas para Dissertação/Tese

### Eficiência

```sql
-- Tempo médio para completar tarefas
SELECT
  interaction_type,
  AVG(duration_ms) / 1000.0 as avg_seconds,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms) / 1000.0 as median_seconds,
  COUNT(*) as sample_size
FROM usability_events
WHERE event_type = 'investigation_completed'
  AND duration_ms IS NOT NULL
GROUP BY interaction_type;
```

### Satisfação (Proxy)

```sql
-- Taxa de retorno (proxy de satisfação)
SELECT
  COUNT(DISTINCT session_id) as total_sessions,
  COUNT(DISTINCT user_hash) as unique_users,
  ROUND(COUNT(DISTINCT session_id)::numeric / COUNT(DISTINCT user_hash), 2) as avg_sessions_per_user
FROM usability_events
WHERE user_hash IS NOT NULL;
```

### Acessibilidade

```sql
-- Adoção de features a11y
SELECT
  interaction_type,
  COUNT(DISTINCT session_id) as unique_users,
  COUNT(*) as total_uses,
  ROUND(100.0 * COUNT(DISTINCT session_id) /
    (SELECT COUNT(DISTINCT session_id) FROM usability_events), 2
  ) as adoption_rate
FROM usability_events
WHERE event_category = 'accessibility'
GROUP BY interaction_type
ORDER BY adoption_rate DESC;
```

---

## 🛡️ Privacy & LGPD

### Dados Anonimizados

✅ **SIM (coletamos):**

- Padrões de navegação agregados
- Tempos de resposta médios
- Tipos de interação
- Dispositivos e navegadores (geral)
- Features de acessibilidade usadas

❌ **NÃO (não coletamos):**

- Mensagens do chat
- Conteúdo de investigações
- Dados pessoais identificáveis
- IPs sem anonimização
- Cookies de rastreamento

### Consentimento do Usuário

1. **Cookie Consent** (banner verde)
   - Usuário aceita cookies essenciais

2. **Research Consent** (banner azul/roxo)
   - Usuário aceita especificamente coleta para pesquisa
   - Pode recusar sem perder funcionalidades
   - Pode revogar a qualquer momento

### Verificar Consentimento

```javascript
// No browser console
localStorage.getItem('cookie-consent') // 'accepted' ou 'rejected'
localStorage.getItem('research-consent') // 'accepted' ou 'rejected'
```

### Excluir Dados de um Usuário

```sql
-- Admin only
DELETE FROM usability_events
WHERE user_hash = 'hash_do_usuario';
```

---

## 📚 Publicação Científica

### Formato Recomendado (Paper/Tese)

**Seção de Metodologia:**

> "A coleta de dados de usabilidade foi realizada através do sistema PostHog (https://posthog.com), uma plataforma open-source de análise de produto. Os dados foram armazenados de forma redundante em banco de dados PostgreSQL (Supabase) para análise posterior. Todos os participantes forneceram consentimento explícito para coleta de dados anonimizados, em conformidade com a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).
>
> As métricas coletadas incluíram: (1) tempo de conclusão de tarefas, (2) número de passos realizados, (3) taxa de sucesso, (4) padrões de navegação, e (5) utilização de recursos de acessibilidade. Identificadores pessoais foram substituídos por hashes criptográficos SHA-256 antes do armazenamento."

**Tabela Exemplo:**

| Métrica                   | Média | Desvio Padrão | n   |
| ------------------------- | ----- | ------------- | --- |
| Tempo de investigação (s) | 127.3 | 45.2          | 234 |
| Passos até conclusão      | 5.8   | 2.1           | 234 |
| Taxa de sucesso (%)       | 87.2  | -             | 234 |

**Gráficos:**

- Exportar de PostHog Insights
- Screenshots de Session Replays (anonimizados)
- Heatmaps de cliques

---

## 🚨 Troubleshooting

### PostHog não está rastreando

1. **Verifique a API Key:**

   ```bash
   echo $NEXT_PUBLIC_POSTHOG_KEY
   ```

2. **Console do navegador:**

   ```javascript
   // Deve aparecer: [PostHog] Initialized successfully
   ```

3. **Verifique consentimento:**
   ```javascript
   localStorage.getItem('research-consent') === 'accepted'
   ```

### Supabase não está salvando

1. **Rode a migration:**
   - SQL Editor > Cole o arquivo de migration > Run

2. **Verifique RLS policies:**

   ```sql
   SELECT * FROM usability_events LIMIT 1;
   ```

3. **Check API route:**
   ```bash
   curl -X POST http://localhost:3000/api/analytics/track \
     -H "Content-Type: application/json" \
     -d '{
       "event_type": "test",
       "event_category": "interaction",
       "session_id": "test123",
       "has_research_consent": true
     }'
   ```

### Session Replay não funciona

1. **Verifique consentimento:**
   - Session recording só funciona com `research-consent` aceito

2. **CSP (Content Security Policy):**
   - PostHog pode precisar de CSP ajustado
   - Veja documentação: https://posthog.com/docs/session-replay

---

## 📞 Suporte

- **PostHog Docs**: https://posthog.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Issues**: https://github.com/anderson-ufrj/cidadao.ai-frontend/issues

---

**Status**: ✅ Pronto para Uso

**Custo**: R$ 0,00 (Free tiers)

**LGPD Compliant**: ✅ Sim
