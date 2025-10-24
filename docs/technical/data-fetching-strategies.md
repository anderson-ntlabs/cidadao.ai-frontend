# Data Fetching Strategies Guide

**Author**: Anderson Henrique da Silva
**Location**: Minas Gerais, Brasil
**Created**: 2025-01-25
**Last Updated**: 2025-01-25

---

## Table of Contents

1. [Overview](#overview)
2. [Rendering Strategies](#rendering-strategies)
3. [Client-Side Rendering (CSR)](#client-side-rendering-csr)
4. [Server Components (RSC)](#server-components-rsc)
5. [Data Fetching Patterns](#data-fetching-patterns)
6. [Caching Strategies](#caching-strategies)
7. [Loading States & Streaming](#loading-states--streaming)
8. [Error Handling](#error-handling)
9. [Performance Optimization](#performance-optimization)
10. [Best Practices](#best-practices)
11. [Migration Guide](#migration-guide)

---

## Overview

Cidadão.AI uses **Next.js 15 App Router** with a hybrid rendering approach, strategically combining Client-Side Rendering (CSR) and React Server Components (RSC) based on data requirements and user interaction patterns.

### Technology Stack

- **Framework**: Next.js 15.1.0 (App Router)
- **React**: 19.x with Server Components
- **State Management**: Zustand 5.0.2 with persistence
- **Data Fetching**: Axios 1.7.9, native fetch, SWR patterns
- **Caching**: Multi-layer (memory, localStorage, IndexedDB)
- **Streaming**: Server-Sent Events (SSE) for real-time updates

### Architectural Decision

```
┌────────────────────────────────────────────────────────────────┐
│                      RENDERING DECISION TREE                    │
└────────────────────────────────────────────────────────────────┘

Does the page need user interaction or browser APIs?
│
├─ YES → Client Component ('use client')
│   │
│   ├─ Is data static or changes rarely?
│   │   └─ Fetch once on mount (useEffect)
│   │
│   ├─ Is data user-specific or real-time?
│   │   └─ Fetch from Zustand store + API
│   │
│   └─ Is data streaming or progressive?
│       └─ Use SSE with progressive updates
│
└─ NO → Server Component (default)
    │
    ├─ Is data public and cacheable?
    │   └─ Use native fetch with cache options
    │
    └─ Is data dynamic per-request?
        └─ Use fetch with cache: 'no-store'
```

### Current Project Status

**All pages are currently Client Components** (`'use client'`):
- ✅ **Reason**: Heavy use of Zustand state management
- ✅ **Reason**: Real-time chat with SSE streaming
- ✅ **Reason**: Interactive maps and visualizations
- ✅ **Reason**: Browser APIs (localStorage, WebSocket future)

**Future Opportunity**: Migrate static pages (About, Privacy, Terms) to Server Components for better SEO and initial load performance.

---

## Rendering Strategies

### 1. Client-Side Rendering (CSR)

**Current Primary Strategy** - Used for all interactive pages.

#### Characteristics

- **Execution**: JavaScript runs in the browser
- **Hydration**: Full React tree sent to client
- **Interactivity**: Immediate (no hydration delay)
- **SEO**: Limited (content rendered client-side)
- **Data Fetching**: useEffect, Zustand stores, React Query patterns

#### When to Use CSR

✅ **Use CSR when**:
- Page requires user authentication (protected routes)
- Frequent user interactions (forms, real-time updates)
- Browser APIs needed (localStorage, geolocation, WebSocket)
- State management across multiple components
- Real-time data streaming (chat, notifications)

❌ **Avoid CSR for**:
- Static marketing pages (About, Privacy, Terms)
- Public blog posts or documentation
- Landing pages focused on SEO
- Pages with minimal interactivity

#### CSR Implementation

```tsx
// app/pt/(authenticated)/chat/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useChatStore } from '@/store/chat-store'
import { useAuth } from '@/hooks/use-supabase-auth'

export default function ChatPage() {
  const { user } = useAuth()
  const messages = useChatStore((state) => state.messages)
  const sendMessage = useChatStore((state) => state.sendMessage)
  const [inputMessage, setInputMessage] = useState('')

  // Client-side data fetching
  useEffect(() => {
    // Initialize chat session
    initializeChat()
  }, [])

  const handleSendMessage = async () => {
    await sendMessage(inputMessage, false)
    setInputMessage('')
  }

  return (
    <div>
      {/* Interactive UI */}
      <ChatInterface messages={messages} onSend={handleSendMessage} />
    </div>
  )
}
```

### 2. React Server Components (RSC)

**Future Strategy** - Recommended for static/public pages.

#### Characteristics

- **Execution**: React runs on the server
- **Payload**: Only HTML + minimal JS sent to client
- **Data Fetching**: Direct database/API access (no client exposure)
- **SEO**: Excellent (HTML generated server-side)
- **Performance**: Faster initial load, smaller bundle

#### When to Use RSC

✅ **Use RSC when**:
- Content is static or changes infrequently
- SEO is critical (landing pages, blog posts)
- No user interaction required
- Data can be fetched server-side
- Want to reduce client bundle size

❌ **Avoid RSC for**:
- Pages requiring browser APIs
- Real-time interactive features
- Client-side state management needed
- Forms with complex validation

#### RSC Implementation (Example)

```tsx
// app/pt/about/page.tsx (CURRENT - could stay RSC)
// Note: No 'use client' directive

import { Metadata } from 'next'

// Metadata for SEO (server-side only)
export const metadata: Metadata = {
  title: 'Sobre o Cidadão.AI',
  description: 'Plataforma de transparência pública com inteligência artificial',
  openGraph: {
    title: 'Sobre o Cidadão.AI',
    description: 'Democratizando o acesso aos dados governamentais brasileiros',
  },
}

// Server Component (async allowed)
export default async function AboutPage() {
  // Could fetch data server-side if needed
  // const stats = await fetch('https://api.example.com/stats', {
  //   cache: 'force-cache', // Static data
  // }).then(res => res.json())

  return (
    <div>
      <h1>Sobre o Cidadão.AI</h1>
      <p>Projeto acadêmico inovador...</p>
      {/* Static content - no interactivity needed */}
    </div>
  )
}
```

#### RSC with Data Fetching

```tsx
// Example: Blog post page (future implementation)
// app/pt/blog/[slug]/page.tsx

interface BlogPost {
  title: string
  content: string
  publishedAt: string
}

async function getPost(slug: string): Promise<BlogPost> {
  // Server-side data fetching (no client exposure)
  const res = await fetch(`https://api.example.com/posts/${slug}`, {
    next: { revalidate: 3600 }, // Revalidate every hour
  })

  if (!res.ok) {
    throw new Error('Failed to fetch post')
  }

  return res.json()
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPost(params.slug)

  return (
    <article>
      <h1>{post.title}</h1>
      <time dateTime={post.publishedAt}>
        {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
      </time>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}

// Generate static params at build time
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then(res =>
    res.json()
  )

  return posts.map((post: { slug: string }) => ({
    slug: post.slug,
  }))
}
```

### 3. Hybrid Approach (Recommended)

Combine Server and Client Components for optimal performance.

```tsx
// app/pt/dashboard/page.tsx
// Server Component (default - no 'use client')

import { UserStats } from '@/components/user-stats'
import { InteractiveChart } from '@/components/interactive-chart'

async function getServerStats(userId: string) {
  // Server-side data fetching
  const res = await fetch(`https://api.example.com/stats/${userId}`, {
    cache: 'no-store', // Dynamic data
  })
  return res.json()
}

export default async function DashboardPage() {
  const serverStats = await getServerStats('user_123')

  return (
    <div>
      {/* Server Component - static data */}
      <UserStats stats={serverStats} />

      {/* Client Component - interactive */}
      <InteractiveChart initialData={serverStats} />
    </div>
  )
}
```

```tsx
// components/interactive-chart.tsx
'use client'

import { useState, useEffect } from 'react'
import { LineChart } from '@/components/charts/line-chart'

export function InteractiveChart({ initialData }: { initialData: any }) {
  const [data, setData] = useState(initialData)
  const [timeRange, setTimeRange] = useState('7d')

  // Client-side interactivity
  useEffect(() => {
    // Fetch updated data when timeRange changes
    fetchData(timeRange).then(setData)
  }, [timeRange])

  return (
    <div>
      <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
      </select>
      <LineChart data={data} />
    </div>
  )
}
```

---

## Client-Side Rendering (CSR)

### Data Fetching with useEffect

**Pattern**: Fetch data when component mounts.

```tsx
'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api/client'
import type { Agent } from '@/types/agent'

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const { data, error } = await api.get<Agent[]>('/api/v1/agents')

        if (error) {
          setError(error.message)
        } else {
          setAgents(data || [])
        }
      } catch (err) {
        setError('Failed to fetch agents')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAgents()
  }, [])

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div>
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  )
}
```

### Data Fetching with Zustand Store

**Pattern**: Centralized state management with data fetching logic in store.

```tsx
// store/chat-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { smartChatService } from '@/lib/services/smart-chat.service'

interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  sendMessage: (text: string, streaming: boolean) => Promise<void>
  loadSession: (sessionId: string) => Promise<void>
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      error: null,

      sendMessage: async (text: string, streaming: boolean) => {
        set({ isLoading: true, error: null })

        try {
          const response = await smartChatService.sendMessage(text, {
            streaming,
            onProgress: (accumulated) => {
              // Real-time UI updates
              set((state) => ({
                messages: [
                  ...state.messages,
                  {
                    id: 'streaming',
                    role: 'assistant',
                    content: accumulated,
                    timestamp: new Date().toISOString(),
                  },
                ],
              }))
            },
          })

          set((state) => ({
            messages: [
              ...state.messages.filter((m) => m.id !== 'streaming'),
              {
                id: response.session_id,
                role: 'assistant',
                content: response.message,
                agent_id: response.agent_id,
                timestamp: new Date().toISOString(),
              },
            ],
            isLoading: false,
          }))
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          })
        }
      },

      loadSession: async (sessionId: string) => {
        set({ isLoading: true, error: null })

        try {
          const { data, error } = await api.get(`/api/v1/chat/${sessionId}/messages`)

          if (error) {
            set({ error: error.message, isLoading: false })
          } else {
            set({ messages: data || [], isLoading: false })
          }
        } catch (error) {
          set({
            error: 'Failed to load session',
            isLoading: false,
          })
        }
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        messages: state.messages,
      }),
    }
  )
)
```

```tsx
// Component using Zustand store
'use client'

import { useChatStore } from '@/store/chat-store'

export default function ChatPage() {
  const messages = useChatStore((state) => state.messages)
  const sendMessage = useChatStore((state) => state.sendMessage)
  const isLoading = useChatStore((state) => state.isLoading)
  const error = useChatStore((state) => state.error)

  const handleSend = async (text: string) => {
    await sendMessage(text, true)
  }

  return (
    <div>
      <MessageList messages={messages} />
      {isLoading && <TypingIndicator />}
      {error && <ErrorBanner message={error} />}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  )
}
```

### Custom Hooks for Data Fetching

**Pattern**: Encapsulate fetching logic in reusable hooks.

```tsx
// hooks/use-investigations.ts
import { useState, useEffect } from 'react'
import { investigationService } from '@/lib/services/investigation.service'
import type { Investigation } from '@/types/supabase'

export function useInvestigations(status?: 'active' | 'completed' | 'archived') {
  const [investigations, setInvestigations] = useState<Investigation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvestigations = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await investigationService.getUserInvestigations(status)
        setInvestigations(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch investigations')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvestigations()
  }, [status])

  const refetch = async () => {
    const data = await investigationService.getUserInvestigations(status)
    setInvestigations(data)
  }

  return {
    investigations,
    isLoading,
    error,
    refetch,
  }
}
```

```tsx
// Component using custom hook
'use client'

import { useInvestigations } from '@/hooks/use-investigations'

export default function InvestigationsPage() {
  const { investigations, isLoading, error, refetch } = useInvestigations('active')

  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  return (
    <div>
      <h1>Active Investigations</h1>
      <button onClick={refetch}>Refresh</button>
      {investigations.map((inv) => (
        <InvestigationCard key={inv.id} investigation={inv} />
      ))}
    </div>
  )
}
```

---

## Server Components (RSC)

### Basic Server Component

```tsx
// app/pt/privacy/page.tsx
// No 'use client' - default is Server Component

export default function PrivacyPage() {
  return (
    <div>
      <h1>Privacy Policy</h1>
      <p>Static content...</p>
    </div>
  )
}
```

### Server Component with Data Fetching

```tsx
// Example: Agents list (could be Server Component)
// app/pt/agents-server/page.tsx

import { api } from '@/lib/api/client'
import type { Agent } from '@/types/agent'

async function getAgents(): Promise<Agent[]> {
  const response = await fetch('https://cidadao-api-production.up.railway.app/api/v1/agents', {
    next: { revalidate: 3600 }, // Cache for 1 hour
  })

  if (!response.ok) {
    throw new Error('Failed to fetch agents')
  }

  return response.json()
}

export default async function AgentsPage() {
  const agents = await getAgents()

  return (
    <div>
      <h1>AI Agents</h1>
      <div className="grid grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div key={agent.id} className="border p-4 rounded">
            <h2>{agent.name}</h2>
            <p>{agent.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Loading UI with Suspense

```tsx
// app/pt/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
    </div>
  )
}
```

```tsx
// app/pt/dashboard/page.tsx
import { Suspense } from 'react'

async function DashboardStats() {
  const stats = await fetch('https://api.example.com/stats', {
    cache: 'no-store',
  }).then((res) => res.json())

  return (
    <div>
      <h2>Statistics</h2>
      <pre>{JSON.stringify(stats, null, 2)}</pre>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<div>Loading stats...</div>}>
        <DashboardStats />
      </Suspense>
    </div>
  )
}
```

### Error Handling in Server Components

```tsx
// app/pt/agents/error.tsx
'use client' // Error components must be Client Components

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Agents page error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
```

---

## Data Fetching Patterns

### 1. Fetch on Mount (useEffect)

**Use case**: Load data when component first renders.

```tsx
'use client'

import { useState, useEffect } from 'react'

export function DataComponent() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/data')
      .then((res) => res.json())
      .then(setData)
  }, [])

  return <div>{data ? JSON.stringify(data) : 'Loading...'}</div>
}
```

**Pros**:
- ✅ Simple and straightforward
- ✅ Works in all environments

**Cons**:
- ❌ Causes re-render (loading → data)
- ❌ No automatic caching
- ❌ Network waterfall if nested

### 2. Fetch in Event Handler

**Use case**: Load data in response to user action.

```tsx
'use client'

import { useState } from 'react'

export function SearchComponent() {
  const [results, setResults] = useState([])
  const [query, setQuery] = useState('')

  const handleSearch = async () => {
    const res = await fetch(`/api/search?q=${query}`)
    const data = await res.json()
    setResults(data)
  }

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <button onClick={handleSearch}>Search</button>
      <ul>
        {results.map((r) => (
          <li key={r.id}>{r.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

**Pros**:
- ✅ Only fetches when needed
- ✅ User controls timing

**Cons**:
- ❌ Requires user action
- ❌ No pre-fetching

### 3. Fetch in Zustand Action

**Use case**: Centralized data fetching with global state.

```tsx
// store/agents-store.ts
import { create } from 'zustand'
import { api } from '@/lib/api/client'

interface AgentsState {
  agents: Agent[]
  isLoading: boolean
  fetchAgents: () => Promise<void>
}

export const useAgentsStore = create<AgentsState>((set) => ({
  agents: [],
  isLoading: false,

  fetchAgents: async () => {
    set({ isLoading: true })

    try {
      const { data } = await api.get<Agent[]>('/api/v1/agents')
      set({ agents: data || [], isLoading: false })
    } catch (error) {
      console.error('Failed to fetch agents:', error)
      set({ isLoading: false })
    }
  },
}))
```

**Pros**:
- ✅ Centralized logic
- ✅ Shared across components
- ✅ Easy to test

**Cons**:
- ❌ Requires store setup
- ❌ Can grow complex

### 4. Server-Side Fetch (RSC)

**Use case**: Fetch data server-side for SEO and performance.

```tsx
// Server Component
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  })

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  return res.json()
}

export default async function Page() {
  const data = await getData()

  return <div>{JSON.stringify(data)}</div>
}
```

**Pros**:
- ✅ SEO-friendly (HTML generated server-side)
- ✅ Faster initial render
- ✅ Can use private APIs (no client exposure)

**Cons**:
- ❌ Can't use browser APIs
- ❌ No client interactivity without 'use client'

### 5. Streaming with SSE

**Use case**: Real-time progressive updates (chat, notifications).

```tsx
'use client'

import { useState } from 'react'
import { smartChatService } from '@/lib/services/smart-chat.service'

export function StreamingChat() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')

  const handleSend = async () => {
    setResponse('')

    await smartChatService.sendMessage(message, {
      streaming: true,
      onProgress: (accumulated) => {
        setResponse(accumulated)
      },
    })
  }

  return (
    <div>
      <input value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={handleSend}>Send</button>
      <div className="response">{response}</div>
    </div>
  )
}
```

**Pros**:
- ✅ Real-time updates
- ✅ Progressive rendering
- ✅ Better UX for long operations

**Cons**:
- ❌ Requires SSE support
- ❌ More complex implementation

---

## Caching Strategies

### 1. Next.js fetch() Caching

**Server Components only** - Built-in caching with revalidation.

```tsx
// Cache forever (default)
fetch('https://api.example.com/data')

// Revalidate every hour
fetch('https://api.example.com/data', {
  next: { revalidate: 3600 },
})

// No caching (dynamic data)
fetch('https://api.example.com/data', {
  cache: 'no-store',
})

// Force cache (static data)
fetch('https://api.example.com/data', {
  cache: 'force-cache',
})
```

### 2. Client-Side Caching (Manual)

**Current implementation** - Three-layer caching.

```tsx
// Layer 1: Memory cache (fastest)
const memoryCache = new Map<string, { data: any; expiresAt: number }>()

function getCached(key: string) {
  const entry = memoryCache.get(key)
  if (entry && Date.now() < entry.expiresAt) {
    return entry.data
  }
  return null
}

function setCache(key: string, data: any, ttl: number) {
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttl,
  })
}

// Layer 2: localStorage (persistent)
function getFromLocalStorage(key: string) {
  const cached = localStorage.getItem(key)
  if (!cached) return null

  const { data, timestamp } = JSON.parse(cached)
  const age = Date.now() - timestamp

  if (age < 6 * 60 * 60 * 1000) {
    // 6 hours
    return data
  }

  return null
}

// Layer 3: IndexedDB (large data)
import { get, set } from 'idb-keyval'

async function getFromIDB(key: string) {
  const entry = await get(key)
  if (!entry) return null

  const { data, expiresAt } = entry
  if (Date.now() < expiresAt) {
    return data
  }

  return null
}
```

### 3. Stale-While-Revalidate (SWR)

**Pattern**: Return stale data immediately, fetch fresh in background.

```tsx
'use client'

import { useState, useEffect } from 'react'

function useSWR<T>(key: string, fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  useEffect(() => {
    // Return cached data immediately
    const cached = getFromCache(key)
    if (cached) {
      setData(cached)
    }

    // Fetch fresh data in background
    setIsValidating(true)
    fetcher()
      .then((fresh) => {
        setData(fresh)
        setCache(key, fresh, 60000)
      })
      .finally(() => setIsValidating(false))
  }, [key])

  return { data, isValidating }
}

// Usage
export function UserProfile() {
  const { data: user, isValidating } = useSWR('user-profile', () =>
    fetch('/api/user').then((res) => res.json())
  )

  return (
    <div>
      {user && <div>{user.name}</div>}
      {isValidating && <span>Updating...</span>}
    </div>
  )
}
```

---

## Loading States & Streaming

### 1. Loading States

**Simple Loading**:

```tsx
'use client'

import { useState, useEffect } from 'react'

export function DataComponent() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/data')
      .then((res) => res.json())
      .then((data) => {
        setData(data)
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <div>{JSON.stringify(data)}</div>
}
```

**Skeleton Loading**:

```tsx
export function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  )
}

export function DataComponent() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // ... fetch logic

  if (isLoading) {
    return <SkeletonLoader />
  }

  return <DataDisplay data={data} />
}
```

### 2. Progressive Streaming

**SSE-based streaming**:

```tsx
'use client'

import { useState } from 'react'

export function StreamingResponse() {
  const [text, setText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  const startStreaming = async () => {
    setIsStreaming(true)
    setText('')

    const eventSource = new EventSource('/api/stream')

    eventSource.onmessage = (event) => {
      const chunk = JSON.parse(event.data)
      setText((prev) => prev + chunk.text)
    }

    eventSource.onerror = () => {
      eventSource.close()
      setIsStreaming(false)
    }

    eventSource.addEventListener('complete', () => {
      eventSource.close()
      setIsStreaming(false)
    })
  }

  return (
    <div>
      <button onClick={startStreaming} disabled={isStreaming}>
        Start Stream
      </button>
      <div className="whitespace-pre-wrap">{text}</div>
      {isStreaming && <span className="animate-pulse">▌</span>}
    </div>
  )
}
```

---

## Error Handling

### 1. Try-Catch Pattern

```tsx
'use client'

import { useState, useEffect } from 'react'

export function DataComponent() {
  const [data, setData] = useState(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data')

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }

        const data = await res.json()
        setData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) return <div>Loading...</div>
  if (error) return <ErrorState message={error} />

  return <div>{JSON.stringify(data)}</div>
}
```

### 2. Error Boundaries

```tsx
// components/error-boundary.tsx
'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 border border-red-500 rounded bg-red-50">
            <h2 className="text-red-700 font-bold">Something went wrong</h2>
            <p className="text-red-600">{this.state.error?.message}</p>
          </div>
        )
      )
    }

    return this.props.children
  }
}
```

```tsx
// Usage
export default function Page() {
  return (
    <ErrorBoundary fallback={<div>Custom error UI</div>}>
      <DataComponent />
    </ErrorBoundary>
  )
}
```

---

## Performance Optimization

### 1. Code Splitting

**Dynamic imports**:

```tsx
import dynamic from 'next/dynamic'

// Load component only when needed
const HeavyChart = dynamic(() => import('@/components/charts/heavy-chart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false, // Disable SSR for this component
})

export function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <HeavyChart data={[]} />
    </div>
  )
}
```

### 2. Prefetching

**Route prefetching**:

```tsx
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function Navigation() {
  const router = useRouter()

  useEffect(() => {
    // Prefetch routes user might visit
    router.prefetch('/pt/dashboard')
    router.prefetch('/pt/chat')
  }, [router])

  return <nav>{/* Navigation links */}</nav>
}
```

### 3. Request Deduplication

```tsx
const pendingRequests = new Map<string, Promise<any>>()

async function fetchWithDeduplication<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  // Check if request is already in flight
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!
  }

  // Start new request
  const promise = fetcher().finally(() => {
    pendingRequests.delete(key)
  })

  pendingRequests.set(key, promise)
  return promise
}

// Usage
const agents = await fetchWithDeduplication('agents', () =>
  fetch('/api/v1/agents').then((res) => res.json())
)
```

---

## Best Practices

### 1. Choose the Right Rendering Strategy

```typescript
// Decision flowchart
if (needsInteractivity || usesBrowserAPIs) {
  return 'Client Component'
} else if (needsSEO || staticContent) {
  return 'Server Component'
} else {
  return 'Hybrid (Server + Client islands)'
}
```

### 2. Implement Proper Loading States

❌ **Bad**:
```tsx
const [data, setData] = useState(null)

// No loading state - user sees nothing
return <div>{data && JSON.stringify(data)}</div>
```

✅ **Good**:
```tsx
const [data, setData] = useState(null)
const [isLoading, setIsLoading] = useState(true)

if (isLoading) return <SkeletonLoader />
return <div>{JSON.stringify(data)}</div>
```

### 3. Handle Errors Gracefully

✅ **Always provide**:
- Error message
- Retry mechanism
- Fallback UI

```tsx
if (error) {
  return (
    <div className="error-state">
      <p>Error: {error.message}</p>
      <button onClick={refetch}>Try Again</button>
    </div>
  )
}
```

### 4. Cache Intelligently

```tsx
// Cache static data aggressively
const agents = await fetchWithCache(
  'agents',
  () => api.get('/api/v1/agents'),
  60 * 60 * 1000 // 1 hour
)

// Don't cache user-specific data
const messages = await api.get(`/api/v1/chat/${sessionId}/messages`)
```

### 5. Use Streaming for Long Operations

```tsx
// For long-running operations, use streaming
const response = await smartChatService.sendMessage(query, {
  streaming: true,
  onProgress: (text) => {
    // Update UI progressively
    setPartialResponse(text)
  },
})
```

---

## Migration Guide

### Converting Client to Server Component

**Before** (Client Component):
```tsx
'use client'

import { useState, useEffect } from 'react'

export default function AboutPage() {
  const [content, setContent] = useState('')

  useEffect(() => {
    fetch('/api/about')
      .then((res) => res.json())
      .then(setContent)
  }, [])

  return <div>{content}</div>
}
```

**After** (Server Component):
```tsx
// Remove 'use client'

async function getAboutContent() {
  const res = await fetch('https://api.example.com/about', {
    next: { revalidate: 3600 },
  })
  return res.json()
}

export default async function AboutPage() {
  const content = await getAboutContent()

  return <div>{content}</div>
}
```

### Extracting Interactive Parts

**Before** (All client-side):
```tsx
'use client'

import { useState } from 'react'

export default function DashboardPage() {
  const [filter, setFilter] = useState('all')

  return (
    <div>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="all">All</option>
        <option value="active">Active</option>
      </select>
      <DataTable filter={filter} />
    </div>
  )
}
```

**After** (Hybrid):
```tsx
// Server Component (default)
import { FilterSelect } from '@/components/filter-select'
import { DataTable } from '@/components/data-table'

async function getData() {
  // Server-side fetch
  return fetch('https://api.example.com/data').then((res) => res.json())
}

export default async function DashboardPage() {
  const data = await getData()

  return (
    <div>
      {/* Client Component for interactivity */}
      <FilterSelect />
      {/* Server Component for static rendering */}
      <DataTable data={data} />
    </div>
  )
}
```

```tsx
// components/filter-select.tsx
'use client'

import { useState } from 'react'

export function FilterSelect() {
  const [filter, setFilter] = useState('all')

  return (
    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
      <option value="all">All</option>
      <option value="active">Active</option>
    </select>
  )
}
```

---

## Summary

### Current Project State

- **All pages**: Client Components (`'use client'`)
- **Data fetching**: useEffect + Zustand stores
- **Caching**: Three-layer (memory, localStorage, IndexedDB)
- **Streaming**: SSE for real-time chat

### Recommended Next Steps

1. **Migrate static pages to Server Components**:
   - `/pt/about` → Server Component (SEO)
   - `/pt/privacy` → Server Component (SEO)
   - `/pt/terms` → Server Component (SEO)

2. **Implement hybrid rendering**:
   - `/pt/agents` → Server Component (list) + Client Component (filters)
   - `/pt/dashboard` → Server Component (stats) + Client Component (charts)

3. **Add Suspense boundaries**:
   - Wrap slow components in `<Suspense>`
   - Provide loading fallbacks

4. **Optimize caching**:
   - Use Next.js fetch() caching in Server Components
   - Keep client-side cache for interactive data

### Key Takeaways

1. ✅ **Use Server Components by default** (when no interactivity needed)
2. ✅ **Use Client Components for interactivity** (forms, real-time, browser APIs)
3. ✅ **Combine both in hybrid approach** for optimal performance
4. ✅ **Implement proper loading states** (skeletons, spinners)
5. ✅ **Cache intelligently** based on data volatility
6. ✅ **Stream long operations** for better UX
7. ✅ **Handle errors gracefully** with fallbacks and retry

---

**Document Status**: ✅ Complete
**Coverage**: Comprehensive - All data fetching strategies documented
**Last Review**: 2025-01-25
**Next Review**: 2025-04-25
