import { AgentService } from '../service/agent';
import { Request, Response } from 'express';
import { AgentValidator } from '../validator/agent';

async function chat(req: Request, res: Response) {
  const parsedBody = AgentValidator.chatSchema.body.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({ error: parsedBody.error.message });
  }
  
  try {
    const response = await AgentService.chat(parsedBody.data);
    return res.json(response);
  } catch (error) {
    console.error('Erro no chat:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function generateInsights(req: Request, res: Response) {
  const parsedBody = AgentValidator.insightsSchema.body.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({ error: parsedBody.error.message });
  }
  
  try {
    const response = await AgentService.generateInsights(parsedBody.data);
    return res.json(response);
  } catch (error) {
    console.error('Erro ao gerar insights:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export const AgentController = {
  chat,
  generateInsights,
};

