import { FeedbackService } from "../service/feedback";
import { Request, Response } from "express";
import { FeedbackValidator } from "../validator/feedback";
import { logger } from "../utils/logger";

async function getFeedbackAnalytics(req: Request, res: Response) {
  const parsedQuery = FeedbackValidator.getFeedbackAnalyticsSchema.query.safeParse(req.query);
  if (!parsedQuery.success) {
    logger.warn('Validação falhou ao buscar analytics de feedbacks', {
      context: 'FeedbackController',
      metadata: { error: parsedQuery.error.message },
    });
    return res.status(400).json({ error: parsedQuery.error.message });
  }
  try {
    logger.debug('Buscando analytics de feedbacks', {
      context: 'FeedbackController',
      metadata: { query: parsedQuery.data },
    });
    const analytics = await FeedbackService.getFeedbackAnalytics(parsedQuery.data);
    logger.info('Analytics de feedbacks buscados com sucesso', { context: 'FeedbackController' });
    return res.json(analytics);
  } catch (error) {
    logger.error('Erro ao buscar analytics de feedbacks', error, { context: 'FeedbackController' });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export const FeedbackController = {
  getFeedbackAnalytics,
};

