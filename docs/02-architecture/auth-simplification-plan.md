# Auth System Simplification Plan

**Author**: Anderson Henrique da Silva
**Location**: Minas Gerais, Brasil
**Created**: 2025-12-09
**Updated**: 2025-12-09
**Status**: In Progress (Phase 2 Complete)

---

## 1. Executive Summary

The current authentication system has grown organically and now spans **4,281 lines across 7 files**. This complexity makes debugging difficult, creates confusion about which hook to use, and leads to duplicated logic. This document proposes a simplification that reduces the auth surface area while maintaining all functionality.

---

## 2. Current Architecture Analysis

### 2.1 File Inventory

| File                                         | Lines     | Purpose                              | Used By     |
| -------------------------------------------- | --------- | ------------------------------------ | ----------- |
| `hooks/use-auth.ts`                          | 208       | Legacy app auth (backend + Supabase) | 2 files     |
| `hooks/use-supabase-auth.tsx`                | 343       | OAuth for main app                   | 14 files    |
| `hooks/use-agora-auth.tsx`                   | 531       | Ágora-specific auth                  | 1 file      |
| `hooks/use-agora.tsx`                        | 1,785     | Auth + Gamification + Everything     | Ágora pages |
| `hooks/use-kids.ts`                          | 315       | Kids mode management                 | Kids pages  |
| `store/kids-store.ts`                        | 628       | Kids state (Zustand)                 | use-kids.ts |
| `lib/services/navigation-session.service.ts` | 471       | Session hierarchy                    | All auth    |
| **Total**                                    | **4,281** |                                      |             |

### 2.2 Problems Identified

1. **Multiple auth hooks**: 4 different hooks for authentication
   - Developers don't know which to use
   - Each has slightly different interfaces

2. **use-agora.tsx is a monolith** (1,785 lines):
   - Authentication
   - User profile management
   - XP and leveling system
   - Badge system
   - Daily/Weekly challenges
   - Study sessions
   - Diary entries
   - Onboarding flow
   - LGPD consent
   - GitHub integration

3. **Duplicated logout logic**: Logout code repeated in 6+ places

4. **Inconsistent state management**: Mix of React Context, Zustand, and localStorage

5. **Hard to debug**: When auth fails, unclear which layer is responsible

### 2.3 Dependency Graph (Current)

```
                    ┌─────────────────────────────────┐
                    │     NavigationSessionService    │
                    │         (centralized)           │
                    └─────────────┬───────────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌───────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  use-auth.ts  │       │use-supabase-auth│       │ use-agora-auth  │
│   (legacy)    │       │   (main app)    │       │   (Ágora)       │
└───────────────┘       └─────────────────┘       └────────┬────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │   use-agora     │
                                                  │   (monolith)    │
                                                  │  1,785 lines    │
                                                  └────────┬────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │    use-kids     │
                                                  └─────────────────┘
```

---

## 3. Proposed Architecture

### 3.1 Design Principles

1. **Single Source of Truth**: One auth service for all authentication
2. **Separation of Concerns**: Auth, gamification, and features in separate modules
3. **Composition over Inheritance**: Small, focused hooks that compose together
4. **Backward Compatibility**: Gradual migration, no breaking changes initially

### 3.2 New Structure

```
lib/
├── services/
│   ├── navigation-session.service.ts  (keep - already good)
│   └── auth.service.ts                (NEW - unified auth logic)
│
hooks/
├── use-auth.ts                        (REWRITE - single unified hook)
├── use-agora-gamification.ts          (NEW - XP, badges, challenges)
├── use-agora-sessions.ts              (NEW - study sessions, diary)
├── use-agora-onboarding.ts            (NEW - onboarding flow)
├── use-kids.ts                        (KEEP - already focused)
│
├── [DEPRECATED]
│   ├── use-supabase-auth.tsx          → use-auth.ts
│   ├── use-agora-auth.tsx             → use-auth.ts
│   └── use-agora.tsx                  → split into 3 hooks above
```

### 3.3 New Dependency Graph

```
                    ┌─────────────────────────────────┐
                    │     NavigationSessionService    │
                    └─────────────┬───────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────────┐
                    │      AuthService (unified)      │
                    │  - login/logout                 │
                    │  - OAuth (Google, GitHub)       │
                    │  - session management           │
                    │  - user state                   │
                    └─────────────┬───────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────────┐
                    │        useAuth (hook)           │
                    │  - React wrapper for service    │
                    │  - Provider + Context           │
                    └─────────────┬───────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
          ▼                       ▼                       ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│useAgoraGamification│  │ useAgoraSessions │   │useAgoraOnboarding│
│  - XP system      │  │  - study sessions│   │  - onboarding    │
│  - badges         │  │  - diary entries │   │  - LGPD consent  │
│  - challenges     │  │  - time tracking │   │  - GitHub verify │
│  - levels/ranks   │  │                  │   │  - track select  │
└──────────────────┘   └──────────────────┘   └──────────────────┘
          │
          ▼
┌──────────────────┐
│     useKids      │
│  (already good)  │
└──────────────────┘
```

### 3.4 File Size Targets

| File                               | Current | Target     | Actual    | Status     |
| ---------------------------------- | ------- | ---------- | --------- | ---------- |
| `lib/services/auth.service.ts`     | N/A     | ~300       | 366       | ✅ Created |
| `hooks/use-unified-auth.tsx`       | N/A     | ~250       | 257       | ✅ Created |
| `hooks/use-agora-gamification.tsx` | N/A     | ~400       | 759       | ✅ Created |
| `hooks/use-agora-sessions.tsx`     | N/A     | ~250       | 413       | ✅ Created |
| `hooks/use-agora-onboarding.tsx`   | N/A     | ~300       | 515       | ✅ Created |
| `hooks/use-kids.ts`                | 315     | 315        | 315       | Keep       |
| **Total New**                      | -       | **~1,815** | **2,310** | Created    |

> **Note**: Actual line counts are higher than targets due to comprehensive documentation,
> type definitions, and full feature parity with original hooks. The new architecture
> provides better separation of concerns and maintainability despite slightly higher LOC.

---

## 4. Implementation Plan

### Phase 1: Create AuthService (Day 1)

1. Create `lib/services/auth.service.ts` with:
   - Supabase client management
   - Login methods (email, OAuth)
   - Logout with NavigationSessionService integration
   - Session refresh
   - User state management

2. Create unified `hooks/use-auth.ts`:
   - AuthProvider with Context
   - Single useAuth hook
   - Backward-compatible interface

### Phase 2: Split use-agora.tsx (Day 1-2)

1. Extract gamification logic to `hooks/use-agora-gamification.ts`:
   - XP transactions
   - Badge system
   - Level/rank calculations
   - Daily/weekly challenges
   - Streak management

2. Extract sessions logic to `hooks/use-agora-sessions.ts`:
   - Study session start/end
   - Diary entries
   - Time tracking
   - Session history

3. Extract onboarding to `hooks/use-agora-onboarding.ts`:
   - Onboarding steps
   - Track selection
   - GitHub verification
   - LGPD/Terms consent

### Phase 3: Migration (Day 2)

1. Create `hooks/use-agora.ts` as a facade that combines all hooks:

   ```typescript
   // Backward compatible - combines all hooks
   export function useAgora() {
     const auth = useAuth()
     const gamification = useAgoraGamification()
     const sessions = useAgoraSessions()
     const onboarding = useAgoraOnboarding()

     return {
       ...auth,
       ...gamification,
       ...sessions,
       ...onboarding,
     }
   }
   ```

2. Update imports gradually (no breaking changes)

### Phase 4: Deprecation (Day 3)

1. Mark old hooks as deprecated with console warnings
2. Update documentation
3. Remove deprecated code after validation

---

## 5. New Hook Interfaces

### 5.1 useAuth

```typescript
interface UseAuthReturn {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  login: (email: string, password: string) => Promise<void>
  loginWithProvider: (provider: 'google' | 'github') => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}
```

### 5.2 useAgoraGamification

```typescript
interface UseAgoraGamificationReturn {
  // State
  totalXp: number
  currentLevel: number
  currentRank: string
  badges: Badge[]
  dailyChallenges: Challenge[]
  weeklyChallenges: Challenge[]
  currentStreak: number
  streakMultiplier: number

  // Actions
  addXp: (amount: number, source: string, description: string) => Promise<void>
  checkAndAwardBadges: () => Promise<void>
  claimChallenge: (id: string, periodStart: string) => Promise<void>
  claimDailyBonus: () => Promise<boolean>
}
```

### 5.3 useAgoraSessions

```typescript
interface UseAgoraSessionsReturn {
  // State
  currentSession: StudySession | null
  sessions: StudySession[]
  diaryEntries: DiaryEntry[]
  totalTimeMinutes: number
  totalSessions: number

  // Actions
  startSession: () => Promise<void>
  endSession: (xpEarned?: number, agentsUsed?: string[]) => Promise<void>
  addDiaryEntry: (entry: DiaryEntryInput) => Promise<void>
}
```

### 5.4 useAgoraOnboarding

```typescript
interface UseAgoraOnboardingReturn {
  // State
  hasCompletedOnboarding: boolean
  onboardingStep: number
  selectedTracks: Track[]
  hasAcceptedLgpd: boolean
  hasAcceptedTerms: boolean

  // Actions
  setOnboardingStep: (step: number) => Promise<void>
  selectTracks: (tracks: Track[]) => Promise<void>
  setGitHubUsername: (username: string) => Promise<void>
  verifyGitHubFork: () => Promise<VerifyResult>
  acceptLgpdConsent: () => Promise<void>
  acceptTerms: () => Promise<void>
  completeOnboarding: () => Promise<void>
}
```

---

## 6. Migration Guide

### For Developers

```typescript
// BEFORE (multiple imports, confusing)
import { useAuth } from '@/hooks/use-supabase-auth'
import { useAgora } from '@/hooks/use-agora'
import { useAgoraAuth } from '@/hooks/use-agora-auth'

// AFTER (single unified import)
import { useAuth } from '@/hooks/use-auth'

// For Ágora-specific features
import { useAgoraGamification } from '@/hooks/use-agora-gamification'
import { useAgoraSessions } from '@/hooks/use-agora-sessions'

// OR use the combined hook (backward compatible)
import { useAgora } from '@/hooks/use-agora'
```

### Component Usage

```typescript
// Simple auth (login page, header, etc.)
function Header() {
  const { user, logout } = useAuth()
  // ...
}

// Ágora dashboard (needs gamification)
function AgoraDashboard() {
  const { user } = useAuth()
  const { totalXp, badges, currentLevel } = useAgoraGamification()
  // ...
}

// Study page (needs sessions)
function StudyPage() {
  const { user } = useAuth()
  const { currentSession, startSession, endSession } = useAgoraSessions()
  // ...
}
```

---

## 7. Risk Assessment

| Risk                    | Probability | Impact | Mitigation                             |
| ----------------------- | ----------- | ------ | -------------------------------------- |
| Breaking existing pages | Medium      | High   | Facade pattern maintains compatibility |
| Auth state sync issues  | Low         | High   | Single source of truth in AuthService  |
| Performance regression  | Low         | Medium | Hooks are already optimized            |
| Testing gaps            | Medium      | Medium | Add tests during refactor              |

---

## 8. Success Metrics

- [x] Clear separation of concerns (auth vs gamification vs sessions)
- [x] Single unified auth service (`lib/services/auth.service.ts`)
- [x] Single unified auth hook (`hooks/use-unified-auth.tsx`)
- [x] Gamification hook extracted (`hooks/use-agora-gamification.tsx`)
- [x] Sessions hook extracted (`hooks/use-agora-sessions.tsx`)
- [x] Onboarding hook extracted (`hooks/use-agora-onboarding.tsx`)
- [ ] Facade created for backward compatibility
- [ ] No breaking changes (all pages still work)
- [ ] Documentation updated
- [ ] CLAUDE.md reflects new architecture

---

## 9. Timeline

| Phase                    | Duration       | Deliverable                 |
| ------------------------ | -------------- | --------------------------- |
| Phase 1: AuthService     | 2-3 hours      | Unified auth service + hook |
| Phase 2: Split use-agora | 3-4 hours      | 3 focused hooks             |
| Phase 3: Migration       | 1-2 hours      | Facade + gradual updates    |
| Phase 4: Cleanup         | 1 hour         | Deprecation + docs          |
| **Total**                | **7-10 hours** | Simplified architecture     |

---

## 10. Approval

- [ ] Architecture review
- [ ] Implementation approved
- [ ] Timeline agreed

---

## Appendix A: Files to Modify

### Create New

- `lib/services/auth.service.ts`
- `hooks/use-agora-gamification.ts`
- `hooks/use-agora-sessions.ts`
- `hooks/use-agora-onboarding.ts`

### Rewrite

- `hooks/use-auth.ts` (unified)
- `hooks/use-agora.tsx` (facade only)

### Deprecate (Phase 4)

- `hooks/use-supabase-auth.tsx`
- `hooks/use-agora-auth.tsx`

### Update Imports (14 files)

- `app/pt/app/*.tsx`
- `app/en/*.tsx`
- `components/auth-*.tsx`
- `components/mobile-nav.tsx`
- `contexts/auth-context.tsx`

---

## Appendix B: Current use-agora.tsx Breakdown

| Section             | Lines     | Target Hook            |
| ------------------- | --------- | ---------------------- |
| Imports & Types     | 1-135     | Split across all       |
| Badge Definitions   | 136-315   | use-agora-gamification |
| Challenge Templates | 316-433   | use-agora-gamification |
| Context Interface   | 434-497   | Split across all       |
| Provider Setup      | 498-607   | use-auth               |
| loadUserData        | 608-824   | use-auth               |
| XP & Badges         | 825-1050  | use-agora-gamification |
| Sessions & Diary    | 1051-1155 | use-agora-sessions     |
| Streak Management   | 1156-1215 | use-agora-gamification |
| Challenges          | 1216-1455 | use-agora-gamification |
| Logout              | 1456-1480 | use-auth               |
| Onboarding          | 1481-1665 | use-agora-onboarding   |
| Context Value       | 1666-1785 | Facade                 |
