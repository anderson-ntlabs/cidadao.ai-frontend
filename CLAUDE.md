# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Author**: Anderson Henrique da Silva
**Location**: Minas Gerais, Brasil
**Last Updated**: 2025-12-12

---

## Critical Patterns (Read Before Coding)

| Pattern                | Rule                                                    | Why                                                              |
| ---------------------- | ------------------------------------------------------- | ---------------------------------------------------------------- |
| **Route Handler Auth** | Use `createServerClient()` with explicit cookies        | `createClient()` silently fails to set cookies in Route Handlers |
| **Commit Messages**    | Never include AI signatures or mentions                 | Project confidentiality requirement                              |
| **Supabase Server**    | `const supabase = await createClient()`                 | Server components require async                                  |
| **Supabase Client**    | `const supabase = createClient()` (no await)            | Client components are synchronous                                |
| **Chat Mode**          | Check `localStorage.getItem('maritaca_selected_model')` | Determines backend vs direct LLM                                 |

### OAuth in Route Handlers (Critical)

```typescript
// CORRECT (app/auth/callback/route.ts)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const cookieStore = await cookies()
const supabase = createServerClient(url, key, {
  cookies: {
    getAll() {
      return cookieStore.getAll()
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => {
        cookieStore.set(name, value, options)
      })
    },
  },
})
```

### Commit Message Format

```
<type>(scope): <summary>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`

**NEVER include**: AI signatures, "Generated with Claude Code", "Co-Authored-By: Claude"

---

## Project Overview

Next.js 15 PWA for Brazilian government transparency with multi-agent AI. 19 agents with Brazilian cultural identities, bilingual (PT/EN), WCAG AAA accessible.

**Stack**: Next.js 15, TypeScript, Tailwind CSS, Zustand, Supabase, Serwist (PWA), Vitest + Playwright, Sentry, PostHog

---

## Essential Commands

```bash
# Development
npm run dev                    # Dev server (localhost:3000)
npm run dev:test               # Dev server on port 3001
npm run build && npm run start # Production build

# Quality (run before commit)
npm run type-check             # TypeScript validation
npm run lint                   # ESLint
npm run test:coverage          # 60% coverage required

# Testing - Unit (Vitest)
npm run test                   # Watch mode
npm run test:ui                # UI interface
npx vitest run path/to/file.test.ts --config=config/vitest.config.mjs  # Single file
npx vitest run -t "pattern" --config=config/vitest.config.mjs          # Pattern match

# Testing - E2E (Playwright)
npm run test:playwright        # All E2E tests
npm run test:playwright:ui     # UI mode
npm run test:mobile            # Mobile tests
npx playwright test --headed   # Watch execution
npx playwright test --debug    # Debug mode

# Storybook
npm run storybook              # Dev mode (localhost:6006)
npm run build-storybook        # Build static

# Analysis
npm run analyze                # Bundle analysis (ANALYZE=true)
npm run lighthouse             # Lighthouse CI

# Database (Supabase)
supabase db push               # Apply all migrations
supabase migration new <name>  # Create new migration
node scripts/db/check-badges.js # Verify badge system
```

### Debugging Scripts

```bash
node scripts/testing/test-backend-comprehensive.js  # Backend connectivity
node scripts/testing/test-chat-live.js              # Chat integration
node scripts/diagnostics/diagnose-vlibras.js        # VLibras issues
node scripts/testing/test-posthog.js                # PostHog analytics
```

---

## Architecture

### Route Structure

```
app/
├── pt/                      # Portuguese (default)
│   ├── app/                 # Authenticated (no header)
│   │   ├── dashboard/       # Investigations
│   │   └── chat/            # AI chat
│   ├── agora/               # Learning platform
│   │   ├── dashboard/       # XP, badges
│   │   ├── trilhas/         # Learning tracks
│   │   └── onboarding/      # User flow
│   └── login/               # Auth (SimplifiedHeader)
├── en/                      # English (mirror)
└── api/                     # API routes
```

**Header Logic** (`components/pt-layout-wrapper.tsx`):

- `SimplifiedHeader`: Landing + login pages
- `Full Header`: Public content pages
- `No Header`: Authenticated `/app/*` routes

### Chat System

```
User Message → ChatService
      ↓
Check 'maritaca_selected_model' in localStorage
      ↓
┌─────┴─────┐
Maritaca?   No
↓           ↓
Fallback   Primary → Fail? → Fallback
(LLM)      (Backend)
```

**Files**:

- `lib/chat/chat.service.ts` - Orchestrator with fallback
- `lib/chat/adapters/primary.adapter.ts` - Railway backend
- `lib/chat/adapters/fallback.adapter.ts` - Maritaca LLM

### State Management (Zustand)

| Store                     | Purpose                    |
| ------------------------- | -------------------------- |
| `chat-store.ts`           | Sessions, messages, agents |
| `notification-store.ts`   | Toast notifications        |
| `badge-store.ts`          | Achievement badges         |
| `agora-chat-store.ts`     | Agora platform chat        |
| `kids-store.ts`           | Kids mode state            |
| `celebration-store.ts`    | Achievement animations     |
| `voice-settings-store.ts` | TTS voice preferences      |
| `survey-store.ts`         | User feedback surveys      |
| `tooltip-store.ts`        | Tooltip state management   |

All stores use persist middleware for localStorage.

### Agent System

19 agents defined in `data/agents.ts`. Each has:

- Unique ID, name, role (PT/EN)
- Avatar in `public/agents/`
- Wikipedia link for cultural context

**Tiers**:

- Tier 1 (Operational): Abaporu, Zumbi, Anita, Tiradentes, Senna, Nana, Jose Bonifacio, Machado de Assis
- Kids Mode: Monteiro Lobato (storytelling), Tarsila do Amaral (art)

### Agora Learning Platform

Gamified learning at `/pt/agora/*` with XP, badges, and tracks.

**Agora hooks** (in `hooks/agora/` subdirectory):

```typescript
// Barrel export from hooks/agora/index.ts
import { useAgoraGamification, AgoraGamificationProvider } from '@/hooks/agora'
import { useAgoraSessions, AgoraSessionsProvider } from '@/hooks/agora'
import { useAgoraOnboarding, AgoraOnboardingProvider } from '@/hooks/agora'

// Auth hook (separate file)
import { useUnifiedAuth } from '@/hooks/use-unified-auth'
```

**Database** (Supabase): `agora_profiles`, `agora_xp_transactions`, `agora_sessions`, `agora_diary_entries`

**Docs**: See `docs/agora/README.md` for complete documentation.

### Kids Mode

Separate stores and agents for children:

- Store: `store/kids-store.ts`
- Agents: Monteiro Lobato (storytelling), Tarsila do Amaral (art)
- Sessions: Nested under Agora sessions (NavigationSessionService)
- Privacy: LGPD compliant with parental consent

**Session hierarchy**:

```
Auth Session (root)
└── Agora Session
    └── Kids Session
```

### PWA (Serwist)

- Service Worker: `app/sw.ts`
- Disabled in dev (`NODE_ENV=development`)
- NetworkFirst caching strategy
- Components: `InstallPrompt`, `UpdateNotification`, `OfflineBanner`

### Middleware (`middleware.ts`)

The middleware handles:

1. **Rate limiting** - Per-endpoint limits (chat, auth, export, api)
2. **Geo detection** - Adds `X-User-Region` and `X-User-Country` headers
3. **Supabase session** - Refreshes auth via `updateSession()`
4. **Security headers** - CSP, HSTS, XSS protection, clickjacking prevention

CSP is configured in `lib/security/csp.config.ts` with VLibras exceptions for accessibility.

---

## Environment Configuration

```bash
# Required
NEXT_PUBLIC_API_URL=https://cidadao-api-production.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional
NEXT_PUBLIC_GA_ID=                    # Google Analytics
NEXT_PUBLIC_POSTHOG_KEY=              # PostHog
DISABLE_PWA=true                      # Dev only
NEXT_PUBLIC_ENABLE_VLIBRAS=false      # LIBRAS widget
```

**Setup**: `cp .env.example .env.local` → Fill credentials

---

## Common Tasks

### Debugging Chat

```bash
node scripts/testing/test-backend.js        # Backend connectivity
node scripts/testing/test-chat-live.js      # Chat integration
```

Issues:

- CORS errors → Check backend CORS config
- Messages not sending → Check `lib/chat/chat.service.ts`
- Agent not responding → Verify agent registered in backend

### Debugging Auth

1. Verify Supabase credentials in `.env.local`
2. Check OAuth redirect URLs in Supabase dashboard
3. Clear cookies + localStorage
4. Verify Route Handler uses `createServerClient`

Files: `app/auth/callback/route.ts`, `lib/supabase/middleware.ts`, `lib/supabase/server.ts`

### Build Failures

```bash
rm -rf .next node_modules package-lock.json && npm install
npm run type-check  # Check TypeScript errors
```

Causes: Circular dependencies, missing env vars, type errors

### Adding a New Agent

1. Define in `data/agents.ts` with PT/EN translations
2. Add avatar to `public/agents/`
3. Update types in `types/chat.ts` if needed
4. Implement backend logic in `cidadao.ai-backend`

---

## Testing

### Unit Tests (Vitest)

- Config: `config/vitest.config.mjs`
- Setup: `vitest.setup.ts`
- Coverage threshold: 60% (lines, functions, branches, statements)
- Pattern: `*.test.ts` or `*.test.tsx` co-located with source

### E2E Tests (Playwright)

- Config: `config/playwright.config.ts`
- Mobile: `config/playwright.mobile.config.ts`
- Tests: `__tests__/e2e/`
- Browsers: Chromium, Firefox, WebKit

---

## Deployment (Vercel)

### Pre-Production Checklist

1. `npm run type-check` - clean
2. `npm run lint` - clean
3. `npm run test:coverage` - >= 60%
4. `npm run test:playwright` - passes
5. `npm run analyze` - bundle < 400KB

### Production Environment

Configure in Vercel dashboard:

- `NEXT_PUBLIC_API_URL`: Railway backend
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_ENABLE_VLIBRAS=true`
- Remove `DISABLE_PWA`

---

## Key Files Reference

**Authentication**:

- `app/auth/callback/route.ts` - OAuth callback
- `lib/supabase/client.ts` - Client-side
- `lib/supabase/server.ts` - Server-side
- `lib/supabase/middleware.ts` - Session refresh

**Chat**:

- `lib/chat/chat.service.ts` - Main orchestrator
- `lib/chat/adapters/primary.adapter.ts` - Backend
- `lib/chat/adapters/fallback.adapter.ts` - Maritaca LLM
- `store/chat-store.ts` - State

**Layout**:

- `app/layout.tsx` - Root
- `components/pt-layout-wrapper.tsx` - Header logic

**Agora**:

- `hooks/agora/index.ts` - Barrel export for Agora hooks
- `hooks/use-unified-auth.tsx` - Auth hook
- `components/agora/` - Components

**Config files** (in `config/` directory):

- `vitest.config.mjs` - Unit test config
- `playwright.config.ts` - E2E test config
- `playwright.mobile.config.ts` - Mobile E2E config
- `tailwind.config.js` - Tailwind CSS
- `commitlint.config.js` - Commit message rules

---

## Library Organization

| Directory         | Purpose                              |
| ----------------- | ------------------------------------ |
| `lib/chat/`       | ChatService, adapters                |
| `lib/supabase/`   | Client, server, middleware           |
| `lib/cache/`      | In-memory, IndexedDB, Vercel KV      |
| `lib/security/`   | CSP, rate limiting, input validation |
| `lib/monitoring/` | Sentry, metrics, AI telemetry        |
| `lib/analytics/`  | PostHog, usability tracking          |
| `lib/edge/`       | Geo detection, request validation    |
| `lib/speech/`     | TTS service                          |
| `store/`          | Zustand stores                       |
| `data/`           | Agent definitions                    |
| `types/`          | TypeScript interfaces                |
| `hooks/agora/`    | Agora-specific hooks (gamification)  |

---

## Dependency Management (Renovate)

- Auto-updates: Mon/Thu 5am BRT
- Automerged: patches, devDependency minors
- Manual review: major bumps, Next.js/React/Supabase
- Dashboard: GitHub Issue "Renovate Dependency Dashboard"
- Config: `renovate.json`

---

## Documentation

Entry points:

- `/docs/README.md` - Main index
- `/docs/agora/README.md` - Agora Academy docs

Organization:

- `01-getting-started/` - Installation, setup
- `02-architecture/` - System design
- `03-features/` - Feature docs
- `06-development/` - Coding patterns
- `08-testing/` - Test strategies
