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
      ordersByWeek, 
      topProducts, 
      periodDistribution, 
      periodInfo,
      orderTypeDistribution,
      loyalCustomers,
      preparationTimeStats,
      neighborhoodDistribution
    } = analytics;
    
    let formatted = `
Dados de Análise da Loja:

Período: ${periodInfo.startDate} até ${periodInfo.endDate}
Total de Pedidos: ${periodInfo.totalOrders}

Estatísticas:
- Receita Total: R$ ${(stats.totalRevenue / 100).toFixed(2)}
- Total de Pedidos: ${stats.totalOrders}
- Ticket Médio: R$ ${(stats.averageOrderValue / 100).toFixed(2)}

Top 5 Produtos:
${topProducts.slice(0, 5).map((p: any, i: number) => 
  `${i + 1}. ${p.name}: ${p.totalQuantity} vendidos, R$ ${(p.totalRevenue / 100).toFixed(2)}${p.revenuePercentage ? ` (${p.revenuePercentage.toFixed(1)}% da receita)` : ''}`
).join('\n')}

Distribuição por Período:
${periodDistribution.map((p: any) => 
  `- ${p.label}: ${p.count} pedidos, R$ ${(p.revenue / 100).toFixed(2)}`
).join('\n')}

Distribuição por Tipo de Pedido:
${orderTypeDistribution?.map((t: any) => 
  `- ${t.label}: ${t.count} pedidos (${t.percentage.toFixed(1)}%), R$ ${(t.revenue / 100).toFixed(2)}`
).join('\n') || 'N/A'}

Top 5 Clientes Fiéis:
${loyalCustomers?.slice(0, 5).map((c: any, i: number) => 
  `${i + 1}. ${c.customer.name} (${c.customer.phone}): ${c.totalOrders} pedidos, R$ ${(c.totalRevenue / 100).toFixed(2)} total, R$ ${(c.averageTicket / 100).toFixed(2)} ticket médio`
).join('\n') || 'N/A'}

Pedidos por Dia (últimos 7 dias):
${ordersByDay.slice(-7).map((d: any) => 
  `${d.date}: ${d.count} pedidos, R$ ${(d.revenue / 100).toFixed(2)}`
).join('\n')}

Pedidos por Semana (últimas 4 semanas):
${ordersByWeek.slice(-4).map((w: any) => 
  `${w.week}: ${w.count} pedidos, R$ ${(w.revenue / 100).toFixed(2)}`
).join('\n')}
`;

    if (preparationTimeStats) {
      formatted += `

Estatísticas de Tempo de Preparação:
- Tempo médio até confirmação: ${(preparationTimeStats.averageTimeToConfirm / 60).toFixed(1)} minutos
- Tempo médio até pronto: ${(preparationTimeStats.averageTimeToReady / 60).toFixed(1)} minutos
- Tempo médio em trânsito: ${(preparationTimeStats.averageTimeToTransit / 60).toFixed(1)} minutos
- Tempo médio até entrega: ${(preparationTimeStats.averageTimeToDelivered / 60).toFixed(1)} minutos
- Tempo total médio: ${(preparationTimeStats.totalTimeAverage / 60).toFixed(1)} minutos
- Pedidos com dados: ${preparationTimeStats.ordersWithData}
- Pedidos sem dados: ${preparationTimeStats.ordersWithoutData}
`;
    }

    if (neighborhoodDistribution && neighborhoodDistribution.length > 0) {
      formatted += `

Distribuição por Bairro (Top 5):
${neighborhoodDistribution.slice(0, 5).map((n: any) => 
  `- ${n.neighborhood}: ${n.count} pedidos (${n.percentage.toFixed(1)}%), R$ ${(n.revenue / 100).toFixed(2)}`
).join('\n')}
`;
    }

    return formatted.trim();
  }
}

export default OpenAiAgentProvider;

