import agentProvider from '../ai/agentProvider';
import { ChatRequest, ChatResponse, InsightsRequest, InsightsResponse } from '../types/agent';
import { AnalyticsResponse } from '../types/analytics';
import { logger } from '../utils/logger';

const SYSTEM_PROMPT_CHAT = `Você é um assistente especializado em análise de dados de loja. 
Seja CONCISO, objetivo e direto. Respostas curtas e focadas.
Use tools apenas quando necessário. Priorize os dados já fornecidos.`;

const SYSTEM_PROMPT_INSIGHTS = `Você é um analista de e-commerce. Seja CONCISO e direto.

IMPORTANTE: Retorne APENAS JSON válido neste formato:
{
  "summary": "Resumo de 1-2 frases",
  "highlights": ["Destaque 1", "Destaque 2", "Destaque 3"],
  "recommendations": ["Recomendação 1", "Recomendação 2"],
  "sections": [
    {"title": "Título", "content": "Conteúdo conciso (máx 3 parágrafos)"}
  ]
}

REGRAS:
- Máximo 2-3 seções
- Cada seção: máximo 3 parágrafos curtos
- Use tools apenas se realmente necessário
- Priorize dados já fornecidos
- Seja objetivo e baseado em dados`;

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
    maxSteps: 5,
  });
  
  return {
    message: response.text,
  };
}

async function generateInsights(request: InsightsRequest): Promise<InsightsResponse> {
  const { analytics, period } = request;
  
  const periodContext = period ? `Período de análise: ${period}\n\n` : '';
  
  const prompt = `${periodContext}Analise os dados e gere insights CONCISOS.

Inclua:
1. Resumo (summary): 1-2 frases
2. 3 destaques principais (highlights)
3. 2-3 recomendações (recommendations)
4. 2 seções curtas (sections) sobre:
   - Tendências principais
   - Oportunidades de melhoria

SEJA CONCISO. Use tools apenas se necessário. Retorne APENAS JSON válido.`;
  
  const response = await agentProvider.generate({
    prompt,
    analytics,
    systemPrompt: SYSTEM_PROMPT_INSIGHTS,
    maxSteps: 8,
  });
  
  try {
    // Tenta fazer parse do JSON da resposta
    const jsonText = response.text.trim();
    
    // Remove possíveis markdown code blocks se houver
    const cleanedText = jsonText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    
    const parsed = JSON.parse(cleanedText);
    
    // Valida e estrutura a resposta
    return {
      summary: parsed.summary || 'Análise de desempenho do período selecionado.',
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      sections: Array.isArray(parsed.sections) 
        ? parsed.sections.filter((s: any) => s && s.title && s.content)
        : [],
    };
  } catch (error) {
    // Fallback: se não conseguir fazer parse, retorna estrutura básica
    logger.error('Erro ao fazer parse dos insights', error, {
      context: 'AgentService',
      metadata: { responseLength: response.text.length },
    });
    return {
      summary: response.text.substring(0, 200) + '...',
      highlights: [],
      recommendations: [],
      sections: [
        {
          title: 'Análise Geral',
          content: response.text,
        },
      ],
    };
  }
}

export const AgentService = {
  chat,
  generateInsights,
};

