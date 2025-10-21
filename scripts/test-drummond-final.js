/**
 * Teste final do Drummond com Maritaca AI
 */

const API_URL = 'https://cidadao-api-production.up.railway.app';

async function testDrummondFinal() {
  console.log('🎭 Teste Final - Carlos Drummond de Andrade + Maritaca AI\n');
  
  // Primeiro, verificar o health
  console.log('1️⃣ Verificando status do sistema...');
  try {
    const health = await fetch(`${API_URL}/health`);
    const healthData = await health.json();
    console.log('Status:', healthData.status);
  } catch (e) {
    console.log('Erro ao verificar health:', e.message);
  }
  
  console.log('\n' + '-'.repeat(60) + '\n');
  
  // Testar mensagens seguindo o guia
  console.log('2️⃣ Testando endpoints documentados:\n');
  
  const tests = [
    {
      endpoint: '/api/v1/chat/message',
      payload: {
        message: "Olá! Sou um cidadão interessado em transparência.",
        session_id: "test-final-" + Date.now()
      }
    },
    {
      endpoint: '/api/v1/chat/simple',
      payload: {
        message: "Como funciona o portal da transparência?",
        session_id: "test-simple-" + Date.now()
      }
    }
  ];
  
  for (const test of tests) {
    console.log(`\n📡 Testando: ${test.endpoint}`);
    console.log(`📤 Mensagem: "${test.payload.message}"`);
    
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${API_URL}${test.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.payload)
      });
      
      const duration = Date.now() - startTime;
      console.log(`⏱️  Tempo: ${duration}ms`);
      console.log(`📊 Status HTTP: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('\n📥 Resposta:');
        
        // Diferentes estruturas de resposta
        if (data.agent_name) {
          console.log(`👤 Agente: ${data.agent_name} (${data.agent_id || 'N/A'})`);
          console.log(`💬 Mensagem: "${data.message || 'N/A'}"`);
          console.log(`🎯 Confiança: ${(data.confidence * 100).toFixed(0)}%`);
          console.log(`🏷️ Intent: ${data.metadata?.intent_type || 'N/A'}`);
          console.log(`🔧 Demo Mode: ${data.metadata?.is_demo_mode ? 'SIM' : 'NÃO'}`);
        } else {
          // Formato simples
          console.log(`💬 Mensagem: "${data.message || 'N/A'}"`);
          console.log(`🏷️ Session: ${data.session_id || 'N/A'}`);
          console.log(`🤖 Modelo: ${data.model_used || 'N/A'}`);
        }
        
        // Verificar se é resposta da Maritaca
        if (duration > 500 && data.confidence > 0.5) {
          console.log('\n✅ Provável resposta da Maritaca AI!');
        }
        
        if (data.suggested_actions?.length > 0) {
          console.log(`\n🎯 Ações sugeridas: ${data.suggested_actions.join(', ')}`);
        }
        
      } else {
        const errorText = await response.text();
        console.log(`❌ Erro ${response.status}: ${errorText}`);
      }
      
    } catch (error) {
      console.log(`❌ Erro na requisição: ${error.message}`);
    }
    
    console.log('\n' + '-'.repeat(60));
  }
  
  console.log('\n🎉 Teste concluído!');
  console.log('\n📊 Análise:');
  console.log('- Se /api/v1/chat/message funciona: Use este endpoint principal');
  console.log('- Se /api/v1/chat/simple funciona: Use como fallback');
  console.log('- Respostas > 500ms indicam uso da Maritaca AI');
  console.log('- Demo mode = false significa produção ativa');
}

testDrummondFinal();