# Chat Architecture Deep Dive - Multi-Adapter Communication System

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data de Criação**: 2025-01-25 17:00:00 -0300
**Última Atualização**: 2025-01-25

---

## Overview

The Cidadão.AI chat system is a sophisticated multi-layer architecture designed for resilient, performant, and cost-effective communication with the multi-agent AI backend. It implements intelligent adapter selection, multi-tier caching, and graceful degradation to ensure the best possible user experience.

### Key Features

- ✅ **Multi-Adapter Pattern**: 3 specialized adapters with automatic failover
- ✅ **Smart Routing**: Intelligent endpoint selection based on message complexity
- ✅ **SSE Streaming**: Real-time Server-Sent Events for progressive responses
- ✅ **Intelligent Caching**: Multi-layer caching with TTL-based invalidation
- ✅ **Cost Optimization**: Economic and quality modes with cost tracking
- ✅ **Session Persistence**: Supabase integration for cross-device sync
- ✅ **Graceful Degradation**: Local fallback when all endpoints fail
- ✅ **Telemetry**: Comprehensive tracking of performance and costs

---

## 1. System Architecture

### Request Flow Diagram

```
User Input
    ↓
[Chat Store]
    ↓
[CachedSmartChatService] ──────┐
    ↓                           │
[Cache Check]                   │
    ├─ Hit → Return cached      │
    └─ Miss ↓                   │
                                │
[SmartChatService]              │
    ↓                           │
[Adapter Selection]             │
    ├─ SSE (Priority 1)         │
    ├─ Backend (Priority 2)     │
    └─ Fallback (Priority 3)    │
        ↓                       │
[Railway Backend API]           │
        ↓                       │
[Response Processing]           │
        ↓                       │
[Cache Storage] ← ──────────────┘
        ↓
[Supabase Persistence]
        ↓
[UI Update]
```

### Component Interaction

```
Components Layer:
  ChatInterface.tsx
  ChatMessages.tsx
  ChatInput.tsx
        ↓
State Management Layer:
  chatStore (Zustand)
        ↓
Service Layer:
  CachedSmartChatService
  SmartChatService
  ChatSessionService
        ↓
Adapter Layer:
  chat-adapter-sse.ts
  chat-adapter-backend.ts
  chat-adapter-fallback.ts
        ↓
Transport Layer:
  ChatSSE (SSE client)
  API client (HTTP)
        ↓
Backend:
  Railway Production API
  17 AI Agents
```

---

## 2. Adapter Pattern Implementation

### Interface Definition

All adapters implement the `ChatAdapter` signature:

```typescript
type ChatAdapter = (request: ChatRequest) => Promise<ChatResponse>

interface ChatRequest {
  message: string
  session_id?: string
  context?: Record<string, any>
}

interface ChatResponse {
  session_id: string
  message_id?: string
  agent_id: string
  agent_name: string
  message: string
  confidence: number
  suggested_actions?: string[]
  follow_up_questions?: string[]
  metadata: Record<string, any>
}
```

### Adapter Implementations

#### 1. SSE Streaming Adapter (`chat-adapter-sse.ts`)

**Purpose**: Real-time streaming responses with progressive updates

**File**: `lib/api/chat-adapter-sse.ts`

**Key Features**:
- Server-Sent Events (SSE) protocol
- Progressive message streaming
- Automatic reconnection (max 3 attempts)
- Exponential backoff on failure
- AbortController for cancellation

**Usage**:
```typescript
import { sendSSEMessage } from '@/lib/api/chat-adapter-sse'

const response = await sendSSEMessage(request, {
  onChunk: (text) => {
    console.log('Received chunk:', text)
  },
  onProgress: (accumulated) => {
    updateUI(accumulated)
  }
})
```

**Advantages**:
- Lower latency than polling
- Better UX with real-time updates
- Serverless-compatible (HuggingFace Spaces)
- Native browser support

**Endpoint**: `POST /api/v1/chat/stream`

**Transport**: HTTP with `Accept: text/event-stream` header

**Message Format**:
```
data: {"type":"chunk","data":{"text":"Hello"}}

data: {"type":"chunk","data":{"text":" World"}}

data: {"type":"complete","data":{"session_id":"123","confidence":0.95}}

```

#### 2. Backend Direct Adapter (`chat-adapter-backend.ts`)

**Purpose**: Standard request-response communication

**File**: `lib/api/chat-adapter-backend.ts`

**Key Features**:
- Direct Railway backend calls
- Complete response in single payload
- Agent information in response
- Maintenance mode detection

**Usage**:
```typescript
import { sendBackendMessage } from '@/lib/api/chat-adapter-backend'

const response = await sendBackendMessage(request)
console.log(`Agent ${response.agent_name}:`, response.message)
```

**Endpoint**: `POST /api/v1/chat/message`

**Advantages**:
- Simple implementation
- Complete metadata in one response
- Reliable for short messages
- Better for cached responses

**Response Structure**:
```json
{
  "session_id": "session_123",
  "message_id": "msg_456",
  "agent_id": "zumbi",
  "agent_name": "Zumbi dos Palmares",
  "message": "Detectei 3 anomalias...",
  "confidence": 0.92,
  "suggested_actions": ["Ver detalhes", "Exportar relatório"],
  "processing_time": 1247
}
```

#### 3. Fallback Multi-Endpoint Adapter (`chat-adapter-fallback.ts`)

**Purpose**: Resilient communication with multiple endpoint attempts

**File**: `lib/api/chat-adapter-fallback.ts`

**Key Features**:
- Tries multiple endpoints sequentially
- Priority-based ordering
- Local fallback on complete failure
- Timeout per endpoint (15s)

**Usage**:
```typescript
import { sendFallbackMessage } from '@/lib/api/chat-adapter-fallback'

// Automatically tries: stream → message → local
const response = await sendFallbackMessage(request)
```

**Endpoint Priority**:
1. `/api/v1/chat/stream` (SSE)
2. `/api/v1/chat/message` (Direct)
3. Local fallback (offline)

**Local Fallback Behavior**:
```typescript
// When all endpoints fail
{
  session_id: 'fallback',
  agent_id: 'system',
  agent_name: 'Sistema',
  message: 'Desculpe, estou temporariamente indisponível...',
  confidence: 0,
  suggested_actions: ['Tentar novamente', 'Verificar conexão'],
  metadata: { fallback: true, local_response: true }
}
```

---

## 3. Smart Chat Service

### Intelligent Adapter Selection

**File**: `lib/services/smart-chat.service.ts`

The `SmartChatService` automatically selects the best adapter based on:

1. **Message Complexity**: Simple, moderate, or complex
2. **User Preference**: Economic, quality, or auto
3. **Streaming Requirement**: Real-time vs complete response
4. **Endpoint Priority**: Primary SSE → Backend → Fallback

**Complexity Analysis**:

```typescript
analyzeComplexity(message: string): 'simple' | 'moderate' | 'complex' {
  // Length-based
  if (message.length > 200) return 'complex'
  if (message.length < 20) return 'simple'

  // Keyword-based
  const complexKeywords = [
    'analise', 'investigue', 'compare', 'tendência',
    'padrão', 'anomalia', 'relatório', 'estatística'
  ]

  const moderateKeywords = [
    'explique', 'como funciona', 'o que é', 'liste'
  ]

  // Returns: simple | moderate | complex
}
```

### Model Preferences

```typescript
type ModelPreference = 'auto' | 'economic' | 'quality' | 'stable'
```

**Economic Mode**:
- Uses `sabiazinho-3` model ($0.001 per 1k tokens)
- Fastest responses
- Best for greetings and simple questions
- Prioritizes cost over quality

**Quality Mode**:
- Uses `sabia-3` model ($0.003 per 1k tokens)
- Better analysis and understanding
- Best for complex investigations
- Prioritizes quality over cost

**Auto Mode** (Default):
- Analyzes message complexity
- Routes simple → economic, complex → quality
- Balances cost and performance

**Stable Mode**:
- Prioritizes stable endpoints
- Avoids experimental features
- Best for production

### Endpoint Configuration

```typescript
private endpoints: ChatEndpoint[] = [
  {
    url: '/api/v1/chat/stream',
    name: 'SSE Streaming (Primary)',
    adapter: sendSSEMessage,
    model: 'sabiazinho-3',
    costLevel: 1,
    priority: 1
  },
  {
    url: '/api/v1/chat/message',
    name: 'Backend Message',
    adapter: sendBackendMessage,
    model: 'sabiazinho-3',
    costLevel: 1,
    priority: 2
  },
  {
    url: '/api/v1/chat/fallback',
    name: 'Multi-Endpoint Fallback',
    adapter: sendFallbackMessage,
    model: 'sabiazinho-3',
    costLevel: 1,
    priority: 3
  }
]
```

---

## 4. Caching Architecture

### Multi-Layer Caching

The chat system implements 3 caching layers:

```
Request → [IndexedDB Cache] → [Memory Cache] → [Backend API]
             ↑ Persistent         ↑ Fast           ↑ Source
             5 min TTL            5 min TTL        Real-time
```

### Layer 1: IndexedDB Cache (`chat-cache-idb.service.ts`)

**Purpose**: Persistent browser storage, survives page reloads

**Database Structure**:
```typescript
Database: "cidadao-ai-cache"
Store: "chat-cache"
Keys: normalized_message
Value: {
  response: ChatResponse,
  timestamp: number,
  expiresAt: number,
  hitCount: number
}
```

**TTL Strategy**:
- High confidence (>0.95): 24 hours
- Factual responses: 24 hours
- Greetings: 24 hours
- Analysis: 10 minutes (data may change)
- Default: 30 minutes

**Usage**:
```typescript
import { getChatCacheIDB } from '@/lib/services/chat-cache-idb.service'

const cache = await getChatCacheIDB()

// Check cache
const cached = await cache.get('Olá, como funciona?')
if (cached) return cached

// Store response
await cache.set('Olá, como funciona?', response)

// Clear expired
await cache.clearExpired()
```

### Layer 2: Memory Cache (`chat-cache.service.ts`)

**Purpose**: Fast in-memory cache for current session

**File**: `lib/services/chat-cache.service.ts`

**Features**:
- LRU eviction (1000 entry limit)
- Message normalization
- TTL-based expiration
- Hit count tracking

**Message Normalization**:
```typescript
normalizeMessage(message: string): string {
  return message
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"]/g, '')           // Remove punctuation
    .replace(/\s+/g, ' ')                 // Normalize whitespace
    .replace(/\b(eu|me|meu|minha)\b/g, '') // Remove pronouns
    .replace(/\b(o|a|os|as|um|uma)\b/g, '') // Remove articles
    .trim()
}

// "Olá! Como funciona o sistema?"
// → "olá como funciona sistema"
```

**Cache Statistics**:
```typescript
const stats = chatCache.getStats()
// {
//   entries: 45,
//   totalHits: 123,
//   totalSizeMB: "2.4",
//   averageHitsPerEntry: "2.73",
//   modelDistribution: { "sabiazinho-3": 40, "sabia-3": 5 }
// }
```

### Layer 3: Cached Smart Chat Service

**File**: `lib/services/cached-smart-chat.service.ts`

**Purpose**: Wraps SmartChatService with cache integration

**Features**:
- Automatic cache check before API call
- High-confidence response caching (>0.8)
- Cost metrics tracking
- Cache preloading for common queries

**Cache Strategy**:
```typescript
async sendMessage(message: string, options = {}) {
  // 1. Check cache (unless quality mode)
  if (options.preferredModel !== 'quality') {
    const cached = chatCache.get(message)
    if (cached) {
      costMetrics.record({ from_cache: true })
      return cached
    }
  }

  // 2. Get fresh response
  const response = await super.sendMessage(message, options)

  // 3. Cache high-confidence responses
  if (response.confidence > 0.8 && !response.metadata?.error) {
    chatCache.set(message, response)
  }

  return response
}
```

**Cache Preloading**:
```typescript
// Preload common queries at startup
const commonQueries = [
  'Olá',
  'O que é o Cidadão.AI?',
  'Como funciona o sistema?',
  'Como posso ajudar?'
]

await cachedSmartChatService.preloadCache()
```

---

## 5. Session Management

### Supabase Persistence

**File**: `lib/services/chat-session.service.ts`

**Purpose**: Cross-device session synchronization

**Database Schema** (`chat_sessions` table):
```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  investigation_id UUID REFERENCES investigations(id),
  agent_id TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  session_metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
```

**Message Storage**:
```typescript
interface ChatMessage {
  id: string              // UUID
  timestamp: string       // ISO 8601
  role: 'user' | 'assistant' | 'system'
  content: string
  agent_id?: string
  agent_name?: string
  metadata?: Record<string, any>
}
```

**Session Operations**:

```typescript
import { chatSessionService } from '@/lib/services/chat-session.service'

// Create session
const session = await chatSessionService.createSession({
  session_id: 'session_123',
  agent_id: 'zumbi',
  metadata: { investigation_type: 'corruption' }
})

// Add message
await chatSessionService.addMessage('session_123', {
  role: 'user',
  content: 'Analisar contratos públicos'
})

// Get session history
const sessions = await chatSessionService.getUserSessions(10)

// Get investigation sessions
const investigationSessions = await chatSessionService
  .getInvestigationSessions('inv_456')
```

### Session Lifecycle

```
Session Creation
    ↓
[Frontend generates session_id]
    ↓
[First message sent]
    ↓
[Supabase: createSession()]
    ↓
[Messages accumulated in-memory]
    ↓
[Periodic sync to Supabase]
    ↓
[Session retrieved on login]
```

---

## 6. SSE Streaming Implementation

### ChatSSE Class

**File**: `lib/sse/chat-sse.ts`

**Purpose**: Robust SSE client with reconnection

**Key Features**:
- Fetch API with ReadableStream
- AbortController for cancellation
- Exponential backoff reconnection
- Message chunk accumulation
- Connection status tracking

**Configuration**:
```typescript
interface SSEConfig {
  sessionId: string
  endpoint?: string              // Default: /api/v1/chat/stream
  reconnect?: boolean            // Default: true
  reconnectInterval?: number     // Default: 3000ms
  maxReconnectAttempts?: number  // Default: 5
}
```

**Usage Example**:
```typescript
const sse = new ChatSSE(
  {
    sessionId: 'session_123',
    endpoint: '/api/v1/chat/stream',
    reconnect: true,
    maxReconnectAttempts: 5
  },
  {
    onMessage: (chunk) => {
      console.log('Chunk:', chunk)
    },
    onComplete: (response) => {
      console.log('Complete:', response.message)
    },
    onError: (error) => {
      console.error('Error:', error)
    },
    onConnectionStatus: (status) => {
      console.log('Status:', status)
    }
  }
)

await sse.sendMessage('Olá, como funciona?')
```

### SSE Message Protocol

**Event Types**:
```typescript
type SSEEventType =
  | 'start'            // Stream started
  | 'detecting'        // Intent detection in progress
  | 'intent'           // Intent detected
  | 'agent_selected'   // Agent selected
  | 'chunk'            // Message chunk
  | 'complete'         // Stream complete
  | 'error'            // Error occurred
```

**Message Format**:
```
data: {"type":"start","data":{"session_id":"123"}}

data: {"type":"detecting","data":{"message":"Analyzing intent..."}}

data: {"type":"intent","data":{"intent":"investigate","confidence":0.95}}

data: {"type":"agent_selected","data":{"agent_id":"zumbi","agent_name":"Zumbi dos Palmares"}}

data: {"type":"chunk","data":{"text":"Detectei "}}

data: {"type":"chunk","data":{"text":"3 anomalias..."}}

data: {"type":"complete","data":{"session_id":"123","confidence":0.92}}

```

### Reconnection Strategy

```typescript
private scheduleReconnect(retryFn: () => Promise<void>): void {
  if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
    console.error('[SSE] Max reconnection attempts reached')
    return
  }

  this.reconnectAttempts++

  // Exponential backoff: 3s, 6s, 9s (max 3x)
  const delay = this.config.reconnectInterval *
                Math.min(this.reconnectAttempts, 3)

  console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

  setTimeout(() => retryFn(), delay)
}
```

### Stream Cancellation

```typescript
// User can abort stream at any time
sse.abort()

// Or use AbortController
const controller = new AbortController()
fetch(url, { signal: controller.signal })

// Later
controller.abort()
```

---

## 7. Error Handling & Resilience

### Error Hierarchy

```
ChatError (base)
  ├─ NetworkError (connection failed)
  ├─ TimeoutError (request timeout)
  ├─ BackendError (API error)
  │   ├─ MaintenanceError (backend maintenance)
  │   └─ ValidationError (invalid request)
  └─ FallbackError (all endpoints failed)
```

### Adapter Failover

```typescript
// SmartChatService failover logic
for (const endpoint of selectedEndpoints) {
  try {
    const response = await this.tryEndpoint(endpoint, request)
    return response // Success!
  } catch (error) {
    logger.warn(`${endpoint.name} failed:`, error)
    // Continue to next endpoint
  }
}

// All failed → local fallback
return this.createFallbackResponse(request, lastError)
```

### Timeout Handling

```typescript
private async tryEndpoint(
  endpoint: ChatEndpoint,
  request: ChatRequest,
  timeout = 30000
): Promise<ChatResponse> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeout)
  })

  return Promise.race([
    endpoint.adapter(request),
    timeoutPromise
  ])
}
```

### Maintenance Mode Detection

```typescript
// Backend adapter detects maintenance responses
const isMaintenanceMessage =
  messageText.includes('manutenção') ||
  messageText.includes('temporariamente indisponível') ||
  data.agent_id === 'system'

if (isMaintenanceMessage) {
  throw new Error('Backend in maintenance mode')
  // Upstream handler will try fallback adapter
}
```

### Circuit Breaker Pattern (Future)

```typescript
// Planned: Prevent cascading failures
class CircuitBreaker {
  private failureCount = 0
  private lastFailureTime = 0
  private state: 'closed' | 'open' | 'half-open' = 'closed'

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      throw new Error('Circuit breaker open')
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }
}
```

---

## 8. Telemetry & Cost Tracking

### Chat Telemetry

**File**: `lib/telemetry/chat-telemetry.ts`

**Tracked Metrics**:
- `messagesSent`: Total user messages
- `messagesReceived`: Total agent responses
- `errors`: Failed requests
- `averageResponseTime`: Mean latency (rolling avg last 100)
- `sessionCount`: Unique sessions
- `retryCount`: Automatic retries
- `intents`: Intent distribution

**Event Types**:
```typescript
type ChatEventType =
  | 'message_sent'      // User sends message
  | 'message_received'  // Response received
  | 'error'             // Request failed
  | 'retry'             // Retry triggered
  | 'session_start'     // Session created
  | 'session_end'       // Session closed
```

**Usage**:
```typescript
import { chatTelemetry } from '@/lib/telemetry/chat-telemetry'

// Track message sent
chatTelemetry.track({
  type: 'message_sent',
  sessionId: 'session_123',
  intent: 'investigate',
  timestamp: Date.now()
})

// Track response
chatTelemetry.track({
  type: 'message_received',
  sessionId: 'session_123',
  duration: 1247,
  data: {
    endpoint: 'sse',
    model: 'sabiazinho-3',
    confidence: 0.92
  }
})

// Get metrics
const metrics = chatTelemetry.getMetrics()
console.log(`Avg response time: ${metrics.averageResponseTime}ms`)
console.log(`Cache hit rate: ${metrics.cacheHitRate}%`)
```

### Cost Metrics

**File**: `lib/telemetry/cost-metrics.ts`

**Model Pricing**:
```typescript
const MODEL_COSTS = {
  'sabiazinho-3': 0.20, // per 1M tokens
  'sabia-3': 0.60,       // per 1M tokens
  'mixed': 0.40,         // average
  'fallback': 0.00       // local only
}
```

**Tracked Data**:
```typescript
costMetrics.record({
  model_used: 'sabiazinho-3',
  tokens_used: 250,
  response_time: 1500,
  from_cache: false,
  success: true,
  endpoint: '/api/v1/chat/message',
  message_length: 120
})
```

**Cost Report**:
```typescript
const report = costMetrics.getReport(24) // Last 24 hours

// {
//   totalRequests: 450,
//   cachedRequests: 180,
//   cacheHitRate: 0.40,
//   totalTokens: 112500,
//   estimatedCost: 0.0225,        // $0.0225
//   costSavings: 0.009,           // $0.009 saved by cache
//   avgResponseTime: 1247,
//   errorRate: 0.02
// }
```

---

## 9. State Management (Zustand)

### Chat Store

**File**: `store/chat-store.ts`

**State Structure**:
```typescript
interface ChatState {
  // Messages
  messages: ChatMessage[]
  currentSessionId: string | null

  // UI State
  isLoading: boolean
  isStreaming: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'

  // Agent State
  currentAgent: AgentInfo | null
  suggestedActions: string[]

  // Settings
  streamingEnabled: boolean
  modelPreference: ModelPreference

  // Actions
  sendMessage: (message: string) => Promise<void>
  abortStream: () => void
  clearMessages: () => void
  loadHistory: (sessionId: string) => Promise<void>
  setModelPreference: (pref: ModelPreference) => void
}
```

**Actions**:
```typescript
const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      messages: [],
      isLoading: false,

      // Actions
      sendMessage: async (message: string) => {
        set({ isLoading: true })

        try {
          const response = await cachedSmartChatService.sendMessage(message, {
            preferredModel: get().modelPreference,
            streaming: get().streamingEnabled,
            onChunk: (chunk) => {
              // Update UI with chunk
              set({ isStreaming: true })
            }
          })

          set((state) => ({
            messages: [
              ...state.messages,
              { role: 'user', content: message },
              { role: 'assistant', content: response.message }
            ],
            isLoading: false,
            isStreaming: false
          }))
        } catch (error) {
          set({ isLoading: false, connectionStatus: 'error' })
          throw error
        }
      }
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        messages: state.messages.slice(-50), // Keep last 50 messages
        modelPreference: state.modelPreference,
        streamingEnabled: state.streamingEnabled
      })
    }
  )
)
```

---

## 10. Future Enhancements

### Phase 1 (Current Sprint)

- ✅ Multi-adapter architecture
- ✅ SSE streaming implementation
- ✅ Intelligent caching
- ✅ Cost tracking
- ✅ Session persistence

### Phase 2 (Next Sprint)

- 🚧 **WebSocket Migration**: Full duplex communication
- 🚧 **Circuit Breaker**: Prevent cascading failures
- 🚧 **Request Deduplication**: Prevent duplicate requests
- 🚧 **Advanced Analytics**: ML-based cost prediction

### Phase 3 (Long-term)

- 🚧 **GraphQL Subscriptions**: More efficient data fetching
- 🚧 **Edge Functions**: Deploy chat logic to edge
- 🚧 **P2P Messaging**: Direct peer-to-peer for low latency
- 🚧 **AI-Powered Caching**: Predict cache needs

---

## 11. Performance Optimization

### Current Optimizations

**1. Response Time Reduction**:
- SSE streaming: Real-time chunks (perceived latency: ~200ms)
- Memory cache: <10ms lookup
- IndexedDB cache: ~50ms lookup
- Backend direct: ~1500ms average

**2. Cost Reduction**:
- Cache hit rate: ~40% (target: 60%)
- Economic mode usage: 70% of requests
- Cost savings: $0.009 per 1000 messages
- Average cost per message: $0.00002

**3. Network Efficiency**:
- Gzip compression: ~70% size reduction
- ETags: Conditional requests
- Keep-alive connections: Reuse TCP
- Request batching: Planned

### Optimization Strategies

**Message Deduplication**:
```typescript
// Prevent duplicate concurrent requests
private pendingRequests = new Map<string, Promise<ChatResponse>>()

async sendMessage(message: string) {
  const key = this.normalizeMessage(message)

  if (this.pendingRequests.has(key)) {
    return this.pendingRequests.get(key)!
  }

  const promise = this.executeRequest(message)
  this.pendingRequests.set(key, promise)

  try {
    return await promise
  } finally {
    this.pendingRequests.delete(key)
  }
}
```

**Predictive Caching**:
```typescript
// Preload likely next messages based on context
async predictNextQueries(currentMessage: string): Promise<string[]> {
  const predictions = await mlModel.predict(currentMessage)

  // Preload in background
  for (const query of predictions) {
    cachedSmartChatService.sendMessage(query, { background: true })
  }
}
```

---

## 12. Troubleshooting Guide

### Common Issues

#### 1. Messages Not Appearing

**Symptoms**: Sent messages don't show in UI

**Checks**:
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_API_URL` environment variable
3. Check network tab for failed requests
4. Verify Zustand store state

**Debug**:
```typescript
// Check store state
const state = useChatStore.getState()
console.log('Messages:', state.messages)
console.log('Loading:', state.isLoading)

// Check service
const response = await cachedSmartChatService.sendMessage('Test')
console.log('Response:', response)
```

#### 2. SSE Streaming Fails

**Symptoms**: Falls back to direct endpoint immediately

**Checks**:
1. Backend `/api/v1/chat/stream` endpoint accessible
2. CORS headers allow SSE
3. Browser supports EventSource/ReadableStream
4. No corporate firewall blocking

**Debug**:
```typescript
// Test SSE directly
const sse = new ChatSSE(
  { sessionId: 'test' },
  {
    onMessage: (chunk) => console.log('Chunk:', chunk),
    onError: (error) => console.error('SSE Error:', error),
    onConnectionStatus: (status) => console.log('Status:', status)
  }
)

await sse.sendMessage('Test')
```

#### 3. Cache Not Working

**Symptoms**: Every request hits backend

**Checks**:
1. IndexedDB enabled in browser
2. Cache not cleared on each request
3. Message normalization working
4. TTL not expired

**Debug**:
```typescript
// Check cache directly
const cache = await getChatCacheIDB()
const stats = await cache.getStats()
console.log('Cache stats:', stats)

// Test cache
await cache.set('Test', mockResponse)
const cached = await cache.get('Test')
console.log('Cached:', cached)
```

#### 4. High Costs

**Symptoms**: Cost metrics show high spend

**Analysis**:
```typescript
const report = costMetrics.getReport(24)
console.log('Cache hit rate:', report.cacheHitRate) // Should be >0.4
console.log('Model usage:', report.modelUsage)      // Check sabia-3 usage
console.log('Error rate:', report.errorRate)        // Should be <0.05

// Optimize
cachedSmartChatService.setModelPreference('economic')
await cachedSmartChatService.preloadCache()
```

---

## Related Documentation

- [Architecture Overview](../guides/ARCHITECTURE.md) - System design
- [SSE Streaming](./sse-streaming.md) - SSE implementation details
- [Telemetry System](../telemetry-system.md) - Metrics and cost tracking
- [Manual Testing Scripts](../manual-testing-scripts.md) - Test chat system
- [Chat API Types](../../types/chat.ts) - TypeScript definitions

---

**Maintained by**: Frontend Team
**Last Review**: 2025-01-25
**Next Review**: 2025-04-25 (Quarterly)
