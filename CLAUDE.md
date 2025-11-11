# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Última Atualização**: 2025-11-11

---

## 🚨 Critical Implementation Patterns

### OAuth Authentication in Route Handlers

**Critical Rule**: Route Handlers require `createServerClient()` with explicit cookie handling. Never use the `createClient()` helper.

**Correct Pattern** (`app/auth/callback/route.ts`):

```typescript
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

**Why**: The `createClient()` helper is designed for Server Components and silently fails to set cookies in Route Handler context.

---

## Project Overview

Cidadão.AI Frontend is a Next.js 15 Progressive Web App (PWA) that democratizes access to Brazilian government data through a multi-agent AI system. Features 17 specialized agents with Brazilian cultural identities, bilingual interface (PT/EN), and comprehensive accessibility (WCAG AAA, VLibras).

**Production Status**: 82% complete, production-ready infrastructure

---

## Quick Command Reference

**Most Common Commands**:

```bash
npm run dev                                         # Start dev server
npm run build && npm run start                      # Production build + start
npm run test:ui                                     # Test with UI
npm run test:playwright:ui                          # E2E tests with UI
npm run type-check && npm run lint                  # Quality check
node scripts/testing/test-backend-comprehensive.js  # Test backend connectivity
```

**Debugging Specific Issues**:

```bash
# Chat not working
node scripts/testing/test-chat-live.js

# Auth issues
# Check Route Handler uses createServerClient (not createClient)

# Build failing
rm -rf .next node_modules && npm install && npm run build

# Tests failing
npx playwright install && npm run test:playwright
```

---

## Key Development Commands

```bash
# Development
npm run dev                    # Dev server with Turbopack (http://localhost:3000)
npm run dev:test              # Dev server on port 3001 (for parallel testing)
npm run build                 # Production build
npm run start                 # Production server
npm run lint                  # ESLint
npm run type-check            # TypeScript validation

# Testing - Unit Tests (Vitest)
npm run test                  # Watch mode
npm run test:ui               # UI interface
npm run test:coverage         # Coverage report (target: 60%)
npm run test:watch            # Watch mode (alternative)

# Testing - Specific test execution
npx vitest run __tests__/unit/utils/cn.test.ts           # Single unit test
npx vitest run __tests__/unit/components/toast.test.tsx   # Single component test
npx vitest run __tests__/integration/                     # All integration tests
npx vitest --coverage __tests__/unit/components/          # Coverage for specific folder

# Testing - E2E Tests (Playwright)
npm run test:playwright       # All E2E tests
npm run test:playwright:ui    # Playwright UI mode
npm run test:e2e              # E2E only
npm run test:e2e:ui           # E2E with UI
npm run test:mobile           # Mobile-specific tests
npm run test:mobile:ui        # Mobile tests with UI
npm run test:design-system    # Design system E2E tests

# Testing - Specific E2E execution
npx playwright test __tests__/e2e/auth.spec.ts            # Single E2E test
npx playwright test __tests__/e2e/mobile/                 # Mobile tests only
npx playwright test --headed                              # Watch test execution
npx playwright test --debug                               # Debug mode

# Testing - Manual Integration Scripts
# Scripts organizados em diretórios categorizados (Nov 2025):
# - scripts/testing/      - Scripts de teste (test-*.js)
# - scripts/diagnostics/  - Diagnóstico (diagnose-*.js)
# - scripts/monitoring/   - Monitoramento (monitor-*.js)
# - scripts/analysis/     - Análise (analyze-*.js)
# - scripts/generation/   - Geração de código (generate-*.js)
# - scripts/utilities/    - Utilitários gerais
# - scripts/debug/        - Ferramentas de debug

# Scripts mais usados:
node scripts/testing/test-backend-comprehensive.js   # Suite completa de testes do backend
node scripts/testing/test-backend.js                 # Verificação rápida do backend
node scripts/testing/test-chat-live.js               # Teste de chat em tempo real
node scripts/testing/test-vlibras.js                 # VLibras (LIBRAS)
node scripts/diagnostics/diagnose-vlibras.js         # Troubleshooting VLibras
node scripts/monitoring/monitor-backend.js           # Monitoramento de performance

# Ver scripts/README.md para documentação completa (40+ scripts)

# Component Development
npm run storybook             # Storybook dev server (http://localhost:6006)
npm run build-storybook       # Static Storybook build

# Performance & Analysis
npm run analyze               # Bundle analysis (server + browser)
npm run analyze:server        # Server bundle only
npm run analyze:browser       # Browser bundle only
npm run lighthouse            # Lighthouse CI audits
```

---

## High-Level Architecture

### Application Structure

Next.js 15 App Router with internationalization (`/pt/*` and `/en/*` routes):

```
app/
├── pt/                      # Portuguese (default)
│   ├── (authenticated)/     # Protected routes (requires auth)
│   │   ├── app/            # Authenticated area without header
│   │   ├── chat/           # AI chat interface
│   │   ├── dashboard/      # Investigations dashboard
│   │   └── [other protected routes]
│   ├── login/              # Authentication page
│   └── [public pages]      # Landing, about, agents, etc.
├── en/                      # English (mirror structure)
└── api/                     # API routes
```

**Key Layout Pattern**: The `PTLayoutWrapper` component conditionally renders headers:

- **SimplifiedHeader**: Landing pages and login (logo, theme, PT/EN, login button)
- **Full Header**: Public content pages (includes navigation menu)
- **No Header**: Authenticated `/app/*` routes

### Chat System Architecture (Simplified - Jan 2025)

**Consolidation**: Reduced from 6 adapters + SmartChatService to 2 adapters with simple failback.

**Core Components**:

1. **ChatService** (`lib/chat/chat.service.ts`):
   - Main orchestrator with automatic fallback
   - Built-in 5-minute in-memory cache
   - Exponential backoff retry logic (max 2 retries)
   - Supports two modes:
     - **Cidadão.AI Mode**: Uses backend multi-agent system (Primary Adapter)
     - **Maritaca Direct Mode**: Direct LLM calls, bypassing backend (Fallback Adapter)

2. **Primary Adapter** (`lib/chat/adapters/primary.adapter.ts`):
   - Connects to Cidadão.AI backend (Railway)
   - Full multi-agent orchestration (Abaporu, Zumbi, Anita, etc.)
   - Supports SSE streaming
   - Investigation tracking and agent coordination

3. **Fallback Adapter** (`lib/chat/adapters/fallback.adapter.ts`):
   - Direct Maritaca AI integration (100% LLM)
   - Used when backend is unavailable OR user selects Maritaca Direct Mode
   - Bypasses multi-agent system for simple Q&A
   - Model selection: Sabiazinho-3 (optimized) or Sabiá-3 (standard)

**Mode Selection**:

- Default: Cidadão.AI Mode (Primary → Fallback on failure)
- User can switch to Maritaca Direct Mode via localStorage: `maritaca_selected_model`
- When Maritaca model is selected, ChatService uses Fallback Adapter exclusively

**Flow**:

```
User Message → ChatService
                    ↓
         Check localStorage for maritaca_selected_model
                    ↓
    ┌───────────────┴───────────────┐
    │                               │
Maritaca Model Set?            No Model Set
    │                               │
    ↓                               ↓
Fallback Adapter              Primary Adapter (backend)
(Direct LLM)                       ↓
                              Success? → Response
                                   ↓
                              Failure? → Fallback Adapter
                                          (Direct LLM)
```

### State Management

**Zustand Stores** with devtools and localStorage persistence:

- `store/chat-store.ts`: Chat sessions, messages, agent info, investigations
- `store/notification-store.ts`: Toast notifications
- `store/tooltip-store.ts`: Tooltip state management

**Key Chat Store Actions**:

- `initializeChat()`: Load or create session
- `sendMessage()`: REST API message sending
- `sendStreamingMessage()`: SSE streaming (fallbacks to REST)
- `createNewSession()`: Generate new chat session
- `loadSession()`: Load existing session from Supabase

### Agent System

17 specialized AI agents with Brazilian cultural identities (`data/agents.ts`):

**Tier 1 - Fully Operational (10)**:

- **Abaporu**: Master orchestrator
- **Zumbi dos Palmares**: Anomaly detection
- **Anita Garibaldi**: Pattern analysis
- **Tiradentes**: Report generation
- **Ayrton Senna**: Router/traffic director
- **Nanã**: Memory/context management
- **José Bonifácio**: Constitution/legal expert
- **Machado de Assis**: Communication/writing
- (2 more operational agents)

**Tier 2-3**: Framework implemented, functionality pending

### Progressive Web App (Serwist)

**Migration** (Jan 2025): `@ducanh2912/next-pwa` → `@serwist/next` for Next.js 15 compatibility.

**Configuration** (`next.config.mjs`):

- Service Worker: `app/sw.ts` (manual implementation)
- Disabled in development (`DISABLE_PWA=true`)
- NetworkFirst caching strategy
- Offline support with graceful degradation
- `skipWaiting: true`, `clientsClaim: true`
- Navigation preload enabled

**PWA Components**:

- `InstallPrompt`: Prompts user to install app (mobile-first)
- `UpdateNotification`: Notifies when new version available
- `OfflineBanner`: Shows connectivity status

### Performance Optimizations

**Webpack Configuration** (`next.config.mjs`):

- Custom chunk splitting for optimal loading
- Separate chunks: framework, charts, animations, pdf-export
- `runtimeChunk: 'single'` for shared runtime
- Package optimization: lucide-react, recharts, d3, jspdf, html2canvas

**Image Optimization**:

- AVIF + WebP formats
- Responsive device sizes (640px → 3840px)
- Remote pattern allowlist (Supabase, GitHub, Google avatars)
- Minimum cache TTL: 60s

**Code Splitting**:

- Dynamic imports for heavy components (PDF export, charts)
- Lazy loading for VLibras, export services
- Route-based code splitting (automatic)

### Component Architecture Patterns

**Mobile/Desktop Responsive Components**:

The codebase uses a pattern of separate mobile and desktop components for complex UI:

- `components/mobile/mobile-nav.tsx`: Mobile-specific navigation
- `components/mobile-nav.tsx`: Main navigation wrapper that conditionally renders mobile/desktop versions
- Pattern: Use CSS `hidden md:block` and `block md:hidden` for responsive switching
- Mobile components live in `components/mobile/` directory
- Desktop-first approach with mobile overrides

**Landing Page Components** (`components/landing/`):

- `SimplifiedHeader`: Minimalist header for landing/login pages
- `ContentCard`: Clickable cards with hover effects
- `ExternalLinkCard`: Cards for external links
- `LandingModal`: Modal wrapper for landing page modals

**Accessibility Components** (`components/a11y/`):

- `vlibras-lazy.tsx`: Lazy-loaded VLibras widget (LIBRAS)
- `accessibility-panel.tsx`: Unified accessibility controls
- `announcer.tsx`: Screen reader announcements
- `skip-links.tsx`: Keyboard navigation shortcuts

### Testing Infrastructure

**Unit Tests** (Vitest + jsdom):

- 80+ test files covering lib, components, hooks
- Coverage target: 60% (lines, functions, branches, statements)
- Test environment: jsdom with React Testing Library
- Setup: `vitest.setup.ts` (global mocks, test utilities)

**E2E Tests** (Playwright):

- 9 E2E test files covering critical user flows
- Multi-browser: Chromium, Firefox, WebKit
- Mobile testing: Pixel 5, iPhone 12
- Separate mobile config: `playwright.mobile.config.ts`
- CI: Retry 2 times, sequential execution

**Manual Integration Scripts** (organizados em `/scripts` - ver `scripts/README.md`):

- `scripts/testing/test-backend-comprehensive.js`: Suite completa de testes do backend
- `scripts/testing/test-chat-live.js`: Teste de chat em tempo real
- `scripts/testing/test-vlibras.js`: Integração VLibras (LIBRAS)
- `scripts/diagnostics/diagnose-vlibras.js`: Troubleshooting completo VLibras
- `scripts/monitoring/monitor-backend.js`: Monitoramento de performance contínuo
- **40+ scripts disponíveis** - consultar `scripts/README.md` para lista completa

---

## Environment Configuration

```bash
# Backend API (Required)
NEXT_PUBLIC_API_URL=https://cidadao-api-production.up.railway.app

# Supabase Authentication (Required for OAuth)
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=                    # Google Analytics
NEXT_PUBLIC_POSTHOG_KEY=              # PostHog (usability research)
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Development (Optional)
NODE_ENV=development
DISABLE_PWA=true                      # Disable PWA in dev
NEXT_PUBLIC_FEATURE_WEBSOCKET=false   # WebSocket (not yet supported)

# Accessibility (Optional)
NEXT_PUBLIC_ENABLE_VLIBRAS=false      # Brazilian Sign Language (LIBRAS)

# Vercel KV Cache (Production - auto-injected by Vercel)
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
```

**Setup**:

1. `cp .env.example .env.local`
2. Fill Supabase credentials (required for auth)
3. Backend URL defaults to Railway production
4. Analytics optional (app works without)
5. Never commit `.env.local`

---

## Key Technical Patterns

### 1. Supabase Client Creation

**Server Components** (`lib/supabase/server.ts`):

```typescript
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient() // ✅ OK for Server Components
```

**Route Handlers** (CRITICAL):

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const cookieStore = await cookies()
const supabase = createServerClient(url, key, {
  cookies: {
    getAll() {
      return cookieStore.getAll()
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
    },
  },
})
```

### 2. Chat Mode Detection

The ChatService automatically detects Maritaca Direct Mode:

```typescript
// In ChatService.sendMessage()
const maritacaModel =
  typeof window !== 'undefined' ? localStorage.getItem('maritaca_selected_model') : null

if (maritacaModel && this.fallbackAdapter) {
  // Use Fallback Adapter directly (bypass backend)
  return await this.tryAdapter(this.fallbackAdapter, request, 'fallback')
}

// Otherwise, use Primary Adapter (backend multi-agent system)
```

### 3. Internationalization Routing

Routes structured as `/pt/*` and `/en/*` with shared layout logic:

```typescript
// app/pt/layout.tsx and app/en/layout.tsx
<PTLayoutWrapper locale="pt">{children}</PTLayoutWrapper>
```

The wrapper conditionally renders:

- SimplifiedHeader for landing/login
- Full Header for public content
- No header for `/app/*` authenticated routes

### 4. Accessibility Patterns

**VLibras Integration** (`components/a11y/vlibras-lazy.tsx`):

- Lazy loaded to reduce initial bundle
- Only renders on Portuguese pages
- User preference persistence (localStorage)
- Programmatic control via `useVLibras()` hook

**Accessibility Panel** (`components/a11y/accessibility-panel.tsx`):

- FAB button (bottom-right)
- Keyboard shortcuts (Alt+A, Alt+H, Alt++, Alt+-)
- Font size control (4 sizes)
- High contrast mode
- VLibras toggle

**Screen Reader Support**:

- `LiveAnnouncerProvider`: Dynamic content announcements
- `SkipLinks`: Keyboard navigation shortcuts
- ARIA labels throughout
- Semantic HTML structure

### 5. Performance Patterns

**Lazy Loading** (`lib/utils/code-splitting.ts`):

```typescript
import { lazyLoad } from '@/lib/utils/code-splitting'

const PDFExport = lazyLoad(() => import('@/lib/export-service'))
```

**Bundle Analysis**:

```bash
ANALYZE=true npm run build  # Opens webpack-bundle-analyzer
```

**Web Vitals Tracking** (`lib/web-vitals.ts`):

- CLS, FID, FCP, LCP, TTFB monitoring
- Integration with Vercel Analytics
- Custom telemetry events

### 6. Performance Debugging

**Bundle Size Analysis**:

```bash
# Analyze production bundle
ANALYZE=true npm run build

# Analyze server bundle only
npm run analyze:server

# Analyze browser bundle only
npm run analyze:browser

# Check bundle size breakdown
# Opens webpack-bundle-analyzer in browser
```

**Lighthouse Audits**:

```bash
# Run Lighthouse CI
npm run lighthouse

# Collect metrics only
npm run lighthouse:collect

# Assert against thresholds
npm run lighthouse:assert

# Manual Lighthouse (Chrome DevTools)
# Open DevTools > Lighthouse tab > Generate report
```

**Performance Monitoring**:

```bash
# Monitor backend response times
node scripts/monitor-backend.js

# Track Web Vitals in production
# Automatically sent to Vercel Analytics
# View in Vercel dashboard > Analytics > Web Vitals
```

**Common Performance Issues**:

1. **Large bundle size**: Check for unoptimized imports
   - ❌ `import _ from 'lodash'` (imports entire library)
   - ✅ `import debounce from 'lodash/debounce'` (tree-shakeable)

2. **Slow page loads**: Check for blocking resources
   - Use `next/dynamic` for heavy components
   - Lazy load PDF export, charts, VLibras

3. **Poor CLS scores**: Check for layout shifts
   - Reserve space for images with width/height
   - Avoid inserting content above existing content

4. **High FCP/LCP**: Optimize critical rendering path
   - Preload critical resources
   - Minimize server response time
   - Use edge functions for faster responses

---

## Common Development Tasks

### Adding a New Agent

1. Define agent in `data/agents.ts`
2. Create avatar image in `public/agents/`
3. Update type definitions in `types/chat.ts`
4. Backend: Implement agent logic in `cidadao.ai-backend`

### Implementing a New Feature

1. Create feature branch: `git checkout -b feat/feature-name`
2. Implement with TypeScript strict mode
3. Write unit tests (target >60% coverage)
4. Write E2E tests for user-facing features
5. Check quality: `npm run type-check && npm run lint`
6. Run test suite: `npm run test:coverage`
7. Test E2E: `npm run test:playwright`
8. Commit with conventional commits (feat/fix/docs/refactor/test/chore)

### Debugging Chat Issues

```bash
# 1. Backend connectivity
node scripts/testing/test-backend.js

# 2. Test chat integration
node scripts/testing/test-chat-live.js

# 3. Comprehensive backend test
node scripts/testing/test-backend-comprehensive.js

# 4. Check browser console for CORS/network errors
# 5. Verify NEXT_PUBLIC_API_URL in .env.local
# 6. Check localStorage for maritaca_selected_model
```

### Debugging Authentication

```bash
# 1. Verify Supabase credentials in .env.local
# 2. Check OAuth redirect URLs in Supabase dashboard:
#    - http://localhost:3000/auth/callback (dev)
#    - https://your-domain.vercel.app/auth/callback (prod)
# 3. Clear browser cookies and localStorage
# 4. Check browser console for Supabase errors
# 5. Verify Route Handler uses createServerClient (not createClient)
```

### Build Failures

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check

# Check for circular dependencies
npm run build 2>&1 | grep -i "circular"
```

### Playwright Test Failures

```bash
# Install/update Playwright browsers
npm run test:install

# Or manually
npx playwright install

# For webkit on Linux (if libicu issues)
./fix-playwright-libicu.sh

# Run with headed mode to debug
npx playwright test --headed

# Debug specific test
npx playwright test --debug __tests__/e2e/auth.spec.ts

# Clear test results
rm -rf test-results/ playwright-report/
```

### PWA/Service Worker Issues

```bash
# Service worker not updating:
# 1. Clear browser cache (Ctrl+Shift+Delete)
# 2. Unregister service worker in DevTools > Application > Service Workers
# 3. Hard reload (Ctrl+Shift+R)

# During development, PWA is disabled
# Check DISABLE_PWA in .env.local or NODE_ENV

# Force rebuild service worker
rm -rf public/sw.js .next
npm run build
```

### VLibras Not Loading

```bash
# 1. Check environment variable
echo $NEXT_PUBLIC_ENABLE_VLIBRAS  # Should be 'true'

# 2. Test VLibras specifically
node scripts/testing/test-vlibras.js

# 3. Diagnostic tool (troubleshooting completo)
node scripts/diagnostics/diagnose-vlibras.js

# 4. Check CSP headers (VLibras requires external script)
# VLibras domains should be in CSP: vlibras.gov.br

# 5. VLibras only loads on Portuguese pages (/pt/*)
# Navigate to http://localhost:3000/pt to test
```

---

## Deployment

### Vercel Configuration

- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Framework Preset**: Next.js (auto-detected)
- **Node Version**: 18.x or higher

### Pre-Production Checklist

1. ✅ All unit tests pass (`npm run test`)
2. ✅ All E2E tests pass (`npm run test:playwright`)
3. ✅ Type checking clean (`npm run type-check`)
4. ✅ Linting clean (`npm run lint`)
5. ✅ Coverage >60% (`npm run test:coverage`)
6. ✅ Lighthouse scores acceptable (`npm run lighthouse`)
7. ✅ Bundle size acceptable (`npm run analyze`)
8. ✅ Manual mobile testing
9. ✅ Accessibility audit passed
10. ✅ Backend integration verified (`node scripts/testing/test-backend-comprehensive.js`)

### Environment Variables (Production)

1. Configure in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL`: Railway backend URL
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
   - `NEXT_PUBLIC_GA_ID`: Google Analytics (optional)
   - `NEXT_PUBLIC_POSTHOG_KEY`: PostHog (optional)
   - `NEXT_PUBLIC_ENABLE_VLIBRAS`: true (for production)

2. Remove development flags:
   - `DISABLE_PWA`: Remove or set to false
   - `NODE_ENV`: Set to production

3. Vercel KV: Auto-injected (no manual config)

---

## Accessibility (A11y)

### VLibras - Brazilian Sign Language (LIBRAS)

Official Brazilian government tool for LIBRAS translation.

**Components**:

- `VLibrasLazy`: Lazy-loaded widget (auto-included in PT layout)
- `useVLibras()`: Hook for programmatic control

**Features**:

- ✅ Automatic content translation
- ✅ Avatar selection (Guga, Ícaro, Hozana)
- ✅ User preference persistence
- ✅ PT pages only
- ✅ CSP-compliant

**Testing**:

```bash
NEXT_PUBLIC_ENABLE_VLIBRAS=true npm run dev
# Visit http://localhost:3000/pt
# Look for VLibras widget in bottom-right corner
```

### Accessibility Panel

Unified a11y controls with FAB button and keyboard shortcuts.

**Features**:

- Font size control (4 sizes)
- High contrast toggle (WCAG AAA)
- VLibras toggle
- Keyboard shortcuts guide

**Keyboard Shortcuts**:

- `Alt + A`: Open/close panel
- `Alt + H`: Toggle high contrast
- `Alt + +`: Increase font size
- `Alt + -`: Decrease font size

### WCAG Compliance

**WCAG AAA Features**:

- Touch targets ≥44x44px (mobile)
- Contrast ratio >7:1 (high contrast mode)
- 100% keyboard navigable
- Screen reader support (ARIA labels)
- Skip links for main content
- Form field accessibility

---

## Library Organization

### Core Utilities (`lib/`)

**Chat System**:

- `lib/chat/chat.service.ts`: Main chat orchestrator
- `lib/chat/adapters/`: Primary and Fallback adapters
- `lib/chat/types.ts`: TypeScript types for chat

**State & Caching**:

- `lib/cache/`: Caching implementations (in-memory, IndexedDB, Vercel KV)
- `lib/sse/`: Server-Sent Events client for streaming

**Security & Monitoring**:

- `lib/security/`: CSP configuration, rate limiting, OWASP protection
- `lib/monitoring/`: Performance monitoring, custom metrics
- `lib/telemetry/`: Chat telemetry, web vitals tracking
- `lib/logger/`: Structured logging with pino

**Services**:

- `lib/export/`: PDF/CSV export services
- `lib/analytics/`: Analytics tracking utilities
- `lib/websocket/`: WebSocket client (infrastructure ready, not yet enabled)

**Utilities**:

- `lib/utils/`: Common utilities (cn, code-splitting, formatters)
- `lib/constants/`: App constants and configuration
- `lib/api/`: API client utilities

### Data & Types

**Agent Configuration** (`data/agents.ts`):

- 17 agent definitions with Brazilian cultural identities
- Agent metadata: name, role, tier, avatar, description
- Used throughout the app for agent selection and display

**TypeScript Types** (`types/`):

- `types/chat.ts`: Chat-related types
- Global type definitions for consistent typing

## Critical Files Reference

### Authentication

- `app/auth/callback/route.ts` - OAuth callback (uses createServerClient)
- `lib/supabase/client.ts` - Client-side Supabase
- `lib/supabase/server.ts` - Server-side helpers
- `lib/supabase/middleware.ts` - Session refresh middleware

### Chat System

- `lib/chat/chat.service.ts` - Main orchestrator (simplified)
- `lib/chat/adapters/primary.adapter.ts` - Backend multi-agent
- `lib/chat/adapters/fallback.adapter.ts` - Direct Maritaca LLM
- `store/chat-store.ts` - Zustand chat state

### Testing

- `vitest.config.mjs` - Vitest config (60% coverage)
- `playwright.config.ts` - Playwright E2E config
- `playwright.mobile.config.ts` - Mobile testing config
- `vitest.setup.ts` - Global test setup

### Performance

- `next.config.mjs` - Next.js config + Serwist + bundle analyzer
- `app/sw.ts` - Service Worker implementation
- `lib/web-vitals.ts` - Web Vitals tracking

---

## Documentation Structure

Complete documentation in `/docs` directory:

- `01-getting-started/`: Installation, quick start, environment setup
- `02-architecture/`: System architecture, design decisions
- `03-features/`: Feature documentation (analytics, mobile, accessibility)
- `04-api/`: API reference
- `05-guides/`: Development guides
- `06-development/`: Patterns, conventions
- `07-design/`: Design system
- `08-testing/`: Testing strategies
- `09-deployment/`: Deployment guides
- `10-reference/`: Reference material, migration guides
- `archive/`: Archived documentation

**Main Entry**: `/docs/README.md` - Complete documentation index

---

## Project Status (Nov 2025)

**Production Ready**: 82% complete

**Completed**:

- ✅ Core infrastructure (Next.js 15, TypeScript, Tailwind)
- ✅ Authentication (Supabase OAuth - Google, GitHub)
- ✅ Chat system (simplified 2-adapter architecture)
- ✅ Testing infrastructure (Vitest + Playwright)
- ✅ PWA capabilities (Serwist)
- ✅ Accessibility (WCAG AAA, VLibras)
- ✅ Monitoring (Sentry)
- ✅ Performance optimization (bundle splitting, lazy loading)
- ✅ Automated dependency management (Renovate)

**Remaining**:

- ⏳ Final production deployment to Vercel
- ⏳ Load testing with production traffic
- ⏳ User acceptance testing (UAT)
- ⏳ Documentation site (Docusaurus)

---

## Git Workflow & Commit Standards

### Commit Message Format

**CRITICAL**: Follow conventional commits in English. Never mention AI assistance in commits.

```
<type>(scope): <summary>

<optional body>
```

**Types**:

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation only
- `refactor`: Code changes without fixing bugs or adding features
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, config)
- `perf`: Performance improvements
- `style`: Code style changes (formatting, missing semicolons)

**Examples**:

```
feat(chat): add SSE streaming support for real-time responses
fix(auth): correct OAuth redirect handling in production
docs(readme): update installation instructions for Node 18
refactor(chat): simplify adapter architecture to 2-adapter pattern
test(e2e): add mobile navigation tests for Pixel 5
```

### Branch Workflow

```bash
# Feature development
git checkout -b feat/feature-name
# ... make changes, test, commit ...
git push origin feat/feature-name
# Create PR on GitHub

# Bug fixes
git checkout -b fix/issue-description
# ... fix, test, commit ...

# Hotfix (for production issues)
git checkout -b hotfix/critical-issue
```

### Pre-commit Checks

The project uses Husky for pre-commit hooks:

1. **Linting**: ESLint automatically runs
2. **Type checking**: TypeScript validation
3. **Commit message validation**: commitlint enforces conventional commits

**To bypass hooks** (not recommended):

```bash
git commit --no-verify -m "message"
```

### Quality Gates Before Push

Always run before pushing:

```bash
npm run type-check          # Must pass
npm run lint                # Must pass
npm run test:coverage       # Must meet 60% threshold
npm run test:playwright     # E2E tests must pass
```

---

## Dependency Management (Renovate)

The project uses [Renovate](https://github.com/apps/renovate) for automated dependency updates.

### Quick Reference

**Configuration**: `renovate.json` (project root)
**Documentation**: `docs/10-reference/renovate-guide.md`
**Setup Guide**: `RENOVATE_SETUP.md`

### How It Works

Renovate automatically:

1. Scans 80+ dependencies for updates
2. Creates PRs with updated `package.json` and `package-lock.json`
3. Runs CI/CD tests on each PR
4. Automerges safe updates (patches, devDependencies)
5. Notifies for major updates requiring review

### Update Schedule

- **Mon/Thu 5am BRT**: Patches and minors
- **Sunday 5am BRT**: Major updates
- **Immediately**: Security patches
- **1st of month**: Lock file maintenance

### Automerge Rules

✅ **Automerged**:

- Patch updates (e.g., `1.0.0` → `1.0.1`)
- DevDependencies minors (e.g., `eslint 8.0` → `8.1`)
- Linting/formatting tools

❌ **Manual review required**:

- Major updates (e.g., `14.x` → `15.x`)
- Next.js, React, Supabase (grouped updates)
- Production dependency minors

### Working with Renovate PRs

**Review a PR**:

```bash
# Checkout PR locally
gh pr checkout <PR-number>
npm install
npm run test
npm run dev

# If OK, merge on GitHub
# If issues, comment and close PR
```

**Renovate commands** (comment on PR):

```bash
@renovate rebase      # Update PR with main
@renovate retry       # Retry if failed
@renovate pause       # Pause this PR
@renovate check       # Force immediate check
```

### Dependency Dashboard

Renovate creates a GitHub Issue: "🤖 Renovate Dependency Dashboard"

Features:

- 📊 All pending updates overview
- 🔒 Security vulnerabilities detected
- ⏸️ Paused/rate-limited updates
- ❌ Failed attempts with errors

**Pin (⭐) this issue** for quick access!

### Configuration Highlights

```json
{
  "schedule": ["before 5am on monday and thursday"],
  "prConcurrentLimit": 5,
  "automerge": true,
  "packageRules": [
    // Next.js ecosystem grouped
    // Supabase grouped
    // Testing tools grouped
    // Security patches prioritized
  ]
}
```

### First-Time Setup

1. Install: https://github.com/apps/renovate
2. Select repository: `cidadao.ai-frontend`
3. Merge Onboarding PR
4. Review Dependency Dashboard
5. Let automerge handle patches
6. Manually review majors

See `RENOVATE_SETUP.md` for detailed instructions.

## Quick Start for New Developers

```bash
# 1. Clone and setup
git clone https://github.com/anderson-ufrj/cidadao.ai-frontend.git
cd cidadao.ai-frontend
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with Supabase credentials

# 3. Start development
npm run dev

# 4. Open browser
# http://localhost:3000

# 5. Run tests (separate terminal)
npm run test:ui

# 6. View components (optional)
npm run storybook
```

**First-Time Setup Notes**:

- Supabase credentials required for OAuth (Google/GitHub login)
- Backend URL defaults to production Railway deployment
- PWA disabled by default in development
- VLibras disabled by default (enable with env var)
