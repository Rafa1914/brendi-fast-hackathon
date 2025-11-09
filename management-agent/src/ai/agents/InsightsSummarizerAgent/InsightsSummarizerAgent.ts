import { Experimental_Agent as Agent, stepCountIs } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { AnalyticsResponse } from '../../../types/analytics';
import { FeedbackAnalyticsResponse } from '../../../types/feedback';
import InsightsSummarizerUtils, { SYSTEM_PROMPT } from './utils';


const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const modelName = process.env.OPENAI_MODEL_INSIGHTS || 'gpt-4o-mini';

const InsightsSummarizerAgent = new Agent({
  model: openai(modelName),
  system: SYSTEM_PROMPT,
});

// Função principal para gerar insights
export const generateInsights = async (
  analytics: AnalyticsResponse,
  feedbackAnalytics?: FeedbackAnalyticsResponse,
  period?: string
): Promise<string> => {
  const analyticsContext = InsightsSummarizerUtils.formatAnalyticsForPrompt(analytics);
  const feedbackContext = feedbackAnalytics 
    ? InsightsSummarizerUtils.formatFeedbackAnalyticsForPrompt(feedbackAnalytics)
    : '';
  const userPrompt = InsightsSummarizerUtils.buildUserPrompt(period, analyticsContext, feedbackContext);

  const result = await InsightsSummarizerAgent.generate({
    prompt: userPrompt,
  });

  return result.text;
};

// Exporta as funções
export default InsightsSummarizerAgent;
