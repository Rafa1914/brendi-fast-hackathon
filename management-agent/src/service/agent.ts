import agentProvider from '../ai/agentProvider';
import { ChatRequest, ChatResponse, InsightsRequest, InsightsResponse } from '../types/agent';
import { AnalyticsResponse } from '../types/analytics';

const SYSTEM_PROMPT_CHAT = `Você é um assistente especializado em análise de dados de loja. 
Você ajuda a interpretar métricas, identificar tendências e fornecer insights sobre o desempenho da loja.
Seja objetivo, claro e focado em dados. Use os dados fornecidos para fundamentar suas respostas.
Você tem acesso a tools para buscar dados atualizados de analytics quando necessário.`;

const SYSTEM_PROMPT_INSIGHTS = `Você é um analista especializado em e-commerce. 
Analise os dados fornecidos e gere insights acionáveis sobre o desempenho da loja.

IMPORTANTE: Sua resposta DEVE ser um JSON válido no seguinte formato:
{
  "summary": "Resumo executivo de 2-3 frases sobre o desempenho geral",
  "highlights": ["Destaque 1", "Destaque 2", "Destaque 3"],
  "recommendations": ["Recomendação 1", "Recomendação 2", "Recomendação 3"],
  "sections": [
    {
      "title": "Título da Seção 1",
      "content": "Conteúdo detalhado da seção"
    },
    {
      "title": "Título da Seção 2",
      "content": "Conteúdo detalhado da seção"
    }
  ]
}

Foque em:
- Tendências e padrões identificados
- Oportunidades de melhoria
- Pontos fortes e fracos
- Recomendações práticas e acionáveis

Seja objetivo, claro e baseado em dados. Use os tools disponíveis para buscar dados atualizados se necessário.
Retorne APENAS o JSON, sem texto adicional antes ou depois.`;

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
    maxSteps: 15,
  });
  
  return {
    message: response.text,
  };
}

async function generateInsights(request: InsightsRequest): Promise<InsightsResponse> {
  const { analytics, period } = request;
  
  const periodContext = period ? `Período de análise: ${period}\n\n` : '';
  
  const prompt = `${periodContext}Analise os dados fornecidos e gere insights detalhados sobre o desempenho da loja.
Inclua:
1. Um resumo executivo (summary) de 2-3 frases sobre o desempenho geral
2. 3-5 destaques principais (highlights) sobre pontos importantes
3. 3-5 recomendações práticas e acionáveis (recommendations)
4. 2-4 seções detalhadas (sections) com análises específicas sobre:
   - Análise geral do desempenho
   - Principais tendências identificadas
   - Oportunidades de melhoria
   - Análise de produtos e vendas

Seja específico e baseie-se nos dados fornecidos. Use os tools disponíveis se precisar de dados mais detalhados.
Lembre-se: retorne APENAS o JSON válido, sem texto adicional.`;
  
  const response = await agentProvider.generate({
    prompt,
    analytics,
    systemPrompt: SYSTEM_PROMPT_INSIGHTS,
    maxSteps: 20,
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
    console.error('Erro ao fazer parse dos insights:', error);
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

