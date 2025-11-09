/**
 * Teste detalhado do endpoint de chat
 */

const API_URL = 'https://cidadao-api-production.up.railway.app'

async function testChatEndpoint() {
  console.log('🔍 Teste Detalhado do Endpoint de Chat\n')

  const testMessages = [
    { message: 'Olá' },
    { message: 'Olá', session_id: 'test-123' },
    { message: 'Quero investigar contratos', session_id: 'test-123' },
    { message: 'Me ajude a entender o Cidadão.AI', session_id: 'test-456' },
  ]

  for (const payload of testMessages) {
    console.log(`\n📨 Testando mensagem: "${payload.message}"`)
    if (payload.session_id) {
      console.log(`   Session ID: ${payload.session_id}`)
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      console.log(`   Status: ${response.status}`)
      console.log('   Resposta completa:')
      console.log(JSON.stringify(data, null, 2))
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`)
    }

    console.log('-'.repeat(60))
  }

  // Testar também as sugestões
  console.log('\n📋 Testando Sugestões:')
  try {
    const response = await fetch(`${API_URL}/api/v1/chat/suggestions`)
    const suggestions = await response.json()
    console.log(JSON.stringify(suggestions, null, 2))
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`)
  }
}

testChatEndpoint()
