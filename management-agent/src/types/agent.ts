export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  analytics?: AnalyticsResponse;
}

export interface ChatResponse {
  message: string;
}

export interface InsightsRequest {
  analytics: AnalyticsResponse;
  period?: string;
}

export interface InsightsResponse {
  insights: string;
  recommendations?: string[];
  highlights?: string[];
}

