# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Author**: Anderson Henrique da Silva
**Location**: Minas Gerais, Brasil
**Last Updated**: 2025-12-09

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

# Manual integration scripts (67 available)
# Organized by category in scripts/:
# - scripts/testing/         - Test scripts
# - scripts/diagnostics/     - Troubleshooting
# - scripts/monitoring/      - Performance monitoring
# - scripts/analysis/        - Code analysis
# - scripts/generation/      - Code generation
# - scripts/utilities/       - Various utilities
# - scripts/db/              - Database utilities
# - scripts/admin/           - Admin utilities
# - scripts/debug/           - Debug utilities
```

### Performance & Analysis

```bash
npm run analyze               # Bundle analysis
npm run lighthouse            # Lighthouse CI
node scripts/monitoring/monitor-backend.js
node scripts/analysis/analyze-bundle.js
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
│   ├── agora/              # Learning platform (Ágora Academy)
│   │   ├── dashboard/      # XP, badges, progress
│   │   ├── chat/           # Agora-specific chat
│   │   ├── trilhas/        # Learning tracks
│   │   ├── ranking/        # Leaderboards
│   │   ├── perfil/         # User profile
│   │   └── onboarding/     # User onboarding flow
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

Nine main stores in `store/`:

- `chat-store.ts`: Chat sessions, messages, agents, investigations
  - Actions: `initializeChat()`, `sendMessage()`, `sendStreamingMessage()`, `createNewSession()`
  - Persisted to localStorage
- `notification-store.ts`: Toast notifications (success/error/warning/info)
- `tooltip-store.ts`: Tooltip visibility state
- `badge-store.ts`: User achievement badges (fetching, caching, animations)
- `survey-store.ts`: UX survey state (progress, answers, completion)
- `voice-settings-store.ts`: Voice/TTS settings
- `agora-chat-store.ts`: Ágora platform chat state (separate from main chat)
- `celebration-store.ts`: Achievement celebration animations and triggers
- `kids-store.ts`: Kids mode state (profiles, sessions, parental tracking)

**Pattern**: Stores use Zustand with persist middleware for localStorage persistence.

### Agent System

19 AI agents with Brazilian identities defined in `data/agents.ts`:

**Tier 1 - Operational (10)**:

- Abaporu (orchestrator)
- Zumbi (anomaly detection)
- Anita (pattern analysis)
- Tiradentes (reports)
- Senna (router)
- Nanã (memory)
- José Bonifácio (legal)
- Machado de Assis (communication)
- +2 more

**Kids Mode Agents (2)**:

- Monteiro Lobato (storytelling mentor for children)
- Tarsila do Amaral (creative art mentor for children)

**Tier 2-3**: Framework ready, implementation pending

Each agent has:

- Unique ID, name, role (PT/EN)
- Description (PT/EN)
- Avatar image in `public/agents/`
- Wikipedia link for cultural context

### Ágora Learning Platform

Gamified learning platform at `/pt/agora/*` with XP system, badges, and learning tracks.

**Full Documentation**: See `docs/agora/README.md` for comprehensive documentation including:

| Category       | Document                                   | Description                                                 |
| -------------- | ------------------------------------------ | ----------------------------------------------------------- |
| Fundamentos    | `01-fundamentos/visao-missao.md`           | Vision 2030, mission, values, personas                      |
| Pedagogia      | `02-pedagogia/referencial-teorico.md`      | Learning theories (Piaget, Vygotsky, Kolb, Bloom)           |
| Gamificação    | `03-gamificacao/xp-niveis.md`              | XP system, levels, ranks, formulas                          |
| Gamificação    | `03-gamificacao/badges.md`                 | 13 implemented badges + proposals                           |
| Trilhas        | `04-trilhas/sistema-trilhas.md`            | 5 learning tracks (Intro, Backend, Frontend, AI/ML, DevOps) |
| Avaliação      | `05-avaliacao/sistema-avaliacao.md`        | Quizzes, exercises, code review, rubrics                    |
| Arquitetura    | `06-arquitetura/visao-geral.md`            | Technical architecture, DB schema, Server Actions           |
| Acessibilidade | `07-acessibilidade/guia-acessibilidade.md` | WCAG AAA, VLibras, checklists                               |
| Roadmap        | `08-roadmap/features-propostas.md`         | 2025-2026 roadmap, proposed features                        |
| API            | `09-api/integracao-api.md`                 | Supabase, GitHub, PostHog, authentication                   |

**Auth Architecture** (`app/pt/agora/layout.tsx`):

```tsx
<AgoraAuthProvider>
  {' '}
  {/* Real auth (Supabase OAuth) */}
  <AgoraDemoProvider>
    {' '}
    {/* Demo mode (localStorage) */}
    <UnifiedAgoraProvider>
      {' '}
      {/* Auto-selects real/demo based on auth */}
      {children}
    </UnifiedAgoraProvider>
  </AgoraDemoProvider>
</AgoraAuthProvider>
```

**Hook Usage**:

```typescript
import { useAgora } from '@/hooks/use-agora'

const { user, addXp, startSession, badges, mode } = useAgora()
// mode: 'real' (OAuth) or 'demo' (localStorage)
```

**Database Tables** (Supabase):

- `agora_profiles`: XP, level, rank, streak, badges
- `agora_xp_transactions`: XP history
- `agora_sessions`: Study sessions
- `agora_diary_entries`: Learning diary

**Components** (`components/agora/`):

- `agora-header.tsx`, `agora-sidebar.tsx`: Navigation
- `stat-card.tsx`, `badge-showcase.tsx`: UI elements
- `lgpd-consent-modal.tsx`, `internship-contract-modal.tsx`: Compliance

### Progressive Web App (Serwist)

**Migration** (Jan 2025): `@ducanh2912/next-pwa` → `@serwist/next` for Next.js 15 compatibility.

- Service Worker: `app/sw.ts`
- Disabled in dev (`DISABLE_PWA=true` or `NODE_ENV=development`)
- NetworkFirst caching strategy
- Components: `InstallPrompt`, `UpdateNotification`, `OfflineBanner`

### Performance Optimizations

**Webpack** (`next.config.mjs`):

- Custom chunk splitting: framework, charts, animations, pdf-export
- `runtimeChunk: 'single'`
- Package optimization: lucide-react, recharts, d3, jspdf
- Optimized node_modules bundling by package name

**Images**: AVIF + WebP formats, responsive sizes (640px → 3840px), 60s cache TTL

**Code Splitting**: Dynamic imports for PDF export, charts, VLibras

### Component Patterns

**Responsive Components**:

- Separate mobile/desktop components (`components/mobile/`)
- Pattern: CSS `hidden md:block` / `block md:hidden`

**Landing Components** (`components/landing/`):

- `SimplifiedHeader`, `ContentCard`, `ExternalLinkCard`, `LandingModal`

**Accessibility** (`components/a11y/`):

- `vlibras-lazy.tsx`: LIBRAS widget (lazy loaded)
- `accessibility-panel.tsx`: Unified controls (FAB button)
- `announcer.tsx`: Screen reader support
- `skip-links.tsx`: Keyboard navigation

### Testing Infrastructure

**Unit Tests** (Vitest + jsdom):

- 80+ test files, 60% coverage target (thresholds in `config/vitest.config.mjs`)
- Setup: `vitest.setup.ts`
- Pattern: `*.test.ts` or `*.test.tsx` co-located with source files

**E2E Tests** (Playwright):

- 8 test files in `__tests__/e2e/`
- Multi-browser: Chromium, Firefox, WebKit
- Mobile configs: Pixel 5, iPhone 12 (`config/playwright.mobile.config.ts`)
- Main config: `config/playwright.config.ts`

**Manual Scripts**: 67 scripts organized in `/scripts` subdirectories

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
node scripts/testing/test-chat-full-flow.js       # Full chat flow test
# Check browser console for CORS errors
# Verify NEXT_PUBLIC_API_URL in .env.local
# Check localStorage 'maritaca_selected_model'
```

**Common Issues**:

- CORS errors → Check backend CORS config and API URL
- Messages not sending → Check `lib/chat/chat.service.ts` logs
- Agent not responding → Verify agent is registered in backend

### Debugging Auth

```bash
# 1. Verify Supabase credentials in .env.local
# 2. Check OAuth redirect URLs in Supabase dashboard:
#    - http://localhost:3000/auth/callback (dev)
#    - https://your-domain.vercel.app/auth/callback (prod)
# 3. Clear cookies + localStorage
# 4. Verify Route Handler uses createServerClient (see Critical section)
```

**Files to check**:

- `app/auth/callback/route.ts` - OAuth callback handler
- `lib/supabase/middleware.ts` - Session refresh middleware
- `lib/supabase/server.ts` - Server-side client creation
- `lib/supabase/client.ts` - Client-side client creation

### Build Failures

```bash
rm -rf .next node_modules package-lock.json
npm install
npm run type-check                   # Check TypeScript errors
npm run build 2>&1 | grep -i "circular"  # Check circular deps
```

**Common causes**:

- Circular dependencies → Check import chains
- Missing environment variables → Verify .env.local
- Type errors → Run `npm run type-check` for details

### Playwright Issues

```bash
npx playwright install                   # Install/update browsers
npx playwright test --headed             # Debug with UI
npx playwright test --debug              # Debug mode with inspector
rm -rf test-results/ playwright-report/  # Clear results
```

### VLibras Not Loading

```bash
node scripts/testing/test-vlibras.js
node scripts/diagnostics/diagnose-vlibras.js
# VLibras only loads on /pt/* routes
# Check NEXT_PUBLIC_ENABLE_VLIBRAS=true in .env.local
# Check browser console for script loading errors
```

**File**: `components/a11y/vlibras-lazy.tsx`

### Debugging Ágora

```bash
# Check for demo mode: URL param ?demo=true forces demo mode
# Real auth: Requires OAuth login, uses Supabase tables
# Demo mode: Uses localStorage, no backend required
```

**Files to check**:

- `hooks/use-agora.tsx` - Unified hook (determines real/demo mode)
- `hooks/use-agora-auth.ts` - OAuth flow
- `app/pt/agora/layout.tsx` - Provider hierarchy

### Adding a New Agent

1. Define in `data/agents.ts` with PT/EN translations
2. Add avatar to `public/agents/` (PNG format recommended)
3. Update types in `types/chat.ts` if needed
4. Implement backend logic in `cidadao.ai-backend` repository

---

## Key Technical Patterns

### 1. Supabase Client Creation

**Server Components** (`app/` directory):

```typescript
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient() // ✅ OK
```

**Client Components**:

```typescript
import { createClient } from '@/lib/supabase/client'
const supabase = createClient() // ✅ OK (no await)
```

**Route Handlers** (see Critical section above): Use `createServerClient()` with explicit cookies.

### 2. Chat Mode Detection

```typescript
// ChatService automatically detects Maritaca mode
const maritacaModel = localStorage.getItem('maritaca_selected_model')
if (maritacaModel) {
  // Use Fallback Adapter (bypass backend, direct LLM)
} else {
  // Use Primary Adapter (backend multi-agent system)
}
```

User can toggle between modes in chat settings.

### 3. Internationalization

Routes: `/pt/*` (Portuguese) and `/en/*` (English)

**Messages**: `messages/pt.json` and `messages/en.json`

**i18n utility**: `lib/i18n.ts` handles translations

**Layout wrapper**: `components/pt-layout-wrapper.tsx` manages conditional headers based on route

### 4. Accessibility

**VLibras** (`components/a11y/vlibras-lazy.tsx`):

- Lazy loaded to reduce initial bundle
- PT pages only (`/pt/*` routes)
- User preference stored in localStorage
- Hook: `useVLibras()` in `hooks/use-vlibras.ts`

**Accessibility Panel** (`components/a11y/accessibility-panel.tsx`):

- FAB button (bottom-right, fixed position)
- Keyboard shortcuts: Alt+A (panel), Alt+H (contrast), Alt+± (font size)
- Features: High contrast, font size, VLibras toggle

**WCAG AAA compliance**:

- Touch targets ≥44px (mobile)
- Contrast ratio >7:1 (high contrast mode)
- Full keyboard navigation
- Screen reader support (ARIA labels, announcements)

### 5. Performance

**Lazy Loading**:

```typescript
import { lazyLoad } from '@/lib/utils/code-splitting'
const PDFExport = lazyLoad(() => import('@/lib/export-service'))
```

**Bundle Analysis**:

```bash
ANALYZE=true npm run build
```

Opens webpack bundle analyzer in browser.

**Web Vitals**: Tracked via `lib/web-vitals.ts` → sent to Vercel Analytics

---

## Critical Files Reference

**Authentication**:

- `app/auth/callback/route.ts` - OAuth callback (uses createServerClient)
- `lib/supabase/client.ts` - Client-side Supabase client
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/supabase/middleware.ts` - Session refresh middleware

**Chat System**:

- `lib/chat/chat.service.ts` - Main orchestrator
- `lib/chat/adapters/primary.adapter.ts` - Backend adapter
- `lib/chat/adapters/fallback.adapter.ts` - Maritaca LLM adapter
- `store/chat-store.ts` - Zustand state management
- `lib/chat/types.ts` - TypeScript interfaces

**Testing**:

- `config/vitest.config.mjs` - Unit test configuration
- `config/playwright.config.ts` - E2E test configuration
- `config/playwright.mobile.config.ts` - Mobile E2E tests
- `vitest.setup.ts` - Test environment setup

**Performance**:

- `next.config.mjs` - Next.js config + Serwist + bundle analyzer
- `app/sw.ts` - Service Worker for PWA
- `lib/web-vitals.ts` - Web Vitals tracking

**Layout & Routing**:

- `app/layout.tsx` - Root layout
- `app/pt/layout.tsx` - Portuguese layout
- `app/en/layout.tsx` - English layout
- `components/pt-layout-wrapper.tsx` - Conditional header logic

**State Management**:

- `store/chat-store.ts` - Chat state (messages, sessions, agents)
- `store/notification-store.ts` - Toast notifications
- `store/tooltip-store.ts` - Tooltip state
- `store/badge-store.ts` - Achievement badges
- `store/survey-store.ts` - UX survey state
- `store/voice-settings-store.ts` - Voice/TTS settings

**Ágora Platform**:

- `hooks/use-agora.tsx` - Unified Ágora hook (real/demo mode)
- `hooks/use-agora-auth.ts` - OAuth authentication
- `hooks/use-agora-demo.ts` - Demo mode with localStorage
- `components/agora/` - Ágora-specific components

---

## Deployment (Vercel)

**Build**: `npm run build` | **Output**: `.next` | **Node**: 18.x+

### Pre-Production Checklist

1. ✅ `npm run test` passes (unit tests)
2. ✅ `npm run test:playwright` passes (E2E tests)
3. ✅ `npm run type-check` clean (no TypeScript errors)
4. ✅ `npm run lint` clean (ESLint passes)
5. ✅ Coverage >60% (`npm run test:coverage`)
6. ✅ Lighthouse acceptable (`npm run lighthouse`)
7. ✅ Bundle size acceptable (`npm run analyze` - should be <400KB)
8. ✅ Backend integration (`node scripts/testing/test-backend-comprehensive.js`)

### Production Environment Variables

Configure in Vercel dashboard:

- `NEXT_PUBLIC_API_URL`: Railway backend URL
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase credentials
- `NEXT_PUBLIC_ENABLE_VLIBRAS=true`: Enable VLibras widget
- Remove `DISABLE_PWA` or set to `false`: Enable PWA
- `NEXT_PUBLIC_GA_ID`: Google Analytics (optional)
- `NEXT_PUBLIC_POSTHOG_KEY`: PostHog analytics (optional)
- Vercel KV: Auto-injected (no manual config needed)

---

## Git Workflow

### Commit Format

```
<type>(scope): <summary>

<optional body>
```

**Types**: feat, fix, docs, refactor, test, chore, perf

**Examples**:

```
feat(chat): add SSE streaming support
fix(auth): correct OAuth redirect handling
refactor(chat): simplify adapter architecture
test(chat): increase coverage to 85%
docs(readme): update installation instructions
```

### Pre-commit Hooks (Husky)

Automatically runs on `git commit`:

1. ESLint (`npm run lint`)
2. TypeScript validation (`npm run type-check`)
3. Commitlint (validates conventional commit format)

Bypass (not recommended): `git commit --no-verify`

### Quality Gates

Before pushing to main:

```bash
npm run type-check          # Must pass
npm run lint                # Must pass
npm run test:coverage       # Must be ≥60%
npm run test:playwright     # All E2E tests must pass
```

---

## Dependency Management (Renovate)

**Auto-updates**: 80+ dependencies, PRs auto-created Mon/Thu 5am BRT

**Automerged**:

- Patches (1.0.0 → 1.0.1)
- devDependency minors

**Manual review required**:

- Major version bumps
- Next.js, React, Supabase updates

**Dashboard**: GitHub Issue "🤖 Renovate Dependency Dashboard" (should be pinned)

**Commands** (comment on Renovate PR):

```
@renovate rebase      # Rebase PR with latest main
@renovate retry       # Retry failed checks
@renovate pause       # Pause this PR
```

**Config**: `renovate.json` in repository root
**Docs**: `docs/10-reference/renovate-guide.md`

---

## Library Organization

**Chat System**: `lib/chat/` - ChatService, adapters, types
**State Management**: `store/` - Zustand stores (chat, notifications, badges, survey, voice)
**Caching**: `lib/cache/` - in-memory, IndexedDB, Vercel KV
**Security**: `lib/security/` - CSP config, rate limiting, OWASP protections
**Monitoring**: `lib/monitoring/` - Sentry config, metrics service
**Telemetry**: `lib/telemetry/` - Chat telemetry, cost metrics
**Services**: `lib/export/`, `lib/analytics/`, `lib/websocket/`
**Utilities**: `lib/utils/`, `lib/constants/`, `lib/api/`
**Supabase**: `lib/supabase/` - Client, server, middleware, auth helpers

**Data**: `data/agents.ts` - 17 agent definitions with PT/EN translations
**Types**: `types/` - Global TypeScript interfaces

---

## Documentation

Complete documentation in `/docs`:

- `01-getting-started/`: Installation, quick start, environment setup
- `02-architecture/`: System design, patterns
- `03-features/`: Feature-specific documentation
- `04-api/`: API reference
- `05-guides/`: Development guides
- `06-development/`: Coding patterns, conventions
- `07-design/`: Design system, components
- `08-testing/`: Testing strategies, coverage
- `09-deployment/`: Deployment guides
- `10-reference/`: Migration guides, Renovate, tools
- `agora/`: **Ágora Academy complete documentation** (11 docs, ~5.6k lines)
  - Pedagogical foundations (Piaget, Vygotsky, Bloom)
  - Gamification system (XP, levels, badges)
  - Learning tracks and evaluation system
  - Technical architecture and API integrations
  - Accessibility guidelines and roadmap
- `archive/`: Archived documentation

**Entry points**:

- `/docs/README.md` - Main project documentation index
- `/docs/agora/README.md` - Ágora Academy documentation index

---

## Quick Start for New Developers

```bash
# 1. Clone and setup
git clone https://github.com/anderson-ufrj/cidadao.ai-frontend.git
cd cidadao.ai-frontend
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local:
# - Add Supabase credentials (required for auth)
# - NEXT_PUBLIC_API_URL defaults to Railway production

# 3. Start development server
npm run dev          # http://localhost:3000

# 4. Run tests (new terminal)
npm run test:ui      # Unit tests with Vitest UI
npm run storybook    # Component development (optional)

# 5. Run quality checks before committing
npm run type-check && npm run lint
npm run test:coverage
```

**Notes**:

- Supabase credentials required for OAuth authentication
- Backend defaults to Railway production (no local backend needed)
- PWA automatically disabled in development mode
- VLibras disabled by default (set `NEXT_PUBLIC_ENABLE_VLIBRAS=true` to enable)

---

## Common Script Categories

The `scripts/` directory contains 67 utility scripts organized by purpose:

**Testing** (`scripts/testing/`):

- `test-backend-comprehensive.js` - Full backend integration test
- `test-chat-live.js` - Live chat system test
- `test-vlibras.js` - VLibras (LIBRAS) integration test
- `test-maritaca-integration.js` - Maritaca LLM integration test
- `test-drummond-*.js` - Drummond agent tests (legacy)

**Diagnostics** (`scripts/diagnostics/`):

- `diagnose-vlibras.js` - Troubleshoot VLibras issues

**Monitoring** (`scripts/monitoring/`):

- `monitor-backend.js` - Monitor backend health
- `monitor-new-endpoints.js` - Check for new API endpoints

**Analysis** (`scripts/analysis/`):

- `analyze-bundle.js` - Analyze bundle size
- `dependency-analyzer.js` - Analyze dependency tree
- `analyze-ux-design.js` - UX design analysis

**Generation** (`scripts/generation/`):

- `generate-component.js` - Component scaffolding
- `generate-api-types.js` - Generate API types
- `generate-icons.js` - Icon generation
- `generate-splash.js` - PWA splash screens

**Utilities** (`scripts/utilities/`):

- `check-backend-status.js` - Backend status check
- `check-wcag-contrast.js` - WCAG contrast checker
- `security-audit.js` - Security audit
- `migrate-console-logs.js` - Replace console.log with logger

**Database** (`scripts/db/`):

- `apply-migration.js` - Apply database migrations
- `check-badges.js` - Verify badge system
- `diagnose-agora-persistence.js` - Debug Ágora data issues

**Admin** (`scripts/admin/`):

- `set-superuser.js` - Set superuser permissions

**Debug** (`scripts/debug/`):

- `debug-backend.js` - Backend debugging utilities
- `debug-backend-response.js` - Response inspection

Run any script: `node scripts/<category>/<script-name>.js`
