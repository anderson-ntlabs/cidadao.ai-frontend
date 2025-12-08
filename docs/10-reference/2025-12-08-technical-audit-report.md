# Technical Audit Report - Cidadao.AI Frontend

**Date**: December 8, 2025
**Auditors**: Senior Engineering Review Team
**Project**: Cidadao.AI Frontend (Next.js 15 PWA)
**Version Audited**: main branch (commit 8e9f3bf)

---

## Executive Summary

| Category           | Status    | Critical Issues                  | Score |
| ------------------ | --------- | -------------------------------- | ----- |
| **Architecture**   | Warning   | 3 critical                       | 7/10  |
| **Testing**        | Critical  | Coverage 23.61% vs 60% threshold | 4/10  |
| **Security**       | Warning   | 1 critical, 5 high               | 6/10  |
| **Performance**    | Good      | 2 medium                         | 8/10  |
| **Technical Debt** | Warning   | 143 `any` usages                 | 6/10  |
| **Dependencies**   | Excellent | 2 unused                         | 9/10  |

**Overall Score: 6.7/10** - Functional project with significant technical debt requiring immediate attention.

---

## Critical Findings (Immediate Action Required)

### 1. SECURITY - API Key Exposed in Browser Bundle

**Severity**: CRITICAL
**File**: `.env.example`, `lib/chat/adapters/fallback.adapter.ts:31`

**Issue**: `NEXT_PUBLIC_MARITACA_API_KEY` is exposed in client-side JavaScript bundle.

**Risk**: Anyone can extract the key from browser DevTools and make API calls on behalf of the application, potentially incurring costs and accessing sensitive endpoints.

**Remediation**:

1. Remove `NEXT_PUBLIC_` prefix from the environment variable
2. Create a server-side API proxy endpoint (`/api/chat/maritaca`)
3. Move all LLM API calls through the proxy
4. Add rate limiting to the proxy endpoint

**Effort**: 2-3 hours

---

### 2. SECURITY - Authentication Bypass in Production

**Severity**: HIGH
**File**: `lib/supabase/middleware.ts:10`

```typescript
if (process.env.PLAYWRIGHT_TEST_BASE_URL || request.headers.get('x-playwright-test')) {
  return supabaseResponse // Skips authentication!
}
```

**Issue**: The `x-playwright-test` header can be sent by anyone to bypass authentication in production.

**Remediation**:

```typescript
if (
  process.env.NODE_ENV === 'development' &&
  (process.env.PLAYWRIGHT_TEST_BASE_URL || request.headers.get('x-playwright-test'))
) {
  return supabaseResponse
}
```

**Effort**: 30 minutes

---

### 3. ARCHITECTURE - Non-Serializable State in Zustand Store

**Severity**: CRITICAL
**File**: `store/chat-store.ts:48, 124, 136`

```typescript
messageIndex: Map<string, number> // Map is not JSON-serializable
ws: ChatWebSocket | null // WebSocket is not serializable
```

**Impact**:

- Zustand DevTools fail silently
- localStorage persistence may corrupt data
- Debugging becomes impossible
- State inspection tools don't work

**Remediation**:

1. Replace `Map` with plain object `Record<string, number>` or exclude from devtools
2. Move WebSocket instance to a separate singleton outside Zustand
3. Add custom serializer for devtools middleware

**Effort**: 2-3 hours

---

### 4. TESTING - Coverage Critically Below Threshold

**Severity**: CRITICAL
**Measurement**: 23.61% actual vs 60% required threshold

**Untested Critical Paths**:

| Area                    | Coverage | Risk Level               |
| ----------------------- | -------- | ------------------------ |
| `lib/supabase/*`        | 0-4%     | CRITICAL (all auth)      |
| `hooks/use-agora*.tsx`  | 0%       | HIGH (learning platform) |
| `components/a11y/*`     | 0%       | HIGH (accessibility)     |
| `store/badge-store.ts`  | 0%       | MEDIUM                   |
| `store/survey-store.ts` | 0%       | MEDIUM                   |
| `lib/speech/*`          | 28%      | MEDIUM                   |

**E2E Test Gaps**:

- 2 critical auth tests SKIPPED
- No complete login → dashboard → chat flow
- No PDF export testing
- WebKit/Safari completely skipped (libicu issue)

**Remediation**: See Testing Roadmap section below.

---

## High Priority Findings (Next 2 Weeks)

### 5. OAuth Redirect Not Validated

**File**: `app/auth/callback/route.ts:10`

```typescript
const next = requestUrl.searchParams.get('next') ?? '/pt/app'
// No validation - allows Open Redirect attacks
```

**Remediation**: Validate against whitelist of allowed paths.

---

### 6. Auth Tokens Stored in LocalStorage

**Files**: `store/chat-store.ts`, `store/badge-store.ts`

**Risk**: XSS vulnerability = account compromise.

**Remediation**: Migrate to httpOnly cookies via middleware.

---

### 7. WebSocket Dead Code (49+ lines)

**File**: `store/chat-store.ts:709-758`

```typescript
// WebSocket not supported by current backend
// Disabled code still present, causes confusion
// subscribeToInvestigation() calls method on null object
```

**Remediation**: Remove disabled code or implement properly.

---

### 8. Multiple Zustand Subscriptions Causing Re-renders

**File**: `app/pt/app/chat/page.tsx:222-234`

11 separate `useChatStore()` calls create 11 independent subscriptions. Each streaming chunk (10+/second) triggers re-render of ALL subscribers.

**Remediation**: Use `useShallow()` hook or create optimized custom selector.

---

### 9. Massive Code Duplication in Chat Adapters

**Duplicated Files**:

- `lib/chat/adapters/primary.adapter.ts` (360+ lines)
- `lib/chat/adapters/fallback.adapter.ts` (140+ lines)
- `lib/api/chat-adapter-backend.ts` (legacy?)
- `lib/api/chat-adapter-fallback.ts` (legacy?)
- `lib/api/chat-adapter-maritaca.ts` (legacy?)
- `lib/api/chat.service.ts` (200+ lines)
- `lib/chat/chat.service.ts` (300+ lines)

**Impact**: 7 files with similar functionality, unclear which is canonical.

**Remediation**: Audit and consolidate to 2 files maximum.

---

### 10. Widespread `any` Type Usage

**Count**: 143 occurrences across 58 files

**Top Offenders**:

- `lib/export-service*.ts` - 10+ usages
- `store/chat-store.ts` - 4 usages
- `hooks/use-*.ts` - 15+ usages
- `lib/api/*.ts` - 20+ usages

**Impact**: Loss of type safety, silent bugs, impaired IDE autocomplete.

---

## Medium Priority Findings

### 11. Console.log Instead of Logger

- **248 console statements** across 63 files
- Logger exists at `lib/utils/logger.ts` but not consistently used
- Production logs exposed to users

### 12. Missing React.memo on High-Frequency Components

Components like `SmartSuggestions`, `AgentSelector`, `MessageBubble` lack memoization, causing unnecessary re-renders.

### 13. Oversized Components and Hooks

| File                                     | Lines | Recommendation          |
| ---------------------------------------- | ----- | ----------------------- |
| `hooks/use-agora.tsx`                    | 1,735 | Split into 4 hooks      |
| `store/chat-store.ts`                    | 917   | Extract streaming logic |
| `components/agora/certificate-modal.tsx` | 1,579 | Split into 3 components |

### 14. Missing Persistence in chat-store

Unlike `agora-chat-store.ts` which uses persist middleware, `chat-store.ts` loses all data on page refresh.

### 15. Inconsistent Error Handling

- Some adapters return structured errors `{success: false, error: {...}}`
- Some use `console.error()` with no return
- Empty catch blocks swallow errors silently

---

## Positive Findings (What's Working Well)

1. **Bundle Optimization**: Excellent lazy loading and chunk splitting configuration
2. **Chat System Core Tests**: 95% coverage in `lib/chat/`
3. **CSP Configuration**: Well-documented with rationale for each directive
4. **Dependency Health**: No peer dependency conflicts, all compatible with React 18 & Next.js 15
5. **PWA Implementation**: Serwist correctly configured for Next.js 15
6. **i18n Architecture**: PT/EN routes well structured
7. **No Circular Dependencies**: Healthy import architecture verified
8. **Image Optimization**: AVIF + WebP with proper lazy loading

---

## Security Vulnerability Summary

| Issue                            | Severity | Type               | Location                  |
| -------------------------------- | -------- | ------------------ | ------------------------- |
| Maritaca API Key in NEXT_PUBLIC  | CRITICAL | Secret Exposure    | .env, fallback.adapter.ts |
| OAuth Redirect Not Validated     | HIGH     | Open Redirect      | auth/callback/route.ts:11 |
| Auth Tokens in LocalStorage      | HIGH     | Session Management | stores                    |
| oauth_session_ready Not HttpOnly | HIGH     | Cookie Security    | auth/callback/route.ts:95 |
| Playwright Auth Bypass           | HIGH     | Auth Bypass        | middleware.ts:10          |
| Unsafe-Eval in CSP               | HIGH     | XSS (by design)    | csp.config.ts:71-86       |
| Weak CSRF Token Generation       | MEDIUM   | CSRF               | csrf.ts:28                |
| In-Memory Rate Limiting          | MEDIUM   | DoS Protection     | rate-limit.ts             |
| Missing SRI for CDN Scripts      | MEDIUM   | Supply Chain       | csp.config.ts             |

---

## Performance Analysis

### Current Performance Issues

| Issue                                            | File                     | Impact | Estimated Savings          |
| ------------------------------------------------ | ------------------------ | ------ | -------------------------- |
| Excessive chunk requests (25 vs 6-8 recommended) | next.config.mjs:96       | High   | 200-400ms initial load     |
| Multiple Zustand subscriptions                   | chat/page.tsx:222-234    | High   | 30-50ms per action         |
| No session list caching                          | chat-history-sidebar.tsx | Medium | 100-500ms per sidebar open |
| Monolithic state object                          | chat-store.ts:45-63      | High   | 30-40% fewer re-renders    |
| Missing Suspense boundaries                      | chat/page.tsx            | Medium | 100-200ms FCP              |

### Already Optimized

- Lazy loading for heavy dependencies (charts, PDF, CSV)
- Custom webpack chunk splitting
- Package-level tree-shaking enabled
- Image optimization (AVIF + WebP)
- Service Worker caching strategy

---

## Dependencies Analysis

### Unused Dependencies (Remove)

1. `@emotion/is-prop-valid` - Not used anywhere
2. `happy-dom` - vitest only uses jsdom

### Version Constraints

All dependencies compatible with React 18.3.1 and Next.js 15.5.7.

### Bundle Impact

Heavy dependencies properly lazy-loaded:

- `recharts` - Separate chunk, lazy loaded
- `jspdf` + `html2canvas` - Separate chunk, on-demand
- `framer-motion` - Separate animations chunk
- `lucide-react` - Tree-shaken via experimentalOptimizePackageImports

---

## Recommendations Summary

### Week 1 - Critical (Production Blockers)

1. Move Maritaca API key to server-side
2. Remove auth bypass for test header
3. Validate OAuth redirect parameter
4. Fix non-serializable Zustand state
5. Delete WebSocket dead code

### Week 2 - High Priority

6. Add tests for use-agora hooks
7. Add tests for lib/supabase
8. Consolidate chat adapters
9. Optimize Zustand subscriptions
10. Migrate tokens to httpOnly cookies

### Week 3 - Medium Priority

11. Reduce `any` type usage
12. Add tests for accessibility components
13. Refactor use-agora.tsx
14. Consolidate export-service files
15. Enable TypeScript strict mode

### Week 4 - Improvements

16. Migrate console.log to logger
17. Remove unused dependencies
18. Document barrel file patterns
19. Add SRI for external scripts
20. Implement distributed rate limiting

---

## Appendix: Critical File References

```
# Security
lib/supabase/middleware.ts:10          # Auth bypass
app/auth/callback/route.ts:10,95-100   # OAuth vulnerabilities
lib/security/csp.config.ts:71-86       # CSP unsafe-*
lib/chat/adapters/fallback.adapter.ts:31  # API key exposure

# Architecture
store/chat-store.ts:48,124,136,709-758 # Non-serializable state, dead code
hooks/use-agora.tsx:1-1735             # Massive hook
app/pt/app/chat/page.tsx:222-234       # Multiple subscriptions

# Technical Debt
lib/export-service*.ts                 # 4 duplicate implementations
lib/api/chat-adapter-*.ts              # 3 legacy adapters
```

---

**Report Generated**: 2025-12-08
**Next Audit Recommended**: 2026-01-15 (after remediation sprint)
