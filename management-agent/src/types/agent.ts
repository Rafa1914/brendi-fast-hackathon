import { AnalyticsResponse } from "./analytics";

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

export interface InsightSection {
  title: string;
  content: string;
}

export interface InsightsResponse {
  summary: string;
  highlights: string[];
  recommendations: string[];
  sections: InsightSection[];
}

