/**
 * Verificação completa do status do backend
 */

const API_URL = 'https://cidadao-api-production.up.railway.app'

async function checkBackendStatus() {
  console.log('🔍 Verificação Completa do Backend Cidadão.AI\n')

  // 1. Check health
  console.log('1️⃣ Verificando Health Check...')
  try {
    const health = await fetch(`${API_URL}/health`)
    const healthData = await health.json()
    console.log('Status:', healthData.status)
    console.log('Versão:', healthData.version)
    console.log('Uptime:', Math.floor(healthData.uptime / 3600), 'horas')
    console.log('Serviços:', JSON.stringify(healthData.services, null, 2))
  } catch (e) {
    console.log('❌ Erro ao verificar health:', e.message)
  }

  console.log('\n' + '-'.repeat(60) + '\n')

  // 2. Check API docs
  console.log('2️⃣ Verificando se API Docs estão acessíveis...')
  try {
    const docs = await fetch(`${API_URL}/docs`)
    console.log('Docs status:', docs.status, docs.status === 200 ? '✅' : '❌')
  } catch (e) {
    console.log('❌ Erro:', e.message)
  }

  console.log('\n' + '-'.repeat(60) + '\n')

  // 3. Check specific endpoints
  console.log('3️⃣ Verificando endpoints específicos...')

  const endpoints = [
    { path: '/api/v1/chat/message', method: 'OPTIONS' },
    { path: '/api/v1/agents', method: 'GET' },
    { path: '/api/v1/chat/drummond', method: 'GET' },
    { path: '/api/v1/chat/status', method: 'GET' },
  ]

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_URL}${endpoint.path}`, {
        method: endpoint.method,
      })
      console.log(
        `${endpoint.method} ${endpoint.path}: ${response.status} ${response.status < 400 ? '✅' : '❌'}`
      )
    } catch (e) {
      console.log(`${endpoint.method} ${endpoint.path}: ❌ ${e.message}`)
    }
  }

  console.log('\n' + '-'.repeat(60) + '\n')

  // 4. Test with different payloads
  console.log('4️⃣ Testando diferentes formatos de requisição...')

  const testPayloads = [
    { message: 'Olá' },
    { message: 'Olá', agent_id: 'drummond' },
    { message: 'Olá', context: { agent: 'drummond' } },
    { query: 'Olá', session_id: 'test' }, // formato alternativo
  ]

  for (let i = 0; i < testPayloads.length; i++) {
    try {
      console.log(`\nTeste ${i + 1}: ${JSON.stringify(testPayloads[i])}`)
      const response = await fetch(`${API_URL}/api/v1/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayloads[i]),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Agent:', data.agent_name || data.agent_id || 'N/A')
        console.log('Demo mode:', data.metadata?.is_demo_mode ? 'SIM' : 'NÃO')
        console.log('Mensagem:', data.message?.substring(0, 50) + '...')
      } else {
        console.log('Status:', response.status)
      }
    } catch (e) {
      console.log('Erro:', e.message)
    }
  }

  console.log('\n' + '-'.repeat(60) + '\n')

  // 5. Check environment info
  console.log('5️⃣ Informações do ambiente...')
  try {
    const env = await fetch(`${API_URL}/api/v1/info`)
    if (env.ok) {
      const envData = await env.json()
      console.log('Ambiente:', JSON.stringify(envData, null, 2))
    } else {
      console.log('Endpoint /api/v1/info não disponível')
    }
  } catch (e) {
    console.log('Sem informações de ambiente disponíveis')
  }

  console.log('\n' + '='.repeat(60) + '\n')
  console.log('📊 Resumo:')
  console.log('- Se ainda em modo demo: Backend pode precisar de restart')
  console.log('- Verifique os logs do HuggingFace Spaces')
  console.log('- A Maritaca API key pode não estar configurada nos secrets')
}

checkBackendStatus()
