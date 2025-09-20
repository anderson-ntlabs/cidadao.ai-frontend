/**
 * Script de teste rápido para verificar endpoints do chat
 * Executar com: node scripts/test-chat-api.js
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

console.log('🔍 Testando endpoints do Chat - Cidadão.AI');
console.log('API URL:', API_BASE_URL);
console.log('=' .repeat(50));

async function testEndpoint(name, method, path, body = null) {
  const url = `${API_BASE_URL}${path}`;
  console.log(`\n📍 ${name}`);
  console.log(`   ${method} ${url}`);
  
  try {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const status = response.status;
    
    if (status === 200 || status === 201) {
      console.log(`   ✅ Sucesso: ${status}`);
      const data = await response.json();
      console.log('   Resposta:', JSON.stringify(data, null, 2).substring(0, 150) + '...');
    } else if (status === 404) {
      console.log(`   ❌ Não encontrado: ${status} - Endpoint não existe`);
    } else if (status === 405) {
      console.log(`   ⚠️  Método não permitido: ${status}`);
    } else if (status === 422) {
      console.log(`   ⚠️  Erro de validação: ${status}`);
      const error = await response.json();
      console.log('   Detalhes:', error);
    } else {
      console.log(`   ❌ Erro: ${status}`);
      try {
        const error = await response.json();
        console.log('   Detalhes:', error);
      } catch (e) {
        console.log('   Sem detalhes de erro disponíveis');
      }
    }
  } catch (error) {
    console.log(`   ❌ Erro de conexão: ${error.message}`);
  }
}

async function runTests() {
  // 1. Teste básico de conectividade
  console.log('\n🔗 Testando conectividade...');
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    if (response.ok) {
      console.log('✅ Backend está acessível');
    }
  } catch (error) {
    console.log('❌ Backend não está acessível em', API_BASE_URL);
    console.log('Certifique-se de que o servidor está rodando com: cd ../cidadao.ai-backend && make run-dev');
    return;
  }

  // 2. Testar endpoints do chat
  await testEndpoint(
    'Chat Message (Principal)', 
    'POST', 
    '/api/v1/chat/message',
    { message: 'Olá, este é um teste' }
  );

  await testEndpoint(
    'Chat Suggestions',
    'GET',
    '/api/v1/chat/suggestions'
  );

  await testEndpoint(
    'Lista de Agentes',
    'GET',
    '/api/v1/agents'
  );

  await testEndpoint(
    'Chat History',
    'GET',
    '/api/v1/chat/history/test-session-123'
  );

  // 3. Testar endpoint de investigação (fallback atual)
  await testEndpoint(
    'Investigation API (Fallback atual)',
    'POST',
    '/api/v1/agents/abaporu/investigate',
    { 
      query: 'teste de conexão',
      data_source: 'all',
      filters: {}
    }
  );

  // 4. Testar docs/health
  await testEndpoint(
    'API Docs',
    'GET',
    '/docs'
  );

  await testEndpoint(
    'Health Check',
    'GET',
    '/health'
  );

  console.log('\n' + '='.repeat(50));
  console.log('✅ Diagnóstico completo!');
  console.log('\nPróximos passos baseados nos resultados:');
  console.log('1. Se /api/v1/chat/message retornou 404: Backend precisa implementar');
  console.log('2. Se apenas /investigate funciona: Continuar usando fallback');
  console.log('3. Verificar logs do backend para mais detalhes');
}

// Executar testes
runTests();