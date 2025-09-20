import { api, API_BASE_URL } from './client';
import type { ChatRequest, ChatResponse } from '@/types/chat';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { withRetry } from '@/lib/utils/retry';
import { trackChatMessage, trackChatResponse, trackChatError, trackChatRetry } from '@/lib/telemetry/chat-telemetry';

/**
 * Chat adapter v3 - Sprint 1 Implementation
 * Handles maintenance mode and provides better user experience
 */

// Mock responses for demo mode
const DEMO_RESPONSES = {
  greeting: {
    pt: `Olá! Sou o Cidadão.AI, seu assistente para transparência governamental. 🏛️

Atualmente estou em modo de demonstração, mas posso te mostrar como funciono:

• 🔍 **Investigação de Contratos**: Analiso contratos públicos em busca de anomalias
• 📊 **Análise de Dados**: Processo milhões de registros governamentais
• 🤖 **17 Agentes Especializados**: Cada um com expertise única
• 🚨 **Detecção de Anomalias**: Identifico padrões suspeitos automaticamente

Como posso ajudá-lo hoje?`,
    en: `Hello! I'm Cidadão.AI, your assistant for government transparency. 🏛️

I'm currently in demo mode, but I can show you how I work:

• 🔍 **Contract Investigation**: I analyze public contracts for anomalies
• 📊 **Data Analysis**: I process millions of government records
• 🤖 **17 Specialized Agents**: Each with unique expertise
• 🚨 **Anomaly Detection**: I automatically identify suspicious patterns

How can I help you today?`
  },
  
  investigation: {
    pt: `🔍 **Modo de Investigação Detectado**

Entendi que você quer investigar contratos! Quando estiver em operação completa, eu poderia:

1. **Acessar bases de dados governamentais** em tempo real
2. **Analisar milhões de contratos** em segundos
3. **Detectar anomalias** usando IA avançada
4. **Gerar relatórios detalhados** com evidências

Por enquanto, posso demonstrar com dados de exemplo. Alguns padrões que detectamos frequentemente:

• Contratos com valores 300% acima da média
• Empresas criadas dias antes de ganhar licitações
• Padrões de favorecimento repetitivos
• Aditivos suspeitos em contratos

Quer saber mais sobre algum desses casos?`,
    en: `🔍 **Investigation Mode Detected**

I understand you want to investigate contracts! When fully operational, I could:

1. **Access government databases** in real-time
2. **Analyze millions of contracts** in seconds
3. **Detect anomalies** using advanced AI
4. **Generate detailed reports** with evidence

For now, I can demonstrate with example data. Some patterns we frequently detect:

• Contracts with values 300% above average
• Companies created days before winning bids
• Repetitive favoritism patterns
• Suspicious contract amendments

Want to know more about any of these cases?`
  },
  
  help: {
    pt: `📚 **Sobre o Cidadão.AI**

Somos uma plataforma de transparência governamental powered by IA! Nossa missão é democratizar o acesso à informação pública.

**Nossos Agentes Especiais:**
• 🎨 **Abaporu**: Orquestrador mestre das investigações
• ⚔️ **Zumbi dos Palmares**: Especialista em detectar anomalias
• 🔫 **Anita Garibaldi**: Analista de padrões complexos
• 🦷 **Tiradentes**: Gerador de relatórios detalhados
• 🏁 **Ayrton Senna**: Otimizador de performance
• 📖 **Machado de Assis**: Analista de textos e contratos

**Como funcionamos:**
1. Você faz uma pergunta ou solicita uma investigação
2. Nossos agentes trabalham em conjunto para analisar dados
3. Apresentamos resultados claros e acionáveis
4. Você pode exportar relatórios e compartilhar descobertas

Quer experimentar? Me peça para investigar algo!`,
    en: `📚 **About Cidadão.AI**

We are an AI-powered government transparency platform! Our mission is to democratize access to public information.

**Our Special Agents:**
• 🎨 **Abaporu**: Master investigation orchestrator
• ⚔️ **Zumbi dos Palmares**: Anomaly detection specialist
• 🔫 **Anita Garibaldi**: Complex pattern analyst
• 🦷 **Tiradentes**: Detailed report generator
• 🏁 **Ayrton Senna**: Performance optimizer
• 📖 **Machado de Assis**: Text and contract analyst

**How we work:**
1. You ask a question or request an investigation
2. Our agents work together to analyze data
3. We present clear and actionable results
4. You can export reports and share discoveries

Want to try? Ask me to investigate something!`
  },
  
  default: {
    pt: `Interessante! Enquanto estou em modo demo, posso te mostrar exemplos de como funciono.

Tente perguntar sobre:
• Investigação de contratos suspeitos
• Como detectamos anomalias
• Nossos agentes especializados
• Casos de sucesso

Ou use uma das sugestões rápidas abaixo! 👇`,
    en: `Interesting! While I'm in demo mode, I can show you examples of how I work.

Try asking about:
• Investigating suspicious contracts
• How we detect anomalies
• Our specialized agents
• Success stories

Or use one of the quick suggestions below! 👇`
  }
};

/**
 * Detect intent from message
 */
function detectIntent(message: string): string {
  const lower = message.toLowerCase();
  
  if (lower.match(/^(oi|olá|ola|bom dia|boa tarde|boa noite|hey|hello|hi)/)) {
    return 'greeting';
  }
  
  if (lower.includes('investig') || lower.includes('contrat') || lower.includes('anomalia') || 
      lower.includes('suspect') || lower.includes('irregular')) {
    return 'investigation';
  }
  
  if (lower.includes('ajud') || lower.includes('help') || lower.includes('como funciona') || 
      lower.includes('o que é') || lower.includes('what is')) {
    return 'help';
  }
  
  return 'default';
}

/**
 * Detect language from message
 */
function detectLanguage(message: string): 'pt' | 'en' {
  // Simple detection - could be improved
  const englishWords = /\b(help|what|how|investigate|contract|hello|hi)\b/i;
  return englishWords.test(message) ? 'en' : 'pt';
}

/**
 * Generate demo response based on intent
 */
function generateDemoResponse(message: string, intent: string, sessionId: string): ChatResponse {
  const language = detectLanguage(message);
  const responseKey = intent as keyof typeof DEMO_RESPONSES;
  const responses = DEMO_RESPONSES[responseKey] || DEMO_RESPONSES.default;
  const responseText = responses[language];
  
  // Add some personality based on the "agent"
  const drummond = {
    id: 'drummond',
    name: language === 'pt' ? 'Carlos Drummond de Andrade' : 'Carlos Drummond de Andrade',
    personality: language === 'pt' ? '📝 Poeta e comunicador' : '📝 Poet and communicator'
  };
  
  return {
    session_id: sessionId,
    agent_id: drummond.id,
    agent_name: drummond.name,
    message: responseText,
    confidence: 0.85,
    suggested_actions: getSuggestedActions(intent, language),
    metadata: {
      intent,
      language,
      is_demo: true,
      agent_personality: drummond.personality,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Get suggested actions based on intent and language
 */
function getSuggestedActions(intent: string, language: 'pt' | 'en'): string[] {
  const actions = {
    pt: {
      greeting: ['Investigar contratos', 'Como funciona?', 'Ver agentes'],
      investigation: ['Contratos do Ministério da Saúde', 'Licitações suspeitas', 'Empresas com anomalias'],
      help: ['Começar investigação', 'Ver demonstração', 'Conhecer os agentes'],
      default: ['Investigar', 'Ajuda', 'Exemplos']
    },
    en: {
      greeting: ['Investigate contracts', 'How it works?', 'View agents'],
      investigation: ['Health Ministry contracts', 'Suspicious bids', 'Companies with anomalies'],
      help: ['Start investigation', 'View demo', 'Meet the agents'],
      default: ['Investigate', 'Help', 'Examples']
    }
  };
  
  return actions[language][intent as keyof typeof actions.pt] || actions[language].default;
}

/**
 * Send a chat message with enhanced demo mode support
 */
export async function sendChatMessageV3(request: ChatRequest): Promise<ChatResponse> {
  try {
    const payload = {
      message: request.message,
      session_id: request.session_id || `session_${Date.now()}`,
      context: request.context,
    };

    console.log('[Chat V3] Sending message:', payload.message);
    console.log('[Chat V3] Feature flags - Demo mode:', isFeatureEnabled('chatDemoMode'));
    console.log('[Chat V3] Feature flags - Retry enabled:', isFeatureEnabled('chatRetryEnabled'));
    
    // Track message sent
    const intent = detectIntent(request.message);
    trackChatMessage(payload.session_id, request.message, intent);
    const startTime = Date.now();
    
    // Force demo mode ONLY if feature flag is set AND backend is really in maintenance
    // Removido temporariamente para permitir respostas reais do Drummond
    
    // Make API call with retry if enabled
    const apiCall = async () => {
      return await api.post<any>('/api/v1/chat/message', payload);
    };
    
    const response = isFeatureEnabled('chatRetryEnabled')
      ? await withRetry(apiCall, {
          maxAttempts: 3,
          onRetry: (attempt, error) => {
            console.log(`[Chat V3] Retry attempt ${attempt} after error:`, error.message);
            trackChatRetry(payload.session_id, attempt);
          }
        })
      : await apiCall();

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to send message');
    }

    const data = response.data;
    
    // Check if backend is REALLY in maintenance mode
    // Agora que Drummond está funcionando, só usar demo se for realmente manutenção
    const isRealMaintenanceMode = 
      data.agent_id === 'system' && 
      data.message?.includes('manutenção') &&
      data.confidence === 0;
    
    if (isRealMaintenanceMode && isFeatureEnabled('chatDemoMode')) {
      console.log('[Chat V3] Backend in real maintenance mode, using demo responses');
      
      // Detect intent from original message
      const intent = data.metadata?.intent_type || detectIntent(request.message);
      
      // Generate a better demo response
      return generateDemoResponse(request.message, intent, payload.session_id);
    }
    
    // Log quando Drummond responder
    if (data.agent_name === 'Carlos Drummond de Andrade') {
      console.log('[Chat V3] 🎉 Drummond respondeu via Maritaca AI!');
    }
    
    // Track successful response
    trackChatResponse(payload.session_id, Date.now() - startTime, isRealMaintenanceMode);
    
    // Normal response from backend
    return {
      session_id: data.session_id,
      agent_id: data.agent_id,
      agent_name: data.agent_name,
      message: data.message || data.content || '',
      confidence: data.confidence || data.metadata?.confidence || 0.9,
      suggested_actions: data.suggested_actions || [],
      metadata: {
        ...data.metadata,
        timestamp: data.timestamp || new Date().toISOString(),
      },
    };
    
  } catch (error: any) {
    console.error('[Chat V3] Error:', error);
    
    // Track error
    trackChatError(request.session_id || 'unknown', error);
    
    // For any error, provide a helpful demo response
    const intent = detectIntent(request.message);
    const language = detectLanguage(request.message);
    
    return {
      session_id: request.session_id || `demo_${Date.now()}`,
      agent_id: 'drummond',
      agent_name: 'Carlos Drummond de Andrade',
      message: language === 'pt' 
        ? `Ops! Parece que estamos com um problema técnico. 🔧

Mas não se preocupe! Posso te mostrar como o Cidadão.AI funciona com alguns exemplos.

${DEMO_RESPONSES[intent as keyof typeof DEMO_RESPONSES]?.[language] || DEMO_RESPONSES.default[language]}`
        : `Oops! Looks like we're having a technical issue. 🔧

But don't worry! I can show you how Cidadão.AI works with some examples.

${DEMO_RESPONSES[intent as keyof typeof DEMO_RESPONSES]?.[language] || DEMO_RESPONSES.default[language]}`,
      confidence: 0.9,
      suggested_actions: getSuggestedActions(intent, language),
      metadata: {
        demo_mode: true,
        error_handled: true,
        intent,
        language,
      },
    };
  }
}