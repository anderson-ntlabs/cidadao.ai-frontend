/**
 * Test Complete Investigation Flow
 *
 * Creates a real investigation and tracks it through completion
 *
 * @author Anderson Henrique da Silva
 * @date 2025-10-30
 */

const BASE_URL = 'https://cidadao-api-production.up.railway.app';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createInvestigation() {
  console.log('🚀 TESTE COMPLETO DE FLUXO DE INVESTIGAÇÃO\n');
  console.log('━'.repeat(80));

  // Step 1: Create Investigation
  console.log('\n📝 ETAPA 1: Criando Investigação...\n');

  const payload = {
    query: 'Detectar anomalias de preço em contratos públicos de tecnologia',
    data_source: 'contracts',
    filters: {
      start_date: '2024-01-01',
      end_date: '2024-12-31'
    },
    anomaly_types: ['price', 'vendor', 'temporal'],
    include_explanations: true,
    stream_results: false
  };

  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const createResponse = await fetch(`${BASE_URL}/api/v1/investigations/public/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log(`\n✅ Status: ${createResponse.status} ${createResponse.statusText}`);

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error('❌ Erro:', JSON.stringify(errorData, null, 2));
      return;
    }

    const createData = await createResponse.json();
    console.log('\n📦 Resposta:', JSON.stringify(createData, null, 2));

    const investigationId = createData.investigation_id;

    if (!investigationId) {
      console.error('❌ ID da investigação não foi retornado!');
      return;
    }

    console.log(`\n✨ Investigação criada com sucesso!`);
    console.log(`🆔 ID: ${investigationId}`);

    // Step 2: Poll Status
    console.log('\n━'.repeat(80));
    console.log('\n🔄 ETAPA 2: Monitorando Progresso...\n');

    let attempts = 0;
    const maxAttempts = 60; // 5 minutos (5s * 60)
    let completed = false;
    let lastStatus = null;

    while (attempts < maxAttempts && !completed) {
      attempts++;

      const statusResponse = await fetch(
        `${BASE_URL}/api/v1/investigations/public/status/${investigationId}`,
        {
          headers: { 'Accept': 'application/json' }
        }
      );

      if (!statusResponse.ok) {
        console.error(`❌ Erro ao buscar status: ${statusResponse.status}`);
        await sleep(5000);
        continue;
      }

      const statusData = await statusResponse.json();

      // Only log if status changed
      if (statusData.status !== lastStatus) {
        const progress = Math.round(statusData.progress * 100);
        const timestamp = new Date().toLocaleTimeString('pt-BR');

        console.log(`[${timestamp}] Status: ${statusData.status} | Progresso: ${progress}%`);
        console.log(`           Fase: ${statusData.current_phase || 'Iniciando'}`);
        console.log(`           Registros: ${statusData.records_processed || 0} | Anomalias: ${statusData.anomalies_detected || 0}`);

        if (statusData.estimated_completion) {
          console.log(`           ETA: ${statusData.estimated_completion}`);
        }
        console.log('');

        lastStatus = statusData.status;
      }

      if (statusData.status === 'completed') {
        completed = true;
        console.log('✅ Investigação CONCLUÍDA!\n');

        // Step 3: Get Results
        console.log('━'.repeat(80));
        console.log('\n📊 ETAPA 3: Buscando Resultados...\n');

        // Try public results endpoint
        const resultsResponse = await fetch(
          `${BASE_URL}/api/v1/investigations/public/results/${investigationId}`,
          {
            headers: { 'Accept': 'application/json' }
          }
        );

        console.log(`Status: ${resultsResponse.status} ${resultsResponse.statusText}`);

        if (resultsResponse.ok) {
          const resultsData = await resultsResponse.json();

          console.log('\n📈 RESULTADOS DA INVESTIGAÇÃO:\n');
          console.log(`Query: ${resultsData.query}`);
          console.log(`Fonte: ${resultsData.data_source}`);
          console.log(`Registros Analisados: ${resultsData.total_records_analyzed}`);
          console.log(`Anomalias Encontradas: ${resultsData.anomalies_found}`);
          console.log(`Score de Confiança: ${(resultsData.confidence_score * 100).toFixed(1)}%`);
          console.log(`Tempo de Processamento: ${resultsData.processing_time}s`);

          if (resultsData.metadata?.is_demo_mode) {
            console.log('\n⚠️  Modo Demonstração: Usando dados de exemplo');
          }

          console.log('\n📋 ANOMALIAS DETECTADAS:\n');

          if (resultsData.results && resultsData.results.length > 0) {
            resultsData.results.forEach((anomaly, index) => {
              console.log(`${index + 1}. ${anomaly.description}`);
              console.log(`   Tipo: ${anomaly.type} | Severidade: ${anomaly.severity}`);
              console.log(`   Confiança: ${(anomaly.confidence * 100).toFixed(1)}%`);
              console.log(`   Registros Afetados: ${anomaly.affected_records?.length || 0}`);

              if (anomaly.explanation) {
                console.log(`   Explicação: ${anomaly.explanation}`);
              }

              if (anomaly.suggested_actions && anomaly.suggested_actions.length > 0) {
                console.log(`   Ações Sugeridas:`);
                anomaly.suggested_actions.forEach(action => {
                  console.log(`   - ${action}`);
                });
              }
              console.log('');
            });
          } else {
            console.log('Nenhuma anomalia foi detectada.');
          }

          if (resultsData.summary) {
            console.log('\n📝 RESUMO:\n');
            console.log(resultsData.summary);
          }

        } else {
          const errorData = await resultsResponse.json();
          console.error('\n❌ Erro ao buscar resultados:', JSON.stringify(errorData, null, 2));

          // Try alternative endpoint
          console.log('\n🔄 Tentando endpoint alternativo...');

          const altResponse = await fetch(
            `${BASE_URL}/api/v1/investigations/${investigationId}/results`,
            {
              headers: { 'Accept': 'application/json' }
            }
          );

          console.log(`Status: ${altResponse.status} ${altResponse.statusText}`);

          if (altResponse.ok) {
            const altData = await altResponse.json();
            console.log('\n✅ Sucesso com endpoint alternativo!');
            console.log(JSON.stringify(altData, null, 2));
          } else {
            const altError = await altResponse.json();
            console.error('❌ Endpoint alternativo também falhou:', JSON.stringify(altError, null, 2));
          }
        }

      } else if (statusData.status === 'failed') {
        console.error('❌ Investigação FALHOU!');
        console.error('Detalhes:', JSON.stringify(statusData, null, 2));
        break;
      }

      // Wait before next poll
      await sleep(5000);
    }

    if (!completed && attempts >= maxAttempts) {
      console.warn('\n⚠️  Timeout: Investigação ainda não concluiu após 5 minutos');
      console.log('A investigação pode ainda estar processando no backend.');
    }

    console.log('\n━'.repeat(80));
    console.log('\n✅ TESTE COMPLETO!\n');

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error(error.stack);
  }
}

// Run test
createInvestigation();
