import { useState, useCallback } from 'react'

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

export function useChat() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (params: ChatMessage): Promise<ChatResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('https://neural-thinker-cidadao-ai-backend.hf.space/api/v1/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          message: params.message,
          agent_id: params.agent_id || 'abaporu',
          session_id: params.session_id || 'demo-session',
          context: params.context || {}
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Erro HTTP: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao se comunicar com o servidor'
      setError(errorMessage)
      
      // Se for erro de rede, tentar endpoint alternativo
      if (err.message.includes('fetch')) {
        try {
          // Tenta endpoint de health primeiro para verificar se está online
          const healthCheck = await fetch('https://neural-thinker-cidadao-ai-backend.hf.space/health')
          if (!healthCheck.ok) {
            throw new Error('Servidor temporariamente indisponível')
          }
        } catch {
          throw new Error('Servidor temporariamente indisponível. Por favor, tente novamente em alguns instantes.')
        }
      }
      
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getSuggestions = useCallback(async (agent_id?: string) => {
    try {
      const response = await fetch(`https://neural-thinker-cidadao-ai-backend.hf.space/api/v1/chat/suggestions?agent_id=${agent_id || 'abaporu'}`)
      if (!response.ok) throw new Error('Erro ao buscar sugestões')
      return await response.json()
    } catch (err) {
      console.error('Erro ao buscar sugestões:', err)
      return []
    }
  }, [])

  return {
    sendMessage,
    getSuggestions,
    isLoading,
    error
  }
}