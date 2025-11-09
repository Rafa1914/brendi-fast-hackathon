import agentProvider from '../ai/agentProvider';
import { ChatRequest, ChatResponse, InsightsRequest, InsightsResponse } from '../types/agent';
import { AnalyticsResponse } from '../types/analytics';

const SYSTEM_PROMPT_CHAT = `Você é um assistente especializado em análise de dados de loja. 
Você ajuda a interpretar métricas, identificar tendências e fornecer insights sobre o desempenho da loja.
Seja objetivo, claro e focado em dados. Use os dados fornecidos para fundamentar suas respostas.
Você tem acesso a tools para buscar dados atualizados de analytics quando necessário.`;

const SYSTEM_PROMPT_INSIGHTS = `Você é um analista especializado em e-commerce. 
Analise os dados fornecidos e gere insights acionáveis sobre o desempenho da loja.
Foque em:
- Tendências e padrões identificados
- Oportunidades de melhoria
- Pontos fortes e fracos
- Recomendações práticas

Seja objetivo, claro e baseado em dados. Use os tools disponíveis para buscar dados atualizados se necessário.`;

async function chat(request: ChatRequest): Promise<ChatResponse> {
  const { messages, analytics } = request;
  
  // Converte mensagens para o formato do agent
  const agentMessages = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  // Pega a última mensagem do usuário como prompt
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  const prompt = lastUserMessage?.content || messages[messages.length - 1]?.content || '';

  // Se há histórico de mensagens, usa todas exceto a última como contexto
  const contextMessages = agentMessages.slice(0, -1);

  const response = await agentProvider.generate({
    prompt,
    messages: contextMessages.length > 0 ? contextMessages : undefined,
    analytics,
    systemPrompt: SYSTEM_PROMPT_CHAT,
    maxSteps: 15,
  });
  
  return {
    message: response.text,
  };
}

async function generateInsights(request: InsightsRequest): Promise<InsightsResponse> {
  const { analytics, period } = request;
  
  const periodContext = period ? `Período de análise: ${period}\n\n` : '';
  
  const prompt = `${periodContext}Analise os dados fornecidos e gere insights detalhados sobre o desempenho da loja.
Inclua:
1. Análise geral do desempenho
2. Principais tendências identificadas
3. Oportunidades de melhoria
4. Recomendações práticas e acionáveis

Seja específico e baseie-se nos dados fornecidos. Use os tools disponíveis se precisar de dados mais detalhados.`;
  
  const response = await agentProvider.generate({
    prompt,
    analytics,
    systemPrompt: SYSTEM_PROMPT_INSIGHTS,
    maxSteps: 20,
  });
  
  return {
    insights: response.text,
  };
}

export const AgentService = {
  chat,
  generateInsights,
};

