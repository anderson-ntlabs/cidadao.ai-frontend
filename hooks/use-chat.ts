import { useState, useCallback } from 'react'
import { agents } from '@/data/agents'

interface ChatMessage {
  message: string
  agent_id?: string
  session_id?: string
  context?: any
}

interface ChatResponse {
  response?: string
  message?: string
  agent?: string
  confidence?: number
  sources?: any[]
  error?: string
}

interface InvestigationResponse {
  status: string
  agent: string
  query: string
  results: any[]
  anomalies_found: number
  confidence_score: number
  processing_time_ms: number
}

export function useChat() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (params: ChatMessage): Promise<ChatResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      // Por enquanto, só o Zumbi tem endpoint no backend
      if (params.agent_id === 'zumbi' || params.message.toLowerCase().includes('contrato') || params.message.toLowerCase().includes('investig')) {
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
        
        // Formatar resposta do Zumbi
        let responseText = `🔍 **Análise de ${data.agent}**\n\n`
        
        if (data.anomalies_found > 0) {
          responseText += `⚠️ Encontrei ${data.anomalies_found} anomalia(s) com confiança de ${(data.confidence_score * 100).toFixed(0)}%.\n\n`
          
          if (data.results && data.results.length > 0) {
            responseText += '**Principais descobertas:**\n'
            data.results.slice(0, 3).forEach((result, idx) => {
              responseText += `${idx + 1}. ${JSON.stringify(result).substring(0, 100)}...\n`
            })
          }
        } else {
          responseText += `✅ Nenhuma anomalia significativa encontrada na análise.\n`
        }
        
        responseText += `\n⏱️ Tempo de análise: ${data.processing_time_ms}ms`
        
        return {
          response: responseText,
          agent: 'zumbi',
          confidence: data.confidence_score
        }
      } else {
        // Para outros agentes, simular resposta baseada no agente selecionado
        const agent = agents.find(a => a.id === params.agent_id)
        const agentName = agent?.name || 'Agente'
        
        // Simular delay de processamento
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
        
        // Gerar respostas contextuais baseadas no agente
        const responses = {
          abaporu: `Olá! Sou ${agentName}, o coordenador mestre do Cidadão.AI. Posso ajudá-lo a entender melhor os dados de transparência pública. Sobre sua pergunta: "${params.message}", sugiro começarmos analisando os contratos públicos com o agente Zumbi dos Palmares, que é especialista em detectar anomalias.`,
          anita: `Saudações! ${agentName} aqui. Sou especialista em análise de padrões complexos. Sobre "${params.message}", posso identificar tendências e correlações nos dados públicos. Recomendo também consultar o Zumbi para uma análise de anomalias específica.`,
          tiradentes: `Olá, sou ${agentName}. Minha especialidade é gerar relatórios claros e compreensíveis. Para "${params.message}", posso criar um documento detalhado após a análise dos dados. Sugiro primeiro uma investigação com o Zumbi dos Palmares.`,
          default: `Olá! Sou ${agentName}. Sobre sua pergunta "${params.message}", cada agente tem uma especialidade única. O Zumbi dos Palmares é excelente para detectar anomalias em contratos. Gostaria de direcioná-lo para uma análise específica?`
        }
        
        const responseText = responses[params.agent_id as keyof typeof responses] || responses.default
        
        return {
          response: responseText,
          agent: params.agent_id || 'abaporu',
          confidence: 0.85
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao se comunicar com o servidor'
      setError(errorMessage)
      
      // Se for o Zumbi e houver erro, retornar resposta mockada
      if (params.agent_id === 'zumbi' && err.message.includes('servidor')) {
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
      const suggestions: Record<string, string[]> = {
        zumbi: [
          'Analise contratos emergenciais de 2024',
          'Investigue licitações suspeitas',
          'Procure por anomalias em contratos de saúde'
        ],
        abaporu: [
          'Como funciona o sistema de transparência?',
          'Quais agentes estão disponíveis?',
          'Me ajude a investigar gastos públicos'
        ],
        anita: [
          'Analise padrões de gastos no último trimestre',
          'Compare despesas entre departamentos',
          'Identifique tendências anormais'
        ],
        tiradentes: [
          'Gere um relatório sobre contratos suspeitos',
          'Crie um resumo das últimas investigações',
          'Explique as anomalias encontradas'
        ]
      }
      
      return { 
        suggestions: suggestions[agent_id || 'abaporu'] || suggestions.abaporu 
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