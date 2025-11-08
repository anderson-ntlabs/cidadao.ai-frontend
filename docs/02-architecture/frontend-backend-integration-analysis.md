# Frontend-Backend Integration Analysis

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data de Criação**: 2025-10-22 15:15:00 -0300
**Status**: 🔄 IN PROGRESS

---

## Executive Summary

This document analyzes all frontend flows and their integration with backend services, identifying gaps, opportunities, and creating a roadmap for optimal integration.

### Current Status

- ✅ **Chat**: Fully integrated with streaming
- ⚠️ **Investigations**: Partial integration
- ❌ **Dashboard**: Mock data only
- ❌ **Reports**: Not integrated
- ❌ **Notifications**: Not integrated
- ❌ **Export**: Not integrated

---

## Frontend Flows Inventory

### 1. 🔐 Authentication Flow

**Pages**: `/pt/login`

**Current Implementation**:

- ✅ Supabase OAuth (Google/GitHub)
- ✅ Session management with cookies
- ✅ Protected routes via AuthLayout

**Backend Integration**:

```
Frontend (Supabase)  →  No backend auth needed currently
                         (OAuth handled by Supabase)
```

**Status**: ✅ **COMPLETE**

**Potential Enhancement**:

- Could integrate with backend `/api/v1/auth/oauth/*` for centralized auth
- Benefit: Single source of truth for user permissions
- Trade-off: Added complexity vs. Supabase simplicity

---

### 2. 💬 Chat Flow

**Pages**: `/pt/(authenticated)/chat`

**Current Implementation**:

- ✅ Real-time streaming via SSE
- ✅ Multi-agent orchestration
- ✅ Session persistence (Zustand)
- ✅ Message history
- ✅ Suggestions system

**Backend Integration**:

```
POST /api/v1/chat/stream        ← Main chat endpoint (✅ INTEGRATED)
POST /api/v1/chat/message       ← Non-streaming fallback (✅ INTEGRATED)
GET  /api/v1/chat/suggestions   ← Quick actions (❌ NOT USED)
GET  /api/v1/chat/history/*     ← History management (❌ NOT USED)
GET  /api/v1/chat/agents        ← Agent list (❌ NOT USED)
```

**Status**: 🟡 **PARTIAL** (70% integrated)

**Gaps**:

1. ❌ Not using backend chat history endpoints
2. ❌ Not fetching agents dynamically from backend
3. ❌ Not using suggestions API
4. ❌ No cache stats monitoring

**Implementation Opportunities**:

#### A. Backend Chat History

```typescript
// Current: localStorage only
const sessions = useChatStore((state) => state.sessions)

// Proposed: Sync with backend
async function loadChatHistory(sessionId: string) {
  const response = await fetch(`${API_URL}/api/v1/chat/history/${sessionId}`)
  return response.json()
}
```

**Benefits**:

- ✅ Cross-device history
- ✅ No data loss on cache clear
- ✅ Searchable conversations
- ✅ Analytics on user queries

#### B. Dynamic Agent Loading

```typescript
// Current: Static agents from data/agents.ts
import { agents } from '@/data/agents'

// Proposed: Fetch from backend
async function fetchAgents() {
  const response = await fetch(`${API_URL}/api/v1/chat/agents`)
  return response.json()
}
```

**Benefits**:

- ✅ Dynamic agent updates
- ✅ Agent availability status
- ✅ Performance metrics per agent
- ✅ A/B testing capabilities

#### C. Smart Suggestions

```typescript
// Current: Hardcoded suggestions
const suggestions = ['Investigar contratos suspeitos', 'Analisar anomalias']

// Proposed: Context-aware from backend
async function getSuggestions() {
  const response = await fetch(`${API_URL}/api/v1/chat/suggestions`)
  return response.json()
}
```

**Benefits**:

- ✅ Personalized to user context
- ✅ Learn from interaction patterns
- ✅ Higher engagement rates

---

### 3. 🏠 Home/Dashboard Flow

**Pages**:

- `/pt/(authenticated)/home`
- `/pt/(authenticated)/dashboard`

**Current Implementation**:

- ❌ **Mock data only**
- Static cards with fake metrics
- No real integration

**Backend Integration Available**:

```
GET  /api/v1/investigations/              ← User investigations list
GET  /api/v1/analysis/                    ← User analyses
GET  /api/v1/reports/                     ← Generated reports
GET  /api/v1/audit/dashboard              ← Dashboard data
GET  /api/v1/notifications/unread-count   ← Notification count
```

**Status**: ❌ **NOT INTEGRATED** (0%)

**Proposed Architecture**:

```typescript
// Dashboard Data Service
export class DashboardService {
  async fetchDashboardData(userId: string) {
    const [investigations, analyses, reports, notifications] = await Promise.all([
      this.fetchInvestigations(),
      this.fetchAnalyses(),
      this.fetchReports(),
      this.fetchNotifications(),
    ])

    return {
      investigations: {
        total: investigations.length,
        active: investigations.filter((i) => i.status === 'running').length,
        completed: investigations.filter((i) => i.status === 'completed').length,
      },
      analyses: {
        total: analyses.length,
        trends: analyses.filter((a) => a.type === 'trend').length,
      },
      reports: {
        total: reports.length,
        recent: reports.slice(0, 5),
      },
      notifications: {
        unread: notifications.unread_count,
      },
    }
  }
}
```

**Key Metrics to Display**:

1. **Investigations**
   - Active investigations count
   - Completion rate
   - Average time to complete
   - Anomalies detected (total)

2. **Recent Activity**
   - Last 5 investigations
   - Last 5 reports generated
   - Last 5 analyses

3. **Performance**
   - Response time trends
   - Success rate
   - Cache hit ratio

4. **Transparency Data**
   - Contracts analyzed
   - Total value investigated
   - Anomalies severity distribution

---

### 4. 🔍 Investigations Flow

**Pages**: `/pt/(authenticated)/investigacoes`

**Current Implementation**:

- ❌ **Not implemented yet**
- Placeholder page only

**Backend Integration Available**:

```
POST   /api/v1/investigations/start              ← Create investigation
GET    /api/v1/investigations/                   ← List investigations
GET    /api/v1/investigations/{id}/status        ← Progress tracking
GET    /api/v1/investigations/{id}/results       ← Results
GET    /api/v1/investigations/stream/{id}        ← Real-time streaming
DELETE /api/v1/investigations/{id}               ← Cancel
POST   /api/v1/export/investigations/{id}/download ← Export
```

**Status**: ❌ **NOT IMPLEMENTED** (0%)

**Proposed User Journey**:

```
1. User clicks "Nova Investigação"
   ↓
2. Form with filters:
   - Órgão governamental
   - Período (data início/fim)
   - Tipo de análise (anomalias, padrões, tendências)
   - Threshold de confiança
   ↓
3. POST /api/v1/investigations/start
   ↓
4. Real-time progress via SSE:
   GET /api/v1/investigations/stream/{id}
   ↓
5. Results displayed:
   - Anomalies found
   - Confidence scores
   - Visualizations
   - Recommendations
   ↓
6. Actions available:
   - Export results
   - Generate report
   - Share investigation
   - Create alert rules
```

**UI Components Needed**:

#### A. Investigation Form

```typescript
interface InvestigationForm {
  name: string
  description: string
  filters: {
    agency: string // Órgão
    startDate: Date
    endDate: Date
    threshold: number // 0-1 confidence
  }
  analysisTypes: Array<'anomalies' | 'patterns' | 'trends'>
}
```

#### B. Progress Tracker

```typescript
interface InvestigationProgress {
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number // 0-100
  currentStep: string // "Analyzing contracts..."
  stepsCompleted: number
  totalSteps: number
  estimatedTimeRemaining: number // seconds
}
```

#### C. Results Display

```typescript
interface InvestigationResults {
  summary: {
    totalRecordsAnalyzed: number
    anomaliesDetected: number
    patternsFound: number
    averageConfidence: number
  }
  anomalies: Array<{
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    confidence: number
    description: string
    affectedContracts: string[]
    estimatedImpact: number
  }>
  visualizations: {
    timeSeriesChart: ChartData
    severityDistribution: ChartData
    agencyComparison: ChartData
  }
  recommendations: string[]
}
```

---

### 5. 📊 Reports Flow

**Pages**: Currently no dedicated page

**Backend Integration Available**:

```
POST   /api/v1/reports/generate           ← Create report
GET    /api/v1/reports/templates          ← Available templates
GET    /api/v1/reports/{id}/status        ← Generation progress
GET    /api/v1/reports/{id}               ← Retrieve report
GET    /api/v1/reports/{id}/download      ← Download file
DELETE /api/v1/reports/{id}               ← Remove
GET    /api/v1/reports/                   ← List reports
```

**Status**: ❌ **NOT IMPLEMENTED** (0%)

**Proposed Integration**:

#### A. Report Generation Modal

```typescript
interface ReportGenerationRequest {
  templateId: string // From /api/v1/reports/templates
  investigationId: string // Link to investigation
  format: 'pdf' | 'html' | 'markdown'
  sections: string[] // Which sections to include
  language: 'pt' | 'en'
}
```

#### B. Report Templates

```
- Executive Summary (Resumo Executivo)
- Technical Analysis (Análise Técnica Detalhada)
- Anomalies Report (Relatório de Anomalias)
- Compliance Check (Verificação de Conformidade)
- Trend Analysis (Análise de Tendências)
```

#### C. Report List Page

Location: `/pt/(authenticated)/relatorios`

Features:

- List all generated reports
- Filter by date, type, investigation
- Quick preview
- Download buttons
- Share options

---

### 6. 🔔 Notifications Flow

**Pages**: `/pt/(authenticated)/notificacoes`

**Current Implementation**:

- 🟡 **Partial UI** (notification center exists)
- Uses Zustand store locally
- No backend sync

**Backend Integration Available**:

```
GET    /api/v1/notifications                    ← List notifications
GET    /api/v1/notifications/unread-count       ← Badge count
POST   /api/v1/notifications/{id}/read          ← Mark as read
POST   /api/v1/notifications/mark-all-read      ← Bulk read
DELETE /api/v1/notifications/{id}               ← Remove
GET    /api/v1/notifications/preferences        ← User preferences
PUT    /api/v1/notifications/preferences        ← Update preferences
POST   /api/v1/notifications/webhooks           ← Webhook management
POST   /api/v1/notifications/test               ← Test notification
```

**Status**: 🟡 **PARTIAL** (30% - UI exists, no sync)

**Integration Opportunities**:

#### A. Real-time Notifications

```typescript
// Use SSE for real-time updates
const eventSource = new EventSource(`${API_URL}/api/v1/notifications/stream`)

eventSource.onmessage = (event) => {
  const notification = JSON.parse(event.data)
  notificationStore.addNotification(notification)

  // Show toast
  toast.info(notification.title, notification.message)
}
```

#### B. Notification Preferences

```typescript
interface NotificationPreferences {
  email: {
    enabled: boolean
    frequency: 'realtime' | 'daily' | 'weekly'
  }
  push: {
    enabled: boolean
    types: Array<'anomaly' | 'report' | 'system'>
  }
  inApp: {
    enabled: boolean
    sound: boolean
  }
}
```

#### C. Webhook Integration

```typescript
// Allow users to configure webhooks for notifications
interface WebhookConfig {
  url: string
  events: string[]
  headers: Record<string, string>
  secret: string // For signature verification
}
```

---

### 7. 📤 Export Flow

**Pages**: Currently embedded in other pages

**Backend Integration Available**:

```
POST /api/v1/export/investigations/{id}/download  ← Investigation data
POST /api/v1/export/contracts/export              ← Contracts
POST /api/v1/export/anomalies/export              ← Anomalies
POST /api/v1/export/bulk                          ← Multi-file ZIP
POST /api/v1/export/visualization/export          ← Chart data
POST /api/v1/export/regional-analysis/export      ← Geographic
POST /api/v1/export/time-series/export            ← Time series
```

**Status**: ❌ **NOT INTEGRATED** (0%)

**Proposed Universal Export Component**:

```typescript
interface ExportOptions {
  type: 'investigation' | 'contract' | 'anomaly' | 'report'
  id: string
  format: 'json' | 'csv' | 'excel' | 'pdf'
  filters?: Record<string, any>
  includeVisualizations: boolean
}

// Universal export function
async function exportData(options: ExportOptions) {
  const endpoint = getExportEndpoint(options.type)
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(options),
  })

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${options.type}-${options.id}.${options.format}`
  a.click()
}
```

---

### 8. ⚙️ Settings Flow

**Pages**: `/pt/(authenticated)/configuracoes`

**Current Implementation**:

- 🟡 **Partial UI**
- Profile settings only
- No backend sync

**Backend Integration Opportunities**:

```
GET /api/v1/auth/me                        ← User profile
PUT /api/v1/auth/change-password           ← Password update
GET /api/v1/notifications/preferences      ← Notification settings
PUT /api/v1/notifications/preferences      ← Update preferences
GET /api/v1/audit/events                   ← Activity log
```

**Proposed Settings Categories**:

#### A. Profile

- Name, email (from Supabase)
- Avatar
- Language preference
- Timezone

#### B. Notifications

- Email notifications
- Push notifications
- Webhook configurations

#### C. Security

- Change password
- 2FA setup
- Active sessions
- Login history

#### D. Data & Privacy

- Export all data
- Delete account
- Audit log access

---

## Integration Priority Matrix

### 🔴 Critical (Must Have)

1. **Dashboard Real Data** (Effort: M, Impact: H)
   - Replace mock data with real metrics
   - User engagement depends on this

2. **Investigation Creation** (Effort: H, Impact: H)
   - Core feature of the platform
   - Currently non-functional

3. **Notification Sync** (Effort: M, Impact: M)
   - Keep users informed
   - Drive engagement

### 🟡 High Priority (Should Have)

4. **Chat History Persistence** (Effort: M, Impact: M)
   - Better UX for returning users
   - Cross-device experience

5. **Report Generation** (Effort: H, Impact: M)
   - Value-add feature
   - Professional output

6. **Export Functionality** (Effort: M, Impact: M)
   - User data ownership
   - Sharing capabilities

### 🟢 Medium Priority (Nice to Have)

7. **Dynamic Agent Loading** (Effort: L, Impact: L)
   - Flexibility for future
   - Not blocking current flow

8. **Smart Suggestions** (Effort: M, Impact: L)
   - Improved discovery
   - Can wait for ML training

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Goal**: Core integrations working

- [ ] Create API client abstraction layer
- [ ] Implement error handling strategy
- [ ] Set up request/response interceptors
- [ ] Add loading states management
- [ ] Create reusable data fetching hooks

**Deliverables**:

```typescript
// lib/api/client.ts
export class APIClient {
  async get<T>(endpoint: string): Promise<T>
  async post<T>(endpoint: string, data: any): Promise<T>
  async put<T>(endpoint: string, data: any): Promise<T>
  async delete<T>(endpoint: string): Promise<T>
  async stream(endpoint: string): EventSource
}

// hooks/use-api.ts
export function useAPI<T>(endpoint: string) {
  const { data, error, isLoading, mutate } = useSWR(endpoint)
  return { data, error, isLoading, refresh: mutate }
}
```

### Phase 2: Dashboard & Investigations (Week 3-4)

**Goal**: Main features functional

- [ ] Dashboard real data integration
- [ ] Investigation creation form
- [ ] Investigation results display
- [ ] Real-time progress tracking

### Phase 3: Reports & Exports (Week 5-6)

**Goal**: Complete data lifecycle

- [ ] Report generation UI
- [ ] Report listing page
- [ ] Universal export component
- [ ] Bulk export functionality

### Phase 4: Enhancements (Week 7-8)

**Goal**: Polish and optimize

- [ ] Notification real-time sync
- [ ] Chat history persistence
- [ ] Smart suggestions
- [ ] Settings page completion

---

## Technical Considerations

### Authentication & Authorization

**Current**: Supabase JWT
**Backend Expects**: JWT Bearer token

**Solution**: Add token to all requests

```typescript
const token = await supabase.auth.getSession()
headers: {
  'Authorization': `Bearer ${token.access_token}`
}
```

### Error Handling

**Standardize error responses**:

```typescript
interface APIError {
  status: number
  message: string
  code: string
  details?: any
}

// Global error handler
function handleAPIError(error: APIError) {
  switch (error.status) {
    case 401:
      // Redirect to login
      router.push('/pt/login')
      break
    case 403:
      toast.error('Acesso negado', error.message)
      break
    case 429:
      toast.warning('Limite excedido', 'Aguarde um momento')
      break
    default:
      toast.error('Erro', error.message)
  }
}
```

### Caching Strategy

**Use SWR for data fetching**:

```typescript
import useSWR from 'swr'

// Automatic caching, revalidation, and deduplication
const { data, error } = useSWR('/api/v1/investigations/', fetcher, {
  refreshInterval: 30000, // Refresh every 30s
  revalidateOnFocus: true,
  dedupingInterval: 5000,
})
```

### Real-time Updates

**Use SSE for streaming**:

```typescript
// Already implemented for chat, extend to:
- Investigation progress
- Notification updates
- Dashboard metrics
```

### State Management

**Current**: Zustand (local)
**Needed**: Sync with backend

**Solution**: Optimistic updates

```typescript
// Optimistic UI pattern
async function createInvestigation(data) {
  // 1. Immediately update UI
  investigationStore.addInvestigation({
    id: 'temp-id',
    ...data,
    status: 'pending',
  })

  // 2. Send to backend
  try {
    const result = await api.post('/api/v1/investigations/start', data)

    // 3. Replace temp with real
    investigationStore.replaceInvestigation('temp-id', result)
  } catch (error) {
    // 4. Rollback on error
    investigationStore.removeInvestigation('temp-id')
    toast.error('Falha ao criar investigação')
  }
}
```

---

## Security Considerations

### 1. API Keys

- ✅ Already using environment variables
- ✅ Railway production URL configured
- ⚠️ Need to rotate keys periodically

### 2. CORS

- Backend needs to whitelist Vercel domain
- Already configured: `cidadao-ai-frontend.vercel.app`

### 3. Rate Limiting

- Backend has rate limits per endpoint
- Frontend should handle 429 responses gracefully
- Show user-friendly messages

### 4. Data Validation

- Validate all inputs client-side
- Use Zod schemas for type safety
- Backend will validate again (defense in depth)

---

## Performance Optimization

### 1. Request Optimization

- Batch requests where possible
- Use `/api/v1/batch/process` for multiple operations
- Implement request coalescing

### 2. Caching Strategy

```
Layer 1: Memory (SWR cache) - 30s TTL
Layer 2: Service Worker - 5min TTL
Layer 3: Backend cache - 1hr TTL
```

### 3. Lazy Loading

- Load investigation results on demand
- Infinite scroll for lists
- Virtual scrolling for large datasets

### 4. Optimistic Updates

- Immediate UI feedback
- Rollback on failure
- Sync in background

---

## Testing Strategy

### 1. Integration Tests

```typescript
describe('Investigation Flow', () => {
  it('should create investigation', async () => {
    const result = await createInvestigation({...})
    expect(result.status).toBe('pending')
  })

  it('should track progress', async () => {
    const progress = await getInvestigationProgress(id)
    expect(progress.progress).toBeGreaterThan(0)
  })

  it('should retrieve results', async () => {
    const results = await getInvestigationResults(id)
    expect(results.anomalies).toBeDefined()
  })
})
```

### 2. E2E Tests (Playwright)

```typescript
test('complete investigation flow', async ({ page }) => {
  await page.goto('/pt/investigacoes')
  await page.click('text=Nova Investigação')
  await page.fill('[name=name]', 'Test Investigation')
  await page.click('text=Iniciar')
  await page.waitForSelector('text=Concluída')
  expect(await page.textContent('.results')).toContain('anomalies')
})
```

### 3. Performance Monitoring

- Sentry for error tracking (✅ already set up)
- Add custom metrics for API response times
- Monitor cache hit rates

---

## Next Steps

### Immediate Actions

1. **Create API Client Layer** (1 day)
   - Abstract fetch calls
   - Centralize error handling
   - Add request/response interceptors

2. **Implement Dashboard Integration** (2 days)
   - Fetch real investigations data
   - Display actual metrics
   - Add loading states

3. **Build Investigation Form** (3 days)
   - Design form UI
   - Implement validation
   - Connect to backend API
   - Add progress tracking

### Team Discussion Points

1. **Authentication Strategy**
   - Continue with Supabase only?
   - Or integrate backend OAuth?

2. **Data Persistence**
   - Sync chat history to backend?
   - Or keep client-side only?

3. **Feature Priority**
   - Which flows to implement first?
   - Any missing requirements?

4. **Performance Targets**
   - What's acceptable response time?
   - How much caching is too much?

---

## Conclusion

The Cidadão.AI frontend has a solid foundation but significant integration opportunities remain. The backend provides comprehensive APIs covering investigations, reports, exports, and notifications - all currently underutilized.

**Key Priorities**:

1. ✅ Chat integration is excellent
2. 🔴 Dashboard needs real data urgently
3. 🔴 Investigations feature is critical
4. 🟡 Reports and exports add value
5. 🟡 Notifications improve engagement

**Success Metrics**:

- Dashboard showing real metrics
- Users creating investigations
- Reports being generated
- Exports being used
- Notifications keeping users informed

**Timeline**: 8 weeks for complete integration

**Risk**: None critical - existing chat functionality continues working during integration

---

**Document Status**: 📝 DRAFT - Ready for Review
**Next Update**: After team discussion and priority confirmation
