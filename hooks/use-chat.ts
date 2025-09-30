import { useState, useCallback } from 'react'
import { agents } from '@/data/agents'

/**
 * Message structure for chat requests
 * 
 * @interface ChatMessage
 */
interface ChatMessage {
  /** The message content to send */
  message: string
  /** Optional agent ID to direct the message to */
  agent_id?: string
  /** Session ID for conversation continuity */
  session_id?: string
  /** Additional context for the conversation */
  context?: any
  /** List of active agents in the conversation */
  activeAgents?: string[]
}

/**
 * Response structure from chat API
 * 
 * @interface ChatResponse
 */
interface ChatResponse {
  /** Response text (legacy field) */
  response?: string
  /** Response message content */
  message?: string
  /** Agent that handled the request */
  agent?: string
  /** Confidence score (0-1) */
  confidence?: number
  /** Source references used */
  sources?: any[]
  /** Error message if request failed */
  error?: string
  /** Currently active agents */
  activeAgents?: string[]
}

/**
 * Response structure for investigation queries
 * 
 * @interface InvestigationResponse
 */
interface InvestigationResponse {
  /** Investigation status */
  status: string
  /** Agent performing the investigation */
  agent: string
  /** Original query */
  query: string
  /** Investigation results */
  results: any[]
  /** Number of anomalies detected */
  anomalies_found: number
  /** Confidence score (0-1) */
  confidence_score: number
  /** Processing time in milliseconds */
  processing_time_ms: number
}

/**
 * useChat - Hook for managing chat interactions with AI agents
 * 
 * @hook
 * @example
 * ```tsx
 * const { sendMessage, startInvestigation, isLoading, error } = useChat();
 * 
 * // Send a regular message
 * const response = await sendMessage({
 *   message: "What can you tell me about public contracts?",
 *   agent_id: "zumbi"
 * });
 * 
 * // Start an investigation
 * const investigation = await startInvestigation("suspicious contracts in 2024");
 * ```
 * 
 * @returns {Object} Chat methods and state
 * @returns {Function} returns.sendMessage - Send a message to an agent
 * @returns {Function} returns.startInvestigation - Start a new investigation
 * @returns {Function} returns.getAgentByRole - Get agent by role
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {string|null} returns.error - Error message if any
 * 
 * @since 1.0.0
 */
export function useChat() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (params: ChatMessage): Promise<ChatResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      const message = params.message.toLowerCase()
      const needsInvestigation = 
        message.includes('investig') || 
        message.includes('contrato') || 
        message.includes('anomalia') ||
        message.includes('suspeito') ||
        message.includes('irregularidad') ||
        message.includes('analise') ||
        message.includes('verifiq')
      
      // Se precisa investigação, orquestrar com múltiplos agentes
      if (needsInvestigation) {
        // Usar o endpoint de investigação do Zumbi
        const response = await fetch('https://neural-thinker-cidadao-ai-backend.hf.space/api/agents/zumbi/investigate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            query: params.message,
            data_source: 'contracts',
            max_results: 10
          })
        }).catch(err => {
          // Erro de rede ou CORS
          throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.')
        })

        if (!response.ok) {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('text/html')) {
            throw new Error('Servidor retornou HTML em vez de JSON. Pode estar em manutenção.')
          }
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.detail || `Erro HTTP: ${response.status}`)
        }

        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Resposta inválida do servidor')
        }

        const data: InvestigationResponse = await response.json()
        
        // Formatar resposta como orquestração do Abaporu
        let responseText = `🎯 **Iniciando investigação coordenada**\n\n`
        responseText += `Identifiquei que sua solicitação requer uma análise especializada. `
        responseText += `Vou acionar nossos agentes para investigar:\n\n`
        
        // Determinar quais agentes seriam acionados
        const activeAgents = ['zumbi'] // Sempre inclui Zumbi para investigações
        if (message.includes('padrão') || message.includes('tendência')) {
          activeAgents.push('anita')
        }
        if (message.includes('relatório') || message.includes('resumo')) {
          activeAgents.push('tiradentes')
        }
        
        responseText += `**Agentes acionados:**\n`
        activeAgents.forEach(agentId => {
          const agent = agents.find(a => a.id === agentId)
          if (agent) {
            responseText += `• **${agent.name}** - ${agent.role.pt}\n`
          }
        })
        
        responseText += `\n**Resultados da investigação:**\n\n`
        
        if (data.anomalies_found > 0) {
          responseText += `⚠️ **Zumbi dos Palmares** detectou ${data.anomalies_found} anomalia(s) com ${(data.confidence_score * 100).toFixed(0)}% de confiança.\n\n`
          
          if (data.results && data.results.length > 0) {
            responseText += '📊 **Principais descobertas:**\n'
            data.results.slice(0, 3).forEach((result, idx) => {
              responseText += `${idx + 1}. ${JSON.stringify(result).substring(0, 100)}...\n`
            })
          }
          
          responseText += `\n💡 **Próximos passos sugeridos:**\n`
          responseText += `• Solicitar análise detalhada dos contratos suspeitos\n`
          responseText += `• Verificar histórico das empresas envolvidas\n`
          responseText += `• Gerar relatório completo para autoridades\n`
        } else {
          responseText += `✅ **Zumbi dos Palmares** concluiu a análise sem encontrar anomalias significativas.\n`
          responseText += `\nTodos os contratos analisados estão dentro dos parâmetros normais.`
        }
        
        responseText += `\n\n⏱️ Tempo total de investigação: ${data.processing_time_ms}ms`
        
        return {
          response: responseText,
          agent: 'abaporu',
          confidence: data.confidence_score,
          activeAgents: activeAgents
        }
      } else {
        // Resposta conversacional do Abaporu
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700))
        
        let responseText = ''
        
        // Respostas contextuais baseadas no tipo de pergunta
        if (message.includes('como funciona') || message.includes('o que é')) {
          responseText = `O Cidadão.AI é uma plataforma de transparência pública que utiliza inteligência artificial para analisar dados governamentais. \n\n`
          responseText += `**Nossa missão** é democratizar o acesso à informação e fortalecer o controle social.\n\n`
          responseText += `**Como funcionamos:**\n`
          responseText += `• Coletamos dados públicos do Portal da Transparência\n`
          responseText += `• Nossos agentes especializados analisam padrões e anomalias\n`
          responseText += `• Geramos relatórios e alertas sobre possíveis irregularidades\n`
          responseText += `• Disponibilizamos tudo de forma gratuita e acessível\n\n`
          responseText += `Posso realizar uma investigação específica para você. Basta me dizer o que gostaria de analisar!`
        } else if (message.includes('agente') || message.includes('quem')) {
          responseText = `Somos uma equipe de 17 agentes de IA, cada um com especialidades únicas:\n\n`
          responseText += `**Principais agentes:**\n`
          responseText += `• **Zumbi dos Palmares** - Especialista em detectar anomalias e irregularidades\n`
          responseText += `• **Anita Garibaldi** - Analisa padrões e tendências complexas\n`
          responseText += `• **Tiradentes** - Gera relatórios detalhados e compreensíveis\n`
          responseText += `• **Machado de Assis** - Especialista em análise de narrativas\n`
          responseText += `• **Ayrton Senna** - Otimiza performance e velocidade das análises\n\n`
          responseText += `E eu, **Abaporu**, coordeno todos eles para trazer as melhores respostas para você!\n\n`
          responseText += `Que tipo de investigação você gostaria que eu coordenasse?`
        } else if (message.includes('ajuda') || message.includes('pode')) {
          responseText = `Claro! Posso ajudar você de várias formas:\n\n`
          responseText += `**1. Investigações de Transparência:**\n`
          responseText += `• Análise de contratos públicos\n`
          responseText += `• Detecção de anomalias em licitações\n`
          responseText += `• Verificação de gastos governamentais\n\n`
          responseText += `**2. Análises de Dados:**\n`
          responseText += `• Identificação de padrões suspeitos\n`
          responseText += `• Comparação de valores e preços\n`
          responseText += `• Tendências temporais de gastos\n\n`
          responseText += `**3. Geração de Relatórios:**\n`
          responseText += `• Resumos executivos de investigações\n`
          responseText += `• Documentação de irregularidades\n`
          responseText += `• Recomendações de ações\n\n`
          responseText += `Me diga o que você gostaria de investigar e coordenarei os agentes necessários!`
        } else {
          // Resposta genérica que incentiva investigação
          responseText = `Entendi sua mensagem sobre "${params.message}". \n\n`
          responseText += `Como orquestrador do Cidadão.AI, posso coordenar investigações detalhadas sobre:\n\n`
          responseText += `• Contratos e licitações públicas\n`
          responseText += `• Gastos governamentais suspeitos\n`
          responseText += `• Padrões anormais em dados públicos\n`
          responseText += `• Empresas com múltiplas vitórias em licitações\n\n`
          responseText += `Se você tiver uma suspeita específica ou quiser analisar algum órgão/período em particular, `
          responseText += `é só me dizer que coordenarei nossos agentes especializados para uma investigação completa!`
        }
        
        return {
          response: responseText,
          agent: 'abaporu',
          confidence: 0.95,
          activeAgents: []
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao se comunicar com o servidor'
      setError(errorMessage)
      
      // Se for o Zumbi e houver erro, retornar resposta mockada
      if (params.agent_id === 'zumbi' && (err.message.includes('servidor') || err.message.includes('HTML') || err.message.includes('JSON'))) {
        return {
          response: `⚠️ **Modo de Demonstração**\n\nO servidor do Zumbi está temporariamente indisponível, mas aqui está um exemplo de como funcionaria:\n\n🔍 Analisando: "${params.message}"\n\n📊 Em uma investigação real, eu buscaria por:\n- Contratos com valores atípicos\n- Empresas com múltiplas vitórias suspeitas\n- Prazos impossíveis de cumprir\n- Sobrepreços em relação ao mercado\n\n💡 Tente novamente em alguns minutos ou experimente outros agentes!`,
          agent: 'zumbi',
          confidence: 0.0
        }
      }
      
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getSuggestions = useCallback(async (agent_id?: string) => {
    try {
      // Por enquanto, retornar sugestões estáticas baseadas no agente
      const suggestions = [
        'Como funciona o Cidadão.AI?',
        'Investigue contratos emergenciais de saúde em 2024',
        'Analise licitações do meu município',
        'Procure anomalias em contratos de obras públicas',
        'Quais são os principais tipos de irregularidades?',
        'Me ajude a entender o Portal da Transparência'
      ]
      
      return { 
        suggestions: suggestions.slice(0, 3) // Retornar apenas 3 sugestões
      }
    } catch (err) {
      console.error('Erro ao buscar sugestões:', err)
      return { suggestions: [] }
    }
  }, [])

  return {
    sendMessage,
    getSuggestions,
    isLoading,
    error
  }
}