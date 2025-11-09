import { AgentService } from '../service/agent';
import { Request, Response } from 'express';
import { AgentValidator } from '../validator/agent';
import { logger } from '../utils/logger';

async function chat(req: Request, res: Response) {
  const parsedBody = AgentValidator.chatSchema.body.safeParse(req.body);
  if (!parsedBody.success) {
    logger.warn('Validação falhou no chat', {
      context: 'AgentController',
      metadata: { error: parsedBody.error.message },
    });
    return res.status(400).json({ error: parsedBody.error.message });
  }
  
  try {
    logger.debug('Iniciando chat', {
      context: 'AgentController',
      metadata: { messagesCount: parsedBody.data.messages?.length },
    });
    const response = await AgentService.chat(parsedBody.data);
    logger.info('Chat concluído com sucesso', { context: 'AgentController' });
    return res.json(response);
  } catch (error) {
    logger.error('Erro no chat', error, { context: 'AgentController' });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function generateInsights(req: Request, res: Response) {
  const parsedBody = AgentValidator.insightsSchema.body.safeParse(req.body);
  if (!parsedBody.success) {
    logger.warn('Validação falhou ao gerar insights', {
      context: 'AgentController',
      metadata: { error: parsedBody.error.message },
    });
    return res.status(400).json({ error: parsedBody.error.message });
  }
  
  try {
    // Converte strings de data para Date objects
    const filters = parsedBody.data.filters ? {
      dateRange: parsedBody.data.filters.dateRange ? {
        startDate: parsedBody.data.filters.dateRange.startDate 
          ? new Date(parsedBody.data.filters.dateRange.startDate) 
          : undefined,
        endDate: parsedBody.data.filters.dateRange.endDate 
          ? new Date(parsedBody.data.filters.dateRange.endDate) 
          : undefined,
      } : undefined,
    } : undefined;

    logger.debug('Iniciando geração de insights', {
      context: 'AgentController',
      metadata: { filters },
    });
    
    const response = await AgentService.generateInsights({ filters });
    logger.info('Insights gerados com sucesso', { context: 'AgentController' });
    return res.json(response);
  } catch (error) {
    logger.error('Erro ao gerar insights', error, { context: 'AgentController' });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export const AgentController = {
  chat,
  generateInsights,
};

