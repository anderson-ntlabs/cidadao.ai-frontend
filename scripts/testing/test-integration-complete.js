/**
 * Teste de integração completa - Frontend + Backend + Drummond + Maritaca
 */

// Simular ambiente do frontend
process.env.NEXT_PUBLIC_API_URL = 'https://cidadao-api-production.up.railway.app'

// Importar diretamente o código transpilado seria complexo, então vamos testar via HTTP

const API_URL = 'https://cidadao-api-production.up.railway.app'

async function testCompleteIntegration() {
  console.log('🚀 Teste de Integração Completa\n')
  console.log('Frontend → Backend → Drummond → Maritaca AI\n')
  console.log('='.repeat(60) + '\n')

  const testCases = [
    {
      name: 'Saudação Simples',
      message: 'Olá!',
      expectedIntent: 'greeting',
      expectedAgent: 'drummond',
    },
    {
      name: 'Pergunta sobre o Sistema',
      message: 'Como funciona o Cidadão.AI?',
      expectedIntent: 'help',
      expectedAgent: 'drummond',
    },
    {
      name: 'Solicitação de Investigação',
      message: 'Quero investigar contratos de saúde em São Paulo',
      expectedIntent: 'investigate',
      expectedAgent: 'drummond',
    },
    {
      name: 'Pergunta sobre Transparência',
      message: 'Por que a transparência pública é importante?',
      expectedIntent: 'question',
      expectedAgent: 'drummond',
    },
  ]

  let successCount = 0

  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i]
    console.log(`\n📝 Teste ${i + 1}/${testCases.length}: ${test.name}`)
    console.log(`📤 Mensagem: "${test.message}"`)

    const startTime = Date.now()

    try {
      const response = await fetch(`${API_URL}/api/v1/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: test.message,
          session_id: `integration-test-${Date.now()}`,
        }),
      })

      const data = await response.json()
      const duration = Date.now() - startTime

      console.log(`\n📥 Resposta em ${duration}ms:`)
      console.log(`👤 Agente: ${data.agent_name || 'N/A'}`)
      console.log(`💬 ${data.message?.substring(0, 100)}...`)
      console.log(`🎯 Confiança: ${((data.confidence || 0) * 100).toFixed(0)}%`)
      console.log(`🏷️ Intent: ${data.metadata?.intent_type || 'N/A'}`)

      // Validações
      const checks = {
        agentCorrect:
          data.agent_id === test.expectedAgent || data.agent_name === 'Carlos Drummond de Andrade',
        intentCorrect: data.metadata?.intent_type === test.expectedIntent,
        hasMessage: !!data.message && data.message.length > 10,
        notMaintenance: !data.message?.includes('manutenção'),
        goodConfidence: data.confidence > 0.5,
      }

      console.log('\n✓ Verificações:')
      console.log(`  ${checks.agentCorrect ? '✅' : '❌'} Agente correto`)
      console.log(`  ${checks.intentCorrect ? '✅' : '❌'} Intent detectado`)
      console.log(`  ${checks.hasMessage ? '✅' : '❌'} Mensagem válida`)
      console.log(`  ${checks.notMaintenance ? '✅' : '❌'} Não é manutenção`)
      console.log(`  ${checks.goodConfidence ? '✅' : '❌'} Confiança > 50%`)

      const allPassed = Object.values(checks).every((v) => v)
      if (allPassed) {
        console.log('\n✅ TESTE PASSOU!')
        successCount++
      } else {
        console.log('\n⚠️  Teste com problemas')
      }

      // Se tiver ações sugeridas
      if (data.suggested_actions?.length > 0) {
        console.log(`\n🎯 Ações sugeridas: ${data.suggested_actions.join(', ')}`)
      }
    } catch (error) {
      console.log(`\n❌ Erro: ${error.message}`)
    }

    console.log('\n' + '-'.repeat(60))

    // Aguardar entre testes
    await new Promise((resolve) => setTimeout(resolve, 1500))
  }

  console.log('\n' + '='.repeat(60))
  console.log(`\n📊 RESULTADO FINAL: ${successCount}/${testCases.length} testes passaram`)

  if (successCount === testCases.length) {
    console.log('\n🎉 INTEGRAÇÃO COMPLETA FUNCIONANDO PERFEITAMENTE!')
    console.log('\n✅ Próximos passos:')
    console.log('1. Desativar completamente o modo demo')
    console.log('2. Adicionar indicador visual do Drummond')
    console.log('3. Mostrar quando está usando Maritaca AI')
    console.log('4. Implementar as suggested_actions no UI')
  } else {
    console.log('\n⚠️  Alguns testes falharam. Verificar:')
    console.log('1. Logs do backend para erros')
    console.log('2. Se a Maritaca está respondendo consistentemente')
    console.log('3. Se o intent detection está funcionando')
  }
}

testCompleteIntegration()
