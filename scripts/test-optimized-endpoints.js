/**
 * Teste dos novos endpoints otimizados
 */

const API_URL = 'https://neural-thinker-cidadao-ai-backend.hf.space';

async function testOptimizedEndpoints() {
  console.log('🚀 Teste dos Endpoints Otimizados\n');
  console.log('Data:', new Date().toLocaleString('pt-BR'));
  console.log('=' .repeat(60) + '\n');
  
  const endpoints = [
    { path: '/api/v1/chat/optimized', name: 'Optimized (Sabiazinho-3)' },
    { path: '/api/v1/chat/stable', name: 'Stable (Multi-fallback)' },
    { path: '/api/v1/chat/simple', name: 'Simple (Sabiá-3)' }
  ];
  
  const testMessage = "Olá! Como funciona o portal da transparência?";
  
  for (const endpoint of endpoints) {
    console.log(`\n📡 Testando: ${endpoint.name}`);
    console.log(`Endpoint: ${endpoint.path}`);
    
    const startTime = Date.now();
    
    try {
      const payload = {
        message: testMessage,
        session_id: `test-${Date.now()}`
      };
      
      // Add Drummond flag for optimized endpoint
      if (endpoint.path.includes('optimized')) {
        payload.use_drummond = true;
      }
      
      const response = await fetch(`${API_URL}${endpoint.path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        console.log(`\n✅ Status: ${response.status} (${duration}ms)`);
        console.log(`📝 Mensagem: "${data.message?.substring(0, 100)}..."`);
        console.log(`👤 Agente: ${data.agent_name || data.agent_id || 'N/A'}`);
        console.log(`🤖 Modelo: ${data.model_used || data.metadata?.model_used || 'N/A'}`);
        console.log(`🎯 Confiança: ${((data.confidence || 0) * 100).toFixed(0)}%`);
        
        if (data.tokens_used) {
          console.log(`📊 Tokens: ${data.tokens_used}`);
        }
        
        if (data.response_time_ms) {
          console.log(`⏱️  Tempo backend: ${data.response_time_ms}ms`);
        }
      } else {
        console.log(`\n❌ Erro: ${response.status} ${response.statusText}`);
        const error = await response.text();
        console.log(`Detalhes: ${error.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log(`\n❌ Erro de conexão: ${error.message}`);
    }
    
    console.log('\n' + '-'.repeat(60));
    
    // Aguarda entre testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Análise dos Resultados:\n');
  console.log('1. Optimized: Deve usar Sabiazinho-3 (mais econômico)');
  console.log('2. Stable: Deve ter fallback automático');
  console.log('3. Simple: Continua usando Sabiá-3 (qualidade)');
  console.log('\n💡 Use Optimized para perguntas simples e economizar!');
}

testOptimizedEndpoints();