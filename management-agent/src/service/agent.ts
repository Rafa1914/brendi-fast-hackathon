import { chat as deliveryConsultantChat } from '../ai/agents/DeliveryConsultantAgent';
import { generateInsights as insightsSummarizerGenerateInsights } from '../ai/agents/InsightsSummarizerAgent';
import managementApiClient from '../client/managementApiClient';
import { ChatRequest, ChatResponse, InsightsRequest, InsightsResponse } from '../types/agent';
import { logger } from '../utils/logger';

async function chat(request: ChatRequest): Promise<ChatResponse> {
  const { messages, analytics } = request;
  
  try {
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

    // Usa o DeliveryConsultantAgent (com tools)
    const response = await deliveryConsultantChat(
      prompt,
      contextMessages.length > 0 ? contextMessages : undefined,
      analytics
    );
    
    return {
      message: response,
    };
  } catch (error) {
    logger.error('Erro no chat', error, { context: 'AgentService' });
    throw error;
  }
}

async function generateInsights(request: InsightsRequest): Promise<InsightsResponse> {
  const { filters } = request;
  
  try {
    // Busca analytics e feedbacks diretamente do management-api
    logger.debug('Buscando analytics e feedbacks do management-api', {
      context: 'AgentService',
      metadata: { filters },
    });

    const [analytics, feedbackAnalytics] = await Promise.all([
      managementApiClient.getAnalytics(filters),
      managementApiClient.getFeedbackAnalytics(filters).catch((error) => {
        // Se não conseguir buscar feedbacks, continua sem eles
        logger.warn('Não foi possível buscar feedback analytics', {
          context: 'AgentService',
          metadata: { error: error instanceof Error ? error.message : 'Erro desconhecido' },
        });
        return undefined;
      }),
    ]);

    // Formata o período para o prompt
    const period = analytics.periodInfo
      ? `${analytics.periodInfo.startDate} até ${analytics.periodInfo.endDate}`
      : undefined;

    // Usa o InsightsSummarizerAgent (sem tools, mais rápido)
    const responseText = await insightsSummarizerGenerateInsights(
      analytics,
      feedbackAnalytics,
      period
    );
    
    // Função robusta para extrair e limpar JSON
    const extractAndParseJSON = (text: string): any => {
      // Log do texto original para debug
      logger.debug('Texto retornado pelo modelo', {
        context: 'AgentService',
        metadata: { 
          textLength: text.length,
          textPreview: text.substring(0, 500)
        },
      });
      
      let cleaned = text.trim();
      
      // Remove markdown code blocks
      cleaned = cleaned
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      
      // Tenta encontrar JSON dentro do texto usando regex (procura por { ... })
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }
      
      // Remove trailing commas (comum em JSON gerado por LLMs)
      cleaned = cleaned
        .replace(/,\s*}/g, '}') // Remove trailing commas antes de }
        .replace(/,\s*]/g, ']'); // Remove trailing commas antes de ]
      
      // Primeira tentativa: parse direto
      try {
        return JSON.parse(cleaned);
      } catch (parseError) {
        logger.warn('Primeira tentativa de parse falhou', {
          context: 'AgentService',
          metadata: { 
            error: parseError instanceof Error ? parseError.message : 'Erro desconhecido',
            errorPosition: parseError instanceof SyntaxError && 'position' in parseError 
              ? (parseError as any).position 
              : undefined,
            textLength: cleaned.length,
            textPreview: cleaned.substring(0, 500)
          },
        });
        
        // Segunda tentativa: extrair apenas o objeto JSON principal
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const jsonOnly = cleaned.substring(firstBrace, lastBrace + 1);
          
          // Remove trailing commas novamente
          const jsonCleaned = jsonOnly
            .replace(/,\s*}/g, '}')
            .replace(/,\s*]/g, ']');
          
          try {
            return JSON.parse(jsonCleaned);
          } catch (secondError) {
            logger.error('Segunda tentativa de parse também falhou', {
              context: 'AgentService',
              metadata: { 
                error: secondError instanceof Error ? secondError.message : 'Erro desconhecido',
                errorPosition: secondError instanceof SyntaxError && 'position' in secondError 
                  ? (secondError as any).position 
                  : undefined,
                jsonOnlyPreview: jsonCleaned.substring(0, 1000),
                originalTextPreview: text.substring(0, 1000)
              },
            });
            throw secondError;
          }
        }
        
        // Se não encontrou JSON válido, lança o erro original
        throw parseError;
      }
    };
    
    const parsed = extractAndParseJSON(responseText);
    
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
    logger.error('Erro ao gerar insights', error, {
      context: 'AgentService',
      metadata: { 
        filters,
      },
    });
    
    // Tenta extrair texto da resposta mesmo que não seja JSON válido
    let errorMessage = 'Erro ao gerar insights. Tente novamente.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      summary: `Análise de desempenho do período selecionado. ${errorMessage}`,
      highlights: [],
      recommendations: [],
      sections: [
        {
          title: 'Análise Geral',
          content: 'Não foi possível gerar insights detalhados. Verifique os dados e tente novamente.',
        },
      ],
    };
  }
}

export const AgentService = {
  chat,
  generateInsights,
};

