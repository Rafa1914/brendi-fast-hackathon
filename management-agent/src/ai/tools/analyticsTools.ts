import { tool } from 'ai';
import { z } from 'zod';
import { AnalyticsResponse } from '../../types/analytics';
import { FeedbackAnalyticsResponse } from '../../types/feedback';
import managementApiClient from '../../client/managementApiClient';

function formatAnalyticsForTool(analytics: AnalyticsResponse): string {
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
${topProducts.slice(0, 5).map((p, i) => 
  `${i + 1}. ${p.name}: ${p.totalQuantity} vendidos, R$ ${(p.totalRevenue / 100).toFixed(2)}${p.revenuePercentage ? ` (${p.revenuePercentage.toFixed(1)}% da receita)` : ''}`
).join('\n')}

Distribuição por Período:
${periodDistribution.map(p => 
  `- ${p.label}: ${p.count} pedidos, R$ ${(p.revenue / 100).toFixed(2)}`
).join('\n')}

Distribuição por Tipo de Pedido:
${orderTypeDistribution.map(t => 
  `- ${t.label}: ${t.count} pedidos (${t.percentage.toFixed(1)}%), R$ ${(t.revenue / 100).toFixed(2)}`
).join('\n')}

Top 5 Clientes Fiéis:
${loyalCustomers.slice(0, 5).map((c, i) => 
  `${i + 1}. ${c.customer.name} (${c.customer.phone}): ${c.totalOrders} pedidos, R$ ${(c.totalRevenue / 100).toFixed(2)} total, R$ ${(c.averageTicket / 100).toFixed(2)} ticket médio`
).join('\n')}

Pedidos por Dia (últimos 7 dias):
${ordersByDay.slice(-7).map(d => 
  `${d.date}: ${d.count} pedidos, R$ ${(d.revenue / 100).toFixed(2)}`
).join('\n')}

Pedidos por Semana (últimas 4 semanas):
${ordersByWeek.slice(-4).map(w => 
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
${neighborhoodDistribution.slice(0, 5).map(n => 
  `- ${n.neighborhood}: ${n.count} pedidos (${n.percentage.toFixed(1)}%), R$ ${(n.revenue / 100).toFixed(2)}`
).join('\n')}
`;
  }

  return formatted.trim();
}

function formatFeedbackAnalyticsForTool(feedbackAnalytics: FeedbackAnalyticsResponse): string {
  const {
    stats,
    ratingDistribution,
    categoryDistribution,
    topCustomers,
    periodInfo
  } = feedbackAnalytics;

  return `
Dados de Análise de Feedbacks:

Período: ${new Date(periodInfo.startDate).toLocaleDateString('pt-BR')} até ${new Date(periodInfo.endDate).toLocaleDateString('pt-BR')}
Total de Feedbacks: ${periodInfo.totalFeedbacks}

Estatísticas:
- Total de Feedbacks: ${stats.totalFeedbacks}
- Avaliação Média: ${stats.averageRating.toFixed(2)}/5
- Feedbacks Positivos (≥4): ${stats.positiveFeedbacks} (${stats.totalFeedbacks > 0 ? ((stats.positiveFeedbacks / stats.totalFeedbacks) * 100).toFixed(1) : 0}%)
- Feedbacks Negativos (≤2): ${stats.negativeFeedbacks} (${stats.totalFeedbacks > 0 ? ((stats.negativeFeedbacks / stats.totalFeedbacks) * 100).toFixed(1) : 0}%)
- Feedbacks Neutros (=3): ${stats.neutralFeedbacks} (${stats.totalFeedbacks > 0 ? ((stats.neutralFeedbacks / stats.totalFeedbacks) * 100).toFixed(1) : 0}%)

Distribuição por Avaliação:
${ratingDistribution.map(r => 
  `- ${r.rating} estrelas: ${r.count} feedbacks (${r.percentage.toFixed(1)}%)`
).join('\n')}

Distribuição por Categoria:
${categoryDistribution.map(c => 
  `- ${c.categoryLabel}: ${c.count} feedbacks (${c.percentage.toFixed(1)}%)`
).join('\n')}

Top 10 Clientes que Mais Avaliam:
${topCustomers.slice(0, 10).map((c, i) => 
  `${i + 1}. ${c.customerName} (${c.customerPhone}): ${c.totalFeedbacks} feedbacks, ${c.averageRating.toFixed(2)}/5 média, ${c.totalOrders} pedidos`
).join('\n')}
  `.trim();
}

export const getAnalyticsTool = tool({
  description: 'Busca analytics da loja (pedidos, receita, produtos). Use APENAS se não tiver dados ou precisar de período diferente.',
  inputSchema: z.object({
    startDate: z.string().optional().describe('Data início ISO (ex: 2024-01-01T00:00:00.000Z)'),
    endDate: z.string().optional().describe('Data fim ISO (ex: 2024-12-31T23:59:59.999Z)'),
  }),
  execute: async ({ startDate, endDate }) => {
    try {
      const filters = {
        dateRange: {
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
        },
      };

      const analytics = await managementApiClient.getAnalytics(filters);
      
      return {
        success: true,
        analytics: formatAnalyticsForTool(analytics),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar analytics',
      };
    }
  },
});

export const formatAnalyticsTool = tool({
  description: 'Formata dados de analytics. Use apenas se necessário formatar dados já recebidos.',
  inputSchema: z.object({
    analytics: z.any().describe('Objeto com dados de analytics'),
  }),
  execute: async ({ analytics }) => {
    return {
      success: true,
      formatted: formatAnalyticsForTool(analytics as AnalyticsResponse),
    };
  },
});

export const getFeedbackAnalyticsTool = tool({
  description: 'Busca analytics de feedbacks (avaliações, satisfação). Use APENAS se precisar analisar satisfação do cliente.',
  inputSchema: z.object({
    startDate: z.string().optional().describe('Data início ISO (ex: 2024-01-01T00:00:00.000Z)'),
    endDate: z.string().optional().describe('Data fim ISO (ex: 2024-12-31T23:59:59.999Z)'),
  }),
  execute: async ({ startDate, endDate }) => {
    try {
      const filters = {
        dateRange: {
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
        },
      };

      const feedbackAnalytics = await managementApiClient.getFeedbackAnalytics(filters);
      
      return {
        success: true,
        feedbackAnalytics: formatFeedbackAnalyticsForTool(feedbackAnalytics),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar feedback analytics',
      };
    }
  },
});
