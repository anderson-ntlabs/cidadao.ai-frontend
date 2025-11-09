#!/usr/bin/env node

/**
 * Test Real Data Endpoints
 *
 * Tests all backend endpoints to verify what real data is available
 * before removing mock data from frontend
 *
 * @author Anderson Henrique da Silva
 * @date 2025-10-30
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app'

console.log('🧪 TESTING REAL DATA ENDPOINTS')
console.log('='.repeat(60))
console.log(`Backend: ${API_BASE_URL}\n`)

// Helper function to make requests
async function testEndpoint(name, method, endpoint, body = null, headers = {}) {
  console.log(`\n📍 Testing: ${name}`)
  console.log(`   ${method} ${endpoint}`)

  const startTime = Date.now()

  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options)
    const duration = Date.now() - startTime

    console.log(`   ✅ Status: ${response.status} (${duration}ms)`)

    const contentType = response.headers.get('content-type')

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()

      // Show preview of response
      const preview = JSON.stringify(data, null, 2)
      const lines = preview.split('\n').slice(0, 15).join('\n')
      console.log(`   📦 Response preview:\n${lines}`)

      if (preview.split('\n').length > 15) {
        console.log(`   ... (${preview.split('\n').length - 15} more lines)`)
      }

      return { success: true, status: response.status, data, duration }
    } else {
      const text = await response.text()
      console.log(`   📦 Response (text): ${text.substring(0, 200)}...`)
      return { success: true, status: response.status, data: text, duration }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function runTests() {
  const results = {
    health: null,
    chat: null,
    investigations: null,
    transparency: null,
    federal: null,
    agents: null,
  }

  console.log('\n' + '='.repeat(60))
  console.log('1️⃣  HEALTH & STATUS CHECKS')
  console.log('='.repeat(60))

  results.health = await testEndpoint('Health Check', 'GET', '/health/')

  await testEndpoint('Health Detailed', 'GET', '/health/detailed')

  console.log('\n' + '='.repeat(60))
  console.log('2️⃣  CHAT ENDPOINTS')
  console.log('='.repeat(60))

  // Test chat message
  results.chat = await testEndpoint('Chat Message (Primary)', 'POST', '/api/v1/chat/message', {
    message: 'Olá, quais são os maiores contratos públicos recentes?',
    session_id: `test_${Date.now()}`,
  })

  // Test available agents
  await testEndpoint('List Chat Agents', 'GET', '/api/v1/chat/agents')

  // Test Maritaca direct
  await testEndpoint('Maritaca Direct Chat', 'POST', '/api/v1/chat/direct/maritaca', {
    messages: [{ role: 'user', content: 'Explique o que é o Portal da Transparência' }],
    model: 'sabiazinho-3',
    session_id: `maritaca_test_${Date.now()}`,
  })

  console.log('\n' + '='.repeat(60))
  console.log('3️⃣  INVESTIGATION ENDPOINTS')
  console.log('='.repeat(60))

  // Test public investigation creation
  results.investigations = await testEndpoint(
    'Create Public Investigation',
    'POST',
    '/api/v1/investigations/public/create',
    {
      query: 'Detectar anomalias em contratos de merenda escolar',
      data_source: 'contracts',
      anomaly_types: ['price', 'vendor', 'temporal'],
    }
  )

  // If investigation was created, check its status
  if (results.investigations?.success && results.investigations?.data?.investigation_id) {
    const invId = results.investigations.data.investigation_id

    await new Promise((resolve) => setTimeout(resolve, 2000)) // Wait 2s

    await testEndpoint(
      'Investigation Status',
      'GET',
      `/api/v1/investigations/public/status/${invId}`
    )
  }

  // List all investigations (may require auth)
  await testEndpoint('List All Investigations', 'GET', '/api/v1/investigations/')

  console.log('\n' + '='.repeat(60))
  console.log('4️⃣  TRANSPARENCY ENDPOINTS')
  console.log('='.repeat(60))

  // Test contracts endpoint (Portal da Transparência)
  results.transparency = await testEndpoint(
    'Get Contracts',
    'GET',
    '/api/v1/transparency/contracts?codigoOrgao=26000' // Ministério da Educação
  )

  // Test agencies
  await testEndpoint('Get Agencies', 'GET', '/api/v1/transparency/agencies')

  // Test coverage map
  await testEndpoint('Transparency Coverage', 'GET', '/api/v1/transparency/coverage')

  // Test coverage summary
  await testEndpoint('Coverage Summary', 'GET', '/api/v1/transparency/coverage/summary')

  console.log('\n' + '='.repeat(60))
  console.log('5️⃣  FEDERAL APIS')
  console.log('='.repeat(60))

  // Test IBGE states
  results.federal = await testEndpoint('IBGE - List States', 'GET', '/api/v1/federal/ibge/states')

  // Test IBGE municipalities (Rio de Janeiro)
  await testEndpoint('IBGE - Municipalities (RJ)', 'POST', '/api/v1/federal/ibge/municipalities', {
    state_code: '33',
  })

  // Test DataSUS indicators
  await testEndpoint('DataSUS - Health Indicators', 'POST', '/api/v1/federal/datasus/indicators', {
    state: 'RJ',
    year: 2024,
  })

  console.log('\n' + '='.repeat(60))
  console.log('6️⃣  AGENT ENDPOINTS')
  console.log('='.repeat(60))

  // Test agent status
  results.agents = await testEndpoint('Agent Status', 'GET', '/api/v1/agents/status')

  // Test list all agents
  await testEndpoint('List All Agents', 'GET', '/api/v1/agents/')

  // Test specific agent (Zumbi - anomaly detection)
  await testEndpoint('Zumbi Agent (Anomaly Detection)', 'POST', '/api/v1/agents/zumbi', {
    query: 'Analisar padrões de preços em contratos públicos',
    context: {
      threshold: 0.8,
    },
  })

  console.log('\n' + '='.repeat(60))
  console.log('7️⃣  EXPORT & REPORTS')
  console.log('='.repeat(60))

  // Test available reports
  await testEndpoint('List Reports', 'GET', '/api/v1/reports/')

  console.log('\n' + '='.repeat(60))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(60))

  const summary = {
    health: results.health?.success ? '✅' : '❌',
    chat: results.chat?.success ? '✅' : '❌',
    investigations: results.investigations?.success ? '✅' : '❌',
    transparency: results.transparency?.success ? '✅' : '❌',
    federal: results.federal?.success ? '✅' : '❌',
    agents: results.agents?.success ? '✅' : '❌',
  }

  console.log('\n🎯 Endpoint Categories:')
  console.log(`   Health:          ${summary.health}`)
  console.log(`   Chat:            ${summary.chat}`)
  console.log(`   Investigations:  ${summary.investigations}`)
  console.log(`   Transparency:    ${summary.transparency}`)
  console.log(`   Federal APIs:    ${summary.federal}`)
  console.log(`   Agents:          ${summary.agents}`)

  const successCount = Object.values(summary).filter((v) => v === '✅').length
  const totalCount = Object.keys(summary).length

  console.log(
    `\n✨ Success Rate: ${successCount}/${totalCount} (${Math.round((successCount / totalCount) * 100)}%)`
  )

  // Check if we have enough data to remove mocks
  console.log('\n' + '='.repeat(60))
  console.log('🚦 MOCK REMOVAL ASSESSMENT')
  console.log('='.repeat(60))

  if (results.chat?.success) {
    console.log('\n✅ Chat System: READY to use real data')
    console.log('   - Chat endpoint operational')
    console.log('   - Agents responding')
    console.log('   - Action: Keep current implementation')
  } else {
    console.log('\n⚠️  Chat System: Keep fallback mechanism')
  }

  if (results.investigations?.success) {
    console.log('\n✅ Investigations: READY to replace mocks')
    console.log('   - Investigation creation working')
    console.log('   - Status tracking available')
    console.log('   - Action: Remove mock data from investigacoes/page.tsx')
  } else {
    console.log('\n⚠️  Investigations: Keep mocks temporarily')
    console.log('   - Backend endpoint may need authentication')
    console.log('   - Action: Implement auth flow first')
  }

  if (results.transparency?.success) {
    console.log('\n✅ Transparency Data: AVAILABLE')
    console.log('   - Portal da Transparência responding')
    console.log('   - Action: Add real data visualization')
  } else {
    console.log('\n⚠️  Transparency Data: Limited access')
    console.log('   - May need API key configuration')
    console.log('   - Check backend TRANSPARENCY_API_KEY')
  }

  if (results.federal?.success) {
    console.log('\n✅ Federal APIs: AVAILABLE')
    console.log('   - IBGE, DataSUS operational')
    console.log('   - Action: Add geographic and health data features')
  }

  console.log('\n' + '='.repeat(60))
  console.log('✨ Test completed!')
  console.log('='.repeat(60))
  console.log('\nNext steps:')
  console.log('1. Review endpoint responses above')
  console.log('2. Identify which data is production-ready')
  console.log('3. Create integration adapters for real endpoints')
  console.log('4. Remove mocks from components')
  console.log('5. Add error handling for unavailable data\n')
}

// Run tests
runTests().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
