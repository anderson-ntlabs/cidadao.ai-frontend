#!/usr/bin/env node

/**
 * Comprehensive Backend Testing Script
 *
 * Tests all chat endpoints with various scenarios and generates detailed report
 *
 * Usage:
 *   node scripts/test-backend-comprehensive.js
 *   node scripts/test-backend-comprehensive.js --mode=cidadao
 *   node scripts/test-backend-comprehensive.js --mode=maritaca
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app'

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function header(title) {
  const line = '='.repeat(70)
  log(`\n${line}`, colors.cyan)
  log(title, colors.bright + colors.cyan)
  log(`${line}\n`, colors.cyan)
}

// Test results tracker
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  errors: [],
}

/**
 * Test a single endpoint
 */
async function runTest(testCase) {
  results.total++

  log(`\n🧪 ${testCase.name}`, colors.bright)
  log(`   Description: ${testCase.description}`, colors.blue)

  try {
    const startTime = Date.now()

    const response = await fetch(testCase.url, {
      method: testCase.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...testCase.headers,
      },
      body: JSON.stringify(testCase.body),
    })

    const duration = Date.now() - startTime
    const data = await response.json()

    // Validate response
    const validation = testCase.validate(response, data)

    if (validation.passed) {
      results.passed++
      log(`   ✅ PASS (${duration}ms)`, colors.green)
      if (validation.message) {
        log(`      ${validation.message}`, colors.green)
      }
    } else {
      results.failed++
      log(`   ❌ FAIL (${duration}ms)`, colors.red)
      log(`      Reason: ${validation.message}`, colors.red)

      results.errors.push({
        test: testCase.name,
        reason: validation.message,
        response: data,
        expected: testCase.expected,
      })
    }

    // Show response preview
    if (testCase.showResponse && data) {
      log(`\n   📄 Response:`, colors.blue)
      log(
        `   ${JSON.stringify(data, null, 2)
          .split('\n')
          .map((l) => '   ' + l)
          .join('\n')}`,
        colors.blue
      )
    }

    return { passed: validation.passed, duration, data }
  } catch (error) {
    results.failed++
    log(`   ❌ ERROR: ${error.message}`, colors.red)

    results.errors.push({
      test: testCase.name,
      reason: error.message,
      error: error,
    })

    return { passed: false, duration: 0, error }
  }
}

/**
 * Test Suite: Cidadão.AI Mode (Multi-Agent)
 */
const cidadaoTests = [
  {
    name: 'TC001: Basic Chat Request',
    description: 'Send simple greeting to Cidadão.AI',
    url: `${API_BASE_URL}/api/v1/chat`,
    body: {
      message: 'Olá, como você pode me ajudar?',
      session_id: `test_tc001_${Date.now()}`,
    },
    validate: (res, data) => {
      if (data.status === 'error') {
        return {
          passed: false,
          message: `Error: ${data.error}`,
        }
      }

      if (!data.message || data.message.length === 0) {
        return {
          passed: false,
          message: 'Empty response message',
        }
      }

      return {
        passed: true,
        message: `Agent: ${data.agent_name || data.agent_id}`,
      }
    },
    showResponse: false,
  },

  {
    name: 'TC002: Anomaly Detection (Anita Garibaldi)',
    description: 'Request anomaly analysis',
    url: `${API_BASE_URL}/api/v1/chat`,
    body: {
      message: 'Analisar anomalias em licitações',
      session_id: `test_tc002_${Date.now()}`,
    },
    validate: (res, data) => {
      if (data.status === 'error') {
        return {
          passed: false,
          message: `Backend Error: ${typeof data.error === 'object' ? JSON.stringify(data.error) : data.error}`,
        }
      }

      const expectedAgents = ['anita', 'abaporu']
      const agentMatch = expectedAgents.includes(data.agent_id?.toLowerCase())

      return {
        passed: agentMatch && data.message,
        message: agentMatch
          ? `Correct agent: ${data.agent_name}`
          : `Wrong agent: ${data.agent_id} (expected: anita or abaporu)`,
      }
    },
    showResponse: true,
  },

  {
    name: 'TC003: Investigation Request (Zumbi)',
    description: 'Request contract investigation',
    url: `${API_BASE_URL}/api/v1/chat`,
    body: {
      message: 'Investigar contratos suspeitos',
      session_id: `test_tc003_${Date.now()}`,
    },
    validate: (res, data) => {
      if (data.status === 'error') {
        return {
          passed: false,
          message: `Backend Error: ${data.error}`,
        }
      }

      return {
        passed: !!data.message,
        message: `Response length: ${data.message?.length || 0} chars`,
      }
    },
    showResponse: false,
  },

  {
    name: 'TC004: Public Spending Report',
    description: 'Request gastos públicos report',
    url: `${API_BASE_URL}/api/v1/chat`,
    body: {
      message: 'Relatório de gastos públicos',
      session_id: `test_tc004_${Date.now()}`,
    },
    validate: (res, data) => {
      if (data.status === 'error') {
        return { passed: false, message: `Error: ${data.error}` }
      }

      return {
        passed: !!data.message,
        message: `Agent: ${data.agent_name}`,
      }
    },
    showResponse: false,
  },
]

/**
 * Test Suite: Maritaca Direct Mode
 */
const maritacaTests = [
  {
    name: 'TC101: Sabiazinho-3 Basic',
    description: 'Test Sabiazinho-3 with simple question',
    url: `${API_BASE_URL}/api/v1/chat/direct/maritaca`,
    body: {
      messages: [{ role: 'user', content: 'Olá!' }],
      session_id: `test_tc101_${Date.now()}`,
      model: 'sabiazinho-3',
    },
    validate: (res, data) => {
      if (!data.content || data.content.length === 0) {
        return { passed: false, message: 'Empty response content' }
      }

      if (data.model !== 'sabiazinho-3') {
        return { passed: false, message: `Wrong model: ${data.model}` }
      }

      if (data.finish_reason !== 'stop') {
        return { passed: false, message: `Incomplete: ${data.finish_reason}` }
      }

      return {
        passed: true,
        message: `${data.usage?.total_tokens || 0} tokens used`,
      }
    },
    showResponse: false,
  },

  {
    name: 'TC102: Sabiá-3 Complex',
    description: 'Test Sabiá-3 with complex question (LAI)',
    url: `${API_BASE_URL}/api/v1/chat/direct/maritaca`,
    body: {
      messages: [{ role: 'user', content: 'Explique o que é a LAI (Lei de Acesso à Informação)' }],
      session_id: `test_tc102_${Date.now()}`,
      model: 'sabia-3',
    },
    validate: (res, data) => {
      if (!data.content) {
        return { passed: false, message: 'Empty content' }
      }

      // LAI explanation should be substantial (>200 chars)
      if (data.content.length < 200) {
        return { passed: false, message: `Response too short: ${data.content.length} chars` }
      }

      if (!data.content.toLowerCase().includes('acesso')) {
        return { passed: false, message: 'Response missing key terms' }
      }

      return {
        passed: true,
        message: `${data.content.length} chars, ${data.usage?.total_tokens} tokens`,
      }
    },
    showResponse: false,
  },
]

/**
 * Test Suite: Error Handling
 */
const errorTests = [
  {
    name: 'TC201: Empty Message',
    description: 'Send empty message',
    url: `${API_BASE_URL}/api/v1/chat`,
    body: {
      message: '',
      session_id: `test_tc201_${Date.now()}`,
    },
    validate: (res, data) => {
      // Should return error
      const isError = data.status === 'error' || res.status >= 400
      return {
        passed: isError,
        message: isError ? 'Correctly rejected' : 'Should have rejected empty message',
      }
    },
    showResponse: true,
  },

  {
    name: 'TC202: Very Long Message',
    description: 'Send message > 10000 chars',
    url: `${API_BASE_URL}/api/v1/chat`,
    body: {
      message: 'A'.repeat(10001),
      session_id: `test_tc202_${Date.now()}`,
    },
    validate: (res, data) => {
      const isError = data.status === 'error' || res.status >= 400
      return {
        passed: isError,
        message: isError ? 'Correctly rejected' : 'Should have rejected long message',
      }
    },
    showResponse: false,
  },

  {
    name: 'TC203: Invalid Session ID',
    description: 'Send SQL injection attempt in session_id',
    url: `${API_BASE_URL}/api/v1/chat`,
    body: {
      message: 'Hello',
      session_id: "'; DROP TABLE sessions;--",
    },
    validate: (res, data) => {
      const isError = data.status === 'error' || res.status >= 400
      return {
        passed: isError,
        message: isError ? 'Correctly rejected malicious input' : 'Security vulnerability!',
      }
    },
    showResponse: true,
  },
]

/**
 * Generate final report
 */
function generateReport() {
  header('📊 TEST REPORT')

  // Summary
  log('Summary:', colors.bright)
  log(`   Total Tests: ${results.total}`, colors.blue)
  log(
    `   ✅ Passed: ${results.passed} (${Math.round((results.passed / results.total) * 100)}%)`,
    colors.green
  )
  log(
    `   ❌ Failed: ${results.failed} (${Math.round((results.failed / results.total) * 100)}%)`,
    colors.red
  )

  // Pass rate indicator
  const passRate = results.passed / results.total
  let indicator = ''
  if (passRate >= 0.9) indicator = '🟢 EXCELLENT'
  else if (passRate >= 0.7) indicator = '🟡 GOOD'
  else if (passRate >= 0.5) indicator = '🟠 NEEDS WORK'
  else indicator = '🔴 CRITICAL'

  log(`\n   Overall: ${indicator}`, colors.bright)

  // Failed tests detail
  if (results.errors.length > 0) {
    log('\n❌ Failed Tests:', colors.red + colors.bright)
    results.errors.forEach((error, idx) => {
      log(`\n   ${idx + 1}. ${error.test}`, colors.red)
      log(`      Reason: ${error.reason}`, colors.yellow)
      if (error.response) {
        log(`      Response: ${JSON.stringify(error.response).substring(0, 100)}...`, colors.blue)
      }
    })
  }

  // Critical issues
  const criticalErrors = results.errors.filter(
    (e) => e.test.includes('TC001') || e.test.includes('TC002') || e.test.includes('TC003')
  )

  if (criticalErrors.length > 0) {
    log('\n🔴 CRITICAL ISSUES:', colors.red + colors.bright)
    criticalErrors.forEach((error) => {
      log(`   • ${error.test}: ${error.reason}`, colors.red)
    })
  }

  // Recommendations
  log('\n💡 Recommendations:', colors.cyan + colors.bright)
  if (results.failed === 0) {
    log('   ✅ All tests passed! Backend is working correctly.', colors.green)
  } else {
    log('   ⚠️  Review BACKEND_ERROR_REPORT_2025-10-29.md for details', colors.yellow)
    log('   ⚠️  Priority: Fix CidadaoAIError initialization', colors.yellow)
    log('   ⚠️  Contact backend team with this report', colors.yellow)
  }

  // Exit code
  process.exit(results.failed > 0 ? 1 : 0)
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2)
  const mode = args.find((a) => a.startsWith('--mode='))?.split('=')[1] || 'all'

  header('🧪 COMPREHENSIVE BACKEND TEST SUITE')
  log(`API Base URL: ${API_BASE_URL}`, colors.bright)
  log(`Mode: ${mode}`, colors.bright)
  log(`Date: ${new Date().toISOString()}\n`, colors.bright)

  // Run test suites based on mode
  if (mode === 'all' || mode === 'cidadao') {
    header('TEST SUITE 1: Cidadão.AI Mode (Multi-Agent)')
    for (const test of cidadaoTests) {
      await runTest(test)
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Rate limiting
    }
  }

  if (mode === 'all' || mode === 'maritaca') {
    header('TEST SUITE 2: Maritaca Direct Mode')
    for (const test of maritacaTests) {
      await runTest(test)
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Longer delay for Maritaca
    }
  }

  if (mode === 'all' || mode === 'errors') {
    header('TEST SUITE 3: Error Handling')
    for (const test of errorTests) {
      await runTest(test)
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  // Generate report
  generateReport()
}

// Run tests
main().catch((error) => {
  log(`\n💥 Fatal error: ${error.message}`, colors.red)
  console.error(error)
  process.exit(1)
})
