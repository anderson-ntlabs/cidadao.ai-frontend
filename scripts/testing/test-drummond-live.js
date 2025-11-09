/**
 * Teste ao vivo do Carlos Drummond com Maritaca AI
 */

const API_URL = 'https://cidadao-api-production.up.railway.app'

async function testDrummond() {
  console.log('🎭 Testando Carlos Drummond de Andrade com Maritaca AI\n')
  console.log('Backend:', API_URL)
  console.log('Modelo: Sabiazinho-3')
  console.log('='.repeat(60) + '\n')

  const testMessages = [
    'Olá Drummond, como você está?',
    'Me fale sobre o Cidadão.AI',
    'Quero investigar contratos suspeitos',
    'O que você acha da transparência no governo?',
  ]

  for (const message of testMessages) {
    console.log(`\n📤 Usuário: "${message}"`)

    const startTime = Date.now()

    try {
      const response = await fetch(`${API_URL}/api/v1/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          session_id: `test-drummond-${Date.now()}`,
        }),
      })

      const data = await response.json()
      const duration = Date.now() - startTime

      console.log(`\n📥 ${data.agent_name || 'Resposta'}:`)
      console.log(`   "${data.message}"`)
      console.log(`\n⏱️  Tempo de resposta: ${duration}ms`)
      console.log(`🎯 Confiança: ${(data.confidence * 100).toFixed(0)}%`)

      if (data.metadata?.is_demo_mode) {
        console.log(`⚠️  AINDA EM MODO DEMO`)
      } else {
        console.log(`✅ MODO PRODUÇÃO ATIVO!`)
      }

      if (data.metadata?.model_used) {
        console.log(`🤖 Modelo: ${data.metadata.model_used}`)
      }
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`)
    }

    console.log('\n' + '-'.repeat(60))

    // Aguarda um pouco entre mensagens
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  console.log('\n✅ Teste concluído!')
  console.log('\nPróximos passos:')
  console.log('1. Se ainda em modo demo: Aguardar deploy completar no HuggingFace')
  console.log('2. Se funcionando: Desabilitar demo mode no frontend')
  console.log('3. Testar integração completa no navegador')
}

testDrummond()
