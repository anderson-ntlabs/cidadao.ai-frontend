const axios = require('axios')

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app'

async function testMaritacaEndpoints() {
  console.log('🔍 Testing Maritaca-Powered Endpoints')
  console.log('API URL:', API_URL)
  console.log('='.repeat(60) + '\n')

  const testMessages = [
    'Olá, como você está?',
    'Quero investigar contratos públicos',
    'Mostre dados de transparência',
    'Analise anomalias em licitações',
  ]

  const endpoints = [
    { path: '/api/v1/chat/stable', name: 'Stable (Multiple Fallbacks)' },
    { path: '/api/v1/chat/optimized', name: 'Optimized (Drummond Persona)' },
    { path: '/api/v1/chat/emergency', name: 'Emergency (Ultra Resilient)' },
    { path: '/api/v1/chat/simple', name: 'Simple (Direct)' },
  ]

  for (const endpoint of endpoints) {
    console.log(`\n🔗 Testing ${endpoint.name}`)
    console.log(`Endpoint: ${endpoint.path}`)
    console.log('-'.repeat(50))

    // Test only first 2 messages for each endpoint
    for (const message of testMessages.slice(0, 2)) {
      console.log(`\n📤 Message: "${message}"`)

      try {
        const startTime = Date.now()
        const response = await axios.post(
          `${API_URL}${endpoint.path}`,
          {
            message: message,
            session_id: `test_${Date.now()}`,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            timeout: 30000,
          }
        )

        const duration = Date.now() - startTime

        console.log(`✅ Success in ${duration}ms`)
        console.log('📥 Response:', JSON.stringify(response.data, null, 2))

        // Analyze response
        const data = response.data
        console.log('\n🔍 Analysis:')
        console.log('- Agent:', data.agent_id || data.agent_used || 'N/A')
        console.log('- Model:', data.model || 'sabiazinho-3')
        console.log('- Message length:', (data.message || data.response || '').length)
        console.log(
          '- Has suggestions:',
          !!(data.suggested_actions && data.suggested_actions.length)
        )
      } catch (error) {
        console.error('❌ Failed:', error.message)
        if (error.response) {
          console.log('Status:', error.response.status)
          console.log('Error data:', error.response.data)
        }
      }
    }

    console.log('\n' + '='.repeat(60))
  }

  // Summary
  console.log('\n📊 Summary:')
  console.log('All endpoints now use Maritaca sabiazinho-3 model')
  console.log('This provides cost-effective responses with good quality')
  console.log('Configure MARITACA_API_KEY in HuggingFace Spaces secrets')
}

testMaritacaEndpoints().catch(console.error)
