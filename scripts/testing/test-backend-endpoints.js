#!/usr/bin/env node

/**
 * Backend Endpoint Testing Script
 *
 * Tests all critical endpoints of the Cidadão.AI backend API
 * to ensure proper functionality and response times.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app'

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title) {
  console.log('\n' + '='.repeat(60))
  log(title, 'cyan')
  console.log('='.repeat(60))
}

async function testEndpoint(name, url, options = {}) {
  const startTime = Date.now()

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    const duration = Date.now() - startTime
    const data = await response.json().catch(() => null)

    const status = response.ok ? 'PASS' : 'FAIL'
    const statusColor = response.ok ? 'green' : 'red'

    log(`\n[${status}] ${name}`, statusColor)
    log(`  URL: ${url}`, 'gray')
    log(`  Status: ${response.status}`, response.ok ? 'green' : 'red')
    log(`  Duration: ${duration}ms`, duration < 1000 ? 'green' : duration < 3000 ? 'yellow' : 'red')

    if (data) {
      log(`  Response: ${JSON.stringify(data, null, 2).substring(0, 200)}...`, 'gray')
    }

    return {
      name,
      url,
      status: response.status,
      ok: response.ok,
      duration,
      data,
    }
  } catch (error) {
    const duration = Date.now() - startTime

    log(`\n[FAIL] ${name}`, 'red')
    log(`  URL: ${url}`, 'gray')
    log(`  Error: ${error.message}`, 'red')
    log(`  Duration: ${duration}ms`, 'gray')

    return {
      name,
      url,
      status: 0,
      ok: false,
      duration,
      error: error.message,
    }
  }
}

async function runTests() {
  log('\n🚀 Cidadão.AI Backend API Testing', 'blue')
  log(`📡 Testing: ${API_URL}\n`, 'blue')

  const results = []

  // ============================================================================
  // SECTION 1: Health & System Endpoints
  // ============================================================================
  logSection('1️⃣  Health & System Endpoints')

  results.push(await testEndpoint('Root Endpoint', `${API_URL}/`))

  results.push(await testEndpoint('Health Check', `${API_URL}/health`))

  results.push(await testEndpoint('API Documentation', `${API_URL}/docs`))

  // ============================================================================
  // SECTION 2: Agent Endpoints
  // ============================================================================
  logSection('2️⃣  Multi-Agent System Endpoints')

  results.push(await testEndpoint('List Available Agents', `${API_URL}/api/v1/agents/`))

  results.push(await testEndpoint('Agent Status', `${API_URL}/api/v1/agents/status`))

  results.push(
    await testEndpoint('Zumbi Agent (Anomaly Detection)', `${API_URL}/api/v1/agents/zumbi`, {
      method: 'POST',
      body: {
        query: 'Analyze contratos públicos',
        context: {},
      },
    })
  )

  results.push(
    await testEndpoint(
      'Tiradentes Agent (Report Generation)',
      `${API_URL}/api/v1/agents/tiradentes`,
      {
        method: 'POST',
        body: {
          query: 'Generate report summary',
          context: {},
        },
      }
    )
  )

  // ============================================================================
  // SECTION 3: Chat & Analysis Endpoints
  // ============================================================================
  logSection('3️⃣  Chat & Analysis Endpoints')

  results.push(await testEndpoint('Chat Available Agents', `${API_URL}/api/v1/chat/agents`))

  results.push(await testEndpoint('Chat Cache Stats', `${API_URL}/api/v1/chat/cache/stats`))

  results.push(await testEndpoint('List Analyses', `${API_URL}/api/v1/analysis/`))

  // ============================================================================
  // SECTION 4: Transparency Data Endpoints
  // ============================================================================
  logSection('4️⃣  Transparency Data Endpoints')

  results.push(
    await testEndpoint('Transparency Coverage Map', `${API_URL}/api/v1/transparency/coverage/map`)
  )

  // Note: Skipping endpoints that may trigger rate limits or require parameters
  log('\n⚠️  Skipping endpoints that require specific parameters or may rate limit:', 'yellow')
  log('  - /api/v1/transparency/coverage/statistics (rate limited after map call)', 'gray')
  log('  - /api/v1/transparency/contracts (requires codigoOrgao)', 'gray')
  log('  - /api/v1/transparency/servants (requires CPF)', 'gray')

  // ============================================================================
  // RESULTS SUMMARY
  // ============================================================================
  logSection('📊 Test Results Summary')

  const passed = results.filter((r) => r.ok).length
  const failed = results.filter((r) => !r.ok).length
  const total = results.length
  const passRate = ((passed / total) * 100).toFixed(1)

  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / total
  const maxDuration = Math.max(...results.map((r) => r.duration))
  const minDuration = Math.min(...results.map((r) => r.duration))

  log(`\nTotal Tests: ${total}`, 'blue')
  log(`Passed: ${passed}`, 'green')
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green')
  log(`Pass Rate: ${passRate}%`, passRate >= 80 ? 'green' : 'red')

  log(`\nPerformance:`, 'blue')
  log(`  Average: ${avgDuration.toFixed(0)}ms`, avgDuration < 1000 ? 'green' : 'yellow')
  log(`  Fastest: ${minDuration}ms`, 'green')
  log(`  Slowest: ${maxDuration}ms`, maxDuration < 3000 ? 'green' : 'red')

  // Failed tests details
  if (failed > 0) {
    log('\n❌ Failed Tests:', 'red')
    results
      .filter((r) => !r.ok)
      .forEach((r) => {
        log(`  - ${r.name}`, 'red')
        log(`    Status: ${r.status}`, 'gray')
        if (r.error) log(`    Error: ${r.error}`, 'gray')
      })
  }

  // Slow tests
  const slowTests = results.filter((r) => r.duration > 2000)
  if (slowTests.length > 0) {
    log('\n⚠️  Slow Tests (>2s):', 'yellow')
    slowTests.forEach((r) => {
      log(`  - ${r.name}: ${r.duration}ms`, 'yellow')
    })
  }

  log('\n' + '='.repeat(60) + '\n', 'cyan')

  // Exit code
  process.exit(failed > 0 ? 1 : 0)
}

// Run tests
runTests().catch((error) => {
  log(`\n❌ Fatal Error: ${error.message}`, 'red')
  console.error(error)
  process.exit(1)
})
