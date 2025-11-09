import { Experimental_Agent as Agent, stepCountIs } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { getAnalyticsTool, formatAnalyticsTool, getFeedbackAnalyticsTool } from '../../tools/analyticsTools';
import { AnalyticsResponse } from '../../../types/analytics';
import { FeedbackAnalyticsResponse } from '../../../types/feedback';
import { SYSTEM_PROMPT } from './constants';
import DeliveryConsultantUtils from './utils';

type AgentTools = {
  getAnalytics: typeof getAnalyticsTool;
  formatAnalytics: typeof formatAnalyticsTool;
  getFeedbackAnalytics: typeof getFeedbackAnalyticsTool;
};

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const modelName = process.env.OPENAI_MODEL_CHAT || process.env.OPENAI_MODEL || 'gpt-4o-mini';

const DeliveryConsultantAgent = new Agent<AgentTools>({
  model: openai(modelName),
  tools: {
    getAnalytics: getAnalyticsTool,
    formatAnalytics: formatAnalyticsTool,
    getFeedbackAnalytics: getFeedbackAnalyticsTool,
  },
  stopWhen: stepCountIs(10),
  system: SYSTEM_PROMPT,
});

// Função principal de chat
export const chat = async (
  prompt: string,
  messages?: ChatMessage[],
  analytics?: AnalyticsResponse,
  feedbackAnalytics?: FeedbackAnalyticsResponse
): Promise<string> => {
  const initialPrompt = DeliveryConsultantUtils.buildInitialPrompt(prompt, analytics, feedbackAnalytics);
  
  // Se há mensagens, adiciona o prompt como última mensagem do usuário
  if (messages && messages.length > 0) {
    const messagesWithPrompt = [
      ...messages,
      { role: 'user' as const, content: initialPrompt }
    ];
    const result = await DeliveryConsultantAgent.generate({ messages: messagesWithPrompt });
    return result.text;
  }

  // Caso contrário, usa apenas o prompt
  const result = await DeliveryConsultantAgent.generate({ prompt: initialPrompt });
  return result.text;
};

// Exporta as funções
export default DeliveryConsultantAgent;

