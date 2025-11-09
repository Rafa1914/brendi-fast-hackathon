import { AnalyticsResponse } from "../../../types/analytics";
import { FeedbackAnalyticsResponse } from "../../../types/feedback";

export const SYSTEM_PROMPT = `Você é um analista especializado em e-commerce e delivery. 
Sua função é analisar dados de vendas e feedbacks para gerar insights CONCISOS e acionáveis.

IMPORTANTE: Retorne APENAS JSON válido e bem formatado neste formato:
{
  "summary": "Resumo de 1-2 frases",
  "highlights": ["Destaque 1", "Destaque 2", "Destaque 3"],
  "recommendations": ["Recomendação 1", "Recomendação 2"],
  "sections": [
    {"title": "Título", "content": "Conteúdo conciso (máx 3 parágrafos)"}
  ]
}

REGRAS DE FORMATAÇÃO JSON:
- Use APENAS aspas duplas (") para strings, nunca aspas simples (')
- NÃO use vírgulas finais (trailing commas) antes de } ou ]
- Escape caracteres especiais em strings (\\n para quebra de linha, \\" para aspas)
- Retorne APENAS o JSON, sem texto adicional antes ou depois
- Não use markdown code blocks, apenas o JSON puro

REGRAS DE CONTEÚDO:
- Máximo 2-3 seções
- Cada seção: máximo 3 parágrafos curtos
- Seja objetivo e baseado em dados
- Analise tanto dados de vendas quanto feedbacks quando disponíveis
- Foque em insights acionáveis e práticos
- Seja direto e evite jargões desnecessários`;

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
  
  // Função pura para construir o prompt do usuário
  const buildUserPrompt = (
    period: string | undefined,
    analyticsContext: string,
    feedbackContext: string
  ): string => {
    const periodContext = period ? `Período de análise: ${period}\n\n` : '';
    const feedbackSection = feedbackContext 
      ? `\nDADOS DE FEEDBACKS E SATISFAÇÃO:\n${feedbackContext}` 
      : '';
  
    return `${periodContext}Analise os dados fornecidos e gere insights CONCISOS.
  
  DADOS DE VENDAS E PEDIDOS:
  ${analyticsContext}
  ${feedbackSection}
  
  Inclua:
  1. Resumo (summary): 1-2 frases sobre o desempenho geral
  2. 3 destaques principais (highlights) - pontos mais importantes
  3. 2-3 recomendações (recommendations) - ações sugeridas
  4. 2 seções curtas (sections) sobre:
     - Tendências principais observadas
     - Oportunidades de melhoria
  
  SEJA CONCISO. Retorne APENAS JSON válido.`;
  };

const InsightsSummarizerUtils = {
  formatAnalyticsForPrompt,
  formatFeedbackAnalyticsForPrompt,
  buildUserPrompt,
};

export default InsightsSummarizerUtils;