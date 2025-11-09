/**
 * Teste com mensagens simples para verificar o SimpleDrummondAgent
 */

const API_URL = 'https://cidadao-api-production.up.railway.app'

async function testSimpleMessages() {
  console.log('🧪 Testando mensagens simples com o SimpleDrummondAgent\n')

  const simpleMessages = [
    'Olá!',
    'Como funciona o sistema?',
    'Me ajude',
    'Obrigado',
    'Investigue contratos',
  ]

  for (const message of simpleMessages) {
    console.log(`\n📤 "${message}"`)

    try {
      const response = await fetch(`${API_URL}/api/v1/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          session_id: 'simple-test',
        }),
      })

      const data = await response.json()

      console.log(`📥 ${data.agent_name || 'Agent'}:`)
      console.log(`   "${data.message}"`)
      console.log(`   Intent: ${data.metadata?.intent_type || 'unknown'}`)
      console.log(`   Demo: ${data.metadata?.is_demo_mode ? 'SIM' : 'NÃO'}`)

      // Se não for mais modo demo, significa que funcionou!
      if (!data.metadata?.is_demo_mode && data.agent_name !== 'Sistema') {
        console.log(`\n✅ DRUMMOND ATIVADO COM SUCESSO!`)
      }
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`)
    }
  }
}

testSimpleMessages()
