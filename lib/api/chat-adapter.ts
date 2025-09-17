import { api, API_BASE_URL } from './client';
import type { ChatRequest, ChatResponse } from '@/types/chat';

/**
 * Adapter to convert chat messages to Zumbi investigation requests
 * This is a temporary solution while the full chat API is not available
 */

// Convert chat message to investigation format
export async function sendChatAsInvestigation(request: ChatRequest): Promise<ChatResponse> {
  try {
    // Send to Zumbi investigate endpoint
    const response = await api.post('/api/agents/zumbi/investigate', {
      query: request.message,
      data_source: 'contracts',
      max_results: 100,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to investigate');
    }

    // Convert investigation response to chat format
    const investigation = response.data;
    
    // Build a formatted message from the investigation results
    let message = `🔍 **Investigação Concluída**\n\n`;
    message += `📋 **Query**: ${investigation.query}\n`;
    message += `🎯 **Anomalias encontradas**: ${investigation.anomalies_found}\n`;
    message += `📊 **Confiança**: ${(investigation.confidence_score * 100).toFixed(1)}%\n`;
    message += `⏱️ **Tempo**: ${investigation.processing_time_ms}ms\n\n`;

    if (investigation.results && investigation.results.length > 0) {
      message += `### 📝 Resultados:\n\n`;
      
      investigation.results.slice(0, 5).forEach((result: any, index: number) => {
        message += `**${index + 1}. ${result.description || result.title || 'Item'}**\n`;
        
        if (result.anomaly_type) {
          message += `   - ⚠️ Anomalia: ${result.anomaly_type}\n`;
        }
        
        if (result.value) {
          message += `   - 💰 Valor: R$ ${result.value.toLocaleString('pt-BR')}\n`;
        }
        
        if (result.vendor) {
          message += `   - 🏢 Fornecedor: ${result.vendor}\n`;
        }
        
        message += '\n';
      });
      
      if (investigation.results.length > 5) {
        message += `*... e mais ${investigation.results.length - 5} resultados*\n`;
      }
    }

    // Return as chat response
    return {
      session_id: request.session_id || 'investigation_session',
      agent_id: 'zumbi',
      agent_name: 'Zumbi dos Palmares',
      message,
      confidence: investigation.confidence_score,
      suggested_actions: [
        'Investigar contratos suspeitos',
        'Analisar licitações irregulares',
        'Verificar empresas sancionadas',
        'Examinar despesas públicas',
      ],
      metadata: {
        investigation_id: `inv_${Date.now()}`,
        anomalies_count: investigation.anomalies_found,
        processing_time: investigation.processing_time_ms,
      },
    };
  } catch (error) {
    console.error('Investigation adapter error:', error);
    
    // Fallback to a friendly error message
    return {
      session_id: request.session_id || 'error_session',
      agent_id: 'zumbi',
      agent_name: 'Zumbi dos Palmares',
      message: `Desculpe, não consegui processar sua solicitação. 

Por favor, tente reformular sua pergunta ou use uma das sugestões abaixo.

**Dica**: Sou especializado em detectar anomalias em contratos e licitações públicas. 
Pergunte sobre irregularidades, valores suspeitos ou concentração de fornecedores.`,
      confidence: 0.5,
      suggested_actions: [
        'Investigar contratos de TI com valores acima de R$ 1 milhão',
        'Analisar licitações do Ministério da Saúde',
        'Verificar contratos emergenciais',
        'Examinar fornecedores recorrentes',
      ],
      metadata: {}, // Add missing metadata property
    };
  }
}

// Mock data for testing when backend is unavailable
export function getMockAgents() {
  return [
    {
      id: 'zumbi',
      name: 'Zumbi dos Palmares',
      role: 'Investigador',
      status: 'available',
      specialty: 'Detecção de anomalias e irregularidades',
    },
  ];
}

export function getMockSuggestions() {
  return [
    {
      id: '1',
      label: 'Investigar contratos suspeitos',
      icon: 'Search',
      action: 'Investigar contratos com valores anormalmente altos',
    },
    {
      id: '2',
      label: 'Verificar licitações',
      icon: 'FileText',
      action: 'Analisar licitações com poucos participantes',
    },
    {
      id: '3',
      label: 'Examinar fornecedores',
      icon: 'Building',
      action: 'Verificar concentração de contratos por fornecedor',
    },
    {
      id: '4',
      label: 'Contratos emergenciais',
      icon: 'AlertCircle',
      action: 'Investigar contratos emergenciais sem licitação',
    },
  ];
}