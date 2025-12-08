# Roadmap de Consolidacao - Cidadao.AI Frontend

**Data**: Dezembro 2025
**Baseado em**: ANALISE_CRITICA.md
**Objetivo**: Preparar aplicacao para producao em 6 sprints de 6 dias

---

## Visao Geral

### Status Atual

- **Documentacao**: 9/10 (Excelente)
- **Acessibilidade**: 8/10 (Muito Bom)
- **Seguranca**: 7/10 (Bom mas com riscos)
- **Performance**: 4/10 (Critico)
- **Testes**: 3/10 (Falhando)
- **Manutenibilidade**: 4/10 (Alta divida tecnica)
- **Arquitetura**: 5/10 (Complexa demais)

### Meta Final

Atingir **Production Ready** com score minimo de 7/10 em todas as categorias.

---

## Sprint 1: Estabilizacao Critica (Dias 1-6)

### Objetivo

Resolver bloqueadores de deploy e habilitar CI completo.

### Tarefas Prioritarias

#### 1.1 Resolver Erros TypeScript Criticos

**Prioridade**: P0 (Blocker)
**Esforco**: Alto
**Arquivos**: `__tests__/**/*.test.ts`, `components/**/*.tsx`

```bash
# Diagnostico inicial
npm run type-check 2>&1 | head -100

# Alvo: Reduzir de 84 erros para 0
```

**Subtarefas**:

- [ ] Identificar e categorizar os 84 erros TypeScript
- [ ] Corrigir erros de tipos em interfaces ChatResponse
- [ ] Resolver imports faltantes em testes
- [ ] Atualizar tipos deprecados

#### 1.2 Habilitar Testes E2E no CI

**Prioridade**: P0 (Blocker)
**Esforco**: Medio
**Arquivos**: `.github/workflows/ci.yml`, `config/playwright.config.ts`

**Subtarefas**:

- [ ] Criar ambiente de teste com OAuth mock seguro
- [ ] Configurar GitHub Actions para rodar Playwright
- [ ] Remover flag "temporarily disabled"
- [ ] Adicionar screenshots de falha para debugging

#### 1.3 Remover Auth Mock de Producao

**Prioridade**: P0 (Security)
**Esforco**: Medio
**Arquivos**: `lib/supabase/**`, `hooks/use-agora*.ts`

**Subtarefas**:

- [ ] Auditar usos de localStorage para auth
- [ ] Criar feature flag para demo mode (apenas dev)
- [ ] Garantir Supabase Auth em producao
- [ ] Testar fluxo OAuth completo

#### 1.4 Documentar Diferenca app vs agora

**Prioridade**: P1
**Esforco**: Baixo
**Arquivos**: `docs/02-architecture/routing.md`

**Subtarefas**:

- [ ] Criar diagrama de rotas
- [ ] Documentar proposito de cada area
- [ ] Avaliar necessidade de consolidacao

### Criterios de Aceite Sprint 1

- [ ] Zero erros TypeScript em `npm run type-check`
- [ ] CI passa com todos os testes habilitados
- [ ] Auth mock removido de build de producao
- [ ] Documentacao de arquitetura atualizada

---

## Sprint 2: Qualidade de Codigo (Dias 7-12)

### Objetivo

Estabelecer baseline de qualidade e cobertura de testes.

### Tarefas Prioritarias

#### 2.1 Refatorar HeaderV2 em Componentes Menores

**Prioridade**: P1
**Esforco**: Alto
**Arquivos**: `components/header.tsx`, `components/header/**`

**Subtarefas**:

- [ ] Extrair `HeaderNavigation` (menu items)
- [ ] Extrair `HeaderUserMenu` (avatar, logout)
- [ ] Extrair `HeaderMobileMenu` (responsivo)
- [ ] Extrair `HeaderThemeToggle` (tema)
- [ ] Criar barrel export em `components/header/index.ts`

#### 2.2 Consolidar Chat Adapters

**Prioridade**: P1
**Esforco**: Alto
**Arquivos**: `lib/chat/adapters/**`

```
Atual:
- chat-adapter-backend.ts
- chat-adapter-fallback.ts
- chat-adapter-maritaca.ts
- chat-stream-backend.ts
- chat-direct.ts

Meta:
- primary.adapter.ts (backend)
- fallback.adapter.ts (LLM direto)
- base.adapter.ts (interface comum)
```

**Subtarefas**:

- [ ] Criar interface `ChatAdapter` padrao
- [ ] Consolidar em 2 adapters principais
- [ ] Remover codigo duplicado
- [ ] Atualizar ChatService para usar novos adapters
- [ ] Adicionar testes unitarios

#### 2.3 Aumentar Cobertura de Testes

**Prioridade**: P1
**Esforco**: Alto
**Meta**: 60% -> 75%

**Subtarefas**:

- [ ] Adicionar testes para ChatService
- [ ] Adicionar testes para stores Zustand
- [ ] Adicionar testes para hooks customizados
- [ ] Adicionar testes para componentes criticos

#### 2.4 Implementar Error Boundaries

**Prioridade**: P2
**Esforco**: Medio
**Arquivos**: `components/error-boundary.tsx`, `app/error.tsx`

**Subtarefas**:

- [ ] Criar ErrorBoundary generico
- [ ] Adicionar error.tsx em rotas criticas
- [ ] Integrar com Sentry para reporting
- [ ] Criar fallback UI amigavel

### Criterios de Aceite Sprint 2

- [ ] Header refatorado em 5+ componentes menores
- [ ] Chat adapters consolidados em 2
- [ ] Cobertura de testes >= 75%
- [ ] Error boundaries em todas as rotas principais

---

## Sprint 3: Performance (Dias 13-18)

### Objetivo

Reduzir bundle size e melhorar metricas de performance.

### Tarefas Prioritarias

#### 3.1 Reduzir Bundle Size

**Prioridade**: P0
**Esforco**: Alto
**Meta**: 400KB -> 250KB

**Subtarefas**:

- [ ] Analisar bundle com `ANALYZE=true npm run build`
- [ ] Mover jsPDF e html2canvas para dynamic import
- [ ] Otimizar imports de lucide-react (tree shaking)
- [ ] Revisar e remover dependencies nao utilizadas
- [ ] Configurar chunk splitting mais agressivo

#### 3.2 Otimizar Lazy Loading

**Prioridade**: P1
**Esforco**: Medio
**Arquivos**: `lib/utils/code-splitting.ts`

**Subtarefas**:

- [ ] Identificar componentes para lazy load
- [ ] Implementar Suspense boundaries
- [ ] Adicionar loading skeletons
- [ ] Medir impacto em First Contentful Paint

#### 3.3 Unificar Sistemas de Cache

**Prioridade**: P1
**Esforco**: Alto

```
Atual:
- Vercel KV
- localStorage
- IndexedDB
- Memory cache

Meta:
- Cache unificado com estrategia clara
```

**Subtarefas**:

- [ ] Documentar estrategia de cache por tipo de dado
- [ ] Criar `CacheService` unificado
- [ ] Migrar usos dispersos para novo service
- [ ] Implementar cache invalidation

#### 3.4 Otimizar para Mobile 3G

**Prioridade**: P2
**Esforco**: Medio

**Subtarefas**:

- [ ] Testar em throttling 3G
- [ ] Implementar progressive loading
- [ ] Otimizar imagens com next/image
- [ ] Adicionar prefetch para rotas criticas

### Criterios de Aceite Sprint 3

- [ ] Bundle < 250KB
- [ ] Lighthouse Performance >= 90
- [ ] Cache unificado implementado
- [ ] Mobile 3G carrega < 5s

---

## Sprint 4: Seguranca (Dias 19-24)

### Objetivo

Resolver vulnerabilidades e fortalecer seguranca.

### Tarefas Prioritarias

#### 4.1 Revisar e Melhorar CSP

**Prioridade**: P0 (Security)
**Esforco**: Alto
**Arquivos**: `lib/security/csp.ts`, `next.config.mjs`

**Subtarefas**:

- [ ] Remover 'unsafe-eval' (requer refatoracao)
- [ ] Reduzir 'unsafe-inline' ao minimo
- [ ] Adicionar nonces para scripts inline
- [ ] Testar com CSP Evaluator do Google
- [ ] Documentar excecoes necessarias

#### 4.2 Implementar Rate Limiting Persistente

**Prioridade**: P1
**Esforco**: Medio
**Arquivos**: `lib/security/rate-limit.ts`, `middleware.ts`

**Subtarefas**:

- [ ] Migrar de memory para Vercel KV
- [ ] Implementar sliding window
- [ ] Adicionar rate limit por endpoint
- [ ] Criar response headers de rate limit

#### 4.3 Adicionar Subresource Integrity (SRI)

**Prioridade**: P2
**Esforco**: Baixo

**Subtarefas**:

- [ ] Gerar hashes SRI para scripts externos
- [ ] Adicionar integrity attributes
- [ ] Configurar fallback para falha de SRI

#### 4.4 Security Audit

**Prioridade**: P1
**Esforco**: Medio

**Subtarefas**:

- [ ] Executar `npm audit`
- [ ] Rodar OWASP dependency check
- [ ] Revisar secrets management
- [ ] Testar CSRF protection

### Criterios de Aceite Sprint 4

- [ ] CSP sem 'unsafe-eval'
- [ ] Rate limiting persistente funcionando
- [ ] SRI em todos scripts externos
- [ ] Zero vulnerabilidades criticas em audit

---

## Sprint 5: UX e Acessibilidade (Dias 25-30)

### Objetivo

Polir experiencia do usuario e garantir acessibilidade total.

### Tarefas Prioritarias

#### 5.1 Adicionar Loading Skeletons

**Prioridade**: P1
**Esforco**: Medio
**Arquivos**: `components/ui/skeleton.tsx`

**Subtarefas**:

- [ ] Criar componentes Skeleton reutilizaveis
- [ ] Adicionar em paginas de carregamento lento
- [ ] Implementar em listas e cards
- [ ] Testar percepcao de velocidade

#### 5.2 Melhorar Feedback de Erros

**Prioridade**: P1
**Esforco**: Medio

**Subtarefas**:

- [ ] Revisar mensagens de erro
- [ ] Adicionar acoes de recuperacao
- [ ] Implementar retry automatico
- [ ] Criar paginas 404/500 customizadas

#### 5.3 Validar WCAG AAA

**Prioridade**: P2
**Esforco**: Medio

**Subtarefas**:

- [ ] Rodar axe-core em todas paginas
- [ ] Testar com screen reader (NVDA/VoiceOver)
- [ ] Validar contraste em todos temas
- [ ] Testar navegacao por teclado completa

#### 5.4 Otimizar VLibras

**Prioridade**: P2
**Esforco**: Baixo

**Subtarefas**:

- [ ] Garantir lazy loading correto
- [ ] Testar em conexoes lentas
- [ ] Adicionar fallback para falha de carregamento
- [ ] Documentar configuracao

### Criterios de Aceite Sprint 5

- [ ] Skeletons em todas paginas principais
- [ ] Zero erros WCAG Level AAA
- [ ] VLibras carrega confiavelmente
- [ ] Feedback de erro em todos fluxos

---

## Sprint 6: Producao Ready (Dias 31-36)

### Objetivo

Preparacao final para deploy em producao.

### Tarefas Prioritarias

#### 6.1 Configurar Monitoring Completo

**Prioridade**: P0
**Esforco**: Medio

**Subtarefas**:

- [ ] Validar Sentry captura todos erros
- [ ] Configurar alertas criticos
- [ ] Setup dashboards em Vercel Analytics
- [ ] Implementar health check endpoint

#### 6.2 Criar Runbook de Operacoes

**Prioridade**: P1
**Esforco**: Medio
**Arquivos**: `docs/09-deployment/runbook.md`

**Subtarefas**:

- [ ] Documentar procedimento de deploy
- [ ] Criar checklist pre-deploy
- [ ] Documentar rollback procedures
- [ ] Listar contatos de emergencia

#### 6.3 Testes de Carga

**Prioridade**: P1
**Esforco**: Medio

**Subtarefas**:

- [ ] Configurar k6 ou Artillery
- [ ] Definir baseline de performance
- [ ] Testar endpoints criticos
- [ ] Documentar limites de capacidade

#### 6.4 Revisao Final

**Prioridade**: P0
**Esforco**: Baixo

**Subtarefas**:

- [ ] Code review final
- [ ] Validar todas variaveis de ambiente
- [ ] Testar fluxos criticos manualmente
- [ ] Aprovacao de stakeholders

### Criterios de Aceite Sprint 6

- [ ] Monitoring funcionando e alertas configurados
- [ ] Runbook completo e revisado
- [ ] Testes de carga executados e aprovados
- [ ] Sign-off final para producao

---

## Metricas de Sucesso

### Antes vs Depois

| Metrica          | Atual | Meta  | Peso |
| ---------------- | ----- | ----- | ---- |
| Erros TypeScript | 84    | 0     | 20%  |
| Cobertura Testes | 60%   | 80%   | 15%  |
| Bundle Size      | 400KB | 250KB | 15%  |
| Lighthouse Perf  | ~80   | >90   | 15%  |
| WCAG Errors      | ?     | 0     | 10%  |
| Security Vulns   | 3     | 0     | 15%  |
| CI Pass Rate     | ~70%  | 100%  | 10%  |

### Score Final Esperado

| Categoria        | Antes | Depois |
| ---------------- | ----- | ------ |
| Documentacao     | 9/10  | 9/10   |
| Acessibilidade   | 8/10  | 9/10   |
| Seguranca        | 7/10  | 8/10   |
| Performance      | 4/10  | 8/10   |
| Testes           | 3/10  | 8/10   |
| Manutenibilidade | 4/10  | 7/10   |
| Arquitetura      | 5/10  | 7/10   |

---

## Riscos e Mitigacoes

### Riscos Identificados

| Risco                                        | Probabilidade | Impacto | Mitigacao                   |
| -------------------------------------------- | ------------- | ------- | --------------------------- |
| Erros TypeScript mais complexos que esperado | Media         | Alto    | Priorizar por severidade    |
| Quebra de funcionalidade em refatoracao      | Alta          | Alto    | Testes antes de refatorar   |
| CSP bloqueia funcionalidade necessaria       | Media         | Medio   | Testar em staging primeiro  |
| Performance nao melhora significativamente   | Baixa         | Alto    | Profiling detalhado         |
| Prazo insuficiente                           | Media         | Alto    | Cortar escopo se necessario |

### Contingencia

Se o roadmap estender alem de 6 sprints:

1. Priorizar Sprint 1-2 (bloqueadores criticos)
2. Sprint 3-4 podem ser paralelos com feature work
3. Sprint 5-6 podem ser reduzidos em escopo

---

## Dependencias Externas

- **Supabase**: Auth, database
- **Vercel**: Deploy, KV, Analytics
- **Railway**: Backend API
- **VLibras**: Widget LIBRAS
- **Maritaca AI**: LLM fallback

### Acoes Necessarias

- [ ] Validar quotas Supabase para producao
- [ ] Confirmar tier Vercel para rate limiting
- [ ] Testar conectividade Railway
- [ ] Validar SLA VLibras

---

## Proximos Passos Imediatos

1. **Criar branch** `feat/consolidation-sprint-1`
2. **Executar** `npm run type-check` e catalogar erros
3. **Priorizar** erros TypeScript por severidade
4. **Iniciar** correcoes com maior impacto

---

**Autor**: Anderson Henrique da Silva
**Revisao**: Dezembro 2025
**Proxima Revisao**: Fim de cada Sprint
