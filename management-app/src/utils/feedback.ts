/**
 * Mapper de categorias de feedback
 * Traduz as categorias recebidas do backend para uma linguagem mais acessível ao usuário
 */
export const FEEDBACK_CATEGORY_MAP: Record<string, string> = {
  'delivery-speed': 'Velocidade de Entrega',
  'delivery-experience': 'Experiência de Entrega',
  'overall-experience': 'Experiência Geral',
  'food-quality': 'Qualidade da Comida',
  'whatsapp-service': 'Atendimento via WhatsApp',
  'item-quality': 'Qualidade dos Produtos',
  'item-temperature': 'Temperatura dos Produtos',
}

/**
 * Traduz uma categoria de feedback para uma linguagem mais acessível
 * @param category - Categoria recebida do backend
 * @returns Categoria traduzida ou a categoria original se não houver tradução
 */
export function mapFeedbackCategory(category: string): string {
  return FEEDBACK_CATEGORY_MAP[category] || category
}

