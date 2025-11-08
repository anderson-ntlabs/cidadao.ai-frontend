# Analytics & Research Data Collection

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Implementação**: 2025-01-24
**Status**: ✅ Implementado e Testado

---

## 📋 Resumo Executivo

Sistema de coleta de dados de usabilidade para pesquisa acadêmica sobre transparência pública digital. **100% gratuito, LGPD compliant, com consentimento explícito do usuário**.

### ✅ O que foi implementado

1. **PostHog Integration** (Session Replay + Heatmaps)
2. **Supabase Telemetry Storage** (Backup + Análise SQL)
3. **Unified Tracker** (Hub central de analytics)
4. **Privacy-First** (Anonimização + Consentimento)
5. **Research Documentation** (Guias completos)

### 💰 Custo

**R$ 0,00** - Tudo no free tier:

- PostHog: 1M eventos/mês grátis
- Supabase: 500MB database grátis

### 🎓 Para sua Pesquisa

**Você PODE coletar:**

- ✅ Tempo para completar investigações
- ✅ Padrões de navegação (agregados)
- ✅ Agentes mais/menos usados
- ✅ Taxa de sucesso por tipo de consulta
- ✅ Uso de features de acessibilidade
- ✅ Dispositivos e navegadores (geral)

**Você NÃO coleta:**

- ❌ Mensagens do chat
- ❌ Conteúdo de investigações
- ❌ Dados pessoais identificáveis
- ❌ IPs sem anonimização

---

## 🚀 Quick Start

### 1. Setup (5 minutos)

```bash
# 1. Instalar dependências (já feito)
npm install posthog-js

# 2. Configurar env
echo "NEXT_PUBLIC_POSTHOG_KEY=phc_seu_key" >> .env.local
echo "NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com" >> .env.local

# 3. Rodar migration Supabase
# (Cole o SQL do arquivo supabase/migrations/20250124000000_create_usability_events.sql)

# 4. Integrar providers (veja SETUP_GUIDE.md)

# 5. Deploy
npm run build && npm run start
```

### 2. Acessar Dados

**PostHog Dashboard:**

- URL: https://app.posthog.com
- Session Replays: Vê exatamente o que usuário fez
- Heatmaps: Onde clicam mais
- Insights: Gráficos customizados

**Supabase Analytics:**

- URL: https://supabase.com/dashboard
- SQL Editor: Queries customizadas
- Export CSV: Para Excel/SPSS

---

## 📊 Arquitetura

```
User Interaction
      ↓
Unified Tracker (lib/analytics/usability-tracker.ts)
      ↓
┌─────────┬──────────┬────────────┐
│ PostHog │ Supabase │ Telemetria │
└─────────┴──────────┴────────────┘
      ↓         ↓          ↓
 Dashboard    SQL     Console
```

### Componentes

| Arquivo                                                          | Função                  |
| ---------------------------------------------------------------- | ----------------------- |
| `lib/analytics/posthog-config.ts`                                | Config PostHog + LGPD   |
| `lib/analytics/usability-tracker.ts`                             | Tracker unificado       |
| `app/api/analytics/track/route.ts`                               | API para Supabase       |
| `components/providers/analytics-provider.tsx`                    | Provider React          |
| `components/research-consent-banner.tsx`                         | Banner de consentimento |
| `supabase/migrations/20250124000000_create_usability_events.sql` | Schema DB               |

---

## 🛡️ Privacy & LGPD

### Consentimento em 2 Níveis

1. **Cookie Consent** (banner verde)
   - Cookies essenciais para funcionamento

2. **Research Consent** (banner azul/roxo)
   - Coleta de dados para pesquisa científica
   - **OPCIONAL** - não afeta uso da plataforma
   - Revogável a qualquer momento

### Anonimização

- User IDs → SHA-256 hash
- IPs → Anonimizados pelo PostHog
- Mensagens → **NÃO coletadas**
- Investigações → **NÃO armazenadas**

### Base Legal

**LGPD Artigo 7º, IV:**

> "realização de estudos por órgão de pesquisa, garantida, sempre que possível, a anonimização dos dados pessoais"

✅ Compliance total

---

## 📚 Documentação

| Documento                                 | Descrição                           |
| ----------------------------------------- | ----------------------------------- |
| **SETUP_GUIDE.md**                        | Guia completo de configuração e uso |
| **USABILITY_ANALYTICS_IMPLEMENTATION.md** | Documentação técnica detalhada      |
| **README.md**                             | Este arquivo (visão geral)          |

---

## 🔬 Casos de Uso Acadêmicos

### Dissertação/Tese

**Exemplo de query para resultados:**

```sql
-- Métricas de eficiência por agente
SELECT
  agent_used,
  AVG(duration_ms) / 1000.0 as avg_time_seconds,
  AVG(steps_taken) as avg_steps,
  COUNT(*) FILTER (WHERE event_type = 'investigation_completed') as completed,
  COUNT(*) FILTER (WHERE event_type = 'investigation_started') as started,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE event_type = 'investigation_completed') /
    NULLIF(COUNT(*) FILTER (WHERE event_type = 'investigation_started'), 0),
    2
  ) as success_rate
FROM usability_events
WHERE agent_used IS NOT NULL
GROUP BY agent_used
ORDER BY success_rate DESC;
```

**Resultados em formato de tabela para paper:**

| Agente | Tempo Médio (s) | Passos | Taxa Sucesso (%) | n   |
| ------ | --------------- | ------ | ---------------- | --- |
| Zumbi  | 127.3           | 5.8    | 92.1             | 234 |
| Anita  | 156.7           | 6.2    | 87.5             | 189 |
| ...    | ...             | ...    | ...              | ... |

### Artigos Científicos

**Citação sugerida:**

> "Data collection was performed using PostHog (https://posthog.com), an open-source product analytics platform, with explicit user consent in compliance with Brazilian General Data Protection Law (LGPD, Law 13.709/2018). All personal identifiers were replaced with SHA-256 cryptographic hashes before storage."

---

## 📈 Métricas Disponíveis

### Navegação

- `page_view` - Visualizações de página
- `navigation` - Mudanças de rota
- `time_on_page` - Tempo em cada página

### Interação

- `click` - Cliques em elementos
- `agent_selected` - Seleção de agente
- `chat_interaction` - Uso do chat

### Performance

- `investigation_started` - Início de investigação
- `investigation_completed` - Conclusão (com tempo e passos)
- `export_data` - Exportação de dados

### Acessibilidade

- `accessibility_toggle` - Ativação de features a11y
  - `high_contrast` - Alto contraste
  - `font_size` - Tamanho de fonte
  - `vlibras` - VLibras (LIBRAS)

### Erros

- `error` - Erros e falhas

---

## 🎯 Próximos Passos

### Fase 1: Implementação Core ✅ CONCLUÍDO

- [x] PostHog integration
- [x] Supabase schema
- [x] Unified tracker
- [x] Privacy policy update
- [x] Consent banners
- [x] Documentation

### Fase 2: Component Integration 🔄 PRÓXIMO

- [ ] Add tracking to chat page
- [ ] Add tracking to investigation pages
- [ ] Add tracking to agent selection
- [ ] Add tracking to export features
- [ ] Add tracking to accessibility toggles

### Fase 3: Analysis & Research 📊 FUTURO

- [ ] Create PostHog dashboards
- [ ] Export first 30-day dataset
- [ ] Preliminary analysis
- [ ] Paper draft with results

---

## 🚨 Importante

### Antes de Deploy em Produção

1. ✅ Criar conta PostHog
2. ✅ Adicionar NEXT_PUBLIC_POSTHOG_KEY no Vercel
3. ✅ Rodar migration Supabase
4. ✅ Testar consent banners
5. ✅ Verificar eventos no PostHog

### Teste Local

```bash
# 1. Start dev server
npm run dev

# 2. Abra browser
open http://localhost:3000/pt

# 3. Aceite ambos os consentimentos

# 4. Navegue pela plataforma

# 5. Verifique PostHog dashboard
# Eventos devem aparecer em ~1 minuto
```

---

## 📞 Suporte & Recursos

### Links Úteis

- **PostHog Docs**: https://posthog.com/docs
- **PostHog Session Replay**: https://posthog.com/docs/session-replay
- **Supabase Docs**: https://supabase.com/docs
- **LGPD**: http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm

### Issues & Bugs

Abra issue em: https://github.com/anderson-ufrj/cidadao.ai-frontend/issues

---

## 📜 Licença & Ética

Todos os dados coletados são:

- ✅ Anonimizados
- ✅ Com consentimento explícito
- ✅ Usados apenas para pesquisa científica
- ✅ Nunca comercializados
- ✅ LGPD compliant

**Resultados de pesquisa** serão publicados de forma aberta (open science) para benefício da comunidade acadêmica e da sociedade.

---

**Implementado por:** Anderson Henrique da Silva
**Instituição:** Pesquisa em Transparência Pública Digital
**Contato:** GitHub Issues ou anderson-ufrj
**Data:** 2025-01-24
