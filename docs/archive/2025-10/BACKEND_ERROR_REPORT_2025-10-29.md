# 🐛 Backend Error Report - Cidadão.AI Chat

**Autor**: Anderson Henrique da Silva
**Data**: 2025-10-29 08:20:00 -0300
**Environment**: Production (https://cidadao-ai-production.up.railway.app)
**Frontend Version**: commit `db4729c`

---

## 🔴 CRITICAL ERRORS

### Error 1: CidadaoAIError initialization failure

**Severity**: 🔴 CRITICAL - Blocks all Cidadão.AI mode requests

**Error Message**:

```json
{
  "status": "error",
  "error": "CidadaoAIError.__init__() got an unexpected keyword argument 'agent_id'",
  "investigation_id": null
}
```

**Reproduction Steps**:

1. Open chat interface in Cidadão.AI mode (not Maritaca Direct)
2. Send any message (e.g., "Analisar anomalias em licitações")
3. Observe error in message bubble

**Expected Behavior**:

- Abaporu (master agent) or Anita Garibaldi should respond with analysis

**Actual Behavior**:

- Python exception thrown
- Error message displayed to user
- No investigation created

**Root Cause Analysis**:

```python
# Backend is trying to instantiate CidadaoAIError with 'agent_id' parameter
# but __init__() doesn't accept it

# Likely location: Exception handling in agent routing or execution
raise CidadaoAIError(
    message="Some error",
    agent_id="anita"  # ← This parameter is not accepted
)
```

**Impact**:

- ❌ 100% of Cidadão.AI mode requests fail
- ❌ Multi-agent system completely broken
- ✅ Maritaca Direct mode still works (different endpoint)

**Recommendation**:

```python
# Option 1: Update CidadaoAIError.__init__ to accept agent_id
class CidadaoAIError(Exception):
    def __init__(self, message: str, agent_id: str = None, **kwargs):
        self.agent_id = agent_id
        super().__init__(message)

# Option 2: Remove agent_id from error instantiation
# Find all: raise CidadaoAIError(..., agent_id=...)
# Replace with: raise CidadaoAIError(...)
```

**Test Case**:

```bash
curl -X POST https://cidadao-api-production.up.railway.app/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Analisar anomalias em licitações",
    "session_id": "test_error_report_001"
  }'
```

---

## 🟡 MEDIUM PRIORITY ERRORS

### Error 2: 404 on preload routes

**Severity**: 🟡 MEDIUM - Affects performance but not functionality

**Errors**:

```
/pt/perfil?_rsc=74cas:1      404 (Not Found)
/pt/home?_rsc=74cas:1        404 (Not Found)
/pt/configuracoes?_rsc=74cas:1  404 (Not Found)
```

**Cause**:

- Frontend is preloading routes that don't exist yet
- Routes are actually at `/pt/app/perfil`, `/pt/app/home`, etc.

**Impact**:

- ⚠️ Console noise
- ⚠️ Wasted bandwidth
- ⚠️ Slower perceived performance

**Fix**: Already implemented in `hooks/use-route-preload.ts` (commit `2d2de44`)

**Status**: ✅ Fixed in latest deployment

---

### Error 3: Service Worker fetch errors

**Severity**: 🟡 MEDIUM - PostHog analytics affected

**Errors**:

```
sw.js:1 Uncaught (in promise) no-response: no-response
The FetchEvent for "https://us-assets.i.posthog.com/array/..." resulted in network error
```

**Cause**:

- PostHog requests being blocked by:
  1. Ad blockers (ERR_BLOCKED_BY_CLIENT)
  2. Network issues
  3. Service Worker trying to cache failed requests

**Impact**:

- ⚠️ Analytics not tracking properly
- ⚠️ Console noise

**Recommendation**:

```typescript
// Service Worker should gracefully handle analytics failures
// Don't cache PostHog requests - they should always go to network
const postHogPattern = /posthog\.com/
if (postHogPattern.test(request.url)) {
  return fetch(request) // Don't cache, don't throw on failure
}
```

---

## 🟢 LOW PRIORITY / INFORMATIONAL

### Info 1: Unused preloaded resources

**Warnings**:

```
The resource <URL> was preloaded using link preload but not used within
a few seconds from the window's load event.
```

**Impact**:

- ℹ️ Minor performance impact
- ℹ️ Wasted bandwidth on unused resources

**Recommendation**:

- Review `app/pt/layout.tsx` preload tags
- Remove or lazy-load unused resources

---

### Info 2: VLibras CSP violations (FIXED)

**Status**: ✅ FIXED

**Previous Error**:

```
Refused to load image 'https://cdn.jsdelivr.net/gh/spbgovbr-vlibras/...'
CSP directive: "img-src ... https://vlibras.gov.br https://*.vlibras.gov.br"
```

**Fix**: Added `https://cdn.jsdelivr.net` to CSP img-src (commit `XXXXX`)

---

## 📊 Error Summary

| Severity    | Count | Blocking | Fixed  |
| ----------- | ----- | -------- | ------ |
| 🔴 CRITICAL | 1     | ✅ Yes   | ❌ No  |
| 🟡 MEDIUM   | 3     | ❌ No    | ✅ 1/3 |
| 🟢 LOW      | 2     | ❌ No    | ✅ 1/2 |

**Total Errors**: 6
**Blocking Production**: 1 (CidadaoAIError)
**Fixed**: 2
**Remaining**: 4

---

## 🧪 Comprehensive Test Cases

### Test Suite 1: Cidadão.AI Mode (Multi-Agent)

#### TC001: Basic Chat Request

```bash
# Request
POST /api/v1/chat
{
  "message": "Olá, como você pode me ajudar?",
  "session_id": "test_tc001"
}

# Expected Response
{
  "session_id": "test_tc001",
  "message_id": "msg_xxx",
  "agent_id": "abaporu",
  "agent_name": "Abaporu",
  "message": "Olá! Sou o Abaporu...",
  "confidence": 0.95
}

# Current Response
{
  "status": "error",
  "error": "CidadaoAIError.__init__() got an unexpected keyword argument 'agent_id'"
}
```

**Status**: ❌ FAIL

---

#### TC002: Anomaly Detection Request (Anita Garibaldi)

```bash
# Request
POST /api/v1/chat
{
  "message": "Analisar anomalias em licitações",
  "session_id": "test_tc002"
}

# Expected
{
  "agent_id": "anita",
  "agent_name": "Anita Garibaldi",
  "message": "Vou analisar as licitações em busca de anomalias...",
  "suggested_actions": ["investigate", "report"]
}

# Current
{
  "status": "error",
  "error": "CidadaoAIError.__init__() got an unexpected keyword argument 'agent_id'"
}
```

**Status**: ❌ FAIL

---

#### TC003: Investigation Request (Zumbi dos Palmares)

```bash
# Request
POST /api/v1/chat
{
  "message": "Investigar contratos suspeitos",
  "session_id": "test_tc003"
}

# Expected
{
  "agent_id": "zumbi",
  "agent_name": "Zumbi dos Palmares",
  "message": "Iniciando investigação de contratos suspeitos..."
}

# Current
{
  "status": "error",
  "error": "CidadaoAIError.__init__() got an unexpected keyword argument 'agent_id'"
}
```

**Status**: ❌ FAIL

---

### Test Suite 2: Maritaca Direct Mode

#### TC101: Sabiazinho-3 Basic Request

```bash
# Request
POST /api/v1/chat/direct/maritaca
{
  "messages": [{"role": "user", "content": "Olá!"}],
  "session_id": "test_tc101",
  "model": "sabiazinho-3"
}

# Expected
{
  "id": "xxx",
  "model": "sabiazinho-3",
  "content": "Olá! Como posso ajudá-lo?",
  "finish_reason": "stop"
}

# Current
✅ WORKS - Response received correctly
```

**Status**: ✅ PASS

---

#### TC102: Sabiá-3 Complex Request

```bash
# Request
POST /api/v1/chat/direct/maritaca
{
  "messages": [{"role": "user", "content": "Explique o que é a LAI"}],
  "session_id": "test_tc102",
  "model": "sabia-3"
}

# Expected
Long response about LAI (Lei de Acesso à Informação)
finish_reason: "stop"

# Current
✅ WORKS - Full response received (600+ tokens)
```

**Status**: ✅ PASS

---

### Test Suite 3: Error Handling

#### TC201: Empty Message

```bash
# Request
POST /api/v1/chat
{
  "message": "",
  "session_id": "test_tc201"
}

# Expected
{
  "status": "error",
  "error": "Message cannot be empty",
  "code": "INVALID_INPUT"
}
```

**Status**: ⏳ NEEDS TESTING

---

#### TC202: Invalid Session ID

```bash
# Request
POST /api/v1/chat
{
  "message": "Hello",
  "session_id": "'; DROP TABLE sessions;--"
}

# Expected
{
  "status": "error",
  "error": "Invalid session ID format",
  "code": "INVALID_INPUT"
}
```

**Status**: ⏳ NEEDS TESTING

---

#### TC203: Very Long Message (>10000 chars)

```bash
# Request
POST /api/v1/chat
{
  "message": "A".repeat(10001),
  "session_id": "test_tc203"
}

# Expected
{
  "status": "error",
  "error": "Message too long (max 10000 characters)",
  "code": "MESSAGE_TOO_LONG"
}
```

**Status**: ⏳ NEEDS TESTING

---

## 🔧 Backend Code Locations to Check

### Priority 1: Fix CidadaoAIError

**Files to check**:

```python
# 1. Exception definition
src/exceptions.py
src/core/exceptions.py

# 2. Exception usage
src/agents/base_agent.py
src/agents/abaporu.py
src/agents/anita.py
src/services/agent_router.py
src/api/v1/endpoints/chat.py
```

**Search for**:

```python
# Find all CidadaoAIError instantiations
grep -r "raise CidadaoAIError" src/
grep -r "CidadaoAIError(" src/

# Find the class definition
grep -r "class CidadaoAIError" src/
```

---

### Priority 2: Verify Error Response Format

**Expected format**:

```python
# Standardized error response
{
    "status": "error",
    "error": {
        "code": "AGENT_INITIALIZATION_ERROR",
        "message": "Failed to initialize agent",
        "details": {...},
        "agent_id": "anita",  # Optional context
        "timestamp": "2025-10-29T08:20:00Z"
    },
    "investigation_id": null
}
```

**Current format** (inconsistent):

```python
{
    "status": "error",
    "error": "String message",  # Should be object
    "investigation_id": None  # Python None, not JSON null
}
```

---

## 📝 Recommended Backend Changes

### Change 1: Update CidadaoAIError class

```python
# File: src/exceptions.py (or wherever defined)

class CidadaoAIError(Exception):
    """Base exception for Cidadao.AI errors"""

    def __init__(
        self,
        message: str,
        code: str = "UNKNOWN_ERROR",
        agent_id: str | None = None,
        details: dict | None = None,
        **kwargs
    ):
        self.message = message
        self.code = code
        self.agent_id = agent_id
        self.details = details or {}
        super().__init__(message)

    def to_dict(self) -> dict:
        return {
            "code": self.code,
            "message": self.message,
            "agent_id": self.agent_id,
            "details": self.details
        }
```

### Change 2: Standardize error responses

```python
# File: src/api/v1/endpoints/chat.py

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        response = await agent_service.process_message(request)
        return response

    except CidadaoAIError as e:
        return JSONResponse(
            status_code=400,
            content={
                "status": "error",
                "error": e.to_dict(),
                "investigation_id": None,  # Use None for JSON null
                "timestamp": datetime.utcnow().isoformat()
            }
        )

    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected error occurred",
                    "details": {}
                },
                "investigation_id": None
            }
        )
```

### Change 3: Add request validation

```python
# File: src/api/v1/schemas/chat.py

from pydantic import BaseModel, Field, validator

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000)
    session_id: str = Field(..., regex=r'^[a-zA-Z0-9_-]+$')
    context: dict | None = None

    @validator('message')
    def validate_message(cls, v):
        if not v or not v.strip():
            raise ValueError("Message cannot be empty")
        return v.strip()

    @validator('session_id')
    def validate_session_id(cls, v):
        # Prevent SQL injection
        if any(char in v for char in ["'", '"', ';', '--', '/*']):
            raise ValueError("Invalid session ID format")
        return v
```

---

## 🎯 Action Items for Backend Team

### Immediate (Fix today)

- [ ] 🔴 Fix `CidadaoAIError.__init__()` to accept `agent_id` parameter
- [ ] 🔴 Test fix with: "Analisar anomalias em licitações"
- [ ] 🔴 Verify all agents can be invoked successfully

### Short term (This week)

- [ ] 🟡 Standardize error response format across all endpoints
- [ ] 🟡 Add request validation (message length, session ID format)
- [ ] 🟡 Implement proper None/null serialization for JSON responses
- [ ] 🟡 Add comprehensive error codes (AGENT_ERROR, INVALID_INPUT, etc.)

### Medium term (Next sprint)

- [ ] 🟢 Add integration tests for all test cases in this report
- [ ] 🟢 Implement request/response logging for debugging
- [ ] 🟢 Add performance monitoring for agent response times
- [ ] 🟢 Document all error codes and handling in API docs

---

## 📞 Contact & Follow-up

**Report submitted by**: Anderson Henrique da Silva (Frontend Lead)
**Backend contact**: [Backend team lead name]
**Tracking**: Create issue in backend repo with tag `bug-critical`

**Testing script available**: `scripts/test-backend-comprehensive.js` (to be created)

**Next steps**:

1. Backend team acknowledges report
2. Fix CidadaoAIError initialization
3. Deploy fix to staging
4. Frontend team validates fix
5. Deploy to production
6. Close issue

---

**Report Version**: 1.0
**Last Updated**: 2025-10-29 08:20:00 -0300
