# SSE Streaming - Real-time Chat Responses

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data de Criação**: 2025-01-25 14:30:00 -0300
**Última Atualização**: 2025-01-25

---

## Overview

Server-Sent Events (SSE) provide real-time streaming of chat responses from the backend to the frontend, enabling a smooth user experience with progressive message display.

### Why SSE over WebSocket?

| Feature            | SSE                               | WebSocket               |
| ------------------ | --------------------------------- | ----------------------- |
| Protocol           | HTTP (text/event-stream)          | Binary WebSocket        |
| Direction          | One-way (server → client)         | Bi-directional          |
| Reconnection       | Built-in automatic                | Manual implementation   |
| Serverless Support | ✅ Excellent (HuggingFace Spaces) | ❌ Limited              |
| Browser Support    | ✅ Native EventSource API         | ✅ Native WebSocket API |
| Implementation     | Simpler                           | More complex            |
| Use Case           | Chat streaming, notifications     | Real-time collaboration |

**Decision**: SSE chosen for Cidadão.AI due to **serverless deployment** on HuggingFace Spaces and Railway, where WebSocket support is limited or non-existent.

---

## Architecture

### Component Structure

```
lib/sse/
├── chat-sse.ts              # Core SSE client implementation
└── chat-sse.test.ts         # Unit tests

lib/api/
├── chat-adapter-sse.ts      # SSE adapter for chat system
└── chat-adapter-sse.test.ts # Adapter tests
```

### Request Flow

```
User Input → SSE Adapter → ChatSSE Client → Backend /api/v1/chat/stream
                                                    ↓
                                            ReadableStream
                                                    ↓
                                            Chunked Response
                                                    ↓
                                            onMessage() callbacks
                                                    ↓
                                            UI Progressive Update
```

### Event Flow Diagram

```
[Frontend]                    [Backend]
    |                             |
    |--- POST /chat/stream ----→  |
    |    (message payload)         |
    |                             |
    |←---- Chunk 1 "Olá" ---------|
    |     (onMessage callback)     |
    |                             |
    |←---- Chunk 2 ", como" ------|
    |     (onMessage callback)     |
    |                             |
    |←---- Chunk 3 " posso" ------|
    |     (onMessage callback)     |
    |                             |
    |←---- Complete Event --------|
    |     (onComplete callback)    |
    |                             |
    X     Connection closed       X
```

---

## Implementation

### Core SSE Client

**File**: `lib/sse/chat-sse.ts`

```typescript
import { ChatSSE } from '@/lib/sse/chat-sse'

// Create SSE client
const sse = new ChatSSE(
  {
    sessionId: 'session_123',
    endpoint: '/api/v1/chat/stream',
    reconnect: true,
    maxReconnectAttempts: 5,
  },
  {
    onMessage: (chunk) => {
      console.log('Received chunk:', chunk)
      // Update UI progressively
      appendToMessageDisplay(chunk)
    },
    onComplete: (response) => {
      console.log('Stream complete:', response)
      // Finalize message display
      markMessageComplete(response)
    },
    onError: (error) => {
      console.error('SSE Error:', error)
      // Show error UI
      displayErrorMessage(error)
    },
    onConnectionStatus: (status) => {
      console.log('Connection status:', status)
      // Update connection indicator
      updateStatusIndicator(status)
    },
  }
)

// Send message
await sse.sendMessage('Como está o Portal da Transparência?')
```

### SSE Adapter

**File**: `lib/api/chat-adapter-sse.ts`

The SSE adapter integrates SSE streaming into the chat system's multi-adapter architecture.

```typescript
import { sendSSEMessage } from '@/lib/api/chat-adapter-sse'

// Simple usage
const response = await sendSSEMessage(
  {
    message: 'Analisar contratos de 2024',
    session_id: 'session_123',
  },
  {
    onChunk: (text) => {
      // Called for each chunk
      console.log('New text:', text)
    },
    onProgress: (accumulated) => {
      // Called with accumulated text
      console.log('Progress:', accumulated)
    },
    onConnectionStatus: (status) => {
      console.log('Status:', status)
    },
  }
)

console.log('Final response:', response)
```

### Reusable SSE Client

For chat sessions with multiple messages:

```typescript
import { createSSEClient } from '@/lib/api/chat-adapter-sse'

const sseClient = createSSEClient('session_123', {
  onChunk: (text) => updateUI(text),
  onConnectionStatus: (status) => updateStatusBadge(status),
})

// Send multiple messages using same client
await sseClient.sendMessage('Primeira pergunta')
await sseClient.sendMessage('Segunda pergunta')
await sseClient.sendMessage('Terceira pergunta')

// Cleanup
sseClient.disconnect()
```

---

## Configuration

### SSE Client Config

```typescript
interface SSEConfig {
  sessionId: string // Chat session ID (required)
  endpoint?: string // API endpoint (default: /api/v1/chat/stream)
  reconnect?: boolean // Auto-reconnect on failure (default: true)
  reconnectInterval?: number // Retry delay in ms (default: 3000)
  maxReconnectAttempts?: number // Max retries (default: 5)
}
```

### Event Handlers

```typescript
interface SSEHandlers {
  onMessage?: (chunk: string) => void
  onComplete?: (response: ChatResponse) => void
  onError?: (error: Error) => void
  onConnectionStatus?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void
}
```

---

## Reconnection Strategy

### Exponential Backoff

The SSE client implements exponential backoff for reconnection:

```typescript
// Attempt 1: 3000ms (3s)
// Attempt 2: 6000ms (6s)
// Attempt 3: 12000ms (12s)
// Attempt 4: 24000ms (24s)
// Attempt 5: 48000ms (48s) - max
// After 5 attempts: Give up, show error

reconnectDelay = baseDelay * Math.pow(2, attemptNumber - 1)
```

### Reconnection Triggers

Automatic reconnection occurs on:

- ✅ Network errors (ECONNRESET, ETIMEDOUT)
- ✅ Server errors (500, 502, 503)
- ✅ Stream interruption
- ❌ Client errors (400, 401, 403) - no retry
- ❌ Abort by user - no retry

### Manual Retry

```typescript
const sse = new ChatSSE(config, handlers)

try {
  await sse.sendMessage('Hello')
} catch (error) {
  // Manual retry after failure
  if (shouldRetry(error)) {
    await sse.sendMessage('Hello') // Automatic backoff applies
  }
}
```

---

## Error Handling

### Error Types

```typescript
class SSEError extends Error {
  type: 'network' | 'server' | 'timeout' | 'parse' | 'abort'
  statusCode?: number
  retryable: boolean
}
```

### Error Handling Patterns

```typescript
const sse = new ChatSSE(config, {
  onError: (error) => {
    if (error.type === 'network') {
      // Network issue - show offline indicator
      showOfflineMessage()
    } else if (error.type === 'server') {
      // Backend error - show server error message
      showServerErrorMessage(error.statusCode)
    } else if (error.type === 'timeout') {
      // Request timeout - offer retry
      offerRetryOption()
    } else if (error.type === 'abort') {
      // User cancelled - cleanup
      cleanupCancelledRequest()
    }
  },
})
```

### Graceful Degradation

When SSE fails, fallback to regular HTTP:

```typescript
import { sendSSEMessage } from '@/lib/api/chat-adapter-sse'
import { sendMessage as sendHTTP } from '@/lib/api/chat-adapter-backend'

async function sendChatMessage(request: ChatRequest) {
  try {
    // Attempt SSE first
    return await sendSSEMessage(request, {
      onChunk: (text) => updateUI(text),
    })
  } catch (error) {
    console.warn('SSE failed, falling back to HTTP:', error)

    // Fallback to regular HTTP request
    return await sendHTTP(request)
  }
}
```

---

## Backend Endpoint

### Expected SSE Format

Backend must return `text/event-stream` with this format:

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"type":"chunk","data":"Olá"}\n\n
data: {"type":"chunk","data":", como"}\n\n
data: {"type":"chunk","data":" posso"}\n\n
data: {"type":"chunk","data":" ajudar?"}\n\n
data: {"type":"complete","data":{"session_id":"123","agent_id":"abaporu","message":"Olá, como posso ajudar?"}}\n\n
```

### Event Structure

```typescript
interface SSEStreamChunk {
  type: 'chunk' | 'complete' | 'error'
  data: any
  timestamp?: string
}
```

**Chunk Event**:

```json
{
  "type": "chunk",
  "data": "texto parcial"
}
```

**Complete Event**:

```json
{
  "type": "complete",
  "data": {
    "session_id": "session_123",
    "agent_id": "abaporu",
    "agent_name": "Abaporu",
    "message": "texto completo acumulado",
    "confidence": 0.95,
    "metadata": {}
  }
}
```

**Error Event**:

```json
{
  "type": "error",
  "data": {
    "error": "Backend error message",
    "code": "RATE_LIMIT_EXCEEDED"
  }
}
```

---

## Performance Considerations

### Chunk Size

**Recommended**: 50-200 characters per chunk

```typescript
// Backend implementation (example)
const chunkSize = 100
const message = generateLongResponse()

for (let i = 0; i < message.length; i += chunkSize) {
  const chunk = message.substring(i, i + chunkSize)
  sendSSEChunk({ type: 'chunk', data: chunk })
  await delay(50) // 50ms between chunks for smooth UX
}

sendSSEChunk({ type: 'complete', data: fullResponse })
```

### Memory Management

SSE client automatically manages memory:

```typescript
class ChatSSE {
  private accumulatedMessage: string = ''

  // Accumulate chunks
  onMessage(chunk: string) {
    this.accumulatedMessage += chunk

    // Limit accumulated size (prevent memory leak)
    if (this.accumulatedMessage.length > 100000) {
      // 100KB
      console.warn('Message too long, truncating...')
      this.accumulatedMessage = this.accumulatedMessage.slice(-50000)
    }
  }
}
```

### Connection Pooling

Browsers limit concurrent SSE connections:

- **HTTP/1.1**: 6 connections per domain
- **HTTP/2**: Multiplexed (no limit)

**Best Practice**: Reuse SSE client for multiple messages in same session.

---

## Browser Compatibility

### Support Matrix

| Browser       | SSE Support | Fetch Streaming | Notes                 |
| ------------- | ----------- | --------------- | --------------------- |
| Chrome 90+    | ✅ Full     | ✅ Yes          | Recommended           |
| Firefox 88+   | ✅ Full     | ✅ Yes          | Recommended           |
| Safari 14+    | ✅ Full     | ✅ Yes          | Works well            |
| Edge 90+      | ✅ Full     | ✅ Yes          | Recommended           |
| Opera 76+     | ✅ Full     | ✅ Yes          | Works                 |
| Mobile Chrome | ✅ Full     | ✅ Yes          | Works                 |
| Mobile Safari | ✅ Full     | ⚠️ Partial      | Some issues on iOS 14 |

### Polyfill (Not Needed)

Modern browsers have native support. No polyfill required.

### Feature Detection

```typescript
function supportsSSE(): boolean {
  return typeof EventSource !== 'undefined'
}

function supportsFetchStream(): boolean {
  return typeof ReadableStream !== 'undefined'
}

// Use in adapter selection
if (supportsSSE() && supportsFetchStream()) {
  return new SSEAdapter()
} else {
  return new HTTPAdapter() // Fallback
}
```

---

## Testing

### Unit Tests

**File**: `lib/sse/chat-sse.test.ts`

```bash
npm test lib/sse/chat-sse.test.ts
```

**Coverage**:

- ✅ Message sending
- ✅ Chunk accumulation
- ✅ Complete event handling
- ✅ Error handling
- ✅ Reconnection logic
- ✅ Abort functionality

### Integration Tests

**File**: `lib/api/chat-adapter-sse.test.ts`

```bash
npm test lib/api/chat-adapter-sse.test.ts
```

**Coverage**:

- ✅ Adapter integration
- ✅ Telemetry tracking
- ✅ Metadata enrichment
- ✅ Progress callbacks
- ✅ Error scenarios

### Manual Testing

```bash
# Start dev server
npm run dev

# In browser console:
const { sendSSEMessage } = await import('/lib/api/chat-adapter-sse.ts')

await sendSSEMessage(
  { message: 'Test message', session_id: 'test' },
  {
    onChunk: (text) => console.log('Chunk:', text),
    onProgress: (acc) => console.log('Progress:', acc),
    onConnectionStatus: (s) => console.log('Status:', s),
  }
)
```

---

## Troubleshooting

### Issue: SSE Connection Fails

**Symptoms**: `onError` called immediately, no chunks received

**Possible Causes**:

1. Backend endpoint not returning `text/event-stream`
2. CORS headers missing
3. Network firewall blocking SSE
4. Backend not deployed (using localhost)

**Debug**:

```typescript
// Check network tab in DevTools
// Look for /chat/stream request
// Verify response headers:
//   Content-Type: text/event-stream
//   Cache-Control: no-cache

// Enable verbose logging
const sse = new ChatSSE(config, {
  onConnectionStatus: (status) => {
    console.log('[SSE] Status:', status)
  },
  onError: (error) => {
    console.error('[SSE] Error:', error)
    console.error('[SSE] Stack:', error.stack)
  },
})
```

### Issue: Chunks Not Appearing

**Symptoms**: Connection succeeds but `onMessage` never called

**Possible Causes**:

1. Backend not sending `data:` prefix
2. Missing `\n\n` terminator
3. Incorrect JSON format

**Solution**:
Backend must send:

```
data: {"type":"chunk","data":"text"}\n\n
```

NOT:

```
{"type":"chunk","data":"text"}\n
```

### Issue: Memory Leak

**Symptoms**: Page becomes slow after many messages

**Possible Causes**:

1. Not cleaning up SSE clients
2. Accumulating too many chunks
3. Event listener leaks

**Solution**:

```typescript
const sse = new ChatSSE(config, handlers)

// Send message
await sse.sendMessage('Hello')

// IMPORTANT: Disconnect when done
sse.disconnect()

// In React:
useEffect(() => {
  const sse = new ChatSSE(config, handlers)

  return () => {
    sse.disconnect() // Cleanup on unmount
  }
}, [])
```

### Issue: Reconnection Loop

**Symptoms**: Constantly reconnecting, never succeeds

**Possible Causes**:

1. Backend always returns error
2. Auth token expired
3. Rate limit exceeded

**Solution**:

```typescript
// Add max reconnect attempts
const sse = new ChatSSE({
  ...config,
  maxReconnectAttempts: 3, // Stop after 3 tries
})

// Check error type
sse.handlers.onError = (error) => {
  if (error.statusCode === 401) {
    // Auth issue - redirect to login
    redirectToLogin()
  } else if (error.statusCode === 429) {
    // Rate limit - show message
    showRateLimitMessage()
  }
}
```

---

## Comparison: SSE vs WebSocket

### When to Use SSE

✅ **Use SSE when**:

- One-way communication (server → client)
- Serverless deployment (Railway, HuggingFace Spaces)
- Simplicity preferred
- Automatic reconnection needed
- HTTP/2 available (multiplexing)

❌ **Don't use SSE when**:

- Bi-directional communication required
- Binary data transfer needed
- Low latency critical (< 50ms)
- Custom protocol required

### WebSocket Future Migration

Cidadão.AI has WebSocket infrastructure ready but **disabled** because:

1. Railway backend doesn't support WebSocket yet
2. HuggingFace Spaces has limited WebSocket support
3. SSE sufficient for current use case

**Migration Path**:

```typescript
// Current: SSE
const response = await sendSSEMessage(request)

// Future: WebSocket (when backend supports)
const ws = new ChatWebSocket(config)
ws.sendMessage(message)
ws.onMessage((chunk) => updateUI(chunk))
```

See `lib/websocket/chat-websocket.ts` for WebSocket implementation (ready but inactive).

---

## Security Considerations

### Authentication

SSE requests include auth headers:

```typescript
fetch(url, {
  headers: {
    Authorization: `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  },
})
```

### CSRF Protection

SSE is POST-based (not GET), so CSRF tokens should be included:

```typescript
headers: {
  'X-CSRF-Token': getCsrfToken(),
}
```

### Rate Limiting

Backend should rate-limit SSE endpoints:

```typescript
// Backend (example)
const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many chat requests, please slow down',
})

app.post('/api/v1/chat/stream', rateLimiter, sseHandler)
```

---

## Roadmap

### Current Implementation (Phase 1)

- ✅ SSE client with automatic reconnection
- ✅ Chunk streaming with progress callbacks
- ✅ Error handling and graceful degradation
- ✅ Telemetry integration
- ✅ Unit and integration tests

### Phase 2 (Coming Soon)

- 🚧 Compression support (gzip)
- 🚧 Retry with jitter (avoid thundering herd)
- 🚧 Connection pooling optimization
- 🚧 Server-Sent Events for notifications (not just chat)

### Phase 3 (Future)

- 🚧 WebSocket migration (when backend supports)
- 🚧 Hybrid mode (SSE + WebSocket)
- 🚧 Binary streaming (files, images)

---

## Related Documentation

- [Chat Architecture](./guides/ARCHITECTURE.md#multi-adapter-chat-system)
- [Chat Adapters](./guides/ARCHITECTURE.md#chat-adapters)
- [Backend Integration](./technical/integration/FRONTEND_CHAT_INTEGRATION.md)
- [WebSocket (Future)](./lib/websocket/chat-websocket.ts)
- [Telemetry System](./telemetry-system.md)

---

**Maintained by**: Frontend Team
**Last Review**: 2025-01-25
**Next Review**: 2025-04-25 (Quarterly)
