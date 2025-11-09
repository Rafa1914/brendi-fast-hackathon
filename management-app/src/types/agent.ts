export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatResponse {
  message: string
}

export interface InsightsResponse {
  insights: string
  recommendations?: string[]
  highlights?: string[]
}

