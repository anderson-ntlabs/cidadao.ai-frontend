/**
 * Monitor para verificar quando o Drummond estiver ativo
 */

const API_URL = 'https://neural-thinker-cidadao-ai-backend.hf.space';

async function checkDrummond() {
  try {
    const response = await fetch(`${API_URL}/api/v1/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "Olá!",
        session_id: `monitor-${Date.now()}`
      })
    });

    const data = await response.json();
    
    // Verifica se não é mais mensagem de manutenção
    const isMaintenanceMode = 
      data.message?.includes('manutenção') || 
      data.agent_id === 'system' ||
      data.metadata?.is_demo_mode === true;
    
    return {
      online: !isMaintenanceMode,
      agent: data.agent_name || data.agent_id,
      message: data.message?.substring(0, 100),
      confidence: data.confidence || 0
    };
  } catch (error) {
    return {
      online: false,
      agent: 'error',
      message: error.message,
      confidence: 0
    };
  }
}

async function monitor() {
  console.log('🔍 Monitorando ativação do Drummond...\n');
  console.log('Verificando a cada 10 segundos. Pressione Ctrl+C para parar.\n');
  
  let attempts = 0;
  
  const interval = setInterval(async () => {
    attempts++;
    const status = await checkDrummond();
    
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    
    if (status.online) {
      console.log(`\n🎉 [${timestamp}] DRUMMOND ESTÁ ATIVO!`);
      console.log(`   Agente: ${status.agent}`);
      console.log(`   Confiança: ${(status.confidence * 100).toFixed(0)}%`);
      console.log(`   Resposta: "${status.message}..."`);
      console.log('\n✅ Sistema pronto para uso!');
      
      clearInterval(interval);
    } else {
      if (attempts % 6 === 1) { // A cada minuto
        console.log(`\n[${timestamp}] Status: Ainda em manutenção`);
        console.log(`   Tentativas: ${attempts}`);
        console.log(`   Agente: ${status.agent}`);
      } else {
        process.stdout.write('.');
      }
    }
  }, 10000); // 10 segundos
  
  // Primeira verificação imediata
  const initialStatus = await checkDrummond();
  if (initialStatus.online) {
    console.log('✅ Drummond já está ativo!');
    clearInterval(interval);
  } else {
    console.log('⏳ Aguardando ativação do Drummond...');
  }
}

// Iniciar monitoramento
monitor().catch(console.error);