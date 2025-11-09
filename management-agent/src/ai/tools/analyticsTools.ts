import { tool } from 'ai';
import { z } from 'zod';
import { AnalyticsResponse } from '../../types/analytics';
import managementApiClient from '../../client/managementApiClient';

function formatAnalyticsForTool(analytics: AnalyticsResponse): string {
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
${topProducts.slice(0, 5).map((p, i) => 
  `${i + 1}. ${p.name}: ${p.totalQuantity} vendidos, R$ ${(p.totalRevenue / 100).toFixed(2)}`
).join('\n')}

Distribuição por Período:
${periodDistribution.map(p => 
  `- ${p.label}: ${p.count} pedidos, R$ ${(p.revenue / 100).toFixed(2)}`
).join('\n')}

Pedidos por Dia (últimos 7 dias):
${ordersByDay.slice(-7).map(d => 
  `${d.date}: ${d.count} pedidos, R$ ${(d.revenue / 100).toFixed(2)}`
).join('\n')}

Pedidos por Semana (últimas 4 semanas):
${ordersByWeek.slice(-4).map(w => 
  `${w.week}: ${w.count} pedidos, R$ ${(w.revenue / 100).toFixed(2)}`
).join('\n')}
  `.trim();
}

export const getAnalyticsTool = tool({
  description: 'Busca dados de analytics da loja para um período específico. Use este tool quando precisar de dados atualizados sobre pedidos, receita, produtos, etc. Retorna dados formatados e prontos para análise.',
  inputSchema: z.object({
    startDate: z.string().optional().describe('Data de início no formato ISO (ex: 2024-01-01T00:00:00.000Z)'),
    endDate: z.string().optional().describe('Data de fim no formato ISO (ex: 2024-12-31T23:59:59.999Z)'),
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
  description: 'Formata dados de analytics em uma string legível para análise. Use quando já tiver os dados de analytics e precisar formatá-los.',
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
