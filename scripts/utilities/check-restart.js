/**
 * Verifica se o backend foi reiniciado
 */

const API_URL = 'https://cidadao-api-production.up.railway.app'

async function checkRestart() {
  let lastUptime = Infinity

  console.log('🔄 Monitorando reinicialização do backend...\n')

  const check = async () => {
    try {
      const response = await fetch(`${API_URL}/health`)
      const data = await response.json()
      const uptime = data.uptime
      const uptimeMinutes = Math.floor(uptime / 60)

      // Se o uptime diminuiu, significa que reiniciou!
      if (uptime < lastUptime && uptime < 300) {
        // menos de 5 minutos
        console.log(`\n✅ BACKEND REINICIADO! Uptime: ${uptimeMinutes} minutos`)
        console.log('Aguarde mais 30 segundos para estabilizar...')

        setTimeout(async () => {
          console.log('\n🧪 Testando Drummond...')
          const testResponse = await fetch(`${API_URL}/api/v1/chat/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Olá!' }),
          })

          const testData = await testResponse.json()
          console.log('\nResposta:')
          console.log('Agent:', testData.agent_name)
          console.log('Message:', testData.message)
          console.log('Demo mode:', testData.metadata?.is_demo_mode ? 'SIM' : 'NÃO')

          if (testData.agent_name !== 'Sistema' || !testData.metadata?.is_demo_mode) {
            console.log('\n🎉 DRUMMOND ATIVADO COM SUCESSO!')
          }
        }, 30000)

        return true
      }

      lastUptime = uptime
      console.log(`Uptime: ${uptimeMinutes} minutos (aguardando reinicialização...)`)
    } catch (error) {
      console.log('Erro ao verificar:', error.message)
    }

    return false
  }

  // Primeira verificação
  await check()

  // Verificar a cada 15 segundos
  const interval = setInterval(async () => {
    const restarted = await check()
    if (restarted) {
      clearInterval(interval)
    }
  }, 15000)
}

checkRestart()
