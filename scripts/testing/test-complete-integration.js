/**
 * Complete Backend Integration Test
 * Tests ALL endpoints documented in the backend integration guide
 */

const API_BASE = 'https://cidadao-api-production.up.railway.app'

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
}

function log(msg, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`)
}

async function test(name, url, options = {}) {
  try {
    const response = await fetch(url, options)
    const data = await response.json()

    if (response.ok) {
      log(`✅ ${name}`, colors.green)
      return { success: true, data }
    } else {
      log(`❌ ${name} (${response.status})`, colors.red)
      return { success: false, data }
    }
  } catch (err) {
    log(`❌ ${name}: ${err.message}`, colors.red)
    return { success: false, error: err.message }
  }
}

async function run() {
  log('\n🚀 Backend Integration Tests\n', colors.cyan)

  let passed = 0,
    total = 0

  // 1. Health
  total++
  const health = await test('Health Check', `${API_BASE}/health/`)
  if (health.success) passed++

  // 2. Agents
  total++
  const agents = await test('List Agents', `${API_BASE}/api/v1/chat/agents`)
  if (agents.success) {
    passed++
    log(`   Found ${agents.data.length} agents`, colors.cyan)
  }

  // 3. Chat
  total++
  const chat = await test('Chat Message', `${API_BASE}/api/v1/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Olá' }),
  })
  if (chat.success) {
    passed++
    log(`   Agent: ${chat.data.agent_name}`, colors.cyan)
  }

  // 4. Agent Status
  total++
  const status = await test('Agent Status', `${API_BASE}/api/v1/agents/status`)
  if (status.success) passed++

  // 5. IBGE States
  total++
  const states = await test('IBGE States', `${API_BASE}/api/v1/federal/ibge/states`)
  if (states.success) passed++

  // Results
  const rate = ((passed / total) * 100).toFixed(1)
  log(`\n📊 Results: ${passed}/${total} (${rate}%)`, rate >= 80 ? colors.green : colors.yellow)
  log('', colors.reset)
}

run()
