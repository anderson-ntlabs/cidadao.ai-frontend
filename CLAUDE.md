# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

# Testing (Manual scripts in /scripts directory)
node scripts/test-chat-adapters.js  # Test all chat adapter implementations
node scripts/test-smart-chat.js     # Test smart chat service with Sabiazinho-3
node scripts/test-cache.js          # Test caching functionality
node scripts/test-backend.js        # Test backend connectivity and endpoints
node scripts/test-telemetry.js      # Test telemetry event tracking
node scripts/monitor-backend.js     # Monitor backend performance over time
node scripts/stress-test.js         # Stress test chat endpoints
node scripts/test-vlibras.js        # Test VLibras (LIBRAS) integration
```

## High-Level Architecture

### Core Application Structure

The application uses Next.js 15 App Router with internationalization:

```
app/
├── pt/                    # Portuguese routes (default)
│   ├── (authenticated)/   # Protected routes requiring login
│   │   ├── dashboard/     # Investigation dashboard
│   │   ├── chat/          # AI chat interface
│   │   └── investigacoes/ # Detailed investigations
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

Configured in `next.config.js` with next-pwa:
- Offline support with NetworkFirst caching strategy
- Service worker with skipWaiting
- 200-entry cache limit
- Automatic reload on reconnection
- Disabled in development for better DX
- Manifest file for installability

### Key Technical Patterns

1. **Type Safety**: Strict TypeScript with comprehensive type definitions
2. **Accessibility**: Dedicated a11y components (skip links, live regions)
3. **Internationalization**: Full i18n with Next.js routing
4. **Theming**: Dark/light mode with system preference detection
5. **Performance**: Lazy loading, code splitting, image optimization
6. **Real-time**: WebSocket support for live chat updates (infrastructure ready)
7. **Error Boundaries**: Comprehensive error handling at adapter level
8. **Feature Flags**: Runtime toggles via environment variables

## Environment Configuration

```bash
# Required
NEXT_PUBLIC_API_URL=https://cidadao-api-production.up.railway.app

# Optional
NEXT_PUBLIC_GA_ID=           # Google Analytics tracking
NEXT_PUBLIC_FEATURE_WEBSOCKET=false  # WebSocket toggle (disabled by default)
DISABLE_PWA=true             # Disable PWA in development
NODE_ENV=development         # Environment mode

# Accessibility
NEXT_PUBLIC_ENABLE_VLIBRAS=true  # Enable VLibras (Brazilian Sign Language) on PT pages
```

## Important Implementation Details

1. **Authentication**: Supabase Auth with OAuth (Google, GitHub) integration
2. **API Integration**: Railway production backend, configurable via env
3. **No Test Framework**: Project uses manual integration scripts instead of Jest/Vitest
4. **Cultural Theme**: UI inspired by Tarsila do Amaral's "Operários" painting
5. **Telemetry**: Custom event tracking system with batching (`lib/telemetry/`)
6. **AI Models**: Supports Sabiazinho-3 (optimized) and Sabiá-3 (standard)
7. **Export Features**: PDF, JSON, CSV export for investigations
8. **Accessibility**: VLibras (LIBRAS) integration for Brazilian Sign Language support

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
6. Review feature flags
7. Test all chat adapters with production backend
8. Run accessibility audit (`npx lighthouse --only-categories=accessibility`)

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

<VLibrasWidget locale="pt" forceOnload />
```

**Programmatic Control:**
```tsx
import { useVLibras } from '@/components/a11y'

const { isEnabled, toggle, enable, disable } = useVLibras()
```

**Testing:**
Access http://localhost:3000/pt and look for the VLibras widget in the bottom-right corner. Click to activate LIBRAS translation.

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

<AccessibilityPanel locale="pt" />
```

### Other Accessibility Features
- **Skip Links**: Keyboard navigation shortcuts
- **Screen Reader Support**: ARIA labels throughout
- **Form Accessibility**: Accessible form field components
- **Persistent Preferences**: All settings saved in localStorage