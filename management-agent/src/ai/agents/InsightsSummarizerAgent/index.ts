import { Experimental_Agent as Agent } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { SYSTEM_PROMPT } from './constants';


const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const modelName = process.env.OPENAI_MODEL_INSIGHTS || 'gpt-4o-mini';

const InsightsSummarizerAgent = new Agent({
  model: openai(modelName),
  system: SYSTEM_PROMPT,
});

// Exporta as funções
export default InsightsSummarizerAgent;
