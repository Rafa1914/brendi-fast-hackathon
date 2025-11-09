import { Experimental_Agent as Agent, stepCountIs } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { IAgentProvider, AgentGenerateOptions, AgentGenerateResponse } from '../interface/IAgentProvider';
import { getAnalyticsTool, formatAnalyticsTool, getFeedbackAnalyticsTool } from '../tools/analyticsTools';

type AgentTools = {
  getAnalytics: typeof getAnalyticsTool;
  formatAnalytics: typeof formatAnalyticsTool;
  getFeedbackAnalytics: typeof getFeedbackAnalyticsTool;
};

class OpenAiAgentProvider implements IAgentProvider {
  private agent: Agent<AgentTools>;
  private openai: ReturnType<typeof createOpenAI>;

  constructor() {
    // Cria o provider OpenAI com a API key
    this.openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    
    // Usa o modelo do provider diretamente
    this.agent = new Agent({
      model: this.openai(modelName),
      tools: {
        getAnalytics: getAnalyticsTool,
        formatAnalytics: formatAnalyticsTool,
        getFeedbackAnalytics: getFeedbackAnalyticsTool,
      },
      stopWhen: stepCountIs(10),
    });
  }

  async generate(options: AgentGenerateOptions): Promise<AgentGenerateResponse> {
    const { prompt, messages, analytics, systemPrompt, maxSteps = 10 } = options;

    // Se analytics for fornecido, adiciona ao contexto inicial
    let initialPrompt = prompt;
    if (analytics) {
      const analyticsContext = this.formatAnalyticsForPrompt(analytics);
      initialPrompt = `${prompt}\n\nContexto dos dados atuais:\n${analyticsContext}`;
    }

    // Constrói mensagens para o agent
    const agentMessages = messages || [];

    // Cria um agent temporário com configurações customizadas se necessário
    const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const agent: Agent<AgentTools> = maxSteps !== 10
      ? new Agent<AgentTools>({
          model: this.openai(modelName),
          tools: {
            getAnalytics: getAnalyticsTool,
            formatAnalytics: formatAnalyticsTool,
            getFeedbackAnalytics: getFeedbackAnalyticsTool,
          },
          stopWhen: stepCountIs(maxSteps),
        })
      : this.agent;

    const generateOptions: any = {
      prompt: initialPrompt,
    };

    if (agentMessages.length > 0) {
      generateOptions.messages = agentMessages;
    }

    if (systemPrompt) {
      generateOptions.system = systemPrompt;
    }

    const result = await agent.generate(generateOptions);

    return {
      text: result.text,
      steps: result.steps,
    };
  }

  private formatAnalyticsForPrompt(analytics: any): string {
    const { 
      stats, 
      ordersByDay, 
      topProducts, 
      periodDistribution, 
      periodInfo,
      orderTypeDistribution,
      loyalCustomers
    } = analytics;
    
    // Formatação concisa - apenas dados essenciais
    return `
Período: ${periodInfo.startDate} até ${periodInfo.endDate}
Pedidos: ${stats.totalOrders} | Receita: R$ ${(stats.totalRevenue / 100).toFixed(2)} | Ticket Médio: R$ ${(stats.averageOrderValue / 100).toFixed(2)}

Top 3 Produtos: ${topProducts.slice(0, 3).map((p: any) => `${p.name} (${p.totalQuantity})`).join(', ')}
Períodos: ${periodDistribution.map((p: any) => `${p.label}: ${p.count}`).join(' | ')}
Tipos: ${orderTypeDistribution?.map((t: any) => `${t.label}: ${t.percentage.toFixed(0)}%`).join(' | ') || 'N/A'}
Top 3 Clientes: ${loyalCustomers?.slice(0, 3).map((c: any) => `${c.customer.name} (${c.totalOrders})`).join(', ') || 'N/A'}
Últimos 3 dias: ${ordersByDay.slice(-3).map((d: any) => `${d.date}: ${d.count}`).join(' | ')}
`.trim();
  }
}

export default OpenAiAgentProvider;

