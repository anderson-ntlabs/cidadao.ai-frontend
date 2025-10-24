# API Integration Guide

**Author**: Anderson Henrique da Silva
**Location**: Minas Gerais, Brasil
**Created**: 2025-01-25
**Last Updated**: 2025-01-25

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Clients](#api-clients)
4. [Service Layer](#service-layer)
5. [Type Safety](#type-safety)
6. [Error Handling](#error-handling)
7. [Authentication](#authentication)
8. [Caching Strategies](#caching-strategies)
9. [Streaming & Real-time](#streaming--real-time)
10. [Testing API Integration](#testing-api-integration)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

---

## Overview

The Cidadão.AI frontend uses a layered architecture for API integration, separating concerns between HTTP clients, service abstractions, and type-safe contracts. This guide covers all aspects of integrating with the Railway backend API.

### Key Principles

1. **Type Safety**: All API contracts are strictly typed using TypeScript interfaces
2. **Error Resilience**: Comprehensive error handling with automatic retry and fallback
3. **Smart Routing**: Intelligent endpoint selection based on performance and availability
4. **Caching**: Multi-layer caching (memory, localStorage, IndexedDB) for performance
5. **Streaming Support**: Real-time updates via SSE (Server-Sent Events)
6. **Authentication**: Automatic token management with refresh logic

### Technology Stack

- **HTTP Client**: Axios 1.7.9 with interceptors
- **Backend**: Railway (https://cidadao-api-production.up.railway.app)
- **Streaming**: Server-Sent Events (SSE)
- **Caching**: IndexedDB via idb-keyval
- **Type Safety**: TypeScript 5.x with strict mode

---

## Architecture

### Layer Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Components / Pages                        │
│                  (React Components)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ uses
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
│  (smart-chat.service, investigation.service, etc.)           │
│                                                              │
│  • Business logic                                            │
│  • Adapter selection                                         │
│  • Caching coordination                                      │
│  • Error recovery                                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ uses
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Adapter Layer                             │
│  (chat-adapter-sse, chat-adapter-backend, etc.)              │
│                                                              │
│  • Protocol-specific implementations                         │
│  • SSE streaming, HTTP polling                               │
│  • Fallback logic                                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ uses
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    HTTP Client Layer                         │
│         (client.ts, authenticated-client.ts)                 │
│                                                              │
│  • Axios configuration                                       │
│  • Request/response interceptors                             │
│  • Authentication headers                                    │
│  • Timeout handling                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Railway Backend API                        │
│        https://cidadao-api-production.up.railway.app         │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Simple Request (GET /api/v1/agents)**:
```
Component → Service → HTTP Client → Backend → Response
```

**Complex Chat Request (POST /api/v1/chat/stream)**:
```
Component → ChatService → SmartChatService → Adapter Selection
                                            ↓
                                    SSE Adapter (primary)
                                            ↓
                                    HTTP Client + SSE
                                            ↓
                                    Backend Streaming
                                            ↓
                                    Progressive Updates
                                            ↓
                                    Component (real-time UI)
```

**Cached Request**:
```
Component → Service → Cache Check (hit) → Return cached data
                   ↓
            Cache Check (miss) → HTTP Client → Backend → Cache + Return
```

---

## API Clients

### 1. Base API Client (`lib/api/client.ts`)

The foundational HTTP client for all non-authenticated requests.

#### Configuration

```typescript
// lib/api/client.ts
import axios, { AxiosInstance } from 'axios';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://cidadao-api-production.up.railway.app';

const API_TIMEOUT = 30000; // 30 seconds

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Important for CORS
});
```

#### Request Interceptor

Automatically adds authentication tokens and API keys to all requests:

```typescript
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('access_token')
      : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add API key if configured
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    if (apiKey) {
      config.headers['X-API-Key'] = apiKey;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
```

#### Response Interceptor

Handles errors and automatic token refresh:

```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      // Try to refresh token if not already retrying
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const { authService } = await import('./auth.service');
          await authService.refreshToken();

          // Retry original request with new token
          const newToken = localStorage.getItem('access_token');
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient.request(originalRequest);
          }
        } catch (refreshError) {
          // Clear auth data on refresh failure
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
      }
    }

    // Format error for consistent handling
    return Promise.reject({
      message: error.response?.data?.message || 'An unexpected error occurred',
      status: error.response?.status,
      code: error.response?.data?.code,
      response: error.response,
      originalError: error,
    });
  }
);
```

#### Convenience Methods

```typescript
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'GET', url }),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'POST', url, data }),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PUT', url, data }),

  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'DELETE', url }),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PATCH', url, data }),
};
```

#### Usage Example

```typescript
import { api } from '@/lib/api/client';

// GET request
const { data, error } = await api.get<Agent[]>('/api/v1/agents');
if (error) {
  console.error('Failed to fetch agents:', error.message);
} else {
  console.log('Agents:', data);
}

// POST request
const { data, error } = await api.post('/api/v1/chat/message', {
  message: 'Analyze government spending',
  session_id: 'session_123',
});
```

### 2. Authenticated API Client (`lib/api/authenticated-client.ts`)

Specialized client for Supabase-authenticated requests.

#### Key Features

- **Automatic Supabase token injection**: Uses `authIntegrationService` to get current session token
- **Session refresh handling**: Automatically detects 401 errors and triggers session refresh
- **Type-safe responses**: Returns `ApiResponse<T>` with success/error states

#### Configuration

```typescript
// lib/api/authenticated-client.ts
import axios, { AxiosInstance } from 'axios';
import { authIntegrationService } from './auth-integration.service';

class AuthenticatedApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });

    // Request interceptor to add auth headers
    this.client.interceptors.request.use(
      async (config) => {
        const headers = await authIntegrationService.getAuthHeaders();
        Object.entries(headers).forEach(([key, value]) => {
          config.headers.set(key, value);
        });
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          console.log('Authentication error, attempting to refresh session...');
          // Supabase client handles refresh automatically
        }
        return Promise.reject(error);
      }
    );
  }
}
```

#### Usage Example

```typescript
import { authenticatedApi } from '@/lib/api/authenticated-client';

// GET with authentication
const response = await authenticatedApi.get<UserProfile>('/api/v1/users/me');

if (response.success && response.data) {
  console.log('User profile:', response.data);
} else {
  console.error('Error:', response.error?.message);
}

// POST with authentication
const response = await authenticatedApi.post('/api/v1/investigations', {
  title: 'Contract Analysis',
  description: 'Analyzing suspicious contracts',
});
```

### 3. WebSocket URL Helper

For WebSocket connections (future implementation):

```typescript
// lib/api/client.ts
export const WS_BASE_URL = API_BASE_URL
  .replace('https://', 'wss://')
  .replace('http://', 'ws://');

// Usage
const ws = new WebSocket(`${WS_BASE_URL}/api/v1/chat/ws`);
```

---

## Service Layer

### 1. Smart Chat Service (`lib/services/smart-chat.service.ts`)

Intelligent chat service with automatic adapter selection and fallback.

#### Architecture

The `SmartChatService` manages multiple chat adapters and intelligently routes requests based on:
- **Message complexity** (simple, moderate, complex)
- **Model preference** (economic, quality, stable, auto)
- **Endpoint availability** (automatic fallback)
- **Streaming support** (SSE vs HTTP)

#### Endpoints Configuration

```typescript
export class SmartChatService {
  private endpoints: ChatEndpoint[] = [
    {
      url: '/api/v1/chat/stream',
      name: 'SSE Streaming (Primary)',
      adapter: sendSSEMessage,
      model: 'sabiazinho-3',
      costLevel: 1,
      priority: 1,
    },
    {
      url: '/api/v1/chat/message',
      name: 'Backend Message',
      adapter: sendBackendMessage,
      model: 'sabiazinho-3',
      costLevel: 1,
      priority: 2,
    },
    {
      url: '/api/v1/chat/fallback',
      name: 'Multi-Endpoint Fallback',
      adapter: sendFallbackMessage,
      model: 'sabiazinho-3',
      costLevel: 1,
      priority: 3,
    },
    {
      url: '/api/investigate',
      name: 'Local Investigation',
      adapter: sendChatAsInvestigation,
      model: 'local',
      costLevel: 0,
      priority: 4,
    },
  ];
}
```

#### Message Complexity Analysis

```typescript
analyzeComplexity(message: string): 'simple' | 'moderate' | 'complex' {
  const complexKeywords = [
    'analise', 'investigue', 'compare', 'tendência',
    'padrão', 'anomalia', 'detalhe', 'relatório',
    'histórico', 'evolução', 'correlação', 'estatística'
  ];

  const moderateKeywords = [
    'explique', 'como funciona', 'o que é', 'por que',
    'quando', 'onde', 'quem', 'liste', 'mostre'
  ];

  const lowerMessage = message.toLowerCase();

  // Check message length
  if (message.length > 200) return 'complex';
  if (message.length < 20) return 'simple';

  // Check keywords
  if (complexKeywords.some(kw => lowerMessage.includes(kw))) {
    return 'complex';
  }

  if (moderateKeywords.some(kw => lowerMessage.includes(kw))) {
    return 'moderate';
  }

  return 'simple';
}
```

#### Endpoint Selection Strategy

```typescript
private selectEndpoints(
  message: string,
  options: SmartChatOptions
): ChatEndpoint[] {
  let endpoints = [...this.endpoints];

  if (options.preferredModel === 'economic') {
    // Sort by cost (cheapest first)
    endpoints.sort((a, b) => a.costLevel - b.costLevel);
  } else if (options.preferredModel === 'quality') {
    // Sort by cost (most expensive = highest quality)
    endpoints.sort((a, b) => b.costLevel - a.costLevel);
  } else if (options.preferredModel === 'stable') {
    // Prioritize stable endpoint
    endpoints.sort((a, b) =>
      a.url.includes('stable') ? -1 : b.url.includes('stable') ? 1 : 0
    );
  } else {
    // Default: use priority field
    endpoints.sort((a, b) => a.priority - b.priority);
  }

  return endpoints;
}
```

#### Usage Examples

**Basic Message (Auto Mode)**:

```typescript
import { smartChatService } from '@/lib/services/smart-chat.service';

const response = await smartChatService.sendMessage(
  'Olá, como funciona a transparência pública?'
);

console.log('Agent:', response.agent_name);
console.log('Response:', response.message);
console.log('Confidence:', response.confidence);
```

**Streaming Mode with SSE**:

```typescript
const response = await smartChatService.sendMessage(
  'Analise os contratos do governo federal',
  {
    streaming: true,
    onChunk: (text) => {
      // Update UI with each chunk
      console.log('Chunk received:', text);
    },
    onProgress: (accumulated) => {
      // Update UI with accumulated text
      setPartialResponse(accumulated);
    },
  }
);
```

**Economic Mode (Cheapest Model)**:

```typescript
const response = await smartChatService.sendMessage(
  'O que é Portal da Transparência?',
  {
    preferredModel: 'economic',
    useDrummond: false, // Skip formatting for lower cost
  }
);
```

**Quality Mode (Best Model)**:

```typescript
const response = await smartChatService.sendMessage(
  'Realize uma análise profunda de anomalias em contratos',
  {
    preferredModel: 'quality',
    timeout: 60000, // Allow more time for complex analysis
  }
);
```

**With Cache Integration**:

```typescript
// Cache is automatically checked before making API calls
const response = await smartChatService.sendMessage(
  'Quem são os agentes?'
);
// If this exact message was sent before (within TTL),
// returns cached response instantly
```

### 2. Investigation Service (`lib/services/investigation.service.ts`)

Manages investigation CRUD operations with Supabase backend.

#### Architecture

Uses Supabase client directly for database operations with Row Level Security (RLS) enforced.

```typescript
export class InvestigationService {
  private supabase = createClient()

  async createInvestigation(data: {
    title: string
    description?: string
    agents_used?: string[]
    metadata?: Record<string, any>
  }): Promise<Investigation | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: investigation, error } = await this.supabase
      .from('investigations')
      .insert({
        user_id: user.id,
        title: data.title,
        description: data.description,
        agents_used: data.agents_used || [],
        metadata: data.metadata || {},
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating investigation:', error)
      return null
    }

    return investigation
  }
}
```

#### Usage Examples

**Create Investigation**:

```typescript
import { investigationService } from '@/lib/services/investigation.service';

const investigation = await investigationService.createInvestigation({
  title: 'Análise de Contratos 2024',
  description: 'Investigação de contratos suspeitos',
  agents_used: ['zumbi', 'anita'],
  metadata: {
    priority: 'high',
    category: 'contracts',
  },
});

if (investigation) {
  console.log('Investigation created:', investigation.id);
}
```

**Get User Investigations**:

```typescript
// Get all active investigations
const activeInvestigations = await investigationService.getUserInvestigations('active');

// Get all investigations (any status)
const allInvestigations = await investigationService.getUserInvestigations();

console.log(`Found ${activeInvestigations.length} active investigations`);
```

**Update Investigation**:

```typescript
const updated = await investigationService.updateInvestigation(
  'investigation_id_123',
  {
    status: 'completed',
    metadata: {
      findings: 15,
      anomalies: 3,
    },
  }
);
```

**Archive Investigation**:

```typescript
await investigationService.archiveInvestigation('investigation_id_123');
```

### 3. Transparency Map Service (`lib/services/transparency-map.service.ts`)

Fetches and caches transparency API coverage map from Railway backend.

#### Key Features

- **Backend normalization**: Transforms Railway v2 structure to frontend-friendly format
- **6-hour cache**: Reduces backend load with localStorage caching
- **Stale-while-revalidate**: Returns cached data even if expired
- **65-second timeout**: Handles Railway cold starts gracefully

#### Data Structures

**Backend Response**:
```typescript
interface BackendTransparencyMapData {
  last_update: string;
  summary: {
    total_states: number;
    states_with_apis: number;
    states_working: number;
    overall_coverage_percentage: number;
    total_apis: number;
    total_endpoints: number;
  };
  states: Record<string, {
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    apis: Array<{
      name: string;
      url: string;
      endpoints: number;
      status: 'operational' | 'partial' | 'down' | 'timeout' | 'error';
      response_time_ms?: number | null;
      error?: string | null;
    }>;
  }>;
  cache_info: {
    cached: boolean;
    last_update: string;
    age_minutes: number;
  };
}
```

**Frontend-Normalized Response**:
```typescript
interface TransparencyMapData {
  last_update: string;
  cache_info: BackendCacheInfo;
  states: Record<string, StateData>;
  summary: SummaryStats;
}

interface StateData {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'no_api';
  apis: APIDetail[];
  apiCount: number;
  endpointCount: number;
  color: string;
}
```

#### Usage Example

```typescript
import {
  fetchTransparencyMap,
  getCachedMapData,
  isCacheFresh,
  getStateColor,
} from '@/lib/services/transparency-map.service';

// Fetch map (with automatic cache)
try {
  const mapData = await fetchTransparencyMap();

  console.log('Total states with APIs:', mapData.summary.states_with_apis);
  console.log('Coverage:', mapData.summary.overall_coverage_percentage);

  // Iterate states
  Object.entries(mapData.states).forEach(([code, state]) => {
    console.log(`${code}: ${state.name} - ${state.apiCount} APIs`);
  });
} catch (error) {
  // Fallback to cached data
  const cached = getCachedMapData();
  if (cached) {
    console.warn('Using stale cache due to error');
  }
}

// Check cache freshness
if (!isCacheFresh()) {
  console.log('Cache is stale, fetching new data...');
  await fetchTransparencyMap();
}

// Use helper functions
const healthyColor = getStateColor('healthy'); // #22c55e
```

### 4. Chat Cache Service (`lib/services/chat-cache-idb.service.ts`)

IndexedDB-based caching for chat responses.

#### Features

- **IndexedDB storage**: Persistent across sessions
- **TTL expiration**: Default 5 minutes
- **Type-safe**: Generic `get<T>()` and `set<T>()`
- **Singleton pattern**: Single instance via `getChatCacheIDB()`

#### Usage Example

```typescript
import { getChatCacheIDB } from '@/lib/services/chat-cache-idb.service';

const cache = await getChatCacheIDB();

// Set cache
await cache.set('user_query', chatResponse, 300); // 5min TTL

// Get cache
const cached = await cache.get<ChatResponse>('user_query');
if (cached) {
  console.log('Cache hit!');
}

// Clear cache
await cache.clear();
```

---

## Type Safety

### API Response Types

All API responses are typed using TypeScript interfaces in `/types/chat.ts`.

#### Core Types

```typescript
export interface ChatRequest {
  message: string;
  session_id?: string;
  context?: Record<string, any>;
}

export interface ChatResponse {
  session_id: string;
  message_id?: string;
  agent_id: string;
  agent_name: string;
  message: string;
  confidence: number;
  suggested_actions?: string[];
  follow_up_questions?: string[];
  requires_input?: Record<string, string> | null;
  metadata: Record<string, any>;
}

export interface BackendChatMessageResponse {
  response?: string;
  message?: string;
  session_id: string;
  message_id: string;
  agent_used?: string;
  agent_id?: string;
  agent_name?: string;
  processing_time?: number;
  confidence?: number;
  suggestions?: string[];
  suggested_actions?: string[];
  follow_up_questions?: string[];
  requires_input?: Record<string, string> | null;
  metadata?: Record<string, any>;
}
```

#### Investigation Types

```typescript
export interface Investigation {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  agents_involved: string[];
  findings_count: number;
  anomalies_count: number;
  confidence_score: number;
}
```

#### Generic API Response Wrapper

```typescript
export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

export interface ApiError {
  message: string;
  detail?: string | { msg: string; type: string }[];
  code?: string;
  status?: number;
}
```

### Type Guards

Use type guards for runtime type checking:

```typescript
function isChatResponse(obj: any): obj is ChatResponse {
  return (
    typeof obj === 'object' &&
    'session_id' in obj &&
    'agent_id' in obj &&
    'message' in obj
  );
}

// Usage
const response = await api.post('/api/v1/chat/message', request);
if (response.success && isChatResponse(response.data)) {
  // TypeScript knows response.data is ChatResponse
  console.log(response.data.agent_name);
}
```

---

## Error Handling

### Error Hierarchy

```
Error
├── NetworkError (ECONNABORTED, Network Error)
├── TimeoutError (Request timeout)
├── AuthenticationError (401)
├── AuthorizationError (403)
├── NotFoundError (404)
├── ValidationError (422)
└── ServerError (500, 502, 503)
```

### Client-Level Error Handling

The base API client handles errors at the interceptor level:

```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      // Authentication errors
      if (status === 401) {
        // Try token refresh (see code above)
      }

      // Format error message
      const errorMessage = data?.detail
        ? (typeof data.detail === 'string' ? data.detail : data.detail[0]?.msg)
        : data?.message || 'An unexpected error occurred';

      return Promise.reject({
        message: errorMessage,
        status,
        code: data?.code,
        response: error.response,
        originalError: error,
      });
    }

    // Network errors
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: 'Request timed out. Please try again.',
        code: 'TIMEOUT',
      });
    }

    if (!error.response && error.message === 'Network Error') {
      return Promise.reject({
        message: 'Unable to connect to the server. Please check your connection.',
        code: 'NETWORK_ERROR',
      });
    }

    return Promise.reject({
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      originalError: error,
    });
  }
);
```

### Service-Level Error Handling

Services add business logic error handling:

```typescript
async sendMessage(message: string, options: SmartChatOptions = {}): Promise<ChatResponse> {
  // Try each endpoint in order
  for (const endpoint of selectedEndpoints) {
    try {
      const response = await this.tryEndpoint(endpoint, request, options.timeout);
      this.logSuccess(endpoint, response, duration);
      return response;
    } catch (error) {
      logger.warn(`${endpoint.name} failed`, { error });
      lastError = error as Error;
      continue; // Try next endpoint
    }
  }

  // All endpoints failed - use local fallback
  logger.error('All endpoints failed, using local fallback', {
    lastError: lastError?.message
  });

  return this.createFallbackResponse(request, lastError);
}
```

### Component-Level Error Handling

Components handle user-facing errors:

```typescript
// In React component
const handleSendMessage = async () => {
  try {
    const response = await smartChatService.sendMessage(message, {
      streaming: true,
      onChunk: handleChunk,
    });

    setMessages(prev => [...prev, response]);
  } catch (error) {
    toast.error('Erro ao enviar mensagem', {
      description: error instanceof Error
        ? error.message
        : 'Ocorreu um erro inesperado',
    });

    // Log to telemetry
    chatTelemetry.track({
      type: 'message_error',
      timestamp: Date.now(),
      data: { error: error.message },
    });
  }
};
```

### Error Recovery Strategies

**1. Automatic Retry with Exponential Backoff**:

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const delay = baseDelay * Math.pow(2, i);
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
const response = await retryWithBackoff(
  () => api.post('/api/v1/chat/message', request),
  3,
  1000
);
```

**2. Circuit Breaker Pattern**:

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime: number | null = null;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private maxFailures: number = 5,
    private resetTimeout: number = 60000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime! > this.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.maxFailures) {
      this.state = 'open';
    }
  }
}

// Usage
const breaker = new CircuitBreaker(5, 60000);
const response = await breaker.execute(() =>
  api.post('/api/v1/chat/message', request)
);
```

**3. Graceful Degradation**:

```typescript
async function fetchWithFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  cache?: () => T | null
): Promise<T> {
  // Try cache first
  if (cache) {
    const cached = cache();
    if (cached) return cached;
  }

  // Try primary endpoint
  try {
    return await primary();
  } catch (primaryError) {
    console.warn('Primary endpoint failed, trying fallback');

    // Try fallback endpoint
    try {
      return await fallback();
    } catch (fallbackError) {
      // Both failed, return cached data if available
      if (cache) {
        const staleCache = cache();
        if (staleCache) {
          console.warn('Using stale cache');
          return staleCache;
        }
      }

      throw fallbackError;
    }
  }
}
```

---

## Authentication

### Authentication Flow

```
1. User initiates OAuth login (Google/GitHub)
       ↓
2. Supabase Auth handles OAuth callback
       ↓
3. Session created with access_token + refresh_token
       ↓
4. Frontend stores session in localStorage
       ↓
5. API client automatically adds Authorization header
       ↓
6. Backend validates JWT token
       ↓
7. On 401 error, client refreshes token automatically
       ↓
8. Retry original request with new token
```

### Auth Integration Service (`lib/api/auth-integration.service.ts`)

Bridges Supabase Auth with API clients:

```typescript
class AuthIntegrationService {
  private supabase = createClient()

  async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await this.supabase.auth.getSession()

    if (session?.access_token) {
      return {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      }
    }

    return {
      'Content-Type': 'application/json',
    }
  }

  async getUserId(): Promise<string | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    return user?.id || null
  }

  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await this.supabase.auth.getSession()
    return !!session
  }

  async refreshSession(): Promise<boolean> {
    const { error } = await this.supabase.auth.refreshSession()
    return !error
  }
}
```

### Token Refresh Logic

Automatic token refresh on 401 errors:

```typescript
// In apiClient.interceptors.response
if (error.response?.status === 401) {
  const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

  if (!originalRequest._retry) {
    originalRequest._retry = true;

    try {
      const { authService } = await import('./auth.service');
      await authService.refreshToken();

      const newToken = localStorage.getItem('access_token');
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient.request(originalRequest);
      }
    } catch (refreshError) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }
}
```

### Protected Route Usage

```typescript
// In protected page
'use client'

import { useAuth } from '@/hooks/use-supabase-auth';
import { investigationService } from '@/lib/services/investigation.service';

export default function InvestigationsPage() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/pt/login');
    }
  }, [user, isLoading]);

  const fetchInvestigations = async () => {
    // investigationService automatically uses authenticated Supabase client
    const investigations = await investigationService.getUserInvestigations();
    setInvestigations(investigations);
  };

  // ...
}
```

---

## Caching Strategies

### Three-Layer Caching

```
┌─────────────────────────────────────────────────────────────┐
│                   Component Request                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Layer 1: Memory Cache (Instant)                 │
│  • In-memory Map/Object                                      │
│  • No serialization overhead                                 │
│  • Lost on page refresh                                      │
│  • TTL: 1-5 minutes                                          │
└────────────────────────┬────────────────────────────────────┘
                         │ miss
                         ▼
┌─────────────────────────────────────────────────────────────┐
│        Layer 2: localStorage Cache (Fast)                    │
│  • JSON serialization                                        │
│  • Persists across refreshes                                │
│  • ~5MB limit                                                │
│  • TTL: 5-30 minutes                                         │
└────────────────────────┬────────────────────────────────────┘
                         │ miss
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         Layer 3: IndexedDB Cache (Persistent)                │
│  • Structured storage                                        │
│  • Large capacity (~50MB+)                                   │
│  • Persists indefinitely                                     │
│  • TTL: 1-6 hours                                            │
└────────────────────────┬────────────────────────────────────┘
                         │ miss
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Network Request (Backend)                   │
│  • Fetch from Railway API                                    │
│  • Populate all cache layers                                │
└─────────────────────────────────────────────────────────────┘
```

### Cache Implementation Examples

**1. Memory Cache (Chat Responses)**:

```typescript
// lib/services/chat-cache.service.ts
class ChatCacheService {
  private cache = new Map<string, { data: ChatResponse; expiresAt: number }>();
  private TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: ChatResponse): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.TTL,
    });
  }

  get(key: string): ChatResponse | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }
}
```

**2. localStorage Cache (Transparency Map)**:

```typescript
// lib/services/transparency-map.service.ts
const CACHE_KEY = 'transparencyMapCache';
const CACHE_EXPIRY_MS = 6 * 60 * 60 * 1000; // 6 hours

export async function fetchTransparencyMap(): Promise<TransparencyMapData> {
  const url = `${API_BASE_URL}/api/v1/transparency/coverage/map`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(65000) });
    const backendData: BackendTransparencyMapData = await response.json();
    const normalizedData = normalizeBackendData(backendData);

    // Cache in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: normalizedData,
        timestamp: Date.now()
      }));
    }

    return normalizedData;
  } catch (error) {
    // Fallback to cache
    const cachedData = getCachedMapData();
    if (cachedData) {
      console.warn('Using cached transparency map data');
      return cachedData;
    }
    throw error;
  }
}

export function getCachedMapData(): TransparencyMapData | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    // Return even if expired (stale-while-revalidate)
    if (age < CACHE_EXPIRY_MS) {
      return data;
    }

    console.warn('Cache is stale but returning anyway');
    return data;
  } catch (error) {
    console.error('Error reading cached map data:', error);
    return null;
  }
}
```

**3. IndexedDB Cache (Chat History)**:

```typescript
// lib/services/chat-cache-idb.service.ts
import { get, set, del, clear } from 'idb-keyval';

class ChatCacheIDB {
  private TTL: number;

  constructor(ttlSeconds: number = 300) {
    this.TTL = ttlSeconds * 1000;
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const entry = await get(key);

      if (!entry) return null;

      const { data, expiresAt } = entry;

      if (Date.now() > expiresAt) {
        await del(key);
        return null;
      }

      return data as T;
    } catch (error) {
      console.error('IDB get error:', error);
      return null;
    }
  }

  async set<T = any>(key: string, data: T, ttlSeconds?: number): Promise<void> {
    try {
      const ttl = ttlSeconds ? ttlSeconds * 1000 : this.TTL;
      await set(key, {
        data,
        expiresAt: Date.now() + ttl,
      });
    } catch (error) {
      console.error('IDB set error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      await clear();
    } catch (error) {
      console.error('IDB clear error:', error);
    }
  }
}

// Singleton instance
let cacheInstance: ChatCacheIDB | null = null;

export async function getChatCacheIDB(): Promise<ChatCacheIDB> {
  if (!cacheInstance) {
    cacheInstance = new ChatCacheIDB(300); // 5min TTL
  }
  return cacheInstance;
}
```

### Cache Invalidation Strategies

**1. TTL-Based Expiration**:

```typescript
// Automatic expiration based on timestamp
const isExpired = Date.now() > entry.expiresAt;
if (isExpired) {
  cache.delete(key);
  return null;
}
```

**2. Event-Based Invalidation**:

```typescript
// Invalidate cache when data changes
const handleInvestigationUpdate = async (id: string) => {
  await investigationService.updateInvestigation(id, updates);

  // Invalidate related caches
  cache.delete(`investigation:${id}`);
  cache.delete('investigations:list');

  // Optionally refetch
  await fetchInvestigations();
};
```

**3. Stale-While-Revalidate**:

```typescript
async function fetchWithSWR<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key);

  if (cached && !isExpired(cached)) {
    // Return fresh cache
    return cached.data;
  }

  if (cached && isExpired(cached)) {
    // Return stale data immediately
    const staleData = cached.data;

    // Revalidate in background
    fetcher().then(fresh => {
      cache.set(key, fresh);
    });

    return staleData;
  }

  // No cache, fetch fresh
  const fresh = await fetcher();
  cache.set(key, fresh);
  return fresh;
}
```

### Cache Best Practices

1. **Choose the Right Layer**:
   - Memory: Frequently accessed, small data (agent info, UI state)
   - localStorage: Medium-sized, session-persistent (user preferences)
   - IndexedDB: Large data, long-term storage (chat history, investigations)

2. **Set Appropriate TTLs**:
   - Static data (agents): 1 hour+
   - Dynamic data (chat): 5 minutes
   - Real-time data (notifications): No cache or very short (30s)

3. **Handle Cache Errors Gracefully**:
   ```typescript
   try {
     const cached = await cache.get(key);
     if (cached) return cached;
   } catch (error) {
     console.warn('Cache error, fetching fresh:', error);
     // Continue to network request
   }
   ```

4. **Implement Cache Warming**:
   ```typescript
   // Prefetch critical data on app init
   useEffect(() => {
     Promise.all([
       smartChatService.sendMessage('warm cache'),
       fetchTransparencyMap(),
     ]);
   }, []);
   ```

---

## Streaming & Real-time

### SSE (Server-Sent Events) Implementation

SSE provides one-way real-time communication from server to client, ideal for chat streaming.

#### Architecture

```
┌──────────────┐                    ┌──────────────┐
│   Frontend   │                    │   Backend    │
│              │                    │  (Railway)   │
└──────┬───────┘                    └──────┬───────┘
       │                                   │
       │  POST /api/v1/chat/stream         │
       │ ────────────────────────────────> │
       │                                   │
       │  HTTP 200 OK                      │
       │  Content-Type: text/event-stream  │
       │ <──────────────────────────────── │
       │                                   │
       │  event: start                     │
       │  data: {"status": "detecting"}    │
       │ <──────────────────────────────── │
       │                                   │
       │  event: chunk                     │
       │  data: {"text": "Analisando..."}  │
       │ <──────────────────────────────── │
       │                                   │
       │  event: chunk                     │
       │  data: {"text": " contratos"}     │
       │ <──────────────────────────────── │
       │                                   │
       │  event: complete                  │
       │  data: {full_response}            │
       │ <──────────────────────────────── │
       │                                   │
       │  [Connection closed]              │
```

#### SSE Adapter (`lib/api/chat-adapter-sse.ts`)

```typescript
export interface SSEMessageOptions {
  onChunk?: (text: string) => void;
  onProgress?: (accumulated: string) => void;
  onConnectionStatus?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
}

export async function sendSSEMessage(
  request: ChatRequest,
  options: SSEMessageOptions = {}
): Promise<ChatResponse> {
  const startTime = Date.now();
  const sessionId = request.session_id || `session_${Date.now()}`;

  return new Promise((resolve, reject) => {
    let accumulatedText = '';

    const sse = new ChatSSE(
      {
        sessionId,
        endpoint: '/api/v1/chat/stream',
        reconnect: true,
        maxReconnectAttempts: 3,
      },
      {
        onMessage: (chunk: string) => {
          accumulatedText += chunk;
          options.onChunk?.(chunk);
          options.onProgress?.(accumulatedText);
        },

        onComplete: (response: ChatResponse) => {
          const duration = Date.now() - startTime;

          const enhancedResponse: ChatResponse = {
            ...response,
            metadata: {
              ...response.metadata,
              streaming: true,
              transport: 'sse',
              duration,
              chunks: accumulatedText.length,
            },
          };

          resolve(enhancedResponse);
        },

        onError: (error: Error) => {
          reject(error);
        },

        onConnectionStatus: (status) => {
          options.onConnectionStatus?.(status);
        },
      }
    );

    sse.sendMessage(request.message, request.context).catch(reject);
  });
}
```

#### React Component Usage

```typescript
'use client'

import { useState } from 'react';
import { smartChatService } from '@/lib/services/smart-chat.service';

export function ChatInterface() {
  const [message, setMessage] = useState('');
  const [streaming, setStreaming] = useState('');
  const [complete, setComplete] = useState('');

  const handleSendMessage = async () => {
    setStreaming('');
    setComplete('');

    try {
      const response = await smartChatService.sendMessage(message, {
        streaming: true,
        onChunk: (chunk) => {
          // Real-time chunk updates
          console.log('Chunk:', chunk);
        },
        onProgress: (accumulated) => {
          // Update UI with accumulated text
          setStreaming(accumulated);
        },
      });

      // Final complete response
      setComplete(response.message);
      setStreaming('');
    } catch (error) {
      console.error('Streaming error:', error);
    }
  };

  return (
    <div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSendMessage}>Send</button>

      {streaming && (
        <div className="animate-pulse">
          {streaming}
        </div>
      )}

      {complete && (
        <div>{complete}</div>
      )}
    </div>
  );
}
```

### SSE Event Types

```typescript
export type SSEEventType =
  | 'start'           // Stream initiated
  | 'detecting'       // Detecting user intent
  | 'intent'          // Intent detected
  | 'agent_selected'  // Agent selected for task
  | 'chunk'           // Text chunk received
  | 'complete'        // Stream complete
  | 'error';          // Error occurred

export interface SSEChatEvent {
  type: SSEEventType;
  data: any;
}
```

#### Event Handler Example

```typescript
const sse = new ChatSSE(config, {
  onMessage: (chunk, event) => {
    switch (event.type) {
      case 'start':
        console.log('Stream started');
        break;

      case 'detecting':
        setStatus('Detectando intenção...');
        break;

      case 'intent':
        setIntent(event.data.intent);
        break;

      case 'agent_selected':
        setAgent(event.data.agent_name);
        break;

      case 'chunk':
        appendText(chunk);
        break;

      case 'complete':
        setFinalResponse(event.data);
        break;

      case 'error':
        handleError(event.data);
        break;
    }
  },
});
```

### WebSocket (Future Implementation)

Infrastructure is in place for WebSocket support:

```typescript
// lib/api/client.ts
export const WS_BASE_URL = API_BASE_URL
  .replace('https://', 'wss://')
  .replace('http://', 'ws://');

// Future WebSocket client
class ChatWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnects = 5;

  connect(sessionId: string) {
    this.ws = new WebSocket(`${WS_BASE_URL}/api/v1/chat/ws`);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;

      // Subscribe to session
      this.ws?.send(JSON.stringify({
        type: 'subscribe',
        data: { session_id: sessionId },
      }));
    };

    this.ws.onmessage = (event) => {
      const message: WSMessage = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect(sessionId);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private attemptReconnect(sessionId: string) {
    if (this.reconnectAttempts < this.maxReconnects) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

      setTimeout(() => {
        console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnects})`);
        this.connect(sessionId);
      }, delay);
    }
  }

  sendMessage(message: string, context?: Record<string, any>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'chat',
        data: { content: message, context },
      }));
    } else {
      console.error('WebSocket not connected');
    }
  }

  private handleMessage(message: WSMessage) {
    switch (message.type) {
      case 'chat':
      case 'chat_complete':
        // Handle chat messages
        break;
      case 'typing':
        // Show typing indicator
        break;
      case 'error':
        // Handle errors
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }
}
```

---

## Testing API Integration

### Manual Testing Scripts

The project uses manual testing scripts in `/scripts` directory.

#### Test Backend Connectivity

```bash
node scripts/test-backend.js
```

**What it tests**:
- Backend health check
- Agent list endpoint
- Basic chat message
- Response time measurement

#### Test Chat Adapters

```bash
node scripts/test-chat-adapters.js
```

**What it tests**:
- SSE streaming adapter
- Backend message adapter
- Fallback adapter
- Local investigation adapter
- Adapter performance comparison

#### Test Smart Chat Service

```bash
node scripts/test-smart-chat.js
```

**What it tests**:
- Message complexity analysis
- Endpoint selection logic
- Economic vs Quality modes
- Streaming functionality
- Cache integration

#### Monitor Backend Performance

```bash
node scripts/monitor-backend.js
```

**What it does**:
- Continuous health monitoring
- Response time tracking
- Uptime calculation
- Alert on degradation

### Unit Testing with Vitest

For automated testing of API utilities:

```typescript
// lib/api/client.test.ts
import { describe, it, expect, vi } from 'vitest';
import { api, apiRequest } from './client';

describe('API Client', () => {
  it('should make GET request', async () => {
    const response = await api.get('/api/v1/agents');

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    const response = await api.get('/api/v1/nonexistent');

    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
    expect(response.error?.status).toBe(404);
  });

  it('should add auth token to requests', async () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    localStorage.setItem('access_token', 'test_token');

    await api.get('/api/v1/users/me');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test_token',
        }),
      })
    );
  });
});
```

### Integration Testing

Test real backend integration:

```typescript
// __tests__/integration/chat-api.test.ts
import { describe, it, expect } from 'vitest';
import { smartChatService } from '@/lib/services/smart-chat.service';

describe('Chat API Integration', () => {
  it('should send message and receive response', async () => {
    const response = await smartChatService.sendMessage(
      'Olá, como você funciona?'
    );

    expect(response.session_id).toBeDefined();
    expect(response.agent_id).toBeDefined();
    expect(response.message).toBeDefined();
    expect(response.confidence).toBeGreaterThan(0);
  }, 30000); // 30s timeout for real API call

  it('should handle streaming responses', async () => {
    const chunks: string[] = [];

    const response = await smartChatService.sendMessage(
      'Explique o Portal da Transparência',
      {
        streaming: true,
        onChunk: (chunk) => chunks.push(chunk),
      }
    );

    expect(chunks.length).toBeGreaterThan(0);
    expect(response.metadata.streaming).toBe(true);
  }, 30000);

  it('should fallback on primary endpoint failure', async () => {
    // Mock primary endpoint failure
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const response = await smartChatService.sendMessage('Test fallback');

    // Should still get a response from fallback
    expect(response.message).toBeDefined();
  });
});
```

---

## Best Practices

### 1. Always Use Type-Safe Clients

❌ **Bad**:
```typescript
const response = await fetch('/api/v1/agents');
const agents = await response.json(); // Type: any
```

✅ **Good**:
```typescript
import { api } from '@/lib/api/client';
import type { Agent } from '@/types/agent';

const { data, error } = await api.get<Agent[]>('/api/v1/agents');
if (error) {
  // Handle error
} else {
  // data is Agent[]
}
```

### 2. Handle Errors at Multiple Levels

```typescript
// 1. Client level: Automatic retry, token refresh
apiClient.interceptors.response.use(...);

// 2. Service level: Fallback logic
try {
  return await primaryEndpoint();
} catch {
  return await fallbackEndpoint();
}

// 3. Component level: User feedback
try {
  await sendMessage(text);
} catch (error) {
  toast.error('Failed to send message');
}
```

### 3. Cache Intelligently

```typescript
// Cache static data aggressively
const agents = await fetchWithCache(
  'agents',
  () => api.get('/api/v1/agents'),
  60 * 60 * 1000 // 1 hour
);

// Don't cache dynamic data
const messages = await api.get(`/api/v1/chat/${sessionId}/messages`);
// No caching for real-time data
```

### 4. Use Streaming for Long Responses

❌ **Bad** (for long analysis):
```typescript
const response = await api.post('/api/v1/chat/message', {
  message: 'Analyze all government contracts from 2024',
});
// User waits 30+ seconds with no feedback
```

✅ **Good**:
```typescript
const response = await smartChatService.sendMessage(
  'Analyze all government contracts from 2024',
  {
    streaming: true,
    onProgress: (text) => {
      setPartialResponse(text); // Real-time UI updates
    },
  }
);
```

### 5. Implement Proper Loading States

```typescript
const [isLoading, setIsLoading] = useState(false);
const [isStreaming, setIsStreaming] = useState(false);

const handleSend = async () => {
  setIsLoading(true);

  try {
    const response = await smartChatService.sendMessage(message, {
      streaming: true,
      onChunk: (chunk) => {
        setIsLoading(false);
        setIsStreaming(true);
        // Update UI with chunk
      },
    });

    setIsStreaming(false);
  } catch (error) {
    setIsLoading(false);
    setIsStreaming(false);
    toast.error('Error sending message');
  }
};

// UI
{isLoading && <Spinner />}
{isStreaming && <TypingIndicator />}
```

### 6. Log Performance Metrics

```typescript
import { logger } from '@/lib/utils/logger';

const startTime = Date.now();

try {
  const response = await api.post('/api/v1/chat/message', request);

  const duration = Date.now() - startTime;
  logger.performance('Chat message sent', duration, {
    endpoint: '/api/v1/chat/message',
    messageLength: request.message.length,
  });
} catch (error) {
  logger.error('Chat message failed', { error });
}
```

### 7. Use Environment-Specific Configurations

```typescript
// .env.local (development)
NEXT_PUBLIC_API_URL=http://localhost:8000

// .env.production
NEXT_PUBLIC_API_URL=https://cidadao-api-production.up.railway.app

// Code automatically uses correct URL
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});
```

### 8. Implement Request Deduplication

```typescript
const pendingRequests = new Map<string, Promise<any>>();

async function deduplicatedRequest<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  // Check if request is already in flight
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }

  // Start new request
  const promise = fetcher().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

// Usage
const agents = await deduplicatedRequest(
  'agents',
  () => api.get('/api/v1/agents')
);
```

### 9. Use Abort Controllers for Cancellation

```typescript
const abortController = new AbortController();

const response = await api.post('/api/v1/chat/message', request, {
  signal: abortController.signal,
});

// Cancel on component unmount
useEffect(() => {
  return () => {
    abortController.abort();
  };
}, []);
```

### 10. Validate Responses

```typescript
import { z } from 'zod';

const ChatResponseSchema = z.object({
  session_id: z.string(),
  agent_id: z.string(),
  message: z.string(),
  confidence: z.number().min(0).max(1),
  metadata: z.record(z.any()),
});

const response = await api.post('/api/v1/chat/message', request);

if (response.success) {
  try {
    const validated = ChatResponseSchema.parse(response.data);
    // Use validated data
  } catch (error) {
    console.error('Response validation failed:', error);
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. CORS Errors

**Symptom**:
```
Access to fetch at 'https://cidadao-api-production.up.railway.app/api/v1/agents'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution**:
- Backend must include CORS headers
- Check `withCredentials` setting in axios config
- Verify frontend domain is whitelisted in backend

```typescript
// client.ts
const apiClient = axios.create({
  withCredentials: false, // Set to false for Railway backend
});
```

#### 2. Authentication Token Not Sent

**Symptom**:
```
401 Unauthorized - Missing or invalid token
```

**Solution**:
- Check token is stored in localStorage
- Verify request interceptor is adding Authorization header
- Check token format (must be `Bearer <token>`)

```typescript
// Debug token
const token = localStorage.getItem('access_token');
console.log('Token:', token);

// Check headers
apiClient.interceptors.request.use((config) => {
  console.log('Headers:', config.headers);
  return config;
});
```

#### 3. SSE Stream Not Working

**Symptom**:
```
SSE connection fails or receives no events
```

**Solution**:
- Verify backend supports SSE (`Content-Type: text/event-stream`)
- Check firewall/proxy settings
- Increase timeout for long-running streams

```typescript
const sse = new ChatSSE({
  endpoint: '/api/v1/chat/stream',
  reconnect: true,
  maxReconnectAttempts: 5,
  timeout: 60000, // Increase timeout
});
```

#### 4. Cache Not Working

**Symptom**:
```
Cache always returns null, requests always hit backend
```

**Solution**:
- Check browser localStorage/IndexedDB quotas
- Verify cache key format
- Check TTL is not too short

```typescript
// Debug cache
const cache = await getChatCacheIDB();
const cached = await cache.get('test_key');
console.log('Cached value:', cached);

// Check localStorage quota
const used = JSON.stringify(localStorage).length;
console.log('localStorage used:', used, 'bytes');
```

#### 5. Request Timeout

**Symptom**:
```
Request timeout after 30 seconds
```

**Solution**:
- Increase timeout for specific endpoints
- Use streaming for long operations
- Implement retry logic

```typescript
// Increase timeout
const response = await api.post('/api/v1/chat/message', request, {
  timeout: 60000, // 60 seconds
});

// Or use streaming
const response = await smartChatService.sendMessage(message, {
  streaming: true,
  timeout: 90000,
});
```

#### 6. Railway Cold Start Delay

**Symptom**:
```
First request takes 30-60 seconds, subsequent requests are fast
```

**Solution**:
- Implement cache warming on app load
- Show appropriate loading states
- Use longer timeout for first request

```typescript
// Warm cache on mount
useEffect(() => {
  fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(65000) })
    .then(() => console.log('Backend warmed'))
    .catch(() => console.log('Backend cold start'));
}, []);
```

### Debugging Tools

#### 1. Network Tab (Browser DevTools)

- Check request/response headers
- Verify payload structure
- Monitor response times
- Inspect SSE events

#### 2. Custom Logger

```typescript
// lib/utils/logger.ts
export const logger = {
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data);
    }
  },

  performance: (message: string, duration: number, data?: any) => {
    console.log(`[PERF] ${message} (${duration}ms)`, data);
  },

  error: (message: string, data?: any) => {
    console.error(`[ERROR] ${message}`, data);
  },
};
```

#### 3. Axios Interceptor Logging

```typescript
// Development mode only
if (process.env.NODE_ENV === 'development') {
  apiClient.interceptors.request.use((config) => {
    console.log('→ Request:', {
      method: config.method,
      url: config.url,
      headers: config.headers,
      data: config.data,
    });
    return config;
  });

  apiClient.interceptors.response.use(
    (response) => {
      console.log('← Response:', {
        status: response.status,
        data: response.data,
      });
      return response;
    },
    (error) => {
      console.error('← Error:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
      return Promise.reject(error);
    }
  );
}
```

#### 4. Manual Testing Scripts

```bash
# Test all chat adapters
node scripts/test-chat-adapters.js

# Monitor backend health
node scripts/monitor-backend.js

# Test specific endpoint
node scripts/test-backend.js
```

### Health Check Endpoint

```typescript
// Quick backend health check
const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Backend healthy:', data);
      return true;
    }

    console.warn('Backend unhealthy:', response.status);
    return false;
  } catch (error) {
    console.error('Backend unreachable:', error);
    return false;
  }
};

// Use in components
useEffect(() => {
  healthCheck().then(isHealthy => {
    if (!isHealthy) {
      toast.warning('Backend may be experiencing issues');
    }
  });
}, []);
```

---

## Summary

This guide covered:

1. ✅ **HTTP Clients**: Base client and authenticated client with interceptors
2. ✅ **Service Layer**: Smart chat, investigation, transparency map services
3. ✅ **Type Safety**: Comprehensive TypeScript interfaces for all API contracts
4. ✅ **Error Handling**: Multi-level error handling with automatic retry
5. ✅ **Authentication**: Supabase integration with automatic token refresh
6. ✅ **Caching**: Three-layer caching strategy (memory, localStorage, IndexedDB)
7. ✅ **Streaming**: SSE implementation for real-time chat responses
8. ✅ **Testing**: Manual scripts and unit/integration test patterns
9. ✅ **Best Practices**: 10 essential patterns for robust API integration
10. ✅ **Troubleshooting**: Common issues and debugging techniques

### Next Steps

1. **Implement WebSocket**: For bi-directional real-time communication
2. **Add Request Metrics**: Track API performance in production
3. **Implement GraphQL**: For more efficient data fetching
4. **Add Offline Support**: Queue requests when offline, sync when online
5. **Create API Playground**: Interactive testing interface for developers

### References

- [Axios Documentation](https://axios-http.com/docs/intro)
- [Server-Sent Events (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [IndexedDB API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Railway Deployment](https://docs.railway.app/)

---

**Document Status**: ✅ Complete
**Coverage**: Comprehensive - All API integration patterns documented
**Last Review**: 2025-01-25
**Next Review**: 2025-04-25
