/**
 * Teste completo do novo endpoint /api/v1/chat/simple com Maritaca AI
 */

const API_URL = 'https://cidadao-api-production.up.railway.app';

async function testSimpleEndpoint() {
  console.log('🚀 TESTE DO ENDPOINT /api/v1/chat/simple COM MARITACA AI\n');
  console.log('Data:', new Date().toLocaleString('pt-BR'));
  console.log('=' .repeat(60) + '\n');
  
  const testCases = [
    "Olá! Como você está?",
    "O que é o Cidadão.AI?",
    "Como posso investigar contratos públicos?",
    "Quais são os principais problemas na transparência pública?",
    "Me ajude a entender a lei de acesso à informação",
    "Obrigado pela ajuda!",
    "Tchau!"
  ];
  
  let successCount = 0;
  const results = [];
  
  for (let i = 0; i < testCases.length; i++) {
    const message = testCases[i];
    console.log(`\n[${i+1}/${testCases.length}] Testando: "${message}"`);
    
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${API_URL}/api/v1/chat/simple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          session_id: `simple-test-${Date.now()}-${i}`
        })
      });
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      if (response.ok && data.message) {
        console.log(`✅ Sucesso em ${duration}ms`);
        console.log(`📝 Resposta: "${data.message.substring(0, 150)}..."`);
        console.log(`🤖 Modelo: ${data.model_used || 'N/A'}`);
        successCount++;
        
        results.push({
          message,
          success: true,
          duration,
          model: data.model_used,
          responseLength: data.message.length
        });
      } else {
        console.log(`❌ Falha: Status ${response.status}`);
        results.push({
          message,
          success: false,
          duration,
          error: data.error || 'Unknown error'
        });
      }
      
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
      results.push({
        message,
        success: false,
        error: error.message
      });
    }
    
    // Pausa entre requisições
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Relatório Final
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 RELATÓRIO FINAL\n');
  
  console.log(`Taxa de Sucesso: ${successCount}/${testCases.length} (${((successCount/testCases.length)*100).toFixed(1)}%)`);
  
  // Análise de tempos
  const successfulResults = results.filter(r => r.success);
  if (successfulResults.length > 0) {
    const avgTime = successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length;
    const avgLength = successfulResults.reduce((sum, r) => sum + r.responseLength, 0) / successfulResults.length;
    
    console.log(`\nTempo médio de resposta: ${Math.round(avgTime)}ms`);
    console.log(`Tamanho médio das respostas: ${Math.round(avgLength)} caracteres`);
    
    // Verificar modelo usado
    const models = [...new Set(successfulResults.map(r => r.model).filter(Boolean))];
    console.log(`Modelos detectados: ${models.join(', ') || 'N/A'}`);
  }
  
  console.log('\n' + '=' .repeat(60));
  
  if (successCount === testCases.length) {
    console.log('\n🎉 ENDPOINT FUNCIONANDO PERFEITAMENTE!');
    console.log('A Maritaca AI está respondendo a todas as requisições!');
  } else if (successCount > 0) {
    console.log('\n⚠️  ENDPOINT PARCIALMENTE FUNCIONAL');
    console.log(`${successCount} de ${testCases.length} mensagens foram respondidas com sucesso.`);
  } else {
    console.log('\n❌ ENDPOINT COM PROBLEMAS');
  }
}

testSimpleEndpoint();