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
    logger.debug('Iniciando geração de insights', {
      context: 'AgentController',
      metadata: { period: parsedBody.data.period },
    });
    const response = await AgentService.generateInsights(parsedBody.data);
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

