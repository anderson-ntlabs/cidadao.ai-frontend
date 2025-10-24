# State Management Architecture - Zustand Deep Dive

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data de Criação**: 2025-01-25 19:00:00 -0300
**Última Atualização**: 2025-01-25

---

## Overview

The Cidadão.AI frontend uses **Zustand** as its state management solution, providing a minimal, fast, and scalable approach to managing global application state. Zustand was chosen over Redux for its simplicity, TypeScript support, and excellent performance characteristics.

### Why Zustand?

**Advantages**:
- ✅ Minimal boilerplate (no actions, reducers, or dispatch)
- ✅ Built-in TypeScript support
- ✅ Middleware ecosystem (persist, devtools, immer)
- ✅ No Context Provider wrapper needed
- ✅ Small bundle size (~1KB)
- ✅ React Suspense compatible
- ✅ Easy to test and mock

**vs Redux**:
- 90% less code for the same functionality
- No action creators or action types
- Direct state mutations (with immer middleware)
- Simpler mental model

**vs Context API**:
- Better performance (no unnecessary re-renders)
- No provider nesting hell
- More predictable updates

---

## Store Architecture

### Store Overview

The application uses **3 primary stores**:

```
State Management Architecture
├── ChatStore (517 lines)
│   ├── Messages state
│   ├── Session management
│   ├── WebSocket integration
│   └── Agent interactions
│
├── NotificationStore (296 lines)
│   ├── Notification queue
│   ├── User preferences
│   ├── Desktop notifications
│   └── Sound alerts
│
└── TooltipStore (61 lines)
    ├── Seen tooltips tracking
    └── Tooltip preferences
```

---

## 1. Chat Store

### File Structure

**Location**: `store/chat-store.ts`
**Lines**: 517 lines
**Dependencies**: Zustand, Supabase, Chat API, WebSocket

### State Interface

```typescript
interface ChatStore {
  // State
  messages: ChatMessage[]              // All chat messages
  session: ChatSession | null          // Current session
  connectionStatus: ChatConnectionStatus // 'connecting' | 'connected' | 'disconnected' | 'error'
  isTyping: boolean                    // User typing indicator
  agentTyping: boolean                 // Agent typing indicator
  activeAgents: AgentInfo[]            // Available agents
  suggestedActions: QuickAction[]      // Suggested quick actions
  currentInvestigation: Investigation | null
  error: string | null
  isLoading: boolean
  ws: ChatWebSocket | null             // WebSocket instance

  // Actions (20+ methods)
  initializeChat: (sessionId?: string) => Promise<void>
  sendMessage: (content: string, useWebSocket?: boolean) => Promise<void>
  sendStreamingMessage: (content: string) => void
  loadChatHistory: (sessionId: string) => Promise<void>
  loadMoreMessages: (cursor: string, direction?: 'next' | 'prev') => Promise<void>
  clearChat: () => Promise<void>
  connectWebSocket: () => void
  disconnectWebSocket: () => void
  setTyping: (isTyping: boolean) => void
  setAgentTyping: (isTyping: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  loadAgents: () => Promise<void>
  loadSuggestions: () => Promise<void>
  subscribeToInvestigation: (investigationId: string) => void
  unsubscribeFromInvestigation: (investigationId: string) => void
  addMessage: (message: ChatMessage) => void
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void
  createNewSession: () => Promise<void>
  loadSession: (sessionId: string) => Promise<void>
  updateSession: (updates: Partial<ChatSession>) => void
}
```

### Key Actions

#### Initialize Chat

```typescript
initializeChat: async (sessionId?: string) => {
  // 1. Try to load existing session if ID provided
  if (sessionId) {
    const session = await chatSessionService.getSession(sessionId)
    if (session) {
      // Restore messages and session state
      set({ session, messages: session.messages })
      await Promise.all([
        get().loadAgents(),
        get().loadSuggestions()
      ])
      return
    }
  }

  // 2. Create new session if no ID or session not found
  await get().createNewSession()

  // 3. Load initial data
  await Promise.all([
    get().loadAgents(),
    get().loadSuggestions()
  ])

  // 4. Set connection status (WebSocket disabled for now)
  set({ connectionStatus: 'disconnected' })
}
```

**Usage**:
```typescript
import { useChatStore } from '@/store/chat-store'

function ChatPage() {
  useEffect(() => {
    // Initialize with existing session
    useChatStore.getState().initializeChat('session_123')

    // Or create new session
    useChatStore.getState().initializeChat()
  }, [])
}
```

#### Send Message

```typescript
sendMessage: async (content: string, useWebSocket = false) => {
  const sessionId = get().session!.session_id

  // 1. Add user message immediately (optimistic update)
  const userMessage: ChatMessage = {
    id: `msg_${Date.now()}`,
    session_id: sessionId,
    role: 'user',
    content,
    timestamp: new Date().toISOString()
  }
  get().addMessage(userMessage)

  // 2. Send to backend
  set({ isLoading: true, error: null })

  try {
    const response = await chatService.sendMessage({
      message: content,
      session_id: sessionId
    })

    // 3. Add assistant response
    const assistantMessage: ChatMessage = {
      id: `msg_${Date.now()}_assistant`,
      session_id: response.session_id,
      role: 'assistant',
      content: response.message,
      agent_id: response.agent_id,
      agent_name: response.agent_name,
      timestamp: new Date().toISOString(),
      metadata: response.metadata
    }
    get().addMessage(assistantMessage)

    // 4. Save to Supabase for persistence
    await chatSessionService.addMessage(sessionId, userMessage)
    await chatSessionService.addMessage(sessionId, assistantMessage)

    // 5. Update suggested actions
    if (response.suggested_actions) {
      set({ suggestedActions: response.suggested_actions.map(...) })
    }
  } catch (error) {
    set({ error: error.message })
  } finally {
    set({ isLoading: false, agentTyping: false })
  }
}
```

**Usage**:
```typescript
const { sendMessage, isLoading, error } = useChatStore()

function ChatInput() {
  const [input, setInput] = useState('')

  const handleSubmit = () => {
    sendMessage(input)
    setInput('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button disabled={isLoading}>Send</button>
      {error && <p>{error}</p>}
    </form>
  )
}
```

#### Load Chat History with Pagination

```typescript
loadMoreMessages: async (cursor: string, direction = 'prev') => {
  const session = get().session
  if (!session) return

  try {
    const response = await chatService.getHistoryPaginated(
      session.session_id,
      cursor,
      20,  // Page size
      direction
    )

    if (response) {
      if (direction === 'prev') {
        // Prepend older messages
        set({ messages: [...response.items, ...get().messages] })
      } else {
        // Append newer messages
        set({ messages: [...get().messages, ...response.items] })
      }
    }
  } catch (error) {
    set({ error: error.message })
  }
}
```

**Usage**:
```typescript
function ChatHistory() {
  const { messages, loadMoreMessages } = useChatStore()

  const loadOlderMessages = () => {
    const firstMessage = messages[0]
    loadMoreMessages(firstMessage.id, 'prev')
  }

  return (
    <div>
      <button onClick={loadOlderMessages}>Load Older</button>
      {messages.map(msg => <Message key={msg.id} {...msg} />)}
    </div>
  )
}
```

### Session Management

#### Create New Session

```typescript
createNewSession: async () => {
  const sessionId = generateSessionId()  // Format: session_timestamp

  set({
    session: {
      session_id: sessionId,
      created_at: new Date().toISOString(),
      metadata: {}
    },
    messages: [],
    currentInvestigation: null
  })

  // Persist to Supabase (fails silently if unavailable)
  try {
    await chatSessionService.createSession({
      session_id: sessionId,
      agent_id: 'abaporu',  // Default to master agent
      metadata: { created_from: 'chat-store' }
    })
  } catch (error) {
    console.error('Failed to create session in Supabase:', error)
    // Continue without persistence - chat works offline
  }
}
```

### WebSocket Integration

```typescript
connectWebSocket: () => {
  // Currently disabled - backend doesn't support WebSocket yet
  console.log('WebSocket skipped - not supported by backend')
  set({ connectionStatus: 'disconnected' })
  return

  /* Future implementation:
  const ws = getChatWebSocket(
    {
      sessionId: state.session.session_id,
      token: localStorage.getItem('auth_token')
    },
    {
      onConnectionStatus: (status) => set({ connectionStatus: status }),
      onChat: (data) => {
        // Handle incoming messages
        const message: ChatMessage = {
          id: `msg_${Date.now()}_ws`,
          session_id: state.session.session_id,
          role: 'assistant',
          content: data.content,
          agent_id: data.agent_id,
          agent_name: data.agent_name,
          timestamp: new Date().toISOString(),
          metadata: data.metadata
        }
        get().addMessage(message)
        set({ agentTyping: false })
      },
      onTyping: (isTyping) => set({ agentTyping: isTyping }),
      onError: (error) => set({ connectionStatus: 'error' })
    }
  )

  ws.connect()
  set({ ws })
  */
}
```

### Selector Patterns

```typescript
// Bad: Re-renders on any state change
const ChatComponent = () => {
  const store = useChatStore()
  return <div>{store.messages.length}</div>
}

// Good: Only re-renders when messages change
const ChatComponent = () => {
  const messageCount = useChatStore(state => state.messages.length)
  return <div>{messageCount}</div>
}

// Best: Multiple selectors with shallow equality
const ChatComponent = () => {
  const { messages, isLoading } = useChatStore(
    state => ({ messages: state.messages, isLoading: state.isLoading }),
    shallow
  )
  return <div>{messages.length} (loading: {isLoading})</div>
}
```

---

## 2. Notification Store

### File Structure

**Location**: `store/notification-store.ts`
**Lines**: 296 lines
**Features**: Desktop notifications, sound alerts, quiet hours

### State Interface

```typescript
interface NotificationStore {
  // State
  notifications: Notification[]
  preferences: NotificationPreferences
  isLoading: boolean
  lastFetch: Date | null

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  addNotifications: (notifications: Notification[]) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void

  // Getters
  getUnreadCount: () => number
  getStats: () => NotificationStats
  getNotificationsByType: (type: NotificationType) => Notification[]
  getNotificationsByPriority: (priority: NotificationPriority) => Notification[]

  // API
  fetchNotifications: () => Promise<void>
  setLoading: (loading: boolean) => void
}
```

### Notification Types

```typescript
type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'investigation'
  | 'anomaly'
  | 'agent'
  | 'system'

type NotificationPriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent'
```

### Preferences Structure

```typescript
interface NotificationPreferences {
  enabled: boolean
  sound: boolean
  desktop: boolean
  email: boolean
  quietHours: {
    enabled: boolean
    start: string  // "22:00"
    end: string    // "08:00"
  }
  types: {
    info: boolean
    success: boolean
    warning: boolean
    error: boolean
    investigation: boolean
    anomaly: boolean
    agent: boolean
    system: boolean
  }
}
```

### Key Actions

#### Add Notification

```typescript
addNotification: (notification) => {
  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    read: false
  }

  // Add to state
  set((state) => ({
    notifications: [newNotification, ...state.notifications]
  }))

  const { preferences } = get()

  // Play sound if enabled
  if (preferences.enabled && preferences.sound && preferences.types[notification.type]) {
    playNotificationSound()
  }

  // Show desktop notification if enabled
  if (preferences.enabled && preferences.desktop && preferences.types[notification.type]) {
    showDesktopNotification(newNotification)
  }
}
```

**Usage**:
```typescript
import { useNotificationStore } from '@/store/notification-store'

function useInvestigationNotifications() {
  const addNotification = useNotificationStore(state => state.addNotification)

  const notifyInvestigationStarted = (investigationId: string, agentName: string) => {
    addNotification({
      type: 'investigation',
      priority: 'high',
      title: 'Nova Investigação Iniciada',
      message: `${agentName} iniciou investigação`,
      investigationId,
      agentId: agentName.toLowerCase()
    })
  }

  const notifyAnomalyDetected = (score: number, contractId: string) => {
    addNotification({
      type: 'anomaly',
      priority: score > 0.9 ? 'urgent' : 'high',
      title: 'Anomalia Detectada',
      message: `Score de ${score.toFixed(2)} em contrato ${contractId}`,
      anomalyScore: score,
      data: { contractId }
    })
  }

  return { notifyInvestigationStarted, notifyAnomalyDetected }
}
```

### Desktop Notifications

```typescript
async function showDesktopNotification(notification: Notification) {
  if (!('Notification' in window)) return

  if (Notification.permission === 'granted') {
    const desktopNotif = new Notification(notification.title, {
      body: notification.message,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: notification.id
    })

    desktopNotif.onclick = () => {
      window.focus()
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl
      }
    }
  } else if (Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}
```

**Request Permission**:
```typescript
function NotificationSettings() {
  const updatePreferences = useNotificationStore(state => state.updatePreferences)

  const enableDesktopNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Seu navegador não suporta notificações')
      return
    }

    const permission = await Notification.requestPermission()

    if (permission === 'granted') {
      updatePreferences({ desktop: true })
    }
  }

  return <button onClick={enableDesktopNotifications}>Ativar Notificações</button>
}
```

### Statistics and Getters

```typescript
getStats: () => {
  const notifications = get().notifications
  const stats: NotificationStats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    byType: {},
    byPriority: {}
  }

  // Initialize counters
  const types = ['info', 'success', 'warning', 'error', 'investigation', 'anomaly', 'agent', 'system']
  const priorities = ['low', 'medium', 'high', 'urgent']

  types.forEach(type => { stats.byType[type] = 0 })
  priorities.forEach(priority => { stats.byPriority[priority] = 0 })

  // Count notifications
  notifications.forEach(n => {
    stats.byType[n.type]++
    stats.byPriority[n.priority]++
  })

  return stats
}
```

**Usage**:
```typescript
function NotificationDashboard() {
  const stats = useNotificationStore(state => state.getStats())

  return (
    <div>
      <h2>Notificações: {stats.total}</h2>
      <p>Não lidas: {stats.unread}</p>

      <h3>Por Tipo</h3>
      <ul>
        {Object.entries(stats.byType).map(([type, count]) => (
          <li key={type}>{type}: {count}</li>
        ))}
      </ul>

      <h3>Por Prioridade</h3>
      <ul>
        {Object.entries(stats.byPriority).map(([priority, count]) => (
          <li key={priority}>{priority}: {count}</li>
        ))}
      </ul>
    </div>
  )
}
```

---

## 3. Tooltip Store

### File Structure

**Location**: `store/tooltip-store.ts`
**Lines**: 61 lines
**Purpose**: Track seen tooltips to avoid showing them repeatedly

### State Interface

```typescript
interface TooltipStore {
  seenTooltips: Set<string>
  hasSeenTooltip: (id: string) => boolean
  markTooltipSeen: (id: string) => void
  resetTooltips: () => void
  tooltipPreferences: {
    enabled: boolean
    level: 'minimal' | 'standard' | 'detailed'
  }
  setTooltipPreferences: (prefs: Partial<TooltipStore['tooltipPreferences']>) => void
}
```

### Key Features

**Set Persistence**:
```typescript
{
  name: 'tooltip-storage',
  partialize: (state) => ({
    seenTooltips: Array.from(state.seenTooltips),  // Convert Set to Array
    tooltipPreferences: state.tooltipPreferences
  }),
  onRehydrateStorage: () => (state) => {
    if (state && Array.isArray(state.seenTooltips)) {
      state.seenTooltips = new Set(state.seenTooltips)  // Restore Set
    }
  }
}
```

**Usage**:
```typescript
import { useTooltipStore } from '@/store/tooltip-store'

function InteractiveTooltip({ id, content }: { id: string, content: string }) {
  const { hasSeenTooltip, markTooltipSeen } = useTooltipStore()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Show tooltip if not seen before
    if (!hasSeenTooltip(id)) {
      setIsOpen(true)
    }
  }, [id, hasSeenTooltip])

  const handleClose = () => {
    setIsOpen(false)
    markTooltipSeen(id)
  }

  if (!isOpen) return null

  return (
    <div className="tooltip">
      <p>{content}</p>
      <button onClick={handleClose}>Got it</button>
    </div>
  )
}
```

---

## Middleware

### DevTools Integration

All stores use the `devtools` middleware for Redux DevTools compatibility:

```typescript
import { devtools } from 'zustand/middleware'

export const useChatStore = create<ChatStore>()(
  devtools(
    (set, get) => ({
      // Store implementation
    }),
    {
      name: 'ChatStore',  // Name in DevTools
      enabled: process.env.NODE_ENV === 'development'
    }
  )
)
```

**Redux DevTools Features**:
- Time-travel debugging
- Action inspection
- State snapshots
- State diff visualization
- Action replay

**Browser Extension**: [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools)

### Persistence

Stores use `persist` middleware for localStorage synchronization:

```typescript
import { persist, createJSONStorage } from 'zustand/middleware'

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      // Store implementation
    }),
    {
      name: 'notification-storage',  // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist specific fields
        notifications: state.notifications.slice(0, 100),  // Last 100 only
        preferences: state.preferences
      })
    }
  )
)
```

**Features**:
- Automatic localStorage sync
- Custom storage adapters (sessionStorage, IndexedDB, etc.)
- Partial state persistence (`partialize`)
- Rehydration callbacks
- Version migration support

**Custom Storage Example** (IndexedDB):
```typescript
import { createJSONStorage } from 'zustand/middleware'

const indexedDBStorage = {
  getItem: async (name: string) => {
    const db = await openDB('zustand-storage')
    return db.get('state', name)
  },
  setItem: async (name: string, value: string) => {
    const db = await openDB('zustand-storage')
    await db.put('state', value, name)
  },
  removeItem: async (name: string) => {
    const db = await openDB('zustand-storage')
    await db.delete('state', name)
  }
}

export const useStore = create(
  persist(
    (set) => ({ ... }),
    {
      name: 'my-store',
      storage: createJSONStorage(() => indexedDBStorage)
    }
  )
)
```

---

## Best Practices

### 1. Selective State Subscription

**Bad** (re-renders on any state change):
```typescript
function ChatComponent() {
  const store = useChatStore()
  return <div>{store.messages.length}</div>
}
```

**Good** (only re-renders when messages change):
```typescript
function ChatComponent() {
  const messageCount = useChatStore(state => state.messages.length)
  return <div>{messageCount}</div>
}
```

**Best** (multiple selectors):
```typescript
import { shallow } from 'zustand/shallow'

function ChatComponent() {
  const { messages, isLoading } = useChatStore(
    state => ({ messages: state.messages, isLoading: state.isLoading }),
    shallow
  )
  return <div>{messages.length} (loading: {isLoading})</div>
}
```

### 2. Action Organization

**Group related actions**:
```typescript
// Message actions
addMessage: (message) => { ... }
updateMessage: (id, updates) => { ... }
removeMessage: (id) => { ... }

// Session actions
createSession: () => { ... }
loadSession: (id) => { ... }
updateSession: (updates) => { ... }

// Agent actions
loadAgents: () => { ... }
subscribeToAgent: (id) => { ... }
```

### 3. TypeScript Types

**Define complete interfaces**:
```typescript
interface ChatStore {
  // State (typed)
  messages: ChatMessage[]
  session: ChatSession | null
  isLoading: boolean

  // Actions (typed)
  sendMessage: (content: string) => Promise<void>
  loadHistory: (sessionId: string) => Promise<ChatMessage[]>
}
```

### 4. Async Actions Pattern

```typescript
// Pattern: Set loading → Try action → Update state → Handle error → Clear loading
fetchData: async () => {
  set({ isLoading: true, error: null })

  try {
    const data = await api.fetchData()
    set({ data, isLoading: false })
  } catch (error) {
    set({ error: error.message, isLoading: false })
  }
}
```

### 5. Computed Values

```typescript
// Don't store computed values in state
// Bad
set({ unreadCount: notifications.filter(n => !n.read).length })

// Good - use getter
getUnreadCount: () => get().notifications.filter(n => !n.read).length

// Or use selector in component
const unreadCount = useNotificationStore(state =>
  state.notifications.filter(n => !n.read).length
)
```

### 6. State Normalization

```typescript
// Bad: Nested arrays
messages: [
  { id: '1', user: { id: 'u1', name: 'Alice' } },
  { id: '2', user: { id: 'u1', name: 'Alice' } }
]

// Good: Normalized
messagesById: {
  '1': { id: '1', userId: 'u1' },
  '2': { id: '2', userId: 'u1' }
},
usersById: {
  'u1': { id: 'u1', name: 'Alice' }
}
```

---

## Testing

### Unit Testing Stores

```typescript
import { renderHook, act } from '@testing-library/react'
import { useChatStore } from './chat-store'

describe('ChatStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useChatStore.setState({
      messages: [],
      session: null,
      isLoading: false
    })
  })

  it('should add message', () => {
    const { result } = renderHook(() => useChatStore())

    act(() => {
      result.current.addMessage({
        id: '1',
        content: 'Hello',
        role: 'user',
        timestamp: new Date().toISOString()
      })
    })

    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].content).toBe('Hello')
  })

  it('should send message', async () => {
    const { result } = renderHook(() => useChatStore())

    await act(async () => {
      await result.current.sendMessage('Test message')
    })

    expect(result.current.messages).toHaveLength(2) // User + Assistant
    expect(result.current.isLoading).toBe(false)
  })
})
```

### Mocking Stores in Tests

```typescript
import { useChatStore } from '@/store/chat-store'

// Mock specific actions
jest.mock('@/store/chat-store', () => ({
  useChatStore: jest.fn((selector) => selector({
    messages: [mockMessage1, mockMessage2],
    sendMessage: jest.fn(),
    isLoading: false
  }))
}))

// Test component
it('renders messages', () => {
  render(<ChatComponent />)
  expect(screen.getByText(mockMessage1.content)).toBeInTheDocument()
})
```

---

## Performance Optimization

### 1. Avoid Unnecessary Re-renders

```typescript
// Bad: Creates new object on every render
const { messages, isLoading } = useChatStore(state => ({
  messages: state.messages,
  isLoading: state.isLoading
}))

// Good: Use shallow comparison
import { shallow } from 'zustand/shallow'

const { messages, isLoading } = useChatStore(
  state => ({ messages: state.messages, isLoading: state.isLoading }),
  shallow
)
```

### 2. Memoize Selectors

```typescript
import { useMemo } from 'react'

function ChatComponent() {
  const messages = useChatStore(state => state.messages)

  const userMessages = useMemo(
    () => messages.filter(m => m.role === 'user'),
    [messages]
  )

  return <div>{userMessages.length} user messages</div>
}
```

### 3. Partial State Updates

```typescript
// Bad: Update entire state object
set({
  messages: [...state.messages, newMessage],
  session: state.session,
  isLoading: false,
  error: null,
  // ... 10 more fields
})

// Good: Only update what changed
set({ messages: [...state.messages, newMessage], isLoading: false })
```

### 4. Debounce Frequent Updates

```typescript
import { debounce } from 'lodash'

const debouncedUpdate = debounce((value: string) => {
  set({ searchQuery: value })
}, 300)

setSearchInput: (value: string) => {
  debouncedUpdate(value)
}
```

---

## Migration Guide

### From Redux to Zustand

**Redux**:
```typescript
// actions.ts
export const addMessage = (message) => ({
  type: 'ADD_MESSAGE',
  payload: message
})

// reducer.ts
case 'ADD_MESSAGE':
  return { ...state, messages: [...state.messages, action.payload] }

// Component
const dispatch = useDispatch()
dispatch(addMessage(newMessage))
```

**Zustand**:
```typescript
// store.ts
addMessage: (message) => set(state => ({
  messages: [...state.messages, message]
}))

// Component
const addMessage = useChatStore(state => state.addMessage)
addMessage(newMessage)
```

**Result**: ~70% less code, same functionality.

---

## Related Documentation

- [Chat Architecture](./chat-architecture-deep-dive.md) - Chat system integration
- [Component API Reference](./component-api-reference.md) - Component patterns
- [Testing Strategy](../guides/TESTING.md) - Testing patterns

---

**Maintained by**: Frontend Team
**Last Review**: 2025-01-25
**Next Review**: 2025-04-25 (Quarterly)
