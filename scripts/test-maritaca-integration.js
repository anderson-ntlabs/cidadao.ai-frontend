/**
 * Teste específico para verificar integração com Maritaca AI
 */

const API_URL = 'https://cidadao-api-production.up.railway.app';

async function testMaritacaIntegration() {
  console.log('🔍 Teste de Integração Maritaca AI\n');
  console.log('Se você vê acessos no dashboard da Maritaca, o backend está tentando usar a API!\n');
  
  // Mensagens que devem acionar o Drummond/Maritaca
  const testMessages = [
    {
      message: "Olá Drummond!",
      expectAgent: "drummond"
    },
    {
      message: "Carlos, me explique sobre transparência",
      expectAgent: "drummond"
    },
    {
      message: "Drummond, como funciona o Cidadão.AI?",
      expectAgent: "drummond"
    },
    {
      message: "teste maritaca ai " + Date.now(), // mensagem única para rastrear
      expectAgent: "drummond"
    }
  ];

  for (const test of testMessages) {
    console.log(`\n📤 Enviando: "${test.message}"`);
    console.log(`   Esperando: ${test.expectAgent}`);
    
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${API_URL}/api/v1/chat/message`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Debug': 'true'  // talvez retorne mais info
        },
        body: JSON.stringify({
          message: test.message,
          session_id: `maritaca-test-${Date.now()}`,
          agent_id: "drummond",  // forçar drummond
          debug: true
        })
      });

      const data = await response.json();
      const duration = Date.now() - startTime;
      
      console.log(`\n📥 Resposta em ${duration}ms:`);
      console.log(`   Agent: ${data.agent_name} (${data.agent_id})`);
      console.log(`   Mensagem: "${data.message?.substring(0, 100)}..."`);
      console.log(`   Demo Mode: ${data.metadata?.is_demo_mode ? 'SIM' : 'NÃO'}`);
      
      // Verificar metadados para pistas
      if (data.metadata) {
        console.log('\n   Metadados:');
        Object.entries(data.metadata).forEach(([key, value]) => {
          if (key !== 'timestamp') {
            console.log(`   - ${key}: ${value}`);
          }
        });
      }
      
      // Se a resposta demorar mais que 1s, pode ser Maritaca
      if (duration > 1000) {
        console.log(`\n   ⏱️ Resposta demorou ${duration}ms - possível chamada à Maritaca!`);
      }
      
    } catch (error) {
      console.log(`\n❌ Erro: ${error.message}`);
    }
    
    // Aguardar entre requisições
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 Análise:');
  console.log('1. Se você vê as requisições no dashboard Maritaca, o backend está tentando');
  console.log('2. O problema pode ser que o backend está recebendo erro da Maritaca');
  console.log('3. Ou o timeout é muito curto e ele retorna modo manutenção antes da resposta');
  console.log('4. Verifique no dashboard da Maritaca se há erros nas requisições');
  
  console.log('\n🔍 Próximos passos:');
  console.log('1. Verificar logs de erro no HuggingFace Spaces');
  console.log('2. Verificar se a API key está correta nos secrets');
  console.log('3. Testar se o modelo "sabia-3" está correto');
}

testMaritacaIntegration();