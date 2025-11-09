import { ChatMessage } from '../../types/agent';
import { AnalyticsResponse } from '../../types/analytics';

export interface AgentGenerateOptions {
  prompt: string;
  messages?: ChatMessage[];
  analytics?: AnalyticsResponse;
  systemPrompt?: string;
  maxSteps?: number;
}

export interface AgentGenerateResponse {
  text: string;
  steps?: any[];
}

export interface IAgentProvider {
  generate(options: AgentGenerateOptions): Promise<AgentGenerateResponse>;
}

