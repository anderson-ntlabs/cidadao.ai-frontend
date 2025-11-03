# CLAUDE.md

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Última Atualização**: 2025-10-22 14:43:27 -0300

---

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 Recent Critical Fixes

### OAuth Authentication (2025-10-22) ✅ RESOLVED

**Issue**: 15-day production blocker - OAuth (Google/GitHub) authentication not persisting sessions.

**Root Cause**: OAuth callback route handler (`app/auth/callback/route.ts`) was using `createClient()` helper designed for Server Components, which silently fails to set cookies in Route Handler context.

**Solution**: Use `createServerClient()` directly with explicit cookie handling:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// In Route Handlers, ALWAYS use createServerClient with explicit cookies
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

**Documentation**: See `/docs/oauth-authentication-fix.md` for complete technical report.

**Lesson**: Route Handlers ≠ Server Components. Check Supabase docs for your specific context.

## Documentation Standard

All new documentation files in `/docs` should include this header:

```markdown
# [Document Title]

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data de Criação**: [YYYY-MM-DD HH:MM:SS -0300]
```

Use Brazilian timezone (America/Sao_Paulo) for timestamps.

## Project Overview

Cidadão.AI Frontend is a Next.js 15 Progressive Web App (PWA) that serves as the main web interface for the Cidadão.AI government transparency platform. It features a multi-agent AI system with 17 specialized agents, each with Brazilian cultural identities, designed to democratize access to government data through conversational AI.

## Key Development Commands

```bash
# Development
npm run dev          # Start development server with Turbopack (http://localhost:3000)
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint for code quality
npm run type-check   # Run TypeScript type checking

# Storybook
npm run storybook    # Start Storybook dev server (http://localhost:6006)
npm run build-storybook  # Build static Storybook site

# Testing - Unit & E2E
npm run test              # Run Vitest unit tests in watch mode
npm run test:ui           # Run Vitest with UI interface
npm run test:coverage     # Generate coverage report (target: 91%)
npm run test:playwright   # Run all Playwright E2E tests
npm run test:playwright:ui # Run Playwright with UI mode
npm run test:e2e          # Run E2E tests only
npm run test:design-system # Run design system E2E tests

# Testing - Manual Integration Scripts
node scripts/test-backend.js        # Test backend connectivity and endpoints
node scripts/test-chat-adapters.js  # Test all chat adapter implementations
node scripts/test-vlibras.js        # Test VLibras (LIBRAS) integration
node scripts/monitor-backend.js     # Monitor backend performance over time

# Bundle Analysis
npm run analyze          # Analyze bundle size (both server & browser)
npm run analyze:server   # Analyze server bundle only
npm run analyze:browser  # Analyze browser bundle only

# Code Quality
npm run lighthouse       # Run Lighthouse CI audits
```

## High-Level Architecture

### Core Application Structure

The application uses Next.js 15 App Router with internationalization:

```
app/
├── pt/                    # Portuguese routes (default)
│   ├── (authenticated)/   # Protected routes requiring login
│   │   ├── chat/          # AI chat interface
│   │   ├── dashboard/     # Investigation dashboard
│   │   ├── home/          # User home page
│   │   ├── investigacoes/ # Detailed investigations
│   │   ├── perfil/        # User profile
│   │   ├── notificacoes/  # Notifications center
│   │   ├── configuracoes/ # Settings
│   │   └── help/          # Help page
│   ├── login/             # Authentication page
│   └── [public pages]     # About, agents, privacy, etc.
├── en/                    # English routes (mirror structure)
└── api/                   # API routes for telemetry
```

### Multi-Adapter Chat Architecture

The chat system implements multiple adapter patterns for robustness:

1. **Chat Adapters** (`lib/api/chat-adapter-*.ts`):
   - `v1`: Original implementation with streaming
   - `v2`: Enhanced with better error handling
   - `v3`: Optimized with retry logic
   - `simple`: Minimal implementation for fallback (100% Maritaca)
   - `stable`: Production-ready with circuit breakers
   - `optimized`: Performance-focused with caching

2. **Smart Chat Service** (`lib/services/smart-chat.service.ts`):
   - Automatically selects best adapter based on performance
   - Implements intelligent fallback mechanisms
   - Tracks success rates and response times
   - Provides seamless failover between adapters
   - Cost optimization with economic vs quality modes

3. **Caching Layer** (`lib/services/chat-cache.service.ts`):
   - In-memory cache with TTL (5 minutes default)
   - Response deduplication
   - Suggestion caching
   - Performance metrics tracking
   - Cache hit rate monitoring

### State Management

Uses Zustand for global state with persistence:

- **Chat Store** (`store/chat-store.ts`): Chat sessions, messages, suggestions
- **Notification Store** (`store/notification-store.ts`): Toast notifications
- Both stores implement devtools integration and localStorage persistence

### Agent System

17 specialized AI agents defined in `data/agents.ts`:

- Each agent has unique Brazilian cultural identity
- Specialized roles (orchestrator, investigator, analyst, etc.)
- Custom avatars and capabilities
- Multilingual support (PT/EN)

Key agents:

- **Abaporu**: Master orchestrator
- **Zumbi dos Palmares**: Anomaly detection
- **Anita Garibaldi**: Pattern analysis
- **Tiradentes**: Report generation

### Progressive Web App Features

**Migration Note (Jan 2025)**: Migrated from `@ducanh2912/next-pwa` to `@serwist/next` for Next.js 15 compatibility.

Configured in `next.config.mjs` with Serwist:

- Service Worker: `app/sw.ts` (manual implementation)
- Offline support with NetworkFirst caching strategy
- skipWaiting and clientsClaim enabled
- navigationPreload for faster page loads
- Disabled in development for better DX
- Manifest file for installability

**Documentation**: See `docs/10-reference/migration-guides/pwa-migration.md` (coming soon)

### Key Technical Patterns

1. **Type Safety**: Strict TypeScript with comprehensive type definitions
2. **Accessibility**: Dedicated a11y components (skip links, live regions)
3. **Internationalization**: Full i18n with Next.js routing
4. **Theming**: Dark/light mode with system preference detection
5. **Performance**: Lazy loading, code splitting, image optimization
6. **Real-time**: WebSocket support for live chat updates (infrastructure ready)
7. **Error Boundaries**: Comprehensive error handling at adapter level
8. **Glass Morphism Design**: V3 design system with glassmorphism effects (consolidated as default)

## Environment Configuration

```bash
# Backend API (Required)
NEXT_PUBLIC_API_URL=https://cidadao-api-production.up.railway.app

# Supabase Authentication (Required for OAuth)
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=           # Google Analytics tracking ID
NEXT_PUBLIC_POSTHOG_KEY=     # PostHog analytics key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Development (Optional)
NODE_ENV=development         # Environment mode
DISABLE_PWA=true             # Disable PWA in development
NEXT_PUBLIC_FEATURE_WEBSOCKET=false  # WebSocket toggle (disabled by default)

# Accessibility (Optional)
NEXT_PUBLIC_ENABLE_VLIBRAS=false  # Enable VLibras (Brazilian Sign Language) on PT pages

# Cache (Production)
# Vercel KV Redis - automatically injected by Vercel
KV_URL=                      # Vercel KV URL
KV_REST_API_URL=            # Vercel KV REST API URL
KV_REST_API_TOKEN=          # Vercel KV REST API token
KV_REST_API_READ_ONLY_TOKEN= # Vercel KV REST API read-only token
```

**Setup Instructions:**

1. Copy `.env.example` to `.env.local`
2. Fill in Supabase credentials (required for authentication)
3. Backend URL defaults to production if not specified
4. Analytics keys are optional (app works without them)
5. Never commit `.env.local` to version control

## Important Implementation Details

1. **Authentication**: Supabase Auth with OAuth (Google, GitHub) integration
   - **Critical**: Route Handlers require `createServerClient()` with explicit cookie handling
   - See `app/auth/callback/route.ts` for correct OAuth implementation pattern
2. **API Integration**: Railway production backend (https://cidadao-api-production.up.railway.app)
3. **Testing Strategy**: Dual approach - Vitest for unit tests + Playwright for E2E
   - Unit: 161 tests with 91% coverage target (Vitest + jsdom)
   - E2E: 36 Playwright tests covering critical user flows
   - Manual: Integration scripts in `/scripts` for backend connectivity
4. **Cultural Theme**: UI inspired by Tarsila do Amaral's "Operários" painting
5. **Telemetry**: Custom event tracking system with batching (`lib/telemetry/`)
6. **Design System**: V3 glass morphism design consolidated as default (Jan 2025 refactor)
7. **Route Structure**: Bilingual with locale prefixes (`/pt/*` and `/en/*`)
   - Protected routes under `(authenticated)` route group
8. **AI Models**: Supports Sabiazinho-3 (optimized) and Sabiá-3 (standard)
9. **Export Features**: Lazy-loaded PDF, JSON, CSV export for investigations
10. **Accessibility**: VLibras (LIBRAS) integration for Brazilian Sign Language support

## Component Development

Use Storybook for isolated component development:

```bash
npm run storybook
```

Key component patterns:

- Glass morphism effects with backdrop-blur
- Consistent loading states with skeletons
- Toast notifications for user feedback
- Breadcrumb navigation for context
- Interactive tour system for onboarding
- Responsive design with mobile-first approach

## Performance Considerations

- Chat responses cached for 5 minutes
- Image optimization with AVIF/WebP formats
- Gzip compression enabled
- ETags for efficient caching
- Turbopack for fast development builds
- Lazy loading for heavy components
- Debounced search inputs
- Virtual scrolling for large lists (planned)

## Deployment

### Vercel Configuration

- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Framework Preset: Next.js (auto-detected)

### Production Checklist

1. Set `NODE_ENV=production`
2. Configure `NEXT_PUBLIC_API_URL` to production backend
3. Enable PWA (remove `DISABLE_PWA`)
4. Set up Google Analytics tracking ID
5. Enable VLibras (`NEXT_PUBLIC_ENABLE_VLIBRAS=true`)
6. Test all chat adapters with production backend
7. Run accessibility audit (`npx lighthouse --only-categories=accessibility`)

## Accessibility (A11y) Features

### VLibras Integration (Brazilian Sign Language - LIBRAS)

The platform integrates VLibras, the official Brazilian government tool for translating web content into Brazilian Sign Language (LIBRAS).

**Setup:**

```bash
# 1. Package is already installed
npm install @djpfs/react-vlibras

# 2. Enable in environment
NEXT_PUBLIC_ENABLE_VLIBRAS=true

# 3. Test integration
node scripts/test-vlibras.js
```

**Components:**

- `components/a11y/vlibras-widget.tsx` - Main VLibras widget component
- `components/a11y/index.ts` - Accessibility components barrel export

**Features:**

- ✅ Automatic content translation to LIBRAS
- ✅ Avatar selection (Guga, Ícaro, Hozana)
- ✅ User preference persistence (localStorage)
- ✅ Only loads on Portuguese pages
- ✅ CSP-compliant configuration
- ✅ Programmatic control via `useVLibras()` hook

**Usage:**
The VLibrasWidget is automatically included in `app/pt/layout.tsx`. It only renders on Portuguese pages since LIBRAS is specific to Brazilian Portuguese.

```tsx
import { VLibrasWidget } from '@/components/a11y'

;<VLibrasWidget locale="pt" forceOnload />
```

**Programmatic Control:**

```tsx
import { useVLibras } from '@/components/a11y'

const { isEnabled, toggle, enable, disable } = useVLibras()
```

**Testing:**
Access http://localhost:3000/pt and look for the VLibras widget in the bottom-right corner. Click to activate LIBRAS translation.

**Detailed Documentation**: See `docs/accessibility-vlibras.md` for complete integration guide.

### Accessibility Panel (Unified Controls)

The platform includes a comprehensive accessibility panel that consolidates all a11y features in one place.

**Access:**

- FAB button in bottom-right corner (green gear icon)
- Keyboard shortcut: `Alt + A`
- Mobile responsive design

**Features:**

1. **Font Size Control**: 4 sizes (small, normal, large, xlarge)
2. **High Contrast Toggle**: Enhanced visibility mode
3. **VLibras Toggle**: Enable/disable LIBRAS translation (PT only)
4. **Keyboard Shortcuts Guide**: Built-in reference

**Keyboard Shortcuts:**

- `Alt + A`: Open/close accessibility panel
- `Alt + H`: Toggle high contrast
- `Alt + +`: Increase font size
- `Alt + -`: Decrease font size

**Components:**

```tsx
import { AccessibilityPanel } from '@/components/a11y'

;<AccessibilityPanel locale="pt" />
```

### Other Accessibility Features

- **Skip Links**: Keyboard navigation shortcuts
- **Screen Reader Support**: ARIA labels throughout
- **Form Accessibility**: Accessible form field components
- **Persistent Preferences**: All settings saved in localStorage

## Common Pitfalls & Solutions

### Supabase Client Creation

**❌ Wrong** - Using helper in Route Handlers:

```typescript
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient() // Fails to set cookies in Route Handlers
```

**✅ Correct** - Direct createServerClient in Route Handlers:

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

### Chat Adapter Selection

The chat system has multiple adapters. When implementing new features:

1. **Primary Adapter**: `lib/chat/adapters/primary.adapter.ts` - Default implementation
2. **Fallback Adapter**: `lib/chat/adapters/fallback.adapter.ts` - When primary fails
3. **Smart Router**: `lib/services/cached-smart-chat.service.ts` - Automatic failover

Always test with backend connectivity issues to ensure fallback works.

### Environment Variables

- **Client-side**: Must be prefixed with `NEXT_PUBLIC_`
- **Server-side**: No prefix needed
- **Build time**: Environment variables are embedded at build time
- **Runtime**: Use `process.env.NEXT_PUBLIC_*` for dynamic runtime values

### Testing Best Practices

1. **Unit tests** (`__tests__/unit/`): Pure logic, no DOM/network dependencies
2. **Integration tests** (`__tests__/integration/`): Component + hooks + state
3. **E2E tests** (`__tests__/e2e/`): Full user flows with Playwright
4. **Manual scripts** (`scripts/`): Backend integration verification

Never mock Supabase client in E2E tests - use real test database.

### PWA Development

- **Development**: PWA disabled by default (`DISABLE_PWA=true`)
- **Testing PWA**: Remove `DISABLE_PWA` and use production build
- **Service Worker**: `app/sw.ts` - Manual Serwist implementation
- **Manifest**: `public/manifest.json` - Updated for each major release

### Performance Optimization

1. **Dynamic imports**: Use `next/dynamic` for heavy components
2. **Image optimization**: Always use `next/image` with AVIF/WebP
3. **Bundle analysis**: Run `npm run analyze` before major releases
4. **Code splitting**: Webpack config in `next.config.mjs` handles automatic splitting

## Critical Files Reference

### Authentication Flow

- `app/auth/callback/route.ts` - OAuth callback handler (CRITICAL: uses createServerClient)
- `lib/supabase/client.ts` - Client-side Supabase client
- `lib/supabase/server.ts` - Server-side Supabase helpers
- `lib/supabase/middleware.ts` - Session refresh middleware

### Chat Implementation

- `lib/chat/chat.service.ts` - Main chat orchestrator
- `lib/chat/adapters/primary.adapter.ts` - Primary backend adapter
- `lib/services/cached-smart-chat.service.ts` - Caching + smart routing
- `store/chat-store.ts` - Zustand store for chat state

### State Management

- `store/chat-store.ts` - Chat sessions, messages, suggestions
- `store/notification-store.ts` - Toast notifications system
- `hooks/use-chat-store.ts` - Chat store hook with selectors

### Testing Infrastructure

- `vitest.config.mjs` - Vitest configuration (91% coverage target)
- `playwright.config.ts` - Playwright E2E configuration
- `vitest.setup.ts` - Global test setup (DOM, mocks)
- `__tests__/` - All test files organized by type

## Development Workflow

### Feature Development

1. **Create feature branch**: `git checkout -b feat/feature-name`
2. **Implement feature**: Follow TypeScript strict mode
3. **Write tests**: Unit tests + E2E tests for user-facing features
4. **Check quality**: Run `npm run type-check && npm run lint`
5. **Run tests**: `npm run test:coverage` (ensure >60% coverage)
6. **Test E2E**: `npm run test:playwright` for critical flows
7. **Commit**: Follow conventional commits (feat/fix/docs/refactor/test/chore)
8. **Push and create PR**: GitHub Actions runs full CI

### Pre-Production Checklist

1. ✅ All unit tests passing (`npm run test`)
2. ✅ All E2E tests passing (`npm run test:playwright`)
3. ✅ Type checking clean (`npm run type-check`)
4. ✅ Linting clean (`npm run lint`)
5. ✅ Coverage above 60% (`npm run test:coverage`)
6. ✅ Lighthouse scores acceptable (`npm run lighthouse`)
7. ✅ Bundle size acceptable (`npm run analyze`)
8. ✅ Manual testing on mobile viewport
9. ✅ Accessibility audit passed (Lighthouse accessibility score)
10. ✅ Backend integration verified (`node scripts/test-backend.js`)

### Debugging Tips

**Chat not working:**

```bash
# 1. Check backend connectivity
node scripts/test-backend.js

# 2. Check specific adapter
node scripts/test-chat-adapters.js

# 3. Check browser console for CORS/network errors
# 4. Verify environment variable NEXT_PUBLIC_API_URL
```

**Authentication issues:**

```bash
# 1. Check Supabase credentials in .env.local
# 2. Verify OAuth redirect URLs in Supabase dashboard
# 3. Clear browser cookies and localStorage
# 4. Check browser console for Supabase errors
```

**Build failures:**

```bash
# 1. Clear Next.js cache
rm -rf .next

# 2. Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# 3. Check TypeScript errors
npm run type-check

# 4. Check for circular dependencies
npm run build 2>&1 | grep -i "circular"
```

**Performance issues:**

```bash
# 1. Analyze bundle
npm run analyze

# 2. Check for unnecessary re-renders
# Use React DevTools Profiler

# 3. Check network waterfall
# Use browser DevTools Network tab

# 4. Run Lighthouse
npm run lighthouse
```

### Quick Start for New Developers

```bash
# 1. Clone and setup
git clone https://github.com/anderson-ufrj/cidadao.ai-frontend.git
cd cidadao.ai-frontend
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Start development
npm run dev

# 4. Open browser
# http://localhost:3000

# 5. Run tests (in separate terminal)
npm run test:ui

# 6. View components in Storybook (optional)
npm run storybook
```

### Project Status & Roadmap

**Current Status:** Production Ready (82% complete)

- ✅ Core infrastructure
- ✅ Authentication & authorization
- ✅ Chat system with multi-adapter failover
- ✅ Testing infrastructure (Vitest + Playwright)
- ✅ PWA capabilities
- ✅ Accessibility (WCAG AAA ready, VLibras)
- ✅ Monitoring (Sentry)
- ⏳ Deployment to production (95% ready)

**Remaining Work:**

1. Final production deployment to Vercel
2. Load testing with production traffic
3. User acceptance testing (UAT)
4. Documentation site (Docusaurus)

For more details, see `/docs/README.md` for complete documentation index.
