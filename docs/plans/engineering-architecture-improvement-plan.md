# Plano de Melhorias de Engenharia e Arquitetura - Cidadao.AI Frontend

**Autor**: Anderson Henrique da Silva
**Data**: 2025-12-12
**Score Atual**: 71/100
**Meta**: 85/100
**Timeline**: Continuo (sem prazo fixo)
**Documentacao**: ADRs formais para cada decisao arquitetural

---

## Visao Geral

Este plano organiza as melhorias identificadas na analise de arquitetura e engenharia em sprints de 6 dias, seguindo a metodologia do projeto.

**Ordem de execucao**: Fundacao -> Qualidade -> Arquitetura -> Testes -> Documentacao -> Performance

---

## Sprint 1: Fundacao (Dias 1-6)

**Foco**: Corrigir issues criticos que bloqueiam qualidade

### 1.1 Corrigir Testes de Middleware (P1)

**Arquivos**:

- `lib/supabase/__tests__/middleware.test.ts`
- `lib/supabase/middleware.ts`

**Tarefas**:

- [x] Corrigir mock de `NextResponse.redirect()`
- [x] Corrigir mock de `NextResponse.next()`
- [ ] Adicionar testes para cookie refresh logic
- [x] Garantir todos os testes passando (11/11)

**Criterio de Aceite**: Todos os testes de middleware passando

### 1.2 Rodar npm audit e Corrigir Vulnerabilidades (P1)

**Tarefas**:

- [ ] Executar `npm audit`
- [ ] Corrigir vulnerabilidades HIGH e CRITICAL
- [ ] Documentar vulnerabilidades que nao podem ser corrigidas (se houver)

### 1.3 Adicionar Testes para Server Actions (P1)

**Arquivos**:

- `app/pt/agora/actions.ts` (0% cobertura)
- `app/pt/agora/actions-atomic.ts`

**Testes a criar** (~50 casos):

- [ ] `addXpTransaction` - casos de sucesso e erro
- [ ] `startSession` / `endSession` - lifecycle completo
- [ ] `createDiaryEntry` - validacao de input
- [ ] `updateStreak` - logica de streak
- [ ] `awardBadge` - criterios de badges
- [ ] Edge cases: usuario inexistente, transacoes duplicadas

**Criterio de Aceite**: Cobertura > 80% nos actions

---

## Sprint 2: Qualidade de Codigo (Dias 7-12)

**Foco**: Type safety e error handling

### 2.1 Consolidar Error Handling (P2)

**Arquivos a modificar**:

- `lib/services/investigation.service.ts`
- `lib/chat/chat.service.ts`
- `lib/services/voice-manager.service.ts`
- Todos os services em `lib/services/`

**Implementacao**:

```typescript
// Criar em lib/types/result.ts
type Success<T> = { success: true; data: T }
type Failure = { success: false; error: { code: string; message: string } }
type Result<T> = Success<T> | Failure
```

**Tarefas**:

- [ ] Criar tipo Result<T> generico
- [ ] Refatorar services para retornar Result<T>
- [ ] Eliminar `return null` silenciosos
- [ ] Adicionar logging em todos os catch blocks

### 2.2 Melhorar Type Safety (P2)

**Configuracao**:

- `.eslintrc.json` - mudar WARN para ERROR

**Tarefas**:

- [ ] Adicionar `explicit-function-return-type` como ERROR (build apenas)
- [ ] Corrigir ~50 funcoes sem return type explicito
- [ ] Eliminar `any` types em `lib/utils/retry.ts`
- [ ] Adicionar discriminated unions para API responses

**Arquivos prioritarios**:

- `app/pt/agora/` - todas as paginas
- `hooks/` - todos os hooks
- `lib/chat/adapters/` - adapters

---

## Sprint 3: Arquitetura (Dias 13-18)

**Foco**: Refatorar state management

### 3.1 Refatorar Agora State Management (P2)

**Problema atual**:

```
AgoraAuthProvider > AgoraProvider > AgoraLayoutContent > AuthGuard > Children
(4 niveis de providers aninhados)
```

**Solucao proposta**:

```
UnifiedAgoraProvider > Children
(1 provider com reducer pattern)
```

**Arquivos a criar/modificar**:

- [ ] `hooks/agora/agora-context.tsx` - novo context unificado
- [ ] `hooks/agora/agora-reducer.ts` - reducer com todas as actions
- [ ] `hooks/agora/agora-actions.ts` - action creators tipados
- [ ] `hooks/use-agora.tsx` - refatorar para usar novo context
- [ ] `app/pt/agora/layout.tsx` - simplificar providers

**Estado unificado**:

```typescript
interface AgoraState {
  user: AgoraUser | null
  isAuthenticated: boolean
  isLoading: boolean
  mode: 'aprendiz' | 'kids' | null
  session: AgoraSession | null
  badges: Badge[]
  xpTransactions: XpTransaction[]
  // Kids state
  kidsProfile: KidsProfile | null
  isKidsMode: boolean
}
```

**Criterio de Aceite**:

- Apenas 1 provider no layout
- Todos os testes existentes passando
- Sem race conditions no logout

---

## Sprint 4: Testes (Dias 19-24)

**Foco**: Aumentar cobertura para 60%

### 4.1 Testes de Chat Adapters (P2)

**Arquivos**:

- `lib/chat/adapters/primary.adapter.ts`
- `lib/chat/adapters/fallback.adapter.ts`
- `lib/chat/chat.service.ts`

**Testes a criar** (~30 casos):

- [ ] SSE streaming - eventos parciais
- [ ] SSE streaming - timeout handling
- [ ] Fallback trigger conditions
- [ ] Contract data extraction
- [ ] Retry logic

### 4.2 Testes de Agora Hooks (P2)

**Arquivos**:

- `hooks/use-agora.tsx`
- `hooks/use-agora-gamification.tsx`
- `hooks/use-agora-sessions.tsx`

**Testes a criar** (~40 casos):

- [ ] Authentication flow
- [ ] XP calculation
- [ ] Badge awarding
- [ ] Session lifecycle
- [ ] Error states

---

## Sprint 5: Documentacao (Dias 25-30)

**Foco**: Documentar fluxos criticos

### 5.1 Criar Sequence Diagrams (P2)

**Documentos a criar em `docs/02-architecture/`**:

- [ ] `auth-flow.md` - OAuth, cookie refresh, logout
- [ ] `session-management.md` - Agora sessions, cleanup
- [ ] `chat-flow.md` - Primary/fallback decision logic

### 5.2 Documentar Error Handling (P2)

**Documento**: `docs/06-development/error-handling.md`

- [ ] Error taxonomy
- [ ] Result<T> pattern usage
- [ ] Logging guidelines

### 5.3 Documentar State Management (P2)

**Documento**: `docs/02-architecture/agora-state.md`

- [ ] Zustand vs Context decision
- [ ] State flow diagram
- [ ] Best practices

---

## Sprint 6: Performance e Observabilidade (Dias 31-36)

**Foco**: Monitoramento e otimizacao

### 6.1 Adicionar Performance Monitoring (P3)

**Tarefas**:

- [ ] Core Web Vitals tracking
- [ ] Cache hit rate metrics
- [ ] Provider re-render monitoring

### 6.2 Refatorar Services para Hooks (P3)

**Arquivos**:

- `lib/services/investigation.service.ts` -> `hooks/use-investigation.ts`
- `lib/services/voice-manager.service.ts` -> `hooks/use-voice-manager.ts`

**Beneficios**:

- Dependency injection facilitada
- Testes mais simples
- Composable patterns

---

## Metricas de Sucesso

| Metrica              | Atual  | Meta Sprint 2 | Meta Sprint 4 | Meta Final |
| -------------------- | ------ | ------------- | ------------- | ---------- |
| Test Coverage        | 40%    | 50%           | 60%           | 65%        |
| Type Safety Score    | 65     | 75            | 80            | 85         |
| Error Handling Score | 65     | 80            | 85            | 90         |
| Architecture Score   | 70     | 70            | 80            | 85         |
| **Overall Score**    | **71** | **75**        | **80**        | **85**     |

---

## Riscos e Mitigacoes

| Risco                                    | Probabilidade | Impacto | Mitigacao                 |
| ---------------------------------------- | ------------- | ------- | ------------------------- |
| Refactor de state quebra funcionalidades | Alta          | Alto    | Testes E2E antes e depois |
| Tempo insuficiente para cobertura 60%    | Media         | Medio   | Priorizar paths criticos  |
| Breaking changes em types                | Media         | Baixo   | Mudancas incrementais     |

---

## Ordem de Execucao Recomendada

1. **Sprint 1** - Fundacao (BLOQUEANTE para outros)
2. **Sprint 4.1** - Testes de Chat (pode rodar em paralelo com Sprint 2)
3. **Sprint 2** - Qualidade de Codigo
4. **Sprint 3** - Arquitetura (requer Sprint 1 completo)
5. **Sprint 4.2** - Testes de Hooks (requer Sprint 3 completo)
6. **Sprint 5** - Documentacao (pode rodar em paralelo)
7. **Sprint 6** - Performance (ultimo)

---

## Arquivos Criticos (Referencia Rapida)

```
# Prioridade 1 - Corrigir AGORA
lib/supabase/__tests__/middleware.test.ts
app/pt/agora/actions.ts
app/pt/agora/actions-atomic.ts

# Prioridade 2 - Error Handling
lib/services/investigation.service.ts
lib/chat/chat.service.ts
lib/types/result.ts (criar)

# Prioridade 2 - State Management
hooks/agora/agora-context.tsx (criar)
hooks/agora/agora-reducer.ts (criar)
app/pt/agora/layout.tsx

# Prioridade 2 - Documentacao
docs/02-architecture/auth-flow.md (criar)
docs/02-architecture/agora-state.md (criar)
docs/06-development/error-handling.md (criar)
```

---

## ADRs (Architecture Decision Records)

Cada decisao arquitetural importante sera documentada em `docs/adr/`.

### ADRs a Criar

| ID      | Titulo                                  | Sprint   | Status   |
| ------- | --------------------------------------- | -------- | -------- |
| ADR-001 | Result Type Pattern para Error Handling | Sprint 2 | Pendente |
| ADR-002 | Unified Agora State Management          | Sprint 3 | Pendente |
| ADR-003 | Service to Hook Migration Strategy      | Sprint 6 | Pendente |
| ADR-004 | Test Coverage Strategy                  | Sprint 4 | Pendente |

### Template ADR

```markdown
# ADR-XXX: [Titulo]

## Status

Proposto | Aceito | Depreciado | Substituido

## Contexto

[Descricao do problema ou necessidade]

## Decisao

[O que foi decidido]

## Consequencias

### Positivas

- ...

### Negativas

- ...

## Alternativas Consideradas

1. [Alternativa 1]
2. [Alternativa 2]
```

---

## Historico de Atualizacoes

| Data       | Autor             | Mudanca                                                    |
| ---------- | ----------------- | ---------------------------------------------------------- |
| 2025-12-12 | Anderson Henrique | Criacao do plano inicial                                   |
| 2025-12-12 | Anderson Henrique | Sprint 1.1 - Testes middleware corrigidos (11/11 passando) |

---

## Proximo Passo

Continuar com **Sprint 1.2** - Rodar npm audit e corrigir vulnerabilidades.
