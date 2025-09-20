/**
 * Teste de stress do Drummond - Múltiplas mensagens e cenários
 */

const API_URL = 'https://neural-thinker-cidadao-ai-backend.hf.space';

async function testDrummondStress() {
  console.log('🔬 TESTE DE STRESS - DRUMMOND + MARITACA AI\n');
  console.log('Data:', new Date().toLocaleString('pt-BR'));
  console.log('Backend:', API_URL);
  console.log('='.repeat(60) + '\n');
  
  const testMessages = [
    // Saudações
    "Olá!",
    "Oi Drummond!",
    "Bom dia!",
    "Boa tarde, como vai?",
    
    // Perguntas sobre o sistema
    "O que é o Cidadão.AI?",
    "Como funciona o sistema?",
    "Quais são os agentes disponíveis?",
    "Para que serve esta plataforma?",
    
    // Investigações
    "Quero investigar contratos",
    "Investigue gastos com saúde",
    "Mostre contratos suspeitos",
    "Analise licitações de 2024",
    
    // Transparência
    "Por que transparência é importante?",
    "Como acessar dados públicos?",
    "O que é o portal da transparência?",
    "Explique a lei de acesso à informação",
    
    // Outros
    "Obrigado pela ajuda",
    "Tchau",
    "teste123",
    "ajuda"
  ];
  
  const results = {
    total: testMessages.length,
    success: 0,
    maintenance: 0,
    undefined: 0,
    errors: 0,
    avgSuccessTime: 0,
    avgFailTime: 0,
    intents: {},
    agents: {}
  };
  
  const successTimes = [];
  const failTimes = [];
  
  console.log(`📊 Iniciando ${testMessages.length} testes...\n`);
  
  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    console.log(`[${i+1}/${testMessages.length}] "${message}"`);
    
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${API_URL}/api/v1/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          session_id: `stress-test-${Date.now()}-${i}`
        })
      });
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      // Coletar métricas
      const agent = data.agent_name || data.agent_id || 'unknown';
      const intent = data.metadata?.intent_type || 'unknown';
      
      results.agents[agent] = (results.agents[agent] || 0) + 1;
      results.intents[intent] = (results.intents[intent] || 0) + 1;
      
      if (!data.message) {
        console.log(`   ❌ Resposta undefined (${duration}ms)`);
        results.undefined++;
        failTimes.push(duration);
      } else if (data.message.includes('manutenção')) {
        console.log(`   ⚠️  Manutenção (${duration}ms)`);
        results.maintenance++;
        failTimes.push(duration);
      } else if (agent === 'Carlos Drummond de Andrade') {
        console.log(`   ✅ Drummond respondeu! (${duration}ms)`);
        results.success++;
        successTimes.push(duration);
      } else {
        console.log(`   ❓ ${agent}: "${data.message?.substring(0, 50)}..." (${duration}ms)`);
        results.errors++;
        failTimes.push(duration);
      }
      
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
      results.errors++;
    }
    
    // Pequena pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Calcular médias
  if (successTimes.length > 0) {
    results.avgSuccessTime = Math.round(successTimes.reduce((a, b) => a + b) / successTimes.length);
  }
  if (failTimes.length > 0) {
    results.avgFailTime = Math.round(failTimes.reduce((a, b) => a + b) / failTimes.length);
  }
  
  // Relatório final
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RELATÓRIO FINAL\n');
  
  console.log('RESULTADOS GERAIS:');
  console.log(`Total de testes: ${results.total}`);
  console.log(`✅ Sucessos (Drummond): ${results.success} (${((results.success/results.total)*100).toFixed(1)}%)`);
  console.log(`⚠️  Manutenção: ${results.maintenance} (${((results.maintenance/results.total)*100).toFixed(1)}%)`);
  console.log(`❌ Undefined: ${results.undefined} (${((results.undefined/results.total)*100).toFixed(1)}%)`);
  console.log(`❌ Erros: ${results.errors} (${((results.errors/results.total)*100).toFixed(1)}%)`);
  
  console.log('\nTEMPOS DE RESPOSTA:');
  console.log(`⚡ Média (sucesso): ${results.avgSuccessTime}ms`);
  console.log(`🐌 Média (falha): ${results.avgFailTime}ms`);
  
  console.log('\nAGENTES DETECTADOS:');
  Object.entries(results.agents).forEach(([agent, count]) => {
    console.log(`- ${agent}: ${count}x`);
  });
  
  console.log('\nINTENTS DETECTADOS:');
  Object.entries(results.intents).forEach(([intent, count]) => {
    console.log(`- ${intent}: ${count}x`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('\nTeste concluído em:', new Date().toLocaleTimeString('pt-BR'));
}

testDrummondStress();