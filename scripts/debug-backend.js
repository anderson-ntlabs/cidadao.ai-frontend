/**
 * Debug detalhado do backend
 */

const API_URL = 'https://neural-thinker-cidadao-ai-backend.hf.space';

async function debugBackend() {
  console.log('🔍 Debug Detalhado do Backend\n');
  
  // 1. Health check completo
  console.log('1️⃣ Health Check:');
  try {
    const health = await fetch(`${API_URL}/health`);
    const healthData = await health.json();
    console.log('- Status:', healthData.status);
    console.log('- Version:', healthData.version);
    console.log('- Uptime:', Math.floor(healthData.uptime / 60), 'minutos');
    
    // Verificar se há alguma mensagem de erro nos serviços
    if (healthData.services) {
      Object.entries(healthData.services).forEach(([service, info]) => {
        console.log(`- ${service}:`, info.status);
        if (info.error_message) {
          console.log(`  Erro: ${info.error_message}`);
        }
      });
    }
  } catch (e) {
    console.log('Erro:', e.message);
  }
  
  console.log('\n' + '-'.repeat(60) + '\n');
  
  // 2. Verificar configuração do sistema
  console.log('2️⃣ Informações do Sistema:');
  try {
    const info = await fetch(`${API_URL}/api/v1/info`);
    const infoData = await info.json();
    
    // Verificar se há informações sobre agentes
    if (infoData.agents) {
      console.log('Agentes disponíveis:');
      Object.keys(infoData.agents).forEach(agent => {
        console.log(`- ${agent}`);
      });
    }
  } catch (e) {
    console.log('Erro:', e.message);
  }
  
  console.log('\n' + '-'.repeat(60) + '\n');
  
  // 3. Teste detalhado de mensagem
  console.log('3️⃣ Teste de Mensagem Detalhado:');
  try {
    const response = await fetch(`${API_URL}/api/v1/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "Olá! Teste de debug.",
        session_id: "debug-session",
        debug: true  // Talvez retorne mais informações
      })
    });
    
    console.log('Status HTTP:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('\nResposta completa:');
    console.log(JSON.stringify(data, null, 2));
    
    // Análise da resposta
    console.log('\n📊 Análise:');
    console.log('- Agent ID:', data.agent_id);
    console.log('- Agent Name:', data.agent_name);
    console.log('- Demo Mode:', data.metadata?.is_demo_mode);
    console.log('- Intent:', data.metadata?.intent_type);
    console.log('- Timestamp:', data.metadata?.timestamp);
    
    // Verificar se há alguma indicação de erro
    if (data.metadata?.error || data.error) {
      console.log('\n⚠️ ERRO DETECTADO:');
      console.log(data.metadata?.error || data.error);
    }
    
  } catch (e) {
    console.log('Erro na requisição:', e.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // 4. Verificar logs ou status
  console.log('4️⃣ Verificando outros endpoints:');
  const checkEndpoints = [
    '/api/v1/status',
    '/api/v1/chat/status',
    '/api/v1/agents/drummond/status',
    '/api/v1/debug'
  ];
  
  for (const endpoint of checkEndpoints) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`);
      console.log(`${endpoint}: ${response.status} ${response.statusText}`);
    } catch (e) {
      console.log(`${endpoint}: Erro - ${e.message}`);
    }
  }
  
  console.log('\n📌 Conclusão:');
  console.log('O backend está respondendo mas pode estar com problemas de:');
  console.log('1. Configuração dos agentes');
  console.log('2. Variáveis de ambiente não configuradas');
  console.log('3. Erro na inicialização do Drummond');
  console.log('4. Modo de manutenção ativado propositalmente');
}

debugBackend();