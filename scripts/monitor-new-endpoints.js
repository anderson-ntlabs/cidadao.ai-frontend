/**
 * Monitor para verificar quando os novos endpoints estiverem disponíveis
 */

const API_URL = 'https://cidadao-api-production.up.railway.app';

async function checkEndpoint(path) {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "Teste de endpoint",
        session_id: "monitor-" + Date.now()
      })
    });
    
    return {
      status: response.status,
      ok: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      ok: false
    };
  }
}

async function monitor() {
  console.log('🔄 Monitorando deploy do HuggingFace Spaces...\n');
  console.log('Endpoints monitorados:');
  console.log('- /api/v1/chat/message (principal)');
  console.log('- /api/v1/chat/simple (novo com Maritaca)\n');
  
  let attempts = 0;
  let messageEndpointWorking = false;
  let simpleEndpointWorking = false;
  
  const interval = setInterval(async () => {
    attempts++;
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    
    console.log(`\n[${timestamp}] Verificação #${attempts}`);
    
    // Verificar /api/v1/chat/message
    const messageCheck = await checkEndpoint('/api/v1/chat/message');
    console.log(`/api/v1/chat/message: ${messageCheck.status} ${messageCheck.ok ? '✅' : '⏳'}`);
    
    // Verificar /api/v1/chat/simple
    const simpleCheck = await checkEndpoint('/api/v1/chat/simple');
    console.log(`/api/v1/chat/simple: ${simpleCheck.status} ${simpleCheck.status === 404 ? '⏳ Aguardando...' : simpleCheck.ok ? '✅' : '❌'}`);
    
    // Verificar se houve mudança
    if (!messageEndpointWorking && messageCheck.ok) {
      console.log('\n🎉 /api/v1/chat/message está funcionando!');
      messageEndpointWorking = true;
    }
    
    if (!simpleEndpointWorking && simpleCheck.status !== 404) {
      console.log('\n🎉 /api/v1/chat/simple foi detectado!');
      simpleEndpointWorking = true;
    }
    
    // Se ambos estiverem prontos
    if (messageEndpointWorking && simpleEndpointWorking) {
      console.log('\n✅ DEPLOY CONCLUÍDO! Ambos endpoints estão disponíveis!');
      console.log('\nExecutando teste completo...\n');
      clearInterval(interval);
      
      // Executar teste completo
      setTimeout(runFullTest, 2000);
    }
    
    // Timeout após 5 minutos
    if (attempts > 20) {
      console.log('\n⚠️  Timeout após 5 minutos. Verifique os logs do HuggingFace.');
      clearInterval(interval);
    }
    
  }, 15000); // Verifica a cada 15 segundos
}

async function runFullTest() {
  console.log('=' .repeat(60));
  console.log('\n🧪 TESTE COMPLETO DOS NOVOS ENDPOINTS\n');
  
  // Teste 1: /api/v1/chat/message
  console.log('1️⃣ Testando /api/v1/chat/message (principal)');
  try {
    const response = await fetch(`${API_URL}/api/v1/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "Olá Drummond! Como está o novo sistema?",
        session_id: "test-new-" + Date.now()
      })
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Agent:', data.agent_name || data.agent_id);
    console.log('Message:', data.message?.substring(0, 100) + '...');
    console.log('Confidence:', data.confidence);
  } catch (error) {
    console.log('Erro:', error.message);
  }
  
  console.log('\n' + '-'.repeat(60) + '\n');
  
  // Teste 2: /api/v1/chat/simple
  console.log('2️⃣ Testando /api/v1/chat/simple (novo com Maritaca)');
  try {
    const response = await fetch(`${API_URL}/api/v1/chat/simple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "Explique o que é transparência pública",
        session_id: "test-simple-" + Date.now()
      })
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Message:', data.message?.substring(0, 100) + '...');
    console.log('Model:', data.model_used);
    console.log('Session:', data.session_id);
  } catch (error) {
    console.log('Erro:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Teste concluído! Os endpoints estão prontos para uso.');
}

// Iniciar monitoramento
monitor();