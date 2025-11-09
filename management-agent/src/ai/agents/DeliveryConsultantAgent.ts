import { Experimental_Agent as Agent, stepCountIs } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { getAnalyticsTool, formatAnalyticsTool, getFeedbackAnalyticsTool } from '../tools/analyticsTools';
import { AnalyticsResponse } from '../../types/analytics';

type AgentTools = {
  getAnalytics: typeof getAnalyticsTool;
  formatAnalytics: typeof formatAnalyticsTool;
  getFeedbackAnalytics: typeof getFeedbackAnalyticsTool;
};

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const SYSTEM_PROMPT = `Você é um consultor especializado em análise de dados de delivery e e-commerce. 
Seu papel é ajudar a entender os dados da loja, identificar tendências e fornecer recomendações estratégicas.

DIRETRIZES:
- Seja CONCISO, objetivo e direto nas respostas
- Use tools apenas quando necessário para buscar dados atualizados
- Priorize os dados já fornecidos no contexto
- Forneça análises baseadas em dados concretos
- Sugira ações práticas e acionáveis
- Se não tiver certeza, seja honesto sobre as limitações

TOOLS DISPONÍVEIS:
- getAnalytics: Busca dados de analytics para um período específico
- formatAnalytics: Formata dados de analytics em texto legível
- getFeedbackAnalytics: Busca dados de feedbacks e satisfação do cliente

Use as tools com sabedoria - apenas quando realmente precisar de dados atualizados ou de um período diferente.`;

// Função pura para formatar analytics
const formatAnalyticsForPrompt = (analytics: AnalyticsResponse): string => {
  const { 
    stats, 
    ordersByDay, 
    topProducts, 
    periodDistribution, 
    periodInfo,
    orderTypeDistribution,
    loyalCustomers
  } = analytics;
  
  return `
Período: ${periodInfo.startDate} até ${periodInfo.endDate}
Pedidos: ${stats.totalOrders} | Receita: R$ ${(stats.totalRevenue / 100).toFixed(2)} | Ticket Médio: R$ ${(stats.averageOrderValue / 100).toFixed(2)}

Top 3 Produtos: ${topProducts.slice(0, 3).map((p) => `${p.name} (${p.totalQuantity})`).join(', ')}
Períodos: ${periodDistribution.map((p) => `${p.label}: ${p.count}`).join(' | ')}
Tipos: ${orderTypeDistribution?.map((t) => `${t.label}: ${t.percentage.toFixed(0)}%`).join(' | ') || 'N/A'}
Top 3 Clientes: ${loyalCustomers?.slice(0, 3).map((c) => `${c.customer.name} (${c.totalOrders})`).join(', ') || 'N/A'}
Últimos 3 dias: ${ordersByDay.slice(-3).map((d) => `${d.date}: ${d.count}`).join(' | ')}
`.trim();
};

// Função pura para construir o prompt inicial
const buildInitialPrompt = (prompt: string, analytics?: AnalyticsResponse): string => {
  if (!analytics) {
    return prompt;
  }
  
  const analyticsContext = formatAnalyticsForPrompt(analytics);
  return `${prompt}\n\nContexto dos dados atuais:\n${analyticsContext}`;
};

// Factory function para criar o agent
const createAgent = (): Agent<AgentTools> => {
  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const modelName = process.env.OPENAI_MODEL_CHAT || process.env.OPENAI_MODEL || 'gpt-4o-mini';
  
  return new Agent({
    model: openai(modelName),
    tools: {
      getAnalytics: getAnalyticsTool,
      formatAnalytics: formatAnalyticsTool,
      getFeedbackAnalytics: getFeedbackAnalyticsTool,
    },
    stopWhen: stepCountIs(10),
    system: SYSTEM_PROMPT,
  });
};

// Agent singleton criado uma vez
const agent = createAgent();

// Função principal de chat
export const chat = async (
  prompt: string,
  messages?: ChatMessage[],
  analytics?: AnalyticsResponse
): Promise<string> => {
  const initialPrompt = buildInitialPrompt(prompt, analytics);
  
  // Se há mensagens, adiciona o prompt como última mensagem do usuário
  if (messages && messages.length > 0) {
    const messagesWithPrompt = [
      ...messages,
      { role: 'user' as const, content: initialPrompt }
    ];
    const result = await agent.generate({ messages: messagesWithPrompt });
    return result.text;
  }

  // Caso contrário, usa apenas o prompt
  const result = await agent.generate({ prompt: initialPrompt });
  return result.text;
};

// Exporta as funções
export default {
  chat,
};
