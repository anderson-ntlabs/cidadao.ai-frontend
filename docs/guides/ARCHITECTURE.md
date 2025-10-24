# Architecture Guide

---

**Documento**: Guia de Arquitetura
**Projeto**: Cidadão.AI - Frontend
**Autor**: Anderson Henrique da Silva
**Data**: 2025-09-30 12:49:49 -03 (Horário de Brasília)
**Localização**: Minas Gerais, Brasil
**Categoria**: Technical Guide
**Última Atualização**: 2025-10-04

---

## Overview

Cidadão.AI Frontend is built with Next.js 15 App Router, TypeScript, and Tailwind CSS. This guide explains the architectural decisions and patterns used throughout the application.

## Tech Stack

### Core Technologies

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type safety and better DX
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: Lightweight state management
- **Zod**: Schema validation
- **React Hook Form**: Form management

### Development Tools

- **Vitest**: Unit testing framework
- **Playwright**: E2E testing
- **Storybook**: Component documentation
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Lighthouse CI**: Performance budgets and monitoring

### Progressive Web App (PWA)

**PWA Framework**: Serwist (migrated from next-pwa in Jan 2025)

- **Package**: `@serwist/next@^9.2.1` + `serwist@^9.2.1`
- **Service Worker**: `app/sw.ts` (manual implementation)
- **Configuration**: `next.config.mjs`

**Migration Rationale**:
The original `@ducanh2912/next-pwa` package caused webpack build failures with Next.js 15.5.4 due to internal plugin incompatibilities. Serwist is the official successor, actively maintained by the same author, providing full Next.js 15+ compatibility with improved TypeScript support.

**Key Features**:
- Offline support with NetworkFirst caching strategy
- Service worker with skipWaiting and clientsClaim
- NavigationPreload for faster page loads
- Automatic precaching of static assets
- Disabled in development for faster iteration

**Service Worker Implementation** (`app/sw.ts`):
```typescript
import { defaultCache } from '@serwist/next/worker';
import { Serwist } from 'serwist';

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
```

**Build Configuration** (`next.config.mjs`):
```javascript
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
  reloadOnOnline: true,
  cacheOnNavigation: true,
});

export default withSerwist(nextConfig);
```

**Breaking Changes from next-pwa**:
1. **ESM-only**: No CommonJS support (requires `next.config.mjs`)
2. **Manual Service Worker**: Must create `app/sw.ts` (was auto-generated)
3. **Different Caching API**: Uses Serwist's `defaultCache` instead of next-pwa presets
4. **TypeScript First**: Better type definitions and IntelliSense

## Directory Structure

```
cidadao-ai-frontend/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   ├── [locale]/             # Internationalized routes
│   │   ├── (authenticated)/  # Protected routes
│   │   └── (public)/         # Public routes
│   └── layout.tsx            # Root layout
├── components/               # React components
│   ├── ui/                   # Reusable UI components
│   ├── chat/                 # Chat-specific components
│   ├── dashboard/            # Dashboard components
│   └── shared/               # Shared components
├── lib/                      # Utilities and services
│   ├── api/                  # API clients and adapters
│   ├── services/             # Business logic services
│   ├── hooks/                # Custom React hooks
│   └── utils/                # Utility functions
├── store/                    # Zustand stores
├── styles/                   # Global styles
│   └── design-system/        # Design tokens
├── public/                   # Static assets
└── tests/                    # Test files
```

## Core Concepts

### 1. Multi-Adapter Chat System

The chat system implements multiple adapter patterns for robustness and failover:

```
User Input → SmartChatService → Adapter Selection → Backend/SSE/Fallback → Response
                    ↓                                           ↓
             Health Checks                                 Cache Layer
                    ↓
          Automatic Failover
```

**Chat Adapters** (located in `lib/api/`):

- **`chat-adapter-backend.ts`**: Primary adapter for Railway production backend
  - Endpoint: `${API_URL}/api/v1/chat/message`
  - Features: Full chat API integration, error handling, retry logic
  - Usage: Production default for all chat requests

- **`chat-adapter-sse.ts`**: Server-Sent Events streaming adapter
  - Endpoint: `${API_URL}/api/v1/chat/stream`
  - Features: Real-time message streaming, reconnection logic, exponential backoff
  - Usage: Streaming responses for better UX (when enabled)
  - Implementation: `lib/sse/` (client, reconnect, types)

- **`chat-adapter-fallback.ts`**: Graceful degradation adapter
  - Features: Fallback responses when backend unavailable
  - Usage: Automatic failover during backend downtime

**Adapter Selection Logic** (`lib/services/smart-chat.service.ts`):
```typescript
// SmartChatService automatically selects best adapter based on:
// 1. Backend health status
// 2. Response time SLA (<2s preferred)
// 3. Error rate thresholds (<5%)
// 4. Feature flags (SSE enabled/disabled)
```

**Caching Strategy** (`lib/services/`):
- `chat-cache.service.ts`: In-memory cache with 5min TTL
- `chat-cache-idb.service.ts`: IndexedDB persistence for offline support
- `cached-smart-chat.service.ts`: Wrapper providing cache-first strategy

**Session Management** (`lib/services/chat-session.service.ts`):
- Supabase integration for chat persistence
- Session history and pagination
- Multi-device sync capabilities

**Note**: Previous adapter versions (v1, v2, v3, simple, stable, optimized) were consolidated into the current three-adapter architecture for maintainability.

### 2. Agent System Architecture

```
17 AI Agents
    ↓
Abaporu (Orchestrator)
    ↓
Specialist Agents:
- Zumbi: Anomaly Detection
- Anita: Pattern Analysis
- Tiradentes: Report Generation
- Senna: Performance Optimization
- Others: Specialized tasks
```

### 3. State Management Strategy

**Global State (Zustand):**
- User authentication
- Chat sessions
- Notifications
- UI preferences

**Local State (useState):**
- Form inputs
- UI toggles
- Component-specific data

**Server State:**
- API responses
- Cached data
- Real-time updates

### 4. Routing Architecture

```
/[locale]/
├── (authenticated)/
│   ├── dashboard/       # Main dashboard
│   ├── chat/            # Chat interface
│   └── investigacoes/   # Investigations
└── (public)/
    ├── login/           # Authentication
    ├── sobre/           # About page
    └── agentes/         # Agent showcase
```

## Design Patterns

### 1. Adapter Pattern

Used extensively in the chat system:

```tsx
interface ChatAdapter {
  sendMessage(params: ChatParams): Promise<ChatResponse>
  getSuggestions(): Promise<Suggestion[]>
}

class ChatAdapterV1 implements ChatAdapter {
  async sendMessage(params) {
    // Implementation
  }
}
```

### 2. Factory Pattern

For creating service instances:

```tsx
class ChatServiceFactory {
  static create(config: ChatConfig): ChatService {
    switch (config.mode) {
      case 'optimized':
        return new OptimizedChatService()
      case 'stable':
        return new StableChatService()
      default:
        return new SmartChatService()
    }
  }
}
```

### 3. Observer Pattern

Using Zustand subscriptions:

```tsx
// Subscribe to specific state changes
const unsubscribe = useChatStore.subscribe(
  (state) => state.messages,
  (messages) => {
    console.log('Messages updated:', messages)
  }
)
```

### 4. Strategy Pattern

For different authentication strategies:

```tsx
interface AuthStrategy {
  login(credentials: Credentials): Promise<User>
  logout(): Promise<void>
}

class MockAuthStrategy implements AuthStrategy {
  // Mock implementation
}

class OAuthStrategy implements AuthStrategy {
  // OAuth implementation
}
```

## Performance Architecture

### 1. Code Splitting

```tsx
// Route-based splitting (automatic with App Router)
// Component-based splitting
const HeavyComponent = dynamic(() => import('./heavy-component'))

// Custom chunks in next.config.js
optimization: {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      charts: {
        test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
        name: 'charts',
        priority: 10,
      },
    },
  },
}
```

### 2. Caching Strategy

**Levels:**
1. In-memory cache (5min TTL)
2. Browser cache (Service Worker)
3. CDN cache (static assets)

```tsx
class CacheService {
  private cache = new Map<string, CachedItem>()
  
  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item || item.expiresAt < Date.now()) {
      return null
    }
    return item.value
  }
}
```

### 3. Image Optimization

- Modern formats (AVIF, WebP)
- Responsive images
- Lazy loading
- Blur placeholders

### 4. Bundle Optimization

- Tree shaking
- Minification
- Compression (gzip/brotli)
- HTTP/2 push

## Security Architecture

### 1. Authentication Flow

```
Login Request → API Validation → JWT Token → Store in Memory
                                     ↓
                              Refresh Token → Secure Cookie
```

### 2. API Security

- CORS configuration
- Rate limiting
- Input sanitization
- XSS protection

### 3. Content Security Policy

```tsx
const csp = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
}
```

## Data Flow Architecture

### 1. Unidirectional Data Flow

```
User Action → Dispatch → Store Update → Component Re-render
                ↓
             Side Effects → API Call → Response → Store Update
```

### 2. API Integration

```tsx
// Centralized API client
class APIClient {
  private baseURL = process.env.NEXT_PUBLIC_API_URL
  
  async request<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    // Add auth headers
    // Handle errors
    // Parse response
  }
}
```

### 3. Real-time Updates

```tsx
// WebSocket connection (when enabled)
class WebSocketService {
  connect() {
    this.ws = new WebSocket(wsUrl)
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.updateStore(data)
    }
  }
}
```

## Testing Architecture

### 1. Testing Pyramid

```
        /\        E2E Tests (Playwright)
       /  \       Integration Tests
      /    \      Component Tests (Vitest + RTL)
     /______\     Unit Tests (Vitest)
```

### 2. Test Organization

```
tests/
├── unit/           # Pure logic tests
├── components/     # Component tests
├── integration/    # API integration tests
└── e2e/            # End-to-end tests
```

### 3. Testing Utilities

```tsx
// Custom render with providers
export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions
) {
  return render(
    <Providers>
      {ui}
    </Providers>,
    options
  )
}
```

## Deployment Architecture

### 1. Build Pipeline

```
Code Push → GitHub Actions → Build → Test → Deploy
                                ↓
                          Static Analysis
                                ↓
                          Bundle Analysis
```

### 2. Environment Strategy

- **Development**: Local development
- **Preview**: PR deployments
- **Staging**: Pre-production testing
- **Production**: Live environment

### 3. Monitoring

- Performance metrics (Web Vitals)
- Error tracking
- User analytics
- API monitoring

## Scalability Considerations

### 1. Horizontal Scaling

- Stateless application
- CDN for static assets
- Load balancer ready
- Database connection pooling

### 2. Vertical Scaling

- Optimized bundle sizes
- Efficient rendering
- Memory management
- Resource hints

### 3. Future Considerations

- Micro-frontends support
- GraphQL integration
- Service mesh compatibility
- Edge computing ready

## Best Practices

### 1. Component Design

- Single responsibility
- Props interface first
- Composition over inheritance
- Accessibility by default

### 2. State Management

- Minimal global state
- Derived state when possible
- Proper cleanup
- Avoid state duplication

### 3. Performance

- Measure before optimizing
- Use React DevTools
- Monitor bundle size
- Optimize critical path

### 4. Code Quality

- Type everything
- Write tests first
- Document complex logic
- Regular refactoring