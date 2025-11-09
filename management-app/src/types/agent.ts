export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatResponse {
  message: string
}

export interface InsightSection {
  title: string
  content: string
}

export interface InsightsResponse {
  summary: string
  highlights: string[]
  recommendations: string[]
  sections: InsightSection[]
}

