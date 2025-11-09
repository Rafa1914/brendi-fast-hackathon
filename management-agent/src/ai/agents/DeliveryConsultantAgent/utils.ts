import { AnalyticsResponse } from '../../../types/analytics';
import { FeedbackAnalyticsResponse } from '../../../types/feedback';

// Função pura para formatar analytics
const formatAnalyticsForPrompt = (analytics: AnalyticsResponse): string => {
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
  
  const baseFormatted = `
DADOS DE VENDAS E PEDIDOS:

Período: ${periodInfo.startDate} até ${periodInfo.endDate}
Total de Pedidos: ${periodInfo.totalOrders}

Estatísticas Principais:
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
${orderTypeDistribution?.map(t => 
  `- ${t.label}: ${t.count} pedidos (${t.percentage.toFixed(1)}%), R$ ${(t.revenue / 100).toFixed(2)}`
).join('\n') || 'N/A'}

Top 5 Clientes Fiéis:
${loyalCustomers?.slice(0, 5).map((c, i) => 
  `${i + 1}. ${c.customer.name} (${c.customer.phone}): ${c.totalOrders} pedidos, R$ ${(c.totalRevenue / 100).toFixed(2)} total, R$ ${(c.averageTicket / 100).toFixed(2)} ticket médio`
).join('\n') || 'N/A'}

Pedidos por Dia (últimos 7 dias):
${ordersByDay.slice(-7).map(d => 
  `${d.date}: ${d.count} pedidos, R$ ${(d.revenue / 100).toFixed(2)}`
).join('\n')}

Pedidos por Semana (últimas 4 semanas):
${ordersByWeek.slice(-4).map(w => 
  `${w.week}: ${w.count} pedidos, R$ ${(w.revenue / 100).toFixed(2)}`
).join('\n')}
`;

  const preparationTimeSection = preparationTimeStats
    ? `
Estatísticas de Tempo de Preparação:
- Tempo médio até confirmação: ${(preparationTimeStats.averageTimeToConfirm / 60).toFixed(1)} minutos
- Tempo médio até pronto: ${(preparationTimeStats.averageTimeToReady / 60).toFixed(1)} minutos
- Tempo médio em trânsito: ${(preparationTimeStats.averageTimeToTransit / 60).toFixed(1)} minutos
- Tempo médio até entrega: ${(preparationTimeStats.averageTimeToDelivered / 60).toFixed(1)} minutos
- Tempo total médio: ${(preparationTimeStats.totalTimeAverage / 60).toFixed(1)} minutos
`
    : '';

  const neighborhoodSection = neighborhoodDistribution && neighborhoodDistribution.length > 0
    ? `
Distribuição por Bairro (Top 5):
${neighborhoodDistribution.slice(0, 5).map(n => 
  `- ${n.neighborhood}: ${n.count} pedidos (${n.percentage.toFixed(1)}%), R$ ${(n.revenue / 100).toFixed(2)}`
).join('\n')}
`
    : '';

  return (baseFormatted + preparationTimeSection + neighborhoodSection).trim();
};

// Função pura para formatar feedback analytics
const formatFeedbackAnalyticsForPrompt = (feedbackAnalytics: FeedbackAnalyticsResponse): string => {
  const {
    stats,
    ratingDistribution,
    categoryDistribution,
    topCustomers,
    periodInfo
  } = feedbackAnalytics;

  const positivePercentage = stats.totalFeedbacks > 0 
    ? ((stats.positiveFeedbacks / stats.totalFeedbacks) * 100).toFixed(1) 
    : '0';
    
  const negativePercentage = stats.totalFeedbacks > 0 
    ? ((stats.negativeFeedbacks / stats.totalFeedbacks) * 100).toFixed(1) 
    : '0';
    
  const neutralPercentage = stats.totalFeedbacks > 0 
    ? ((stats.neutralFeedbacks / stats.totalFeedbacks) * 100).toFixed(1) 
    : '0';

  return `
DADOS DE FEEDBACKS E SATISFAÇÃO:

Período: ${new Date(periodInfo.startDate).toLocaleDateString('pt-BR')} até ${new Date(periodInfo.endDate).toLocaleDateString('pt-BR')}
Total de Feedbacks: ${periodInfo.totalFeedbacks}

Estatísticas:
- Total de Feedbacks: ${stats.totalFeedbacks}
- Avaliação Média: ${stats.averageRating.toFixed(2)}/5
- Feedbacks Positivos (≥4): ${stats.positiveFeedbacks} (${positivePercentage}%)
- Feedbacks Negativos (≤2): ${stats.negativeFeedbacks} (${negativePercentage}%)
- Feedbacks Neutros (=3): ${stats.neutralFeedbacks} (${neutralPercentage}%)

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
};

// Função pura para construir o prompt inicial
const buildInitialPrompt = (
  prompt: string,
  analytics?: AnalyticsResponse,
  feedbackAnalytics?: FeedbackAnalyticsResponse
): string => {
  if (!analytics && !feedbackAnalytics) {
    return prompt;
  }

  const analyticsContext = analytics ? formatAnalyticsForPrompt(analytics) : '';
  const feedbackContext = feedbackAnalytics ? formatFeedbackAnalyticsForPrompt(feedbackAnalytics) : '';

  const contextParts: string[] = [];
  
  if (analyticsContext) {
    contextParts.push(`Contexto dos dados atuais:\n${analyticsContext}`);
  }
  
  if (feedbackContext) {
    contextParts.push(`\n${feedbackContext}`);
  }

  return contextParts.length > 0 
    ? `${prompt}\n\n${contextParts.join('\n')}`
    : prompt;
};

const DeliveryConsultantUtils = {
  buildInitialPrompt,
  formatAnalyticsForPrompt,
  formatFeedbackAnalyticsForPrompt,
};

export default DeliveryConsultantUtils;

