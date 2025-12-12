# ADR-002: Agora State Management Architecture

## Status

Aceito (Em Implementacao)

## Data

2025-12-12

## Contexto

A plataforma Agora tinha uma estrutura de providers aninhados no layout:

```
AgoraAuthProvider (autenticacao Supabase)
  └── AgoraProvider (estado completo da plataforma)
      └── AgoraLayoutContent
          └── AuthGuard
              └── Children
```

### Problemas Identificados

1. **Sobreposicao de responsabilidades**: Ambos `AgoraAuthProvider` e `AgoraProvider` gerenciam user state
2. **Tipos duplicados**: 3 definicoes diferentes de `AgoraUser` em arquivos distintos
3. **Conversao duplicada**: `convertToAgoraUser()` implementado em 3 lugares (~300 linhas duplicadas)
4. **Logout em 3 lugares**: `use-agora-auth.tsx`, `use-agora.tsx`, `auth.service.ts`
5. **Race conditions**: Auth inicializa em paralelo nos dois providers
6. **Provider muito grande**: `AgoraProvider` tem ~1900 linhas com multiplas responsabilidades

### Impacto Real

- Bugs de auth dificeis de debugar (qual provider esta desatualizado?)
- Logout inconsistente (as vezes falha em limpar tudo)
- Manutencao custosa (mudar algo requer alterar 3 arquivos)
- Novos desenvolvedores confusos com a arquitetura

## Decisao

**Implementar refatoracao progressiva** com os seguintes artefatos:

### 1. Tipos Unificados (`types/agora.ts`)

```typescript
// SINGLE SOURCE OF TRUTH para tipos Agora
export interface AgoraUser {
  // Core identity (required)
  id: string
  email: string
  name: string
  avatar: string

  // OAuth metadata (optional)
  githubUsername?: string
  provider?: string

  // Gamification, academic, consent, etc.
  // ... todos os campos em um unico lugar
}
```

### 2. Conversor Unificado (`lib/agora/user-converter.ts`)

```typescript
// UNICA funcao de conversao
export function convertToAgoraUser(
  supabaseUser: SupabaseUser,
  profile?: AgoraProfileRow | null,
  hasConsent?: boolean
): AgoraUser
```

### 3. Reducer Pattern (`hooks/agora/agora-reducer.ts`)

```typescript
// Estado centralizado com acoes tipadas
export interface AgoraState {
  user: AgoraUser | null
  isAuthenticated: boolean
  isLoading: boolean
  sessions: StudySession[]
  badges: AgoraBadge[]
  // ... todo o estado em um lugar
}

export type AgoraAction =
  | { type: 'SET_USER'; payload: AgoraUser | null }
  | { type: 'LOGOUT' }
  | { type: 'ADD_XP_TRANSACTION'; payload: XpTransaction }
// ... acoes tipadas
```

### 4. Provider Unificado (`hooks/use-unified-auth.tsx`)

```typescript
// Combina AgoraAuthProvider + auth.service.ts
export function UnifiedAuthProvider({ children }: Props) {
  // Single implementation of:
  // - Auth state management
  // - Profile loading
  // - Logout (SINGLE implementation)
  // - LGPD consent
}
```

### Plano de Migracao

**Fase 1 (Sprint 3 - ATUAL)**:

- [x] Criar `types/agora.ts` com tipos unificados
- [x] Criar `lib/agora/user-converter.ts`
- [x] Criar `hooks/agora/agora-reducer.ts`
- [x] Atualizar `hooks/use-unified-auth.tsx` com AgoraUser
- [ ] Migrar `app/pt/agora/layout.tsx` para usar UnifiedAuthProvider
- [ ] Deprecar `use-agora-auth.tsx` (mantendo backward compat)

**Fase 2 (Sprint 4)**:

- [ ] Migrar componentes para usar `useUnifiedAuth`
- [ ] Remover `AgoraAuthProvider` do layout
- [ ] Simplificar `use-agora.tsx` (remover auth duplicado)

**Fase 3 (Sprint 5)**:

- [ ] Migrar `use-agora.tsx` para usar reducer
- [ ] Remover duplicacoes restantes
- [ ] Cleanup final

## Consequencias

### Positivas

- Single source of truth para tipos e conversao
- Logout funcionando consistentemente
- Menos re-renders (reducer pattern)
- Mais facil de testar (estado isolado)
- ~1300 linhas removidas (estimativa)
- Novos devs entendem a arquitetura mais rapido

### Negativas

- Risco de quebrar funcionalidades durante migracao
- Periodo de transicao com dois sistemas (backward compat)
- Necessita testes extensivos para validar

### Neutras

- API publica (`useAgora`, `useUnifiedAuth`) mantem mesma interface
- Componentes existentes continuam funcionando

## Alternativas Consideradas

### Alternativa 1: Adiar Refatoracao

**Por que foi rejeitada:** O custo de manutencao atual e muito alto. Bugs de auth estavam consumindo tempo significativo. A decisao de adiar foi reconsiderada apos feedback do desenvolvedor principal.

### Alternativa 2: Zustand Global Store

**Por que nao escolhemos:**

- Requer reescrita de todos os componentes que usam contexto
- Perdemos React DevTools para estado
- Zustand ja e usado para stores menores (chat, notifications)
- Manter consistencia com o resto do codebase

## Arquivos Criados/Modificados

### Novos Arquivos

```
types/agora.ts                    # Tipos unificados (novo)
lib/agora/user-converter.ts       # Conversor unico (novo)
hooks/agora/agora-reducer.ts      # Reducer centralizado (novo)
```

### Arquivos Modificados

```
hooks/use-unified-auth.tsx        # Atualizado para usar AgoraUser
hooks/agora/index.ts              # Exporta novos modulos
```

### Arquivos a Deprecar (Fase 2)

```
hooks/use-agora-auth.tsx          # Substituido por use-unified-auth
```

## Metricas de Sucesso

1. **Linhas de codigo**: Reducao de ~30% (2500 -> ~1700)
2. **Bugs de auth**: Zero bugs de logout inconsistente
3. **Cobertura de testes**: Possivel testar auth isoladamente
4. **Developer experience**: Novos devs conseguem entender arquitetura em <30min

## Referencias

- [React Context Best Practices](https://react.dev/learn/passing-data-deeply-with-context)
- [useReducer Pattern](https://react.dev/reference/react/useReducer)
- [ADR-001: Result Type Pattern](./ADR-001-result-type-pattern.md)
