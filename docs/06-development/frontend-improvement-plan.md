# Frontend Improvement Plan - Cidadão.AI

**Author**: Anderson Henrique da Silva
**Date**: 2025-12-11
**Status**: Planning

---

## Executive Summary

This document outlines surgical improvements for the Cidadão.AI frontend codebase, addressing code quality, maintainability, and technical debt. The plan is divided into three phases with clear priorities and measurable outcomes.

---

## Current State Analysis

### Metrics Overview

| Category                  | Current               | Target                |
| ------------------------- | --------------------- | --------------------- |
| Auth hook implementations | 5 files (1,418 lines) | 1 unified (300 lines) |
| `use-agora.tsx` lines     | 1,918                 | < 400 per hook        |
| Chat page hooks           | 17 React hooks        | < 10                  |
| Backup files              | 2 (1,107 lines)       | 0                     |
| Test coverage             | ~60%                  | 80%                   |

---

## Phase 1: Quick Wins (1-2 days)

### 1.1 Delete Backup Files

**Files to remove:**

```
app/pt/page-backup.tsx  (572 lines)
app/pt/page-old.tsx     (535 lines)
```

**Impact**: -1,107 lines of dead code, cleaner git history.

**Command:**

```bash
rm app/pt/page-backup.tsx app/pt/page-old.tsx
```

### 1.2 Consolidate Auth Hooks

**Current fragmentation (5 implementations, 1,418 total lines):**

| File                          | Lines | Purpose           | Status    |
| ----------------------------- | ----- | ----------------- | --------- |
| `hooks/use-unified-auth.tsx`  | 264   | Main auth hook    | **KEEP**  |
| `hooks/use-auth.ts`           | 280   | Legacy wrapper    | DEPRECATE |
| `hooks/use-supabase-auth.tsx` | 343   | Supabase-specific | MERGE     |
| `hooks/use-agora-auth.tsx`    | 531   | Agora platform    | MERGE     |
| `contexts/auth-context.tsx`   | 25    | Context wrapper   | DEPRECATE |

**Migration plan:**

1. **Keep `use-unified-auth.tsx`** as the single source of truth
2. **Merge** Agora-specific features into `use-unified-auth.tsx`
3. **Deprecate** `use-auth.ts` - it's just a re-export
4. **Deprecate** `contexts/auth-context.tsx` - wrapper adds no value
5. **Update imports** across 15+ files

**Files requiring import updates:**

- `app/pt/app/chat/page.tsx`
- `app/pt/app/dashboard/page.tsx`
- `app/pt/app/perfil/page.tsx`
- `app/pt/app/configuracoes/page.tsx`
- `app/pt/app/atividades/page.tsx`
- `app/en/page.tsx`
- `components/auth-layout.tsx`
- `components/mobile-nav.tsx`
- `components/providers.tsx`
- `components/hints/adaptive-hints-provider.tsx`
- `hooks/use-tour.ts`

### 1.3 Fix Barrel Export Collision

**Issue in `hooks/index.ts` (line 37):**

```typescript
// PROBLEM: Two exports with same name
export { useChat } from './use-chat'
export { useChat as useChatHook, ... } from './use-chat-store'
```

**Fix:**

```typescript
// SOLUTION: Distinct names
export { useChat } from './use-chat'
export { useChatStore, useAgentStatus, useSuggestedActions } from './use-chat-store'
```

---

## Phase 2: Refactoring (1-2 weeks)

### 2.1 Split `use-agora.tsx` (1,918 lines)

The God Hook manages too many concerns. Split into focused hooks:

**Proposed structure:**

| New Hook                   | Responsibility                | Est. Lines |
| -------------------------- | ----------------------------- | ---------- |
| `use-agora-auth.tsx`       | Authentication, user profile  | ~200       |
| `use-agora-xp.tsx`         | XP transactions, calculations | ~250       |
| `use-agora-badges.tsx`     | Badge management, unlocking   | ~200       |
| `use-agora-sessions.tsx`   | Study sessions, diary         | ~250       |
| `use-agora-challenges.tsx` | Daily/weekly challenges       | ~200       |
| `use-agora-calendar.tsx`   | Calendar events               | ~150       |
| `use-agora-consent.tsx`    | LGPD consent management       | ~100       |
| `use-agora.tsx`            | Facade hook (combines all)    | ~150       |

**Benefits:**

- Easier testing (focused units)
- Better tree-shaking
- Clearer responsibilities
- Reduced re-renders

### 2.2 Refactor Chat Page (1,077 lines, 17 hooks)

**Current hook usage in `app/pt/app/chat/page.tsx`:**

```typescript
// Too many hooks creating render instability
useState(multiple)
useEffect(multiple)
useCallback(multiple)
useMemo(multiple)
useRef(multiple)
// Plus custom hooks
```

**Refactoring strategy:**

1. **Extract `useChatPage` composite hook:**

   ```typescript
   // hooks/use-chat-page.ts
   export function useChatPage() {
     // Combine related state
     // Memoize expensive computations
     // Return stable references
   }
   ```

2. **Extract sub-components:**
   - `ChatMessageList` - virtualized message rendering
   - `ChatInput` - input handling with debounce
   - `ChatAgentSelector` - agent selection UI
   - `ChatSessionManager` - session state

3. **Target**: < 500 lines for main page, < 10 hooks

### 2.3 Simplify Delete Account Modal (726 lines)

**Current structure:**

- Multi-step wizard in single component
- Mixed UI and business logic
- Complex state machine

**Refactoring approach:**

1. **Extract step components:**

   ```
   components/privacy/
   ├── delete-account-modal.tsx (orchestrator, ~150 lines)
   ├── steps/
   │   ├── confirm-identity-step.tsx (~100 lines)
   │   ├── export-data-step.tsx (~100 lines)
   │   ├── reason-survey-step.tsx (~100 lines)
   │   ├── final-confirmation-step.tsx (~100 lines)
   │   └── index.ts
   └── hooks/
       └── use-delete-account.ts (~150 lines)
   ```

2. **Benefits:**
   - Each step testable independently
   - Clearer state transitions
   - Easier to add/remove steps

---

## Phase 3: Long Term (4-6 weeks)

### 3.1 TypeScript Strictness

**Current tsconfig.json gaps:**

```json
{
  "compilerOptions": {
    "strict": false, // Enable this
    "noImplicitAny": false, // Enable this
    "strictNullChecks": false // Enable this
  }
}
```

**Migration path:**

1. Enable `strict` flag
2. Fix ~200-500 type errors (estimate)
3. Replace `any` with proper types
4. Add missing return types

### 3.2 Add Error Boundaries

**Missing in Agora routes:**

```typescript
// app/pt/agora/layout.tsx - add ErrorBoundary
import { ErrorBoundary } from '@/components/error-boundary'

export default function AgoraLayout({ children }) {
  return (
    <ErrorBoundary fallback={<AgoraErrorFallback />}>
      {children}
    </ErrorBoundary>
  )
}
```

### 3.3 Implement Context Selectors

**Problem**: Full context re-renders on any change.

**Solution**: Use `use-context-selector` or Zustand selectors:

```typescript
// Before (re-renders on ANY auth change)
const { user, isLoading, signOut } = useAuth()

// After (re-renders only when user changes)
const user = useAuthSelector((state) => state.user)
```

---

## Success Metrics

| Metric                  | Current | Phase 1 | Phase 2 | Phase 3 |
| ----------------------- | ------- | ------- | ------- | ------- |
| Dead code lines         | 1,107   | 0       | 0       | 0       |
| Auth implementations    | 5       | 1       | 1       | 1       |
| `use-agora.tsx` lines   | 1,918   | 1,918   | < 200   | < 200   |
| Chat page hooks         | 17      | 17      | < 10    | < 8     |
| Type errors with strict | N/A     | N/A     | N/A     | 0       |
| Test coverage           | 60%     | 60%     | 70%     | 80%     |

---

## Risk Assessment

| Risk                                     | Impact | Mitigation                         |
| ---------------------------------------- | ------ | ---------------------------------- |
| Auth consolidation breaks existing flows | High   | Feature flag, gradual rollout      |
| Hook splitting introduces bugs           | Medium | Comprehensive tests before split   |
| TypeScript strict breaks build           | Medium | Incremental file-by-file migration |

---

## Implementation Order

```
Week 1: Phase 1 (Quick Wins)
├── Day 1: Delete backups, fix barrel export
└── Day 2: Consolidate auth hooks

Week 2-3: Phase 2 (Refactoring)
├── Week 2: Split use-agora.tsx
└── Week 3: Refactor chat page + delete modal

Week 4-6: Phase 3 (Long Term)
├── Week 4: TypeScript strict mode
├── Week 5: Error boundaries
└── Week 6: Context selectors
```

---

## Appendix: File Impact Analysis

### Files to Delete

- `app/pt/page-backup.tsx`
- `app/pt/page-old.tsx`

### Files to Deprecate

- `hooks/use-auth.ts` → use `use-unified-auth.tsx`
- `hooks/use-supabase-auth.tsx` → merge into `use-unified-auth.tsx`
- `contexts/auth-context.tsx` → remove

### Files to Split

- `hooks/use-agora.tsx` → 8 focused hooks

### Files to Refactor

- `app/pt/app/chat/page.tsx` → extract components + composite hook
- `components/privacy/delete-account-modal.tsx` → step components

### Files to Update (imports)

- 15+ files with auth imports
- `hooks/index.ts` (barrel export)
