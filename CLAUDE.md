# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Author**: Anderson Henrique da Silva
**Location**: Minas Gerais, Brasil
**Last Updated**: 2025-11-18

---

## 🚨 Critical Implementation Patterns

### OAuth Authentication in Route Handlers

**CRITICAL**: Route Handlers require `createServerClient()` with explicit cookie handling. Never use the `createClient()` helper.

```typescript
// ✅ CORRECT (app/auth/callback/route.ts)
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

**Why**: The `createClient()` helper silently fails to set cookies in Route Handler context.

### Commit Message Standards

**CRITICAL**: Never include AI assistance signatures in commits.

❌ NEVER include:

- "🤖 Generated with [Claude Code](https://claude.com/claude-code)"
- "Co-Authored-By: Claude <noreply@anthropic.com>"

✅ ALWAYS use: `<type>(scope): <summary>` in English (feat/fix/docs/refactor/test/chore/perf)

---

## Project Overview

Next.js 15 Progressive Web App for Brazilian government transparency using multi-agent AI. Features 17 specialized agents with Brazilian cultural identities, bilingual interface (PT/EN), comprehensive accessibility (WCAG AAA, VLibras).

**Status**: 82% complete, production-ready infrastructure

**Key Technologies**: Next.js 15, TypeScript, Tailwind CSS, Zustand, Supabase, Serwist (PWA), Vitest + Playwright

---

## Essential Commands

### Development Workflow

```bash
# Start development
npm run dev                                         # Dev server (localhost:3000)
npm run build && npm run start                      # Production build + start

# Quality checks (run before commit)
npm run type-check && npm run lint                  # Must pass
npm run test:coverage                               # 60% coverage required
npm run test:playwright                             # E2E tests

# Quick debugging
node scripts/testing/test-backend-comprehensive.js  # Backend connectivity
node scripts/testing/test-chat-live.js              # Chat integration
node scripts/diagnostics/diagnose-vlibras.js        # VLibras troubleshooting
```

### Testing Commands

```bash
# Unit tests (Vitest)
npm run test                  # Watch mode
npm run test:ui               # UI interface
npm run test:coverage         # Coverage report
npx vitest run path/to/test   # Single test

# E2E tests (Playwright)
npm run test:playwright       # All E2E tests
npm run test:playwright:ui    # UI mode
npm run test:mobile           # Mobile-specific tests
npx playwright test --headed  # Watch execution
npx playwright test --debug   # Debug mode

# Manual integration scripts
# See scripts/README.md for 40+ available scripts organized by category:
# - scripts/testing/      - Test scripts
# - scripts/diagnostics/  - Troubleshooting
# - scripts/monitoring/   - Performance monitoring
# - scripts/analysis/     - Code analysis
```

### Performance & Analysis

```bash
npm run analyze               # Bundle analysis
npm run lighthouse            # Lighthouse CI
node scripts/monitoring/monitor-backend.js
```

---

## High-Level Architecture

### Application Structure

Next.js 15 App Router with bilingual routing (`/pt/*`, `/en/*`):

```
app/
├── pt/                      # Portuguese (default)
│   ├── app/                 # Authenticated routes (no header)
│   │   ├── dashboard/       # Investigations dashboard
│   │   ├── chat/           # AI chat interface
│   │   └── [other protected routes]
│   ├── login/              # Auth page (SimplifiedHeader)
│   └── [public pages]      # Landing, about, agents (Full Header or SimplifiedHeader)
├── en/                      # English (mirror structure)
└── api/                     # API routes
```

**Header Logic** (`components/pt-layout-wrapper.tsx`):

- **SimplifiedHeader**: Landing + login pages (logo, theme toggle, PT/EN, login button)
- **Full Header**: Public content pages (includes navigation menu)
- **No Header**: Authenticated `/app/*` routes

### Chat System Architecture (Simplified Jan 2025)

**Evolution**: Consolidated from 6 adapters + SmartChatService → 2 adapters with simple failback.

**Core Flow**:

```
User Message → ChatService
      ↓
Check localStorage 'maritaca_selected_model'
      ↓
┌─────┴─────┐
│           │
Maritaca?   No
│           │
↓           ↓
Fallback   Primary → Success? → Response
Adapter    Adapter       ↓
(LLM)      (Backend)  Failure? → Fallback
```

**Components**:

1. **ChatService** (`lib/chat/chat.service.ts`):
   - Main orchestrator with automatic fallback
   - 5-minute in-memory cache
   - Exponential backoff (max 2 retries)
   - Modes: Cidadão.AI (backend multi-agent) OR Maritaca Direct (LLM)

2. **Primary Adapter** (`lib/chat/adapters/primary.adapter.ts`):
   - Connects to Railway backend
   - Multi-agent orchestration (Abaporu, Zumbi, Anita, etc.)
   - SSE streaming support
   - Investigation tracking

3. **Fallback Adapter** (`lib/chat/adapters/fallback.adapter.ts`):
   - Direct Maritaca AI integration
   - Used when: backend down OR user selects Maritaca mode
   - Models: Sabiazinho-3 (optimized) or Sabiá-3 (standard)

### State Management (Zustand)

- `store/chat-store.ts`: Chat sessions, messages, agents, investigations
- `store/notification-store.ts`: Toast notifications
- `store/tooltip-store.ts`: Tooltip state

Key actions: `initializeChat()`, `sendMessage()`, `sendStreamingMessage()`, `createNewSession()`

### Agent System

17 AI agents with Brazilian identities (`data/agents.ts`):

**Tier 1 - Operational (10)**: Abaporu (orchestrator), Zumbi (anomaly detection), Anita (pattern analysis), Tiradentes (reports), Senna (router), Nanã (memory), José Bonifácio (legal), Machado de Assis (communication), +2 more

**Tier 2-3**: Framework ready, implementation pending

### Progressive Web App (Serwist)

**Migration** (Jan 2025): `@ducanh2912/next-pwa` → `@serwist/next` for Next.js 15 compatibility.

- Service Worker: `app/sw.ts`
- Disabled in dev (`DISABLE_PWA=true`)
- NetworkFirst caching
- Components: `InstallPrompt`, `UpdateNotification`, `OfflineBanner`

### Performance Optimizations

**Webpack** (`next.config.mjs`):

- Custom chunk splitting: framework, charts, animations, pdf-export
- `runtimeChunk: 'single'`
- Package optimization: lucide-react, recharts, d3, jspdf

**Images**: AVIF + WebP, responsive sizes (640px → 3840px), 60s cache TTL

**Code Splitting**: Dynamic imports for PDF export, charts, VLibras

### Component Patterns

**Responsive Components**:

- Separate mobile/desktop components (`components/mobile/`)
- Pattern: CSS `hidden md:block` / `block md:hidden`

**Landing Components** (`components/landing/`):

- `SimplifiedHeader`, `ContentCard`, `ExternalLinkCard`, `LandingModal`

**Accessibility** (`components/a11y/`):

- `vlibras-lazy.tsx`: LIBRAS widget
- `accessibility-panel.tsx`: Unified controls
- `announcer.tsx`: Screen reader support
- `skip-links.tsx`: Keyboard navigation

### Testing Infrastructure

**Unit Tests** (Vitest + jsdom):

- 80+ test files, 60% coverage target
- Setup: `vitest.setup.ts`

**E2E Tests** (Playwright):

- 9 test files, multi-browser (Chromium, Firefox, WebKit)
- Mobile: Pixel 5, iPhone 12
- Config: `playwright.config.ts`, `playwright.mobile.config.ts`

**Manual Scripts**: 40+ scripts in `/scripts` - see `scripts/README.md`

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

# Production (auto-injected by Vercel)
KV_URL=                               # Vercel KV cache
```

**Setup**: `cp .env.example .env.local` → Fill Supabase credentials → Never commit `.env.local`

---

## Common Development Tasks

### Debugging Chat

```bash
node scripts/testing/test-backend.js              # Backend connectivity
node scripts/testing/test-chat-live.js            # Chat integration
# Check browser console for CORS errors
# Verify NEXT_PUBLIC_API_URL
# Check localStorage 'maritaca_selected_model'
```

### Debugging Auth

```bash
# 1. Verify Supabase credentials in .env.local
# 2. Check OAuth redirect URLs:
#    - http://localhost:3000/auth/callback (dev)
#    - https://your-domain.vercel.app/auth/callback (prod)
# 3. Clear cookies + localStorage
# 4. Verify Route Handler uses createServerClient
```

### Build Failures

```bash
rm -rf .next node_modules package-lock.json
npm install
npm run type-check
npm run build 2>&1 | grep -i "circular"  # Check circular deps
```

### Playwright Issues

```bash
npx playwright install                   # Install/update browsers
npx playwright test --headed             # Debug with UI
rm -rf test-results/ playwright-report/  # Clear results
```

### VLibras Not Loading

```bash
node scripts/testing/test-vlibras.js
node scripts/diagnostics/diagnose-vlibras.js
# VLibras only loads on /pt/* routes
# Check NEXT_PUBLIC_ENABLE_VLIBRAS=true
```

### Adding a New Agent

1. Define in `data/agents.ts`
2. Add avatar to `public/agents/`
3. Update types in `types/chat.ts`
4. Implement logic in `cidadao.ai-backend`

---

## Key Technical Patterns

### 1. Supabase Client Creation

**Server Components**:

```typescript
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient() // ✅ OK
```

**Route Handlers** (see Critical section above): Use `createServerClient()` with explicit cookies.

### 2. Chat Mode Detection

```typescript
// ChatService automatically detects Maritaca mode
const maritacaModel = localStorage.getItem('maritaca_selected_model')
if (maritacaModel) {
  // Use Fallback Adapter (bypass backend)
} else {
  // Use Primary Adapter (backend multi-agent)
}
```

### 3. Internationalization

Routes: `/pt/*` and `/en/*` with `PTLayoutWrapper` handling conditional headers.

### 4. Accessibility

**VLibras** (`components/a11y/vlibras-lazy.tsx`):

- Lazy loaded, PT pages only
- User preference in localStorage
- Hook: `useVLibras()`

**Accessibility Panel**:

- FAB button (bottom-right)
- Shortcuts: Alt+A (panel), Alt+H (contrast), Alt+± (font size)

**WCAG AAA**: Touch targets ≥44px, contrast >7:1, keyboard navigation, screen reader support

### 5. Performance

**Lazy Loading**:

```typescript
import { lazyLoad } from '@/lib/utils/code-splitting'
const PDFExport = lazyLoad(() => import('@/lib/export-service'))
```

**Bundle Analysis**: `ANALYZE=true npm run build`

**Web Vitals**: Tracked via `lib/web-vitals.ts` → Vercel Analytics

---

## Critical Files Reference

**Authentication**:

- `app/auth/callback/route.ts` - OAuth (uses createServerClient)
- `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`

**Chat**:

- `lib/chat/chat.service.ts` - Main orchestrator
- `lib/chat/adapters/primary.adapter.ts`, `lib/chat/adapters/fallback.adapter.ts`
- `store/chat-store.ts` - Zustand state

**Testing**:

- `vitest.config.mjs`, `playwright.config.ts`, `playwright.mobile.config.ts`
- `vitest.setup.ts` - Test setup

**Performance**:

- `next.config.mjs` - Next.js + Serwist + bundle analyzer
- `app/sw.ts` - Service Worker
- `lib/web-vitals.ts`

**Layout**:

- `components/pt-layout-wrapper.tsx` - Conditional header logic

---

## Deployment (Vercel)

**Build**: `npm run build` | **Output**: `.next` | **Node**: 18.x+

### Pre-Production Checklist

1. ✅ `npm run test` passes
2. ✅ `npm run test:playwright` passes
3. ✅ `npm run type-check` clean
4. ✅ `npm run lint` clean
5. ✅ Coverage >60% (`npm run test:coverage`)
6. ✅ Lighthouse acceptable (`npm run lighthouse`)
7. ✅ Bundle size acceptable (`npm run analyze`)
8. ✅ Backend integration (`node scripts/testing/test-backend-comprehensive.js`)

### Production Environment Variables

Configure in Vercel dashboard:

- `NEXT_PUBLIC_API_URL`: Railway backend
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_ENABLE_VLIBRAS=true`
- Remove `DISABLE_PWA` or set to `false`
- Vercel KV: Auto-injected

---

## Git Workflow

### Commit Format

```
<type>(scope): <summary>

<optional body>
```

Types: feat, fix, docs, refactor, test, chore, perf

Examples:

```
feat(chat): add SSE streaming support
fix(auth): correct OAuth redirect handling
refactor(chat): simplify adapter architecture
```

### Pre-commit Hooks (Husky)

1. ESLint
2. TypeScript validation
3. Commitlint (conventional commits)

Bypass (not recommended): `git commit --no-verify`

### Quality Gates

```bash
npm run type-check          # Must pass
npm run lint                # Must pass
npm run test:coverage       # ≥60%
npm run test:playwright     # All E2E pass
```

---

## Dependency Management (Renovate)

**Auto-updates**: 80+ deps, PRs auto-created Mon/Thu 5am BRT

**Automerged**: Patches (1.0.0→1.0.1), devDep minors
**Manual review**: Majors, Next.js, React, Supabase

**Dashboard**: GitHub Issue "🤖 Renovate Dependency Dashboard" (pin it!)

**Commands** (comment on PR):

```
@renovate rebase      # Update with main
@renovate retry       # Retry failed
@renovate pause       # Pause PR
```

**Config**: `renovate.json` | **Docs**: `docs/10-reference/renovate-guide.md`

---

## Library Organization

**Chat**: `lib/chat/` - ChatService, adapters, types
**State**: `store/` - Zustand stores (chat, notifications, tooltips)
**Caching**: `lib/cache/` - in-memory, IndexedDB, Vercel KV
**Security**: `lib/security/` - CSP, rate limiting, OWASP
**Monitoring**: `lib/monitoring/`, `lib/telemetry/`, `lib/logger/`
**Services**: `lib/export/`, `lib/analytics/`, `lib/websocket/`
**Utilities**: `lib/utils/`, `lib/constants/`, `lib/api/`

**Data**: `data/agents.ts` - 17 agent definitions
**Types**: `types/chat.ts`, global types

---

## Documentation

Complete docs in `/docs`:

- `01-getting-started/`: Installation, quick start
- `02-architecture/`: System design
- `03-features/`: Feature docs
- `04-api/`: API reference
- `05-guides/`: Development guides
- `06-development/`: Patterns, conventions
- `07-design/`: Design system
- `08-testing/`: Testing strategies
- `09-deployment/`: Deploy guides
- `10-reference/`: Migration guides, Renovate
- `archive/`: Archived docs

**Entry**: `/docs/README.md`

---

## Quick Start for New Developers

```bash
# 1. Clone and setup
git clone https://github.com/anderson-ufrj/cidadao.ai-frontend.git
cd cidadao.ai-frontend
npm install

# 2. Configure
cp .env.example .env.local
# Edit .env.local with Supabase credentials

# 3. Start
npm run dev          # http://localhost:3000

# 4. Test (new terminal)
npm run test:ui      # Unit tests
npm run storybook    # Component dev (optional)
```

**Notes**:

- Supabase required for OAuth
- Backend defaults to Railway production
- PWA disabled in dev
- VLibras disabled by default
