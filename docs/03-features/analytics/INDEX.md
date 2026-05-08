# Analytics Documentation Index

**Sistema de Analytics para Pesquisa de Usabilidade**
**Autor**: Anderson Henrique da Silva
**Data**: 2025-01-24
**Status**: ✅ 100% Implementado

---

## 📚 Guia de Leitura

### 🚀 Para Começar (Leia PRIMEIRO)

1. **[ANALYTICS_SUMMARY.md](../../ANALYTICS_SUMMARY.md)** ⭐ **COMECE AQUI**
   - Resumo executivo de tudo
   - Status de implementação
   - Quick start em 3 passos
   - Custo: R$ 0,00
   - O que foi implementado
   - Próximos passos

### 📖 Documentação Principal

2. **[README.md](README.md)**
   - Visão geral do sistema
   - Arquitetura completa
   - Privacy & LGPD compliance
   - Casos de uso acadêmicos
   - SQL queries prontas

3. **[SETUP_GUIDE.md](SETUP_GUIDE.md)**
   - Guia passo a passo completo
   - Configuração PostHog (5 min)
   - Migration Supabase
   - Acesso aos dados
   - Troubleshooting

4. **[USABILITY_ANALYTICS_IMPLEMENTATION.md](USABILITY_ANALYTICS_IMPLEMENTATION.md)**
   - Especificação técnica detalhada
   - Diagramas de arquitetura
   - Database schema completo
   - Event tracking catalog
   - Privacy mechanisms

### 🛠️ Guias Práticos

5. **[MIGRATION_INSTRUCTIONS.md](MIGRATION_INSTRUCTIONS.md)**
   - Como rodar migration Supabase
   - Passo a passo visual
   - Queries de validação
   - Erros comuns e soluções

6. **[VALIDATION_CHECKLIST.md](VALIDATION_CHECKLIST.md)**
   - Checklist completo de validação
   - Testes de funcionamento
   - Métricas de sucesso
   - Troubleshooting avançado
   - Critérios de aceitação

---

## 🎯 Guia Rápido por Perfil

### 👨‍🔬 Você é Pesquisador (PhD/Mestrado)?

**Leia na ordem:**

1. [ANALYTICS_SUMMARY.md](../../ANALYTICS_SUMMARY.md) - Entenda o que está disponível
2. [README.md](README.md) - Veja exemplos de queries SQL
3. [SETUP_GUIDE.md](SETUP_GUIDE.md) - Como acessar os dados
4. Comece a coletar dados! 📊

**Você terá:**

- Session replays (vídeos de uso)
- Métricas quantitativas (tempo, taxa de sucesso)
- Export CSV/JSON para análise
- Queries SQL prontas para sua tese

---

### 👨‍💻 Você é Desenvolvedor?

**Leia na ordem:**

1. [ANALYTICS_SUMMARY.md](../../ANALYTICS_SUMMARY.md) - Overview técnico
2. [USABILITY_ANALYTICS_IMPLEMENTATION.md](USABILITY_ANALYTICS_IMPLEMENTATION.md) - Arquitetura
3. [MIGRATION_INSTRUCTIONS.md](MIGRATION_INSTRUCTIONS.md) - Setup Supabase
4. [VALIDATION_CHECKLIST.md](VALIDATION_CHECKLIST.md) - Testes

**Você precisa:**

- Rodar migration Supabase (1x)
- Configurar env variables
- Validar eventos no PostHog

---

### 🎨 Você é UX Designer?

**Leia na ordem:**

1. [ANALYTICS_SUMMARY.md](../../ANALYTICS_SUMMARY.md) - O que podemos medir
2. [SETUP_GUIDE.md](SETUP_GUIDE.md) - Como acessar session replays
3. [README.md](README.md) - Exemplos de insights

**Você terá:**

- Session replays com cliques e navegação
- Heatmaps de interação
- Métricas de usabilidade
- Jornadas de usuário completas

---

### 🛡️ Você é Compliance/Legal?

**Leia na ordem:**

1. [README.md](README.md) - Seção "Privacy & LGPD"
2. [USABILITY_ANALYTICS_IMPLEMENTATION.md](USABILITY_ANALYTICS_IMPLEMENTATION.md) - Seção "Privacy"
3. Política de Privacidade: `app/pt/privacy/page.tsx`

**Você precisa saber:**

- LGPD Art. 7º, IV (base legal)
- Consentimento em 2 níveis
- Anonimização SHA-256
- User rights completos
- Dados NÃO coletados

---

## 📂 Estrutura de Arquivos

```
docs/analytics/
├── INDEX.md                                    ← VOCÊ ESTÁ AQUI
├── README.md                                   ← Visão geral
├── SETUP_GUIDE.md                              ← Setup passo a passo
├── USABILITY_ANALYTICS_IMPLEMENTATION.md       ← Spec técnica
├── MIGRATION_INSTRUCTIONS.md                   ← Migration Supabase
└── VALIDATION_CHECKLIST.md                     ← Testes e validação

ANALYTICS_SUMMARY.md                            ← Resumo executivo (raiz)

lib/analytics/
├── posthog-config.ts                          ← PostHog config
└── usability-tracker.ts                       ← Tracker unificado

app/api/analytics/
└── track/route.ts                             ← API para Supabase

components/
├── providers/analytics-provider.tsx           ← Provider React
└── research-consent-banner.tsx                ← Banner consentimento

supabase/migrations/
└── 20250124000000_create_usability_events.sql ← Migration SQL

app/pt/privacy/page.tsx                        ← Política (Seção 8)
```

---

## 🔗 Links Rápidos

### Dashboards

- **PostHog**: https://app.posthog.com
- **Supabase**: https://supabase.com/dashboard
- **Site Produção**: https://cidadao-ai-frontend.vercel.app

### Documentação Externa

- **PostHog Docs**: https://posthog.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **LGPD**: http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm

### Repositório

- **GitHub**: https://github.com/anderson-ntlabs/cidadao.ai-frontend
- **Branch**: `feature/production-ready-improvements`
- **Commits**: 6 commits profissionais

---

## ✅ Status de Implementação

| Componente         | Status      | Arquivo                                       |
| ------------------ | ----------- | --------------------------------------------- |
| PostHog Config     | ✅ Completo | `lib/analytics/posthog-config.ts`             |
| Unified Tracker    | ✅ Completo | `lib/analytics/usability-tracker.ts`          |
| API Route          | ✅ Completo | `app/api/analytics/track/route.ts`            |
| Supabase Schema    | ✅ Completo | `supabase/migrations/...sql`                  |
| Analytics Provider | ✅ Completo | `components/providers/analytics-provider.tsx` |
| Consent Banner     | ✅ Completo | `components/research-consent-banner.tsx`      |
| Privacy Policy     | ✅ Completo | `app/pt/privacy/page.tsx`                     |
| Documentation      | ✅ Completo | `docs/analytics/**`                           |
| Build & Deploy     | ✅ Completo | Vercel ✅                                     |
| Migration Executed | ✅ Completo | Supabase ✅                                   |

**Total**: 10/10 componentes ✅

---

## 🎯 Próximos Passos

### Agora (Validação)

1. ✅ Rodar migration Supabase (FEITO)
2. 🔄 Aceitar consentimentos em produção
3. 🔄 Validar eventos no PostHog
4. 🔄 Validar dados no Supabase

### Depois (Uso)

1. Coletar 30 dias de dados
2. Exportar dataset
3. Análise estatística
4. Escrever metodologia (paper/tese)

---

## 💡 Perguntas Frequentes

### Quanto custa?

**R$ 0,00** - PostHog e Supabase free tier

### É LGPD compliant?

**Sim** - Base legal: Art. 7º, IV (pesquisa com anonimização)

### Quanto tempo para setup?

**5 minutos** - Migration Supabase + env variables

### Posso usar para minha tese?

**Sim** - Dados anonimizados, SQL queries prontas, export CSV

### Onde vejo os dados?

- **PostHog**: https://app.posthog.com (session replays, gráficos)
- **Supabase**: https://supabase.com/dashboard (SQL, export)

### Como exportar dados?

```sql
SELECT * FROM usability_events
WHERE created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;
-- Click "Download CSV" no Supabase
```

### Session replay funciona?

**Sim** - Após usuário aceitar research consent

### Coleta mensagens do chat?

**NÃO** - Apenas métricas agregadas (tempo, cliques, navegação)

---

## 📞 Suporte

**Issues**: https://github.com/anderson-ntlabs/cidadao.ai-frontend/issues

**Dúvidas**:

1. Leia a documentação relevante (veja guias acima)
2. Consulte o VALIDATION_CHECKLIST.md
3. Abra issue no GitHub se persistir

---

**Última Atualização**: 2025-01-24
**Versão**: 1.0
**Status**: ✅ **PRODUCTION READY**
