# Manual Testing Scripts - Integration & Performance Testing

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data de Criação**: 2025-01-25 15:00:00 -0300
**Última Atualização**: 2025-01-25

---

## Overview

The Cidadão.AI frontend includes comprehensive manual testing scripts for integration testing, performance monitoring, and feature validation. These scripts complement automated tests (Vitest + Playwright) by testing real backend integration and user scenarios.

### When to Use Manual Tests

**Use manual test scripts when**:

- ✅ Testing backend connectivity and integration
- ✅ Validating API responses and contracts
- ✅ Monitoring performance over time
- ✅ Debugging integration issues
- ✅ Stress testing under load
- ✅ Verifying feature functionality before PR

**Use automated tests when**:

- ✅ Unit testing pure functions
- ✅ Component testing UI logic
- ✅ E2E testing user flows
- ✅ Regression testing

---

## Scripts Location

```
scripts/
├── test-backend.js                 # Backend connectivity test
├── test-chat-api.js                # Chat API integration test
├── test-chat-live.js               # Live chat testing with Railway backend
├── test-chat-persistence.js        # Supabase session persistence test
├── test-vlibras.js                 # VLibras widget integration test
├── check-backend-status.js         # Backend health check
├── monitor-new-endpoints.js        # Real-time endpoint monitoring
├── debug-backend.js                # Backend debugging tool
└── test-cache-idb.js               # IndexedDB cache testing
```

---

## Core Testing Scripts

### 1. test-backend.js - Backend Connectivity

**Purpose**: Verify backend is accessible and responding

**Usage**:

```bash
node scripts/test-backend.js
```

**What It Tests**:

- ✅ Backend URL accessibility
- ✅ Health endpoint (`/health` or `/`)
- ✅ Response time
- ✅ HTTP status codes
- ✅ CORS headers

**Expected Output**:

```
=== Backend Connectivity Test ===
Backend URL: https://cidadao-api-production.up.railway.app
Testing endpoint: /
✓ Backend is accessible
✓ Response time: 245ms
✓ Status: 200 OK
✓ CORS headers present

=== Test Summary ===
All checks passed ✓
```

**Use Cases**:

- Before starting development
- After backend deployment
- Debugging connection issues
- Verifying environment variables

---

### 2. test-chat-api.js - Chat API Integration

**Purpose**: Test chat API endpoints with real requests

**Usage**:

```bash
node scripts/test-chat-api.js
```

**What It Tests**:

- ✅ POST `/api/v1/chat/message` endpoint
- ✅ Request/response format
- ✅ Agent routing
- ✅ Error handling
- ✅ Response structure validation

**Expected Output**:

```
=== Chat API Integration Test ===
Sending test message: "Olá, como funciona a transparência?"

Request sent...
✓ Response received in 1247ms
✓ Session ID: session_1706198450123
✓ Agent: Abaporu (Orchestrator)
✓ Message length: 156 characters
✓ Confidence: 0.92

Response preview:
"Olá! O sistema de transparência do Cidadão.AI permite..."

=== Validation ===
✓ Response structure valid
✓ All required fields present
✓ Agent routing correct

Test passed ✓
```

**Use Cases**:

- Verify chat integration after backend changes
- Test different message types
- Validate response formats
- Debug chat issues

---

### 3. test-chat-live.js - Live Chat Testing

**Purpose**: Interactive chat testing with Railway production backend

**Usage**:

```bash
node scripts/test-chat-live.js
```

**What It Tests**:

- ✅ Full chat flow (send → receive → display)
- ✅ Multiple messages in session
- ✅ Session persistence
- ✅ Agent responses quality
- ✅ Error recovery

**Expected Output**:

```
=== Live Chat Test ===
Backend: https://cidadao-api-production.up.railway.app
Session ID: session_1706198450456

Enter message (or 'exit' to quit): Analisar contratos públicos

Sending...
✓ Message sent

Abaporu: Vou analisar os contratos públicos para você. Iniciando investigação...

✓ Response received in 1523ms
✓ Session maintained

Enter message (or 'exit' to quit): Mostrar anomalias

Sending...
✓ Message sent

Zumbi dos Palmares: Detectei 3 possíveis anomalias nos contratos:
1. Desvio de preço de 250% acima da média
2. Concentração em fornecedor único
3. Similaridade suspeita entre propostas

✓ Response received in 2341ms
✓ Agent switch detected (Abaporu → Zumbi)

Enter message (or 'exit' to quit): exit

=== Test Summary ===
Messages sent: 2
Responses received: 2
Average response time: 1932ms
Agents used: Abaporu, Zumbi dos Palmares
Session stable: ✓

Test completed ✓
```

**Use Cases**:

- Manual feature testing
- Agent behavior validation
- Response quality assessment
- Long conversation testing

---

### 4. test-chat-persistence.js - Session Persistence

**Purpose**: Test Supabase chat session persistence

**Usage**:

```bash
node scripts/test-chat-persistence.js
```

**What It Tests**:

- ✅ Session creation in Supabase
- ✅ Message storage
- ✅ Session retrieval
- ✅ Message history
- ✅ Cross-device sync

**Expected Output**:

```
=== Chat Persistence Test ===

Step 1: Create session
✓ Session created: session_test_1706198450789
✓ Stored in Supabase

Step 2: Send messages
✓ Message 1 saved
✓ Message 2 saved
✓ Message 3 saved

Step 3: Retrieve session
✓ Session retrieved from Supabase
✓ 6 messages found (3 user + 3 assistant)
✓ Message order preserved
✓ Timestamps correct

Step 4: Test pagination
✓ Cursor pagination works
✓ 20 messages per page
✓ Previous/Next navigation

Step 5: Cleanup
✓ Test session deleted

Test passed ✓
```

**Use Cases**:

- Verify Supabase integration
- Test session recovery
- Debug persistence issues
- Validate pagination

---

### 5. test-vlibras.js - VLibras Integration

**Purpose**: Test VLibras (LIBRAS) widget integration

**Usage**:

```bash
node scripts/test-vlibras.js
```

**What It Tests**:

- ✅ VLibras package installation
- ✅ Widget rendering
- ✅ PT-only loading
- ✅ Avatar selection
- ✅ User preference persistence

**Expected Output**:

```
=== VLibras Integration Test ===

Step 1: Package check
✓ @djpfs/react-vlibras installed (v2.0.2)

Step 2: Component import
✓ VLibrasWidget component exists
✓ useVLibras hook available

Step 3: Locale detection
✓ Widget loads on PT pages
✓ Widget does NOT load on EN pages

Step 4: Preference persistence
✓ localStorage key exists
✓ Preference saves correctly
✓ Preference persists across reload

Step 5: Avatar selection
✓ Guga avatar selectable
✓ Ícaro avatar selectable
✓ Hozana avatar selectable
✓ Selection persists

Step 6: CSP compliance
✓ iframe-src: vlibras.gov.br allowed
✓ script-src: vlibras.gov.br allowed

Test passed ✓
```

**Use Cases**:

- Verify VLibras setup
- Test accessibility features
- Debug LIBRAS widget issues
- Validate PT-only loading

---

## Monitoring Scripts

### 6. check-backend-status.js - Health Check

**Purpose**: Quick backend health check

**Usage**:

```bash
node scripts/check-backend-status.js
```

**Output**:

```
Backend Status: ✓ HEALTHY
Response Time: 234ms
Uptime: 99.9%
```

---

### 7. monitor-new-endpoints.js - Real-time Monitoring

**Purpose**: Continuously monitor backend endpoints

**Usage**:

```bash
node scripts/monitor-new-endpoints.js
```

**What It Does**:

- ✅ Polls endpoints every 30 seconds
- ✅ Tracks response times
- ✅ Detects errors
- ✅ Shows uptime statistics

**Output**:

```
=== Endpoint Monitor ===
[14:30:15] ✓ /api/v1/chat/message - 245ms
[14:30:45] ✓ /api/v1/chat/message - 267ms
[14:31:15] ✗ /api/v1/chat/message - TIMEOUT
[14:31:45] ✓ /api/v1/chat/message - 312ms

Statistics (last 1 hour):
Success rate: 98.5%
Avg response time: 274ms
Max response time: 1243ms
Errors: 3 (timeouts)
```

**Use Cases**:

- Monitor backend stability
- Detect performance degradation
- Track uptime
- Alert on issues

---

### 8. debug-backend.js - Debugging Tool

**Purpose**: Detailed backend debugging

**Usage**:

```bash
node scripts/debug-backend.js
```

**Features**:

- ✅ Request/response inspection
- ✅ Header analysis
- ✅ Error stack traces
- ✅ Network timing breakdown

---

## Cache & Performance Scripts

### 9. test-cache-idb.js - IndexedDB Cache

**Purpose**: Test IndexedDB caching functionality

**Usage**:

```bash
node scripts/test-cache-idb.js
```

**What It Tests**:

- ✅ IndexedDB initialization
- ✅ Cache write/read operations
- ✅ TTL expiration
- ✅ Cache invalidation
- ✅ Storage quota

**Expected Output**:

```
=== IndexedDB Cache Test ===

Step 1: Initialize database
✓ Database created: cidadao-ai-cache
✓ Object store: chat-cache

Step 2: Write to cache
✓ Write successful
✓ Size: 2.4 KB

Step 3: Read from cache
✓ Read successful
✓ Data matches

Step 4: TTL expiration
✓ Item expires after 5 minutes
✓ Expired items auto-deleted

Step 5: Storage quota
✓ Available: 50 MB
✓ Used: 124 KB (0.2%)

Step 6: Cleanup
✓ Cache cleared

Test passed ✓
```

---

## UX & Accessibility Scripts

### 10. analyze-ux-design.js - UX Analysis

**Purpose**: Analyze UX design patterns

**Usage**:

```bash
node scripts/analyze-ux-design.js
```

**Outputs**:

- Screenshots of public pages
- UX analysis report (JSON)
- Design pattern identification

---

### 11. check-wcag-contrast.js - Contrast Checker

**Purpose**: WCAG color contrast validation

**Usage**:

```bash
node scripts/check-wcag-contrast.js
```

**Checks**:

- Color contrast ratios
- WCAG AA/AAA compliance
- Text readability

---

## Running All Tests

### Sequential Execution

```bash
# Core tests
node scripts/test-backend.js && \
node scripts/test-chat-api.js && \
node scripts/test-chat-persistence.js && \
node scripts/test-vlibras.js && \
node scripts/test-cache-idb.js

# Output: All tests passed ✓
```

### Create Test Suite Script

```bash
#!/bin/bash
# scripts/run-all-tests.sh

echo "=== Running All Manual Tests ==="

tests=(
  "test-backend.js"
  "test-chat-api.js"
  "test-chat-persistence.js"
  "test-vlibras.js"
  "test-cache-idb.js"
)

passed=0
failed=0

for test in "${tests[@]}"; do
  echo ""
  echo "Running: $test"
  if node "scripts/$test"; then
    ((passed++))
  else
    ((failed++))
  fi
done

echo ""
echo "=== Test Summary ==="
echo "Passed: $passed"
echo "Failed: $failed"

if [ $failed -eq 0 ]; then
  echo "All tests passed ✓"
  exit 0
else
  echo "Some tests failed ✗"
  exit 1
fi
```

---

## Integration with CI/CD

### GitHub Actions (Future)

```yaml
# .github/workflows/manual-tests.yml
name: Manual Integration Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run backend connectivity test
        run: node scripts/test-backend.js

      - name: Run chat API test
        run: node scripts/test-chat-api.js

      - name: Run VLibras test
        run: node scripts/test-vlibras.js

      - name: Report results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
```

---

## Best Practices

### 1. Run Before PR

```bash
# Always run before creating PR
npm run lint && \
npm run type-check && \
node scripts/test-backend.js && \
node scripts/test-chat-api.js
```

### 2. Environment Variables

Ensure correct environment setup:

```bash
# Check environment
echo $NEXT_PUBLIC_API_URL

# Should output:
# https://cidadao-api-production.up.railway.app
```

### 3. Error Handling

Scripts should exit with proper codes:

```javascript
// In test script
if (testFailed) {
  console.error('✗ Test failed')
  process.exit(1) // Exit code 1 = failure
}

console.log('✓ Test passed')
process.exit(0) // Exit code 0 = success
```

### 4. Verbose Output

Use `--verbose` for debugging:

```bash
node scripts/test-backend.js --verbose
```

---

## Troubleshooting

### Script Fails: "Backend not accessible"

**Check**:

1. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
2. Check Railway backend is deployed
3. Test URL in browser
4. Check network/firewall

**Fix**:

```bash
# Verify environment
cat .env.local | grep API_URL

# Test URL directly
curl https://cidadao-api-production.up.railway.app/
```

### Script Fails: "Module not found"

**Check**:

1. Run `npm install`
2. Verify script imports

**Fix**:

```bash
npm install
```

### Script Hangs Indefinitely

**Check**:

1. Backend timeout too long
2. Infinite loop in test
3. Missing error handling

**Fix**:
Add timeout:

```javascript
setTimeout(() => {
  console.error('Timeout after 30s')
  process.exit(1)
}, 30000)
```

---

## Creating New Test Scripts

### Template

```javascript
#!/usr/bin/env node
/**
 * Test Script: [Feature Name]
 *
 * Purpose: [What this script tests]
 * Usage: node scripts/test-[feature].js
 */

const { API_BASE_URL } = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function main() {
  console.log('=== [Feature] Test ===\n')

  try {
    // Step 1: Setup
    console.log('Step 1: Setup')
    // ...
    console.log('✓ Setup complete\n')

    // Step 2: Test
    console.log('Step 2: Test [something]')
    // ...
    console.log('✓ Test passed\n')

    // Step 3: Cleanup
    console.log('Step 3: Cleanup')
    // ...
    console.log('✓ Cleanup complete\n')

    console.log('=== Test Summary ===')
    console.log('All checks passed ✓')
    process.exit(0)
  } catch (error) {
    console.error('\n✗ Test failed:', error.message)
    if (process.argv.includes('--verbose')) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

main()
```

---

## Related Documentation

- [Testing Strategy](./guides/TESTING.md)
- [Backend Integration](./frontend-backend-integration-analysis.md)
- [Chat API](./technical/integration/FRONTEND_CHAT_INTEGRATION.md)
- [VLibras Integration](./accessibility-vlibras.md)
- [Telemetry System](./telemetry-system.md)

---

**Maintained by**: Frontend Team
**Last Review**: 2025-01-25
**Next Review**: 2025-04-25 (Quarterly)
