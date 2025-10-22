import { api, API_BASE_URL } from './client';
import type { ChatRequest, ChatResponse } from '@/types/chat';
import { parseNaturalLanguage, NaturalLanguageParser } from './natural-language-parser';

/**
 * Universal adapter for natural language queries to government data
 */

// Format result based on data type
function formatResult(item: any, dataSource: string): string {
  switch (dataSource) {
    case 'servidores':
      return formatServant(item);
    case 'contratos':
      return formatContract(item);
    case 'despesas':
      return formatExpense(item);
    default:
      return formatGeneric(item);
  }
}

function formatServant(servant: any): string {
  let result = `**${servant.nome || 'Nome não disponível'}**\n`;
  result += `   - 📋 Cargo: ${servant.cargo || 'N/A'}\n`;
  result += `   - 🏢 Órgão: ${servant.orgao || 'N/A'}\n`;
  result += `   - 💼 Matrícula: ${servant.matricula || 'N/A'}\n`;
  
  if (servant.remuneracao) {
    result += `   - 💰 **Remuneração**:\n`;
    result += `     - Básica: R$ ${(servant.remuneracao.basica || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    result += `     - Total Líquido: R$ ${(servant.remuneracao.total_liquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    if (servant.remuneracao.gratificacoes) {
      result += `     - Gratificações: R$ ${servant.remuneracao.gratificacoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    }
    if (servant.remuneracao.auxilios) {
      result += `     - Auxílios: R$ ${servant.remuneracao.auxilios.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    }
  }
  
  result += `   - 📅 Referência: ${servant.mes_ano_referencia || 'N/A'}\n`;
  return result;
}

function formatContract(contract: any): string {
  let result = `**${contract.objeto || contract.description || 'Contrato'}**\n`;
  result += `   - 📄 Número: ${contract.numero || contract.id || 'N/A'}\n`;
  result += `   - 💰 Valor: R$ ${(contract.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
  
  if (contract.fornecedor) {
    result += `   - 🏢 Fornecedor: ${contract.fornecedor.nome || 'N/A'}`;
    if (contract.fornecedor.cnpj) {
      result += ` (CNPJ: ${contract.fornecedor.cnpj})`;
    }
    result += '\n';
  }
  
  result += `   - 🏛️ Órgão: ${contract.orgao || 'N/A'}\n`;
  result += `   - 📅 Assinatura: ${contract.data_assinatura || 'N/A'}\n`;
  
  if (contract.vigencia) {
    result += `   - ⏳ Vigência: ${contract.vigencia.inicio || 'N/A'} até ${contract.vigencia.fim || 'N/A'}\n`;
  }
  
  if (contract._anomaly) {
    result += `   - ⚠️ **ANOMALIA DETECTADA** (Z-score: ${contract._z_score?.toFixed(2) || 'N/A'})\n`;
  }
  
  return result;
}

function formatExpense(expense: any): string {
  let result = `**${expense.descricao || 'Despesa'}**\n`;
  result += `   - 💰 Valor: R$ ${(expense.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
  
  if (expense.favorecido) {
    result += `   - 🏢 Favorecido: ${expense.favorecido.nome || 'N/A'}`;
    if (expense.favorecido.codigo) {
      result += ` (Código: ${expense.favorecido.codigo})`;
    }
    result += '\n';
  }
  
  result += `   - 🏛️ Órgão: ${expense.orgao || 'N/A'}\n`;
  result += `   - 📅 Data: ${expense.data || 'N/A'}\n`;
  
  if (expense.programa) {
    result += `   - 📊 Programa: ${expense.programa}\n`;
  }
  
  if (expense.acao) {
    result += `   - 🎯 Ação: ${expense.acao}\n`;
  }
  
  return result;
}

function formatGeneric(item: any): string {
  return `**${item.title || item.description || item.nome || 'Item'}**\n` +
         `   - ${JSON.stringify(item, null, 2).substring(0, 200)}...\n`;
}

// Convert chat message to universal investigation format
export async function sendChatAsInvestigation(request: ChatRequest): Promise<ChatResponse> {
  try {
    // Parse natural language query
    const parsed = parseNaturalLanguage(request.message);
    
    console.log('Parsed query:', parsed);
    
    // Send to universal investigate endpoint
    const response = await api.post('/api/investigate', {
      query: parsed.query,
      data_source: parsed.dataSource,
      filters: parsed.filters,
      max_results: 50,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to investigate');
    }

    // Convert investigation response to chat format
    const investigation = response.data;
    
    // Build a formatted message from the investigation results
    let message = `🔍 **Investigação: ${NaturalLanguageParser.getDescription(parsed)}**\n\n`;
    
    // Status summary
    if (investigation.status === 'demo') {
      message += `⚠️ **Modo Demonstração**: Para dados reais, configure a API no backend.\n\n`;
    }
    
    message += `📊 **Resumo**:\n`;
    message += `   - 📋 Fonte: ${getDataSourceName(investigation.data_source)}\n`;
    message += `   - 🔎 Total encontrado: ${investigation.total_found}\n`;
    
    if (investigation.anomalies_detected > 0) {
      message += `   - ⚠️ **Anomalias detectadas: ${investigation.anomalies_detected}**\n`;
    }
    
    message += `   - 🎯 Confiança: ${(investigation.confidence_score * 100).toFixed(1)}%\n`;
    message += `   - ⏱️ Tempo: ${investigation.processing_time_ms}ms\n\n`;

    // Results
    if (investigation.results && investigation.results.length > 0) {
      message += `### 📝 Resultados:\n\n`;
      
      investigation.results.slice(0, 10).forEach((result: any, index: number) => {
        message += `${index + 1}. ${formatResult(result, investigation.data_source)}\n`;
      });
      
      if (investigation.results.length > 10) {
        message += `\n*... e mais ${investigation.results.length - 10} resultados*\n`;
      }
    } else {
      message += `### 📝 Nenhum resultado encontrado\n\n`;
      message += `Tente refinar sua busca ou usar termos diferentes.\n`;
    }

    // Metadata info
    if (investigation.metadata) {
      if (investigation.metadata.organizations_searched) {
        message += `\n📌 *Órgãos pesquisados: ${investigation.metadata.organizations_searched.join(', ')}*\n`;
      }
      if (investigation.metadata.anomaly_threshold) {
        message += `📌 *Limite de anomalia: R$ ${investigation.metadata.anomaly_threshold.toLocaleString('pt-BR')}*\n`;
      }
    }

    // Dynamic suggestions based on search
    const suggestions = generateSuggestions(parsed.dataSource, investigation);

    // Return as chat response
    return {
      session_id: request.session_id || 'investigation_session',
      agent_id: 'zumbi',
      agent_name: 'Zumbi dos Palmares',
      message,
      confidence: investigation.confidence_score,
      suggested_actions: suggestions,
      metadata: {
        investigation_id: `inv_${Date.now()}`,
        data_source: investigation.data_source,
        anomalies_count: investigation.anomalies_detected,
        total_found: investigation.total_found,
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

Por favor, tente reformular sua pergunta.

### 💡 Exemplos de perguntas:

**Servidores:**
- "Quanto ganha Maria Silva do Ministério da Saúde?"
- "Mostrar servidores com salário acima de 30 mil"

**Contratos:**
- "Contratos de TI acima de 1 milhão"
- "Contratos emergenciais de 2024"

**Despesas:**
- "Gastos do governo em dezembro"
- "Despesas acima de 500 mil reais"`,
      confidence: 0.5,
      suggested_actions: [
        'Buscar servidores por nome',
        'Investigar contratos suspeitos',
        'Analisar despesas do governo',
        'Ver empresas sancionadas',
      ],
      metadata: {},
    };
  }
}

function getDataSourceName(dataSource: string): string {
  const names: Record<string, string> = {
    'servidores': 'Servidores Públicos',
    'contratos': 'Contratos Governamentais',
    'despesas': 'Despesas Públicas',
    'licitacoes': 'Licitações',
    'convenios': 'Convênios',
    'empresas-sancionadas': 'Empresas Sancionadas',
  };
  return names[dataSource] || dataSource;
}

function generateSuggestions(dataSource: string, investigation: any): string[] {
  const suggestions: string[] = [];
  
  switch (dataSource) {
    case 'servidores':
      suggestions.push(
        'Buscar outros servidores do mesmo órgão',
        'Ver servidores com salários mais altos',
        'Comparar salários por cargo',
        'Buscar por função específica'
      );
      break;
    
    case 'contratos':
      suggestions.push(
        'Ver contratos do mesmo fornecedor',
        'Analisar contratos emergenciais',
        'Buscar contratos de TI',
        'Verificar contratos sem licitação'
      );
      break;
    
    case 'despesas':
      suggestions.push(
        'Ver maiores despesas do mês',
        'Analisar gastos por programa',
        'Buscar pagamentos recorrentes',
        'Comparar despesas entre órgãos'
      );
      break;
    
    default:
      suggestions.push(
        'Fazer nova busca',
        'Mudar tipo de pesquisa',
        'Adicionar filtros',
        'Ver dados de outro período'
      );
  }
  
  // Add anomaly-specific suggestions if found
  if (investigation.anomalies_detected > 0) {
    suggestions.unshift('Investigar anomalias detectadas em detalhes');
  }
  
  return suggestions.slice(0, 4);
}

// Mock data remains the same...
export function getMockAgents() {
  return [
    {
      id: 'zumbi',
      name: 'Zumbi dos Palmares',
      avatar: '🔍',
      role: 'Investigador Universal',
      status: 'active' as const,
      specialty: 'Análise de dados governamentais',
      type: 'investigator' as const,
      description: 'Especialista em detectar anomalias em dados do governo',
      capabilities: [
        'Busca de servidores públicos',
        'Análise de contratos',
        'Investigação de despesas',
        'Detecção de anomalias',
      ],
    },
  ];
}

export function getMockSuggestions() {
  return [
    {
      id: '1',
      label: 'Buscar servidor por nome',
      icon: 'User',
      action: 'Quanto ganha João Silva?',
    },
    {
      id: '2',
      label: 'Contratos suspeitos',
      icon: 'FileText',
      action: 'Contratos de TI acima de 1 milhão',
    },
    {
      id: '3',
      label: 'Gastos do governo',
      icon: 'DollarSign',
      action: 'Despesas do Ministério da Saúde em dezembro',
    },
    {
      id: '4',
      label: 'Empresas punidas',
      icon: 'AlertCircle',
      action: 'Empresas sancionadas em 2024',
    },
  ];
}