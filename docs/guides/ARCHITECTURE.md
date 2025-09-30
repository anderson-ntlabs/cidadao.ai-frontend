# Architecture Guide

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

The chat system implements multiple adapter patterns for robustness:

```
User Input → Smart Chat Service → Adapter Selection → API Call → Response
                    ↓
             Fallback Chain
                    ↓
             Cache Layer
```

**Adapters:**
- `v1`: Original implementation
- `v2`: Enhanced error handling
- `v3`: Retry logic optimization
- `simple`: Minimal fallback (100% success)
- `stable`: Production-ready
- `optimized`: Performance-focused

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