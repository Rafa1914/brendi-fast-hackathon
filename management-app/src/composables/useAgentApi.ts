import { useApi } from './useApi'
import type { ChatMessage, ChatResponse, InsightsResponse } from '@/types/agent'
import type { AnalyticsResponse } from '@/types/analytics'

const API_BASE_URL = '/agent-api'

export function useAgentApi() {
  const chat = (messages: ChatMessage[], analytics?: AnalyticsResponse) => {
    return useApi<ChatResponse>(
      async () => {
        const response = await fetch(`${API_BASE_URL}/agent/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages, analytics }),
        })
        
        if (!response.ok) {
          throw new Error(`Erro no chat: ${response.statusText}`)
        }
        
        return response.json()
      },
      { immediate: false }
    )
  }

  const generateInsights = (analytics: AnalyticsResponse, period?: string) => {
    return useApi<InsightsResponse>(
      async () => {
        const response = await fetch(`${API_BASE_URL}/agent/insights`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ analytics, period }),
        })
        
        if (!response.ok) {
          throw new Error(`Erro ao gerar insights: ${response.statusText}`)
        }
        
        return response.json()
      },
      { immediate: false }
    )
  }

  return {
    chat,
    generateInsights
  }
}

