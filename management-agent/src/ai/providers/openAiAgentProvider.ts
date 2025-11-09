import { Experimental_Agent as Agent, stepCountIs } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { IAgentProvider, AgentGenerateOptions, AgentGenerateResponse } from '../interface/IAgentProvider';
import { getAnalyticsTool, formatAnalyticsTool } from '../tools/analyticsTools';

type AgentTools = {
  getAnalytics: typeof getAnalyticsTool;
  formatAnalytics: typeof formatAnalyticsTool;
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
      },
      stopWhen: stepCountIs(20),
    });
  }

  async generate(options: AgentGenerateOptions): Promise<AgentGenerateResponse> {
    const { prompt, messages, analytics, systemPrompt, maxSteps = 20 } = options;

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
    const agent: Agent<AgentTools> = maxSteps !== 20
      ? new Agent<AgentTools>({
          model: this.openai(modelName),
          tools: {
            getAnalytics: getAnalyticsTool,
            formatAnalytics: formatAnalyticsTool,
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
    const { stats, ordersByDay, ordersByWeek, topProducts, periodDistribution, periodInfo } = analytics;
    
    return `
Dados de Análise da Loja:

Período: ${periodInfo.startDate} até ${periodInfo.endDate}
Total de Pedidos: ${periodInfo.totalOrders}

Estatísticas:
- Receita Total: R$ ${(stats.totalRevenue / 100).toFixed(2)}
- Total de Pedidos: ${stats.totalOrders}
- Ticket Médio: R$ ${(stats.averageOrderValue / 100).toFixed(2)}

Top 5 Produtos:
${topProducts.slice(0, 5).map((p: any, i: number) => 
  `${i + 1}. ${p.name}: ${p.totalQuantity} vendidos, R$ ${(p.totalRevenue / 100).toFixed(2)}`
).join('\n')}

Distribuição por Período:
${periodDistribution.map((p: any) => 
  `- ${p.label}: ${p.count} pedidos, R$ ${(p.revenue / 100).toFixed(2)}`
).join('\n')}

Pedidos por Dia (últimos 7 dias):
${ordersByDay.slice(-7).map((d: any) => 
  `${d.date}: ${d.count} pedidos, R$ ${(d.revenue / 100).toFixed(2)}`
).join('\n')}

Pedidos por Semana (últimas 4 semanas):
${ordersByWeek.slice(-4).map((w: any) => 
  `${w.week}: ${w.count} pedidos, R$ ${(w.revenue / 100).toFixed(2)}`
).join('\n')}
    `.trim();
  }
}

export default OpenAiAgentProvider;

