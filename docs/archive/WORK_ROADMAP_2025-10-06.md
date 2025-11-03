# 🚀 Roadmap de Trabalho - 06 de Outubro de 2025

**Data:** 06 de outubro de 2025, 13:26:26 -03 (Horário de Brasília)
**Autor:** Anderson Henrique da Silva
**Localização:** Minas Gerais, Brasil
**Projeto:** Cidadão.AI - Frontend
**Status Atual:** Em Produção no Vercel (82% completo)

---

## 📋 CONTEXTO

### Situação Atual

- ✅ Aplicação **DEPLOYED EM PRODUÇÃO** no Vercel
- ✅ 82% do projeto implementado (56.5 SP de 69 SP)
- ✅ Arquitetura enterprise-grade funcionando
- ⚠️ **66 testes falhando** (7% de taxa de falha)
- ⚠️ **Monitoring não configurado** (sem Sentry DSN, sem Vercel KV)
- ⚠️ **E2E tests incompletos** (Playwright configurado mas não rodando)

### Descobertas da Análise

Após análise detalhada do código, identificamos:

1. Projeto muito mais avançado do que documentado (82% vs 27.5% reportado)
2. Qualidade de código excepcional (zero erros TypeScript em produção)
3. Bundle otimizado (<400KB, meta atingida)
4. Security headers A+ rating
5. Gaps críticos em testes e monitoring

---

## 🎯 OBJETIVOS DO DIA

### Meta Principal

**Estabilizar produção com monitoring ativo e testes confiáveis**

### Objetivos Específicos

1. ✅ Corrigir testes unitários falhando (prioridade máxima)
2. ✅ Configurar Sentry para error tracking em produção
3. ✅ Provisionar e configurar Vercel KV para cache distribuído
4. ✅ Atualizar documentação com status real de produção
5. ✅ Commits técnicos em inglês seguindo convenções internacionais

---

## 📅 CRONOGRAMA DE TRABALHO

### 🔴 Fase 1: Correção de Testes (13:30 - 17:00)

**Duração:** 3.5 horas
**Prioridade:** CRÍTICA

#### Objetivo

Corrigir os 66 testes falhando para garantir CI/CD confiável em produção.

#### Tarefas Detalhadas

**13:30 - 14:00 | Análise e Diagnóstico (30 min)**

- [ ] Executar `npm run test:coverage` e capturar output completo
- [ ] Categorizar falhas por tipo:
  - Type definition errors
  - Mock configuration issues
  - API contract mismatches
  - Component prop changes
- [ ] Priorizar por criticidade (auth > chat > UI components)
- [ ] Criar checklist de correções

**14:00 - 15:00 | Correção de Type Definitions (1h)**

- [ ] Fix `__tests__/integration/auth/use-auth.test.tsx`
  - Corrigir `UserInfo` interface (adicionar is_active, created_at)
  - Corrigir `LoginResponse` type (access_token, refresh_token, etc)
- [ ] Fix `__tests__/unit/components/card.test.tsx`
  - Resolver referências ao `vi` (Vitest mock)
  - Adicionar imports corretos
- [ ] Commit: `test: fix type definitions in auth and card tests`

**15:00 - 16:00 | Correção de Accessibility Tests (1h)**

- [ ] Instalar `@types/jest-axe` se necessário
- [ ] Fix `components/a11y/accessibility.test.tsx`
  - Configurar jest-axe com Vitest
  - Corrigir Card component subproperties (Header, Content, Title)
  - Atualizar Button variants (primary → default, danger → destructive)
  - Fix SkipLink props requirements
- [ ] Commit: `test: fix accessibility tests with jest-axe integration`

**16:00 - 17:00 | Correção de Component Tests (1h)**

- [ ] Fix `components/a11y/keyboard-navigation.test.tsx`
  - Atualizar Modal props: `isOpen` → `open`
  - Ajustar mock configurations
- [ ] Executar suite completa de testes
- [ ] Verificar 100% pass rate
- [ ] Commit: `test: fix keyboard navigation and modal tests`

**Meta da Fase 1:** 100% de pass rate (940 testes passando)

---

### 🟡 Fase 2: Setup de Monitoring (17:00 - 18:00)

**Duração:** 1 hora
**Prioridade:** ALTA

#### Objetivo

Configurar observabilidade em produção para detectar erros e performance issues.

#### Tarefas Detalhadas

**17:00 - 17:30 | Sentry Setup (30 min)**

- [ ] Acessar sentry.io e criar conta (se não tiver)
- [ ] Criar novo projeto:
  - Platform: Next.js
  - Nome: `cidadao-ai-frontend-production`
  - Team: Personal/Organization
- [ ] Copiar DSN (Data Source Name)
- [ ] Acessar Vercel Dashboard → Settings → Environment Variables
- [ ] Adicionar variáveis:
  ```
  NEXT_PUBLIC_SENTRY_DSN=https://[key]@[project].ingest.sentry.io/[id]
  SENTRY_AUTH_TOKEN=[token]
  ```
- [ ] Scope: Production
- [ ] Trigger redeploy no Vercel
- [ ] Commit (se houver alterações): `ci: add sentry configuration for production monitoring`

**17:30 - 18:00 | Vercel KV Setup (30 min)**

- [ ] Acessar Vercel Dashboard → Storage
- [ ] Criar novo KV Database:
  - Type: KV (Redis)
  - Name: `cidadao-ai-kv-production`
  - Region: `iad1` (US East - baixa latência)
- [ ] Vercel adiciona automaticamente env vars:
  - `KV_REST_API_URL`
  - `KV_REST_API_TOKEN`
  - `KV_REST_API_READ_ONLY_TOKEN`
- [ ] Verificar vars foram adicionadas ao projeto
- [ ] Trigger redeploy (se necessário)
- [ ] Testar cache funcionando via dashboard

**Meta da Fase 2:** Monitoring ativo e cache distribuído funcionando

---

### 📊 Fase 3: Validação e Documentação (18:00 - 19:00)

**Duração:** 1 hora
**Prioridade:** MÉDIA

#### Objetivo

Validar mudanças e atualizar documentação com status real.

#### Tarefas Detalhadas

**18:00 - 18:30 | Validação de Produção (30 min)**

- [ ] Acessar URL de produção
- [ ] Verificar Sentry está recebendo eventos:
  - Performance transactions
  - Error tracking
  - Breadcrumbs
- [ ] Verificar Vercel KV:
  - Dashboard mostra conexões
  - Cache hits/misses registrados
- [ ] Testar fluxos críticos:
  - Login/Logout
  - Chat com backend
  - Dashboard de investigações
  - Export de dados
- [ ] Verificar console browser (sem erros críticos)
- [ ] Testar em mobile (responsive)

**18:30 - 19:00 | Atualização de Documentação (30 min)**

- [ ] Atualizar `docs/reports/CODE_AUDIT_2025-10-04.md`:
  - Marcar Sprint 5 como em progresso
  - Atualizar % de testes corrigidos
  - Adicionar seção de monitoring configurado
- [ ] Atualizar `docs/deployment/PRODUCTION_DEPLOY_CHECKLIST.md`:
  - Marcar checkboxes completados
  - Adicionar status de Sentry
  - Adicionar status de Vercel KV
- [ ] Criar `docs/reports/PRODUCTION_STATUS_2025-10-06.md`:
  - Estado atual da aplicação
  - Métricas de produção
  - Issues conhecidos
  - Próximos passos
- [ ] Commit: `docs: update production status and monitoring setup`

**Meta da Fase 3:** Documentação atualizada e produção validada

---

## 📊 MÉTRICAS DE SUCESSO

### Testes

- [x] Taxa de falha atual: 7% (66/940 falhando)
- [ ] **Meta:** 0% de falha (940/940 passando)
- [ ] **Medição:** `npm run test:coverage`

### Monitoring

- [x] Sentry configurado: ❌ Não
- [ ] **Meta:** Sentry ativo e recebendo eventos
- [ ] **Medição:** Dashboard Sentry mostrando dados

### Cache

- [x] Vercel KV provisionado: ❌ Não
- [ ] **Meta:** KV ativo com hit rate >50%
- [ ] **Medição:** Vercel KV dashboard

### Produção

- [x] Deploy status: ✅ Ativo
- [ ] **Meta:** Zero erros críticos
- [ ] **Medição:** Sentry error rate <1%

---

## 🔧 COMANDOS PRINCIPAIS

### Testes

```bash
# Rodar todos os testes
npm run test

# Rodar com coverage
npm run test:coverage

# Rodar específico
npm run test -- path/to/test.tsx

# Watch mode
npm run test:watch
```

### Build e Deploy

```bash
# Build local
npm run build

# Type check
npm run type-check

# Lint
npm run lint

# Deploy Vercel (via CLI)
vercel --prod
```

### Monitoring

```bash
# Verificar env vars Vercel
vercel env ls

# Ver logs produção
vercel logs [deployment-url]
```

---

## 📝 CONVENÇÕES DE COMMIT

### Formato

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types Permitidos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `test`: Adição ou correção de testes
- `docs`: Apenas documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração sem mudança de comportamento
- `perf`: Melhoria de performance
- `ci`: Mudanças em CI/CD
- `build`: Mudanças no build system
- `chore`: Tarefas de manutenção

### Exemplos

```bash
# Correção de testes
test: fix type definitions in auth integration tests

# Setup de CI
ci: add sentry configuration for production monitoring

# Documentação
docs: update production deployment checklist

# Correção de bug
fix: resolve type mismatch in UserInfo interface

# Performance
perf: optimize bundle size with dynamic imports
```

### Regras IMPORTANTES

- ✅ Commits em **inglês** (padrão internacional)
- ✅ Mensagens **técnicas e objetivas**
- ✅ Máximo 72 caracteres no subject
- ❌ **NUNCA** mencionar "Claude Code", "AI", "LLM"
- ❌ **NUNCA** usar emojis nos commits
- ✅ Commits **atômicos** (uma mudança lógica por commit)

---

## 🚦 CRITÉRIOS DE PARADA

### Fase 1 Completa Quando:

- [ ] `npm run test` mostra 100% pass rate
- [ ] Zero TypeScript errors em tests
- [ ] Todos os 66 testes corrigidos
- [ ] Commits realizados para cada categoria de fix

### Fase 2 Completa Quando:

- [ ] Sentry recebendo eventos de produção
- [ ] Vercel KV mostrando conexões ativas
- [ ] Dashboard de monitoring acessível
- [ ] Env vars configuradas corretamente

### Fase 3 Completa Quando:

- [ ] Documentação atualizada
- [ ] Status de produção validado
- [ ] Nenhum erro crítico em console
- [ ] Fluxos principais testados e funcionando

---

## 📋 CHECKLIST FINAL DO DIA

### Código

- [ ] 100% dos testes passando (940/940)
- [ ] Zero TypeScript errors
- [ ] Zero ESLint warnings
- [ ] Build successful

### Infraestrutura

- [ ] Sentry configurado e ativo
- [ ] Vercel KV provisionado
- [ ] Monitoring dashboards funcionando
- [ ] Cache distribuído operacional

### Documentação

- [ ] Roadmap de hoje documentado ✅
- [ ] Status de produção atualizado
- [ ] Checklist de deploy atualizado
- [ ] Relatório de progresso criado

### Commits

- [ ] Mínimo 4 commits técnicos
- [ ] Todos em inglês
- [ ] Seguindo convenções
- [ ] Mensagens descritivas

---

## 🎯 PRÓXIMOS PASSOS (Após Hoje)

### Terça-feira (07/10)

- [ ] Completar E2E tests (Playwright)
- [ ] Setup Lighthouse CI
- [ ] Configurar alertas no Sentry

### Quarta-feira (08/10)

- [ ] Performance optimization
- [ ] Bundle analysis
- [ ] Core Web Vitals monitoring

### Quinta-feira (09/10)

- [ ] Documentação final
- [ ] Production playbook
- [ ] Handoff documentation

---

## 📞 RECURSOS E REFERÊNCIAS

### Documentação

- [Vitest Documentation](https://vitest.dev/)
- [Sentry Next.js Integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Conventional Commits](https://www.conventionalcommits.org/)

### Dashboards

- Vercel: https://vercel.com/dashboard
- Sentry: https://sentry.io/
- GitHub: https://github.com/anderson-ufrj/cidadao.ai-frontend

### Suporte

- Email: anderson.ufrj@gmail.com
- Issues: github.com/anderson-ufrj/cidadao.ai-frontend/issues

---

## ✅ STATUS DE EXECUÇÃO

**Início:** 06/10/2025 13:26:26 -03
**Previsão de Término:** 06/10/2025 19:00:00 -03
**Duração Total:** 5.5 horas

**Progresso:**

- [ ] Fase 1: Correção de Testes (0% - Aguardando início)
- [ ] Fase 2: Setup de Monitoring (0% - Aguardando Fase 1)
- [ ] Fase 3: Validação e Docs (0% - Aguardando Fase 2)

**Última Atualização:** 06/10/2025 13:26:26 -03

---

**Documento criado e pronto para execução! 🚀**
