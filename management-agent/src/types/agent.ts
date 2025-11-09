import { AnalyticsResponse, AnalyticsFilters } from "./analytics";
import { FeedbackAnalyticsResponse } from "./feedback";

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
  filters?: AnalyticsFilters;
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

